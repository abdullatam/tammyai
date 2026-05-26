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
    print("Fetching all keys from Redis...")
    all_keys = r.keys("*")
    
    keys_to_delete = []
    
    for key in all_keys:
        # Keep everything that starts with 'tammy:'
        if not key.startswith("tammy:"):
            keys_to_delete.append(key)
            
    if keys_to_delete:
        print(f"Found {len(keys_to_delete)} sample/non-Tammy keys to delete.")
        # We can delete them in batches or all at once using delete(*keys)
        # We will split it in chunks of 500 to be safe
        chunk_size = 500
        for i in range(0, len(keys_to_delete), chunk_size):
            chunk = keys_to_delete[i:i + chunk_size]
            r.delete(*chunk)
        print("✅ Successfully deleted all sample datasets!")
    else:
        print("✅ No sample keys found. Database is already clean.")
        
except Exception as e:
    print(f"❌ Error during cleanup: {e}")
