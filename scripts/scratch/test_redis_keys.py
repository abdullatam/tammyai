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
    print("✅ Successfully pinged Redis!")
    
    # Write a test key so the user can see it in their dashboard
    r.set("tammy:test_key", "Hello from Antigravity! Redis is working perfectly.")
    print("✅ Wrote test key: 'tammy:test_key'")
    
    # Fetch some keys
    keys = r.keys("*")
    print(f"\nFound {len(keys)} total keys in your database. Here is a sample:")
    for k in keys[:10]:
        print(f" - {k}")
        
except Exception as e:
    print(f"❌ Error: {e}")
