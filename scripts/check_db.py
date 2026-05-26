from backend.db.mongodb_client import _mongodb_client
db = _mongodb_client._db
if db is None:
    print("No DB")
else:
    print("Users:", db["users"].count_documents({}))
    for u in db["users"].find():
        uid = str(u.get("user_id") or u.get("_id"))
        sessions = db["sessions"].count_documents({"user_id": uid})
        print(f"User {uid} - Name: {u.get('name')} - Sessions: {sessions}")
