import asyncio
import logging
from typing import Dict, Any
from backend.services.monitoring.anthropic_monitor import AnthropicMonitor
from backend.services.monitoring.openai_monitor import OpenAIMonitor
from backend.services.monitoring.elevenlabs_monitor import ElevenLabsMonitor
from backend.services.monitoring.redis_monitor import RedisMonitor
from backend.services.monitoring.pinecone_monitor import PineconeMonitor
from backend.services.monitoring.speechmatics_monitor import SpeechmaticsMonitor

logger = logging.getLogger(__name__)

class SystemMonitor:
    def __init__(self):
        self.monitors = {
            "anthropic": AnthropicMonitor(),
            "openai": OpenAIMonitor(),
            "elevenlabs": ElevenLabsMonitor(),
            "redis": RedisMonitor(),
            "pinecone": PineconeMonitor(),
            "speechmatics": SpeechmaticsMonitor()
        }
        self._is_running = False
        self._task = None
        
        # Internal global metrics
        self.internal_metrics = {
            "active_conversations": 0,
            "streaming_sessions": 0,
            "total_rag_requests": 0,
            "avg_rag_latency_ms": 0.0,
            "total_tokens_generated": 0
        }

    def start_polling(self):
        """Start the background telemetry loop."""
        if self._is_running:
            return
        self._is_running = True
        self._task = asyncio.create_task(self._poll_loop())
        logger.info("📡 AI Infrastructure Telemetry Engine started")

    def stop_polling(self):
        self._is_running = False
        if self._task:
            self._task.cancel()

    async def _poll_loop(self):
        # Poll every 10 seconds for standard services
        while self._is_running:
            try:
                for monitor in self.monitors.values():
                    monitor.poll_health()
            except Exception as e:
                logger.error(f"Telemetry loop error: {e}")
            await asyncio.sleep(10)

    def get_provider(self, provider_id: str):
        return self.monitors.get(provider_id)

    def get_live_metrics(self) -> Dict[str, Any]:
        """Returns the fully consolidated state of the Command Center instantly."""
        providers = {pid: mon.get_metrics() for pid, mon in self.monitors.items()}
        
        # Calculate global costs
        today_spend = sum(m.get("estimated_cost", 0) for m in providers.values())
        hourly_spend = sum(m.get("estimated_cost", 0) for m in providers.values()) # Simplify for now
        
        # Projected monthly (based on current hourly * 24 * 30, roughly)
        projected_monthly = hourly_spend * 24 * 30
        
        # Aggregate operational status
        down_count = sum(1 for p in providers.values() if p["status"] == "DOWN")
        degraded_count = sum(1 for p in providers.values() if p["status"] == "DEGRADED")
        
        overall_status = "OPERATIONAL"
        if down_count > 0:
            overall_status = f"CRITICAL - {down_count} DOWN"
        elif degraded_count > 0:
            overall_status = f"DEGRADED - {degraded_count} IMPAIRED"

        return {
            "overall_status": overall_status,
            "costs": {
                "today_spend": round(today_spend, 4),
                "hourly_spend": round(hourly_spend, 4),
                "projected_monthly": round(projected_monthly, 2)
            },
            "internal_metrics": self.internal_metrics,
            "providers": providers
        }

# Global Singleton
system_monitor = SystemMonitor()
