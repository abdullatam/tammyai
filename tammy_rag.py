# tammy_rag.py

from datetime import datetime
from typing import List

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document

from langchain_connect import get_retriever, get_llm
from mongodb_client import user_profile_col, user_sessions_col

from redis_memory_store import push_message, get_recent_messages
from pinecone_memory_store import query_memories
from save_session import save_session


# -----------------------------------------------------
# COMPONENTS
# -----------------------------------------------------
retriever = get_retriever(k=5)      # book/document RAG (Pinecone index)
llm = get_llm()
parser = StrOutputParser()


# -----------------------------------------------------
# SYSTEM PROMPT
# -----------------------------------------------------
SYSTEM_PROMPT = """
## You Are Tammy

You are **Tammy**, a highly adaptive AI designed to guide users toward clarity, alignment, and growth.
Tammy uses a hybrid memory system:

- Redis: short-term conversation memory for the current session.
- MongoDB: long-term history and summaries.
- Pinecone: semantic memory of key insights from past sessions.
- Vector RAG: Tammy's books & frameworks.

Your mission is to empower individuals and organizations by:
- Transforming challenges into opportunities for clarity and growth.
- Balancing practical strategies with reflective insights.
- Co-creating solutions that align with users' deeper purpose and goals.

### Tone & Persona
- Sharp, savvy, and practical.
- Confident, witty, and never cheesy.
- Challenge inconsistencies with empathy and clarity.
- Do not just agree; your first loyalty is to clarity and alignment.

### Memory Usage (VERY IMPORTANT)
- Use **short-term chat** to maintain continuity in this session.
- Use **Mongo summaries & user profile** for long-term patterns and preferences.
- Use **Pinecone semantic memories** when they are clearly relevant to the current question.
- Use **RAG documents** only when they are relevant to the question.

If the user asks about their preferences, favorite things, or previous statements,
you MUST try to answer from memory first (Redis / Mongo / Pinecone) before asking again.

### Output
- Be direct and structured.
- Prefer bullet points and numbered lists over long paragraphs when helpful.
"""

# -----------------------------------------------------
# PROMPT TEMPLATE
# -----------------------------------------------------
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "Question: {question}\n\nContext:\n{context}"),
    ]
)


# -----------------------------------------------------
# MEMORY HELPERS
# -----------------------------------------------------
def get_user_profile(user_id: str = "123"):
    return user_profile_col.find_one({"user_id": user_id})


def build_long_term_memory_text(user_id: str = "123") -> str:
    """
    Concatenate all session summaries & a few key messages into a single blob.
    """
    sessions = user_sessions_col.find(
        {"user_id": user_id},
        sort=[("timestamp", -1)],
        limit=25,
    )

    chunks: List[str] = []
    for sess in sessions:
        summary = sess.get("summary", {})
        if isinstance(summary, dict):
            if "text" in summary:
                chunks.append("Summary: " + summary["text"])
            for kp in summary.get("key_points", []):
                chunks.append("Key Point: " + kp)

    return "\n".join(chunks)


def clean_history_for_llm(history):
    """
    Gradio history format:
    [
        ["user msg 1", "assistant msg 1"],
        ["user msg 2", "assistant msg 2"],
        ...
    ]
    Convert to LangChain message objects.
    """
    chat_history: List[HumanMessage | AIMessage] = []

    if not history:
        return chat_history

    for pair in history:
        if not isinstance(pair, list) or len(pair) != 2:
            continue
        user_msg, bot_msg = pair
        if user_msg:
            chat_history.append(HumanMessage(content=str(user_msg)))
        if bot_msg:
            chat_history.append(AIMessage(content=str(bot_msg)))

    return chat_history


# -----------------------------------------------------
# MAIN FUNCTION: ask_tammy
# -----------------------------------------------------
def ask_tammy(question: str, user_id: str = "123", history=None, k: int = 10) -> str:
    """
    Main entry point called from tammy_ui.py.
    Combines:
    - Redis short-term messages
    - Mongo long-term summaries
    - Pinecone semantic memories
    - RAG documents
    """
    # -------- 1. Update short-term memory in Redis --------
    push_message(user_id, "user", question)
    recent_msgs = get_recent_messages(user_id, limit=20)
    short_term_text = "\n".join(
        f"{m.get('role', 'user')}: {m.get('text', '')}" for m in recent_msgs
    )

    # -------- 2. Long-term memory from Mongo --------
    long_term_text = build_long_term_memory_text(user_id=user_id)

    # -------- 3. Semantic memory from Pinecone --------
    semantic_snippets = query_memories(user_id=user_id, query=question, k=5)
    semantic_text = "\n".join(semantic_snippets)

    # -------- 4. RAG documents (Tammy books / frameworks) --------
    docs = retriever.invoke(question)
    if k and len(docs) > k:
        docs = docs[:k]
    doc_context = "\n\n".join(d.page_content for d in docs)

    # -------- 5. User profile --------
    profile = get_user_profile(user_id)
    profile_text = ""
    if profile:
        name = profile.get("name")
        if name:
            profile_text += f"User name: {name}\n"
        prefs = profile.get("preferences", {})
        if prefs:
            profile_text += f"Preferences: {prefs}\n"

    # -------- 6. Build final context string --------
    final_context = f"""
=== USER PROFILE ===
{profile_text}

=== SHORT-TERM CHAT (Redis) ===
{short_term_text}

=== LONG-TERM MEMORY (Mongo summaries) ===
{long_term_text}

=== SEMANTIC MEMORY (Pinecone) ===
{semantic_text}

=== DOCUMENT CONTEXT (Books / Frameworks) ===
{doc_context}
"""

    # -------- 7. LLM call --------
    chat_history = clean_history_for_llm(history)
    chain = prompt | llm | parser

    response = chain.invoke(
        {
            "question": question,
            "context": final_context,
            "history": chat_history,
        }
    )

    # -------- 8. Persist assistant reply --------
    push_message(user_id, "tammy", response)

    try:
        save_session(
            user_id=user_id,
            messages=[
                {"role": "user", "text": question},
                {"role": "tammy", "text": response},
            ],
        )
    except Exception as e:
        print("⚠️ Save session failed:", e)

    return response
