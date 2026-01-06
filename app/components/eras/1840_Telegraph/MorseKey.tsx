'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MorseKeyProps {
  onDown: () => void;
  onUp: () => void;
  isPressed: boolean;
}

export default function MorseKey({ onDown, onUp, isPressed }: MorseKeyProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      
      {/* 🪵 The Wooden Base Platform */}
      <div className="absolute top-10 w-64 h-64 rounded-full bg-[#3E2723] border-4 border-[#281815] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-0 flex items-center justify-center">
        {/* Wood grain effect overlay */}
        <div className="absolute inset-0 rounded-full opacity-20 bg-[repeating-linear-gradient(45deg,#3E2723,#3E2723_10px,#4E342E_10px,#4E342E_20px)]" />
        {/* Screws */}
        <div className="absolute top-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute bottom-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute left-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute right-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
      </div>

      {/* ⚙️ The Mechanism Arm (Visual only) */}
      <div className="absolute w-48 h-8 bg-linear-to-r from-yellow-700 via-yellow-500 to-yellow-700 shadow-lg z-0 rotate-0 top-1/2 -translate-y-1/2" />

      {/* 🔨 The Physical Button (The "Knob") */}
      <motion.button
        // Animation Physics: Springy and responsive
        whileTap={{ scale: 0.95, y: 15 }} 
        animate={{ y: isPressed ? 15 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        
        onMouseDown={onDown}
        onMouseUp={onUp}
        onMouseLeave={onUp} // Safety: release if mouse leaves area
        
        className="relative z-10 group focus:outline-none cursor-pointer"
        style={{ touchAction: 'none' }} // Prevents scrolling on mobile while tapping
      >
        {/* The Knob Handle (Black Bakelite style) */}
        <div className={`
          w-40 h-40 rounded-full 
          bg-linear-to-b from-[#1a1a1a] to-[#000000]
          border-b-8 border-[#333]
          shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_5px_10px_rgba(255,255,255,0.1)]
          flex items-center justify-center
          transition-all duration-75
          ${isPressed ? 'shadow-[0_5px_10px_rgba(0,0,0,0.5)] border-b-2' : ''}
        `}>
          
          {/* Top Reflection (Shiny Plastic look) */}
          <div className="absolute top-4 left-8 w-16 h-8 bg-white/10 rounded-full blur-sm rotate-[-15deg]" />
          
          {/* Brass Ring Center */}
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#FFD700] via-[#FDB931] to-[#B8860B] shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] border border-[#8B6508] flex items-center justify-center">
             <div className="w-12 h-12 rounded-full border-2 border-[#8B6508]/50 bg-[#FDB931]/20" />
          </div>
        </div>
      </motion.button>

      {/* 🏷️ Instruction Label */}
      <div className="absolute -bottom-24 bg-[#D7CCC8] text-[#3E2723] px-6 py-2 font-serif font-bold tracking-widest border-2 border-[#8D6E63] shadow-md transform rotate-1">
        FIG. 1: SIGNAL KEY
      </div>
    </div>
  );
}