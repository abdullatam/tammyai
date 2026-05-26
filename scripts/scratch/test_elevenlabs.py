import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")

# Let's hit the ElevenLabs user info endpoint to check quota and auth
headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}
response = requests.get("https://api.elevenlabs.io/v1/user", headers=headers)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
