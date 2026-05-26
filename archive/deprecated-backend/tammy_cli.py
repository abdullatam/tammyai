#!/usr/bin/env python3
# tammy_cli.py
"""
Tammy V2 — Clean terminal chat interface with Authentication and Sessions.
Supports --voice flag for push-to-talk voice I/O.
"""

import sys
import os
import time
import logging
import argparse

# ── Silence ALL logs and warnings before any import ──────────────────────────
logging.disable(logging.CRITICAL)

import warnings
warnings.filterwarnings("ignore")

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tammy_core import ask_tammy
from memory_manager import clear_short_term, _col
from identity import get_user_id, set_active_user_id, get_session_id, set_active_session_id
from auth import login_user, register_user

HISTORY: list = []
DIVIDER = "─" * 42


def parse_args():
    parser = argparse.ArgumentParser(description="Tammy AI — CLI Chat")
    parser.add_argument(
        "--voice",
        action="store_true",
        help="Enable voice mode (push-to-talk with Speechmatics STT + OpenAI TTS)",
    )
    return parser.parse_args()


def print_banner(voice_mode: bool = False):
    mode_label = " (🎤 Voice Mode)" if voice_mode else ""
    print(f"\n✨ Tammy AI  —  Your Clarity Partner{mode_label}")
    print(f"{DIVIDER}")
    if voice_mode:
        print(f"  Hold SPACE to speak, release to send.")
        print(f"  Press SPACE while Tammy speaks to interrupt.")
    else:
        print(f"  Type your message and press Enter.")
    print(f"  /clear — reset memory   /quit — exit")
    print(f"{DIVIDER}\n")


def stream_tammy(question: str) -> str:
    """Stream response, print tokens live, return full text."""
    sys.stdout.write("Tammy: ")
    sys.stdout.flush()

    full = []
    try:
        for token in ask_tammy(question, history=HISTORY):
            sys.stdout.write(token)
            sys.stdout.flush()
            full.append(token)
    except KeyboardInterrupt:
        pass

    sys.stdout.write("\n")
    sys.stdout.flush()
    return "".join(full)


def handle_auth() -> bool:
    """Handles the Login / Register flow. Returns True if authenticated."""
    while True:
        print("\nWelcome to Tammy AI.")
        print("1. Login")
        print("2. Register")
        print("3. Exit")
        
        choice = input("Select an option (1-3): ").strip()
        
        if choice == '1':
            username = input("Username: ").strip()
            password = input("Password: ").strip()
            user_id = login_user(username, password)
            if user_id:
                set_active_user_id(user_id)
                print(f"\nWelcome back, {username}!")
                return True
            else:
                print("Invalid username or password.")
                
        elif choice == '2':
            username = input("Create username: ").strip()
            password = input("Create password: ").strip()
            if not username or not password:
                print("Username and password cannot be empty.")
                continue
            user_doc = register_user(username, password)
            if user_doc:
                set_active_user_id(user_doc["_id"])
                print(f"\nRegistration successful! Welcome, {username}!")
                return True
            else:
                print("Username already exists or registration failed.")
                
        elif choice == '3' or choice.lower() in ('quit', 'exit'):
            print("\nGoodbye!\n")
            sys.exit(0)
        else:
            print("Invalid option.")


def handle_sessions():
    """Handles displaying and selecting/creating sessions."""
    user_id = get_user_id()
    col = _col("sessions")
    
    sessions = []
    if col is not None:
        sessions = list(col.find({"user_id": user_id}).sort("updated_at", -1))
        
    print("\nYour Sessions:")
    for i, s in enumerate(sessions):
        name = s.get("session_name", "Session")
        print(f"{i+1}. {name}")
    
    create_idx = len(sessions) + 1
    print(f"{create_idx}. Create new session")
    
    while True:
        choice = input(f"Select a session (1-{create_idx}): ").strip()
        if not choice.isdigit():
            continue
        idx = int(choice)
        
        if 1 <= idx <= len(sessions):
            # Existing session
            s_id = str(sessions[idx-1]["_id"])
            set_active_session_id(s_id)
            print(f"\nResuming session: {sessions[idx-1].get('session_name', 'Session')}")
            break
            
        elif idx == create_idx:
            # Generate a new session ID
            import hashlib
            new_s_id = hashlib.md5(f"{user_id}{time.time()}".encode()).hexdigest()[:24]
            set_active_session_id(new_s_id)
            print("\nStarted a new session.")
            break
        else:
            print("Invalid selection.")


def main():
    args = parse_args()
    voice_mode = args.voice

    # Conditionally import voice modules
    voice_input = None
    voice_output = None
    if voice_mode:
        try:
            import voice_input as _vi
            import voice_output as _vo
            voice_input = _vi
            voice_output = _vo
        except ImportError as e:
            print(f"⚠️ Voice dependencies missing: {e}")
            print("Install with: pip install sounddevice numpy pyaudio httpx pynput")
            print("Falling back to text mode.\n")
            voice_mode = False

    try:
        if not handle_auth():
            return
        handle_sessions()
    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!\n")
        return
        
    print_banner(voice_mode)

    while True:
        user_input = None

        # ── Get input ──────────────────────────────────────
        if voice_mode and voice_input:
            try:
                user_input = voice_input.listen()
                if user_input is None:
                    print("⚠️ Voice input failed, falling back to text.")
                    try:
                        sys.stdout.write("You: ")
                        sys.stdout.flush()
                        user_input = input().strip()
                    except (KeyboardInterrupt, EOFError):
                        print("\nGoodbye!\n")
                        break
                else:
                    print(f"You (voice): {user_input}")
            except KeyboardInterrupt:
                print("\nGoodbye!\n")
                break
        else:
            try:
                sys.stdout.write("You: ")
                sys.stdout.flush()
                user_input = input().strip()
            except (KeyboardInterrupt, EOFError):
                print("\nGoodbye!\n")
                break

        if not user_input:
            continue

        if user_input.lower() in ("/quit", "/exit", "quit", "exit"):
            print("\nGoodbye!\n")
            break

        if user_input.lower() == "/clear":
            clear_short_term(get_user_id())
            HISTORY.clear()
            print("Memory cleared for this session.\n")
            continue

        # ── Get Tammy's response ───────────────────────────
        sys.stdout.write("⏳ Thinking...\n") if voice_mode else None
        response = stream_tammy(user_input)
        HISTORY.append([user_input, response])

        # ── Voice output with interrupt support ────────────
        if voice_mode and voice_output:
            import threading
            from pynput import keyboard as kb

            interrupt = threading.Event()

            # Start TTS playback in a thread
            tts_thread = threading.Thread(
                target=voice_output.speak,
                args=(response, interrupt),
                daemon=True,
            )
            tts_thread.start()

            # Monitor for spacebar press during playback
            def on_press_interrupt(key):
                if key == kb.Key.space:
                    interrupt.set()
                    return False  # Stop listener

            try:
                interrupt_listener = kb.Listener(on_press=on_press_interrupt)
                interrupt_listener.start()
                tts_thread.join()
                if interrupt_listener.is_alive():
                    interrupt_listener.stop()
            except Exception:
                tts_thread.join()

        print()


if __name__ == "__main__":
    main()
