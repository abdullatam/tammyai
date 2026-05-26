import asyncio
import websockets
import json
import requests
import sys

# Get JWT
import sys
sys.path.append('.')
from config import config
resp = requests.post(
    "https://mp.speechmatics.com/v1/api_keys?type=rt",
    headers={"Authorization": f"Bearer {config.SPEECHMATICS_API_KEY}", "Content-Type": "application/json"},
    json={"ttl": 60}
)
jwt = resp.json().get("key_value")

async def test_auto():
    uri = f"wss://eu2.rt.speechmatics.com/v2/auto?jwt={jwt}"
    try:
        async with websockets.connect(uri) as ws:
            await ws.send(json.dumps({
                "message": "StartRecognition",
                "audio_format": {"type": "raw", "encoding": "pcm_s16le", "sample_rate": 16000},
                "transcription_config": {"language": "auto"}
            }))
            response = await ws.recv()
            print("Response for auto:", response)
    except Exception as e:
        print("Error with auto:", e)

asyncio.run(test_auto())
