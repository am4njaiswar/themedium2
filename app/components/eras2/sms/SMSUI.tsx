'use client'

import React, { useState, useEffect, useRef } from 'react'

interface SMSUIProps {
  message: string
  onSendMessage: (message: string) => void
  messages: Array<{ id: number; text: string; sender: string; timestamp: string }>
}

const SMSUI: React.FC<SMSUIProps> = ({ message, onSendMessage, messages }) => {
  const [input, setInput] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [signalStrength, setSignalStrength] = useState(4)
  const [balance, setBalance] = useState(5.00)
  const [deliveryStatus, setDeliveryStatus] = useState('')
  const [keypadMode, setKeypadMode] = useState<'alpha' | 'numeric'>('alpha')
  
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const maxCharacters = 160

  useEffect(() => {
    setCharacterCount(input.length)
  }, [input])

  const isPhoneValid = (num: string) => {
    const digitsOnly = num.replace(/\D/g, '')
    return digitsOnly.length >= 10 && digitsOnly.length <= 15
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const validatedValue = val.replace(/[^0-9+\-()\s]/g, '')
    setPhoneNumber(validatedValue)
  }

  const handleSend = () => {
    if (!phoneNumber.trim()) {
      setDeliveryStatus('⚠️ Phone number required')
      setTimeout(() => setDeliveryStatus(''), 3000)
      return
    }
    
    if (!input.trim() || isSending || characterCount > maxCharacters) return
    
    setIsSending(true)
    setDeliveryStatus('📤 Sending...')

    setTimeout(() => {
      if (!isPhoneValid(phoneNumber)) {
        setDeliveryStatus('❌ Failed: Invalid Number')
        setIsSending(false)
        return
      }

      if (balance < 0.10) {
        setDeliveryStatus('❌ Failed: No Balance')
        setIsSending(false)
        return
      }

      onSendMessage(input)
      setInput('')
      setBalance(prev => parseFloat((prev - 0.10).toFixed(2)))
      setDeliveryStatus('✅ Delivered')
      
      // Removed the "Received" auto-reply timeout from here
      
      setIsSending(false)
      setTimeout(() => setDeliveryStatus(''), 3000)
    }, 1200)
  }

  const handleKeyPress = (key: string) => {
    setInput(prev => prev + key)
  }

  const getSignalBars = (strength: number) => {
    return Array(5).fill(0).map((_, i) => (
      <div
        key={i}
        className={`w-1 ${i < strength ? 'bg-green-500' : 'bg-gray-600'}`}
        style={{ height: `${(i + 1) * 4}px` }}
      ></div>
    ))
  }

  const alphaRows = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
    ['O', 'P', 'Q', 'R', 'S', 'T', 'U']
  ]
  const centeredRow = ['V', 'W', 'X', 'Y', 'Z']
  const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

  return (
    <div className="p-6">
      <input type="file" accept="image/*" ref={photoRef} className="hidden" onChange={() => setDeliveryStatus('🖼️ Image Selected')} />
      <input type="file" accept="video/*" ref={videoRef} className="hidden" onChange={() => setDeliveryStatus('📹 Video Selected')} />
      <input type="file" accept="audio/*" ref={audioRef} className="hidden" onChange={() => setDeliveryStatus('🎙️ Audio Selected')} />

      <div className="max-w-md mx-auto">
        <div className="bg-linear-to-b from-gray-900 to-black rounded-3xl p-6 border-2 border-purple-900 shadow-2xl text-white font-sans">
          
          <div className="flex justify-between items-center mb-6 px-4">
            <div className="text-xs flex items-center gap-2">
              <span className="font-bold">SMS</span>
              <div className="flex items-center gap-1">{getSignalBars(signalStrength)}</div>
            </div>
            <div className="text-xs">14:30</div>
          </div>

          <div className="bg-purple-900/30 rounded-xl p-3 mb-4 text-center border border-purple-500/20">
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Current Balance</div>
            <div className="text-xl font-bold text-green-400">${balance.toFixed(2)}</div>
          </div>

          <div className="bg-linear-to-b from-purple-950 to-gray-900 rounded-2xl p-4 h-64 overflow-y-auto mb-6 scrollbar-hide">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.sender === 'You'
                      ? 'bg-linear-to-r from-purple-600 to-blue-600 ml-auto'
                      : msg.sender === 'System'
                      ? 'bg-gray-800/50 mx-auto text-center text-[10px] text-gray-400'
                      : 'bg-gray-800 mr-auto'
                  }`}
                >
                  <div className="text-[10px] opacity-60 mb-1">{msg.sender} • {msg.timestamp}</div>
                  <div className="text-sm leading-relaxed">{msg.text}</div>
                </div>
              ))}
            </div>

            {deliveryStatus && (
              <div className="text-center mt-3 text-[11px]">
                <span className={deliveryStatus.includes('✅') ? 'text-green-400' : 'text-red-500 font-bold uppercase'}>
                  {deliveryStatus}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-gray-500 text-sm">To:</span>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="flex-1 bg-transparent border-b border-gray-800 py-1 text-sm focus:outline-none focus:border-purple-500 transition-colors text-white"
                placeholder="Required"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-2 py-1 relative">
              <div className="group relative">
                <button className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
                  <span className="text-xl">➕</span>
                </button>
                
                <div className="absolute bottom-full left-0 mb-4 hidden group-hover:flex flex-col bg-gray-950 border border-purple-500/50 rounded-2xl p-2 shadow-2xl z-20 w-48 gap-1">
                  <button onClick={() => photoRef.current?.click()} className="text-sm text-left px-3 py-2.5 hover:bg-purple-900/40 rounded-xl flex items-center gap-3 transition-colors">
                    <span className="text-xl">🖼️</span> Photo Gallery
                  </button>
                  <button onClick={() => videoRef.current?.click()} className="text-sm text-left px-3 py-2.5 hover:bg-purple-900/40 rounded-xl flex items-center gap-3 transition-colors">
                    <span className="text-xl">📹</span> Video Section
                  </button>
                  <button onClick={() => audioRef.current?.click()} className="text-sm text-left px-3 py-2.5 hover:bg-purple-900/40 rounded-xl flex items-center gap-3 transition-colors">
                    <span className="text-xl">🎙️</span> Audio Library
                  </button>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Text Message"
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none resize-none text-sm max-h-20 text-white"
                rows={1}
                maxLength={maxCharacters}
              />

              <button
                onClick={handleSend}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  !input.trim() || !phoneNumber.trim() || isSending 
                  ? 'bg-gray-800 text-gray-500' 
                  : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2L4.5 9.5L5.92 10.92L11 5.83V22H13V5.83L18.08 10.92L19.5 9.5L12 2Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setKeypadMode('alpha')} className={`text-[10px] px-4 py-1 rounded-full uppercase transition-all font-bold ${keypadMode === 'alpha' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-800 text-gray-500'}`}>ABC</button>
            <button onClick={() => setKeypadMode('numeric')} className={`text-[10px] px-4 py-1 rounded-full uppercase transition-all font-bold ${keypadMode === 'numeric' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-800 text-gray-500'}`}>123</button>
          </div>

          <div className="mt-4">
            {keypadMode === 'alpha' ? (
              <div className="flex flex-col gap-2">
                {alphaRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {row.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="flex-1 h-11 bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700 rounded-lg font-bold text-sm transition-all active:scale-90"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="flex gap-1 justify-center px-6">
                  {centeredRow.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className="flex-1 h-11 bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700 rounded-lg font-bold text-sm transition-all active:scale-90"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleKeyPress(' ')}
                  className="w-full bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700 rounded-lg py-2.5 text-xs font-bold mt-1 uppercase tracking-widest"
                >
                  Space
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {numericKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700 rounded-lg py-4 font-bold text-base transition-all active:scale-95"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMSUI