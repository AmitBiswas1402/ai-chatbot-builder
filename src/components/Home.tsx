"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoChatbubbleSharp } from "react-icons/io5";

const HomePage = ({ email }: { email?: string }) => {
  const router = useRouter();
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
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

  const features = () => [
    {
      title: "Easy Setup",
      description:
        "Get your chatbot up and running in minutes with our intuitive setup process.",
    },
    {
      title: "AI-Powered",
      description:
        "Leverage the power of AI to provide intelligent and personalized responses to your customers.",
    },
    {
      title: "Customizable",
      description:
        "Tailor the chatbot's appearance and behavior to match your brand and meet your specific needs.",
    },
  ];

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
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-3 text-sm text-red-600 hover:bg-zinc-100"
                    >
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

      {/* Hero Section */}
      <section className="pt-36 pb-28 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <h1 className="text-4xl font-bold leading-tight">
              AI Customer Support <br />
              Built for modern websites
            </h1>
            <p className="mt-6 text-lg text-zinc-600 max-w-xl">
              Create your own AI chatbot in minutes. No coding required. Just
              connect your knowledge base and let our AI do the rest.
            </p>
            <div className="mt-10 flex gap-4">
              {email ? (
                <button 
                 className="px-5 py-2 bg-black text-white rounded-full font-medium hover:bg-zinc-800 transition"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  className="px-5 py-2 bg-black text-white rounded-full font-medium hover:bg-zinc-800 transition"
                  onClick={handleLogin}
                >
                  Get Started
                </button>
              )}
              <button className="px-5 py-2 bg-white text-black border border-zinc-300 rounded-full font-medium hover:bg-zinc-100 transition">
                Learn More
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut", delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden p-6">
              <div className="text-sm text-zinc-500 mb-3">
                Live Chat Preview
              </div>
              <div className="space-y-3">
                <div className="flex">
                  <div className="bg-zinc-100 rounded-lg rounded-tl-none px-4 py-2 text-sm max-w-[80%]">
                    Hi there! How can I assist you today?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-black text-white rounded-lg rounded-tr-none px-4 py-2 text-sm max-w-[80%]">
                    I have a question about my order.
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-zinc-100 rounded-lg rounded-tl-none px-4 py-2 text-sm max-w-[80%]">
                    Sure! Can you please provide your order number?
                  </div>
                </div>
              </div>
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1 }}
                className="bg-black text-white flex items-center justify-center shadow-xl w-14 h-14 absolute -bottom-6 -right-6 rounded-full cursor-pointer"
              >
                <IoChatbubbleSharp size={30} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-50 py-28 px-6 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-semibold text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            viewport={{ once: false }}
          >
            Join thousands of businesses using our AI chatbot to provide
          </motion.h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {features().map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200 hover:shadow-2xl transition"
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-zinc-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} AI ChatBot Builder. All rights
        reserved.
      </footer>
    </div>
  );
};
export default HomePage;
