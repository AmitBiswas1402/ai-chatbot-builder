"use client";

import { motion } from "motion/react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-white to-zinc-50 text-zinc-900 overflow-x-hidden">
      <motion.div
       initial={{ y: -20, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       transition={{ duration: 0.5, ease: "easeInOut" }}
       className="fixed w-full top-0 left-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">
            AI
            <span className="text-zinc-400"> ChatBot</span>
            <span className="text-black"> Builder</span>
          </div>
          <div className="px-5 py-2 text-sm rounded-full bg-black text-white  font-medium hover:bg-zinc-800 transition disabled:opacity-60 flex items-center gap-2">
            Login
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default HomePage;
