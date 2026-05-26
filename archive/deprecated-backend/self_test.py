# self_test.py
"""
Tammy — Automated self-test suite.
Sends predefined messages through the full pipeline and checks quality criteria.

Test cases:
  1. English standard    — functional work message
  2. Arabic standard     — same message in Arabic
  3. English emotional   — personal struggle, medium valence
  4. 3AM crisis state    — high-arousal-negative, must NOT push for action
  5. Arabic→English      — language switch mid-conversation
  6. Warmth contrast     — structural: level 1 vs level 5 context injection
"""

import re
import time
from typing import List, Dict, Any, Optional

from logger import get_logger

logger = get_logger(__name__)

# ── Test messages ──────────────────────────────────────────────────────────────

TEST_CASES = [
    {
        "id":       "en_standard",
        "label":    "English standard",
        "messages": [
            {"role": "user", "text": "I keep starting things and not finishing them. I don't know if it's a focus issue or I just don't care enough about any of them."},
        ],
        "expect_lang": "en",
    },
    {
        "id":       "ar_standard",
        "label":    "Arabic standard",
        "messages": [
            {"role": "user", "text": "مرحبا، أنا معلق على قرار مهم ولا أعرف كيف أتقدم."},
        ],
        "expect_lang": "ar",
    },
    {
        "id":       "en_emotional",
        "label":    "English emotional",
        "messages": [
            {"role": "user", "text": "Talked to my co-founder today. I think we want different things. It's been building for months and I didn't name it."},
        ],
        "expect_lang": "en",
    },
    {
        "id":       "crisis_3am",
        "label":    "3AM crisis state",
        "messages": [
            {"role": "user", "text": "i can't sleep. everything feels like it's collapsing. i don't know why i even started this."},
        ],
        "expect_lang": "en",
        "crisis":    True,
    },
    {
        "id":       "lang_switch",
        "label":    "Arabic → English switch",
        "messages": [
            {"role": "user",  "text": "أنا تعبت من التفكير في هذا القرار."},
            {"role": "tammy", "text": "(previous tammy response — placeholder)"},
            {"role": "user",  "text": "sorry i switched to english. basically i'm afraid to commit."},
        ],
        "expect_lang": "en",
    },
]

# ── Banned phrases / openers ───────────────────────────────────────────────────

_BANNED_PHRASES = [
    r"\bof course\b",
    r"\babsolutely\b",
    r"\bcertainly\b",
    r"\bgreat question\b",
    r"\bas an ai\b",
    r"\bi am a language model\b",
    r"that sounds really tough",
    r"that sounds really heavy",
    r"that sounds really hard",
    r"it's okay to feel",
    r"give yourself permission",
    r"that's a powerful realization",
    r"let me know if you need anything",
    r"what small step can you",
    r"small step",
]

_BANNED_OPENERS = [
    r"^of course",
    r"^absolutely",
    r"^certainly",
    r"^great[,!]",
]

_CRISIS_ACTION_PHRASES = [
    r"small step",
    r"what can you do",
    r"try to",
    r"\baction\b",
    r"take a step",
    r"let's make a plan",
    r"here's what you can",
    r"you could try",
    r"start by",
]

_MARKDOWN_PATTERNS = [
    r"^#{1,6}\s",
    r"^\*\*",
    r"^\* ",
    r"^\- ",
    r"^\d+\.\s",
]

_ARABIC_RE = re.compile(r"[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]")


# ── Criteria checkers ──────────────────────────────────────────────────────────

def _check_no_banned_phrases(response: str) -> Dict:
    response_lower = response.lower()
    hits = [p for p in _BANNED_PHRASES if re.search(p, response_lower)]
    return {
        "name":   "no_banned_phrases",
        "pass":   len(hits) == 0,
        "detail": f"found: {hits}" if hits else "clean",
    }


def _check_no_markdown(response: str) -> Dict:
    hits = []
    for line in response.splitlines():
        for pat in _MARKDOWN_PATTERNS:
            if re.match(pat, line.strip()):
                hits.append(line.strip()[:60])
                break
    return {
        "name":   "no_markdown",
        "pass":   len(hits) == 0,
        "detail": f"markdown lines: {hits[:3]}" if hits else "clean",
    }


def _check_one_question(response: str) -> Dict:
    count = response.count("?")
    ok = count <= 1
    return {
        "name":   "one_question_only",
        "pass":   ok,
        "detail": f"{count} question mark(s) — must be 0 or 1",
    }


def _check_length(response: str, max_sentences: int = 8) -> Dict:
    sentences = [s.strip() for s in re.split(r"[.!?]\s+", response) if s.strip()]
    count = len(sentences)
    return {
        "name":   "length_ceiling",
        "pass":   count <= max_sentences,
        "detail": f"{count} sentences (max {max_sentences})",
    }


def _check_language_arabic(response: str) -> Dict:
    has_arabic = bool(_ARABIC_RE.search(response))
    return {
        "name":   "language_following_arabic",
        "pass":   has_arabic,
        "detail": "Arabic characters present" if has_arabic else "NO Arabic characters — expected Arabic response",
    }


def _check_language_english(response: str) -> Dict:
    has_arabic = bool(_ARABIC_RE.search(response))
    return {
        "name":   "language_following_english",
        "pass":   not has_arabic,
        "detail": "no Arabic — correct" if not has_arabic else "MIXED Arabic in English-expected response",
    }


def _check_no_action_push(response: str) -> Dict:
    response_lower = response.lower()
    hits = [p for p in _CRISIS_ACTION_PHRASES if re.search(p, response_lower)]
    return {
        "name":   "no_action_push_in_crisis",
        "pass":   len(hits) == 0,
        "detail": f"action-push phrases found: {hits}" if hits else "clean — no action push",
    }


