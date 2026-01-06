// app/components/core/NetworkStatus.tsx
import React, { useEffect, useState } from 'react'

interface NetworkStatusProps {
  isConnected: boolean
  speed: number
  era: string
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isConnected, speed, era }) => {
  const [simulatedSpeed, setSimulatedSpeed] = useState(speed)

  useEffect(() => {
    // Simulate network characteristics based on era
    let interval: NodeJS.Timeout
    if (!isConnected) {
      setSimulatedSpeed(0)
    } else {
      const eraSpeed = {
        telegraph: 5,
        switchboard: 20,
        internet: 50,
        sms: 80,
        modern: 100
      }[era]
      
      setSimulatedSpeed(eraSpeed || 100)
      
      // Add some realistic fluctuation
      interval = setInterval(() => {
        setSimulatedSpeed(prev => {
          const fluctuation = Math.random() * 20 - 10
          return Math.max(0, Math.min(100, prev + fluctuation))
        })
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [era, isConnected])

  const getSpeedColor = (speed: number) => {
    if (speed > 80) return 'text-green-400'
    if (speed > 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getEraIcon = () => {
    switch(era) {
      case 'telegraph': return '⚡'
      case 'switchboard': return '📞'
      case 'internet': return '🌐'
      case 'sms': return '📲'
      case 'modern': return '🚀'
      default: return '📡'
    }
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        {getEraIcon()} Network Status
      </h3>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Connection</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Speed Indicator */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Speed</span>
            <span className={`font-bold ${getSpeedColor(simulatedSpeed)}`}>
              {simulatedSpeed.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                simulatedSpeed > 80 ? 'bg-green-500' : 
                simulatedSpeed > 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${simulatedSpeed}%` }}
            ></div>
          </div>
        </div>

        {/* Era-specific characteristics */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="font-semibold mb-2">Era Characteristics:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {era === 'telegraph' && (
              <>
                <li>• Morse code transmission</li>
                <li>• Significant delays (5-30 mins)</li>
                <li>• Operator required</li>
              </>
            )}
            {era === 'switchboard' && (
              <>
                <li>• Manual call connection</li>
                <li>• Limited range</li>
                <li>• Operator-assisted</li>
              </>
            )}
            {era === 'internet' && (
              <>
                <li>• Dial-up connection</li>
                <li>• Command-line interface</li>
                <li>• Text-only messages</li>
              </>
            )}
            {era === 'sms' && (
              <>
                <li>• 160 character limit</li>
                <li>• Basic text only</li>
                <li>• Store-and-forward</li>
              </>
            )}
            {era === 'modern' && (
              <>
                <li>• Instant delivery</li>
                <li>• Rich media support</li>
                <li>• End-to-end encryption</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus