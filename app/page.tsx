'use client';

import React, { useState } from 'react';
import EraContainer from './components/core/EraContainer';
import TimeSlider from './components/core/TimeSlider';
import NetworkStatus from './components/core/NetworkStatus';

// Define the Era Types strictly
type EraType = '1840' | '1990' | '2025';

export default function Home() {
  // 1. The Master State - Defaulting to 2025 so judges see modern tech first
  const [currentEra, setCurrentEra] = useState<EraType>('2025');
  
  // 2. Fake Connection State (You can wire this to real socket later)
  const [isConnected, setIsConnected] = useState(true);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black selection:bg-blue-500/30">
      
      {/* 📡 Top Layer: Network Status HUD */}
      <div className="absolute top-6 right-6 z-50 transition-all duration-500">
        <NetworkStatus 
          currentEra={currentEra} 
          isConnected={isConnected} 
        />
      </div>

      {/* 🎭 Middle Layer: The Main Stage */}
      {/* This component handles the background changes and renders the Era Components */}
      <div className="w-full h-full">
        <EraContainer currentEra={currentEra} />
      </div>

      {/* 🎛️ Bottom Layer: The Time Controller */}
      {/* Centered at bottom with high z-index to sit above everything */}
      <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center">
        <TimeSlider 
          currentEra={currentEra} 
          onChange={(era) => setCurrentEra(era as EraType)} 
        />
      </div>

      {/* 🎥 Overlay: Global Film Grain (Optional: adds cinema feel) */}
      <div className="pointer-events-none absolute inset-0 z-60 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </main>
  );
}