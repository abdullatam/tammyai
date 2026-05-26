import time
from typing import Dict, Any
from abc import ABC, abstractmethod

class BaseMonitor(ABC):
    """
    Base class for Tammy infrastructure monitors.
    Handles standard metric schemas and cost calculations.
    """
    
    def __init__(self, name: str, provider_id: str):
        self.name = name
        self.provider_id = provider_id
        
        # Operational states
        self.status = "UNKNOWN"
        self.latency_ms = 0.0
        self.last_checked = 0.0
        self.error_count = 0
        
        # Usage metrics (session/live)
        self.total_requests = 0
        self.tokens_used = 0
        self.characters_used = 0
        self.estimated_cost = 0.0
        
        # Rate metrics
        self._request_timestamps = []
    
    def record_request(self, latency_ms: float = None, tokens: int = 0, characters: int = 0, cost: float = 0.0, error: bool = False):
        """Record a live interaction with this provider."""
        now = time.time()
        self._request_timestamps.append(now)
        
        # Keep only the last 60 seconds of timestamps for RPM/RPS calculation
        self._request_timestamps = [t for t in self._request_timestamps if now - t < 60]
        
        self.total_requests += 1
        
        if latency_ms is not None:
            # Moving average for latency (last 10 requests)
            self.latency_ms = (self.latency_ms * 0.9) + (latency_ms * 0.1) if self.latency_ms > 0 else latency_ms
            
        self.tokens_used += tokens
        self.characters_used += characters
        self.estimated_cost += cost
        
        if error:
            self.error_count += 1
            self.status = "DEGRADED"

    def get_requests_per_minute(self) -> int:
        now = time.time()
        self._request_timestamps = [t for t in self._request_timestamps if now - t < 60]
        return len(self._request_timestamps)

    @abstractmethod
    def poll_health(self) -> None:
        """Ping the provider to check its actual uptime/status. Should be called asynchronously."""
        pass

    def get_metrics(self) -> Dict[str, Any]:
        """Return standardized metric payload for the dashboard."""
        return {
            "id": self.provider_id,
            "name": self.name,
            "status": self.status,
            "latency_ms": int(self.latency_ms),
            "last_checked_sec_ago": int(time.time() - self.last_checked),
            "requests_per_minute": self.get_requests_per_minute(),
            "total_requests": self.total_requests,
            "error_count": self.error_count,
            "tokens_used": self.tokens_used,
            "characters_used": self.characters_used,
            "estimated_cost": round(self.estimated_cost, 6)
        }
