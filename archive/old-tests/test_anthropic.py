import sys
from config import config
from anthropic import Anthropic, NotFoundError

client = Anthropic(api_key=config.ANTHROPIC_API_KEY.strip())

models = [
    "claude-3-7-sonnet-20250219",
    "claude-3-5-sonnet-latest",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-haiku-20240307",
    "claude-2.1"
]

for model in models:
    try:
        response = client.messages.create(
            model=model,
            max_tokens=5,
            messages=[{"role": "user", "content": "hi"}]
        )
        print(f"✅ {model} - SUCCESS")
    except NotFoundError as e:
        print(f"❌ {model} - NOT FOUND")
    except Exception as e:
        print(f"⚠️ {model} - OTHER ERROR: {e}")
