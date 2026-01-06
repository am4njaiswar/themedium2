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
    // Reduced min-height for mobile to prevent overlap
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[160px] md:min-h-[250px] overflow-hidden md:overflow-visible">
      
      {/* WRAPPER for Scaling: 
         On mobile, we scale the whole assembly down (0.7) so it fits in the small footer.
         On desktop, we use scale 1.0.
      */}
      <div className="scale-[0.65] sm:scale-75 md:scale-100 origin-center flex items-center justify-center relative">
        
        {/* 🪵 The Wooden Base Platform */}
        <div className="absolute top-4 md:top-6 w-[180px] h-[180px] md:w-64 md:h-64 rounded-full bg-[#3E2723] border-4 border-[#281815] shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-0 flex items-center justify-center">
          {/* Wood grain */}
          <div className="absolute inset-0 rounded-full opacity-20 bg-[repeating-linear-gradient(45deg,#3E2723,#3E2723_10px,#4E342E_10px,#4E342E_20px)]" />
          {/* Screws */}
          <div className="absolute top-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
          <div className="absolute bottom-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
          <div className="absolute left-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
          <div className="absolute right-4 w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
        </div>

        {/* ⚙️ The Mechanism Arm */}
        <div className="absolute w-[180px] h-8 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 shadow-lg z-0 top-1/2 -translate-y-1/2" />

        {/* 🔨 The Physical Button (The "Knob") */}
        <motion.button
          whileTap={{ scale: 0.95, y: 12 }} 
          animate={{ y: isPressed ? 12 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          
          onMouseDown={onDown}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={(e) => {
            e.preventDefault();
            onDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onUp();
          }}
          
          className="relative z-10 group focus:outline-none cursor-pointer"
          style={{ touchAction: 'none' }} // Prevents zoom/scroll on rapid tapping
        >
          {/* The Knob Handle */}
          <div className={`
            w-[150px] h-[150px] rounded-full 
            bg-gradient-to-b from-[#1a1a1a] to-[#000000]
            border-b-8 border-[#333]
            shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_5px_10px_rgba(255,255,255,0.1)]
            flex items-center justify-center
            transition-all duration-75
            ${isPressed ? 'shadow-[0_5px_10px_rgba(0,0,0,0.5)] border-b-2' : ''}
          `}>
            
            {/* Top Reflection */}
            <div className="absolute top-4 left-8 w-16 h-8 bg-white/10 rounded-full blur-sm rotate-[-15deg]" />
            
            {/* Brass Ring Center */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#B8860B] shadow-inner border border-[#8B6508] flex items-center justify-center">
               <div className="w-12 h-12 rounded-full border-2 border-[#8B6508]/50 bg-[#FDB931]/20" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* 🏷️ Instruction Label */}
      <div className="absolute bottom-2 md:bottom-[-20px] bg-[#D7CCC8] text-[#3E2723] px-3 py-1 font-serif font-bold tracking-widest border border-[#8D6E63] shadow-md transform rotate-1 text-[10px] md:text-xs z-20 pointer-events-none opacity-80 md:opacity-100">
        FIG. 1: SIGNAL KEY
      </div>
    </div>
  );
}