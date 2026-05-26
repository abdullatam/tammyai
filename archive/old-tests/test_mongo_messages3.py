from mongodb_client import _mongodb_client
import reprlib
db = _mongodb_client._db
col = db["conversations"]
docs = list(col.find({"session_id": "24e6bab70be940b09be82fe3"}))
for doc in docs:
    for m in doc["messages"]:
        if m["role"] == "user":
            print(repr(m["text"]))
