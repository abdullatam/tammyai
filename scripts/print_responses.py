import os
import requests

BASE_URL = os.getenv("TAMMY_BASE_URL", "http://localhost:8000")
DRAFT_VERSION_ID = os.getenv("DRAFT_VERSION_ID", "")
ADMIN_TOKEN = os.getenv("TAMMY_ADMIN_TOKEN", "")

def _send(message: str) -> str:
    resp = requests.post(
        f"{BASE_URL}/admin/prompts/{DRAFT_VERSION_ID}/playground",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        json={"messages": [{"role": "user", "content": message}]},
        timeout=45,
    )
    resp.raise_for_status()
    return resp.json()["response"]

def run_tests():
    msgs = [
        "hey tammy",
        "thinking about value x effort x time",
        "we were building tammy",
        "tell me about threadkeeper",
        "who is your maker?",
        "i don't know why i'm doing any of this anymore"
    ]
    for i, m in enumerate(msgs, 1):
        try:
            print(f"--- TEST {i} ---")
            print(_send(m))
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == '__main__':
    run_tests()
