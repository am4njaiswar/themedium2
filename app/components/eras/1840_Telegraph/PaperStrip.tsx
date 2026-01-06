'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PaperStripProps {
  text: string;
  isTyping: boolean;
}

export default function PaperStrip({ text, isTyping }: PaperStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stripRef.current) {
      stripRef.current.scrollLeft = stripRef.current.scrollWidth;
    }
  }, [text]);

  return (
    // Height constrained to prevent layout shifts
    <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#f5f0e6] to-[#e8e0d0] rounded-sm md:rounded-lg border-2 border-amber-900/30 shadow-inner overflow-hidden h-20 md:h-28">
      
      {/* Vintage Paper Texture */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' ... (truncated for brevity, keep original SVG) ... %3E%3C/svg%3E")`
        }}
      />
      
      {/* Left Perforations */}
      <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 flex flex-col items-center justify-between py-2 bg-black/5">
        {[...Array(8)].map((_, i) => (
          <div key={`l-${i}`} className="w-1.5 h-1.5 bg-amber-900/20 rounded-full"></div>
        ))}
      </div>
      
      {/* Right Perforations */}
      <div className="absolute right-0 top-0 bottom-0 w-3 md:w-4 flex flex-col items-center justify-between py-2 bg-black/5">
        {[...Array(8)].map((_, i) => (
          <div key={`r-${i}`} className="w-1.5 h-1.5 bg-amber-900/20 rounded-full"></div>
        ))}
      </div>

      {/* Content Area */}
      <div className="relative px-5 md:px-8 py-2 md:py-4 h-full flex flex-col justify-center">
        
        {/* Header - Hidden on very small screens to save space */}
        <div className="hidden md:flex justify-between items-center mb-2 border-b border-amber-900/20 pb-1">
          <div className="text-[10px] font-bold tracking-widest text-amber-900/70 uppercase">Telegraph Tape</div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-amber-900/30'}`}></div>
            <span className="text-[10px] text-amber-900/50 font-mono">{isTyping ? 'REC' : 'IDLE'}</span>
          </div>
        </div>

        {/* Morse Stream - The important part */}
        <div 
          ref={stripRef}
          className="overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center h-full"
        >
          <div className="inline-flex items-center gap-2 md:gap-3 min-w-full px-4">
            {/* Start Marker */}
            <div className="text-[10px] text-amber-900/40 font-mono">START</div>

            {text ? (
              <div className="flex items-center gap-2 md:gap-4">
                {text.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-2xl md:text-3xl font-bold font-mono ${char === '•' ? 'text-amber-800' : 'text-amber-950'}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="text-amber-900/30 text-sm md:text-lg italic font-serif px-4">
                Tap key to transmit...
              </div>
            )}
            
            {/* Blinking Cursor */}
            <div className="w-2 h-4 bg-amber-900/50 animate-pulse ml-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}