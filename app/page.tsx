// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Communication Evolution Simulator
        </h1>
        <p className="text-gray-300">Experience how messaging evolved through history</p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">{eraInfo.icon}</span>
              {eraInfo.title}
            </h2>
            <p className="text-gray-300 mb-6">{eraInfo.description}</p>
            
            {/* Era Selection */}
            <div className="space-y-4">
              {(['telegraph', 'switchboard', 'internet', 'sms', 'modern'] as Era[]).map((era) => (
                <button
                  key={era}
                  onClick={() => setCurrentEra(era)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    currentEra === era
                      ? 'bg-linear-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                      : 'glass-effect hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">
                      {era === 'sms' ? 'SMS' : era}
                    </span>
                    <span className="text-sm opacity-75">
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
          <div className="glass-effect rounded-2xl p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Message History</h3>
              <button 
                onClick={() => setMessages([])}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No messages yet. Send one!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-300">{msg.sender}</span>
                        {msg.era && msg.sender !== 'System' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                            {msg.era}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.sender !== 'System' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                            {msg.era}
                          </span>
                        )}
                        <span className="text-sm opacity-75">{msg.timestamp}</span>
                      </div>
                    </div>
                    <p className="mt-1">{msg.text}</p>
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