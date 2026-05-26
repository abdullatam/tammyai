import os
import requests
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("ELEVENLABS_API_KEY")
res = requests.get("https://api.elevenlabs.io/v1/user", headers={"xi-api-key": api_key})
print(res.status_code)
print(res.text)
