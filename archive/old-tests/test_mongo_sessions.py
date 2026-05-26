import pprint
from mongodb_client import _mongodb_client
db = _mongodb_client._db
col = db["sessions"]
for doc in col.find().sort("updated_at", -1).limit(3):
    pprint.pprint(doc)
