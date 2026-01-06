'use client'

import React, { useState, useEffect, useRef } from 'react'

interface TelegraphUIProps {
  onSendMessage: (message: string) => void
  isConnected: boolean
}

const TelegraphUI: React.FC<TelegraphUIProps> = ({ onSendMessage, isConnected }) => {
  const [currentMorse, setCurrentMorse] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isPressed, setIsPressed] = useState(false)
  
  const pressStartTime = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const morseToAlpha: { [key: string]: string } = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
    '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
    '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
    '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
    '-.--': 'Y', '--..': 'Z', '.----': '1', '..---': '2', '...--': '3',
    '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
    '----.': '9', '-----': '0', '/': ' '
  }

  // Split dictionary for the layout
  const dictionaryEntries = Object.entries(morseToAlpha);
  const mainGrid = dictionaryEntries.slice(0, 30); // Alphabet + early numbers
  const lastRow = dictionaryEntries.slice(30); // 6, 7, 8, 9, 0, Space

  useEffect(() => {
    if (currentMorse !== '' && !isPressed) {
      timeoutRef.current = setTimeout(() => {
        const char = morseToAlpha[currentMorse] || '?';
        setTranslatedText(prev => prev + char);
        setCurrentMorse('');
      }, 800);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }
  }, [currentMorse, isPressed]);

  const handleKeyDown = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!isConnected) return;
    if (e && e.cancelable) e.preventDefault(); 
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPressed(true);
    pressStartTime.current = Date.now();
  }

  const handleKeyUp = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!isConnected || !isPressed) return;
    if (e && e.cancelable) e.preventDefault();
    setIsPressed(false);
    const duration = Date.now() - pressStartTime.current;
    
    // Standard Telegraph timing: Dot < 200ms, Dash > 200ms
    if (duration < 200) {
      setCurrentMorse(prev => prev + '.');
    } else {
      setCurrentMorse(prev => prev + '-');
    }
  }

  const handleSend = () => {
    if (translatedText.trim()) {
      onSendMessage(translatedText);
      setTranslatedText('');
      setCurrentMorse('');
    }
  }

  return (
    <div className="p-6 text-white font-sans select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-cyan-400">TELEGRAPH STATION</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Manual Morse Encoder</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{isConnected ? 'System Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TAPE DISPLAY */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[100px]"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[100px]"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center min-h-160px">
              <div className="text-5xl font-mono tracking-[0.5em] text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] mb-6 transition-all min-h-60px">
                {currentMorse || <span className="opacity-10">....</span>}
              </div>
              <div className="w-full h-1px bg-linear-to-r from-transparent via-white/20 to-transparent mb-6"></div>
              <div className="text-3xl font-bold tracking-widest uppercase text-white drop-shadow-sm min-h-40px text-center">
                {translatedText || <span className="text-sm font-medium opacity-20 tracking-normal italic uppercase">Awaiting input signal...</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleSend}
              disabled={!translatedText}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 font-bold uppercase py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/20"
            >
              Dispatch Transmission
            </button>
            <button 
              onClick={() => { setTranslatedText(''); setCurrentMorse(''); }}
              className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* TAP KEY */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Signal Input Controller</div>

          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-75 ${isPressed ? 'bg-cyan-500/40 scale-125' : 'bg-transparent scale-100'}`}></div>
            
            <button
              onMouseDown={handleKeyDown}
              onMouseUp={handleKeyUp}
              onMouseLeave={handleKeyUp}
              onTouchStart={handleKeyDown}
              onTouchEnd={handleKeyUp}
              className={`
                relative w-32 h-32 rounded-full border-2 transition-all duration-75 flex items-center justify-center cursor-pointer touch-none
                ${isPressed 
                  ? 'bg-cyan-500 border-white scale-95 shadow-[0_0_40px_rgba(34,211,238,0.5)]' 
                  : 'bg-black/40 border-cyan-500/50 hover:border-cyan-400 shadow-xl'}
              `}
            >
              <span className={`font-black text-lg uppercase pointer-events-none tracking-tight ${isPressed ? 'text-black' : 'text-cyan-400'}`}>
                {isPressed ? 'SIGNAL' : 'TAP'}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
              Tap for <span className="text-cyan-400 font-bold px-1 text-xs">●</span> 
              <span className="mx-2">|</span> 
              Hold for <span className="text-cyan-400 font-bold px-1 text-xs">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SIGNAL REFERENCE */}
      <div className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6">
        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6 text-center opacity-80">Morse Dictionary Reference</h3>
        
        {/* Main Alpha-Numeric Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3 mb-4">
          {mainGrid.map(([code, letter]) => (
            <div key={letter} className="flex flex-col items-center p-2 rounded-lg bg-white/0.03 border border-white/5 hover:border-cyan-500/30 transition-colors group">
              <span className="text-sm font-bold text-gray-300 group-hover:text-cyan-400 transition-colors">{letter}</span>
              <span className="text-[10px] font-mono text-cyan-400/80 group-hover:text-cyan-400 font-bold transition-colors">{code}</span>
            </div>
          ))}
        </div>

        {/* Centered Last Row */}
        <div className="flex flex-wrap justify-center gap-3">
          {lastRow.map(([code, letter]) => (
            <div key={letter} className="flex flex-col items-center p-2 min-w-70px rounded-lg bg-white/0.03 border border-white/5 hover:border-cyan-500/30 transition-colors group">
              <span className="text-sm font-bold text-gray-300 group-hover:text-cyan-400 transition-colors">{letter === ' ' ? 'SPACE' : letter}</span>
              <span className="text-[10px] font-mono text-cyan-400/80 group-hover:text-cyan-400 font-bold transition-colors">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TelegraphUI