'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type EraType = '1840' | '1990' | '2025';

interface TimeSliderProps {
  currentEra: EraType;
  onChange: (era: EraType) => void;
}

const ERAS: EraType[] = ['1840', '1990', '2025'];

export default function TimeSlider({ currentEra, onChange }: TimeSliderProps) {
  
  // 🎨 Dynamic styles based on Era
  const sliderStyles = {
    '1840': {
      container: 'bg-[#5D4037] border-4 border-[#8D6E63] shadow-[4px_4px_0px_#2D1E17]', // Wood
      track: 'bg-[#D7CCC8]',
      thumb: 'bg-[#FFD700] border-2 border-[#8D6E63] shadow-md rounded-full', // Brass Knob
      text: 'text-[#FDF6E3] font-serif tracking-widest'
    },
    '1990': {
      container: 'bg-[#C0C0C0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black shadow-md', // Win95
      track: 'bg-white border inset',
      thumb: 'bg-[#C0C0C0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black rounded-none', // Grey Block
      text: 'text-black font-mono uppercase'
    },
    '2025': {
      container: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl', // Glass
      track: 'bg-white/10',
      thumb: 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full', // Neon Glow
      text: 'text-white font-sans font-bold tracking-tight'
    }
  };

  const style = sliderStyles[currentEra];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <motion.div 
        layout
        className={clsx(
          "relative h-16 flex items-center justify-between px-6 transition-all duration-500",
          style.container
        )}
        initial={false}
      >
        {/* The Track Line */}
        <div className={clsx("absolute left-6 right-6 h-1 top-1/2 -translate-y-1/2 z-0", style.track)} />

        {/* The Clickable Steps */}
        {ERAS.map((era) => (
          <button
            key={era}
            onClick={() => onChange(era)}
            className="relative z-10 flex flex-col items-center group focus:outline-none"
          >
            {/* The Dot/Thumb */}
            <motion.div
              className={clsx(
                "w-6 h-6 transition-all duration-300",
                style.thumb,
                currentEra === era ? "scale-125" : "scale-100 hover:scale-110 opacity-60"
              )}
              layoutId="activeThumb" 
            />
            
            <span className={clsx(
              "absolute top-8 text-xs md:text-sm whitespace-nowrap transition-opacity duration-300",
              style.text,
              currentEra === era ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            )}>
              {era === '1840' ? 'Telegraph' : era === '1990' ? 'Web 1.0' : 'Future'}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}