import pprint
from mongodb_client import _mongodb_client
db = _mongodb_client._db
col = db["conversations"]
doc = col.find_one({"messages.role": "user"})
if doc:
    for m in doc["messages"]:
        if m["role"] == "user":
            pprint.pprint(m)
            break
