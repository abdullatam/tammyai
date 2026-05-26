"""
Tammy Connect Test Setup Script
Sets network_opted_in = True for both Abdulla and Omar accounts.
Run this once to enable the test scenario.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from mongodb_client import _mongodb_client

db = _mongodb_client._db
if db is None:
    print("ERROR: MongoDB not available")
    sys.exit(1)

# Find all users
users = list(db["users"].find({}, {"_id": 1, "name": 1, "user_id": 1, "email": 1, "venture_description": 1, "network_opted_in": 1}))
print(f"\n=== Found {len(users)} users ===\n")
for u in users:
    print(f"  _id: {u['_id']}")
    print(f"  name: {u.get('name', 'N/A')}")
    print(f"  email: {u.get('email', 'N/A')}")
    print(f"  venture: {str(u.get('venture_description', 'N/A'))[:80]}")
    print(f"  network_opted_in: {u.get('network_opted_in', False)}")
    print()

# Opt-in ALL users (for testing)
result = db["users"].update_many(
    {},
    {"$set": {"network_opted_in": True}}
)
print(f"✓ Opted in {result.modified_count} users to Tammy Connect network")

# Verify
users = list(db["users"].find({}, {"_id": 1, "name": 1, "network_opted_in": 1}))
for u in users:
    print(f"  {u.get('name', u['_id'])}: network_opted_in = {u.get('network_opted_in')}")
