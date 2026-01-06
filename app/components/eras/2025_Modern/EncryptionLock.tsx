'use client';

import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EncryptionLock({ isSecured }: { isSecured: boolean }) {
  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: isSecured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)' }}
      className={`
      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors border
      ${isSecured ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'}
    `}>
      {isSecured ? <Lock size={11} strokeWidth={3} /> : <Unlock size={11} strokeWidth={3} />}
      <span>{isSecured ? 'E2E ENCRYPTED' : 'UNSECURED'}</span>
    </motion.div>
  );
}