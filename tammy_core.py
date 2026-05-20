# tammy_core.py
"""
Tammy V2 — Main orchestration pipeline.

  classify → route → retrieve (parallel) → build context → stream LLM → save session
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Generator, List, Optional

from identity import get_user_id
from memory_router import classify_query, get_memory_sources
from memory_manager import (
    get_short_term, save_message, save_session_summary,
    get_user_profile, get_long_term,
    get_semantic, get_rag,
    get_cached_response, cache_response,
    get_warmth_level, get_pending_interventions,
    get_energy_level,
)
from context_builder import build_context, get_system_prompt
from llm_client import stream_response
from config import config
from logger import get_logger
import threading
from identity import get_session_id
from emotional_thread_manager import (
    get_active_threads,
    get_threads_needing_followup,
    detect_thread_reference,
    update_thread,
    detect_new_significant_emotion,
    create_thread,
    analyze_message_emotion
)
from pinecone_manager import pinecone_manager

logger = get_logger(__name__)


def _fetch_memories(sources: List[str], user_id: str, question: str) -> dict:
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
            from relationship_manager import get_top_relationships
            return ("relationships", get_top_relationships(uid))
        except Exception:
            return ("relationships", [])
    tasks["relationships"] = lambda: _fetch_relationships(user_id)

    def _fetch_forecast(uid):
        try:
            from emotional_thread_manager import predict_next_emotional_state
            return ("emotional_forecast", predict_next_emotional_state(uid))
        except Exception:
            return ("emotional_forecast", {})
    tasks["emotional_forecast"] = lambda: _fetch_forecast(user_id)

    def _fetch_calendar(uid):
        try:
            from calendar_manager import get_today_events
            return ("calendar_events", get_today_events(uid))
        except Exception:
            return ("calendar_events", [])
    tasks["calendar_events"] = lambda: _fetch_calendar(user_id)

    if tasks:
        with ThreadPoolExecutor(max_workers=4) as executor:
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
            from emotional_thread_manager import mark_dormant_threads
            mark_dormant_threads(user_id)
        except Exception as sweep_err:
            logger.error(f"Dormant thread sweep failed: {sweep_err}")
    except Exception as e:
        logger.error(f"Emotional thread processing failed: {e}")

def ask_tammy(
    question: str,
    user_id: Optional[str] = None,
    history: Optional[List] = None,
    override_prompt: Optional[str] = None
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
    user_id   = get_user_id()   # Always fixed — never use caller's value
    history   = history or []

    logger.info(f"[V2] user={user_id} | q={question[:60]}...")

    # 0. Cache check
    cached = get_cached_response(question)
    if cached:
        logger.info(f"⚡ Cache hit ({time.time()-start:.2f}s)")
        yield cached
        return

    # 1. Classify + route
    query_type = classify_query(question)
    sources    = get_memory_sources(query_type)
    logger.info(f"[V2] type={query_type} | sources={sources}")

    # 2. Save user message
    save_message(user_id, "user", question)

    # 3. Parallel memory fetch
    t0 = time.time()
    memories = _fetch_memories(sources, user_id, question)
    logger.info(f"⏱️ Memory fetch: {time.time()-t0:.2f}s")

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
    )

    # 5. Stream LLM
    system_prompt  = override_prompt if override_prompt else get_system_prompt()
    full_response  = []
    t1 = time.time()

    for token in stream_response(system_prompt, context, question, history):
        full_response.append(token)
        yield token

    response_text = "".join(full_response)
    logger.info(f"⏱️ LLM: {time.time()-t1:.2f}s | Total: {time.time()-start:.2f}s")

    # 6. Persist
    if not override_prompt:
        save_message(user_id, "tammy", response_text)
        cache_response(question, response_text)
    
        try:
            save_session_summary(user_id, [
                {"role": "user",  "text": question},
                {"role": "tammy", "text": response_text},
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
            from advice_tracker import extract_and_store_advice
            extract_and_store_advice(user_id, question, response_text)
        except Exception as e:
            logger.error(f"Advice extraction background error: {e}")
    threading.Thread(target=_extract_advice_bg, daemon=True).start()

    # Skill-need detection for Tammy Network (background)
    def _detect_skill_need_bg():
        try:
            from skill_matcher import detect_and_match_skill_need
            detect_and_match_skill_need(user_id, question)
        except Exception as e:
            logger.error(f"Skill matching background error: {e}")


__all__ = ["ask_tammy"]
