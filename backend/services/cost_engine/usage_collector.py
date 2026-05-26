import time
import threading
from backend.logger import get_logger
from backend.services.cost_engine.pricing_registry import calculate_cost

logger = get_logger(__name__)

# ── Thread-safe queue for background Redis writes ──────────────────────────────
# Using a threading.Queue so this works from both sync generators (Gradio
# thread pool) AND async FastAPI handlers — asyncio.Queue only works inside
# a running event loop, which is NOT available in sync generators.
import queue as _queue
_telemetry_queue = _queue.Queue(maxsize=10_000)
_worker_thread = None
_worker_lock = threading.Lock()


def _telemetry_worker():
    """Daemon thread: drain the queue and flush events to Redis + MongoDB."""
    logger.info("CostEngine: Telemetry worker thread started.")

    from backend.db.redis_client import get_redis
    from backend.db.mongodb_client import _mongodb_client

    redis = get_redis()
    while True:
        try:
            event = _telemetry_queue.get(timeout=2)
        except _queue.Empty:
            continue

        if event is None:
            break  # poison pill — graceful shutdown

        provider = event.get("provider", "unknown")
        tokens = event.get("input_tokens", 0) + event.get("output_tokens", 0)
        cost = event.get("cost", 0.0)
        ts = int(event.get("timestamp", time.time()))
        minute_bucket = ts // 60
        today_str = time.strftime("%Y-%m-%d", time.gmtime(ts))

        # ── Redis real-time counters ──────────────────────────────────────────
        if get_redis():
            try:
                pipeline = get_redis().pipeline()

                # requests per minute
                pipeline.hincrby(f"tammy:billing:rpm:{minute_bucket}", provider, 1)
                pipeline.expire(f"tammy:billing:rpm:{minute_bucket}", 3600)

                # tokens per minute
                pipeline.hincrby(f"tammy:billing:tpm:{minute_bucket}", provider, tokens)
                pipeline.expire(f"tammy:billing:tpm:{minute_bucket}", 3600)

                # daily cumulative spend (float precision)
                pipeline.hincrbyfloat(f"tammy:billing:daily_spend:{today_str}", provider, cost)
                pipeline.expire(f"tammy:billing:daily_spend:{today_str}", 86400 * 32)

                # daily request count
                pipeline.hincrby(f"tammy:billing:daily_reqs:{today_str}", provider, 1)
                pipeline.expire(f"tammy:billing:daily_reqs:{today_str}", 86400 * 32)

                # ── Lifetime spend (no expiry) — used for remaining balance ──
                # Key persists forever so remaining = starting_balance - lifetime
                pipeline.hincrbyfloat("tammy:billing:lifetime_spend", provider, cost)

                pipeline.execute()
                logger.debug(
                    f"CostEngine: recorded {provider} cost=${cost:.6f} "
                    f"tokens={tokens} lifetime_key=tammy:billing:lifetime_spend"
                )
            except Exception as e:
                logger.error(f"CostEngine: Redis pipeline failed: {e}")


        # ── MongoDB persistent storage ────────────────────────────────────────
        if _mongodb_client and _mongodb_client._db is not None:
            try:
                _mongodb_client._db["usage_telemetry"].insert_one(event)
            except Exception as e:
                logger.error(f"CostEngine: MongoDB insert failed: {e}")

        _telemetry_queue.task_done()


def _ensure_worker():
    """Start the background worker thread if it isn't running."""
    global _worker_thread
    with _worker_lock:
        if _worker_thread is None or not _worker_thread.is_alive():
            _worker_thread = threading.Thread(
                target=_telemetry_worker,
                name="tammy-cost-engine",
                daemon=True,
            )
            _worker_thread.start()
            logger.info("CostEngine: Worker thread (re)started.")


def log_request(
    provider: str,
    model: str,
    input_tokens: int = 0,
    output_tokens: int = 0,
    cached_tokens: int = 0,
    cache_write_tokens: int = 0,
    audio_minutes: float = 0.0,
    text_chars: int = 0,
    latency_ms: int = 0,
    request_type: str = "chat",
    user_id: str = None,
    session_id: str = None,
    success: bool = True,
):
    """
    Public entry point — fire-and-forget cost telemetry.
    Safe to call from sync generators, async handlers, or threads.
    Never blocks the caller.
    """
    usage_dict = {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cached_tokens": cached_tokens,
        "cache_write_tokens": cache_write_tokens,
        "audio_minutes": audio_minutes,
        "text_chars": text_chars,
    }
    cost = calculate_cost(model, usage_dict)

    event = {
        "provider": provider,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cached_tokens": cached_tokens,
        "cache_write_tokens": cache_write_tokens,
        "audio_minutes": audio_minutes,
        "text_chars": text_chars,
        "cost": cost,
        "latency_ms": latency_ms,
        "request_type": request_type,
        "user_id": user_id,
        "session_id": session_id,
        "success": success,
        "timestamp": time.time(),
    }

    _ensure_worker()

    try:
        _telemetry_queue.put_nowait(event)
    except _queue.Full:
        logger.warning("CostEngine: telemetry queue full — dropping event.")
    except Exception as e:
        logger.error(f"CostEngine: Failed to enqueue telemetry: {e}")
