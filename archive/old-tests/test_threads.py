import time
import json
import logging
from bson import ObjectId

# Configure logging to suppress noisy output
logging.basicConfig(level=logging.WARNING)

from tammy_core import ask_tammy
from mongodb_client import emotional_threads_col
from emotional_thread_manager import get_active_threads
from context_builder import build_context
from identity import set_active_user_id, set_active_session_id

USER_ID = "test_user_999"
SESSION_ID = "test_sess_001"

def run_test():
    set_active_user_id(USER_ID)
    set_active_session_id(SESSION_ID)
    print("--- STEP 1: Sending message about anxiety ---")
    question1 = "I'm really nervous about presenting to the board next Tuesday."
    print(f"User: {question1}")
    response1_chunks = list(ask_tammy(question1, user_id=USER_ID, history=[]))
    print(f"Tammy: {''.join(response1_chunks)}")
    
    # Wait for background thread to process
    time.sleep(10)
    
    print("\n--- STEP 2: Checking MongoDB for new thread ---")
    threads = list(emotional_threads_col.find({"user_id": USER_ID}))
    if len(threads) == 0:
        print("❌ FAILED: No thread created in MongoDB.")
        return
    else:
        print(f"✅ SUCCESS: Found {len(threads)} threads.")
        thread = threads[-1]
        print(f"   Thread ID: {thread.get('thread_id')}")
        print(f"   Status: {thread.get('status')}")
        print(f"   Emotion: {thread.get('current_emotion')}")
        print(f"   Intensity: {thread.get('current_intensity')}")
        
    print("\n--- STEP 3: Simulating 2 days passing ---")
    two_days_ago = time.time() - (86400 * 2)
    emotional_threads_col.update_one(
        {"_id": thread["_id"]},
        {"$set": {"last_updated": two_days_ago}}
    )
    print("✅ SUCCESS: Set last_updated to 2 days ago.")
    
    print("\n--- STEP 4: Starting new session & checking context ---")
    # Instead of running full tammy, let's just manually call get_active_threads and get_threads_needing_followup
    from emotional_thread_manager import get_active_threads, get_threads_needing_followup
    active = get_active_threads(USER_ID)
    followup = get_threads_needing_followup(USER_ID)
    print(f"Active threads count: {len(active)}")
    print(f"Followup threads count: {len(followup)}")
    if len(active) > 0 and len(followup) > 0:
        print("✅ SUCCESS: Thread appears as needing check-in.")
    else:
        print("❌ FAILED: Thread does not need check-in or is not active.")
        
    print("\n--- STEP 5: Mentioning original topic ---")
    question2 = "I'm still thinking about that board presentation."
    print(f"User: {question2}")
    response2_chunks = list(ask_tammy(question2, user_id=USER_ID, history=[]))
    print(f"Tammy: {''.join(response2_chunks)}")
    
    # Wait for background thread
    time.sleep(10)
    
    thread = emotional_threads_col.find_one({"_id": thread["_id"]})
    evolutions = thread.get("evolution", [])
    if len(evolutions) > 0:
        print(f"✅ SUCCESS: Thread evolution entry added (Count: {len(evolutions)})")
    else:
        print("❌ FAILED: No evolution entry added.")
        
    print("\n--- STEP 6: Resolving the thread ---")
    question3 = "The presentation actually went really well. I'm so relieved it's over."
    print(f"User: {question3}")
    response3_chunks = list(ask_tammy(question3, user_id=USER_ID, history=[]))
    print(f"Tammy: {''.join(response3_chunks)}")
    
    # Wait for background thread
    time.sleep(10)
    
    thread = emotional_threads_col.find_one({"_id": thread["_id"]})
    if thread.get("status") == "RESOLVED":
        print("✅ SUCCESS: Thread marked RESOLVED.")
    else:
        print(f"❌ FAILED: Thread status is {thread.get('status')}")
        
    print("\n--- STEP 7: Hitting API simulation (/emotional-threads) ---")
    active_now = get_active_threads(USER_ID)
    if len(active_now) == 0:
        print("✅ SUCCESS: Resolved thread is not in active list.")
    else:
        print("❌ FAILED: Active list still contains the thread.")

if __name__ == "__main__":
    # Clean up before running
    emotional_threads_col.delete_many({"user_id": USER_ID})
    run_test()
    # Clean up after running
    emotional_threads_col.delete_many({"user_id": USER_ID})
