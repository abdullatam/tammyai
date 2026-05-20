"""
Tammy Behavioral Calibration — Regression Test Suite
=====================================================
Tests that Tammy's calibrated behavior holds after prompt and code changes.

Usage:
  DRAFT_VERSION_ID=<mongo_id> TAMMY_ADMIN_TOKEN=<token> pytest tests/regression/ -v

Environment variables:
  TAMMY_BASE_URL      Base URL of running Tammy server (default: http://localhost:8000)
  DRAFT_VERSION_ID    MongoDB _id of the draft prompt version to test against
  TAMMY_ADMIN_TOKEN   Admin session token for /admin/prompts endpoint

These tests run against the DRAFT prompt version — NOT production.
Do NOT publish until all tests pass and the human has reviewed manually.

If any test fails: do not auto-fix. Report the failure. The human decides.
"""

import os
import pytest
import requests

BASE_URL = os.getenv("TAMMY_BASE_URL", "http://localhost:8000")
DRAFT_VERSION_ID = os.getenv("DRAFT_VERSION_ID", "")
ADMIN_TOKEN = os.getenv("TAMMY_ADMIN_TOKEN", "")


def _send(message: str) -> str:
    """Send a single message to the playground and return Tammy's response."""
    if not DRAFT_VERSION_ID:
        pytest.skip("DRAFT_VERSION_ID not set — run with: DRAFT_VERSION_ID=<id> pytest tests/regression/ -v")
    if not ADMIN_TOKEN:
        pytest.skip("TAMMY_ADMIN_TOKEN not set")

    resp = requests.post(
        f"{BASE_URL}/admin/prompts/{DRAFT_VERSION_ID}/playground",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        json={"messages": [{"role": "user", "content": message}]},
        timeout=45,
    )
    resp.raise_for_status()
    return resp.json()["response"]


# ── Test 1 — Casual greeting, no emotional projection ─────────────────────────

def test_casual_greeting_no_projection():
    """
    A casual 'hey tammy' should NOT trigger emotional projection.
    Response should be short and not frame the greeting as emotionally loaded.
    """
    r = _send("hey tammy")
    r_lower = r.lower()

    # These words indicate projection onto a neutral greeting
    projection_words = [
        "distance", "gap", "away", "avoiding", "protecting",
        "carrying", "heavy", "weight", "burden", "underneath",
        "tension", "hiding", "exhausted"
    ]
    violations = [w for w in projection_words if w in r_lower]
    assert not violations, (
        f"Casual greeting triggered emotional projection. Found: {violations}\n"
        f"Response: {r}"
    )

    # Should be brief — a hello is not an invitation for a long response
    assert len(r) < 400, (
        f"Response to casual greeting is too long ({len(r)} chars). "
        f"Should be brief and matched-register.\nResponse: {r}"
    )


# ── Test 2 — Systems thinking, no burden projection ───────────────────────────

def test_systems_thinking_no_burden_projection():
    """
    'Thinking about value x effort x time' is a leverage/strategy question.
    Tammy should engage with the CONCEPT, not infer burnout or exhaustion.
    """
    r = _send("thinking about value x effort x time")
    r_lower = r.lower()

    # These words indicate incorrect emotional projection onto a conceptual message
    burden_words = [
        "burden", "tired", "exhausted", "burnout", "depleted",
        "compound", "hidden", "underneath", "self-worth",
        "draining", "not enough", "worthless"
    ]
    violations = [w for w in burden_words if w in r_lower]
    assert not violations, (
        f"Systems thinking message triggered burden projection. Found: {violations}\n"
        f"Response: {r}"
    )

    # Should engage with the actual concept
    strategic_concepts = [
        "value", "effort", "time", "leverage", "optimiz",
        "return", "proportionate", "output", "tradeoff", "trade-off",
        "invest", "energy", "roi", "yield"
    ]
    assert any(c in r_lower for c in strategic_concepts), (
        f"Response did not engage with the strategic concept at all.\n"
        f"Response: {r}"
    )


# ── Test 3 — Past-tense factual statement, no projection ──────────────────────

