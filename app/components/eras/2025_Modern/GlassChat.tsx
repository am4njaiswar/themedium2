'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, ImagePlus } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import AiPredictor from './AiPredictor';
import EncryptionLock from './EncryptionLock';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other' | 'system';
  era?: string; 
  displaySender?: string; // To show "Modern User" without the ID junk
}

export default function GlassChat() {
  const { socket, isConnected } = useSocket();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys-1', text: "Chronos Link v4.0 Online.", sender: 'system' },
  ]);

  // 1. 👂 LISTEN (Handle everything here)
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      console.log("🔮 Received:", data);

      // A. Parse the Sender Name (e.g., "Modern User::abc-123")
      let isMe = false;
      let cleanSenderName = data.sender;

      // Check if this message came from a Modern User (2025)
      if (typeof data.sender === 'string' && data.sender.includes('::')) {
        const [name, senderSocketId] = data.sender.split('::');
        cleanSenderName = name; // "Modern User"
        
        // If the ID inside the name matches MY socket ID, it's from me!
        if (senderSocketId === socket.id) {
          isMe = true;
        }
      }

      setMessages((prev) => [
        ...prev, 
        { 
          id: data.id || Date.now().toString(), 
          text: data.text || data.content || "Cipher Error",
          sender: isMe ? 'me' : 'other', // Blue if me, Gray if them
          era: data.era,
          displaySender: cleanSenderName
        }
      ]);
    };

    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [socket]);

  // 2. Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. 📤 SEND Function (Simplified)
  const sendMessage = () => {
    if(!input.trim()) return;

    // 🛑 REMOVED LOCAL ADD (Optimistic UI)
    // We do NOT add the message to 'setMessages' here. 
    // We wait for the server to echo it back to handleReceive above.
    
    if (socket) {
      socket.emit('send_message', {
        era: '2025',
        content: input,
        // 🔑 KEY FIX: Embed my ID in the sender name so we can check it on return
        sender: `Modern User::${socket.id}` 
      });
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative font-sans pb-28">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-md z-10">
        <div>
           <h2 className="text-white font-bold text-lg tracking-tight">Quantum Chat</h2>
           <p className="text-xs text-blue-300/60">latency: 2ms • connected</p>
        </div>
        <EncryptionLock isSecured={isConnected} />
      </div>

      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto scrollbar-hide mask-gradient-b pb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-[85%]">
                {/* Show Era Tag if it's not me */}
                {msg.sender === 'other' && msg.era && (
                  <span className="text-[10px] text-gray-400 ml-2 mb-1 uppercase tracking-wider">
                    {msg.era === '2025' ? 'Remote User' : `Incoming from ${msg.era}`}
                  </span>
                )}
                
                <div className={`
                  px-5 py-3 rounded-2xl text-sm font-medium backdrop-blur-xl shadow-lg border border-white/5
                  ${msg.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' 
                    : msg.sender === 'system'
                    ? 'bg-emerald-900/40 text-emerald-200 text-center text-xs py-1 self-center'
                    : 'bg-gray-800/60 text-gray-100 rounded-bl-sm'}
                `}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {!input && (
         <div className="flex justify-center" onClick={() => setInput("Is anyone from the 1800s listening?")}>
            <AiPredictor suggestion="Is anyone from the 1800s listening?" />
         </div>
      )}

      <div className="px-4 pb-6 pt-2 z-20">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-full opacity-30 group-hover:opacity-60 blur transition duration-500" />
          
          <div className="relative flex items-center bg-gray-900/90 backdrop-blur-2xl rounded-full border border-white/10 p-1.5 shadow-2xl">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ImagePlus size={20} />
            </button>
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Broadcast to timeline..."
              className="flex-1 bg-transparent border-none outline-none text-white px-3 placeholder-gray-500 font-medium"
            />
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Mic size={20} />
            </button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="p-2.5 bg-linear-to-tr from-blue-600 to-blue-500 rounded-full text-white shadow-lg shadow-blue-600/30"
            >
              <Send size={18} fill="currentColor" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}