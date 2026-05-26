import time
import requests
from backend.config import config
from backend.services.monitoring.base_monitor import BaseMonitor

class OpenAIMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="OpenAI", provider_id="openai")
        # GPT-4o-mini approximate pricing: $0.150/1M input, $0.600/1M output
        self.input_cost_per_token = 0.150 / 1000000
        self.output_cost_per_token = 0.600 / 1000000

    def poll_health(self) -> None:
        if not config.OPENAI_API_KEY:
            self.status = "DOWN"
            return
            
        start = time.time()
        try:
            res = requests.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {config.OPENAI_API_KEY}"},
                timeout=3
            )
            latency = (time.time() - start) * 1000
            self.last_checked = time.time()
            
            if res.status_code == 200:
                self.status = "OPERATIONAL"
                self.latency_ms = latency
            else:
                self.status = "DEGRADED"
        except Exception:
            self.status = "DOWN"
            self.last_checked = time.time()
            
    def record_usage(self, input_tokens: int, output_tokens: int, latency_ms: float):
        cost = (input_tokens * self.input_cost_per_token) + (output_tokens * self.output_cost_per_token)
        self.record_request(latency_ms=latency_ms, tokens=(input_tokens + output_tokens), cost=cost)
