# tammy_ui.py
"""
Tammy V2 — Redesigned UI with clearly visible fixed-bottom input bar.
Compatible with Gradio 3.x.
"""

import gradio as gr
from typing import List

from tammy_core import ask_tammy
from memory_manager import clear_short_term
from config import config
from logger import get_logger

logger = get_logger(__name__)

USER_ID = config.DEFAULT_USER_ID

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; font-family: 'Inter', sans-serif !important; }

/* ── PAGE ─────────────────────────────────────── */
.gradio-container {
    background: linear-gradient(145deg, #0d0d1a 0%, #141428 50%, #0d0d1a 100%) !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 100vh;
}

/* Fix Gradio's own wrapper width */
.gradio-container > .main > .wrap { max-width: 100% !important; }

/* ── SIDEBAR ──────────────────────────────────── */
#sidebar {
    background: rgba(20, 18, 44, 0.95) !important;
    border-right: 1px solid rgba(139, 92, 246, 0.15) !important;
    padding: 28px 18px !important;
    min-height: 100vh;
}

/* ── CHAT AREA SCROLLER ───────────────────────── */
#chatbot {
    background: transparent !important;
    border: none !important;
    overflow-y: auto;
}

#chatbot .wrap { padding-bottom: 8px !important; }

/* User bubble */
#chatbot .user .message {
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%) !important;
    color: #fff !important;
    border-radius: 20px 20px 4px 20px !important;
    font-size: 15px !important;
    line-height: 1.65 !important;
    padding: 12px 18px !important;
    box-shadow: 0 4px 24px rgba(124, 58, 237, 0.3) !important;
    max-width: 72% !important;
}
/* Bot bubble */
#chatbot .bot .message {
    background: rgba(255, 255, 255, 0.055) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 20px 20px 20px 4px !important;
    font-size: 15px !important;
    line-height: 1.65 !important;
    padding: 12px 18px !important;
    max-width: 78% !important;
}

/* ── THINKING INDICATOR ───────────────────────── */
#thinking-bar {
    min-height: 22px;
    padding: 0 4px 6px;
    font-size: 13px;
    color: rgba(167, 139, 250, 0.85);
    font-style: italic;
    letter-spacing: 0.2px;
}

/* ── INPUT WRAPPER — the key fix ─────────────── */
#input-wrapper {
    background: rgba(30, 27, 55, 0.97) !important;
    border-top: 1px solid rgba(139, 92, 246, 0.25) !important;
    padding: 16px 20px !important;
    position: sticky !important;
    bottom: 0 !important;
    z-index: 100 !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
}

/* Inner pill — the visible input bar */
#input-pill {
    display: flex !important;
    align-items: center !important;
    background: rgba(255, 255, 255, 0.09) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.16) !important;
    border-radius: 16px !important;
    padding: 6px 8px 6px 18px !important;
    max-width: 900px !important;
    margin: 0 auto !important;
    box-shadow:
        0 0 0 1px rgba(139, 92, 246, 0.08),
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
}

#input-pill:focus-within {
    border-color: rgba(139, 92, 246, 0.5) !important;
    box-shadow:
        0 0 0 3px rgba(139, 92, 246, 0.12),
        0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

/* The actual Gradio textbox inside the pill */
#msg-box {
    flex: 1 !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
#msg-box label { display: none !important; }
#msg-box .wrap { margin: 0 !important; padding: 0 !important; }

#msg-box textarea {
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    color: rgba(255, 255, 255, 0.92) !important;
    font-size: 16px !important;
    line-height: 1.5 !important;
    min-height: 48px !important;
    max-height: 140px !important;
    resize: none !important;
    padding: 10px 0 !important;
    caret-color: #a78bfa !important;
}
#msg-box textarea::placeholder {
    color: rgba(255, 255, 255, 0.38) !important;
    font-size: 15px !important;
}
#msg-box textarea:focus {
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
}

/* The send button inside the pill */
#send-btn {
    flex-shrink: 0 !important;
    margin-left: 8px !important;
}
#send-btn button {
    background: linear-gradient(135deg, #7c3aed, #5b21b6) !important;
    border: none !important;
    border-radius: 12px !important;
    color: #fff !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    padding: 12px 22px !important;
    height: 48px !important;
    min-width: 88px !important;
    cursor: pointer !important;
    letter-spacing: 0.2px !important;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4) !important;
    transition: all 0.18s ease !important;
    white-space: nowrap !important;
}
#send-btn button:hover {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.55) !important;
}
#send-btn button:active { transform: translateY(0) !important; }

/* ── SIDEBAR ELEMENTS ─────────────────────────── */
#clear-btn button {
    width: 100% !important;
    background: rgba(239, 68, 68, 0.08) !important;
    border: 1px solid rgba(239, 68, 68, 0.25) !important;
    color: rgba(239, 68, 68, 0.75) !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    padding: 10px !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
    margin-top: 8px !important;
}
#clear-btn button:hover {
    background: rgba(239, 68, 68, 0.18) !important;
    color: #f87171 !important;
    border-color: rgba(239, 68, 68, 0.4) !important;
}

