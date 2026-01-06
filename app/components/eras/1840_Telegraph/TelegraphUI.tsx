'use client';

import React, { useState, useRef, useEffect } from 'react';
import useMorseTranslator from '@/hooks/useMorseTranslator';
import MorseKey from './MorseKey';
import PaperStrip from './PaperStrip';
import { useSocket } from '@/context/SocketContext';
import { Send, RotateCcw, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Shape of a message in our 1840s history
interface Telegram {
  id: number;
  type: 'incoming' | 'outgoing';
  text: string; // The Morse Code content
}

export default function TelegraphUI() {
  const { currentSequence, translatedMsg, addSignal, clearMessage, encodeToMorse } = useMorseTranslator();
  const { socket } = useSocket();
  
  // State
  const [isPressed, setIsPressed] = useState(false);
  const [rawTape, setRawTape] = useState(""); // Current typing buffer
  const [history, setHistory] = useState<Telegram[]>([]); // Chat History
  
  const pressStartTime = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 👂 LISTEN FOR INCOMING
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      if (data.sender !== 'Telegraph Operator') {
        // Encode English -> Morse
        const morseMessage = encodeToMorse(data.content || data.text)
          .replace(/\./g, '•')
          .replace(/-/g, '—');
        
        playIncomingSound();

        // Add to history stack
        setHistory(prev => [...prev, {
          id: Date.now(),
          type: 'incoming',
          text: morseMessage
        }]);
      }
    };

    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [socket, encodeToMorse]);

  // Auto-scroll history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // 🔊 Sounds
  const playIncomingSound = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const playTone = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15); 
  };

  // 🖱️ Interaction
  const handleDown = () => {
    if (isPressed) return; 
    setIsPressed(true);
    pressStartTime.current = Date.now();
    playTone();
  };

  const handleUp = () => {
    if (!isPressed) return;
    setIsPressed(false);
    
    const duration = Date.now() - pressStartTime.current;
    if (duration < 200) {
      addSignal('dot');
      setRawTape(prev => prev + "• ");
    } else {
      addSignal('dash');
      setRawTape(prev => prev + "— ");
    }
  };

  // 🚀 TRANSMIT
  const handleTransmit = () => {
    if (!translatedMsg) return;

    if (socket) {
      // 1. Send Data
      socket.emit('send_message', { 
        era: '1840', 
        content: translatedMsg, 
        sender: 'Telegraph Operator'
      });

      // 2. Add "Sent" strip to history
      setHistory(prev => [...prev, {
        id: Date.now(),
        type: 'outgoing',
        text: rawTape // Keep the raw dots/dashes for history
      }]);

      // 3. Reset
      clearMessage(); 
      setRawTape(""); 
    }
  };

  const handleClear = () => {
    clearMessage();
    setRawTape("");
  };

  return (
    <div className="flex flex-col h-full font-serif text-[#3E2723] overflow-hidden">
      
      {/* 📜 SECTION 1: HISTORY LOG (The Wall of Messages) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide mask-gradient-t"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {history.length === 0 && (
            <div className="text-center opacity-40 mt-10 italic">NO TRANSMISSIONS YET</div>
          )}
          
          {history.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.type === 'incoming' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              {/* ✉️ The Visual Card */}
              <div className={`
                max-w-[80%] p-4 shadow-md rotate-1
                ${msg.type === 'incoming' 
                  ? 'bg-[#EFEBE9] border-l-4 border-[#8D6E63] text-left' 
                  : 'bg-[#FFF8E1] border-r-4 border-[#FFB300] text-right'}
              `}>
                <div className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-1">
                  {msg.type === 'incoming' ? 'RECEIVED WIRE' : 'SENT TRANSMISSION'}
                </div>
                <div className="font-mono text-lg leading-none tracking-tighter font-bold break-words">
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ⚡ SECTION 2: ACTIVE STATION (Fixed at Bottom) */}
      <div className="bg-[#D7CCC8]/10 backdrop-blur-sm border-t border-[#8D6E63]/30 pb-32 pt-4 px-4">
        
        {/* The Live Typing Strip */}
        <div className="w-full flex justify-center relative mb-8">
           <PaperStrip text={rawTape || "READY TO TRANSMIT"} isTyping={isPressed} />
           
           {/* Actions */}
           <div className="absolute -bottom-12 flex gap-4">
             {rawTape && (
               <>
                 <button onClick={handleClear} className="bg-[#D7CCC8] text-[#3E2723] px-3 py-1 rounded border-2 border-[#8D6E63] hover:bg-[#EFEBE9] active:translate-y-1">
                   <RotateCcw size={16} />
                 </button>
                 {translatedMsg && (
                    <button onClick={handleTransmit} className="bg-[#3E2723] text-[#EFEBE9] px-6 py-1 rounded border-2 border-[#5D4037] font-bold tracking-widest hover:bg-[#5D4037] active:translate-y-1 flex items-center gap-2">
                        <span>SEND</span>
                        <Send size={16} />
                    </button>
                 )}
               </>
             )}
           </div>
        </div>

        {/* Live Feedback */}
        <div className="flex justify-center h-8 text-4xl font-bold text-[#5D4037] mb-4">
           {currentSequence.split('').map((char, i) => (
             <span key={i} className="animate-pulse">{char === '.' ? '●' : '▬'}</span>
           ))}
        </div>

        {/* The Key */}
        <div className="flex justify-center">
            <MorseKey isPressed={isPressed} onDown={handleDown} onUp={handleUp} />
        </div>
      </div>
    </div>
  );
}