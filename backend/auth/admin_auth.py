# admin_auth.py
"""
Single-admin authentication for the Tammy admin panel.
Bcrypt password verification + itsdangerous signed session cookies.
"""
import os
import time
from typing import Optional

from fastapi import Cookie, HTTPException, Request, Response
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from backend.logger import get_logger

logger = get_logger(__name__)

ADMIN_USERNAME     = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
ADMIN_SESSION_SECRET = os.getenv("ADMIN_SESSION_SECRET", "dev-secret-change-me-32chars-min")
SESSION_MAX_AGE    = 7 * 24 * 3600   # 7 days

_serializer = URLSafeTimedSerializer(ADMIN_SESSION_SECRET, salt="admin-session")


def verify_admin_password(password: str) -> bool:
    # Always try plain-text ADMIN_PASSWORD first (works even without passlib)
    plain = os.getenv("ADMIN_PASSWORD", "")
    if plain and password == plain:
        return True
    # Then try bcrypt hash if available
    if ADMIN_PASSWORD_HASH:
        try:
            from passlib.hash import bcrypt as _bcrypt
            return _bcrypt.verify(password, ADMIN_PASSWORD_HASH)
        except Exception as e:
            logger.error(f"bcrypt verify error: {e}")
    return False


def create_session_token(username: str) -> str:
    return _serializer.dumps({"u": username, "t": int(time.time())})


def verify_session_token(token: str) -> Optional[str]:
    try:
        data = _serializer.loads(token, max_age=SESSION_MAX_AGE)
        return data.get("u")
    except (BadSignature, SignatureExpired):
        return None
    except Exception as e:
        logger.error(f"Token verify error: {e}")
        return None


def set_admin_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="admin_token",
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,   # set to True in production behind HTTPS
    )


def clear_admin_cookie(response: Response) -> None:
    response.delete_cookie("admin_token", samesite="lax")


async def require_admin(
    request: Request = None,
    admin_token: Optional[str] = Cookie(None),
) -> str:
    """FastAPI dependency — raises 401 if not authenticated.
    Accepts either a signed session cookie or a Bearer token (plain password)."""
    # 1. Try session cookie first
    if admin_token:
        username = verify_session_token(admin_token)
        if username:
            return username
    # 2. Fallback: Bearer token = plain admin password
    if request is not None:
        auth = request.headers.get("authorization", "")
        pwd = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
        if not pwd:
            pwd = request.headers.get("x-admin-password", "")
        if pwd and verify_admin_password(pwd):
            return ADMIN_USERNAME
    raise HTTPException(status_code=401, detail="Not authenticated")