.info-card {
    background: rgba(139, 92, 246, 0.07);
    border: 1px solid rgba(139, 92, 246, 0.18);
    border-radius: 12px;
    padding: 14px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    margin-bottom: 14px;
}
"""


def create_ui():
    with gr.Blocks(css=CSS, title="Tammy AI — Clarity Partner", theme=gr.themes.Soft()) as demo:

        state = gr.State([])

        with gr.Row(equal_height=False):

            # ── Sidebar ───────────────────────────────────────────────────────
            with gr.Column(scale=1, min_width=250, elem_id="sidebar"):

                gr.HTML("""
                <div style="text-align:center;padding:16px 0 24px">
                    <div style="font-size:54px;filter:drop-shadow(0 0 22px rgba(139,92,246,.7));
                                line-height:1;margin-bottom:10px">✨</div>
                    <div style="font-size:27px;font-weight:700;letter-spacing:-0.5px;
                                background:linear-gradient(135deg,#a78bfa,#ec4899);
                                -webkit-background-clip:text;-webkit-text-fill-color:transparent">
                        Tammy
                    </div>
                    <div style="font-size:11px;color:rgba(255,255,255,.3);
                                text-transform:uppercase;letter-spacing:1.2px;margin-top:4px">
                        AI Clarity Partner
                    </div>
                </div>
                """)

                gr.HTML("""
                <div class="info-card">
                    <b style="color:rgba(255,255,255,.88)">Tammy</b> is your long-term
                    clarity partner — she helps you think clearly, reflect emotionally,
                    and make better decisions while remembering your journey.
                </div>
                """)

                gr.HTML("""
                <div class="info-card">
                    <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.3);
                                text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
                        Status
                    </div>
                    <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
                        <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;
                                     box-shadow:0 0 7px rgba(34,197,94,.8);flex-shrink:0"></span>
                        <span style="font-size:12.5px">AI Engine Online</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:9px">
                        <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;
                                     box-shadow:0 0 7px rgba(34,197,94,.8);flex-shrink:0"></span>
                        <span style="font-size:12.5px">Memory Active</span>
                    </div>
                </div>
                """)

                with gr.Column(elem_id="clear-btn"):
                    clear_btn = gr.Button("🗑  Clear Memory")

            # ── Main Chat ─────────────────────────────────────────────────────
            with gr.Column(scale=4):

                gr.HTML("""
                <div style="padding:16px 24px 14px;
                             border-bottom:1px solid rgba(255,255,255,0.05);
                             background:rgba(255,255,255,0.02)">
                    <div style="font-size:16px;font-weight:600;
                                color:rgba(255,255,255,.85)">
                        Conversation with Tammy
                    </div>
                    <div style="font-size:12px;color:rgba(255,255,255,.3);margin-top:3px">
                        Ask anything — Tammy remembers your journey
                    </div>
                </div>
                """)

                chatbot = gr.Chatbot(
                    elem_id="chatbot",
                    height=460,
                    show_label=False,
                    bubble_full_width=False,
                )

                thinking_bar = gr.HTML(value='<div id="thinking-bar"></div>')

                # ── Visible Input Bar ─────────────────────────────────────────
                with gr.Column(elem_id="input-wrapper"):
                    with gr.Row(elem_id="input-pill", equal_height=True):
                        msg_input = gr.Textbox(
                            placeholder="Talk with Tammy…",
                            show_label=False,
                            elem_id="msg-box",
                            scale=5,
                            lines=1,
                            max_lines=5,
                            container=False,
                        )
                        with gr.Column(elem_id="send-btn", scale=0, min_width=90):
                            send_btn = gr.Button("Send →", min_width=88)

        # ── Handlers ──────────────────────────────────────────────────────────

        def respond(message: str, history: List):
            if not message or not message.strip():
                yield history, history, "", '<div id="thinking-bar"></div>'
                return

            history = history + [[message, None]]
            yield history, history, "", '<div id="thinking-bar">✦ Tammy is thinking…</div>'

            bot_text = ""
            try:
                for token in ask_tammy(message, user_id=USER_ID, history=history[:-1]):
                    bot_text += token
                    history[-1][1] = bot_text
                    yield history, history, "", '<div id="thinking-bar">✦ Tammy is thinking…</div>'
            except Exception as e:
                logger.error(f"Stream error: {e}")
                history[-1][1] = "I encountered an issue. Please try again."

            yield history, history, "", '<div id="thinking-bar"></div>'

        def clear_memory():
            try:
                clear_short_term(USER_ID)
            except Exception as e:
                logger.error(f"Clear error: {e}")
            return [], [], ""

        msg_input.submit(
            respond,
            inputs=[msg_input, state],
            outputs=[chatbot, state, msg_input, thinking_bar],
        )
        send_btn.click(
            respond,
            inputs=[msg_input, state],
            outputs=[chatbot, state, msg_input, thinking_bar],
        )
        clear_btn.click(
            clear_memory,
            outputs=[chatbot, state, msg_input],
        )

    return demo


demo = create_ui()

if __name__ == "__main__":
    logger.info("Starting Tammy V2...")
    demo.queue()  # Required for generator/streaming support
    demo.launch(
        share=config.GRADIO_SHARE,
        server_port=config.GRADIO_SERVER_PORT,
        show_error=True,
    )
