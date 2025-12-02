# tammy_ui.py

import gradio as gr
from tammy_rag import ask_tammy  # uses updated RAG with chat history

def tammy_chat(message, history):
    """
    Uses user input and chat history to generate Tammy's response.
    """
    response = ask_tammy(message, history=history)
    return response

title = "Tammy AI"
description = "Ask Tammy questions based on her books, frameworks, and philosophy."

demo = gr.ChatInterface(
    fn=tammy_chat,
    title=title,
    description=description,
    examples=[
        "Summarize the EGG Method in 3 bullet points.",
        "How does Tammy think about clarity?",
        "What is my identity according to Tammy’s philosophy?",
    ],
    markdown=True,
)

if __name__ == "__main__":
    demo.launch(share=True)
