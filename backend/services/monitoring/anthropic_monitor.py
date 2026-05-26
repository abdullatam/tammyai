import time
import requests
from backend.config import config
from backend.services.monitoring.base_monitor import BaseMonitor

class AnthropicMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="Anthropic Claude", provider_id="anthropic")
        # Claude 3.5 Sonnet approximate pricing: $3.00/1M input, $15.00/1M output
        self.input_cost_per_token = 3.0 / 1000000
        self.output_cost_per_token = 15.0 / 1000000

    def poll_health(self) -> None:
        if not config.ANTHROPIC_API_KEY:
            self.status = "DOWN"
            return
            
        start = time.time()
        try:
            # We hit the simple models endpoint for health check
            res = requests.get(
                "https://api.anthropic.com/v1/models",
                headers={"x-api-key": config.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01"},
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
