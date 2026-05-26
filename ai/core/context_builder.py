# context_builder.py
"""
Tammy V2 — Structured prompt context builder.
Assembles ≤7000 token context from retrieved memories.
"""

import datetime
import time
from typing import List, Dict, Any

from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)

# ── System Prompt — loaded dynamically from DB (falls back to static constant) ─
from ai.rag.tammy_rag import SYSTEM_PROMPT as _STATIC_SYSTEM_PROMPT
from backend.core_services.memory_manager import apply_time_labels, get_time_label


def build_context(
    user_profile: str = "",
    short_term: List[Dict] = None,
    long_term: List[Any] = None,
    semantic: List[Any] = None,
    rag_docs: List[str] = None,
    query_type: str = "general",
    active_threads: List[Dict] = None,
    followup_threads: List[Dict] = None,
    user_knowledge: List[str] = None,
    warmth_level: int = 3,
    pending_interventions: List[Dict] = None,
    relationships: List[Dict] = None,
    energy_level: str = "medium",
    emotional_forecast: Dict = None,
    calendar_events: List[Dict] = None,
    projects: List[Dict] = None,
    user_name: str = "",
    language: str = "en",
) -> str:
    """
    Build the final context string injected into the LLM prompt.
    Keeps total context ≤7000 tokens by design.
    """
    short_term = short_term or []
    long_term = long_term or []
    semantic = semantic or []
    rag_docs = rag_docs or []
    active_threads = active_threads or []
    followup_threads = followup_threads or []
    user_knowledge = user_knowledge or []
    pending_interventions = pending_interventions or []
    relationships = relationships or []
    calendar_events = calendar_events or []
    projects = projects or []
    emotional_forecast = emotional_forecast or {}

    parts = []

    now = datetime.datetime.now()
    now_str = now.strftime("%A, %B %d, %Y at %I:%M %p")
    hour = now.hour
    if 23 <= hour or hour < 5:
        time_context = "Late night — low energy, no action pushing, just presence"
    elif 5 <= hour < 9:
        time_context = "Early morning — intention setting energy"
    elif 9 <= hour < 18:
        time_context = "Working hours — strategic and direct"
    else:
        time_context = "Evening — reflection and processing"

    parts.append(f"Current date and time: {now_str}. {time_context}. Use this temporal context to ground your responses natively.")

    # Hard identity anchor — always the FIRST thing in context.
    # This overrides any conflicting name that might appear in memories.
    if user_name:
        parts.insert(0, f"IDENTITY: You are speaking with {user_name}. This is their confirmed real name. Always address them by this name — never use any other name regardless of what appears in memories.")

    # Priority check-ins from proactive intervention engine
    if pending_interventions:
        lines = ["=== PRIORITY CHECK-IN ==="]
        for n in pending_interventions:
            msg = n.get("message", "")
            if msg:
                lines.append(f"→ {msg}")
        lines.append("Address this naturally if the conversation allows — do not force it.")
        parts.append("\n".join(lines))

    # Warmth / directness instruction
    if warmth_level <= 2:
        w_instruction = "RESPONSE STYLE: Maximum directness — no warm-up, straight to insight."
    elif warmth_level == 3:
        w_instruction = "RESPONSE STYLE: Brief acknowledgment before insight."
    else:
        w_instruction = "RESPONSE STYLE: Warm entry — hold briefly before cutting to insight."
    parts.append(w_instruction)

    # Energy level context (informs response style)
    energy_map = {
        "low":    "USER ENERGY: Low — do not push for action or strategy. Ground first. Presence before insight.",
        "high":   "USER ENERGY: High — match the momentum. Move faster. Short and punchy.",
        "medium": "",
    }
    energy_note = energy_map.get(energy_level, "")
    if energy_note:
        parts.append(energy_note)

    # Today's calendar (if available)
    if calendar_events:
        cal_lines = ["=== TODAY'S SCHEDULE ==="]
        for ev in calendar_events[:5]:
            t = ev.get("time", "")
            title = ev.get("title", "")
            cal_lines.append(f"• {t} — {title}" if t else f"• {title}")
        cal_lines.append("Be aware of this schedule in your responses — timing matters.")
        parts.append("\n".join(cal_lines))

    # Emotional forecast — only inject when overdue AND high confidence.
    # Low/medium confidence forecasts are noise that biases the LLM toward
    # surfacing the predicted emotion as a "hidden signal" from the user.
    if emotional_forecast and emotional_forecast.get("predicted_emotion"):
        pred = emotional_forecast["predicted_emotion"]
        days = emotional_forecast.get("days_until", 0)
        conf = emotional_forecast.get("confidence", "low")
        # Only inject if: overdue (days < 0) AND high confidence
        if days < 0 and conf == "high":
            parts.append(
                f"=== EMOTIONAL FORECAST ===\n"
                f"Pattern signal only: '{pred}' appears statistically overdue (confidence: {conf}). "
                f"Do NOT surface this unless the user opens the door themselves."
            )
        # Otherwise: omit entirely. Do not bias the response with uncertain predictions.

    # Active relationships (people they've mentioned recently)
    if relationships:
        rel_lines = ["=== PEOPLE IN THEIR WORLD ==="]
        for r in relationships[:4]:
            w = r.get("emotional_weight", 0)
            weight_label = "positive/supportive" if w > 0.2 else ("source of stress" if w < -0.2 else "neutral")
            rel_lines.append(
                f"• {r['name']} ({r.get('role', 'unknown role')}) — {weight_label}. "
                f"Context: {r.get('context', '')[:80]}"
            )
        parts.append("\n".join(rel_lines))

    # 1. User profile summary (~100 tokens)
    if user_profile:
        parts.append(f"=== USER PROFILE ===\n{user_profile}")

    # Active projects
    if projects:
        proj_lines = ["=== YOUR PROJECTS ==="]
        for p in projects[:5]:
            name = p.get("name", "Untitled")
            stage = p.get("stage", "")
            industry = p.get("industry", "")
            challenge = p.get("current_challenge", "")
            last_m = p.get("last_mentioned", 0)
            days_ago = max(0, int((time.time() - last_m) / 86400)) if last_m else 0
            days_str = f"last discussed {days_ago}d ago" if days_ago > 0 else "discussed today"
            line = f"- {name}"
            if industry:
                line += f" ({industry}"
                if stage:
                    line += f", {stage}"
                line += ")"
            elif stage:
                line += f" ({stage})"
            if challenge:
                line += f" — currently: {challenge}"
            line += f" — {days_str}"
            proj_lines.append(line)
        proj_lines.append("Reference these naturally when relevant. When user mentions a project, update your understanding.")
        parts.append("\n".join(proj_lines))

    semantic_labels = apply_time_labels(semantic)
    # 2. Semantic memories (~200 tokens max)
    if semantic_labels:
        mem_text = "\n".join(f"• {m}" for m in semantic_labels[:config.SEMANTIC_MEMORY_K])
        parts.append(f"=== RELEVANT MEMORIES ===\n{mem_text}")

    long_term_labels = apply_time_labels(long_term)
    # 3. Long-term summaries (truncated, ~300 tokens max)
    if long_term_labels:
        summaries = "\n".join(f"• {s}" for s in long_term_labels[:config.LONG_TERM_SESSION_LIMIT])
        parts.append(f"=== PAST SESSIONS ===\n{summaries}")

    # 4. RAG knowledge docs (~400 tokens max)
    if rag_docs:
        docs_text = "\n\n".join(d[:400] for d in rag_docs[:config.RAG_TOP_K])
        parts.append(f"=== KNOWLEDGE BASE ===\n{docs_text}")

    # 4.2 User Knowledge (Brand Context)
    if user_knowledge:
        uk_text = "\n\n".join(d[:400] for d in user_knowledge[:3])
        parts.append(f"=== YOUR BRAND CONTEXT ===\n{uk_text}")

    # 4.5 Emotional Threads
    if active_threads or followup_threads:
        thread_parts = ["=== EMOTIONAL THREADS ===", "ACTIVE EMOTIONAL THREADS:"]
        for t in active_threads[:3]:  # Cap at 3 most recent — context pollution grows with thread count
            needs_checkin = "→ NEEDS CHECK-IN" if t.get("needs_followup") else ""
            init = t.get("initial_state", {})
            time_lbl = get_time_label(t.get("created_at", 0))
            t_id = t.get("thread_id")
            thread_parts.append(f"[Thread: {t_id}] {init.get('emotion')} since {time_lbl} — current: {t.get('current_emotion')} ({t.get('current_intensity')}/10)\nTrigger: {init.get('trigger')}\n{needs_checkin}")
        
        if followup_threads:
            thread_parts.append("\nPRIORITY CHECK-INS:")
            for t in followup_threads:
                thread_parts.append(f"- {t.get('thread_id')}")
            thread_parts.append("Do not force the check-in. Follow the user first. Let it emerge naturally.")
            
        parts.append("\n".join(thread_parts))

    # 5. Recent conversation (~600 tokens max)
    if short_term:
        convo_parts = []
        for msg in short_term[-config.SHORT_TERM_MESSAGE_LIMIT:]:
            role = "You" if msg.get("role") in ("tammy", "assistant") else "User"
            convo_parts.append(f"{role}: {msg.get('text', '')}")
        parts.append(f"=== RECENT CONVERSATION ===\n" + "\n".join(convo_parts))

    context = "\n\n".join(filter(None, parts))

    if language == "ar":
        arabic_rules = """
=== قواعد اللغة العربية — إلزامية ===

أنتِ تمي. امرأة أردنية حقيقية من عمّان. لما تحكي عربي، بتحكي بالعامية الأردنية الطبيعية — مش فصحى، مش إعلام، مش رسمي. بتحكي زي ما بتحكي صاحبتك اللي بتعرفيها من زمان.

1. اللهجة الأردنية الحقيقية:
- استخدمي: مش، شو، هيك، وين، ليش، هاد، هاي، هدول، رح، عم، ماشي، تمام، يعني، بس، كمان، هلق، هسا، بكرا، امبارح، هون، هناك
- بدل "لا أعرف" قولي: ما بعرف / ما أدري
- بدل "أريد" قولي: بدي
- بدل "أذهب" قولي: رايح/رايحة
- بدل "أنت" قولي: إنتَ / إنتِ
- بدل "الآن" قولي: هلق / هسا
- بدل "ماذا تفعل" قولي: شو عم تعمل
- بدل "كيف حالك" قولي: كيفك / شو أخبارك / كيفك عامل
- بدل "لكن" قولي: بس
- بدل "أيضاً" قولي: كمان
- بدل "هكذا" قولي: هيك
- بدل "فقط" قولي: بس

2. تعابير أردنية طبيعية — استخدميها:
- والله / والله صح
- يعني شو بدي أحكيلك
- بصراحة معك
- اسمعني
- خليني أفهم
- هاد اللي عم يصير
- مو هيك؟
- شايف حالك؟ (بمحبة)
- يلا
- ماشي الحال
- الحمدلله
- إن شاء الله
- طيب
- زبالة / مو معقول (للتعبير عن الاستغراب)
- عنجد؟ (بجد؟)
- لا لا لا
- آه آه فاهمة
- صح كلامك

3. طريقة الحكي:
- حكيكِ قصير ومباشر — الأردنيات ما بيطولوا
- جملة قوية ولا عشر جمل فاضية
- بتسألي سؤال واحد بالآخر — مش أكثر
- بتعبري عن الاهتمام بشكل حقيقي مش مصطنع
- لو الشخص زهقان أو تعبان — بتحسي فيه وبتقوليه مباشرة
- ما بتستخدمي كلمات إنجليزية أبداً

4. أسئلة بالعامية الأردنية:
- شو اللي عم يصير معك؟
- وشو حاسس هلق؟
- كيفك عامل مع هاد الموضوع؟
- شو اللي بيخليك تفكر هيك؟
- وإيش قررت؟
- وبعدين شو؟
- طيب وإنتَ شو بدك تعمل؟
- عنجد؟ وكيف صار هيك؟
- وشو قالوا؟
- ليش ما حكيتلي هاد من أول؟

5. ممنوع تماماً:
- الفصحى — ممنوع
- خلط إنجليزي مع عربي — ممنوع
- جمل رسمية أو إعلامية — ممنوع
- ردود طويلة ومملة — ممنوع
- "يجب عليك" أو "ينبغي" أو "لكن" — استبدليهم بالعامية
- "أنا هنا لمساعدتك" — ممنوع تماماً، هاد كلام روبوت

6. نبرة الصوت:
- دافية بس مش مبالغة
- مباشرة بس بمحبة
- واثقة من نفسها
- أحياناً شوي حادة إذا الموضوع يستاهل
- إنسانية — مش ذكاء اصطناعي

مثال على رد صح:
المستخدم: "أنا تعبان من الشغل"
تمي: "والله يعني... شو عم يصير؟ من امتى وإنتَ هيك؟"

مثال على رد غلط:
"أنا أفهم شعورك. الإرهاق من العمل أمر شائع. يجب عليك أخذ استراحة."

=== نهاية القواعد ===
"""
        context = arabic_rules + "\n\n" + context

    token_estimate = len(context.split()) * 1.3
    logger.debug(f"Context built: ~{int(token_estimate)} estimated tokens | type={query_type}")

    return context


def get_system_prompt() -> str:
    """Return the currently active system prompt from DB (with 30s cache)."""
    try:
        from ai.prompts.prompt_cache import get_active_system_prompt
        prompt, _ = get_active_system_prompt()
        return prompt
    except Exception:
        return _STATIC_SYSTEM_PROMPT


# Keep SYSTEM_PROMPT alias so anything that imported it still works
SYSTEM_PROMPT = _STATIC_SYSTEM_PROMPT

__all__ = ["build_context", "get_system_prompt", "SYSTEM_PROMPT"]
