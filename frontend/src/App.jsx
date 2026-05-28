import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Mic, Send, Volume2, Sparkles, Trophy, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChinoGamer from './ChinoGamer'
import BusinessView from './BusinessView'
import DemoTour from './DemoTour'
import { SYSTEM_PROMPT } from './chino-knowledge'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const USE_OPENROUTER = !!OPENROUTER_API_KEY

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Ola! Son Chiño, o teu colega celeste. Pregúntame o que queiras sobre a historia do Celta!' }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showGamer, setShowGamer] = useState(false)
  const [showBusiness, setShowBusiness] = useState(false)
  const [legends, setLegends] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchLegends()
  }, [])

  const fetchLegends = async () => {
    const { data } = await supabase.from('legends').select('*').limit(5)
    if (data) setLegends(data)
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()
      const es = voices.find(v => v.lang.includes('es') || v.lang.includes('gl'))
      if (es) u.voice = es
      u.rate = 1.1
      window.speechSynthesis.speak(u)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Usa Chrome para voz.')
      return
    }
    const r = new window.webkitSpeechRecognition()
    r.lang = 'es-ES'
    r.interimResults = false
    setIsRecording(true)
    r.start()
    r.onresult = (e) => {
      const t = e.results[0][0].transcript
      setInput(t)
      setIsRecording(false)
      handleSend(t)
    }
    r.onerror = () => setIsRecording(false)
    r.onend = () => setIsRecording(false)
  }

  const handleSend = async (textOverride = null) => {
    const userText = textOverride || input
    if (!userText.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInput('')
    setIsLoading(true)

    try {
      const key = OPENROUTER_API_KEY || OPENAI_API_KEY
      if (key) {
        const baseUrl = USE_OPENROUTER
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions'
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
        if (USE_OPENROUTER) {
          headers['HTTP-Referer'] = 'https://chinoaiagent.vercel.app'
          headers['X-Title'] = 'Chiño AI'
        }
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: USE_OPENROUTER ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userText }
            ]
          })
        })
        const data = await res.json()
        const aiText = data.choices?.[0]?.message?.content || 'Perdona, non puiden procesar iso.'
        setMessages(prev => [...prev, { role: 'agent', text: aiText }])
        speak(aiText)
      } else {
        setMessages(prev => [...prev, { role: 'agent', text: 'Son Chiño! Aquí estou para falar do Celta. (Conecta unha API key en .env para respostas reais)' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: 'Perdona, estou tendo un problema técnico. Inténtao de novo!' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-90 z-0" />

      <header className="z-10 p-4 bg-slate-800/80 backdrop-blur-md border-b border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-blue-500/50 bg-blue-600">
            <img src="/chino-avatar.png" alt="Chiño" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Chiño AI</h1>
            <p className="text-xs text-blue-300">O teu colega celeste</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setShowGamer(false); setShowBusiness(false) }}
            className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${!showGamer && !showBusiness ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Sparkles size={12} className="inline mr-0.5" />Chat
          </button>
          <button onClick={() => { setShowGamer(true); setShowBusiness(false) }}
            className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${showGamer && !showBusiness ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Trophy size={12} className="inline mr-0.5" />Gamer
          </button>
          <button onClick={() => { setShowBusiness(true); setShowGamer(false) }}
            className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${showBusiness ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <BarChart3 size={12} className="inline mr-0.5" />Business
          </button>
        </div>
      </header>

      {!showGamer ? (
        <>
          <main className="flex-1 overflow-y-auto p-4 z-10 space-y-4 pb-28">
            {legends.length > 0 && messages.length === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {legends.map((l, i) => (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/80 border border-blue-500/20 rounded-xl p-3 text-center">
                    <div className="w-12 h-12 bg-blue-600/30 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-blue-400">
                      {l.name.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold truncate">{l.name}</p>
                    <p className="text-[10px] text-blue-300">{l.role}</p>
                  </motion.div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-600">
                      <img src="/chino-avatar.png" alt="Chiño" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 border border-blue-500/30 text-gray-100 rounded-bl-none'}`}>
                    <p className="text-sm md:text-base">{msg.text}</p>
                    {msg.role === 'agent' && (
                      <button onClick={() => speak(msg.text)} className="mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                        <Volume2 size={12} /> Escutar
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-blue-500/30">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-75" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="z-10 p-4 bg-slate-900/90 backdrop-blur-md border-t border-blue-500/30 fixed bottom-0 w-full">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <button onClick={startListening}
                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}>
                <Mic size={22} />
              </button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pregúntalle a Chiño..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/30">
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2">Chiño AI © 2026 — Real Club Celta de Vigo</p>
          </footer>
        </>
      ) : showBusiness ? (
        <BusinessView />
      ) : (
        <ChinoGamer supabase={supabase} speak={speak} />
      )}

      <DemoTour onNavigate={(section) => {
        setShowGamer(section === 'gamer')
        setShowBusiness(section === 'business')
        if (section === 'chat') { setShowGamer(false); setShowBusiness(false) }
      }} />
    </div>
  )
}
