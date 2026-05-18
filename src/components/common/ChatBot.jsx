import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi'
import { MdDragHandle } from 'react-icons/md'

const QUICK_QUESTIONS = [
  'What rooms are available?',
  'What is the check-in time?',
  'Do you have a pool?',
  'How do I make a booking?',
]

const MIN_W = 260
const MAX_W = 480
const MIN_H = 300
const MAX_H = 650
const DEFAULT_W = 300
const DEFAULT_H = 420

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Groks Hotel & Resort. I'm Aria, your personal concierge. How may I assist you today?",
      time: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })

  const bottomRef = useRef()
  const inputRef = useRef()
  const resizing = useRef(null) // 'both' | 'width' | 'height'
  const startPos = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H })

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Resize logic ──────────────────────────────
  const onMouseDown = useCallback((e, direction) => {
    e.preventDefault()
    resizing.current = direction
    startPos.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }

    const onMouseMove = (e) => {
      if (!resizing.current) return
      const dx = startPos.current.x - e.clientX // dragging left = bigger width
      const dy = startPos.current.y - e.clientY // dragging up = bigger height

      if (resizing.current === 'both' || resizing.current === 'width') {
        const newW = Math.min(MAX_W, Math.max(MIN_W, startPos.current.w + dx))
        setSize(p => ({ ...p, w: newW }))
      }
      if (resizing.current === 'both' || resizing.current === 'height') {
        const newH = Math.min(MAX_H, Math.max(MIN_H, startPos.current.h + dy))
        setSize(p => ({ ...p, h: newH }))
      }
    }

    const onMouseUp = () => {
      resizing.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [size])

  // Touch resize support
  const onTouchStart = useCallback((e, direction) => {
    const touch = e.touches[0]
    resizing.current = direction
    startPos.current = { x: touch.clientX, y: touch.clientY, w: size.w, h: size.h }

    const onTouchMove = (e) => {
      const t = e.touches[0]
      const dx = startPos.current.x - t.clientX
      const dy = startPos.current.y - t.clientY
      if (resizing.current === 'both' || resizing.current === 'width') {
        setSize(p => ({ ...p, w: Math.min(MAX_W, Math.max(MIN_W, startPos.current.w + dx)) }))
      }
      if (resizing.current === 'both' || resizing.current === 'height') {
        setSize(p => ({ ...p, h: Math.min(MAX_H, Math.max(MIN_H, startPos.current.h + dy)) }))
      }
    }

    const onTouchEnd = () => {
      resizing.current = null
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }

    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
  }, [size])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')

    const userMsg = { role: 'user', content: userText, time: new Date() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const BASE = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || "I apologize, I'm having difficulty responding. Please contact us at +234 800 000 0000."
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date() }])
      if (!open) setUnread(prev => prev + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize for the inconvenience. Please contact our concierge team at +234 800 000 0000.",
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Message area height = total height minus header(64) minus input(56) minus quick(optional ~70)
  const msgAreaH = size.h - 64 - 56 - (messages.length <= 2 ? 72 : 0)

  return (
    <>
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-50"
            style={{
              width: size.w,
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              maxWidth: 'calc(100vw - 24px)',
            }}
          >
            {/* ── Top-left resize corner (width + height) ── */}
            <div
              onMouseDown={(e) => onMouseDown(e, 'both')}
              onTouchStart={(e) => onTouchStart(e, 'both')}
              className="absolute -top-2 -left-2 z-10 w-5 h-5 flex items-center justify-center cursor-nw-resize group"
              title="Drag to resize"
            >
              <div className="w-3 h-3 rounded-full border-2 border-[#C8A96A]/50 group-hover:border-[#C8A96A] group-hover:bg-[rgba(200,169,106,0.2)] transition-all" />
            </div>

            {/* ── Left edge resize (width only) ── */}
            <div
              onMouseDown={(e) => onMouseDown(e, 'width')}
              onTouchStart={(e) => onTouchStart(e, 'width')}
              className="absolute top-8 bottom-8 -left-2 w-3 cursor-ew-resize group flex items-center justify-center"
              title="Drag to resize width"
            >
              <div className="w-0.5 h-12 bg-[#C8A96A]/20 group-hover:bg-[#C8A96A]/60 rounded-full transition-all" />
            </div>

            {/* ── Top edge resize (height only) ── */}
            <div
              onMouseDown={(e) => onMouseDown(e, 'height')}
              onTouchStart={(e) => onTouchStart(e, 'height')}
              className="absolute -top-2 left-8 right-8 h-3 cursor-ns-resize group flex items-center justify-center"
              title="Drag to resize height"
            >
              <div className="h-0.5 w-16 bg-[#C8A96A]/20 group-hover:bg-[#C8A96A]/60 rounded-full transition-all" />
            </div>

            <div
              className="overflow-hidden flex flex-col border border-[rgba(200,169,106,0.25)]"
              style={{ borderRadius: '20px', height: size.h }}
            >
              {/* ── Header ── */}
              <div className="shrink-0 bg-[#0d1b2a] px-4 py-3 flex items-center justify-between border-b border-[rgba(200,169,106,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[rgba(200,169,106,0.15)] border border-[rgba(200,169,106,0.4)] flex items-center justify-center">
                      <span className="text-[#C8A96A]">✦</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4CAF88] rounded-full border-2 border-[#0d1b2a]" />
                  </div>
                  <div>
                    <div className="text-[#F7F3EE] text-sm font-light tracking-wider">Aria</div>
                    <div className="text-[#C8A96A]/60 text-[0.55rem] tracking-[0.2em] uppercase">AI Concierge · Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Reset size button */}
                  <button
                    onClick={() => setSize({ w: DEFAULT_W, h: DEFAULT_H })}
                    title="Reset size"
                    className="text-[#F7F3EE]/20 hover:text-[#C8A96A]/60 transition-colors text-xs tracking-wider"
                  >
                    <MdDragHandle size={16} />
                  </button>
                  <button onClick={() => setOpen(false)}
                    className="text-[#F7F3EE]/30 hover:text-[#C8A96A] transition-colors">
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080e1a]/80"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#C8A96A30 transparent' }}
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-[rgba(200,169,106,0.1)] border border-[rgba(200,169,106,0.3)] flex items-center justify-center shrink-0 mt-1">
                        <span className="text-[#C8A96A] text-[10px]">✦</span>
                      </div>
                    )}
                    <div className={`max-w-[82%] flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2.5 rounded-2xl text-sm font-light leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[rgba(200,169,106,0.15)] border border-[rgba(200,169,106,0.3)] text-[#F7F3EE] rounded-tr-sm'
                          : 'bg-[rgba(255,255,255,0.05)] border border-white/10 text-[#F7F3EE]/80 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[0.5rem] text-[#F7F3EE]/20 px-1">{formatTime(msg.time)}</span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[rgba(200,169,106,0.1)] border border-[rgba(200,169,106,0.3)] flex items-center justify-center shrink-0">
                      <span className="text-[#C8A96A] text-[10px]">✦</span>
                    </div>
                    <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-[rgba(255,255,255,0.05)] border border-white/10">
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Quick questions ── */}
              {messages.length <= 2 && (
                <div className="shrink-0 px-3 py-2 border-t border-white/5 bg-[#080e1a]/60">
                  <p className="text-[0.5rem] tracking-[0.2em] uppercase text-[#F7F3EE]/25 mb-1.5">Quick questions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)}
                        className="px-2.5 py-1 text-[0.58rem] tracking-wider text-[#C8A96A]/70 border border-[rgba(200,169,106,0.2)] rounded-full hover:border-[#C8A96A] hover:text-[#C8A96A] transition-all duration-200">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input ── */}
              <div className="shrink-0 px-3 py-2.5 border-t border-[rgba(200,169,106,0.1)] bg-[#0d1b2a] flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Aria anything..."
                  rows={1}
                  className="flex-1 bg-transparent text-[#F7F3EE]/80 text-sm font-light placeholder:text-[#F7F3EE]/20 resize-none outline-none leading-relaxed py-0.5"
                  style={{ maxHeight: '60px' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg bg-[#C8A96A] flex items-center justify-center shrink-0 hover:bg-[#D8C3A5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiSend size={13} className="text-[#0B1320]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #C8A96A, #A58E6F)',
          boxShadow: '0 8px 32px rgba(200,169,106,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <FiX size={22} className="text-[#0B1320]" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <FiMessageSquare size={22} className="text-[#0B1320]" />
            </motion.div>
          )}
        </AnimatePresence>

        {unread > 0 && !open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#D96C6C] rounded-full flex items-center justify-center text-white text-[0.6rem] font-medium">
            {unread}
          </motion.div>
        )}

        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#C8A96A]"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  )
}