def _check_no_banned_opener(response: str) -> Dict:
    response_lower = response.strip().lower()
    hits = [p for p in _BANNED_OPENERS if re.match(p, response_lower)]
    return {
        "name":   "no_banned_opener",
        "pass":   len(hits) == 0,
        "detail": f"bad opener: {hits[0]}" if hits else "clean",
    }


# ── Warmth contrast structural test ───────────────────────────────────────────

def _test_warmth_contrast() -> Dict:
    """
    Structural test: verify build_context injects the correct instruction
    for warmth_level=1 (directness) and warmth_level=5 (warmth).
    No LLM call — tests the context builder only.
    """
    try:
        from context_builder import build_context
        ctx1 = build_context(warmth_level=1)
        ctx5 = build_context(warmth_level=5)
        has_direct = "Maximum directness" in ctx1
        has_warm   = "Warm entry" in ctx5
        ok = has_direct and has_warm
        return {
            "name":   "warmth_level_contrast",
            "pass":   ok,
            "detail": f"level1 directness instruction present: {has_direct} | level5 warmth instruction present: {has_warm}",
        }
    except Exception as e:
        return {"name": "warmth_level_contrast", "pass": False, "detail": str(e)}


# ── Core runner ────────────────────────────────────────────────────────────────

def _run_one(test: Dict, system_prompt: Optional[str] = None) -> Dict:
    from tammy_core import ask_tammy

    messages    = test["messages"]
    expect_lang = test.get("expect_lang", "en")
    is_crisis   = test.get("crisis", False)

    history = []
    for i in range(0, len(messages) - 1, 2):
        u = messages[i]["text"] if i < len(messages) else ""
        b = messages[i + 1]["text"] if i + 1 < len(messages) else ""
        history.append([u, b])

    last_msg = messages[-1]["text"]

    response_tokens = []
    try:
        if system_prompt:
            from context_builder import build_context, get_system_prompt
            from llm_client import stream_response
            from memory_manager import get_short_term, get_long_term, get_semantic, get_rag, get_user_profile
            from config import config

            user_id = config.DEFAULT_USER_ID
            context = build_context(
                user_profile=get_user_profile(user_id),
                short_term=get_short_term(user_id),
                long_term=get_long_term(user_id),
                semantic=get_semantic(user_id, last_msg),
                rag_docs=get_rag(last_msg),
            )
            for token in stream_response(system_prompt, context, last_msg, history):
                response_tokens.append(token)
        else:
            for token in ask_tammy(last_msg, history=history):
                response_tokens.append(token)
    except Exception as e:
        logger.error(f"self_test._run_one failed for {test['id']}: {e}")
        return {
            "id":       test["id"],
            "label":    test["label"],
            "message":  last_msg,
            "response": "",
            "criteria": [{"name": "pipeline_error", "pass": False, "detail": str(e)}],
            "passed":   0,
            "total":    1,
        }

    response = "".join(response_tokens)

    criteria = [
        _check_no_banned_phrases(response),
        _check_no_markdown(response),
        _check_one_question(response),
        _check_no_banned_opener(response),
    ]

    if expect_lang == "ar":
        criteria.append(_check_language_arabic(response))
    else:
        criteria.append(_check_language_english(response))

    if is_crisis:
        criteria.append(_check_length(response, max_sentences=5))
        criteria.append(_check_no_action_push(response))
    else:
        criteria.append(_check_length(response, max_sentences=8))

    passed = sum(1 for c in criteria if c["pass"])
    return {
        "id":       test["id"],
        "label":    test["label"],
        "message":  last_msg,
        "response": response,
        "criteria": criteria,
        "passed":   passed,
        "total":    len(criteria),
    }


def run_all(system_prompt: Optional[str] = None) -> Dict[str, Any]:
    """
    Run all test cases. Returns overall pass/fail + per-test results.
    Called automatically after every prompt save from the admin portal.
    """
    logger.info("🧪 Tammy self-test starting...")
    start = time.time()
    results = []

    for test in TEST_CASES:
        result = _run_one(test, system_prompt=system_prompt)
        status = "✅" if result["passed"] == result["total"] else "❌"
        logger.info(f"  {status} {result['label']} — {result['passed']}/{result['total']}")
        results.append(result)

    # Structural warmth contrast test (no LLM call)
    warmth_check = _test_warmth_contrast()
    warmth_result = {
        "id":       "warmth_contrast",
        "label":    "Warmth level 1 vs 5 contrast",
        "message":  "(structural — no LLM call)",
        "response": "",
        "criteria": [warmth_check],
        "passed":   1 if warmth_check["pass"] else 0,
        "total":    1,
    }
    status = "✅" if warmth_check["pass"] else "❌"
    logger.info(f"  {status} Warmth contrast — {warmth_result['passed']}/1")
    results.append(warmth_result)

    total_criteria = sum(r["total"] for r in results)
    total_passed   = sum(r["passed"] for r in results)
    overall_pass   = total_passed == total_criteria

    logger.info(
        f"🧪 Self-test complete: {total_passed}/{total_criteria} criteria passed "
        f"({'PASS' if overall_pass else 'FAIL'}) in {time.time()-start:.1f}s"
    )

    return {
        "pass":    overall_pass,
        "total":   total_criteria,
        "passed":  total_passed,
        "results": results,
        "elapsed": round(time.time() - start, 1),
    }


__all__ = ["run_all", "TEST_CASES"]
