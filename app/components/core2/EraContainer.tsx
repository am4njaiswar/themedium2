// app/components/core/EraContainer.tsx
import React from 'react'

interface EraContainerProps {
  era: string
  children: React.ReactNode
}

const EraContainer: React.FC<EraContainerProps> = ({ era, children }) => {
  const getEraStyle = () => {
    switch(era) {
      case 'telegraph':
        return 'bg-linear-to-br from-gray-900 to-gray-800 border-gray-700'
      case 'switchboard':
        return 'bg-linear-to-br from-amber-900/30 to-amber-800/20 border-amber-700/50'
      case 'internet':
        return 'bg-linear-to-br from-green-900/30 to-green-800/20 border-green-700/50'
      case 'sms':
        return 'bg-linear-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50'
      case 'modern':
        return 'bg-linear-to-br from-blue-900/30 to-indigo-800/20 border-blue-500/50'
      default:
        return 'bg-linear-to-br from-gray-900 to-gray-800'
    }
  }

  return (
    <div className={`rounded-2xl border-2 ${getEraStyle()} p-6 transition-all duration-500`}>
      <div className="relative">
        {/* Era indicator */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-1 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-semibold">
            {era.toUpperCase()}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export default EraContainer