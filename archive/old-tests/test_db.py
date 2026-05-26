from mongodb_client import _mongodb_client
import pprint

db = _mongodb_client._db
session = db["sessions"].find_one()
pprint.pprint(session)
print("----------------")
conv = db["conversations"].find_one()
pprint.pprint(conv)
