# tammy_ui.py
"""
Gradio UI for Tammy AI with comprehensive error handling.
"""

import gradio as gr
from typing import List, Tuple, Optional

from tammy_rag import ask_tammy
from config import config
from logger import get_logger
from constants import ERROR_GENERIC

logger = get_logger(__name__)


def tammy_chat(message: str, history: Optional[List] = None) -> Tuple[str, List]:
    """
    Process a chat message and return response with updated history.
    
    Args:
        message: User's message
        history: Conversation history from Gradio
    
    Returns:
        Tuple of (response, updated_history)
    """
    if not message or not message.strip():
        return "Please enter a message.", history or []
    
    if history is None:
        history = []
    
    try:
        # No need to clean history here - ask_tammy handles it
        response = ask_tammy(
            question=message,
            user_id=config.DEFAULT_USER_ID,
            history=history
        )
        
        # Update history
        updated_history = history + [[message, response]]
        
        return response, updated_history
    
    except Exception as e:
        logger.error(f"Error in tammy_chat: {e}", exc_info=True)
        error_msg = "I apologize, but I encountered an error. Please try again."
        return error_msg, history


def create_ui():
    """Create and configure the Gradio UI."""
    
    css = """
    #tammy-header {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 0.5em;
        color: #4b2e83;
        text-align: center;
    }
    .gr-textbox {
        font-size: 16px;
    }
    .gr-button {
        background-color: #4b2e83;
        color: white;
    }
    .gr-button:hover {
        background-color: #3b256c;
    }
    .gr-chatbot {
        min-height: 400px;
        border: 1px solid #ddd;
        border-radius: 8px;
    }
    #clear-btn {
        background-color: #dc3545;
    }
    #clear-btn:hover {
        background-color: #c82333;
    }
    """
    
    with gr.Blocks(css=css, title="Tammy AI") as demo:
        
        gr.Markdown(
            "<div id='tammy-header'>✨ Tammy AI<br>"
            "<small>Your Clarity + Growth Cofounder</small></div>"
        )
        
        chatbot = gr.Chatbot(
            label="Tammy Chat",
            elem_classes=["gr-chatbot"],
            height=500
        )
        
        with gr.Row():
            msg = gr.Textbox(
                placeholder="Ask Tammy anything...",
                label="Your Message",
                scale=5,
                lines=1
            )
            clear = gr.Button("Clear", scale=1, elem_id="clear-btn")
        
        state = gr.State([])
        
        def respond(message: str, chat_history: List) -> Tuple[List, List, str]:
            """
            Handle message submission.
            
            Args:
                message: User's input message
                chat_history: Current conversation history
            
            Returns:
                Tuple of (updated_chatbot_display, updated_state, cleared_textbox)
            """
            if not message.strip():
                return chat_history, chat_history, ""
            
            try:
                response, updated_history = tammy_chat(message, chat_history)
                # Return updated history for both chatbot display and state
                return updated_history, updated_history, ""
            except Exception as e:
                logger.error(f"Error in respond: {e}", exc_info=True)
                # Return error without updating history
                error_history = chat_history + [[message, ERROR_GENERIC]]
                return error_history, chat_history, ""
        
        def clear_chat() -> Tuple[List, List, str]:
            """Clear the chat history."""
            logger.info("Chat cleared by user")
            return [], [], ""
        
        # Connect events
        msg.submit(respond, inputs=[msg, state], outputs=[chatbot, state, msg])
        clear.click(clear_chat, outputs=[chatbot, state, msg])
    
    return demo


# Create the demo
demo = create_ui()


# 🚀 Launch app
if __name__ == "__main__":
    logger.info("Starting Tammy AI Gradio interface...")
    demo.launch(
        share=config.GRADIO_SHARE,
        server_port=config.GRADIO_SERVER_PORT,
        show_error=True
    )
