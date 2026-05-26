# voice_input.py
"""
Tammy V2 — Push-to-talk voice input with Speechmatics Batch STT.

Hold SPACE to record, release to transcribe.
Uses Speechmatics Batch API with language: "auto" for automatic
language detection (Arabic, English, or any language).
"""

import io
import sys
import time
import wave
import threading
from typing import Optional

import numpy as np
import sounddevice as sd
import httpx
from pynput import keyboard

from config import config

# ── Constants ────────────────────────────────────────────────
SAMPLE_RATE = config.VOICE_SAMPLE_RATE  # 16000 hz
CHANNELS = 1
DTYPE = np.int16
MAX_DURATION = config.VOICE_MAX_DURATION  # 30 seconds max

SPEECHMATICS_BASE = "https://asr.api.speechmatics.com/v2"
POLL_INTERVAL = 0.5   # seconds between job status checks
POLL_TIMEOUT = 60.0   # max seconds to wait for transcription


def _record_push_to_talk() -> Optional[np.ndarray]:
    """
    Record audio while SPACE is held down.
    Returns numpy array of int16 PCM audio, or None on error.
    """
    frames = []
    recording = False
    space_pressed = threading.Event()
    space_released = threading.Event()
    stream = None

    def on_press(key):
        nonlocal recording
        if key == keyboard.Key.space and not recording:
            recording = True
            space_pressed.set()

    def on_release(key):
        if key == keyboard.Key.space and recording:
            space_released.set()
            return False  # Stop listener

    # Wait for spacebar press
    sys.stdout.write("\r🎤 Hold SPACE to speak...  ")
    sys.stdout.flush()

    listener = keyboard.Listener(on_press=on_press, on_release=on_release)
    listener.start()

    # Block until space is pressed
    space_pressed.wait()

    sys.stdout.write("\r🎤 Recording...            \r")
    sys.stdout.flush()

    # Start audio recording
    def callback(indata, frame_count, time_info, status):
        frames.append(indata.copy())

    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype=DTYPE,
        callback=callback,
        blocksize=1024,
    )
    stream.start()

    # Wait for space release or max duration
    space_released.wait(timeout=MAX_DURATION)

    # Stop recording
    stream.stop()
    stream.close()

    # Ensure listener is cleaned up
    if listener.is_alive():
        listener.stop()

    if not frames:
        return None

    return np.concatenate(frames, axis=0)


def _audio_to_wav_bytes(audio: np.ndarray) -> bytes:
    """Convert numpy int16 audio array to WAV bytes in memory."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # 16-bit = 2 bytes
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio.tobytes())
    buf.seek(0)
    return buf.read()


def _transcribe_speechmatics(wav_bytes: bytes) -> Optional[str]:
    """
    Send WAV audio to Speechmatics Batch API with language: auto.
    Returns transcribed text or None on error.
    """
    api_key = config.SPEECHMATICS_API_KEY
    if not api_key:
        print("⚠️ SPEECHMATICS_API_KEY not set in .env")
        return None

    headers = {"Authorization": f"Bearer {api_key}"}

    config_json = '{"type":"transcription","transcription_config":{"language":"auto"}}'

    # Submit job
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                f"{SPEECHMATICS_BASE}/jobs",
                headers=headers,
                files={
                    "data_file": ("audio.wav", wav_bytes, "audio/wav"),
                    "config": (None, config_json, "application/json"),
                },
            )
            resp.raise_for_status()
            job_id = resp.json().get("id")
            if not job_id:
                print("⚠️ Speechmatics: No job ID returned")
                return None
    except Exception as e:
        print(f"⚠️ Speechmatics submit error: {e}")
        return None

    # Poll for completion
    start = time.time()
    try:
        with httpx.Client(timeout=15.0) as client:
            while time.time() - start < POLL_TIMEOUT:
                resp = client.get(
                    f"{SPEECHMATICS_BASE}/jobs/{job_id}",
                    headers=headers,
                )
                resp.raise_for_status()
                job = resp.json().get("job", {})
                status = job.get("status", "")

                if status == "done":
                    break
                elif status in ("rejected", "deleted"):
                    print(f"⚠️ Speechmatics job {status}")
                    return None

                time.sleep(POLL_INTERVAL)
            else:
                print("⚠️ Speechmatics: Transcription timed out")
                return None

            # Fetch transcript
            resp = client.get(
                f"{SPEECHMATICS_BASE}/jobs/{job_id}/transcript",
                headers=headers,
                params={"format": "txt"},
            )
            resp.raise_for_status()
            transcript = resp.text.strip()
            return transcript if transcript else None

    except Exception as e:
        print(f"⚠️ Speechmatics poll error: {e}")
        return None


def listen() -> Optional[str]:
    """
    Public API: Push-to-talk voice input.

    Displays 🎤 Hold SPACE to speak..., records while held,
    sends to Speechmatics for transcription.

    Returns:
        Transcribed text string, or None if anything fails.
        Caller should fall back to keyboard input on None.
    """
    try:
        audio = _record_push_to_talk()
        if audio is None or len(audio) < SAMPLE_RATE * 0.3:
            # Less than 0.3 seconds of audio — too short
            return None

        sys.stdout.write("\r⏳ Transcribing...         \r")
        sys.stdout.flush()

        wav_bytes = _audio_to_wav_bytes(audio)
        transcript = _transcribe_speechmatics(wav_bytes)

        # Clear the status line
        sys.stdout.write("\r                           \r")
        sys.stdout.flush()

        return transcript

    except Exception as e:
        sys.stdout.write(f"\r⚠️ Voice input error: {e}\n")
        sys.stdout.flush()
        return None


__all__ = ["listen"]
