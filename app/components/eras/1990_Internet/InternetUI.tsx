'use client';

import React, { useState } from 'react';
import DialUpModal from './DialUpModal';
import TerminalWindow from './TerminalWindow';
import EmailInbox from './EmailInbox'; // We'll display this as a background decoration

export default function InternetUI() {
  const [connectionState, setConnectionState] = useState<'offline' | 'connected'>('offline');

  return (
    <div className="relative w-full h-full bg-[#008080] overflow-hidden font-sans">
      {/* 1. The Desktop Background (Teal Color) */}
      
      {/* 2. Desktop Icons (Visual Fluff) */}
      <div className="absolute top-4 left-4 flex flex-col gap-6 text-white text-center text-xs font-sans drop-shadow-md">
        <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
          <div className="w-10 h-10 bg-gray-200 border-2 border-gray-400 flex items-center justify-center text-black font-bold">MY PC</div>
          <span>My Computer</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
           <div className="w-10 h-10 bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-black font-bold">DIR</div>
          <span>Network</span>
        </div>
      </div>

      {/* 3. The Windows */}
      {connectionState === 'offline' && (
        <DialUpModal onConnect={() => setConnectionState('connected')} />
      )}

      {connectionState === 'connected' && (
        <div className="relative w-full h-full p-4 md:p-8 flex gap-4">
            {/* Active Window: Terminal (Chat) */}
            <div className="flex-1 z-20">
                 <TerminalWindow />
            </div>

            {/* Inactive Window: Email (Just for looks, positioned absolutely or to the side) */}
            <div className="hidden md:block w-80 opacity-90 absolute right-8 top-12 z-10 pointer-events-none grayscale-[0.5]">
                 <EmailInbox />
            </div>
        </div>
      )}

      {/* 4. The Start Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#C0C0C0] border-t-2 border-white flex items-center px-1 shadow-inner z-50">
        <button className="flex items-center gap-1 px-2 py-1 bg-[#C0C0C0] border-t-2 border-l-2 border-white border-b-2 border-r-2 shadow-[2px_2px_0px_0px_#000] active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-bold text-sm">
          <div className="w-4 h-4 bg-black" />
          Start
        </button>
        <div className="mx-2 w-0.5 h-6 bg-gray-400 border-r border-white" />
        <div className="flex-1" />
        <div className="px-3 py-1 bg-gray-300 border-inset border-2 border-gray-500 text-xs font-sans">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
}