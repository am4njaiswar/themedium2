'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Mic, ImagePlus } from 'lucide-react';

export default function GlassChat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "System check complete. All nodes operational.", sender: 'other' },
    { id: 2, text: "Latency is near zero. The network is stable.", sender: 'me' },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'me' }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto justify-end pb-24 relative">
      
      {/* 🔮 Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* 💬 Message List */}
      <div className="flex flex-col gap-3 p-4 overflow-y-auto scrollbar-hide mask-gradient-b">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium backdrop-blur-xl shadow-lg
                ${msg.sender === 'me' 
                  ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' 
                  : 'bg-white/10 text-gray-100 border border-white/10 rounded-bl-sm'}
              `}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ✨ AI Smart Suggestion Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-4 cursor-pointer"
        onClick={() => setInput("Initiating warp sequence.")}
      >
        <div className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/5 transition-colors group">
          <Sparkles className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
          <span className="text-xs text-purple-200/80 group-hover:text-purple-100">
            Suggestion: "Initiating warp sequence."
          </span>
        </div>
      </motion.div>

      {/* ⌨️ The "Float" Input Bar */}
      <div className="mx-4 mb-2">
        <div className="relative group">
          {/* Neon Border Glow */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-full opacity-30 group-hover:opacity-60 blur transition duration-500" />
          
          <div className="relative flex items-center bg-gray-900/80 backdrop-blur-2xl rounded-full border border-white/10 p-1.5">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <ImagePlus size={20} />
            </button>
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none outline-none text-white px-3 placeholder-gray-500"
            />
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Mic size={20} />
            </button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="p-2.5 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-600/30"
            >
              <Send size={18} fill="currentColor" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}