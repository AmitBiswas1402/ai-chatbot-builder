"use client";

import axios from "axios";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Dashboard = ({ ownerId }: { ownerId: string }) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchHandleSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await axios.post("/api/settings", {
        ownerId,
        businessName,
        supportEmail,
        knowledge,
      });

      console.log("Settings saved:", result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) 
        ? err.response?.data?.details || err.message 
        : String(err);
      setError(errorMsg);
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-100 via-white to-stone-100 text-zinc-900">
      <div className="pointer-events-none absolute -left-20 top-16 h-80 w-80 rounded-full bg-gray-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-50 w-full border-b border-zinc-200/70 bg-white/80 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="text-lg font-semibold tracking-tight">
              AI
              <span className="text-zinc-500"> ChatBot</span>
              <span className="text-zinc-900"> Builder</span>
            </div>
          </div>

          <button className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50">
            Embed Chatbot
          </button>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto mt-20 flex w-full max-w-6xl justify-center px-4 py-14">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-4xl rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl shadow-zinc-300/40 backdrop-blur-sm md:p-10"
        >
          <div className="mb-10 border-b border-zinc-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Chatbot Settings
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Configure your chatbot's behavior and appearance.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Business Information
            </h2>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Business Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Electronics"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Support Email
                </label>
                <input
                  type="email"
                  placeholder="support@acme.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-10 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Knowledge</h2>
            <p className="mb-4 mt-1 text-sm text-zinc-600">
              Add information about your business, products, or services.
            </p>
            <div className="space-y-4">
              <textarea
                placeholder={
                  "Example:\n- Refund policy: 7 days return\n- Delivery time: 3-5 business days\n- Cash on delivery: Available in select cities\n- Support hours: 9am - 6pm (Mon-Fri)"
                }
                className="h-56 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Settings saved successfully!</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-5 border-t border-zinc-200 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-400/30 transition hover:bg-zinc-800"
              onClick={fetchHandleSettings}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Dashboard;
