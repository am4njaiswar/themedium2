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
  
  const sliderStyles = {
    '1840': {
      container: 'bg-[#5D4037] border-2 md:border-4 border-[#8D6E63] shadow-[2px_2px_0px_#2D1E17] md:shadow-[4px_4px_0px_#2D1E17]',
      track: 'bg-[#D7CCC8]',
      thumb: 'bg-[#FFD700] border-2 border-[#8D6E63] shadow-md rounded-full',
      text: 'text-[#FDF6E3] font-serif tracking-widest'
    },
    '1990': {
      container: 'bg-[#C0C0C0] border-t border-l border-white border-b border-r border-black shadow-sm',
      track: 'bg-white border inset',
      thumb: 'bg-[#C0C0C0] border-t border-l border-white border-b border-r border-black rounded-none',
      text: 'text-black font-mono uppercase text-xs'
    },
    '2025': {
      container: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl',
      track: 'bg-white/10',
      thumb: 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full',
      text: 'text-white font-sans font-bold tracking-tight'
    }
  };

  const style = sliderStyles[currentEra];

  return (
    // Removed fixed positioning here. Parent controls layout.
    <div className="w-full px-4 md:px-6">
      <div className="w-full max-w-lg mx-auto">
        <motion.div 
          layout
          className={clsx(
            "relative h-10 md:h-16 flex items-center justify-between px-4 md:px-8 transition-all duration-500 rounded-lg md:rounded-xl",
            style.container
          )}
          initial={false}
        >
          {/* The Track Line */}
          <div className={clsx("absolute left-4 md:left-8 right-4 md:right-8 h-0.5 md:h-1 top-1/2 -translate-y-1/2 z-0", style.track)} />

          {/* The Clickable Steps */}
          {ERAS.map((era) => (
            <button
              key={era}
              onClick={() => onChange(era)}
              className="relative z-10 flex flex-col items-center group focus:outline-none w-10 md:w-auto"
            >
              {/* The Dot/Thumb */}
              <motion.div
                className={clsx(
                  "w-4 h-4 md:w-6 md:h-6 transition-all duration-300",
                  style.thumb,
                  currentEra === era ? "scale-125" : "scale-100 opacity-60 hover:opacity-100"
                )}
                layoutId="activeThumb" 
              />
              
              {/* Era Labels (Hidden on mobile to save vertical space, shown on md+) */}
              <span className={clsx(
                "hidden md:block absolute top-8 text-xs whitespace-nowrap transition-opacity duration-300",
                style.text,
                currentEra === era ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              )}>
                {era === '1840' ? 'Telegraph' : era === '1990' ? 'Web 1.0' : 'Future'}
              </span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}