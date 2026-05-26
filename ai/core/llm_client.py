# llm_client.py
"""
Tammy V2 — OpenAI streaming LLM wrapper.
Yields token chunks for live Gradio streaming responses.
"""

from typing import Generator, List, Dict
import base64
from openai import OpenAI
from anthropic import Anthropic
import google.generativeai as genai

from backend.config import config
from backend.logger import get_logger

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

logger = get_logger(__name__)

_openai_client = None
_anthropic_client = None

def _get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _openai_client

def _get_anthropic_client() -> Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _anthropic_client


def stream_response(
    system_prompt: str,
    context: str,
    question: str,
    history: List[Dict] = None,
    attachments: List[Dict] = None,
    model_override: str = None,
) -> Generator[str, None, None]:
    """
    Stream LLM response token-by-token.
    
    Yields:
        str: Each token chunk as it arrives from the LLM.
    """
    history = history or []

    # ── Try Anthropic First ──
    try:
        messages = []
        for pair in history[-3:]:
            if isinstance(pair, (list, tuple)) and len(pair) == 2:
                user_msg, bot_msg = pair
                if user_msg:
                    messages.append({"role": "user", "content": str(user_msg)})
                if bot_msg:
                    messages.append({"role": "assistant", "content": str(bot_msg)})

        text_part = f"{question}\n\n---\nContext:\n{context}" if context.strip() and context != "(No context available)" else question

        if attachments:
            content_blocks = []
            for att in attachments:
                if att.get("type") == "image":
                    b64 = base64.standard_b64encode(att["data"]).decode("utf-8")
                    content_blocks.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": att["content_type"],
                            "data": b64,
                        }
                    })
            content_blocks.append({"type": "text", "text": text_part})
            messages.append({"role": "user", "content": content_blocks})
        else:
            messages.append({"role": "user", "content": text_part})
        
        client = _get_anthropic_client()
        model_name = model_override if model_override else config.TAMMY_ANTHROPIC_MODEL
        stream = client.messages.create(
            model=model_name,
            max_tokens=config.MAX_RESPONSE_TOKENS,
            temperature=config.TAMMY_TEMPERATURE,
            system=system_prompt,
            messages=messages,
            stream=True
        )
        
        logger.info(f"Connected to Anthropic ({model_name}). Streaming response...")
        for chunk in stream:
            if chunk.type == "content_block_delta" and chunk.delta.type == "text_delta":
                yield chunk.delta.text
                
        return  # End cleanly if Anthropic worked

    except Exception as e:
        logger.warning(f"Anthropic API failed ({e}). Falling back to OpenAI ({config.TAMMY_CHAT_MODEL})...")

    # ── Fallback to OpenAI ──
    try:
        messages = [{"role": "system", "content": system_prompt}]
        for pair in history[-3:]:
            if isinstance(pair, (list, tuple)) and len(pair) == 2:
                user_msg, bot_msg = pair
                if user_msg:
                    messages.append({"role": "user", "content": str(user_msg)})
                if bot_msg:
                    messages.append({"role": "assistant", "content": str(bot_msg)})

        text_part = f"{question}\n\n---\nContext:\n{context}" if context.strip() and context != "(No context available)" else question

        if attachments:
            content_blocks = []
            for att in attachments:
                if att.get("type") == "image":
                    b64 = base64.standard_b64encode(att["data"]).decode("utf-8")
                    data_url = f"data:{att['content_type']};base64,{b64}"
                    content_blocks.append({
                        "type": "image_url",
                        "image_url": {"url": data_url, "detail": "auto"}
                    })
            content_blocks.append({"type": "text", "text": text_part})
            messages.append({"role": "user", "content": content_blocks})
        else:
            messages.append({"role": "user", "content": text_part})

        client = _get_openai_client()
        stream = client.chat.completions.create(
            model=config.TAMMY_CHAT_MODEL,
            messages=messages,
            temperature=config.TAMMY_TEMPERATURE,
            max_tokens=config.MAX_RESPONSE_TOKENS,
            stream=True,
        )

        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
                
        return

    except Exception as e:
        logger.warning(f"OpenAI API failed ({e}). Falling back to Gemini ({config.TAMMY_GEMINI_MODEL})...")

    # ── Fallback to Gemini ──
    try:
        model = genai.GenerativeModel(
            model_name=config.TAMMY_GEMINI_MODEL,
            system_instruction=system_prompt,
        )
        
        contents = []
        for pair in history[-3:]:
            if isinstance(pair, (list, tuple)) and len(pair) == 2:
                user_msg, bot_msg = pair
                if user_msg:
                    contents.append({"role": "user", "parts": [{"text": str(user_msg)}]})
                if bot_msg:
                    contents.append({"role": "model", "parts": [{"text": str(bot_msg)}]})
                    
        text_part = f"{question}\n\n---\nContext:\n{context}" if context.strip() and context != "(No context available)" else question
        
        current_parts = []
        if attachments:
            for att in attachments:
                if att.get("type") == "image":
                    current_parts.append({
                        "inline_data": {
                            "mime_type": att["content_type"],
                            "data": att["data"]
                        }
                    })
        current_parts.append({"text": text_part})
        contents.append({"role": "user", "parts": current_parts})

        response = model.generate_content(
            contents,
            stream=True,
            generation_config=genai.types.GenerationConfig(
                temperature=config.TAMMY_TEMPERATURE,
                max_output_tokens=config.MAX_RESPONSE_TOKENS,
            )
        )

        logger.info(f"Connected to Gemini ({config.TAMMY_GEMINI_MODEL}). Streaming response...")
        for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.error(f"Anthropic, OpenAI, and Gemini all failed: {e}")
        yield "I encountered an issue generating a response. All AI services are currently unavailable. Please try again later."


def get_response(
    system_prompt: str,
    context: str,
    question: str,
    history: List[Dict] = None,
) -> str:
    """Non-streaming version — collects full response and returns it."""
    chunks = list(stream_response(system_prompt, context, question, history))
    return "".join(chunks)


__all__ = ["stream_response", "get_response"]
