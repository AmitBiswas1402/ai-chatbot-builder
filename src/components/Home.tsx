"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const HomePage = ({ email }: { email?: string }) => {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };
  const firstLetter = email ? email[0]?.toUpperCase() : "";
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-zinc-50 text-zinc-900 overflow-x-hidden">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed w-full top-0 left-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">
            AI
            <span className="text-zinc-400"> ChatBot</span>
            <span className="text-black"> Builder</span>
          </div>
          {email ? (
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold hover:scale-105 transition"
              >
                {firstLetter}
              </button>
              {open && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden"
                  >
                    <button className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100">
                      Dashboard
                    </button>
                    <button className="block px-4 py-3 text-sm text-red-600 hover:bg-zinc-100">
                      Logout
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ) : (
            <button
              className="px-5 py-2 text-sm rounded-full bg-black text-white  font-medium hover:bg-zinc-800 transition disabled:opacity-60 flex items-center gap-2"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default HomePage;
