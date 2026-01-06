 'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';

interface LogLine {
  id: string;
  text: string;
  color?: string;
}

export default function TerminalWindow() {
  const { socket, isConnected } = useSocket();
  const [lines, setLines] = useState<LogLine[]>([
    { id: 'init', text: "Initializing TCP/IP stack...", color: "text-gray-400" },
    { id: 'driver', text: "Loading SOCKET.IO drivers...", color: "text-gray-400" },
    { id: 'connect', text: "Connected to Global Timeline BBS.", color: "text-green-400 font-bold" },
    { id: 'help', text: "Type a message to broadcast...", color: "text-gray-500 mb-4" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref to keep focus

  // 1. 👂 LISTEN FOR MESSAGES
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      // Ignore own messages
      if (data.sender && data.sender.includes(`::${socket.id}`)) return;

      let prefix = "UNKNOWN_SIGNAL";
      let colorClass = "text-gray-300";

      if (data.era === '1840') {
        prefix = "TELEGRAPH_LINK";
        colorClass = "text-yellow-500 font-mono";
      } else if (data.era === '2025') {
        prefix = "QUANTUM_NET";
        colorClass = "text-cyan-400 font-sans tracking-wide";
      } else if (data.era === '1990') {
        prefix = "REMOTE_USER";
        colorClass = "text-green-300";
      }

      addLog(`[${prefix}]: ${data.content || data.text}`, colorClass);
    };

    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [socket]);

  const addLog = (text: string, color: string = "text-[#33FF00]") => {
    setLines(prev => [...prev, { id: Date.now().toString() + Math.random(), text, color }]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Keep focus on the input whenever the user clicks the terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // 2. 📤 SEND MESSAGES
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;

    addLog(`C:\\ADMIN> ${input}`, "text-white");

    if (socket) {
      socket.emit('send_message', {
        id: `${Date.now()}-${Math.random()}`,
        era: '1990',
        content: input,
        sender: `SysAdmin::${socket.id}` 
      });
    } else {
        addLog("ERROR: NO CARRIER (Offline)", "text-red-500");
    }

    setInput("");
  };

  return (
    <div className="flex items-center justify-center h-full font-mono text-sm md:text-base">
      
      {/* 🖥️ Monitor Frame */}
      <div className="w-full h-full bg-[#C0C0C0] p-1 shadow-[4px_4px_0_#00000080] border-t-2 border-l-2 border-white border-b-2 border-r-2 flex flex-col">
        
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 mb-1 flex justify-between items-center select-none">
          <span className="font-bold tracking-wider">TELNET.EXE - {isConnected ? 'Online' : 'Offline'}</span>
          <div className="flex gap-1">
            <button className="w-4 h-4 bg-[#C0C0C0] border border-black shadow-sm text-black flex items-center justify-center text-[10px] font-bold">_</button>
            <button className="w-4 h-4 bg-[#C0C0C0] border border-black shadow-sm text-black flex items-center justify-center text-[10px] font-bold">X</button>
          </div>
        </div>

        {/* ⬛ Black Screen (Clicking anywhere here focuses the input) */}
        <div 
            onClick={handleTerminalClick}
            className="flex-1 bg-black p-4 overflow-y-auto border-inset border-2 border-gray-600 relative overflow-hidden cursor-text"
        >
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] z-10 opacity-20"></div>

          {/* Text Content */}
          <div className="relative z-0 flex flex-col gap-1 text-[#33FF00] shadow-[0_0_10px_rgba(51,255,0,0.4)]">
            {lines.map((line) => (
              <div key={line.id} className={`${line.color} wrap-break-word`}>
                  {line.text}
              </div>
            ))}
            
            {/* ✨ THE INPUT TRICK ✨ */}
            <form onSubmit={handleCommand} className="flex flex-wrap items-center">
              <span className="mr-2 opacity-80 text-gray-400 shrink-0">C:\ADMIN{'>'}</span>
              
              {/* 1. We display the text in a span so it only takes up exactly the space it needs */}
              <span className="text-[#33FF00] font-bold break-all whitespace-pre-wrap">{input}</span>
              
              {/* 2. The Blinking Cursor Block sits right next to the text */}
              <span className="w-2.5 h-5 bg-[#33FF00] animate-pulse inline-block ml-0.5 align-middle" />

              {/* 3. The Actual Input is invisible but captures your typing */}
              <input 
                ref={inputRef}
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                className="opacity-0 w-px h-px absolute pointer-events-none"
                autoComplete="off"
              />
            </form>
            <div ref={endRef} />
          </div>
        </div>
      </div>
    </div>
  );
} 