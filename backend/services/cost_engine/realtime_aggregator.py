import time
from backend.logger import get_logger

logger = get_logger(__name__)

def get_live_metrics() -> dict:
    """
    Fetch real-time billing metrics from Redis.
    Computes remaining_balance = starting_balance - lifetime_spent.
    Returns unified dict for the SSE dashboard stream.
    """
    from backend.db.redis_client import get_redis
    from backend.config import config

    redis = get_redis()
    now = int(time.time())
    minute_bucket = now // 60
    prev_bucket = minute_bucket - 1
    today_str = time.strftime("%Y-%m-%d")

    # Starting balances from config (set in .env)
    openai_start  = config.OPENAI_STARTING_BALANCE
    claude_start  = config.ANTHROPIC_STARTING_BALANCE

    # Initialise with starting balances visible even when Redis is empty
    metrics = {
        "anthropic": {
            "rpm": 0, "tpm": 0,
            "daily_spend": 0.0,
            "lifetime_spend": 0.0,
            "starting_balance": claude_start,
            "remaining_balance": claude_start,
            "pct_used": 0.0,
            "projected_monthly": 0.0,
            "status": "ok",
        },
        "openai": {
            "rpm": 0, "tpm": 0,
            "daily_spend": 0.0,
            "lifetime_spend": 0.0,
            "starting_balance": openai_start,
            "remaining_balance": openai_start,
            "pct_used": 0.0,
            "projected_monthly": 0.0,
            "status": "ok",
        },
        "google": {
            "rpm": 0, "tpm": 0,
            "daily_spend": 0.0,
            "lifetime_spend": 0.0,
            "starting_balance": 0.0,
            "remaining_balance": 0.0,
            "pct_used": 0.0,
            "projected_monthly": 0.0,
            "status": "ok",
        },
        "total_spend": 0.0,
        "total_projected": 0.0,
        "total_remaining": claude_start + openai_start,
        "total_starting": claude_start + openai_start,
    }

    if not redis:
        return metrics

    try:
        pipeline = redis.pipeline()
        # Current & previous minute RPM/TPM
        pipeline.hgetall(f"tammy:billing:rpm:{minute_bucket}")
        pipeline.hgetall(f"tammy:billing:tpm:{minute_bucket}")
        pipeline.hgetall(f"tammy:billing:rpm:{prev_bucket}")
        pipeline.hgetall(f"tammy:billing:tpm:{prev_bucket}")
        # Daily spend
        pipeline.hgetall(f"tammy:billing:daily_spend:{today_str}")
        # Lifetime spend (no expiry key)
        pipeline.hgetall("tammy:billing:lifetime_spend")

        results = pipeline.execute()
        rpm_cur     = results[0] or {}
        tpm_cur     = results[1] or {}
        rpm_prev    = results[2] or {}
        tpm_prev    = results[3] or {}
        daily_data  = results[4] or {}
        lifetime    = results[5] or {}

        def _merge_int(cur, prev, key):
            return max(int(cur.get(key, 0)), int(prev.get(key, 0)))

        start_map = {
            "anthropic": claude_start,
            "openai": openai_start,
            "google": 0.0,
        }

        total_spend = 0.0
        total_remaining = 0.0

        for provider in ("anthropic", "openai", "google"):
            rpm   = _merge_int(rpm_cur, rpm_prev, provider)
            tpm   = _merge_int(tpm_cur, tpm_prev, provider)
            daily = float(daily_data.get(provider, 0.0))
            life  = float(lifetime.get(provider, 0.0))
            start = start_map[provider]
            remaining = max(0.0, start - life)
            pct_used = round((life / start * 100), 1) if start > 0 else 0.0

            metrics[provider].update({
                "rpm": rpm,
                "tpm": tpm,
                "daily_spend": round(daily, 6),
                "lifetime_spend": round(life, 6),
                "starting_balance": start,
                "remaining_balance": round(remaining, 4),
                "pct_used": pct_used,
                "projected_monthly": round(daily * 30, 4),
                "status": "warn" if pct_used > 80 else "ok",
            })

            total_spend += daily
            total_remaining += remaining

        metrics["total_spend"] = round(total_spend, 6)
        metrics["total_projected"] = round(total_spend * 30, 4)
        metrics["total_remaining"] = round(total_remaining, 4)

    except Exception as e:
        logger.error(f"CostEngine: failed to fetch live metrics from Redis: {e}")

    return metrics
