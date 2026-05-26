import time
import requests
from backend.config import config
from backend.services.monitoring.base_monitor import BaseMonitor

class ElevenLabsMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="ElevenLabs", provider_id="elevenlabs")
        # ElevenLabs cost: $0.30 per 1000 characters
        self.cost_per_char = 0.30 / 1000

    def poll_health(self) -> None:
        if not config.ELEVENLABS_API_KEY:
            self.status = "DOWN"
            return
            
        start = time.time()
        try:
            res = requests.get(
                "https://api.elevenlabs.io/v1/models",
                headers={"xi-api-key": config.ELEVENLABS_API_KEY},
                timeout=3
            )
            latency = (time.time() - start) * 1000
            self.last_checked = time.time()
            
            if res.status_code == 200:
                self.status = "OPERATIONAL"
                self.latency_ms = latency
            elif res.status_code == 401:
                # API key might lack permissions, but service is technically up
                self.status = "DEGRADED"
                self.latency_ms = latency
            else:
                self.status = "DOWN"
        except Exception:
            self.status = "DOWN"
            self.last_checked = time.time()
            
    def record_usage(self, characters: int, latency_ms: float):
        cost = characters * self.cost_per_char
        self.record_request(latency_ms=latency_ms, characters=characters, cost=cost)
