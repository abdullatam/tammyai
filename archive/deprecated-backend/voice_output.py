# voice_output.py
"""
Tammy V2 — Text-to-Speech output via OpenAI TTS API.

Streams PCM audio chunks directly to PyAudio for instant playback.
Supports interruption via a threading.Event (press SPACE to cut off).

This module is fully modular — only speak() is exported.
Swap TTS providers by changing internals only.
"""

import sys
import threading
from typing import Optional

import pyaudio
from openai import OpenAI

from config import config

# ── TTS Constants ────────────────────────────────────────────
TTS_SAMPLE_RATE = 24000  # OpenAI TTS PCM output rate
TTS_CHANNELS = 1
TTS_CHUNK_SIZE = 4096    # Bytes per chunk for streaming playback

_client = None


def _get_client() -> OpenAI:
    """Lazy-init OpenAI client."""
    global _client
    if _client is None:
        _client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _client


def speak(text: str, interrupt_event: Optional[threading.Event] = None) -> None:
    """
    Public API: Convert text to speech and play it immediately.

    Streams audio from OpenAI TTS API and plays PCM chunks
    through PyAudio as they arrive — no waiting for the full file.

    Args:
        text: The text to speak.
        interrupt_event: Optional threading.Event. If set during playback,
                         audio stops immediately. Used for interrupt-to-speak.
    """
    if not text or not text.strip():
        return

    sys.stdout.write("🔊 Speaking...\n")
    sys.stdout.flush()

    p = None
    stream = None

    try:
        client = _get_client()

        # Initialize PyAudio output
        p = pyaudio.PyAudio()
        stream = p.open(
            format=pyaudio.paInt16,
            channels=TTS_CHANNELS,
            rate=TTS_SAMPLE_RATE,
            output=True,
        )

        # Stream TTS audio
        with client.audio.speech.with_streaming_response.create(
            model=config.TTS_MODEL,
            voice=config.TTS_VOICE,
            input=text,
            response_format="pcm",
        ) as response:
            for chunk in response.iter_bytes(chunk_size=TTS_CHUNK_SIZE):
                # Check for interrupt signal
                if interrupt_event and interrupt_event.is_set():
                    break
                stream.write(chunk)

    except Exception as e:
        sys.stdout.write(f"⚠️ TTS playback error: {e}\n")
        sys.stdout.flush()

    finally:
        # Clean up PyAudio resources
        if stream is not None:
            try:
                stream.stop_stream()
                stream.close()
            except Exception:
                pass
        if p is not None:
            try:
                p.terminate()
            except Exception:
                pass


__all__ = ["speak"]
