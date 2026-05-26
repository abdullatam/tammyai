import os
import redis
from dotenv import load_dotenv
import json

load_dotenv()

r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

try:
    # Look specifically for keys starting with 'tammy:'
    tammy_keys = r.keys("tammy:*")
    
    print(f"Found {len(tammy_keys)} Tammy keys in Redis:")
    for k in tammy_keys:
        print(f"\n--- KEY: {k} ---")
        try:
            # Tammy stores chat history as a Redis List, let's try to fetch it
            key_type = r.type(k)
            if key_type == "list":
                items = r.lrange(k, 0, -1)
                for i, item in enumerate(items):
                    # Try to parse it nicely if it's JSON
                    try:
                        parsed = json.loads(item)
                        print(f"  [{i}]: {json.dumps(parsed, indent=2)}")
                    except json.JSONDecodeError:
                        print(f"  [{i}]: {item}")
            elif key_type == "string":
                val = r.get(k)
                print(f"  Value: {val}")
            else:
                print(f"  [Type: {key_type}]")
        except Exception as inner_e:
            print(f"  Could not read key contents: {inner_e}")
        
except Exception as e:
    print(f"❌ Error connecting to Redis: {e}")
