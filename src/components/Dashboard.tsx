"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const Dashboard = ({ ownerId }: { ownerId: string }) => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed w-full top-0 left-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="text-lg font-bold tracking-tight">
              AI
              <span className="text-zinc-400"> ChatBot</span>
              <span className="text-black"> Builder</span>
            </div>
          </div>

          <button className="px-4 py-2 rounded-lg border border-zinc-300 text-sm hover:bg-zinc-100 transition bg-white">
            Embed Chatbot
          </button>
        </div>
      </motion.div>

      <div className="flex justify-center px-4 py-14">
        
      </div>
    </div>
  );
};
export default Dashboard;
