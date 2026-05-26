# constants.py
"""
Application-wide constants and default values.
"""

# ============================================
# MESSAGE ROLES
# ============================================
ROLE_USER = "user"
ROLE_TAMMY = "tammy"
ROLE_ASSISTANT = "assistant"
ROLE_SYSTEM = "system"

# ============================================
# SESSION TYPES
# ============================================
SESSION_TYPE_CHAT = "chat"
SESSION_TYPE_ONBOARDING = "onboarding"
SESSION_TYPE_FEEDBACK = "feedback"

# ============================================
# MEMORY DEFAULTS
# ============================================
DEFAULT_SHORT_TERM_LIMIT = 20
DEFAULT_SEMANTIC_MEMORY_K = 2
DEFAULT_LONG_TERM_SESSION_LIMIT = 10
DEFAULT_RAG_DOCS_K = 3

# ============================================
# GRADIO UI
# ============================================
GRADIO_MIN_CHATBOT_HEIGHT = 400
GRADIO_DEFAULT_PLACEHOLDER = "Ask Tammy anything..."
GRADIO_CLEAR_BUTTON_TEXT = "Clear"
GRADIO_SEND_BUTTON_TEXT = "Send"

# ============================================
# SENTIMENT ANALYSIS
# ============================================
SENTIMENT_POSITIVE = "positive"
SENTIMENT_NEGATIVE = "negative"
SENTIMENT_NEUTRAL = "neutral"
SENTIMENT_UNKNOWN = "unknown"

# ============================================
# ERROR MESSAGES
# ============================================
ERROR_NO_CONVERSATION = "No conversation content available."
ERROR_NO_KEY_POINTS = "No key points available."
ERROR_EMPTY_MEMORY = "Nothing to save in memory."
ERROR_CONNECTION_FAILED = "Failed to connect to service."
ERROR_GENERIC = "An error occurred. Please try again."

# ============================================
# SUCCESS MESSAGES
# ============================================
SUCCESS_SESSION_SAVED = "Session saved successfully"
SUCCESS_MEMORY_SAVED = "Memories saved successfully"
SUCCESS_MESSAGE_PUSHED = "Message pushed to memory"

# ============================================
# TEXT TRUNCATION
# ============================================
MAX_KEY_POINT_LENGTH = 120
MAX_SUMMARY_LENGTH = 500

__all__ = [
    "ROLE_USER", "ROLE_TAMMY", "ROLE_ASSISTANT", "ROLE_SYSTEM",
    "SESSION_TYPE_CHAT", "SESSION_TYPE_ONBOARDING", "SESSION_TYPE_FEEDBACK",
    "DEFAULT_SHORT_TERM_LIMIT", "DEFAULT_SEMANTIC_MEMORY_K", 
    "DEFAULT_LONG_TERM_SESSION_LIMIT", "DEFAULT_RAG_DOCS_K",
    "SENTIMENT_POSITIVE", "SENTIMENT_NEGATIVE", "SENTIMENT_NEUTRAL", "SENTIMENT_UNKNOWN",
    "ERROR_NO_CONVERSATION", "ERROR_NO_KEY_POINTS", "ERROR_EMPTY_MEMORY",
    "ERROR_CONNECTION_FAILED", "ERROR_GENERIC",
    "SUCCESS_SESSION_SAVED", "SUCCESS_MEMORY_SAVED", "SUCCESS_MESSAGE_PUSHED",
    "MAX_KEY_POINT_LENGTH", "MAX_SUMMARY_LENGTH"
]
