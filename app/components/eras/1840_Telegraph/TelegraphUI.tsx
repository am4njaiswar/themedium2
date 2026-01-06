'use client';

import React, { useState, useRef, useEffect } from 'react';
import useMorseTranslator from '@/hooks/useMorseTranslator';
import MorseKey from './MorseKey';
import PaperStrip from './PaperStrip';
import { useSocket } from '@/context/SocketContext';

export default function TelegraphUI() {
  const { currentSequence, translatedMsg, addSignal } = useMorseTranslator();
  
  const { socket } = useSocket();

  // State for visual feedback
  const [isPressed, setIsPressed] = useState(false);
  const pressStartTime = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 📡 AUTOMATIC TRANSMISSION LOGIC
  // This watches for changes in the translated text. 
  // When a new letter is formed, it sends the update to the future.
  useEffect(() => {
    if (socket && translatedMsg) {
      // We send the full message so far. The receiver will see it grow: "H" -> "HE" -> "HEL"
      socket.emit('send_message', { 
        era: '1840', 
        content: translatedMsg,
        sender: 'Telegraph Operator'
      });
    }
  }, [translatedMsg, socket]); // Runs whenever translatedMsg updates

  // 🔊 Sound Engine (Oscillator)
  const playTone = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    // Create oscillator for that authentic 600Hz telegraph beep
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Volume 10%
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15); // Stop automatically after short duration
  };

  // 🖱️ Interaction Handlers
  const handleDown = () => {
    if (isPressed) return; // Prevent double trigger
    setIsPressed(true);
    pressStartTime.current = Date.now();
    playTone();
  };

  const handleUp = () => {
    if (!isPressed) return;
    setIsPressed(false);
    
    const duration = Date.now() - pressStartTime.current;
    
    // Logic: Short press (< 200ms) = Dot, Long = Dash
    if (duration < 200) {
      addSignal('dot');
    } else {
      addSignal('dash');
    }
    // Note: We do NOT emit here. The useEffect above handles it when the letter is finished.
  };

  return (
<div className="flex flex-col items-center justify-between h-full p-4 md:p-8 pb-32 font-serif text-[#3E2723]">
      
      {/* 📜 Top Section: The Paper Strip Output */}
      <div className="w-full flex justify-center mt-4">
        <PaperStrip text={translatedMsg || "START TYPING"} isTyping={isPressed} />
      </div>

      {/* 🔡 Middle Section: Live Feedback */}
      <div className="flex flex-col items-center gap-2 mb-8">
        {/* The Dot/Dash buffer (What you are currently forming) */}
        <div className="h-12 flex items-center justify-center gap-1 text-6xl font-bold text-[#5D4037]">
          {currentSequence.split('').map((char, i) => (
             <span key={i} className="animate-pulse">{char === '.' ? '●' : '▬'}</span>
          ))}
        </div>
        
        {/* Instruction Plate */}
        <div className="mt-4 border-4 border-[#8D6E63] px-6 py-2 bg-[#D7CCC8] shadow-lg transform rotate-1">
          <p className="text-center font-bold tracking-[0.2em] text-[10px] uppercase opacity-70">
            Western Union Telegraph Co.
          </p>
          <p className="text-center text-xs font-bold mt-1 text-[#3E2723]">
            STATUS: <span className="text-green-800">LINE OPEN</span>
          </p>
        </div>
      </div>

      {/* 🔨 Bottom Section: The Morse Key */}
      <div className="mb-8">
        <MorseKey 
          isPressed={isPressed}
          onDown={handleDown}
          onUp={handleUp}
        />
      </div>

    </div>
  );
}