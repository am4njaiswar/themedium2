'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Placeholder imports - replace these with your actual files later
import TelegraphUI from '../eras/1840_Telegraph/TelegraphUI';
import TerminalWindow from '../eras/1990_Internet/TerminalWindow';
import GlassChat from '../eras/2025_Modern/GlassChat';

type EraType = '1840' | '1990' | '2025';

interface EraContainerProps {
  currentEra: EraType;
}

// 🎨 Era-specific background styles
const ERA_STYLES = {
  '1840': 'bg-[#FDF6E3] text-[#423D33] font-serif', // Old Paper Theme
  '1990': 'bg-black text-[#33FF00] font-mono overflow-hidden', // Matrix/Terminal Theme
  '2025': 'bg-slate-900 text-white font-sans antialiased', // Modern Dark Mode
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
      "relative w-full h-full min-h-screen transition-colors duration-700 ease-in-out flex flex-col items-center justify-center p-4 md:p-8",
      ERA_STYLES[currentEra]
    )}>
      
      {/* 📺 1990s Special Effect: CRT Scanlines Overlay */}
      {currentEra === '1990' && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] animate-scanlines opacity-20" />
      )}

      {/* 📜 1840s Special Effect: Vignette & Grain */}
      {currentEra === '1840' && (
        <div className="pointer-events-none absolute inset-0 z-50 mix-blend-multiply bg-[url('/assets/images/paper-texture.png')] opacity-40" />
      )}

      {/* 🔮 2025 Special Effect: Ambient Glow */}
      {currentEra === '2025' && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-tr from-purple-900/20 via-blue-900/10 to-transparent" />
      )}

      {/* 🎭 The Main Stage Content */}
      <div className="relative z-10 w-full max-w-4xl h-[80vh] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEra}
            variants={eraVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {renderEraComponent(currentEra)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to switch components
function renderEraComponent(era: EraType) {
  switch (era) {
    case '1840': return <TelegraphUI />;
    case '1990': return <TerminalWindow />;
    case '2025': return <GlassChat />;
    default: return null;
  }
}