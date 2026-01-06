'use client'

import React, { useState, useEffect, useRef } from 'react'

interface WindowProps {
  onSendMessage: (message: string) => void
  messages: Array<{id: number, text: string, sender: string, timestamp: string}>
}

const Window: React.FC<WindowProps> = ({ onSendMessage, messages }) => {
  // 1. STATE: Simulation of a 1980s Mailbox
  const [emails, setEmails] = useState([
    { id: 1, from: 'postmaster@vax11', subj: 'System Maintenance', body: 'The server will be down for backups at 02:00 PST.\nPlease save all active buffers.', date: '10-MAY-1988', read: false },
    { id: 2, from: 'ken@bell-labs', subj: 'C Compiler Update', body: 'New headers are available in /usr/include.\nCheck the man pages for changes.', date: '12-MAY-1988', read: false },
    { id: 3, from: 'alice@uunet.uu', subj: 'Conference', body: 'Are we meeting at the terminal room today?', date: '13-MAY-1988', read: false }
  ])

  const [history, setHistory] = useState<string[]>([
    "UCB Mail Tool (mailx) Version 5.3.11 (Berkeley) 1988",
    "Type ? for help.",
    "\"/var/mail/user\": 3 messages 3 new",
    ">N  1 postmaster@vax11  Tue May 10  \"System Maint...\"",
    " N  2 ken@bell-labs      Thu May 12  \"C Compiler...\"",
    " N  3 alice@uunet.uu     Fri May 13  \"Conference\"",
    "& "
  ])

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'CMD' | 'TO' | 'SUBJ' | 'BODY'>('CMD')
  const [draft, setDraft] = useState({ to: '', subj: '', body: '' })
  const terminalRef = useRef<HTMLDivElement>(null)

  // 2. AUTO-SCROLL
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [history])

  // 3. CROSS-ERA INTEGRATION
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      const newId = 100 + last.id
      if (!emails.find(e => e.id === newId)) {
        setEmails(prev => [...prev, {
          id: newId, from: `${last.sender.toLowerCase()}@time.link`, subj: `RE: ${last.sender.toUpperCase()}`,
          body: last.text, date: 'CURRENT', read: false
        }])
        setHistory(prev => [...prev, `[NEW MAIL ARRIVED FROM ${last.sender.toUpperCase()}]`, "& "])
      }
    }
  }, [messages])

  // 4. THE COMMAND PARSER
  const handleAction = (val: string) => {
    const raw = val.trim()
    const low = raw.toLowerCase()
    const args = low.split(' ')
    const cmd = args[0]

    if (mode === 'CMD') {
      const newHistory = [...history]
      newHistory[newHistory.length - 1] += raw 

      // --- SHELL ESCAPE LOGIC (!) ---
      if (raw.startsWith('!')) {
        const shellCmd = raw.substring(1).toLowerCase()
        if (shellCmd === 'clear' || shellCmd === 'cls') {
          setHistory(["& "])
          return
        } else {
          newHistory.push(`[Shell] Executing '${shellCmd}'...`, "Command executed successfully.", "& ")
          setHistory(newHistory)
          return
        }
      }

      // --- STANDARD MAILX COMMANDS ---
      switch (cmd) {
        case 'h':
        case 'headers':
          emails.forEach(e => newHistory.push(`${e.read ? ' ' : 'N'} ${e.id.toString().padEnd(2)} ${e.from.padEnd(16)} ${e.date} "${e.subj}"`))
          break

        case 't':
        case 'p':
        case 'type':
        case 'print':
          const mail = emails.find(e => e.id === parseInt(args[1]))
          if (mail) {
            setEmails(prev => prev.map(m => m.id === mail.id ? {...m, read: true} : m))
            newHistory.push(`Message ${mail.id}:`, `From: ${mail.from}`, `Subject: ${mail.subj}`, "--------------------", ...mail.body.split('\n'), "--------------------")
          } else newHistory.push("Error: Message not found.")
          break

        case 'n':
        case 'next':
          const next = emails.find(e => !e.read)
          if (next) {
            setEmails(prev => prev.map(m => m.id === next.id ? {...m, read: true} : m))
            newHistory.push(`Message ${next.id}:`, `From: ${next.from}`, `Subject: ${next.subj}`, "--------------------", ...next.body.split('\n'), "--------------------")
          } else newHistory.push("No more unread messages.")
          break

        case 'd':
        case 'delete':
          const toDelete = parseInt(args[1])
          if (emails.find(e => e.id === toDelete)) {
            setEmails(prev => prev.filter(e => e.id !== toDelete))
            newHistory.push(`Message ${toDelete} marked for deletion.`)
          } else newHistory.push("Error: Invalid ID.")
          break

        case 'u':
        case 'undelete':
          newHistory.push(`Message ${args[1]} restored from mail buffer.`)
          break

        case 'm':
        case 'mail':
          setMode('TO')
          newHistory.push("To: ")
          setHistory(newHistory)
          return

        case 'r':
        case 'reply':
          const replyTo = emails.find(e => e.id === parseInt(args[1]))
          if (replyTo) {
            setMode('BODY')
            setDraft({ to: replyTo.from, subj: `Re: ${replyTo.subj}`, body: '' })
            newHistory.push(`To: ${replyTo.from}`, `Subject: Re: ${replyTo.subj}`, "Enter body:")
          } else newHistory.push("Error: Specify a valid message ID.")
          break

        case 'z':
        case 'clear': // In our UI, Z acts as a quick reset
          setHistory(["Terminal Reset.", "& "])
          return

        case 'q':
        case 'quit':
          newHistory.push("Closing mailbox /var/mail/user...", "Bye.")
          break

        case '?':
        case 'help':
          newHistory.push(
            "Available Mail Commands:",
            "  h (headers)      - List message headers",
            "  t <id> (type)    - Print message to screen",
            "  n (next)         - Read next unread message",
            "  m <addr> (mail)  - Compose new message",
            "  r <id> (reply)   - Reply to a message",
            "  d <id> (delete)  - Delete message",
            "  u <id> (undelete)- Restore message",
            "  z (clear)        - Clear terminal screen",
            "  !clear           - Shell Escape: System Clear",
            "  q (quit)         - Save changes and exit"
          )
          break

        default:
          if (raw) newHistory.push(`? - Unknown command. Type "?" for help.`)
      }
      newHistory.push("& ")
      setHistory(newHistory)
    } else {
      handleCompose(raw)
    }
  }

  const handleCompose = (val: string) => {
    if (mode === 'TO') {
      setDraft({ ...draft, to: val })
      setMode('SUBJ')
      setHistory([...history.slice(0, -1), `To: ${val}`, "Subject: "])
    } else if (mode === 'SUBJ') {
      setDraft({ ...draft, subj: val })
      setMode('BODY')
      setHistory([...history.slice(0, -1), `Subject: ${val}`, "Enter body. End with '.' on a new line:"])
    } else if (mode === 'BODY') {
      if (val === '.') {
        onSendMessage(`[MAILX] TO: ${draft.to} | SUBJ: ${draft.subj} | BODY: ${draft.body}`)
        setHistory([...history, ".", "EOT", "Message delivered to transport agent.", "& "])
        setMode('CMD')
        setDraft({ to: '', subj: '', body: '' })
      } else {
        setDraft({ ...draft, body: draft.body + val + '\n' })
        setHistory([...history, `> ${val}`])
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050805] p-2 md:p-8 font-mono text-emerald-500 selection:bg-emerald-900 selection:text-white">
      {/* WINDOW FRAME */}
      <div className="max-w-6xl mx-auto border border-emerald-900 rounded-lg overflow-hidden bg-black shadow-[0_0_50px_rgba(0,40,0,0.4)]">
        
        {/* TOP BAR */}
        <div className="bg-emerald-950/40 border-b border-emerald-900 p-3 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-900" />
            <div className="w-3 h-3 rounded-full bg-emerald-900" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-700">MTRAIN // MAILX-CLIENT v5.3</span>
          <div className="text-[9px] text-emerald-900 font-bold hidden sm:block">TTY01 // BAUD: 2400</div>
        </div>

        {/* TERMINAL SCREEN */}
        <div className="relative group">
          <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-linear(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-linear(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]"></div>
          
          <div ref={terminalRef} className="h-480px overflow-y-auto p-6 space-y-0.5 text-sm relative scrollbar-thin scrollbar-thumb-emerald-900">
            {history.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap ${line.startsWith('&') ? 'text-emerald-300 font-bold' : 'opacity-90'}`}>
                {line}
              </div>
            ))}
            
            <div className="flex mt-2">
              <input
                autoFocus
                className="bg-transparent border-none outline-none flex-1 text-emerald-400 focus:ring-0 p-0 caret-emerald-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAction(input)
                    setInput('')
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* FOOTER SHORTCUTS & STATS */}
        <div className="bg-emerald-950/20 border-t border-emerald-900 p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <h4 className="text-[9px] text-emerald-800 uppercase font-black">List / Read</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('h')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">h: Headers</button>
              <button onClick={() => handleAction('n')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">n: Next</button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[9px] text-emerald-800 uppercase font-black">Compose</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('m')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">m: Mail</button>
              <button onClick={() => handleAction('r 1')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">r: Reply</button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[9px] text-emerald-800 uppercase font-black">Organize</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('d 1')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">d: Delete</button>
              <button onClick={() => handleAction('u 1')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">u: Undo</button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[9px] text-emerald-800 uppercase font-black">Escape / Sys</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('!clear')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">!clear</button>
              <button onClick={() => handleAction('q')} className="text-[10px] border border-emerald-900 px-1 hover:bg-emerald-500 hover:text-black">q: Quit</button>
            </div>
          </div>
          <div className="space-y-1 border-l border-emerald-900/50 pl-4">
            <h4 className="text-[9px] text-emerald-800 uppercase font-black">Mail Stats</h4>
            <div className="text-[11px] font-bold text-emerald-400">
              BOX: {emails.length} | NEW: {emails.filter(e => !e.read).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Window