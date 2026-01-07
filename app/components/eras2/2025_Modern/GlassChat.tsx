'use client'

import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { Mic, Paperclip, Camera, Image as ImageIcon, Send, Smile, X, Video, Phone, MoreVertical } from 'lucide-react'

// 🎵 1. ENHANCED AUDIO COMPONENT
const AudioMessage = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 1.5x, 2x
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = () => {
    if (audioRef.current) {
      const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
      audioRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  };

  const bars = [1, 2, 3, 2, 4, 3, 2, 1, 2, 4, 3, 2, 1, 2, 3, 2, 1];

  return (
    <div className="flex items-center gap-3 bg-gray-900/60 border border-white/10 rounded-xl p-2 pr-3 min-w-55 transition-all hover:bg-gray-900/80 group">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)}
        className="hidden" 
      />
      
      <button 
        onClick={togglePlay}
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        {isPlaying ? (
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-8 border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        )}
      </button>

      <div className="flex items-center gap-0.5 h-6 flex-1 mx-1">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`w-1 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'
            }`}
            style={{ 
              height: isPlaying ? `${Math.random() * 16 + 4}px` : `${height * 3}px`,
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 border-l border-gray-700 pl-2">
        <button 
          onClick={changeSpeed}
          className="text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 px-1.5 py-0.5 rounded transition-all w-8 text-center"
        >
          {speed}x
        </button>
        <a 
          href={src} 
          download={`voice_msg_${Date.now()}.webm`}
          className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-1 rounded-full transition-all"
          title="Download Audio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface GlassChatProps {
  message?: string
  onSendMessage?: (message: string, type?: string, fileData?: any) => void
  messages?: Array<{id: number, text: string, sender: string, timestamp: string, type?: string, fileData?: any}>
}

const GlassChat: React.FC<GlassChatProps> = ({ 
  message = '', 
  onSendMessage = () => {}, 
  messages = [] 
}) => {
  const [input, setInput] = useState('')
  
  // Media State
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'file' | null>(null)
  const [fileName, setFileName] = useState('')

  // UI State
  const [showMediaOptions, setShowMediaOptions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('') 

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [usingFrontCamera, setUsingFrontCamera] = useState(true)
  const [cameraError, setCameraError] = useState('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaOptionsRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  
  // 🎤 Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '🚀', '💯', '👋', '😂', '😍', '🥳', '✨']

  // ---------------------------------------------------------
  // 🎤 VOICE RECORDING LOGIC (MediaRecorder)
  // ---------------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          // Send immediately as an audio message
          onSendMessage(base64Audio, 'audio', {
            name: 'voice_message.webm',
            data: base64Audio,
            type: 'audio'
          });
        };
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceStatus('Recording Audio...');
    } catch (err) {
      console.error("Microphone Error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setVoiceStatus('');
    }
  };

  // ---------------------------------------------------------
  // 📁 FILE HANDLING
  // ---------------------------------------------------------
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia(reader.result as string);
        setMediaType(type);
        setFileName(file.name);
        setShowMediaOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------------------------------------------------------
  // 📸 CAMERA LOGIC
  // ---------------------------------------------------------
  const startCamera = async (frontCamera: boolean = true) => {
    try {
      setCameraError('')
      setUsingFrontCamera(frontCamera)
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported')
        return
      }
      
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const constraints = {
        video: { facingMode: frontCamera ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      cameraStreamRef.current = stream
      setIsCameraActive(true)
      setShowMediaOptions(false)
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(e => console.error("Video play error:", e))
        }
      }, 100);

    } catch (err: any) {
      console.error("Camera error:", err)
      setCameraError('Access denied')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
    }
    setIsCameraActive(false)
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
        setSelectedMedia(imageUrl)
        setMediaType('image')
        setFileName('camera_snapshot.png')
        stopCamera()
      }
    }
  }

  // ---------------------------------------------------------
  // SEND LOGIC
  // ---------------------------------------------------------
  const handleSend = () => {
    if (!input.trim() && !selectedMedia) return;

    if (selectedMedia) {
      onSendMessage(selectedMedia, mediaType || 'file', {
        name: fileName,
        data: selectedMedia,
        type: mediaType
      });
      setSelectedMedia(null);
      setMediaType(null);
      setFileName('');
    } 
    else if (input.trim()) {
      onSendMessage(input.trim(), 'text');
    }
    
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mediaOptionsRef.current && !mediaOptionsRef.current.contains(event.target as Node)) {
        setShowMediaOptions(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helpers
  const isImageMessage = (text: string) => text.startsWith('data:image');
  const isVideoMessage = (text: string) => text.startsWith('data:video');
  const isAudioMessage = (text: string) => text.startsWith('data:audio');

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans h-full">
      
      {/* 📸 Camera Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-black z-100 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 left-4 z-10">
            <button onClick={stopCamera} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg">
               Cancel
            </button>
          </div>
          
          <div className="relative w-full h-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
               <button onClick={() => startCamera(!usingFrontCamera)} className="p-4 bg-gray-800/80 backdrop-blur-md rounded-full text-white hover:bg-gray-700 transition-all">🔄</button>
               <button onClick={takePicture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:border-blue-500 hover:scale-105 transition-all shadow-lg"></button>
               <div className="w-12"></div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-effect rounded-3xl overflow-hidden border border-white/10 bg-gray-900/60 backdrop-blur-xl h-150 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900/40 to-cyan-900/40 p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">AI</div>
             <div>
               <h2 className="text-white font-bold text-lg">Modern Chat</h2>
               <div className="flex items-center gap-2 text-xs text-green-400">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
               </div>
             </div>
          </div>
          <div className="flex gap-2 text-gray-400">
            <Video size={20} className="hover:text-white cursor-pointer"/>
            <Phone size={20} className="hover:text-white cursor-pointer"/>
            <MoreVertical size={20} className="hover:text-white cursor-pointer"/>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
           {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[75%] rounded-2xl p-4 ${
                 msg.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
               }`}>
                 
                 {isImageMessage(msg.text) ? (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <img src={msg.text} alt="Shared" className="max-w-full h-auto object-cover max-h-64" />
                    </div>
                 ) : isVideoMessage(msg.text) ? (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <video src={msg.text} controls className="max-w-full h-auto max-h-64" />
                    </div>
                 ) : isAudioMessage(msg.text) ? (
                    <AudioMessage src={msg.text} />
                 ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text.startsWith('data:') ? '📁 File Attached' : msg.text}
                    </p>
                 )}

                 <div className="text-[10px] opacity-50 text-right mt-1">{msg.timestamp}</div>
               </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/40 border-t border-white/10 relative">
           
           {isRecording && (
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-400 text-xs font-bold animate-pulse bg-black/50 px-3 py-1 rounded-full">
               🔴 {voiceStatus}
             </div>
           )}

           <div className="flex items-center gap-2 bg-gray-800/50 border border-white/10 rounded-full px-2 py-2">
             
             {/* ➕ PLUS BUTTON */}
             <div className="relative" ref={mediaOptionsRef}>
               <button 
                 onClick={() => setShowMediaOptions(!showMediaOptions)}
                 className={`p-2 rounded-full transition-colors ${showMediaOptions ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
               >
                 <div className="text-xl leading-none mb-0.5 font-light">+</div>
               </button>

               {showMediaOptions && (
                 <div className="absolute bottom-full left-0 mb-3 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                   <button onClick={() => {fileInputRef.current?.click(); setShowMediaOptions(false)}} className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-3">
                     <Paperclip size={18} className="text-blue-400"/> Document
                   </button>
                   <button onClick={() => {imageInputRef.current?.click(); setShowMediaOptions(false)}} className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-3">
                     <ImageIcon size={18} className="text-purple-400"/> Gallery
                   </button>
                   <button onClick={() => {startCamera(true); setShowMediaOptions(false)}} className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-3">
                     <Camera size={18} className="text-red-400"/> Camera
                   </button>
                 </div>
               )}
             </div>

             {/* Hidden Inputs */}
             <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'file')} className="hidden"/>
             <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*,video/*" className="hidden"/>

             {/* Text Input */}
             <div className="flex-1 flex items-center">
               {selectedMedia ? (
                 <div className="flex-1 flex items-center justify-between px-3">
                   <span className="text-xs text-blue-300 flex items-center gap-2">
                     {mediaType === 'image' ? '🖼️ Image' : mediaType === 'video' ? '📹 Video' : '📄 File'} 
                     <span className="opacity-70 truncate max-w-37.5">{fileName}</span>
                   </span>
                   <button onClick={() => {setSelectedMedia(null); setMediaType(null);}} className="text-gray-400 hover:text-white"><X size={16}/></button>
                 </div>
               ) : (
                 <>
                   <input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder={isRecording ? "Recording..." : "Type a message..."}
                     className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
                   />
                   <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-yellow-400 px-2 transition-colors">
                     <Smile size={20} />
                   </button>
                 </>
               )}
             </div>

             {/* Mic / Send Button */}
             {(input.trim() || selectedMedia) ? (
                <button onClick={handleSend} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30">
                  <Send size={18} />
                </button>
             ) : (
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`p-2.5 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/50 animate-pulse' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                  <Mic size={18} />
                </button>
             )}
             
           </div>
           
           {/* Emoji Picker */}
           {showEmojiPicker && (
             <div className="absolute bottom-20 right-4 bg-gray-800 border border-white/10 p-2 rounded-xl grid grid-cols-6 gap-1 shadow-2xl z-50">
               {emojis.map(emoji => (
                 <button key={emoji} onClick={() => {setInput(prev => prev + emoji); setShowEmojiPicker(false)}} className="p-2 hover:bg-white/10 rounded text-xl">
                   {emoji}
                 </button>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  )
}

export default GlassChat