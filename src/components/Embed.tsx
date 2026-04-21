"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { IoChatbubbleSharp } from "react-icons/io5";

const Embed = ({ ownerId }: { ownerId: string }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const embedCode = `<script 
    src="${process.env.NEXT_PUBLIC_APP_URL}/chatBot.js" data-owner-id="${ownerId}">
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="text-lg font-semibold cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="text-lg font-bold tracking-tight">
              AI
              <span className="text-zinc-400"> ChatBot</span>
              <span className="text-black"> Builder</span>
            </div>
          </div>

          <button
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50"
            onClick={() => router.push("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="flex justify-center px-4 py-14">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-3xl rounded-2xl border border-white/70 bg-white/90 p-8 shadow-2xl shadow-zinc-300/40 backdrop-blur-sm"
        >
          <h1 className="text-2xl font-semibold mb-2">Embed ChatBot</h1>
          <p>
            Copy and paste this before <code>&lt;/body&gt;</code>
          </p>
          <div className="relative mt-4 mb-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                Embed Code
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <rect x="9" y="9" width="10" height="10" rx="2" />
                  <path d="M5 15V7a2 2 0 0 1 2-2h8" />
                </svg>
                Copy
              </button>
            </div>
            <div className="absolute right-4 top-16">
              <span
                className={`rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-900 shadow-lg transition-all duration-200 ${
                  copied
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-1 opacity-0"
                }`}
                role="status"
                aria-live="polite"
              >
                Copied!
              </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all px-4 py-4 font-mono text-sm leading-6 text-zinc-100">
              {embedCode}
            </pre>
          </div>

          <ol className="space-y-3 text-sm text-zinc-600 list-decimal list-inside">
            <li>Copy the embed script</li>
            <li>Paste it before closing the body tag</li>
            <li>Reload your website</li>
          </ol>

          <div className="mt-14">
            <h1 className="mb-2 text-lg font-medium">Live Preview</h1>
            <p className="mb-6 text-sm text-zinc-500">
              See your ChatBot in action on your website.
            </p>

            <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-md">
              <div className="flex h-9 items-center justify-between border-b border-zinc-200 bg-zinc-100 pl-4">
                <span className="text-xs text-zinc-500">your-website.com</span>
                <div className="ml-auto flex h-full items-center">
                  <button
                    type="button"
                    aria-label="Minimize preview"
                    className="flex h-9 w-12 items-center justify-center text-zinc-600 transition hover:bg-zinc-200"
                  >
                    <span className="block h-px w-3 bg-current" />
                  </button>
                  <button
                    type="button"
                    aria-label="Maximize preview"
                    className="flex h-9 w-12 items-center justify-center text-zinc-600 transition hover:bg-zinc-200"
                  >
                    <span className="block h-2.5 w-2.5 border border-current" />
                  </button>
                  <button
                    type="button"
                    aria-label="Close preview"
                    className="flex h-9 w-12 items-center justify-center text-zinc-600 transition hover:bg-red-500 hover:text-white"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative flex h-64 items-start justify-start bg-zinc-50 p-6 text-sm text-zinc-400 sm:h-72">
                Your Website goes here!
                <div className="absolute bottom-6 right-6 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/60">
                  <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 text-white">
                    <span className="text-sm font-semibold tracking-wide">Customer Support</span>
                    <button
                      type="button"
                      aria-label="Close chat preview"
                      className="grid h-6 w-6 place-items-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3 bg-zinc-50 p-3 text-xs text-zinc-700">
                    <div className="mr-8 rounded-xl rounded-bl-sm border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                      Hello! How can I help you today?
                    </div>
                    <div className="ml-8 rounded-xl rounded-br-sm bg-zinc-900 px-3 py-2 text-zinc-100">
                      I need details about your pricing.
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 bg-white p-2">
                    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-400">
                      <span>Type your message...</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4 text-zinc-500"
                      >
                        <path d="M4 12h14" />
                        <path d="m12 6 6 6-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  whileHover={{ scale: 1.06 }}
                  className="absolute bottom-6 right-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg"
                >
                  <IoChatbubbleSharp size={30} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Embed;
