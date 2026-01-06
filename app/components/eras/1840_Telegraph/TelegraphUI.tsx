'use client';

import React, { useState, useRef, useEffect } from 'react';
import useMorseTranslator from '@/hooks/useMorseTranslator';
import MorseKey from './MorseKey';
import PaperStrip from './PaperStrip';
import { useSocket } from '@/context/SocketContext';
import { Send, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Telegram {
  id: number;
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp: string;
}

export default function TelegraphUI() {
  const { currentSequence, translatedMsg, addSignal, clearMessage, encodeToMorse } = useMorseTranslator();
  const { socket } = useSocket();
  
  const [isPressed, setIsPressed] = useState(false);
  const [rawTape, setRawTape] = useState(""); 
  const [prevMsgLength, setPrevMsgLength] = useState(0); 
  const [history, setHistory] = useState<Telegram[]>([]); 
  
  const pressStartTime = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Listen for Incoming Messages
  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data: any) => {
      if (data.sender !== 'Telegraph Operator') {
        const morseMessage = encodeToMorse(data.content || data.text).replace(/\./g, '•').replace(/-/g, '—');
        playIncomingSound();
        setHistory(prev => [...prev, {
          id: Date.now(),
          type: 'incoming',
          text: morseMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };
    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [socket, encodeToMorse]);

  // 2. Auto-Space Logic
  useEffect(() => {
     if (translatedMsg.length > prevMsgLength) {
       setRawTape(prev => prev + "\u00A0\u00A0\u00A0"); 
       setPrevMsgLength(translatedMsg.length);
     } else if (translatedMsg.length === 0) setPrevMsgLength(0);
  }, [translatedMsg, prevMsgLength]);

  // 3. Auto-Scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  // Audio & Interaction Handlers
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
    if (duration < 200) { addSignal('dot'); setRawTape(prev => prev + "•"); } 
    else { addSignal('dash'); setRawTape(prev => prev + "—"); }
  };

  const handleTransmit = () => {
    if (!translatedMsg) return;
    if (socket) {
      socket.emit('send_message', { era: '1840', content: translatedMsg, sender: 'Telegraph Operator' });
    }
    setHistory(prev => [...prev, {
      id: Date.now(), type: 'outgoing', text: rawTape, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    clearMessage(); setRawTape(""); setPrevMsgLength(0);
  };

  const handleClear = () => { clearMessage(); setRawTape(""); setPrevMsgLength(0); };

  return (
    <div className="flex flex-col h-full w-full font-serif text-[#3E2723] overflow-hidden">
      
      {/* 📜 SECTION 1: HISTORY LOG */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-16 pb-4 md:px-8 space-y-4 scrollbar-hide w-full max-w-4xl mx-auto"
      >
        <AnimatePresence mode="popLayout">
          {history.length === 0 && (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.4 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full italic space-y-2 text-center mt-10"
            >
              <span className="text-lg md:text-xl">NO TRANSMISSIONS YET</span>
              <span className="text-xs md:text-sm">Tap the key below to begin...</span>
            </motion.div>
          )}
          
          {history.map((msg) => (
            <motion.div 
              key={msg.id}
              layout // Helps items slide smoothly when new ones are added
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] md:max-w-[70%] p-3 md:p-4 shadow-md rotate-1 flex flex-col gap-1 rounded-sm
                ${msg.type === 'incoming' 
                  ? 'bg-[#EFEBE9] border-l-4 border-[#8D6E63] text-left' 
                  : 'bg-[#FFF8E1] border-r-4 border-[#FFB300] text-right'}
              `}>
                <div className="flex justify-between items-center opacity-60 text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-1">
                  <span>{msg.type === 'incoming' ? 'RECEIVED' : 'SENT'}</span>
                  <span className="ml-2">{msg.timestamp}</span>
                </div>
                <div className="font-mono text-sm md:text-lg leading-tight tracking-tight font-bold break-words">
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="h-4" />
      </div>

      {/* Gradient Mask */}
      <div className="h-6 w-full bg-gradient-to-b from-transparent to-[#D7CCC8]/20 shrink-0" />

      {/* ⚡ SECTION 2: ACTIVE STATION */}
      <div className="shrink-0 bg-[#D7CCC8]/20 backdrop-blur-sm border-t border-[#8D6E63]/30 pb-20 md:pb-28 pt-2 px-2 md:px-4 relative z-20">
        
        <div className="w-full flex flex-col items-center gap-2 mb-2">
           <div className="w-full flex justify-center">
              <PaperStrip text={rawTape || ""} isTyping={isPressed} />
           </div>

           {/* --- FIX: ADDED explicit keys 'clear-btn' and 'send-btn' --- */}
           <div className="flex gap-4 justify-center h-8">
             {rawTape && (
               <AnimatePresence mode="popLayout">
                 <motion.button 
                    key="clear-btn" 
                    initial={{opacity: 0, scale: 0.8}} 
                    animate={{opacity: 1, scale: 1}} 
                    exit={{opacity: 0, scale: 0.8}}
                    onClick={handleClear} 
                    className="bg-[#D7CCC8] text-[#3E2723] px-3 py-1 rounded border border-[#8D6E63] hover:bg-[#EFEBE9] shadow-sm flex items-center"
                 >
                   <RotateCcw size={14} />
                 </motion.button>
                 
                 {translatedMsg && (
                    <motion.button 
                       key="send-btn"
                       initial={{opacity: 0, scale: 0.8}} 
                       animate={{opacity: 1, scale: 1}} 
                       exit={{opacity: 0, scale: 0.8}}
                       onClick={handleTransmit} 
                       className="bg-[#3E2723] text-[#EFEBE9] px-4 py-1 rounded border border-[#5D4037] font-bold tracking-widest hover:bg-[#5D4037] flex items-center gap-2 shadow-md text-xs md:text-sm"
                    >
                        <span>SEND</span>
                        <Send size={14} />
                    </motion.button>
                 )}
               </AnimatePresence>
             )}
           </div>
           {/* --- FIX END --- */}
        </div>

        <div className="flex justify-center -mt-2 md:mt-0">
            <MorseKey isPressed={isPressed} onDown={handleDown} onUp={handleUp} />
        </div>
      </div>
    </div>
  );
}