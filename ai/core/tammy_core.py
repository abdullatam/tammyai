# tammy_core.py
"""
Tammy V2 — Main orchestration pipeline.

  classify → route → retrieve (parallel) → build context → stream LLM → save session
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Generator, List, Optional, Dict

from backend.auth.identity import get_user_id
from backend.core_services.memory_router import classify_query, get_memory_sources
from backend.core_services.memory_manager import (
    get_short_term, save_message, save_session_summary,
    get_user_profile, get_long_term,
    get_semantic, get_rag,
    get_cached_response, cache_response,
    get_warmth_level, get_pending_interventions,
    get_energy_level,
)
from ai.core.context_builder import build_context, get_system_prompt
from ai.core.llm_client import stream_response
from backend.config import config
from backend.logger import get_logger
import threading
from backend.auth.identity import get_session_id
from backend.intelligence.emotional_thread_manager import (
    get_active_threads,
    get_threads_needing_followup,
    detect_thread_reference,
    update_thread,
    detect_new_significant_emotion,
    create_thread,
    analyze_message_emotion
)
from backend.db.pinecone_manager import pinecone_manager

logger = get_logger(__name__)


def _fetch_memories(sources: List[str], user_id: str, question: str, voice_mode: bool = False) -> dict:
    """Fetch only the needed memory sources in parallel."""
    results = {
        "short_term": [],
        "long_term": [],
        "semantic": [],
        "rag_docs": [],
        "user_profile": "",
        "active_threads": [],
        "followup_threads": [],
        "user_knowledge": [],
        "warmth_level": 3,
        "pending_interventions": [],
        "relationships": [],
        "energy_level": "medium",
        "emotional_forecast": {},
        "calendar_events": [],
    }

    fetch_map = {
        "redis":          lambda: ("short_term",  get_short_term(user_id)),
        "mongo":          lambda: ("long_term",   get_long_term(user_id)),
        "pinecone_memory":lambda: ("semantic",    get_semantic(user_id, question)),
        "pinecone_rag":   lambda: ("rag_docs",    get_rag(question)),
    }

    # Base fetches driven by router classification
    tasks = {key: fn for key, fn in fetch_map.items() if key in sources}

    # Additionally fetch long_term if 'mongo' is enabled
    if "mongo" in sources:
        tasks["mongo"] = lambda: ("long_term", get_long_term(user_id))

    tasks["user_profile"] = lambda: ("user_profile", get_user_profile(user_id))
    tasks["active_threads"] = lambda: ("active_threads", get_active_threads(user_id))
    tasks["followup_threads"] = lambda: ("followup_threads", get_threads_needing_followup(user_id))
    tasks["user_knowledge"] = lambda: ("user_knowledge", pinecone_manager.query_user_knowledge(user_id, question))
    tasks["warmth_level"] = lambda: ("warmth_level", get_warmth_level(user_id))
    tasks["pending_interventions"] = lambda: ("pending_interventions", get_pending_interventions(user_id))
    tasks["energy_level"] = lambda: ("energy_level", get_energy_level(user_id))

    def _fetch_relationships(uid):
        try:
            from backend.intelligence.relationship_manager import get_top_relationships
            return ("relationships", get_top_relationships(uid))
        except Exception:
            return ("relationships", [])
    tasks["relationships"] = lambda: _fetch_relationships(user_id)

    def _fetch_forecast(uid):
        try:
            from backend.intelligence.emotional_thread_manager import predict_next_emotional_state
            return ("emotional_forecast", predict_next_emotional_state(uid))
        except Exception:
            return ("emotional_forecast", {})
    tasks["emotional_forecast"] = lambda: _fetch_forecast(user_id)

    def _fetch_calendar(uid):
        try:
            from backend.core_services.calendar_manager import get_today_events
            return ("calendar_events", get_today_events(uid))
        except Exception:
            return ("calendar_events", [])
    tasks["calendar_events"] = lambda: _fetch_calendar(user_id)

    if tasks:
        workers = 12 if voice_mode else 4
        logger.info(f"⚡ Memory fetch using max_workers={workers} (voice_mode={voice_mode})")
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(fn): key for key, fn in tasks.items()}
            for future in as_completed(futures):
                try:
                    field, value = future.result()
                    results[field] = value
                except Exception as e:
                    logger.error(f"Memory fetch error: {e}")

    return results

def _process_emotional_threads(user_id, user_message, tammy_response, session_id, active_threads):
    try:
        referenced = detect_thread_reference(user_message, active_threads)
        analysis = analyze_message_emotion(user_message)
        
        for thread_id in referenced:
            update_type = "resolution" if analysis.get("is_resolution") else "evolution"
            update_thread(
                thread_id=thread_id, 
                user_id=user_id, 
                new_emotion=analysis.get("emotion", "neutral"), 
                intensity=analysis.get("intensity", 0), 
                context=analysis.get("context", ""), 
                update_type=update_type
            )
            
        if not referenced and detect_new_significant_emotion(user_message, analysis.get("emotion", ""), analysis.get("intensity", 0)):
            create_thread(
                user_id=user_id, 
                emotion=analysis.get("emotion", ""), 
                intensity=analysis.get("intensity", 0), 
                trigger=analysis.get("trigger", ""), 
                context=analysis.get("context", ""), 
                session_id=session_id
            )
        # Sweep stale active threads to dormant on every pipeline run.
        # Prevents false-positive threads from persisting in context indefinitely.
        try:
            from backend.intelligence.emotional_thread_manager import mark_dormant_threads
            mark_dormant_threads(user_id)
        except Exception as sweep_err:
            logger.error(f"Dormant thread sweep failed: {sweep_err}")
    except Exception as e:
        logger.error(f"Emotional thread processing failed: {e}")

def ask_tammy(
    question: str,
    user_id: Optional[str] = None,
    history: Optional[List] = None,
    override_prompt: Optional[str] = None,
    attachments: Optional[List[Dict]] = None,
    web_search: bool = False,
    raw_attachments: Optional[List[Dict]] = None,
    connection_context: Optional[str] = None,
    voice_mode: bool = False,
    language: str = "en",
) -> Generator[str, None, None]:
    """
    Main V2 pipeline — yields streaming response tokens.

    Args:
        question: User's input message
        user_id:  Always resolves to the fixed identity (123)
        history:  Chat history [[user, bot], ...]

    Yields:
        str: Response token chunks
    """
    start     = time.time()
    # Use the user_id passed directly from the request (from JWT cookie).
    # Do NOT fall back to get_user_id() — that's a process-wide global which
    # causes cross-user contamination when two users chat concurrently.
    if not user_id:
        user_id = get_user_id()  # CLI mode only
    history   = history or []

    logger.info(f"[V2] user={user_id} | q={question[:60]}...")
    
    try:
        session_id = get_session_id()
    except Exception:
        session_id = None
        
    # Network need detection for Tammy Connect (background - immediate)
    def _detect_network_need_bg():
        try:
            from ai.core.tammy_connect import detect_and_match_network_need
            detect_and_match_network_need(user_id, question, session_id)
        except Exception as e:
            logger.error(f"Network matching background error: {e}")
    threading.Thread(target=_detect_network_need_bg, daemon=True).start()

    # Calendar speed detection (background - immediate)
    def _detect_calendar_bg():
        try:
            from backend.core_services.calendar_manager import detect_calendar_intent, parse_event_from_message, add_event
            if detect_calendar_intent(question):
                event_data = parse_event_from_message(question, user_id)
                if event_data:
                    add_event(
                        user_id=user_id,
                        title=event_data.get("title", "Meeting"),
                        date_str=event_data.get("date", "today"),
                        time_str=event_data.get("time", "09:00"),
                        duration_minutes=event_data.get("duration_minutes", 60),
                        attendees=event_data.get("attendees", ""),
                        notes=event_data.get("notes", ""),
                        session_id=session_id
                    )
        except Exception as e:
            logger.error(f"Calendar background error: {e}")
    threading.Thread(target=_detect_calendar_bg, daemon=True).start()

    # Decision detection (background - immediate)
    def _detect_decisions_bg():
        try:
            from backend.intelligence.decision_detector import detect_and_log_decision
            detect_and_log_decision(user_id, question)
        except Exception as e:
            logger.error(f"Decision background error: {e}")
    threading.Thread(target=_detect_decisions_bg, daemon=True).start()

    # Prediction detection (background - immediate)
    def _detect_predictions_bg():
        try:
            from backend.intelligence.prediction_detector import detect_and_log_prediction
            detect_and_log_prediction(user_id, question)
        except Exception as e:
            logger.error(f"Prediction background error: {e}")
    threading.Thread(target=_detect_predictions_bg, daemon=True).start()

    # 0. Cache check
    cached = get_cached_response(question)
    if cached:
        logger.info(f"⚡ Cache hit ({time.time()-start:.2f}s)")
        yield cached
        return

    # FAST PATH FOR VOICE MODE
    is_simple = False
    if voice_mode:
        import re
        # Count only alphanumeric words
        words = [w for w in re.split(r'\W+', question) if w]
        if len(words) < 12:
            complex_keywords = ["project", "decision", "emotion", "feeling", "feel", "startup", "leaflex", "name", "sad", "happy", "angry", "upset", "cry"]
            if not any(k in question.lower() for k in complex_keywords):
                is_simple = True
                
    if is_simple:
        logger.info(f"⚡ FAST PATH: Simple conversational message detected")
        system_prompt = "Your name is Tammy. You are a warm, supportive, and natural conversational partner. Keep your answers brief and conversational."
        if language == 'ar':
            system_prompt = "CRITICAL DIRECTIVE: YOU MUST RESPOND ENTIRELY IN ARABIC. DO NOT USE ENGLISH.\n\n" + system_prompt
            llm_question = f"[USER IS SPEAKING ARABIC - REPLY IN ARABIC] {question}"
        else:
            llm_question = question
        history_slice = history[-2:] if history else []
        
        full_response = []
        t1 = time.time()
        for token in stream_response(system_prompt, "", llm_question, history_slice, model_override="claude-haiku-4-5-20251001"):
            full_response.append(token)
            yield token
            
        response_text = "".join(full_response)
        logger.info(f"⏱️ LLM (FAST PATH): {time.time()-t1:.2f}s | Total: {time.time()-start:.2f}s")
        
        # Persist simple message
        save_message(user_id, "tammy", response_text)
        try:
            user_msg = {"role": "user",  "text": question, "source": "voice"}
            tammy_msg = {"role": "tammy", "text": response_text, "source": "voice"}
            if raw_attachments:
                user_msg["attachments"] = raw_attachments
            save_session_summary(user_id, [user_msg, tammy_msg])
        except Exception as e:
            logger.error(f"Session save failed: {e}")
        return

    # 1. Classify + route
    query_type = classify_query(question)
    sources    = get_memory_sources(query_type)
    logger.info(f"[V2] type={query_type} | sources={sources}")

    # 2. Save user message
    save_message(user_id, "user", question, attachments=raw_attachments)

    # 3. Parallel memory fetch
    t0 = time.time()
    memories = _fetch_memories(sources, user_id, question, voice_mode)
    logger.info(f"⏱️ Memory fetch: {time.time()-t0:.2f}s")

    # 3b. Fetch user projects for context injection (non-blocking)
    user_projects = []
    user_real_name = ""
    try:
        from backend.db.mongodb_client import _mongodb_client
        from bson import ObjectId
        _pdb = _mongodb_client._db
        if _pdb is not None:
            user_projects = list(_pdb["projects"].find(
                {"user_id": user_id},
                sort=[("last_mentioned", -1)]
            ).limit(5))
            # Fetch the user's real name from the users collection
            try:
                _u = _pdb["users"].find_one({"_id": ObjectId(user_id)}, {"name": 1})
                if _u and _u.get("name"):
                    user_real_name = _u["name"]
            except Exception:
                pass
    except Exception:
        pass

    # 4. Build context
    context = build_context(
        user_profile=memories["user_profile"],
        short_term=memories["short_term"],
        long_term=memories["long_term"],
        semantic=memories["semantic"],
        rag_docs=memories["rag_docs"],
        query_type=query_type,
        active_threads=memories["active_threads"],
        followup_threads=memories["followup_threads"],
        user_knowledge=memories["user_knowledge"],
        warmth_level=memories["warmth_level"],
        pending_interventions=memories["pending_interventions"],
        relationships=memories["relationships"],
        energy_level=memories["energy_level"],
        emotional_forecast=memories["emotional_forecast"],
        calendar_events=memories["calendar_events"],
        projects=user_projects,
        user_name=user_real_name,
        language=language,
    )

    # 5. Stream LLM
    system_prompt  = override_prompt if override_prompt else get_system_prompt()
    if language == 'ar':
        system_prompt = "CRITICAL DIRECTIVE: YOU MUST RESPOND ENTIRELY IN ARABIC. DO NOT USE ENGLISH. ALL YOUR OUTPUT MUST BE IN ARABIC.\n\n" + system_prompt
        llm_question = f"[USER IS SPEAKING ARABIC - REPLY IN ARABIC] {question}"
    else:
        llm_question = question
        
    full_response  = []
    t1 = time.time()
    override_model = "claude-haiku-4-5-20251001" if voice_mode else None

    # Inject connection context for shared threads
    if connection_context:
        context = connection_context + "\n\n" + (context if context else "")

    # Inject document text into context
    if attachments:
        doc_texts = []
        for att in attachments:
            if att.get("type") == "text" and att.get("extracted_text"):
                doc_texts.append(
                    f"[Attached file: {att['filename']}]\n{att['extracted_text']}"
                )
        if doc_texts:
            context = "\n\n".join(doc_texts) + ("\n\n" + context if context else "")
            
    # Perform and inject web search if requested
    if web_search:
        try:
            import requests as _req
            import re as _re
            logger.info(f"🌐 Performing web search for: {question}")

            # Use DuckDuckGo instant answer API + lite HTML for snippets
            search_results = []

            # Method 1: DuckDuckGo instant answer API
            api_resp = _req.get(
                "https://api.duckduckgo.com/",
                params={"q": question, "format": "json", "no_html": "1", "skip_disambig": "1"},
                timeout=5,
                headers={"User-Agent": "Tammy/1.0"}
            )
            if api_resp.ok:
                data = api_resp.json()
                # Abstract (main answer)
                if data.get("AbstractText"):
                    search_results.append({
                        "title": data.get("Heading", "Answer"),
                        "url": data.get("AbstractURL", ""),
                        "snippet": data["AbstractText"]
                    })
                # Related topics
                for topic in (data.get("RelatedTopics") or [])[:5]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        search_results.append({
                            "title": topic.get("Text", "").split(" - ")[0],
                            "url": topic.get("FirstURL", ""),
                            "snippet": topic.get("Text")
                        })
            
            # Method 2: DuckDuckGo HTML fallback for regular search
            if not search_results:
                html_resp = _req.get(
                    "https://html.duckduckgo.com/html/",
                    data={"q": question},
                    timeout=5,
                    headers={"User-Agent": "Tammy/1.0"}
                )
                if html_resp.ok:
                            if uddg:
                                from urllib.parse import unquote
                                real_url = unquote(uddg.group(1))
                            search_results.append({
                                "title": clean_title,
                                "url": real_url,
                                "snippet": clean_snippet
                            })

            if search_results:
                search_str = f"[LIVE WEB SEARCH RESULTS for '{question}']\n"
                seen = set()
                count = 0
                for r in search_results:
                    key = r["snippet"][:60]
                    if key in seen:
                        continue
                    seen.add(key)
                    count += 1
                    search_str += f"{count}. {r['title']} ({r['url']})\n{r['snippet']}\n\n"
                    if count >= 5:
                        break
                search_str += "Use these search results to inform your response. Cite sources when relevant.\n"
                context = search_str + ("\n\n" + context if context else "")
                logger.info(f"🌐 Injected {count} web search results into context")
            else:
                logger.warning("🌐 Web search returned no results")
        except Exception as e:
            logger.error(f"Web search failed: {e}")

    if voice_mode and history:
        history = history[-4:]
        logger.info(f"⚡ Voice mode: history sliced to last {len(history)} messages")

    for token in stream_response(system_prompt, context, llm_question, history, attachments=attachments, model_override=override_model):
        full_response.append(token)
        yield token

    response_text = "".join(full_response)
    
    import re
    response_text = re.sub(r'\[CONNECT_SEARCH:\s*.*?\]', '', response_text).strip()
    
    logger.info(f"⏱️ LLM: {time.time()-t1:.2f}s | Total: {time.time()-start:.2f}s")

    # 6. Persist
    if not override_prompt:
        save_message(user_id, "tammy", response_text)
        cache_response(question, response_text)
    
        try:
            user_msg = {"role": "user",  "text": question}
            if voice_mode:
                user_msg["source"] = "voice"
            if raw_attachments:
                user_msg["attachments"] = raw_attachments
                
            tammy_msg = {"role": "tammy", "text": response_text}
            if voice_mode:
                tammy_msg["source"] = "voice"
                
            save_session_summary(user_id, [
                user_msg,
                tammy_msg,
            ])
        except Exception as e:
            logger.error(f"Session save failed: {e}")
        
    try:
        session_id = get_session_id()
    except Exception:
        session_id = None
        
    threading.Thread(
        target=_process_emotional_threads,
        args=(user_id, question, response_text, session_id, memories["active_threads"])
    ).start()

    # Advice extraction (background — best effort)
    def _extract_advice_bg():
        try:
            from backend.intelligence.advice_tracker import extract_and_store_advice
            extract_and_store_advice(user_id, question, response_text)
        except Exception as e:
            logger.error(f"Advice extraction background error: {e}")
    threading.Thread(target=_extract_advice_bg, daemon=True).start()

    # Network need detection moved to top of ask_tammy

    # Project detection & tracking (background — best effort)
    def _detect_projects_bg():
        try:
            from backend.intelligence.project_tracker import detect_and_update_projects
            detect_and_update_projects(user_id, question, response_text, session_id)
        except Exception as e:
            logger.error(f"Project detection background error: {e}")
    threading.Thread(target=_detect_projects_bg, daemon=True).start()

    # Feature-unlock notifications (background — best effort)
    def _check_unlock_notifications():
        try:
            from backend.db.mongodb_client import _mongodb_client
            from backend.core_services.notification_manager import create_notification
            db = _mongodb_client._db
            if db is None:
                return
            from bson import ObjectId
            # Count total sessions for this user
            total = db["sessions"].count_documents({"user_id": user_id})
            # At exactly 10 sessions → Founder DNA
            if total == 10:
                create_notification(user_id, {
                    "type": "founder_dna_ready",
                    "title": "Founder DNA unlocked",
                    "body": "Tammy has enough to map your patterns. It's ready.",
                    "action_url": "/dna",
                    "action_label": "Read your DNA",
                    "priority": "high",
                })
            # Check days of usage for Arc unlock
            first_session = db["sessions"].find_one(
                {"user_id": user_id}, sort=[("timestamp", 1)]
            )
            if first_session:
                import datetime
                first_ts = first_session.get("timestamp")
                if first_ts:
                    if isinstance(first_ts, datetime.datetime):
                        first_ts = first_ts.timestamp()
                    days_active = int((time.time() - first_ts) / 86400)
                    if days_active == 14:
                        create_notification(user_id, {
                            "type": "arc_ready",
                            "title": "The Arc is ready",
                            "body": "Two weeks of data. Your emotional arc just rendered.",
                            "action_url": "/arc",
                            "action_label": "See your arc",
                            "priority": "high",
                        })
        except Exception as e:
            logger.error(f"Unlock notification error: {e}")
    threading.Thread(target=_check_unlock_notifications, daemon=True).start()


__all__ = ["ask_tammy"]
