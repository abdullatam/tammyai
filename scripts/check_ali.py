from backend.db.mongodb_client import _mongodb_client
import pprint
db = _mongodb_client._db
u = db["users"].find_one({"username": "ali"})
pprint.pprint(u)
