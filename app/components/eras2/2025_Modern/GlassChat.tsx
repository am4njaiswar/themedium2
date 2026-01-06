'use client'

import React, { useState, useEffect, useRef, ChangeEvent } from 'react'

interface GlassChatProps {
  message: string
  onSendMessage: (message: string, type?: string, fileData?: any) => void
  messages: Array<{id: number, text: string, sender: string, timestamp: string, type?: string, fileData?: any}>
}

const GlassChat: React.FC<GlassChatProps> = ({ message, onSendMessage, messages }) => {
  const [input, setInput] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [usingFrontCamera, setUsingFrontCamera] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const [showMediaOptions, setShowMediaOptions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaOptionsRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const gifPickerRef = useRef<HTMLDivElement>(null)
  const stickerPickerRef = useRef<HTMLDivElement>(null)

  const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '🚀', '💯', '👋', '😂', '😍', '🥳', '✨']
  
  // Sample GIFs and Stickers (in a real app, these would come from an API)
  const sampleGifs = [
    { id: 1, name: 'Party', code: '🎉' },
    { id: 2, name: 'Celebrate', code: '🥳' },
    { id: 3, name: 'Fire', code: '🔥' },
    { id: 4, name: 'Love', code: '❤️' },
    { id: 5, name: 'Laugh', code: '😂' },
    { id: 6, name: 'Thumbs Up', code: '👍' }
  ]
  
  const sampleStickers = [
    { id: 1, name: 'Smile', code: '😊' },
    { id: 2, name: 'Heart', code: '😍' },
    { id: 3, name: 'Cool', code: '😎' },
    { id: 4, name: 'Wink', code: '😉' },
    { id: 5, name: 'Silly', code: '🤪' },
    { id: 6, name: 'Think', code: '🤔' }
  ]

  const handleSend = () => {
    if (!input.trim() && !selectedFile && !selectedImage) return
    
    let finalMessage = input
    
    if (selectedEmoji !== '😊') {
      finalMessage = `${selectedEmoji} ${input}`
    }
    
    // Send file
    if (selectedFile) {
      const messageText = input.trim() || `📎 ${selectedFile.name}`
      const fileUrl = URL.createObjectURL(selectedFile)
      
      // Create file data object
      const fileData = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        url: fileUrl,
        // Add a preview for images
        isImage: selectedFile.type.startsWith('image/'),
        preview: selectedFile.type.startsWith('image/') ? fileUrl : null
      }
      
      onSendMessage(messageText, 'file', fileData)
      setSelectedFile(null)
      setInput('')
      setSelectedEmoji('😊')
      return
    }
    
    // Send image from camera/gallery
    if (selectedImage) {
      const messageText = input.trim() || '📸 Photo'
      const fileData = {
        name: 'photo.png',
        type: 'image/png',
        size: 0, // We don't know the size for canvas images
        data: selectedImage, // This is the data URL
        preview: selectedImage,
        isImage: true
      }
      
      onSendMessage(messageText, 'image', fileData)
      setSelectedImage(null)
      setInput('')
      setSelectedEmoji('😊')
      return
    }
    
    // Send text message
    if (finalMessage.trim()) {
      onSendMessage(finalMessage.trim(), 'text')
      setInput('')
      setSelectedEmoji('😊')
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowMediaOptions(false)
    }
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setSelectedImage(imageUrl)
        setShowMediaOptions(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async (frontCamera: boolean = true) => {
    try {
      setCameraError('')
      setUsingFrontCamera(frontCamera)
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported in this browser')
        onSendMessage('📸 Camera not supported in this browser')
        return
      }
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
      
      const constraints = {
        video: {
          facingMode: frontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCameraStream(stream)
      setIsCameraActive(true)
      setShowMediaOptions(false)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(e => {
          console.error("Video play error:", e)
          setCameraError('Failed to play video')
        })
      }
    } catch (err: any) {
      console.error("Camera error:", err)
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions.'
        : err.name === 'NotFoundError'
        ? 'No camera found'
        : err.message || 'Failed to access camera'
      setCameraError(errorMsg)
      onSendMessage(`📸 Camera error: ${errorMsg}`)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsCameraActive(false)
    setCameraError('')
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageUrl = canvas.toDataURL('image/png')
        
        // Create file data object
        const fileData = {
          name: 'photo.png',
          type: 'image/png',
          data: imageUrl,
          preview: imageUrl,
          isImage: true
        }
        
        // Send the image immediately
        onSendMessage('📸 Photo', 'image', fileData)
        stopCamera()
      }
    }
  }

  const handleVideoCall = () => {
    setIsVideoCallActive(true)
    setIsCallActive(true)
    setCallDuration(0)
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    
    setTimeout(() => {
      setIsVideoCallActive(false)
      setIsCallActive(false)
      clearInterval(timer)
      onSendMessage('📹 Video call ended. Duration: 00:10')
    }, 10000)
  }

  const handleVoiceCall = () => {
    setIsCallActive(true)
    setCallDuration(0)
    setShowMediaOptions(false)
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    
    setTimeout(() => {
      setIsCallActive(false)
      clearInterval(timer)
      onSendMessage('📞 Voice call ended. Duration: 00:08')
    }, 8000)
  }

  const handleVoiceMessage = () => {
    setIsRecording(true)
    onSendMessage('🎤 Recording voice message...')
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)
      onSendMessage('🎤 Voice message sent!')
    }, 3000)
  }

  const handleSendGif = (gif: any) => {
    onSendMessage(`GIF: ${gif.name} ${gif.code}`)
    setShowGifPicker(false)
    setShowEmojiPicker(false)
  }

  const handleSendSticker = (sticker: any) => {
    onSendMessage(`Sticker: ${sticker.name} ${sticker.code}`)
    setShowStickerPicker(false)
    setShowEmojiPicker(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mediaOptionsRef.current && !mediaOptionsRef.current.contains(event.target as Node)) {
        setShowMediaOptions(false)
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node)) {
        setShowGifPicker(false)
      }
      if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target as Node)) {
        setShowStickerPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOpenFile = (fileData: any) => {
    if (!fileData) return
    
    // For images (from camera/gallery or image files)
    if (fileData.isImage && (fileData.data || fileData.preview)) {
      const imageUrl = fileData.data || fileData.preview || fileData.url
      
      if (imageUrl) {
        const w = window.open('')
        if (w) {
          w.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Image View - ${fileData.name || 'Photo'}</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #111; }
                img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="${fileData.name || 'Image'}" />
            </body>
            </html>
          `)
        }
      }
    } 
    // For other files with URL
    else if (fileData.url) {
      const link = document.createElement('a')
      link.href = fileData.url
      link.download = fileData.name || 'download'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    // For files without URL
    else if (fileData.name) {
      if (window.confirm(`Open ${fileData.name}?\n\nOK = Open\nCancel = Save As`)) {
        // For text files, show content
        if (fileData.type && fileData.type.includes('text')) {
          const w = window.open('')
          if (w) {
            w.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${fileData.name}</title>
                <style>
                  body { margin: 0; padding: 20px; background: #111; color: white; font-family: monospace; white-space: pre-wrap; }
                </style>
              </head>
              <body>
                File: ${fileData.name}
                Size: ${fileData.size ? (fileData.size / 1024).toFixed(1) + 'KB' : 'Unknown size'}
                Type: ${fileData.type || 'Unknown type'}
              </body>
              </html>
            `)
          }
        }
      } else {
        // Trigger download
        const blob = new Blob([`File: ${fileData.name}`], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileData.name}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }
  }

  const downloadFile = (fileData: any) => {
    if (!fileData) return
    
    let downloadUrl = ''
    let filename = fileData.name || 'download'
    
    if (fileData.data && fileData.data.startsWith('data:')) {
      // For data URLs (images from camera)
      downloadUrl = fileData.data
      filename = fileData.name || 'photo.png'
    } else if (fileData.url) {
      // For object URLs (uploaded files)
      downloadUrl = fileData.url
    } else if (fileData.preview) {
      // For preview URLs
      downloadUrl = fileData.preview
    }
    
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Camera Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 left-4 text-white z-10">
            <button 
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2"
            >
              ✕ Close Camera
            </button>
          </div>
          
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-red-400 font-semibold">{cameraError}</div>
                  <button 
                    onClick={stopCamera}
                    className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4">
              <button
                onClick={takePicture}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={() => startCamera(true)}
                  className={`p-3 rounded-full ${usingFrontCamera ? 'bg-blue-500' : 'bg-gray-800/80'} hover:opacity-90 group relative`}
                  title="Front Camera"
                >
                  <span className="text-xl">📱</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Front Camera
                  </div>
                </button>
                <button
                  onClick={() => startCamera(false)}
                  className={`p-3 rounded-full ${!usingFrontCamera ? 'bg-blue-500' : 'bg-gray-800/80'} hover:opacity-90 group relative`}
                  title="Back Camera"
                >
                  <span className="text-xl">📷</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Back Camera
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emoji/GIF/Sticker Picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div 
            ref={emojiPickerRef}
            className="bg-gray-800 rounded-xl w-full max-w-md border border-white/10"
          >
            <div className="p-4 border-b border-white/10 flex gap-2">
              <button
                onClick={() => {
                  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                  setInput(prev => prev + randomEmoji)
                }}
                className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30"
              >
                Emoji
              </button>
              <button
                onClick={() => {
                  setShowEmojiPicker(false)
                  setShowGifPicker(true)
                }}
                className="px-3 py-1 rounded-lg hover:bg-white/5"
              >
                GIF
              </button>
              <button
                onClick={() => {
                  setShowEmojiPicker(false)
                  setShowStickerPicker(true)
                }}
                className="px-3 py-1 rounded-lg hover:bg-white/5"
              >
                Sticker
              </button>
              <button 
                onClick={() => setShowEmojiPicker(false)} 
                className="ml-auto text-2xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(prev => prev + emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="p-3 hover:bg-white/5 rounded-lg text-2xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div 
            ref={gifPickerRef}
            className="bg-gray-800 rounded-xl w-full max-w-md border border-white/10"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Select GIF</h3>
                <button onClick={() => setShowGifPicker(false)} className="text-2xl hover:text-gray-300">×</button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {sampleGifs.map(gif => (
                <button
                  key={gif.id}
                  onClick={() => handleSendGif(gif)}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl">{gif.code}</span>
                  <span className="text-xs mt-1">{gif.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div 
            ref={stickerPickerRef}
            className="bg-gray-800 rounded-xl w-full max-w-md border border-white/10"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Select Sticker</h3>
                <button onClick={() => setShowStickerPicker(false)} className="text-2xl hover:text-gray-300">×</button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {sampleStickers.map(sticker => (
                <button
                  key={sticker.id}
                  onClick={() => handleSendSticker(sticker)}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl">{sticker.code}</span>
                  <span className="text-xs mt-1">{sticker.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern Chat Interface */}
      <div className="glass-effect rounded-3xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-linear-to-r from-blue-600/20 to-cyan-600/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Modern Chat</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Online • {messages.length} messages</span>
                  </div>
                  {isCallActive && (
                    <span className="text-sm bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                      {isVideoCallActive ? '📹 Live' : '📞 Live'} {formatCallDuration(callDuration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleVideoCall}
                disabled={isCallActive}
                className={`p-2 rounded-full transition-colors ${
                  isVideoCallActive 
                    ? 'bg-red-500/20 text-red-300 animate-pulse' 
                    : isCallActive
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                title="Video Call"
              >
                📹
              </button>
              <button 
                onClick={handleVoiceCall}
                disabled={isCallActive}
                className={`p-2 rounded-full transition-colors ${
                  isCallActive && !isVideoCallActive
                    ? 'bg-red-500/20 text-red-300 animate-pulse'
                    : isCallActive
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                title="Voice Call"
              >
                📞
              </button>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors" title="Settings">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Video Call Overlay */}
        {isVideoCallActive && (
          <div className="relative h-64 bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 to-purple-900/20"></div>
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-2">📹</div>
              <div className="text-lg font-semibold">Video Call Active</div>
              <div className="text-sm text-gray-300 mt-1">{formatCallDuration(callDuration)}</div>
              <button 
                onClick={() => {
                  setIsVideoCallActive(false)
                  setIsCallActive(false)
                  onSendMessage('📹 Video call ended by you')
                }}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold"
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {/* Chat Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 h-600px">
          {/* Sidebar - Simplified */}
          <div className="lg:col-span-1 border-r border-white/10 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Online Users */}
              <div>
                <h3 className="font-bold mb-3">Online Now</h3>
                <div className="space-y-2">
                  {['Alex 👨‍💻', 'Jordan 👩‍💼', 'Taylor 🤖', 'Casey 🎨'].map((user) => (
                    <div key={user} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                          <span className="text-sm">{user.split(' ')[1]}</span>
                        </div>
                        <span>{user.split(' ')[0]}</span>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6"
              style={{ maxHeight: '400px' }}
            >
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'You'
                          ? 'bg-linear-to-r from-blue-500 to-cyan-500 rounded-br-none'
                          : msg.sender === 'System'
                          ? 'bg-linear-to-r from-gray-700 to-gray-800'
                          : 'bg-white/5 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{msg.sender}</span>
                        <span className="text-xs opacity-75">{msg.timestamp}</span>
                      </div>
                      
                      {/* Display file */}
                      {msg.type === 'file' && (
                        <div className="mt-2 p-3 bg-black/30 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">
                              {msg.fileData?.isImage ? '🖼️' : '📎'}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{msg.fileData?.name || 'File'}</div>
                              <div className="text-sm opacity-75">
                                {msg.fileData?.size ? `${(msg.fileData.size / 1024).toFixed(1)}KB • ` : ''}
                                {msg.fileData?.type || 'File'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Show image preview if it's an image file */}
                          {msg.fileData?.isImage && msg.fileData?.preview && (
                            <div className="mb-3">
                              <div className="w-48 h-32 rounded-lg overflow-hidden">
                                <img 
                                  src={msg.fileData.preview} 
                                  alt={msg.fileData.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenFile(msg.fileData)}
                              className="flex-1 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 rounded-lg text-sm font-medium transition-colors"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => downloadFile(msg.fileData)}
                              className="flex-1 px-4 py-2 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-sm font-medium transition-colors"
                            >
                              Save As
                            </button>
                          </div>
                          
                          {msg.text && !msg.text.includes('📎') && !msg.text.includes('📸') && (
                            <div className="mt-3 pt-3 border-t border-white/10">{msg.text}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Display image */}
                      {msg.type === 'image' && msg.fileData?.data && (
                        <div className="mt-2">
                          <div className="relative group">
                            <div className="w-64 h-48 rounded-lg overflow-hidden bg-linear-to-br from-purple-500/20 to-pink-500/20">
                              <img 
                                src={msg.fileData.data} 
                                alt="Shared" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenFile(msg.fileData)}
                                className="px-3 py-1 bg-black/70 hover:bg-black/90 rounded text-sm font-medium transition-colors"
                              >
                                Open
                              </button>
                              <button
                                onClick={() => downloadFile(msg.fileData)}
                                className="px-3 py-1 bg-black/70 hover:bg-black/90 rounded text-sm font-medium transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                          {msg.text && msg.text !== '📸 Photo' && (
                            <div className="mt-2 pt-2 border-t border-white/10">{msg.text}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Regular text message */}
                      {!msg.type && <div>{msg.text}</div>}
                    </div>
                  </div>
                ))}
                
                {/* Display selected file if not sent yet */}
                {selectedFile && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] rounded-2xl p-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-br-none">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">You</span>
                        <span className="text-xs opacity-75">Now</span>
                      </div>
                      <div className="p-3 bg-black/30 rounded-lg flex items-center gap-3">
                        <div className="text-2xl">📎</div>
                        <div className="flex-1">
                          <div className="font-medium">File ready to send</div>
                          <div className="text-sm opacity-75">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}KB)</div>
                        </div>
                      </div>
                      {input && (
                        <div className="mt-2 pt-2 border-t border-white/10">{input}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Display selected image if not sent yet */}
                {selectedImage && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] rounded-2xl p-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-br-none">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">You</span>
                        <span className="text-xs opacity-75">Now</span>
                      </div>
                      <div className="relative">
                        <div className="w-64 h-48 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                          <img 
                            src={selectedImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="mt-2 text-sm opacity-75">📸 Photo ready to send</div>
                      </div>
                      {input && (
                        <div className="mt-2 pt-2 border-t border-white/10">{input}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input - WhatsApp style */}
            <div className="border-t border-white/10 p-4">
              {/* Quick Emojis - FIXED SPACING */}
              <div className="flex items-center gap-2 overflow-x-auto mb-3">
                <span className="text-sm text-gray-400">Quick emojis:</span>
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prev => prev + emoji)}
                    className="text-xl p-2 rounded-lg hover:bg-white/5 transition-colors"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="relative bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-32">
                {/* Plus Button (INSIDE message field) */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2" ref={mediaOptionsRef}>
                  <button
                    onClick={() => setShowMediaOptions(!showMediaOptions)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                    title="Attach"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="20" 
                      height="20" 
                      fill="currentColor"
                    >
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </button>
                  
                  {showMediaOptions && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-xl shadow-lg z-10 border border-white/10">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowMediaOptions(false)
                          }}
                          className="w-full p-3 hover:bg-white/5 rounded-lg flex items-center gap-3"
                          title="Send File"
                        >
                          <span className="text-xl">📎</span>
                          <span>File</span>
                        </button>
                        <button
                          onClick={() => {
                            startCamera(true)
                            setShowMediaOptions(false)
                          }}
                          className="w-full p-3 hover:bg-white/5 rounded-lg flex items-center gap-3"
                          title="Open Camera"
                        >
                          <span className="text-xl">📸</span>
                          <span>Camera</span>
                        </button>
                        <button
                          onClick={() => {
                            imageInputRef.current?.click()
                            setShowMediaOptions(false)
                          }}
                          className="w-full p-3 hover:bg-white/5 rounded-lg flex items-center gap-3"
                          title="Choose from Gallery"
                        >
                          <span className="text-xl">🖼️</span>
                          <span>Gallery</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Emoji Button (INSIDE message field) */}
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                    title="Emoji, GIF & Sticker"
                  >
                    <span className="text-xl">😊</span>
                  </button>
                </div>

                {/* Input Field */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent focus:outline-none resize-none pl-20"
                  rows={1}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />

                {/* Hidden file inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Voice Recording Button (right side INSIDE message field) */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={handleVoiceMessage}
                    disabled={isRecording}
                    className={`p-2 rounded-full transition-colors ${
                      isRecording 
                        ? 'bg-red-500/20 text-red-300 animate-pulse' 
                        : 'hover:bg-white/10'
                    }`}
                    title="Voice Message"
                  >
                    {isRecording ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="20" 
                        height="20" 
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v-4h-2v4zm0-6h2V6h-2v4z"/>
                      </svg>
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="20" 
                        height="20" 
                        fill="currentColor"
                      >
                        <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Send Button (Arrow) */}
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() && !selectedFile && !selectedImage}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      !input.trim() && !selectedFile && !selectedImage
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-linear-to-r from-cyan-500 to-blue-500 hover:opacity-90'
                    }`}
                    title="Send"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="16" 
                      height="16" 
                      fill="white"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Features Showcase */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <h4 className="font-bold">Instant Delivery</h4>
              <p className="text-sm text-gray-300">Messages delivered in milliseconds</p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎨</div>
            <div>
              <h4 className="font-bold">Rich Media</h4>
              <p className="text-sm text-gray-300">Photos, videos, files & more</p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h4 className="font-bold">Secure</h4>
              <p className="text-sm text-gray-300">End-to-end encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlassChat