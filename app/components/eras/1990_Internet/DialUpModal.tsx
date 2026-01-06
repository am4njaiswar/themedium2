'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DialUpModalProps {
  onConnect: () => void;
}

export default function DialUpModal({ onConnect }: DialUpModalProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing modem...");

  useEffect(() => {
    const statuses = [
      "Dialing 205.111.0.1...",
      "Verifying username...",
      "Handshake detected...",
      "Authenticating...",
      "Registered on network."
    ];

    let statusIdx = 0;
    
    // Simulate a jumpy, slow connection
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onConnect, 800); // Wait a bit before closing
          return 100;
        }
        // Random progress jump
        const jump = Math.random() * 15;
        const newProgress = prev + jump;
        
        // Update status text based on progress
        const newStatusIdx = Math.floor((newProgress / 100) * statuses.length);
        if (newStatusIdx > statusIdx && newStatusIdx < statuses.length) {
            setStatus(statuses[newStatusIdx]);
            statusIdx = newStatusIdx;
        }

        return newProgress > 100 ? 100 : newProgress;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [onConnect]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Windows 95 Style Window Box */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-md bg-[#C0C0C0] border-t-2 border-l-2 border-white border-b-2 border-r-2  p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
      >
        {/* Title Bar */}
        <div className="bg-[#000080] flex justify-between items-center text-white px-2 py-1 font-bold text-sm select-none">
          <span>Connection Status - GlobalNet</span>
          <button className="bg-[#C0C0C0] text-black border-t border-l border-white border-b border-r  w-5 h-5 flex items-center justify-center font-bold leading-none">X</button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center font-sans text-sm">
          <div className="flex items-center gap-4 mb-6">
            {/* Classic Icon */}
             <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
                <p className="font-bold mb-1">Connecting to GlobalNet BBS...</p>
                <p className="text-gray-700">{status}</p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-7 bg-white border-inset border-2 border-gray-600 relative p-0.5">
            {/* The Blue Progress Chunk */}
            <div 
              className="h-full bg-[#000080]"
              style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }} 
            />
          </div>
          
          <button className="mt-6 px-8 py-1.5 bg-[#C0C0C0] border-t-2 border-white border-b-2  active:border-t-black active:border-b-white active:bg-gray-400 text-black font-bold focus:outline-none focus:ring-1 focus:ring-black border-dotted">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}