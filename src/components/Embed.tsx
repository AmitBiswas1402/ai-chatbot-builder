"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  IoChatbubbleSharp,
  IoSend,
  IoClose,
  IoRefresh,
  IoCheckmark,
  IoCopyOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoDownloadOutline,
  IoSparkles,
} from "react-icons/io5";

interface SettingData {
  businessName?: string;
  supportEmail?: string;
  knowledge?: string;
}

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

const Embed = ({ ownerId }: { ownerId: string }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "share">("html");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [isLiveFloating, setIsLiveFloating] = useState(false);

  // App Origin Detection
  const [appUrl, setAppUrl] = useState("http://localhost:3000");

  // Settings State
  const [settings, setSettings] = useState<SettingData>({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  // In-Preview Chat State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  // Fetch Business Settings on Mount
  useEffect(() => {
    if (!ownerId) {
      setLoadingSettings(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings/get?ownerId=${encodeURIComponent(ownerId)}`);
        const data = await res.json();
        setSettings(data || {});

        const bName = data.businessName?.trim() || "Our Business";
        setMessages([
          {
            role: "bot",
            text: `Hi there! 👋 Welcome to ${bName}. How can I help you today?`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [ownerId]);

  // Auto-scroll preview messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle Send in Preview
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isThinking) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = { role: "user", text: textToSend, time: currentTime };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, ownerId }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText =
        data.text ||
        data.reply ||
        data.message ||
        "I'm sorry, I could not retrieve an answer right now. Please try again later.";

      const botMessage: Message = {
        role: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        role: "bot",
        text: "Unable to connect to the assistant server. Please check your connection.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const resetChat = () => {
    const bName = settings.businessName?.trim() || "Our Business";
    setMessages([
      {
        role: "bot",
        text: `Hi there! 👋 Welcome to ${bName}. How can I help you today?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Embed Snippets
  const htmlCode = `<!-- AI ChatBot Widget -->
<script 
  src="${appUrl}/chatBot.js" 
  data-owner-id="${ownerId || "YOUR_OWNER_ID"}"
  async>
</script>`;

  const reactCode = `import Script from "next/script";

export default function ChatWidget() {
  return (
    <Script
      src="${appUrl}/chatBot.js"
      data-owner-id="${ownerId || "YOUR_OWNER_ID"}"
      strategy="lazyOnload"
    />
  );
}`;

  const shareUrl = `${appUrl}/chatBot.js`;

  const currentSnippet =
    activeTab === "html" ? htmlCode : activeTab === "react" ? reactCode : htmlCode;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  // Download Demo HTML File
  const handleDownloadDemo = () => {
    const bName = settings.businessName || "My Store";
    const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bName} - AI Chatbot Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background: #09090b;
      color: #ffffff;
      padding: 18px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hero {
      max-width: 800px;
      margin: 80px auto;
      text-align: center;
      padding: 0 20px;
    }
    .hero h1 {
      font-size: 38px;
      margin-bottom: 16px;
    }
    .hero p {
      font-size: 18px;
      color: #64748b;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: #e2e8f0;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <header>
    <div style="font-weight: bold; font-size: 18px;">${bName}</div>
    <div style="font-size: 14px; color: #94a3b8;">Standalone Embed Test</div>
  </header>

  <div class="hero">
    <div class="badge">🚀 Live Chatbot Test Site</div>
    <h1>Welcome to ${bName}</h1>
    <p>
      Look at the bottom right corner of your screen! The AI customer support widget has been injected and is ready to answer questions about your products and policies in real time.
    </p>
  </div>

  <!-- AI ChatBot Builder Embed Script -->
  <script src="${appUrl}/chatBot.js" data-owner-id="${ownerId}"></script>
</body>
</html>`;

    const blob = new Blob([demoHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatbot-demo-${ownerId.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mount Floating Script for "In-Page Floating Bot" toggle
  useEffect(() => {
    if (!isLiveFloating || !ownerId) return;

    const existing = document.getElementById("in-page-live-widget");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = "in-page-live-widget";
    script.src = `${appUrl}/chatBot.js`;
    script.setAttribute("data-owner-id", ownerId);
    document.body.appendChild(script);

    return () => {
      const widgetRoots = document.querySelectorAll(".ai-cb-root, #ai-chatbot-widget-styles");
      widgetRoots.forEach((el) => el.remove());
      const s = document.getElementById("in-page-live-widget");
      if (s) s.remove();
      // @ts-ignore
      delete window.__aiChatbotLoaded;
    };
  }, [isLiveFloating, ownerId, appUrl]);

  const hasKnowledge = Boolean(settings.knowledge && settings.knowledge.trim().length > 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-zinc-100 text-zinc-900 pb-20">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="text-lg font-bold tracking-tight">
              AI
              <span className="text-zinc-400"> ChatBot</span>
              <span className="text-black"> Builder</span>
            </div>
            <span className="hidden sm:inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
              Embed & Test Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50 shadow-xs"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Status / Knowledge Readiness Banner */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  hasKnowledge ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                <IoSparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900">
                    {settings.businessName || "Your Chatbot"}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      hasKnowledge
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {hasKnowledge ? "🟢 Knowledge Base Active" : "⚠️ Needs Knowledge Setup"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {hasKnowledge
                    ? `Trained with ${settings.knowledge?.length} characters of business knowledge. Test the live responses below!`
                    : "No knowledge base configured yet. Add your policies and FAQs in the Dashboard to enable custom answers."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!hasKnowledge && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  Configure Knowledge
                </button>
              )}
              <button
                onClick={() => setIsLiveFloating(!isLiveFloating)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  isLiveFloating
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {isLiveFloating ? "✓ Floating Widget Active on Screen" : "Launch Floating Widget on this Screen"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Left (Embed Code) / Right (Interactive Preview Studio) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Embed Code & Instructions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl shadow-zinc-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Embed Code</h2>
                  <p className="text-xs text-zinc-500">Copy and paste into your website</p>
                </div>

                <div className="flex rounded-lg bg-zinc-100 p-0.5">
                  <button
                    onClick={() => setActiveTab("html")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      activeTab === "html" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setActiveTab("react")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      activeTab === "react" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"
                    }`}
                  >
                    React/Next
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-400">
                  <span>{activeTab === "html" ? "index.html" : "ChatWidget.jsx"}</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <IoCheckmark className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <IoCopyOutline />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto p-4 font-mono text-xs leading-5 text-zinc-300">
                  {currentSnippet}
                </pre>
              </div>

              {/* One-Click Standalone Demo Download */}
              <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col gap-3">
                <button
                  onClick={handleDownloadDemo}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800 shadow-sm"
                >
                  <IoDownloadOutline className="text-base" />
                  Download Standalone Demo HTML File
                </button>
                <p className="text-center text-[11px] text-zinc-400">
                  Downloads a ready-to-run demo website file. Double click it to test your bot locally in Chrome or Edge!
                </p>
              </div>

              {/* Step by step guide */}
              <div className="mt-6 border-t border-zinc-100 pt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  How it works
                </h4>
                <ol className="space-y-3 text-xs text-zinc-600">
                  <li className="flex gap-2.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-700 text-[10px]">
                      1
                    </span>
                    <span>Copy the script snippet above.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-700 text-[10px]">
                      2
                    </span>
                    <span>
                      Paste it before the closing <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">&lt;/body&gt;</code> tag of any web page.
                    </span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-700 text-[10px]">
                      3
                    </span>
                    <span>
                      The floating customer support launcher will automatically render and start answering visitor questions!
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Preview Studio */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Live Interactive Preview</h2>
                <p className="text-xs text-zinc-500">
                  Test questions and verify your chatbot in real time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  title="Reset conversation"
                  className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition"
                >
                  <IoRefresh />
                  <span>Reset Chat</span>
                </button>
                <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
                  <button
                    onClick={() => setDeviceMode("desktop")}
                    className={`rounded p-1.5 text-xs transition ${
                      deviceMode === "desktop" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
                    }`}
                    title="Desktop Preview"
                  >
                    <IoDesktopOutline className="text-sm" />
                  </button>
                  <button
                    onClick={() => setDeviceMode("mobile")}
                    className={`rounded p-1.5 text-xs transition ${
                      deviceMode === "mobile" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
                    }`}
                    title="Mobile Preview"
                  >
                    <IoPhonePortraitOutline className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Website Frame */}
            <div
              className={`mx-auto w-full overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-2xl transition-all duration-300 ${
                deviceMode === "mobile" ? "max-w-[390px]" : "max-w-full"
              }`}
            >
              {/* Browser Window Header */}
              <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-xs text-zinc-500 shadow-xs">
                  <span className="text-zinc-400">🔒</span>
                  <span>your-website.com</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Website Mock Background Content */}
              <div className="relative flex h-[580px] flex-col overflow-hidden bg-zinc-50">
                {/* Simulated Store Navigation */}
                <div className="flex h-12 items-center justify-between border-b border-zinc-200/70 bg-white px-6">
                  <div className="font-bold text-sm text-zinc-800">
                    {settings.businessName || "Your Store"}
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <span>Products</span>
                    <span>Pricing</span>
                    <span>Support</span>
                  </div>
                </div>

                {/* Simulated Hero Banner */}
                <div className="p-8 text-center">
                  <span className="rounded-full bg-zinc-200/60 px-3 py-1 text-[11px] font-medium text-zinc-600">
                    Customer Experience Demo
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-zinc-800">
                    Welcome to {settings.businessName || "Our Website"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                    Try asking our chatbot about our warranty, returns, products, or support hours.
                  </p>

                  {/* Sample Mock Cards */}
                  <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                      <div className="h-14 rounded-lg bg-zinc-100 mb-2 flex items-center justify-center text-xs text-zinc-400">
                        Product A
                      </div>
                      <div className="text-xs font-semibold text-zinc-800">Premium Tech Device</div>
                      <div className="text-[11px] text-zinc-400">$199.00</div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                      <div className="h-14 rounded-lg bg-zinc-100 mb-2 flex items-center justify-center text-xs text-zinc-400">
                        Product B
                      </div>
                      <div className="text-xs font-semibold text-zinc-800">Accessories Pack</div>
                      <div className="text-[11px] text-zinc-400">$49.00</div>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Chatbot Inside Preview */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4">
                  {/* Chat Window */}
                  <AnimatePresence>
                    {isChatOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="pointer-events-auto absolute bottom-18 right-4 w-[340px] max-w-[calc(100%-32px)] h-[440px] rounded-2xl border border-zinc-200 bg-white shadow-2xl flex flex-col overflow-hidden z-20"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 font-bold text-xs">
                              {(settings.businessName || "AI").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-semibold max-w-[170px] truncate leading-tight">
                                {settings.businessName || "Customer Support"}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Online • Instant replies</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={resetChat}
                              title="Reset chat"
                              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                            >
                              <IoRefresh className="text-sm" />
                            </button>
                            <button
                              onClick={() => setIsChatOpen(false)}
                              title="Close chat"
                              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                            >
                              <IoClose className="text-base" />
                            </button>
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-zinc-50/70 text-xs">
                          {messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${
                                msg.role === "user" ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                                  msg.role === "user"
                                    ? "bg-zinc-950 text-white rounded-br-xs"
                                    : "bg-white text-zinc-800 border border-zinc-200/90 rounded-bl-xs"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                              </div>
                              <span className="mt-1 text-[9px] text-zinc-400 px-1">{msg.time}</span>
                            </div>
                          ))}

                          {/* Quick Suggestion Chips (when only initial message is present) */}
                          {messages.length === 1 && (
                            <div className="pt-2">
                              <p className="text-[10px] text-zinc-400 mb-1.5 font-medium">Suggested questions:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  "What is your return policy?",
                                  "What are your delivery times?",
                                  "How do I contact support?",
                                ].map((chip, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSendMessage(chip)}
                                    className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 transition"
                                  >
                                    {chip}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Typing Indicator */}
                          {isThinking && (
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-zinc-200 bg-white px-3 py-2 w-16 shadow-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.15s]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.3s]" />
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-zinc-200 bg-white p-2.5">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Ask a question..."
                              disabled={isThinking}
                              className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition"
                            />
                            <button
                              type="submit"
                              disabled={!input.trim() || isThinking}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white disabled:opacity-40 transition hover:scale-105"
                            >
                              <IoSend className="text-xs" />
                            </button>
                          </form>
                          <div className="mt-1 text-center text-[9px] text-zinc-400">
                            Powered by AI ChatBot Builder
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Launcher Button */}
                  <div className="pointer-events-auto flex items-center justify-end">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xl shadow-zinc-900/30 cursor-pointer"
                    >
                      {isChatOpen ? (
                        <IoClose className="text-xl" />
                      ) : (
                        <IoChatbubbleSharp className="text-lg" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Embed;
