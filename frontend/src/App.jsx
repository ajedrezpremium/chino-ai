import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Mic, Send, Volume2, Sparkles, Trophy, BarChart3, Medal, Settings, LogIn, LogOut, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChinoGamer from './ChinoGamer'
import BusinessView from './BusinessView'
import RankingsView from './RankingsView'
import SectionsView from './SectionsView'
import LandingView from './LandingView'
import AuthModal from './AuthModal'
import ErrorBoundary from './ErrorBoundary'
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
  const initialMsg = (gender) => gender === 'male'
    ? 'Ola! Son Chiño, o teu colega celeste. Pregúntame o que queiras sobre a historia do Celta!'
    : 'Ola! Son Chiña, a túa colega celeste. Encantada de falar contigo do noso Celta!'
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('chat')
  const [adminMode, setAdminMode] = useState(() => localStorage.getItem('chino_admin') === 'true')
  const [showLanding, setShowLanding] = useState(() => sessionStorage.getItem('chino_landing') !== 'true')
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [legends, setLegends] = useState([])
  const [knowledgeFacts, setKnowledgeFacts] = useState([])
  const [correctionFor, setCorrectionFor] = useState(null)
  const [correctionText, setCorrectionText] = useState('')
  const messagesEndRef = useRef(null)

  const toggleAdmin = () => {
    const next = !adminMode
    setAdminMode(next)
    localStorage.setItem('chino_admin', next.toString())
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchLegends()
    fetchKnowledge()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener('voiceschanged', () => {}, { once: true })
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user?.id) return
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'siareiro'
    supabase.from('user_profiles').upsert({
      id: user.id,
      username,
      display_name: username
    }).then().catch(() => {})
  }, [user?.id])

  const fetchLegends = async () => {
    const { data } = await supabase.from('legends').select('*').limit(5)
    if (data) setLegends(data)
  }

  const fetchKnowledge = async () => {
    const { data } = await supabase.from('knowledge_facts').select('fact_text').eq('verified', true).limit(30)
    if (data) setKnowledgeFacts(data.map(f => f.fact_text))
  }

  const [agentGender, setAgentGender] = useState('male')
  const detectLang = (text) => {
    const lower = text.toLowerCase()
    const glWords = ['non', 'pode', 'ben', 'moito', 'unha', 'ti', 'celeste', 'goleador', 'partido', 'historia', 'xogador', 'galicia', 'vigo', 'balaídos', 'xogar', 'mellor', 'sempre', 'nunca', 'porque', 'cousa', 'anos', 'campión', 'equipo', 'derbi']
    const esWords = ['no', 'puede', 'bien', 'mucho', 'una', 'tú', 'goleador', 'partido', 'historia', 'jugador', 'españa', 'balai', 'mejor', 'siempre', 'nunca', 'porque', 'cosa', 'años', 'campeón', 'equipo', 'dépor']
    const glCount = glWords.filter(w => lower.includes(w)).length
    const esCount = esWords.filter(w => lower.includes(w)).length
    if (glCount > esCount) return 'gl'
    if (esCount > glCount) return 'es'
    if (/\b(the|is|was|are|were|have|has|been|will|would|could|hello|hi|thanks|football|player|team|club|match|game|goal|season|league|cup|europe|world|best|never|always)\b/i.test(lower)) return 'en'
    return 'es'
  }
  const pickVoice = (voices, gender) => {
    const male = /pablo|raul|jorge|david|male|mark|daniel|james|john|paul|mike|tom|alex|oliver|harry|george|sam/i
    const female = /helena|zira|laura|elena|sabina|dalia|female|mujer|muller|samantha|karen|susan|julia|emma|olivia|ava|sophia|mía|charlotte|victoria/i
    return gender === 'male'
      ? voices.find(v => male.test(v.name)) || voices.find(v => !female.test(v.name))
      : voices.find(v => female.test(v.name)) || voices.find(v => !male.test(v.name))
  }
  const speak = (text, gender, retry = 0) => {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    const g = gender || agentGender
    const allVoices = window.speechSynthesis.getVoices()
    if (allVoices.length === 0 && retry < 5) {
      return setTimeout(() => speak(text, gender, retry + 1), 300)
    }
    const lang = detectLang(text)
    const langVoices = lang === 'en'
      ? allVoices.filter(v => v.lang.startsWith('en'))
      : allVoices.filter(v => v.lang.startsWith('es') || v.lang.startsWith('gl'))
    u.voice = pickVoice(langVoices, g) || langVoices[0] || allVoices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'es')) || allVoices[0]
    u.lang = u.voice?.lang || 'es-ES'
    u.rate = g === 'male' ? 1.0 : 1.1
    window.speechSynthesis.speak(u)
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

  const saveMessage = async (role, text) => {
    if (!user?.id) return
    try {
      await supabase.from('chat_history').insert({ user_id: user.id, role, message: text })
    } catch {}
  }

  const loadChatHistory = async () => {
    if (!user?.id) return
    const { data } = await supabase.from('chat_history').select('message, role').order('created_at', { ascending: true }).limit(50)
    if (data?.length) setMessages(data.map(m => ({ role: m.role === 'user' ? 'user' : 'agent', text: m.message })))
  }

  useEffect(() => {
    loadChatHistory()
  }, [user?.id])

  const handleCorrection = async (msgIdx) => {
    const original = messages[msgIdx]?.text
    if (!original || !correctionText.trim() || !user?.id) return
    await supabase.from('corrections').insert({
      user_id: user.id,
      original_message: original,
      correction_text: correctionText.trim()
    }).catch(() => {})
    setCorrectionFor(null)
    setCorrectionText('')
  }

  const handleSend = async (textOverride = null) => {
    const userText = textOverride || input
    if (!userText.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: userText }])
    saveMessage('user', userText)
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
              ...(knowledgeFacts.length > 0 ? [{ role: 'system', content: `Hechos verificados por usuarios:\n${knowledgeFacts.join('\n')}` }] : []),
              { role: 'user', content: userText }
            ]
          })
        })
        const data = await res.json()
        const aiText = data.choices?.[0]?.message?.content || 'Perdona, non puiden procesar iso.'
        setMessages(prev => [...prev, { role: 'agent', text: aiText }])
        saveMessage('agent', aiText)
        speak(aiText, agentGender)
      } else {
        setMessages(prev => [...prev, { role: 'agent', text: 'Son Chiño! Aquí estou para falar do Celta. (Conecta unha API key en .env para respostas reais)' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: 'Perdona, estou tendo un problema técnico. Inténtao de novo!' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterApp = () => {
    setShowLanding(false)
    sessionStorage.setItem('chino_landing', 'true')
  }

  return (
    <ErrorBoundary>
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <LandingView legends={legends} agentGender={agentGender} onEnter={handleEnterApp} />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-90 z-0" />

        <header className="z-10 p-4 bg-slate-800/80 backdrop-blur-md border-b border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full overflow-hidden shadow-lg flex-shrink-0 ${agentGender === 'male' ? 'shadow-blue-500/50 bg-blue-600' : 'shadow-pink-500/50 bg-pink-600'}`}>
            <img src="/chino-avatar.png" alt={agentGender === 'male' ? 'Chiño' : 'Chiña'} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{agentGender === 'male' ? 'Chiño' : 'Chiña'} AI</h1>
            <p className={`text-xs ${agentGender === 'male' ? 'text-blue-300' : 'text-pink-300'}`}>{agentGender === 'male' ? 'O teu colega celeste' : 'A túa colega celeste'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 tab-scroll">
          <button onClick={() => setCurrentTab('chat')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Sparkles size={11} className="inline mr-0.5" />Chat
          </button>
          <button onClick={() => setCurrentTab('gamer')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'gamer' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Trophy size={11} className="inline mr-0.5" />Gamer
          </button>
          <button onClick={() => setCurrentTab('rankings')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'rankings' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Medal size={11} className="inline mr-0.5" />Ranking
          </button>
          <button onClick={() => setCurrentTab('sections')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'sections' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Sparkles size={11} className="inline mr-0.5" />Seccións
          </button>
          {adminMode && (
            <button onClick={() => setCurrentTab('biz')}
              className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'biz' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              <BarChart3 size={11} className="inline mr-0.5" />Biz
            </button>
          )}
          <div className="w-px h-6 bg-slate-600 mx-1" />
          <button onClick={toggleAdmin}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400">
            <Settings size={13} />
          </button>
          <button onClick={() => setAgentGender(g => {
              const newG = g === 'male' ? 'female' : 'male'
              setMessages([{ role: 'agent', text: newG === 'male' ? 'Ola! Son Chiño, o teu colega celeste. Pregúntame o que queiras!' : 'Ola! Son Chiña, a túa colega celeste. Encantada de falar contigo!' }])
              return newG
            })}
            className={`text-xs px-1.5 py-1.5 rounded-full transition-colors font-bold ${agentGender === 'male' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>
            {agentGender === 'male' ? '👨' : '👩'}
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1" />
          {user ? (
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 rounded-full px-2.5 py-1.5 transition-colors">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-[10px] text-slate-300 max-w-[60px] truncate">{user.email?.split('@')[0]}</span>
              <LogOut size={10} className="text-slate-500" />
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 rounded-full px-2.5 py-1.5 transition-colors">
              <LogIn size={11} className="text-white" />
              <span className="text-[10px] font-bold text-white">Entrar</span>
            </button>
          )}
        </div>
      </header>

      {currentTab === 'rankings' ? (
        <RankingsView supabase={supabase} user={user} onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'sections' ? (
        <SectionsView onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'biz' ? (
        <BusinessView onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'gamer' ? (
        <ChinoGamer supabase={supabase} user={user} speak={speak} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto p-4 z-10 space-y-4 pb-28">
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
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => speak(msg.text, agentGender)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                          <Volume2 size={12} /> Escutar
                        </button>
                        {user && (
                          <button onClick={() => setCorrectionFor(correctionFor === idx ? null : idx)}
                            className="text-slate-500 hover:text-yellow-400 flex items-center gap-1 text-xs">
                            <AlertTriangle size={10} /> Corrixir
                          </button>
                        )}
                      </div>
                    )}
                    {correctionFor === idx && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <textarea value={correctionText} onChange={e => setCorrectionText(e.target.value)}
                          placeholder="Escribe a corrección..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-500 mb-1" rows={2} />
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setCorrectionFor(null); setCorrectionText('') }}
                            className="text-[10px] text-slate-500 px-2 py-1 rounded hover:bg-slate-700">Cancelar</button>
                          <button onClick={() => handleCorrection(idx)}
                            className="text-[10px] bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-500 disabled:opacity-50 font-bold"
                            disabled={!correctionText.trim()}>Enviar</button>
                        </div>
                      </div>
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
      )}

      <AnimatePresence>
        {showAuth && <AuthModal supabase={supabase} onClose={() => setShowAuth(false)} />}
      </AnimatePresence>

      </motion.div>
    )}
    </AnimatePresence>
    </ErrorBoundary>
  )
}
