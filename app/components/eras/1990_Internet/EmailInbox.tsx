'use client';

import React, { useState } from 'react';
import { Mail, Trash2, Printer, Reply } from 'lucide-react';

// Mock Data
const EMAILS = [
  { id: 1, from: "System Admin", subject: "Welcome to GlobalNet!", date: "10/24/95", read: false },
  { id: 2, from: "Mom", subject: "FW: FW: Funny Cat Photo", date: "10/22/95", read: true },
  { id: 3, from: "Bill G.", subject: "The Internet is the future", date: "10/20/95", read: true },
  { id: 4, from: "Hacker42", subject: "Unknown Sender", date: "10/19/95", read: true },
];

interface EmailInboxProps {
  onSelectEmail?: (emailId: number) => void;
}

export default function EmailInbox({ onSelectEmail }: EmailInboxProps) {
  const [selectedId, setSelectedId] = useState<number | null>(1);

  return (
    <div className="w-full max-w-4xl h-[60vh] bg-[#C0C0C0] p-1 flex flex-col font-sans text-sm shadow-2xl">
      
      {/* 🪟 Window Header */}
      <div className="bg-[#000080] text-white px-2 py-1 font-bold flex justify-between items-center mb-1 select-none">
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>Inbox - Outlook Express</span>
        </div>
        <div className="flex gap-0.5">
           {/* Minimize/Maximize/Close Buttons */}
           <WinBtn>_</WinBtn>
           <WinBtn>□</WinBtn>
           <WinBtn>X</WinBtn>
        </div>
      </div>

      {/* 📋 Toolbar */}
      <div className="flex gap-4 p-2 border-b-2 border-gray-400 mb-1">
        <ToolBtn icon={<Mail size={16} />} label="New Mail" />
        <ToolBtn icon={<Reply size={16} />} label="Reply" />
        <ToolBtn icon={<Trash2 size={16} />} label="Delete" />
        <div className="w-px bg-gray-400 mx-2" />
        <ToolBtn icon={<Printer size={16} />} label="Print" />
      </div>

      {/* 📧 The Email List (The "Spreadsheet" Look) */}
      <div className="flex-1 bg-white border-inset border-2 border-gray-600 overflow-y-auto cursor-default">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#C0C0C0] text-black border-b border-gray-400 text-left">
              <th className="px-2 py-1 w-8 border-r border-gray-400">Wait</th>
              <th className="px-2 py-1 w-1/4 border-r border-gray-400">From</th>
              <th className="px-2 py-1 w-1/2 border-r border-gray-400">Subject</th>
              <th className="px-2 py-1">Received</th>
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((email) => (
              <tr 
                key={email.id}
                onClick={() => {
                  setSelectedId(email.id);
                  if(onSelectEmail) onSelectEmail(email.id);
                }}
                className={`
                  ${selectedId === email.id ? 'bg-[#000080] text-white outline-dotted outline-1 outline-white' : 'text-black hover:bg-gray-100'}
                `}
              >
                <td className="px-2 py-0.5 border-r border-dotted border-gray-300">
                  {/* Closed envelope icon */}
                  {!email.read ? <Mail size={12} fill="currentColor" /> : <div className="w-3" />}
                </td>
                <td className="px-2 py-0.5 border-r border-dotted border-gray-300 truncate">
                  {email.from}
                </td>
                <td className="px-2 py-0.5 border-r border-dotted border-gray-300 truncate font-medium">
                  {email.subject}
                </td>
                <td className="px-2 py-0.5">{email.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="mt-1 border-inset border border-gray-400 px-2 py-0.5 text-xs text-gray-600 flex justify-between">
        <span>4 message(s), 1 unread</span>
        <span>Online</span>
      </div>
    </div>
  );
}

// 🧱 Helper Component: Classic Windows 95 Button
function WinBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-4 h-4 bg-[#C0C0C0] border-t border-l border-white border-b border-r  shadow-sm flex items-center justify-center text-[10px] font-bold active:border-t-black active:border-l-black active:border-b-white active:border-r-white">
      {children}
    </button>
  );
}

// 🧱 Helper Component: Toolbar Button
function ToolBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex flex-col items-center gap-0.5 px-2 hover:bg-gray-300 active:translate-y-px">
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}