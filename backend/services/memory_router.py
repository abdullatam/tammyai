# memory_router.py
"""
Tammy V2 — Query classifier and memory router.
Decides which memory sources to load per query type.
No LLM call needed — fast keyword matching.
"""

from typing import List

from backend.logger import get_logger

logger = get_logger(__name__)

# ── Keyword sets ──────────────────────────────────────────────────────────────

MEMORY_KEYWORDS = [
    # explicit recall
    "remember", "recall", "last time", "did i", "told you", "previous",
    "we talked", "last session", "do you know", "what i said", "before",
    "last week", "last month", "earlier",
    # personal identity
    "my name", "who am i", "who i am", "about me", "about myself",
    "tell me about me", "more info about me", "know about me",
    "info about me", "what do you know", "what you know",
    "my profile", "my history", "my background",
    # personal facts
    "where did i", "where do i", "where i",
    "what do i", "what i do",
    "i studied", "i study", "university", "school", "college",
    "i work", "my job", "my career",
    "my goal", "my goals", "my dream", "my project",
    "leafflex", "leaflex", "internship", "zain",
    "my life", "my story", "my journey",
]

KNOWLEDGE_KEYWORDS = [
    "how to", "what is", "explain", "framework", "model", "method",
    "principle", "strategy", "define", "concept", "theory", "learn",
    "alchemy", "egg framework", "threadkeeper", "first principles",
    "mental model", "decision", "clarity", "book",
]

PLANNING_KEYWORDS = [
    "plan", "next step", "how should i", "what should i", "roadmap",
    "action", "priority", "schedule", "build", "launch", "startup",
    "choose", "decide", "improve", "should i", "help me decide",
]

# Memory sources per query type
ROUTING_TABLE = {
    "memory":   ["redis", "mongo", "pinecone_memory"],
    "knowledge": ["pinecone_rag"],
    "planning": ["redis", "mongo", "pinecone_memory"],
    "general":  ["redis", "pinecone_memory"],  # always include semantic for personal context
}


def classify_query(question: str) -> str:
    """
    Classify question into one of: memory, knowledge, planning, general.
    Uses keyword heuristics — fast, no LLM needed.
    """
    q = question.lower()

    # Memory signals first (highest priority — personal questions)
    if any(kw in q for kw in MEMORY_KEYWORDS):
        logger.debug(f"Query classified as: memory")
        return "memory"

    # Planning signals
    if any(kw in q for kw in PLANNING_KEYWORDS):
        logger.debug(f"Query classified as: planning")
        return "planning"

    # Knowledge signals
    if any(kw in q for kw in KNOWLEDGE_KEYWORDS):
        logger.debug(f"Query classified as: knowledge")
        return "knowledge"

    logger.debug(f"Query classified as: general")
    return "general"


def get_memory_sources(query_type: str) -> List[str]:
    """Return list of memory sources to query for this query type."""
    return ROUTING_TABLE.get(query_type, ["redis", "pinecone_memory"])


__all__ = ["classify_query", "get_memory_sources"]
