"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, ImagePlus, MicOff } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import EncryptionLock from "./EncryptionLock";
import AiPredictor from "./AiPredictor"; // 👈 1. Import it

interface Message {
  id: string;
  text: string;
  sender: "me" | "other" | "system";
  era?: string;
  displaySender?: string;
}

export default function GlassChat() {
  const { socket, isConnected } = useSocket();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🤖 AI STATE
  const [aiSuggestion, setAiSuggestion] = useState(""); // 👈 2. Store suggestion

  // 🎤 VOICE STATE
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef<string>("");
  const interimRef = useRef<string>("");

  const [messages, setMessages] = useState<Message[]>([
    { id: "sys-1", text: "Chronos Link v4.0 Online.", sender: "system" },
  ]);

  // ... (Keep your existing Voice useEffect here unchanged) ...
  // (I am omitting the long Voice useEffect to save space, keep it exactly as it was!)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setVoiceStatus("LISTENING NOW...");
        };
        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
          setVoiceStatus("");
        };
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal)
              finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) {
            const newBase =
              baseInputRef.current +
              (baseInputRef.current ? " " : "") +
              finalTranscript;
            baseInputRef.current = newBase;
            setInput(newBase);
          }
        };
      }
    }
  }, []);

  // 🎤 Button Handlers (Keep unchanged)
  const startListening = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (recognitionRef.current && !isListening) {
      baseInputRef.current = input;
      recognitionRef.current.start();
    }
  };
  const stopListening = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };

  // 🧠 SIMPLE AI LOGIC
  const generateAiReply = (incomingText: string) => {
    const lower = incomingText.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi"))
      return "Greetings from 2025.";
    if (lower.includes("how are you")) return "Systems optimal. And you?";
    if (lower.includes("time")) return "Time is relative here.";
    if (lower.includes("weather")) return "Atmospheric sensors offline.";
    return "Data received. Processing.";
  };

  // 3. SOCKET LOGIC (Updated to trigger AI)
  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data: any) => {
      let isMe = false;
      let cleanSenderName = data.sender;
      if (typeof data.sender === "string" && data.sender.includes("::")) {
        const [name, senderSocketId] = data.sender.split("::");
        cleanSenderName = name;
        if (senderSocketId === socket.id) isMe = true;
      }

      const newMsg = {
        id: data.id || Date.now().toString(),
        text: data.text || data.content || "Cipher Error",
        sender: isMe ? "me" : "other",
        era: data.era,
        displaySender: cleanSenderName,
      } as Message;

      setMessages((prev) => [...prev, newMsg]);

      // 🤖 TRIGGER AI: If message is from someone else, suggest a reply
      if (!isMe) {
        const suggestion = generateAiReply(newMsg.text);
        setAiSuggestion(suggestion);
      }
    };
    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (isListening && recognitionRef.current) recognitionRef.current.stop();

    if (socket) {
      socket.emit("send_message", {
        era: "2025",
        content: input,
        sender: `Modern User::${socket.id}`,
      });
    }
    setInput("");
    setAiSuggestion(""); // 🧹 Clear suggestion after sending
    baseInputRef.current = "";
  };

  // 👈 4. Handle clicking the suggestion
  const acceptSuggestion = () => {
    setInput(aiSuggestion);
    setAiSuggestion("");
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative font-sans pb-28">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h2 className="text-white font-bold text-lg tracking-tight">
            Quantum Chat
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <p className="text-xs text-blue-300/60">
              {isConnected ? "Online" : "Offline"} • {messages.length} msgs
            </p>
          </div>
        </div>
        <EncryptionLock isSecured={isConnected} />
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto scrollbar-hide mask-gradient-b pb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col max-w-[85%]">
                {msg.sender === "other" && msg.era && (
                  <span className="text-[10px] text-gray-400 ml-2 mb-1 uppercase tracking-wider">
                    {msg.era === "2025"
                      ? "Remote User"
                      : `Incoming from ${msg.era}`}
                  </span>
                )}
                <div
                  className={`
                  px-5 py-3 rounded-2xl text-sm font-medium backdrop-blur-xl shadow-lg border border-white/5
                  ${
                    msg.sender === "me"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-blue-500/20"
                      : msg.sender === "system"
                      ? "bg-emerald-900/40 text-emerald-200 text-center text-xs py-1 self-center"
                      : "bg-gray-800/60 text-gray-100 rounded-bl-sm"
                  }
                `}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-6 pt-2 z-20">
        {/* 👈 5. Render AI Suggestion if available */}
        <AiPredictor suggestion={aiSuggestion} onClick={acceptSuggestion} />

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-full opacity-30 group-hover:opacity-60 blur transition duration-500" />

          <div className="relative flex items-center bg-gray-900/90 backdrop-blur-2xl rounded-full border border-white/10 p-1.5 shadow-2xl">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ImagePlus size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                baseInputRef.current = e.target.value;
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={voiceStatus || "Broadcast to timeline..."}
              className={`flex-1 bg-transparent border-none outline-none px-3 font-medium transition-colors
                ${
                  voiceStatus === "Connecting..."
                    ? "text-blue-300"
                    : voiceStatus.includes("LISTENING")
                    ? "text-green-400 font-bold animate-pulse"
                    : "text-white placeholder-gray-500"
                }`}
            />

            <button
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onMouseLeave={() =>
                isListening && stopListening(new Event("mouseleave") as any)
              }
              onTouchStart={(e) => {
                e.preventDefault();
                startListening(e);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopListening(e);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                stopListening(e);
              }}
              className={`p-2 transition-all rounded-full hover:bg-white/5 select-none ${
                isListening
                  ? "text-red-500 bg-red-500/10 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {isListening ? (
                <MicOff size={20} className="animate-pulse" />
              ) : (
                <Mic size={20} />
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="p-2.5 bg-linear-to-tr from-blue-600 to-blue-500 rounded-full text-white shadow-lg shadow-blue-600/30 ml-1"
            >
              <Send size={18} fill="currentColor" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
