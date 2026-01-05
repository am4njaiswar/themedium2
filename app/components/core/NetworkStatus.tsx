'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Signal, Zap, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

type EraType = '1840' | '1990' | '2025';

interface NetworkStatusProps {
  currentEra: EraType;
  isConnected: boolean;
  latency?: number; // Optional: current ping in ms
}

export default function NetworkStatus({ currentEra, isConnected, latency = 40 }: NetworkStatusProps) {
  
  // Fake fluctuations for realism
  const [displayedLatency, setLatency] = useState(latency);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 1990s internet was unstable, fluctuate more
      const jitter = currentEra === '1990' ? Math.random() * 200 : Math.random() * 5;
      setLatency(Math.floor(latency + jitter));
    }, 2000);
    return () => clearInterval(interval);
  }, [currentEra, latency]);

  // 1840 Design: Industrial Plate
  if (currentEra === '1840') {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-[#4E342E] border-2 border-[#8D6E63] shadow-md rounded">
        <Zap className={`w-5 h-5 ${isConnected ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
        <div className="flex flex-col">
          <span className="text-[10px] text-[#D7CCC8] uppercase tracking-widest leading-none">Western Union</span>
          <span className="text-xs text-yellow-500 font-serif font-bold">
            {isConnected ? 'CIRCUIT CLOSED' : 'LINE BROKEN'}
          </span>
        </div>
      </div>
    );
  }

  // 1990 Design: Terminal Status Bar
  if (currentEra === '1990') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 border-2 border-gray-600 shadow-inner font-mono">
        <Globe className={`w-4 h-4 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
        <span className="text-green-500 text-sm">
          {isConnected ? `CONNECTED ${displayedLatency}ms` : 'NO CARRIER'}
          <span className="animate-pulse">_</span>
        </span>
      </div>
    );
  }

  // 2025 Design: Glass Pil
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
      <div className="relative">
        <div className={`absolute inset-0 rounded-full blur-sm ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} opacity-50 animate-pulse`} />
        <Lock className={`relative w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Encryption</span>
        <span className={`text-xs font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
          AES-256 {isConnected ? 'SECURE' : 'OFFLINE'}
        </span>
      </div>
      <div className="h-4 w-px bg-white/10 mx-1" />
      <span className="text-xs text-gray-300 font-mono">{displayedLatency}ms</span>
    </div>
  );
}