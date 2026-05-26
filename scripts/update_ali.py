import sys
sys.path.append("/Users/abdullatamimi/Desktop/tammy 2/tammy")

from backend.db.mongodb_client import _mongodb_client
from bson import ObjectId
db = _mongodb_client._db

doc = {
    "name": "Ali",
    "venture": "Tammy",
    "stage": "Seed",
    "timezone": "GST",
    "joined": "April 2026",
    "streak_days": 12,
    "warmth_level": 3
}

db["users"].update_one(
    {"_id": ObjectId("6631d563d41fbd6d72db2f2f")},
    {"$set": doc},
    upsert=True
)

print("Updated Ali's profile in DB!")
