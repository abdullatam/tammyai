import gradio as gr
from tammy_rag import ask_tammy

def tammy_chat(message, history):
    if history is None:
        history = []

    clean_history = []
    for item in history:
        if isinstance(item, list) and len(item) == 2:
            clean_history.append(item)

    response = ask_tammy(message, history=clean_history)
    clean_history.append([message, response])
    return response, clean_history


with gr.Blocks(css="""
    #tammy-header {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 0.5em;
        color: #4b2e83;
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
""") as demo:

    gr.Markdown("<div id='tammy-header'> Tammy AI<br><small>Your Clarity + Growth Cofounder</small></div>")

    chatbot = gr.Chatbot(label="Tammy Chat", elem_classes=["gr-chatbot"])
    
    with gr.Row():
        msg = gr.Textbox(placeholder="Ask Tammy anything...", label="Your Message", scale=5)
        clear = gr.Button("Clear", scale=1)

    state = gr.State([])

    def respond(message, chat_history):
        response, updated_history = tammy_chat(message, chat_history)
        return updated_history, updated_history, ""


    msg.submit(respond, [msg, state], [chatbot, state, msg])
    clear.click(lambda: ([], [], ""), outputs=[chatbot, state, msg])

# 🚀 Launch app
if __name__ == "__main__":
    demo.launch(share=True)
