'use client'

import React, { useState, useEffect } from 'react'

interface SwitchBoardUIProps {
  message: string
  onSendMessage: (message: string) => void
  isConnected: boolean
}

const SwitchBoardUI: React.FC<SwitchBoardUIProps> = ({ onSendMessage, isConnected }) => {
  const [input, setInput] = useState('')
  const [activeCord, setActiveCord] = useState<number | null>(null)
  const [isPluggedIn, setIsPluggedIn] = useState(false)
  const [operatorStatus, setOperatorStatus] = useState('Monitoring...')
  const [leverPosition, setLeverPosition] = useState<'TALK' | 'MONITOR'>('MONITOR')
  
  // Simulation of physical jack lights
  const [ports, setPorts] = useState([
    { id: 1, label: 'NEW YORK', calling: false, busy: false },
    { id: 2, label: 'LONDON', calling: true, busy: false }, // Start with one incoming
    { id: 3, label: 'PARIS', calling: false, busy: true },
    { id: 4, label: 'BERLIN', calling: false, busy: false },
    { id: 5, label: 'CHICAGO', calling: false, busy: false },
    { id: 6, label: 'SAN FRAN', calling: false, busy: false },
  ])

  // Randomly simulate incoming calls (Signal Lamps)
  useEffect(() => {
    const timer = setInterval(() => {
      setPorts(prev => prev.map(p => 
        Math.random() > 0.85 && !p.busy && !p.calling ? { ...p, calling: true } : p
      ))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleJackPlug = (id: number) => {
    if (activeCord === id) {
      // Unplugging
      setActiveCord(null)
      setIsPluggedIn(false)
      setOperatorStatus('Monitoring...')
    } else {
      // Plugging in the cord
      setActiveCord(id)
      setIsPluggedIn(true)
      setOperatorStatus(`Connected to ${ports.find(p => p.id === id)?.label}`)
      // Clear the "Calling" lamp once answered
      setPorts(prev => prev.map(p => p.id === id ? { ...p, calling: false, busy: true } : p))
    }
  }

  const handleSend = () => {
    if (!input.trim() || !activeCord || leverPosition !== 'TALK') return
    onSendMessage(`[OPERATOR PATCH @ ${ports.find(p => p.id === activeCord)?.label}] ${input}`)
    setInput('')
    setOperatorStatus('Transmission Routed')
    setTimeout(() => setOperatorStatus(`Connected to ${ports.find(p => p.id === activeCord)?.label}`), 2000)
  }

  return (
    <div className="p-4 md:p-8 bg-[#1a1a1a] text-amber-500 font-mono min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-amber-900 pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-amber-600">Western Electric Co.</h2>
          <p className="text-xs text-amber-700 font-bold">MODEL 1924 MANUAL CROSS-EXCHANGE UNIT</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] mb-1">LEVER STATE</span>
            <div className="bg-black p-1 rounded-lg border border-amber-900 flex gap-2">
              <button 
                onClick={() => setLeverPosition('TALK')}
                className={`px-3 py-1 text-xs rounded ${leverPosition === 'TALK' ? 'bg-amber-600 text-black' : 'text-amber-900'}`}
              >TALK</button>
              <button 
                onClick={() => setLeverPosition('MONITOR')}
                className={`px-3 py-1 text-xs rounded ${leverPosition === 'MONITOR' ? 'bg-amber-600 text-black' : 'text-amber-900'}`}
              >MON</button>
            </div>
          </div>
          <div className="bg-amber-950/20 px-6 py-3 border border-amber-600/30 rounded flex flex-col justify-center">
            <span className="text-[10px] block opacity-50">STATUS</span>
            <span className="text-sm font-bold animate-pulse">{operatorStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THE PLUG BOARD (JACKS) */}
        <div className="lg:col-span-2 bg-[#121212] p-8 rounded-3xl border-t-4 border-amber-900 shadow-2xl relative overflow-hidden">
            {/* Wooden Texture Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            
            <h3 className="text-center text-xs font-bold mb-8 tracking-[0.4em] text-amber-800">MAIN EXCHANGE TRUNKS</h3>
            
            <div className="grid grid-cols-3 gap-y-12 gap-x-8">
                {ports.map((port) => (
                    <div key={port.id} className="flex flex-col items-center gap-3">
                        {/* Signal Lamp */}
                        <div className={`w-4 h-4 rounded-full border-2 border-black shadow-inner transition-all duration-300 ${
                            port.calling ? 'bg-red-500 shadow-[0_0_15px_red] animate-pulse' : 
                            port.busy ? 'bg-amber-900' : 'bg-gray-900'
                        }`}></div>
                        
                        {/* The Jack (Socket) */}
                        <button 
                            onClick={() => handleJackPlug(port.id)}
                            className="group relative w-16 h-16 rounded-full bg-linear-to-b from-gray-800 to-black border-4 border-[#2a2a2a] flex items-center justify-center shadow-lg active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-black border-2 border-amber-900 flex items-center justify-center">
                                <div className={`w-4 h-4 rounded-full transition-colors ${activeCord === port.id ? 'bg-amber-500 shadow-[0_0_10px_amber]' : 'bg-zinc-900'}`}></div>
                            </div>
                            
                            {/* The Cord Animation */}
                            {activeCord === port.id && (
                                <div className="absolute top-1/2 left-1/2 w-50 h-0.5 bg-amber-600/40 origin-left -rotate-45 pointer-events-none blur-sm"></div>
                            )}
                        </button>
                        
                        <span className="text-[10px] font-black tracking-widest text-amber-700 uppercase">{port.label}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* OPERATOR CONTROL STATION */}
        <div className="flex flex-col gap-6">
            <div className="bg-[#222] p-6 rounded-xl border-l-4 border-amber-700 flex-1">
                <h3 className="font-bold text-sm mb-4 border-b border-amber-900 pb-2">OPERATOR MOUTHPIECE</h3>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={leverPosition !== 'TALK' || !isPluggedIn}
                    placeholder={!isPluggedIn ? "PLUG IN TO START..." : "AWAITING TRANSMISSION..."}
                    className="w-full bg-black/50 border border-amber-900/50 rounded-lg p-4 text-amber-400 text-sm h-40 focus:outline-none focus:border-amber-500 disabled:opacity-30 resize-none font-serif italic"
                />
                
                <button
                    onClick={handleSend}
                    disabled={!isPluggedIn || !input.trim() || leverPosition !== 'TALK'}
                    className={`w-full mt-4 py-4 rounded-lg font-black tracking-[0.2em] transition-all ${
                        !isPluggedIn || !input.trim() || leverPosition !== 'TALK'
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-amber-600 text-black hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                    }`}
                >
                    SEND TRANSMISSION
                </button>
            </div>

            <div className="bg-amber-950/10 border border-amber-900 p-4 rounded text-[10px] leading-relaxed italic text-amber-800">
                NOTICE: To route a call, plug the brass patch cord into the calling station. 
                Toggle the lever to 'TALK' to speak. Unplug to clear the trunk line for next exchange.
            </div>
        </div>
      </div>
    </div>
  )
}

export default SwitchBoardUI