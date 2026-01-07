// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EraContainer from './components/core2/EraContainer'
import NetworkStatus from './components/core2/NetworkStatus'
import TelegraphUI from './components/eras2/1840_Telegraph/TelegraphUI'
import SwitchBoardUI from './components/eras2/switchboard/SwitchBoardUI'
import Window from './components/eras2/1990_Internet/window'
import SMSUI from './components/eras2/sms/SMSUI'
import GlassChat from './components/eras2/2025_Modern/GlassChat'

type Era = 'telegraph' | 'switchboard' | 'internet' | 'sms' | 'modern'

export default function Home() {
  const [currentEra, setCurrentEra] = useState<Era>('telegraph')
  const [message, setMessage] = useState('Hello World!')
  const [networkSpeed, setNetworkSpeed] = useState(100)
  const [isConnected, setIsConnected] = useState(true)
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: string, timestamp: string, era?: string}>>([])
  const [messageCounter, setMessageCounter] = useState(3) // Start from 3 for system messages

  useEffect(() => {
    // Add initial messages
    setMessages([
      { id: 1, text: 'Welcome to the Communication Evolution Simulator!', sender: 'System', timestamp: '10:00 AM', era: 'all' },
      { id: 2, text: 'Try sending a message through different eras.', sender: 'System', timestamp: '10:01 AM', era: 'all' }
    ])
  }, [])

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: messageCounter,
      text,
      sender: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      era: currentEra
    }
    setMessages(prev => [...prev, newMessage])
    setMessageCounter(prev => prev + 1)
  }

  const getEraInfo = () => {
    switch(currentEra) {
      case 'telegraph':
        return {
          title: 'Telegraph Era (1830s-1920s)',
          description: 'Send messages using Morse code with delays',
          icon: '⚡'
        }
      case 'switchboard':
        return {
          title: 'Telephone Switchboard (1878-1960s)',
          description: 'Manually connect calls through operators',
          icon: '📞'
        }
      case 'internet':
        return {
          title: 'Early Internet (1970s-1990s)',
          description: 'Command-line email and basic networking',
          icon: '💻'
        }
      case 'sms':
        return {
          title: 'SMS Era (1990s-2000s)',
          description: 'Limited to 160 characters, simple text messaging',
          icon: '📱'
        }
      case 'modern':
        return {
          title: 'Modern Messaging (2010s-Present)',
          description: 'Instant, rich media, and real-time communication',
          icon: '💬'
        }
    }
  }

  const eraInfo = getEraInfo()

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="text-center mb-6 sm:mb-8 sm:mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              The Medium
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">Experience how messaging evolved through history</p>
          </div>
          <Link 
            href="/demo"
            className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 mt-2 sm:mt-0"
          >
            <span className="text-lg">⚡</span>
            <span className="text-sm sm:text-base">Live Demo</span>
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">{eraInfo.icon}</span>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl">{eraInfo.title}</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">{eraInfo.description}</p>
            
            {/* Era Selection */}
            <div className="space-y-3 sm:space-y-4">
              {(['telegraph', 'switchboard', 'internet', 'sms', 'modern'] as Era[]).map((era) => (
                <button
                  key={era}
                  onClick={() => setCurrentEra(era)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                    currentEra === era
                      ? 'bg-linear-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                      : 'glass-effect hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base capitalize">
                      {era === 'sms' ? 'SMS' : era}
                    </span>
                    <span className="text-xs sm:text-sm opacity-75">
                      {era === 'telegraph' && '1830s-1920s'}
                      {era === 'switchboard' && '1878-1960s'}
                      {era === 'internet' && '1970s-1990s'}
                      {era === 'sms' && '1990s-2000s'}
                      {era === 'modern' && '2010s-Present'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <NetworkStatus 
            isConnected={isConnected}
            speed={networkSpeed}
            era={currentEra}
          />
        </div>

        {/* Right Panel - Era Container */}
        <div className="lg:col-span-2">
          <EraContainer era={currentEra}>
            {currentEra === 'telegraph' && (
              <TelegraphUI 
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
              />
            )}
            {currentEra === 'switchboard' && (
              <SwitchBoardUI 
                message={message}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
              />
            )}
            {currentEra === 'internet' && (
              <Window
                onSendMessage={handleSendMessage}
                messages={messages.filter(msg => msg.era === 'internet' || msg.sender === 'System')}
              />
            )}
            {currentEra === 'sms' && (
              <SMSUI 
                message={message}
                onSendMessage={handleSendMessage}
                messages={messages.filter(msg => msg.era === 'sms' || msg.sender === 'System')}
              />
            )}
            {currentEra === 'modern' && (
              <GlassChat 
                message={message}
                onSendMessage={handleSendMessage}
                messages={messages.filter(msg => msg.era === 'modern' || msg.sender === 'System')}
              />
            )}
          </EraContainer>

          {/* Message History - Shows ALL messages */}
          <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Message History</h3>
              <button 
                onClick={() => setMessages([])}
                className="text-xs sm:text-sm text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">No messages yet. Send one!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-2 sm:p-3 bg-white/5 rounded-lg text-sm sm:text-base">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-300">{msg.sender}</span>
                        {msg.era && msg.sender !== 'System' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded hidden sm:inline-block">
                            {msg.era}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        {msg.sender !== 'System' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded sm:hidden">
                            {msg.era}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm opacity-75">{msg.timestamp}</span>
                      </div>
                    </div>
                    <p className="mt-1 wrap-break-word">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}