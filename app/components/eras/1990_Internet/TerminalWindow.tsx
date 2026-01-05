'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function TerminalWindow() {
  const [lines, setLines] = useState<string[]>([
    "Initializing TCP/IP stack...",
    "Loading DRIVER.SYS...",
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // 🤖 Feature: Auto-scrolling simulated boot sequence
  useEffect(() => {
    const sequence = [
      { text: "Resolving host...", delay: 800 },
      { text: "Dialing 205.111.4.1...", delay: 1600 },
      { text: "Handshake detected (14.4 kbps)", delay: 2400 },
      { text: "Verifying user credentials...", delay: 3200 },
      { text: "ACCESS GRANTED.", delay: 4000, color: "text-green-400 font-bold" },
      { text: "Welcome to EchoNet BBS v2.1", delay: 4500 }
    ];

    sequence.forEach(({ text, delay, color }) => {
      setTimeout(() => {
        setLines(prev => [...prev, color ? `<span class="${color}">${text}</span>` : text]);
      }, delay);
    });
  }, []);

  // Keep scroll at bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input) return;
    setLines(prev => [...prev, `C:\\USER> ${input}`, `Bad command or file name`]); // Mock error
    setInput("");
  };

  return (
    <div className="flex items-center justify-center h-full p-4 font-mono text-sm md:text-base">
      
      {/* 🖥️ The CRT Monitor Window Frame */}
      <div className="w-full max-w-3xl h-[70vh] bg-[#C0C0C0] p-1 shadow-[4px_4px_0_#00000080] border-t-2 border-l-2 border-white border-b-2 border-r-2  flex flex-col">
        
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 mb-1 flex justify-between items-center select-none">
          <span className="font-bold tracking-wider">TELNET.EXE</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-[#C0C0C0] border border-black shadow-sm text-black flex items-center justify-center text-[10px] font-bold">_</div>
            <div className="w-4 h-4 bg-[#C0C0C0] border border-black shadow-sm text-black flex items-center justify-center text-[10px] font-bold">X</div>
          </div>
        </div>

        {/* ⬛ The "Screen" */}
        <div className="flex-1 bg-black p-4 overflow-y-auto border-inset border-2 border-gray-600 relative overflow-hidden custom-scrollbar">
          
          {/* Scanline Overlay (CSS Magic) */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] z-10 opacity-20"></div>

          <div className="relative z-0 flex flex-col gap-1 text-[#33FF00] shadow-[0_0_10px_rgba(51,255,0,0.4)]">
            {lines.map((line, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
            
            {/* The Input Area */}
            <form onSubmit={handleCommand} className="flex mt-2">
              <span className="mr-2 opacity-80">C:\USER{'>'}</span>
              <input 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                className="bg-transparent border-none outline-none text-[#33FF00] flex-1 caret-transparent uppercase"
              />
              <span className="w-2.5 h-5 bg-[#33FF00] animate-pulse block" />
            </form>
            <div ref={endRef} />
          </div>
        </div>
      </div>
    </div>
  );
}