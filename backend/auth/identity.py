# identity.py
"""
Tammy V2 — Dynamic Identity System
Manages the active user ID for the current session to ensure memory isolation.
"""

_active_user_id = None
_active_session_id = None

def set_active_user_id(user_id: str) -> None:
    """Sets the active user ID for the current session."""
    global _active_user_id
    if not user_id or not str(user_id).strip():
        raise ValueError("User ID cannot be empty.")
    _active_user_id = str(user_id).strip().lower()

def get_user_id() -> str:
    """Returns the active user identity."""
    if not _active_user_id:
        raise ValueError("Active user ID not set. The session must initialize identity first.")
    return _active_user_id

def set_active_session_id(session_id: str) -> None:
    """Sets the active session ID for the current thread."""
    global _active_session_id
    if not session_id or not str(session_id).strip():
        raise ValueError("Session ID cannot be empty.")
    _active_session_id = str(session_id).strip()

def get_session_id() -> str:
    """Returns the active session identity."""
    if not _active_session_id:
        raise ValueError("Active session ID not set.")
    return _active_session_id

__all__ = ["get_user_id", "set_active_user_id", "get_session_id", "set_active_session_id"]
