# storage_client.py
"""
Tammy — File storage abstraction.

Phase 1: Local disk at config.UPLOAD_DIR.
Phase 2: Swap _backend to S3Client or R2Client — no callers change.
"""

import uuid
from pathlib import Path
from typing import Optional
from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)


class LocalStorageBackend:
    def __init__(self, base_dir: str):
        self.base = Path(base_dir)
        self.base.mkdir(parents=True, exist_ok=True)

    def save(self, user_id: str, data: bytes, ext: str) -> tuple[str, str, str]:
        """Save bytes. Returns (attachment_id, public_url, disk_path)."""
        attachment_id = uuid.uuid4().hex[:20]
        user_dir = self.base / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        path = user_dir / f"{attachment_id}.{ext}"
        path.write_bytes(data)
        public_url = f"/static/uploads/{user_id}/{attachment_id}.{ext}"
        return attachment_id, public_url, str(path)

    def read(self, path_str: str) -> Optional[bytes]:
        try:
            return Path(path_str).read_bytes()
        except FileNotFoundError:
            return None

    def delete(self, path_str: str) -> None:
        try:
            Path(path_str).unlink(missing_ok=True)
        except Exception as e:
            logger.warning(f"Storage delete failed: {e}")


# Singleton — swap backend here for cloud
_backend = LocalStorageBackend(config.UPLOAD_DIR)


def save_file(user_id: str, data: bytes, ext: str):
    return _backend.save(user_id, data, ext)


def read_file(path_str: str) -> Optional[bytes]:
    return _backend.read(path_str)


def delete_file(path_str: str) -> None:
    _backend.delete(path_str)


__all__ = ["save_file", "read_file", "delete_file"]
