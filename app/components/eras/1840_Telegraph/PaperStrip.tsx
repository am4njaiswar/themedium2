'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaperStripProps {
  text: string;
  isTyping: boolean;
}

export default function PaperStrip({ text, isTyping }: PaperStripProps) {
  // Split text into an array of characters for individual animation
  const chars = text.split('');

  return (
    <div className="relative w-full max-w-3xl h-32 bg-[#EFEBE9] border-y-8 border-[#5D4037] shadow-2xl flex items-center overflow-hidden rounded-lg">
      
      {/* 🎨 Background Texture & Guides */}
      <div className="absolute inset-0 opacity-20 bg-[url('/assets/images/paper-texture.png')] pointer-events-none" />
      <div className="absolute top-4 left-0 right-0 h-px bg-[#8D6E63] opacity-30" />
      <div className="absolute bottom-4 left-0 right-0 h-px bg-[#8D6E63] opacity-30" />

      {/* 🎞️ The Scrolling Character Stream */}
      <div className="flex items-center justify-end w-full px-8 gap-1">
        <AnimatePresence>
          {chars.map((char, index) => (
            <motion.span
              key={index} // Using index is okay here as we only append
              initial={{ opacity: 0, x: 20, rotate: Math.random() * 10 - 5 }} // Slight random tilt like real ink
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              className="font-mono text-5xl font-bold text-[#3E2723] tracking-widest"
            >
              {char}
            </motion.span>
          ))}
        </AnimatePresence>
        
        {/* ink-head blinking cursor */}
        {isTyping && (
            <motion.div 
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-4 h-12 bg-[#3E2723] ml-2 rounded-sm"
            />
        )}
      </div>
    </div>
  );
}