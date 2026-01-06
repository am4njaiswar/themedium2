'use client';

import React, { useState, useEffect } from 'react';
import EraContainer from './components/core/EraContainer';
import TimeSlider from './components/core/TimeSlider';
import NetworkStatus from './components/core/NetworkStatus';
import useSocket from '@/hooks/useSocket';


// Define the Era Types strictly
type EraType = '1840' | '1990' | '2025';

export default function Home() {
  // 1. The Master State
  const [currentEra, setCurrentEra] = useState<EraType>('2025');
  
  // 2. 🔌 REAL SOCKET CONNECTION
  const socket = useSocket(); 
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);

  // 3. Listen for Server Events
  useEffect(() => {
    if (!socket) return;

    // A. Connection Events
    const onConnect = () => {
      console.log("✅ Frontend connected to Server!");
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("❌ Frontend disconnected.");
      setIsConnected(false);
    };

    // B. Latency Check (Ping/Pong)
    // You can send a ping from the server or just simulate jitter here
    // For now, we trust the socket's internal connected state
    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    // C. Listen for latency updates (if your server sends them)
    socket.on('pong', (ms) => setLatency(ms));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pong');
    };
  }, [socket]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black selection:bg-blue-500/30">
      
      {/* 📡 Top Layer: REAL Network Status HUD */}
      <div className="absolute top-6 right-6 z-50 transition-all duration-500">
        <NetworkStatus 
          currentEra={currentEra} 
          isConnected={isConnected} // Now driven by the real backend
          latency={isConnected ? (currentEra === '1840' ? 0 : 45) : 0} // Fake latency numbers for UI effect
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

      {/* 🎥 Overlay: Global Film Grain (Adds that cinema feel) */}
      <div className="pointer-events-none absolute inset-0 z-60 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </main>
  );
}