import time
from backend.config import config
from backend.services.monitoring.base_monitor import BaseMonitor
from backend.db.pinecone_manager import PineconeManager

class PineconeMonitor(BaseMonitor):
    def __init__(self):
        super().__init__(name="Pinecone", provider_id="pinecone")
        
    def poll_health(self) -> None:
        start = time.time()
        try:
            if config.PINECONE_API_KEY:
                pc = PineconeManager()
                if pc.rag_index or pc.memory_index:
                    idx = pc.rag_index if pc.rag_index else pc.memory_index
                    idx.describe_index_stats()
                    self.latency_ms = (time.time() - start) * 1000
                    self.status = "OPERATIONAL"
                else:
                    self.status = "DOWN"
            else:
                self.status = "DOWN"
        except Exception:
            self.status = "DOWN"
            
        self.last_checked = time.time()
