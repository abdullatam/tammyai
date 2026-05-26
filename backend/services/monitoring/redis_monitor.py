import time
from backend.db.redis_client import get_redis, is_redis_available
from backend.services.monitoring.base_monitor import BaseMonitor

class RedisMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="Redis Cloud", provider_id="redis")
        self.memory_usage_mb = 0.0
        self.connected_clients = 0
        self.ops_per_sec = 0
        self.keys_count = 0
        self.hit_rate = 0.0
        self._last_stats = None
        self._last_stats_time = 0

    def poll_health(self) -> None:
        if not is_redis_available():
            self.status = "DOWN"
            return
            
        start = time.time()
        try:
            r = get_redis()
            info = r.info()
            latency = (time.time() - start) * 1000
            
            self.status = "OPERATIONAL"
            self.latency_ms = latency
            self.last_checked = time.time()
            
            # Extract live metrics
            self.memory_usage_mb = float(info.get("used_memory", 0)) / (1024 * 1024)
            self.connected_clients = int(info.get("connected_clients", 0))
            self.ops_per_sec = int(info.get("instantaneous_ops_per_sec", 0))
            
            # Key count (sum across db0, db1, etc)
            total_keys = 0
            for key in info:
                if key.startswith('db') and isinstance(info[key], dict):
                    total_keys += info[key].get('keys', 0)
            self.keys_count = total_keys
            
            # Hit rate calculation
            hits = int(info.get("keyspace_hits", 0))
            misses = int(info.get("keyspace_misses", 0))
            total_lookups = hits + misses
            self.hit_rate = (hits / total_lookups * 100) if total_lookups > 0 else 100.0
            
        except Exception as e:
            self.status = "DEGRADED"
            self.last_checked = time.time()
            
    def get_metrics(self):
        base = super().get_metrics()
        base.update({
            "memory_usage_mb": round(self.memory_usage_mb, 2),
            "connected_clients": self.connected_clients,
            "ops_per_sec": self.ops_per_sec,
            "keys_count": self.keys_count,
            "hit_rate": round(self.hit_rate, 1)
        })
        return base
