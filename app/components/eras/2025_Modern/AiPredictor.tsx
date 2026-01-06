'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiPredictor({ suggestion }: { suggestion: string }) {
  if (!suggestion) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-start mb-3 px-1"
    >
      <button className="group flex items-center gap-2 pl-2 pr-4 py-1.5 bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-blue-400/20 rounded-full backdrop-blur-md hover:bg-white/5 transition-all">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span className="text-xs text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-blue-300 font-medium group-hover:from-purple-200 group-hover:to-blue-200">
          AI Suggestion: "{suggestion}"
        </span>
      </button>
    </motion.div>
  );
}