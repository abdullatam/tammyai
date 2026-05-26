import os
import redis
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

try:
    r.ping()
    print("✅ Redis is successfully connected and working!")
except Exception as e:
    print(f"❌ Failed to connect to Redis: {e}")
