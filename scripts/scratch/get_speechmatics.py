import os
import requests
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("SPEECHMATICS_API_KEY")
res = requests.get("https://asr.api.speechmatics.com/v2/usage", headers={"Authorization": f"Bearer {api_key}"})
print(res.status_code)
print(res.text)
