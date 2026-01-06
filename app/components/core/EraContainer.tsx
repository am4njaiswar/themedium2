'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// Placeholder imports
import TelegraphUI from '../eras/1840_Telegraph/TelegraphUI';
import TerminalWindow from '../eras/1990_Internet/TerminalWindow';
import GlassChat from '../eras/2025_Modern/GlassChat';

type EraType = '1840' | '1990' | '2025';

interface EraContainerProps {
  currentEra: EraType;
}

// 🎨 Era-specific background styles
const ERA_STYLES = {
  '1840': 'bg-[#FDF6E3] text-[#423D33] font-serif', 
  '1990': 'bg-black text-[#33FF00] font-mono overflow-hidden', 
  '2025': 'bg-slate-900 text-white font-sans antialiased', 
};

// 🎬 Animation Variants
const eraVariants = {
  initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.05, filter: 'blur(20px)' },
};

export default function EraContainer({ currentEra }: EraContainerProps) {
  return (
    <div className={twMerge(
      "relative w-full h-full transition-colors duration-700 ease-in-out flex flex-col items-center overflow-hidden",
      ERA_STYLES[currentEra]
    )}>
      
      {/* 📺 1990s Special Effect */}
      {currentEra === '1990' && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] sm:animate-scanlines opacity-20" />
      )}

      {/* 📜 1840s Special Effect */}
      {currentEra === '1840' && (
        <div className="pointer-events-none absolute inset-0 z-50 mix-blend-multiply opacity-30 sm:opacity-40">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,transparent_1px,#423D33_2px)] bg-size-[8px_8px] opacity-10" />
        </div>
      )}

      {/* 🔮 2025 Special Effect */}
      {currentEra === '2025' && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-tr from-purple-900/20 via-blue-900/10 to-transparent" />
      )}

      {/* 🎭 The Main Stage Content */}
      {/* Changed to flex-1 and h-full to ensure it uses all available vertical space */}
      <div className="relative z-10 w-full max-w-5xl h-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEra}
            variants={eraVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full flex flex-col"
          >
            {/* We removed the fixed padding/margin scales here. 
                Instead, we let the individual components (TelegraphUI, etc.) handle their own internal spacing 
                so they don't get crushed. 
            */}
            <div className="w-full h-full flex flex-col relative">
              {renderEraComponent(currentEra)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 📱 Mobile-Specific Era Indicator (Positioned higher to avoid slider overlap) */}
      <div className="block sm:hidden absolute bottom-24 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className={twMerge(
          "mx-auto max-w-xs text-center px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors duration-300",
          currentEra === '1840' ? "bg-[#5D4037]/90 text-[#FDF6E3]" :
          currentEra === '1990' ? "bg-gray-800/90 text-[#33FF00]" :
          "bg-white/10 text-white backdrop-blur-sm"
        )}>
          {currentEra === '1840' ? 'Telegraph Era • 1840s' :
           currentEra === '1990' ? 'Web 1.0 Era • 1990s' :
           'Future Era • 2025+'}
        </div>
      </div>
    </div>
  );
}

function renderEraComponent(era: EraType) {
  switch (era) {
    case '1840': return <TelegraphUI />;
    case '1990': return <TerminalWindow />;
    case '2025': return <GlassChat />;
    default: return null;
  }
}