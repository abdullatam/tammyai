import time
import requests
from backend.config import config
from backend.services.monitoring.base_monitor import BaseMonitor

class SpeechmaticsMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="Speechmatics", provider_id="speechmatics")

    def poll_health(self) -> None:
        if not config.SPEECHMATICS_API_KEY:
            self.status = "DOWN"
            return
            
        start = time.time()
        try:
            res = requests.get(
                "https://asr.api.speechmatics.com/v2/jobs",
                headers={"Authorization": f"Bearer {config.SPEECHMATICS_API_KEY}"},
                timeout=3
            )
            latency = (time.time() - start) * 1000
            self.last_checked = time.time()
            
            if res.status_code == 200:
                self.status = "OPERATIONAL"
                self.latency_ms = latency
            else:
                self.status = "DOWN"
        except Exception:
            self.status = "DOWN"
            self.last_checked = time.time()
