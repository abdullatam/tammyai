import os
import re
import time
import py_compile
import importlib
import uuid
import difflib
from typing import Dict, List

from backend.db.mongodb_client import prompt_versions_col
from backend.logger import get_logger
from ai.rag import tammy_rag

logger = get_logger(__name__)

PROMPT_FILE = os.path.join(os.path.dirname(__file__), "tammy_rag.py")

def get_current_prompt() -> str:
    """Read the current system prompt from the hot-reloaded module."""
    # Reloading to ensure we get the latest if it changed on disk
    try:
        importlib.reload(tammy_rag)
        return tammy_rag.SYSTEM_PROMPT.strip()
    except Exception as e:
        logger.error(f"Failed to load current prompt: {e}")
        return ""

def save_prompt(new_prompt: str, author: str) -> bool:
    """Atomic write + compile check + hot reload + version save."""
    try:
        with open(PROMPT_FILE, 'r') as f:
            content = f.read()

        # Extract old prompt for diff
        old_prompt = get_current_prompt()
        
        # Replace the prompt safely
        # The regex looks for SYSTEM_PROMPT = """ ... """
        pattern = r'(SYSTEM_PROMPT\s*=\s*""")([\s\S]*?)(""")'
        if not re.search(pattern, content):
            logger.error("SYSTEM_PROMPT block not found in tammy_rag.py")
            return False

        # Build new file content
        new_content = re.sub(pattern, rf'\1\n{new_prompt}\n\3', content)

        # Write to temp file
        temp_file = PROMPT_FILE + ".tmp"
        with open(temp_file, 'w') as f:
            f.write(new_content)

        # Verify syntax
        try:
            py_compile.compile(temp_file, doraise=True)
        except py_compile.PyCompileError as e:
            logger.error(f"Syntax error in new prompt file: {e}")
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return False

        # Atomic replace
        os.replace(temp_file, PROMPT_FILE)

        # Hot reload module
        importlib.reload(tammy_rag)

        # Save version to MongoDB
        version_id = str(uuid.uuid4())
        diff_lines = list(difflib.unified_diff(
            old_prompt.splitlines(),
            new_prompt.splitlines(),
            lineterm=""
        ))
        
        doc = {
            "version_id": version_id,
            "prompt": new_prompt,
            "author": author,
            "timestamp": time.time(),
            "diff": "\n".join(diff_lines),
            "diff_chars": len(new_prompt) - len(old_prompt)
        }
        
        if prompt_versions_col is not None:
            prompt_versions_col.insert_one(doc)
            
        logger.info(f"✅ Prompt updated successfully by {author}. Version: {version_id}")

        # Auto-run self-test after every save (non-blocking background thread)
        try:
            import threading
            from backend.intelligence.promise_engine import run_full_self_test as _run_full_self_test
            threading.Thread(target=_run_full_self_test, kwargs={"triggered_by": "prompt_save"}, daemon=True).start()
        except Exception as st_err:
            logger.warning(f"Self-test trigger failed: {st_err}")

        return True

    except Exception as e:
        logger.error(f"Failed to save prompt: {e}")
        return False

def get_versions() -> List[Dict]:
    """Get prompt version history."""
    if prompt_versions_col is None:
        return []
    try:
        versions = list(prompt_versions_col.find({}, {"_id": 0}).sort("timestamp", -1))
        return versions
    except Exception as e:
        logger.error(f"Failed to get versions: {e}")
        return []

def rollback(version_id: str, author: str) -> bool:
    """Rollback to a specific version."""
    if prompt_versions_col is None:
        return False
    try:
        version = prompt_versions_col.find_one({"version_id": version_id})
        if not version:
            logger.error(f"Version {version_id} not found")
            return False
            
        return save_prompt(version["prompt"], f"{author} (Rollback to {version_id[:8]})")
    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        return False

def diff_prompts(a: str, b: str) -> str:
    """Generate a unified diff between two strings."""
    diff_lines = list(difflib.unified_diff(
        a.splitlines(),
        b.splitlines(),
        lineterm=""
    ))
    return "\n".join(diff_lines)
