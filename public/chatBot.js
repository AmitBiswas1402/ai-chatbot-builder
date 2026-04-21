(function () {
  const apiUrl = "http://localhost:3000/api/chat";

  if (window.__aiChatbotLoaded) {
    return;
  }
  window.__aiChatbotLoaded = true;

  const scriptTag = document.currentScript;
  const ownerId = scriptTag ? scriptTag.getAttribute("data-owner-id") : null;

  if (!ownerId) {
    console.error("Owner ID is required.");
    return;
  }

  const button = document.createElement("button");
  button.innerHTML = `
    <svg width="30" height="30" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M456 80H56c-13.2 0-24 10.8-24 24v272c0 13.2 10.8 24 24 24h80v72l96-72h224c13.2 0 24-10.8 24-24V104c0-13.2-10.8-24-24-24z"/>
    </svg>
  `;

  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
    zIndex: "999999",
  });

  document.body.appendChild(button);

  const box = document.createElement("div");

  Object.assign(box.style, {
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: "320px",
    height: "420px",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
    display: "none",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: "999999",
    fontFamily: "Inter, system-ui, sans-serif",
  });

  // Load Font Awesome once for a better close icon
  if (!document.querySelector('link[data-ai-chatbot-fa="true"]')) {
    const faLink = document.createElement("link");
    faLink.rel = "stylesheet";
    faLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
    faLink.crossOrigin = "anonymous";
    faLink.referrerPolicy = "no-referrer";
    faLink.setAttribute("data-ai-chatbot-fa", "true");
    document.head.appendChild(faLink);
  }

  box.innerHTML = `<div style="
    background: #000;
    color: #fff;
    padding: 12px 14px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    ">
    <span>Customer Support</span>
    <button id="chat-close" aria-label="Close chat" style="
      cursor: pointer;
      font-size: 15px;
      color: #fff;
      background: transparent;
      border: none;
      padding: 4px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    ">
      <i class="fa-solid fa-xmark"></i>
    </button>
    </div>

    <div id="chat-messages" style="
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    "></div>

    <div id="chat-input-container" style="
    padding: 12px;
    background: #f9fafb;
    display: flex;
    gap: 10px;
    align-items: center;
    ">
    <input id="chat-input" type="text" placeholder="Type your message..." style="
    flex: 1;
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #dbe3ea;
    border-radius: 999px;
    outline: none;
    font-size: 13px;
    background: #fff;
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    ">
    <button id="chat-send"
    style="
    width: 42px;
    height: 42px;
    min-width: 42px;
    padding: 0;
    background: linear-gradient(135deg, #111827, #000000);
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
    ">Send</button>
    </div>

    `;

  document.body.appendChild(box);

  button.onclick = () => {
    box.style.display = box.style.display === "none" ? "flex" : "none";
  };

  document.querySelector("#chat-close").onclick = () => {
    box.style.display = "none";
  };

  const input = document.querySelector("#chat-input");
  const sendBtn = document.querySelector("#chat-send");
  const messageArea = document.querySelector("#chat-messages");

  sendBtn.setAttribute("aria-label", "Send message");
  sendBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes ai-chatbot-dot-pulse {
      0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
      40% { opacity: 1; transform: translateY(-2px); }
    }
  `;
  document.head.appendChild(styleEl);

  function addMessage(text, from) {
    const bubble = document.createElement("div");
    bubble.textContent = text;
    Object.assign(bubble.style, {
      maxWidth: "78%",
      padding: "8px 12px",
      borderRadius: "14px",
      fontSize: "13px",
      lineHeight: "1.4",
      marginBottom: "8px",
      alignSelf: from === "user" ? "flex-end" : "flex-start",
      backgroundColor: from === "user" ? "#000" : "#e5e7eb",
      color: from === "user" ? "#fff" : "#111",

      borderTopRightRadius: from === "user" ? "4px" : "14px",
      borderTopLeftRadius: from === "user" ? "14px" : "4px",
    });
    messageArea.appendChild(bubble);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  function showTypingIndicator() {
    const typingBubble = document.createElement("div");
    typingBubble.id = "chat-typing-indicator";
    Object.assign(typingBubble.style, {
      maxWidth: "78%",
      padding: "10px 12px",
      borderRadius: "14px",
      marginBottom: "8px",
      alignSelf: "flex-start",
      backgroundColor: "#e5e7eb",
      borderTopLeftRadius: "4px",
      display: "flex",
      gap: "6px",
      alignItems: "center",
    });

    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: "#6b7280",
        display: "inline-block",
        animation: "ai-chatbot-dot-pulse 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      });
      typingBubble.appendChild(dot);
    }

    messageArea.appendChild(typingBubble);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  function hideTypingIndicator() {
    const typingBubble = document.querySelector("#chat-typing-indicator");
    if (typingBubble) {
      typingBubble.remove();
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    showTypingIndicator();

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          ownerId: ownerId,
        }),
      });

      const data = await response.json().catch(() => ({}));
      hideTypingIndicator();

      if (!response.ok) {
        addMessage(data.error || "Something went wrong.", "bot");
        return;
      }

      const reply = data.text || data.reply || "No response available.";
      addMessage(reply, "bot");
    } catch (error) {
      hideTypingIndicator();
      console.error("Chat request failed:", error);
      addMessage("Unable to connect to server.", "bot");
    }
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  addMessage("Hi! How can I help you today?", "bot");
})();
