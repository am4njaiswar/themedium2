'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegraphUI() {
  const [tape, setTape] = useState<string[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const pressStartTime = useRef<number>(0);

  // 🔊 Feature: Simulate the "Click-Clack" of the machine
  const handlePressStart = () => {
    setIsPressed(true);
    pressStartTime.current = Date.now();
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    const duration = Date.now() - pressStartTime.current;
    
    // Logic: Short tap (< 200ms) is Dot, Long tap is Dash
    const symbol = duration < 200 ? "•" : "—";
    
    // Add to tape array
    setTape(prev => [...prev, symbol]);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-4 md:p-12 font-serif text-[#3E2723]">
      
      {/* 📜 The Scrolling Paper Tape Mechanism */}
      <div className="relative w-full max-w-3xl h-32 bg-[#EFEBE9] border-y-8 border-[#5D4037] shadow-2xl flex items-center overflow-hidden">
        {/* The Metal Guide Rails (Visual Decoration) */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-b from-[#8D6E63] to-transparent z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-t from-[#8D6E63] to-transparent z-20" />
        
        {/* The Paper Moving Animation */}
        <div className="flex items-center justify-end w-full px-12 gap-4">
          <AnimatePresence>
            {tape.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-6xl font-bold font-mono tracking-tighter"
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
          {/* Blinking "Ink" Head */}
          <div className="w-1 h-16 bg-[#3E2723] animate-pulse ml-4" />
        </div>
      </div>

      {/* 🏷️ Instruction Plate */}
      <div className="mt-8 border-4 border-[#8D6E63] p-4 bg-[#D7CCC8] shadow-lg transform -rotate-1">
        <p className="text-center font-bold tracking-[0.2em] text-xs uppercase opacity-70">
          Western Union Telegraph Co.
        </p>
        <p className="text-center text-sm font-bold mt-1">
          HOLD for DASH (—) • TAP for DOT (•)
        </p>
      </div>

      {/* 🔨 The Giant Brass Morse Key */}
      <div className="mt-auto relative group">
        {/* The Base */}
        <div className="absolute inset-x-0 bottom-0 h-4 bg-black/20 rounded-[50%] blur-xl transform scale-y-50 group-hover:scale-110 transition-transform" />
        
        <motion.button
          whileTap={{ scale: 0.95, y: 15 }} // Physical depression effect
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          className={`
            relative z-10 w-40 h-40 rounded-full 
            bg-linear-to-br from-[#FFD54F] via-[#FFB300] to-[#FF6F00]
            border-b-12 border-[#E65100]
            shadow-[0_20px_40px_rgba(0,0,0,0.4)]
            flex items-center justify-center
            transition-all duration-100
            ${isPressed ? 'border-b-0 translate-y-3 shadow-sm' : ''}
          `}
        >
          <div className="absolute top-4 left-6 w-12 h-8 bg-white/40 rounded-full blur-[2px]" />
          <div className="w-32 h-32 rounded-full border-4 border-[#E65100]/30" />
        </motion.button>
      </div>
    </div>
  );
}