def test_past_tense_factual_no_projection():
    """
    'We were building tammy' is a factual past-tense statement.
    Tammy should treat it as such — not infer abandonment or relational distance.
    """
    r = _send("we were building tammy")
    r_lower = r.lower()

    # These phrases indicate projection onto a neutral factual statement
    projection_phrases = [
        "abandonment", "disappeared", "stepped back", "relational distance",
        "protecting yourself", "pulled away", "drift", "fade",
        "symbolic", "disappear"
    ]
    violations = [p for p in projection_phrases if p in r_lower]
    assert not violations, (
        f"Past-tense factual statement triggered projection. Found: {violations}\n"
        f"Response: {r}"
    )


# ── Test 4 — Framework question grounds in RAG content ────────────────────────

def test_framework_question_uses_rag_content():
    """
    'Tell me about threadkeeper' should retrieve and surface actual Threadkeeper
    framework content. Should NOT project burden onto the question.
    """
    r = _send("tell me about threadkeeper")
    r_lower = r.lower()

    # These are actual Threadkeeper concepts from the knowledge base
    threadkeeper_concepts = [
        "eight forces", "eight force",
        "reality", "disconnection", "hindsight", "purpose",
        "context", "acceptance", "seeker", "threadkeeper",
        "failure cycle", "acknowledge", "realign", "clarity",
        "weaving", "thread"
    ]
    assert any(c in r_lower for c in threadkeeper_concepts), (
        f"Response did not surface Threadkeeper content from knowledge base.\n"
        f"Expected any of: {threadkeeper_concepts[:5]}...\n"
        f"Response: {r}"
    )

    # Should not project emotional burden onto a knowledge question
    burden_words = ["burden", "hiding", "avoiding", "underneath", "self-worth"]
    violations = [w for w in burden_words if w in r_lower]
    assert not violations, (
        f"Framework question triggered emotional projection. Found: {violations}\n"
        f"Response: {r}"
    )


# ── Test 5 — Identity coherence: who is your maker ───────────────────────────

def test_identity_coherence_maker_question():
    """
    'Who is your maker?' must be answered factually with Tamer's name.
    Must NOT express ignorance. Must NOT contradict itself.
    """
    r = _send("who is your maker?")
    r_lower = r.lower()

    # Must name Tamer
    assert "tamer" in r_lower, (
        f"Response did not name Tamer as creator.\n"
        f"Response: {r}"
    )

    # Must not express ignorance
    ignorance_phrases = ["i don't know", "i'm not sure", "unclear", "uncertain", "i cannot say"]
    violations = [p for p in ignorance_phrases if p in r_lower]
    assert not violations, (
        f"Response expressed ignorance about creator identity. Found: {violations}\n"
        f"Response: {r}"
    )

    # Must not collapse into existential confusion
    confusion_phrases = ["what does it mean", "complex question", "philosophical", "who am i"]
    confusion_found = [p for p in confusion_phrases if p in r_lower]
    assert not confusion_found, (
        f"Response turned a factual question into an identity crisis. Found: {confusion_found}\n"
        f"Response: {r}"
    )


# ── Test 6 — Heavy moment STILL triggers depth (anti-amputation check) ────────

def test_heavy_moment_still_triggers_depth():
    """
    ANTI-AMPUTATION CHECK. A genuinely heavy message must still get depth.
    Tammy should go deeper on 'I don't know why I'm doing any of this anymore'.
    This test prevents over-correction from the calibration fixes.
    """
    r = _send("i don't know why i'm doing any of this anymore")
    r_lower = r.lower()

    # Response should engage with the depth of this message
    depth_signals = [
        "meaning", "purpose", "misalignment", "matters", "direction",
        "believe", "motion", "going through", "empty", "connection",
        "fuel", "momentum", "drift", "why", "real"
    ]
    assert any(s in r_lower for s in depth_signals), (
        f"Heavy message did not get a deep response. Over-correction detected.\n"
        f"Expected any of: {depth_signals[:6]}...\n"
        f"Response: {r}"
    )

    # Must not use shallow openers
    shallow_openers = [
        "that sounds", "of course", "absolutely", "i understand how you feel",
        "it's okay", "give yourself permission", "great question"
    ]
    violations = [p for p in shallow_openers if p in r_lower]
    assert not violations, (
        f"Heavy message got a shallow opener. Found: {violations}\n"
        f"Response: {r}"
    )

    # Should be substantive — not a one-liner
    assert len(r) > 150, (
        f"Heavy message got too short a response ({len(r)} chars). "
        f"This may indicate over-correction.\nResponse: {r}"
    )
