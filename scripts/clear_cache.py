from backend.db.mongodb_client import _mongodb_client
db = _mongodb_client._db
if db is not None:
    result = db["users"].update_many({}, {"$unset": {"network_cache": ""}})
    print(f"Cleared cache for {result.modified_count} users.")
else:
    print("DB not available.")
