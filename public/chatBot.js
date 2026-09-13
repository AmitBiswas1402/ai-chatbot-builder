(function () {
  if (window.__aiChatbotLoaded) {
    return;
  }
  window.__aiChatbotLoaded = true;

  // Find script element and ownerId
  const scriptTag =
    document.currentScript ||
    document.querySelector("script[data-owner-id]") ||
    document.querySelector("script[src*='chatBot']");

  const scriptSrc = scriptTag ? scriptTag.src : "";
  let baseOrigin = window.location.origin;
  try {
    if (scriptSrc) {
      baseOrigin = new URL(scriptSrc).origin;
    }
  } catch (e) {}

  const ownerId =
    (scriptTag ? scriptTag.getAttribute("data-owner-id") : null) ||
    new URLSearchParams(window.location.search).get("ownerId") ||
    window.__AI_CHATBOT_OWNER_ID;

  if (!ownerId) {
    console.warn("[AI ChatBot] data-owner-id attribute is missing from the script tag.");
    return;
  }

  const apiUrl = baseOrigin + "/api/chat";
  const settingsUrl = baseOrigin + "/api/settings/get";
  const storageKey = "ai_chatbot_history_" + ownerId;

  let businessInfo = {
    businessName: "Customer Support",
    supportEmail: "",
    knowledge: "",
  };

  // Inject Styles
  const styleEl = document.createElement("style");
  styleEl.id = "ai-chatbot-widget-styles";
  styleEl.textContent = `
    .ai-cb-root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    .ai-cb-root * {
      box-sizing: border-box;
    }
    .ai-cb-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #09090b;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      z-index: 2147483640;
    }
    .ai-cb-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
    }
    .ai-cb-launcher:active {
      transform: scale(0.96);
    }
    .ai-cb-launcher svg {
      width: 26px;
      height: 26px;
      transition: transform 0.2s ease;
    }
    .ai-cb-tooltip {
      position: fixed;
      bottom: 92px;
      right: 24px;
      background: #ffffff;
      color: #18181b;
      padding: 8px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
      border: 1px solid #e4e4e7;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      animation: ai-cb-fade-in 0.3s ease;
      z-index: 2147483640;
      transition: transform 0.15s ease;
    }
    .ai-cb-tooltip:hover {
      transform: translateY(-2px);
    }
    .ai-cb-container {
      position: fixed;
      bottom: 94px;
      right: 24px;
      width: 380px;
      height: 540px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
      border: 1px solid #e4e4e7;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483641;
      transform-origin: bottom right;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0.2s;
    }
    .ai-cb-container.ai-cb-closed {
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .ai-cb-header {
      background: #09090b;
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .ai-cb-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ai-cb-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #27272a, #3f3f46);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #ffffff;
    }
    .ai-cb-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ai-cb-status {
      font-size: 11px;
      color: #a1a1aa;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
    .ai-cb-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
    }
    .ai-cb-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ai-cb-icon-btn {
      background: transparent;
      border: none;
      color: #a1a1aa;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .ai-cb-icon-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }
    .ai-cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .ai-cb-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
      position: relative;
    }
    .ai-cb-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .ai-cb-msg-user {
      align-self: flex-end;
      background: #09090b;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .ai-cb-msg a {
      color: #2563eb;
      text-decoration: underline;
    }
    .ai-cb-msg-user a {
      color: #93c5fd;
    }
    .ai-cb-chips-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .ai-cb-chip {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 11px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .ai-cb-chip:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #0f172a;
    }
    .ai-cb-typing {
      align-self: flex-start;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ai-cb-dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: ai-cb-bounce 1.4s infinite ease-in-out;
    }
    .ai-cb-dot:nth-child(1) { animation-delay: -0.32s; }
    .ai-cb-dot:nth-child(2) { animation-delay: -0.16s; }
    .ai-cb-input-area {
      padding: 12px 14px;
      background: #ffffff;
      border-top: 1px solid #e4e4e7;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ai-cb-input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ai-cb-input {
      flex: 1;
      padding: 10px 14px;
      font-size: 13px;
      border: 1px solid #d4d4d8;
      border-radius: 999px;
      outline: none;
      background: #fafafa;
      color: #18181b;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .ai-cb-input:focus {
      border-color: #18181b;
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1);
    }
    .ai-cb-send {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #09090b;
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.15s ease, transform 0.1s ease;
      flex-shrink: 0;
    }
    .ai-cb-send:hover:not(:disabled) {
      transform: scale(1.05);
    }
    .ai-cb-send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .ai-cb-footer-brand {
      font-size: 10px;
      color: #a1a1aa;
      text-align: center;
    }
    .ai-cb-footer-brand a {
      color: #71717a;
      text-decoration: none;
      font-weight: 500;
    }
    @keyframes ai-cb-bounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }
    @keyframes ai-cb-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 480px) {
      .ai-cb-container {
        width: calc(100vw - 24px);
        right: 12px;
        left: 12px;
        bottom: 84px;
        height: 75vh;
      }
      .ai-cb-launcher {
        bottom: 16px;
        right: 16px;
      }
      .ai-cb-tooltip {
        display: none;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Helper: Format message text (bold, lists, links)
  function formatText(raw) {
    if (!raw) return "";
    let safe = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text**
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text*
    safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // URLs
    safe = safe.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    // Emails
    safe = safe.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>'
    );
    // Line breaks
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  // Create Widget Root
  const root = document.createElement("div");
  root.className = "ai-cb-root";

  // Launcher Button
  const launcher = document.createElement("button");
  launcher.className = "ai-cb-launcher";
  launcher.setAttribute("aria-label", "Open Chat Support");
  launcher.innerHTML = `
    <svg id="ai-cb-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <svg id="ai-cb-icon-close" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  // Greeting Tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "ai-cb-tooltip";
  tooltip.innerHTML = `<span>👋 Need help? Chat with us!</span>`;

  // Chat Container
  const container = document.createElement("div");
  container.className = "ai-cb-container ai-cb-closed";
  container.innerHTML = `
    <div class="ai-cb-header">
      <div class="ai-cb-header-info">
        <div class="ai-cb-avatar" id="ai-cb-avatar">AI</div>
        <div>
          <div class="ai-cb-title" id="ai-cb-title">Customer Support</div>
          <div class="ai-cb-status"><span class="ai-cb-status-dot"></span> Online • Instant Replies</div>
        </div>
      </div>
      <div class="ai-cb-header-actions">
        <button class="ai-cb-icon-btn" id="ai-cb-refresh-btn" title="Clear conversation" aria-label="Clear chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
        <button class="ai-cb-icon-btn" id="ai-cb-close-btn" title="Minimize chat" aria-label="Close chat">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="ai-cb-messages" id="ai-cb-messages"></div>
    <div class="ai-cb-input-area">
      <div class="ai-cb-input-row">
        <input type="text" class="ai-cb-input" id="ai-cb-input" placeholder="Type your message..." autocomplete="off" />
        <button class="ai-cb-send" id="ai-cb-send" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="ai-cb-footer-brand">
        Powered by <a href="${baseOrigin}" target="_blank" rel="noopener">AI ChatBot Builder</a>
      </div>
    </div>
  `;

  root.appendChild(tooltip);
  root.appendChild(container);
  root.appendChild(launcher);
  document.body.appendChild(root);

  // State
  let isOpen = false;
  let isThinking = false;
  let messages = [];

  const msgArea = container.querySelector("#ai-cb-messages");
  const inputEl = container.querySelector("#ai-cb-input");
  const sendBtn = container.querySelector("#ai-cb-send");
  const titleEl = container.querySelector("#ai-cb-title");
  const avatarEl = container.querySelector("#ai-cb-avatar");
  const chatIcon = launcher.querySelector("#ai-cb-icon-chat");
  const closeIcon = launcher.querySelector("#ai-cb-icon-close");

  // Load Conversation History
  try {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) {
      messages = JSON.parse(cached);
    }
  } catch (e) {}

  function saveHistory() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }

  function renderMessages() {
    msgArea.innerHTML = "";
    if (messages.length === 0) {
      const bName = businessInfo.businessName || "our business";
      appendMessageUI(
        "bot",
        `Hi there! 👋 Welcome to ${bName}. How can I assist you today?`
      );
      renderChips();
    } else {
      messages.forEach((m) => {
        appendMessageUI(m.role, m.text);
      });
    }
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function appendMessageUI(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `ai-cb-msg ${role === "user" ? "ai-cb-msg-user" : "ai-cb-msg-bot"}`;
    bubble.innerHTML = formatText(text);
    msgArea.appendChild(bubble);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function renderChips() {
    const chipsWrapper = document.createElement("div");
    chipsWrapper.className = "ai-cb-chips-wrapper";
    const prompts = [
      "What is your return policy?",
      "How can I contact support?",
      "What are your delivery times?",
    ];

    prompts.forEach((prompt) => {
      const chip = document.createElement("button");
      chip.className = "ai-cb-chip";
      chip.textContent = prompt;
      chip.onclick = () => {
        chipsWrapper.remove();
        sendMessage(prompt);
      };
      chipsWrapper.appendChild(chip);
    });

    msgArea.appendChild(chipsWrapper);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "ai-cb-typing";
    typing.id = "ai-cb-typing-indicator";
    typing.innerHTML = `
      <div class="ai-cb-dot"></div>
      <div class="ai-cb-dot"></div>
      <div class="ai-cb-dot"></div>
    `;
    msgArea.appendChild(typing);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function hideTyping() {
    const typing = document.querySelector("#ai-cb-typing-indicator");
    if (typing) typing.remove();
  }

  function toggleChat(open) {
    isOpen = typeof open === "boolean" ? open : !isOpen;
    if (isOpen) {
      container.classList.remove("ai-cb-closed");
      chatIcon.style.display = "none";
      closeIcon.style.display = "block";
      tooltip.style.display = "none";
      setTimeout(() => inputEl.focus(), 150);
    } else {
      container.classList.add("ai-cb-closed");
      chatIcon.style.display = "block";
      closeIcon.style.display = "none";
    }
  }

  launcher.onclick = () => toggleChat();
  tooltip.onclick = () => toggleChat(true);
  container.querySelector("#ai-cb-close-btn").onclick = () => toggleChat(false);

  container.querySelector("#ai-cb-refresh-btn").onclick = () => {
    messages = [];
    sessionStorage.removeItem(storageKey);
    renderMessages();
  };

  async function sendMessage(overrideText) {
    const text = (overrideText || inputEl.value).trim();
    if (!text || isThinking) return;

    // Append user message
    messages.push({ role: "user", text });
    saveHistory();
    appendMessageUI("user", text);
    if (!overrideText) inputEl.value = "";

    isThinking = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, ownerId }),
      });

      const data = await res.json().catch(() => ({}));
      hideTyping();

      const reply =
        data.text ||
        data.reply ||
        data.message ||
        "I'm sorry, I could not retrieve an answer right now. Please try again later.";

      messages.push({ role: "bot", text: reply });
      saveHistory();
      appendMessageUI("bot", reply);
    } catch (err) {
      hideTyping();
      const errorMsg = "Unable to connect to support server. Please check your connection.";
      messages.push({ role: "bot", text: errorMsg });
      appendMessageUI("bot", errorMsg);
    } finally {
      isThinking = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.onclick = () => sendMessage();
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Fetch Business Info
  fetch(settingsUrl + "?ownerId=" + encodeURIComponent(ownerId))
    .then((r) => r.json())
    .then((data) => {
      if (data && data.businessName) {
        businessInfo = data;
        titleEl.textContent = data.businessName;
        avatarEl.textContent = data.businessName.charAt(0).toUpperCase();
      }
      renderMessages();
    })
    .catch(() => {
      renderMessages();
    });
})();
