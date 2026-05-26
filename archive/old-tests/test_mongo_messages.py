import re
import pprint
from mongodb_client import _mongodb_client
db = _mongodb_client._db
col = db["conversations"]
docs = list(col.find({"session_id": "24e6bab70be940b09be82fe3"}))
all_messages = []
for doc in docs:
    msgs = doc.get("messages", [])
    for m in msgs:
        if m.get("role") == "user" and m.get("text"):
            m["text"] = re.sub(r"^\[TYPING SIGNAL:[^\]]+\]\s*", "", m["text"])
    all_messages.extend(msgs)
for m in all_messages:
    if m["role"] == "user":
        print(repr(m["text"]))
