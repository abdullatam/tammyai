import sys
sys.path.append("/Users/abdullatamimi/Desktop/tammy 2/tammy")

from backend.db.mongodb_client import _mongodb_client
db = _mongodb_client._db
users = list(db["users"].find())
for u in users:
    print(u.get("_id"), u.get("name"), u.get("email"))
