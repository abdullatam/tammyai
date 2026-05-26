"""
Centralized registry for token and request costs across LLM providers.
Costs are specified per 1,000,000 tokens for easy reading, or per second/minute for audio.
"""

PRICING_REGISTRY = {
    # Anthropic
    "claude-3-5-sonnet-20241022": {
        "provider": "anthropic",
        "input_per_million": 3.00,
        "output_per_million": 15.00,
        "cache_read_per_million": 0.30,
        "cache_write_per_million": 3.75,
    },
    "claude-3-haiku-20240307": {
        "provider": "anthropic",
        "input_per_million": 0.25,
        "output_per_million": 1.25,
        "cache_read_per_million": 0.025,
        "cache_write_per_million": 0.30,
    },
    "claude-haiku-4-5-20251001": {
        "provider": "anthropic",
        "input_per_million": 0.80,
        "output_per_million": 4.00,
        "cache_read_per_million": 0.08,
        "cache_write_per_million": 1.00,
    },
    "claude-3-5-haiku-20241022": {
        "provider": "anthropic",
        "input_per_million": 0.80,
        "output_per_million": 4.00,
        "cache_read_per_million": 0.08,
        "cache_write_per_million": 1.00,
    },

    # ── Claude 4 series (2025) ────────────────────────────────────────────────
    "claude-sonnet-4-20250514": {
        "provider": "anthropic",
        "input_per_million": 3.00,
        "output_per_million": 15.00,
        "cache_read_per_million": 0.30,
        "cache_write_per_million": 3.75,
    },
    "claude-sonnet-4-5": {
        "provider": "anthropic",
        "input_per_million": 3.00,
        "output_per_million": 15.00,
        "cache_read_per_million": 0.30,
        "cache_write_per_million": 3.75,
    },
    "claude-sonnet-4-5-20251001": {
        "provider": "anthropic",
        "input_per_million": 3.00,
        "output_per_million": 15.00,
        "cache_read_per_million": 0.30,
        "cache_write_per_million": 3.75,
    },
    "claude-haiku-4-5": {
        "provider": "anthropic",
        "input_per_million": 0.80,
        "output_per_million": 4.00,
        "cache_read_per_million": 0.08,
        "cache_write_per_million": 1.00,
    },
    "claude-haiku-4-20250514": {
        "provider": "anthropic",
        "input_per_million": 0.80,
        "output_per_million": 4.00,
        "cache_read_per_million": 0.08,
        "cache_write_per_million": 1.00,
    },
    "claude-opus-4-20250514": {
        "provider": "anthropic",
        "input_per_million": 15.00,
        "output_per_million": 75.00,
        "cache_read_per_million": 1.50,
        "cache_write_per_million": 18.75,
    },

    # OpenAI
    "gpt-4o": {
        "provider": "openai",
        "input_per_million": 2.50,
        "output_per_million": 10.00,
        "cache_read_per_million": 1.25,
    },
    "gpt-4o-mini": {
        "provider": "openai",
        "input_per_million": 0.15,
        "output_per_million": 0.60,
        "cache_read_per_million": 0.075,
    },
    "whisper-1": {
        "provider": "openai",
        "type": "audio",
        "cost_per_minute": 0.006, # $0.006 per minute
    },
    "tts-1": {
        "provider": "openai",
        "type": "audio",
        "cost_per_million_chars": 15.00,
    },
    "tts-1-hd": {
        "provider": "openai",
        "type": "audio",
        "cost_per_million_chars": 30.00,
    },
    
    # Gemini
    "gemini-1.5-flash": {
        "provider": "google",
        "input_per_million": 0.075, # prompts <128k
        "output_per_million": 0.30,
        "cache_read_per_million": 0.01875,
    },
    "gemini-1.5-pro": {
        "provider": "google",
        "input_per_million": 1.25, # prompts <128k
        "output_per_million": 5.00,
        "cache_read_per_million": 0.3125,
    },
}

def calculate_cost(model: str, usage: dict) -> float:
    """
    Calculate the total cost of a request based on usage dictionary.
    Usage expects:
      - input_tokens
      - output_tokens
      - cached_tokens (or cache_read_tokens)
      - cache_write_tokens (anthropic)
      - audio_minutes (whisper)
      - text_chars (tts)
    """
    # Normalize model names
    normalized_model = model.lower().strip()
    
    # Simple prefix matching if exact model not found
    matched_pricing = None
    if normalized_model in PRICING_REGISTRY:
        matched_pricing = PRICING_REGISTRY[normalized_model]
    else:
        for k in PRICING_REGISTRY:
            if normalized_model.startswith(k):
                matched_pricing = PRICING_REGISTRY[k]
                break
                
    if not matched_pricing:
        # Default to a safe baseline cost (gpt-4o-mini tier) to avoid zeros
        matched_pricing = {
            "input_per_million": 0.15,
            "output_per_million": 0.60,
            "cache_read_per_million": 0.0,
            "cache_write_per_million": 0.0
        }
        
    cost = 0.0
    
    if matched_pricing.get("type") == "audio":
        if "audio_minutes" in usage and "cost_per_minute" in matched_pricing:
            cost += usage["audio_minutes"] * matched_pricing["cost_per_minute"]
        elif "text_chars" in usage and "cost_per_million_chars" in matched_pricing:
            cost += (usage["text_chars"] / 1000000.0) * matched_pricing["cost_per_million_chars"]
        return cost
        
    # Standard Token Logic
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cache_read = usage.get("cache_read_tokens", usage.get("cached_tokens", 0))
    cache_write = usage.get("cache_write_tokens", 0)
    
    # Subtract cached tokens from input tokens if provider includes them in total input
    # (Usually Anthropic input_tokens includes cache reads, so we don't double charge)
    # Actually, Anthropic separates `cache_creation_input_tokens`, `cache_read_input_tokens`.
    
    if matched_pricing.get("provider") == "anthropic":
        input_cost = (input_tokens / 1_000_000.0) * matched_pricing.get("input_per_million", 0)
        output_cost = (output_tokens / 1_000_000.0) * matched_pricing.get("output_per_million", 0)
        read_cost = (cache_read / 1_000_000.0) * matched_pricing.get("cache_read_per_million", 0)
        write_cost = (cache_write / 1_000_000.0) * matched_pricing.get("cache_write_per_million", 0)
        cost = input_cost + output_cost + read_cost + write_cost
    else:
        # OpenAI style: prompt_tokens (often includes cached), completion_tokens
        # OpenAI discounts cached tokens.
        input_cost = (input_tokens / 1_000_000.0) * matched_pricing.get("input_per_million", 0)
        output_cost = (output_tokens / 1_000_000.0) * matched_pricing.get("output_per_million", 0)
        read_cost = (cache_read / 1_000_000.0) * matched_pricing.get("cache_read_per_million", 0)
        cost = input_cost + output_cost + read_cost
        
    return cost
