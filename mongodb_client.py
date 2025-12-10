from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. Connected!")
except Exception as e:
    print("MongoDB connection failed:", e)

db = client["tammy"]

# Your collections
user_profile_col = db["user_profile"]
user_sessions_col = db["user_sessions"]

# Export them
__all__ = ["user_profile_col", "user_sessions_col", "db", "client"]
