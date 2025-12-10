import gradio as gr
from tammy_rag import ask_tammy

def tammy_chat(message, history):
    # Ensure history is always a list
    if history is None:
        history = []

    # Normalize history to valid pairs
    clean_history = []
    for item in history:
        if isinstance(item, list) and len(item) == 2:
            clean_history.append(item)
        else:
            # Skip invalid entries
            continue
    
    response = ask_tammy(message, history=clean_history)
    return response



title = "Tammy AI"
description = "Ask Tammy anything."

demo = gr.ChatInterface(
    fn=tammy_chat,
    title=title,
    description=description,
)

if __name__ == "__main__":
    demo.launch(share=True)
