import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Mic, Send, Volume2, Sparkles, Trophy, BarChart3, Medal, Settings, LogIn, AlertTriangle, Share2, Check, Twitter, MessageCircle, Calendar, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from './ErrorBoundary'
import { GaliciaFlag, SpainFlag, UKFlag } from './i18n/LanguageSwitcher'
import { SYSTEM_PROMPT } from './chino-knowledge'
import PitchXI from './PitchXI'
import LiveResultsBanner from './LiveResultsBanner'
import PushNotif from './PushNotif'
import XpBar, { awardXp } from './XpBar'

const ChinoGamer = lazy(() => import('./ChinoGamer'))
const BusinessView = lazy(() => import('./BusinessView'))
const RankingsView = lazy(() => import('./RankingsView'))
const SectionsView = lazy(() => import('./SectionsView'))
const MatchesView = lazy(() => import('./MatchesView'))
const ProfileView = lazy(() => import('./ProfileView'))
const AcademyView = lazy(() => import('./AcademyView'))
const LandingView = lazy(() => import('./LandingView'))
const AuthModal = lazy(() => import('./AuthModal'))

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const USE_OPENROUTER = !!OPENROUTER_API_KEY

export default function App() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([
    { role: 'agent', text: t('chat.welcome_male') }
  ])
  const initialMsg = (gender) => gender === 'male' ? t('chat.welcome_male') : t('chat.welcome_female')
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('chat')
  const [rankingTab, setRankingTab] = useState('players')
  const [adminMode, setAdminMode] = useState(() => localStorage.getItem('chino_admin') === 'true')
  const [showLanding, setShowLanding] = useState(() => sessionStorage.getItem('chino_landing') !== 'true')
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const [legends, setLegends] = useState([])
  const [correctionFor, setCorrectionFor] = useState(null)
  const [shareOpen, setShareOpen] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [reactions, setReactions] = useState({})
  const [reactionOpen, setReactionOpen] = useState(null)
  const [correctionText, setCorrectionText] = useState('')
  const [voices, setVoices] = useState([])
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => localStorage.getItem('chino_voice') || '')
  const messagesEndRef = useRef(null)

  const [summaryCache, setSummaryCache] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem('chino_theme') || 'dark')
  const [levelUpMsg, setLevelUpMsg] = useState(null)
  const [xpToast, setXpToast] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('chino_theme', theme)
  }, [theme])

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
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) setVoices(v)
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true })
    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user?.id) return
    const username = user.user_metadata?.username || user.email?.split('@')[0] || t('rankings.fan_default')
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

  const getEmbedding = async (text) => {
    try {
      const key = OPENROUTER_API_KEY || OPENAI_API_KEY
      if (!key) return null
      const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.data?.[0]?.embedding || null
    } catch { return null }
  }

  const fetchRelevantFacts = async (userText) => {
    // Try vector search first (semantic)
    try {
      const embedding = await getEmbedding(userText)
      if (embedding) {
        const { data } = await supabase.rpc('match_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 50
        })
        if (data?.length > 0) return data.map(f => f.fact_text)
      }
    } catch {}

    // Fallback: keyword + full-text search
    const CAT_MAP = {
      economia:['presupuesto','presuposto','salario','dinero','ingreso','gasto','venta','traspaso','deuda','millon','limite','financi'],
      estadio:['estadio','balaidos','aforo','capacidad','remodel','grada','afouteza'],
      adestradores:['entrenador','adestrador','coach','tecnico','director'],
      presidentes:['presidente','directiva','mouriño','ges'],
      europa:['europa','uefa','champions','europa league','intertoto'],
      historia:['fundacion','historia','fusion','1923','origen','orixe'],
      plantilla:['plantilla','xogador','jugador','fichaxe','fichaje','contrato','cesion','mercado','canteira','cantera'],
      xogadores:['porteiro','portero','goleador','zamora','gol','goles','mejor','mellor','partidos']
    }
    const t = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const cats = Object.entries(CAT_MAP).filter(([_,kw]) => kw.some(k => t.includes(k))).map(([c]) => c)
    const stopWords = new Set(['que','el','la','los','las','un','una','del','en','por','con','para','es','se','su','al','lo','como','mas','pero','sus','le','ya','este','entre','todo','esta','sin','era','muy','cual','quien','a','e','i','o','u','the','of','and','to','in','is','it','for','on','with','as','at','from','or','an','but','not','you','all','can','had','her','was','one','our','out','has','are','have','been','would','could','should','what','when','where','why','how','which','that','this','these','those','do','does','did'])
    const words = userText.toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/g,' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
    const searchTerm = words.join(' ')

    let query = supabase.from('knowledge_facts').select('fact_text').eq('verified', true)
    if (cats.length) query = query.in('category', cats)
    if (searchTerm) query = query.textSearch('fact_text', searchTerm, { type: 'websearch' })
    const { data } = await query.limit(50)
    if (data?.length) return data.map(f => f.fact_text)

    if (cats.length) {
      const { data: fb } = await supabase.from('knowledge_facts').select('fact_text').eq('verified', true).in('category', cats).limit(30)
      if (fb?.length) return fb.map(f => f.fact_text)
    }
    const { data: anyFacts } = await supabase.from('knowledge_facts').select('fact_text').eq('verified', true).limit(30)
    return anyFacts?.map(f => f.fact_text) || []
  }

  const [agentGender, setAgentGender] = useState('male')
  const detectLang = (text) => {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const glWords = ['non', 'unha', 'xogador', 'xogar', 'xoga', 'xogan', 'xogou', 'mellor', 'cousa', 'quen', 'galego', 'celeste', 'siareiro', 'adestrador', 'porteiro', 'canteiran', 'tempada', 'afeccion', 'tua', 'mina', 'desta', 'nese', 'aquel', 'eles', 'nos', 'vos', 'grazas', 'tamen', 'moi', 'ti', 'che', 'lle', 'derbi', 'hoxe', 'mais', 'polo', 'pola', 'cando', 'onde', 'asi', 'xa', 'aqui', 'sempre']
    const esWords = ['no', 'una', 'jugador', 'jugar', 'mejor', 'cosa', 'quien', 'espanol', 'portero', 'canterano', 'temporada', 'aficion', 'futbol', 'hola', 'gracias', 'tambien', 'mucho', 'tu', 'te', 'le', 'ella', 'ellas', 'ellos', 'usted', 'nosotros', 'deportivo']
    const glCount = glWords.filter(w => lower.includes(w)).length
    const esCount = esWords.filter(w => lower.includes(w)).length
    if (glCount > esCount) return 'gl'
    if (esCount > glCount) return 'es'
    if (/\b(the|is|was|are|were|have|has|been|will|would|could|should|who|what|when|where|why|how|which|that|this|these|those|do|does|did|can|shall|might|may|must|hello|hi|thanks|thank|football|player|team|club|match|game|goal|season|league|cup|europe|world|best|never|always|please|sorry|welcome)\b/i.test(lower)) return 'en'
    return 'es'
  }
  const pickVoice = (voices, gender) => {
    const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const male = /pablo|raul|jorge|david|masculin|mark|daniel|james|john|paul|mike|tom|alex|oliver|harry|george|sam|diego|antonio|miguel|angel|jose|francisco|carlos|alejandro|fernando|sergio|javier|manuel|juan|vicente|enrique|ramon|pedro|luis|alfred|hector|omar|ricardo|eduardo|felipe|andres|mario|jesus/i
    const female = /helena|zira|laura|elena|sabina|dalia|femenin|mujer|samantha|karen|susan|julia|emma|olivia|ava|sophia|mia|charlotte|victoria|monica|paulina|carmen|ana|maria|isabel|dolores|teresa|rosa|cristina|patricia|silvia|beatriz|andrea|claudia|paula|marta|irene|alba|lucia|noelia|valentina|camila|gabriela|daniela|carolina|maite|siri|kyoko|yuna|moira|tessa|alicia|maren|nora|selma|katja|heidi|sarah|fiona|emily|chloe|grace|zoe|ruby|olive|paisley|reagan|jamie|quinn|jordan|avery|charlie/i
    const name = (v) => normalize(v.name)
    const matchGender = (v) => gender === 'male' ? male.test(name(v)) : female.test(name(v))
    const notOpposite = (v) => gender === 'male' ? !female.test(name(v)) : !male.test(name(v))
    if (gender === 'male') {
      return voices.find(v => male.test(name(v)))
        || voices.find(v => !female.test(name(v)))
        || voices[0]
    }
    return voices.find(v => female.test(name(v)))
      || voices.find(v => !male.test(name(v)))
      || voices[0]
  }
  const speak = (text, gender, retry = 0) => {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    const g = gender || agentGender
    const allVoices = window.speechSynthesis.getVoices()
    if (allVoices.length === 0 && retry < 5) {
      return setTimeout(() => speak(text, gender, retry + 1), 300)
    }
    if (selectedVoiceURI) {
      const saved = allVoices.find(v => v.voiceURI === selectedVoiceURI)
      if (saved && matchGender(saved)) { u.voice = saved; u.lang = saved.lang; u.rate = g === 'male' ? 1.0 : 1.1; window.speechSynthesis.speak(u); return }
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
      alert(t('chat.chrome_voice'))
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
    if (data?.length) {
      setMessages(data.map(m => ({ role: m.role === 'user' ? 'user' : 'agent', text: m.message })))
      setMessageCount(Math.floor(data.filter(m => m.role === 'agent').length / 2))
    }
  }

  useEffect(() => {
    loadChatHistory()
    loadSummaries()
  }, [user?.id])

  const loadSummaries = async () => {
    if (!user?.id) return
    const { data } = await supabase.from('conversation_summaries')
      .select('summary_text')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
    if (data?.length) setSummaryCache(data.map(s => s.summary_text))
  }

  const generateSummary = async (recentMessages) => {
    const key = OPENROUTER_API_KEY || OPENAI_API_KEY
    if (!key) return
    const text = recentMessages.map(m => `${m.role === 'user' ? 'Usuario' : 'Chiño'}: ${m.text}`).join('\n').slice(-3000)
    try {
      const res = await fetch(USE_OPENROUTER ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`,
          ...(USE_OPENROUTER ? { 'HTTP-Referer': 'https://chinoaiagent.vercel.app', 'X-Title': 'Chiño AI' } : {}) },
        body: JSON.stringify({
          model: USE_OPENROUTER ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'Resume esta conversación sobre el Celta de Vigo en 2-3 frases en español. Sé conciso.' },
            { role: 'user', content: text }]
        })
      })
      const data = await res.json()
      return data.choices?.[0]?.message?.content || null
    } catch { return null }
  }

  const storeSummary = async (summaryText) => {
    if (!user?.id || !summaryText) return
    await supabase.from('conversation_summaries').insert({
      user_id: user.id,
      summary_text: summaryText,
      message_count: messageCount
    }).catch(() => {})
    setSummaryCache(prev => [summaryText, ...prev].slice(0, 3))
  }

  const handleShare = async (msgIdx) => {
    const text = messages[msgIdx]?.text
    if (!text) return
    const shareText = `🤖 Chiño AI · RC Celta\n\n${text}\n\nhttps://chinoaiagent.vercel.app`

    if (navigator.share) {
      try { await navigator.share({ title: 'Chiño AI', text: shareText }) } catch {}
      return
    }
    setShareOpen(shareOpen === msgIdx ? null : msgIdx)
  }

  const shareAction = (type, text) => {
    const shareText = `🤖 Chiño AI · RC Celta\n\n${text}\n\nhttps://chinoaiagent.vercel.app`
    const url = encodeURIComponent('https://chinoaiagent.vercel.app')
    const msg = encodeURIComponent(shareText)
    if (type === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank', 'noopener')
    else if (type === 'whatsapp') window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener')
    else if (type === 'copy') {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedIdx(shareOpen)
        setTimeout(() => setCopiedIdx(null), 2000)
      })
    }
    setShareOpen(null)
  }

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

        // Fetch entity-aware facts
        const relevantFacts = await fetchRelevantFacts(userText)
        const factsStr = relevantFacts.length > 0 ? relevantFacts.join('\n') : await fetchRelevantFacts('') // fallback to any facts
        // Always include core anti-hallucination facts
        const CORE_TRUTHS = [
          'O Celta NUNCA gañou a Copa do Rei. Subcampión en 1948, 1994 e 2001.',
          'O Celta NUNCA gañou LaLiga. Mellor posto: 4º.',
          'O Celta NUNCA gañou a Champions nin a UEFA/Europa League.',
          'Aleksandr Mostovoi chegou ao Celta en 1996, NON xogou a final de Copa de 1994.',
          'Iago Aspas debutou en 2008, NON xogou co EuroCelta.',
          'O estadio de Balaídos inaugurouse en 1928. NON o construíu ningún presidente do Celta.',
          'Marián Mouriño é presidenta desde decembro de 2023, NON desde 2025.',
          'Carlos Mouriño foi presidente de 2006 a 2023, NON ata 2025.',
        ]
        const finalFactsStr = factsStr ? CORE_TRUTHS.join('\n') + '\n---\n' + factsStr : CORE_TRUTHS.join('\n')

        // Fetch recent corrections for auto-learning
        let correctionsStr = ''
        try {
          const { data: recentCorrections } = await supabase
            .from('corrections')
            .select('original_message, correction_text')
            .order('created_at', { ascending: false })
            .limit(30)
          if (recentCorrections?.length > 0) {
            correctionsStr = recentCorrections.map(c =>
              `- Usuario corrixiu: "${c.original_message.substring(0, 100)}" → "${c.correction_text.substring(0, 100)}"`
            ).join('\n')
          }
        } catch {}

        const memoryStr = summaryCache.length > 0
          ? `Resumen de conversaciones anteriores (recuérdalas):\n${summaryCache.join('\n---\n')}`
          : ''

        const apiMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `Hechos verificados:\n${finalFactsStr}` },
          ...(correctionsStr ? [{ role: 'system', content: `Correcciones recientes de usuarios (aprende de ellas):\n${correctionsStr}` }] : []),
          ...(memoryStr ? [{ role: 'system', content: memoryStr }] : []),
          { role: 'system', content: `🚨 IDIOMA: ${detectLang(userText) === 'gl' ? 'O usuario escribiu en GALEGO. RESPONDE SÓ EN GALEGO. 0 palabras en español ou inglés. REVISA a túa resposta e elimina calquera palabra noutro idioma.' : detectLang(userText) === 'en' ? 'The user wrote in ENGLISH. Respond ONLY in English. 0 words in Spanish or Galician. CHECK your response and remove any non-English words.' : 'El usuario escribió en ESPAÑOL. RESPONDE SÓ EN ESPAÑOL. 0 palabras en gallego o inglés. REVISA tu respuesta y elimina cualquier palabra en otro idioma.'}` },
          { role: 'user', content: userText }
        ]

        const res = await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model: USE_OPENROUTER ? 'openai/gpt-4o-mini' : 'gpt-4o-mini', messages: apiMessages })
        })
        const data = await res.json()
        const raw = data.choices?.[0]?.message?.content || t('chat.fallback')
        const showPitch = raw.includes('[PITCHXI]')
        const hasOferta = raw.match(/\[OFERTA:\s*([^\]]+)\]\(([^)]+)\)/g)
        const hasEnlace = raw.match(/\[ENLACE:\s*([^\]]+)\]\(([^)]+)\)/g)
        const actions = []
        if (hasOferta) hasOferta.forEach(m => { const [_,t,u] = m.match(/\[OFERTA:\s*([^\]]+)\]\(([^)]+)\)/); actions.push({ type: 'oferta', label: t, url: u }) })
        if (hasEnlace) hasEnlace.forEach(m => { const [_,t,u] = m.match(/\[ENLACE:\s*([^\]]+)\]\(([^)]+)\)/); actions.push({ type: 'enlace', label: t, url: u }) })
        const aiText = raw.replace(/\[OFERTA:[^\]]+\]\([^)]+\)/g, '').replace(/\[ENLACE:[^\]]+\]\([^)]+\)/g, '').replace('[PITCHXI]', '').trim()
        setMessages(prev => [...prev, { role: 'agent', text: aiText, showPitch, actions: actions.length ? actions : undefined }])
        saveMessage('agent', aiText)
        speak(aiText, agentGender)
        awardXp(supabase, user?.id, 'chat_message').then(r => {
          if (r) {
            setXpToast({ gain: r.gain, streak: r.streakBonus })
            setTimeout(() => setXpToast(null), 2500)
          }
        }).catch(() => {})

        const newCount = messageCount + 1
        setMessageCount(newCount)
        if (newCount % 10 === 0 && user?.id) {
          const recentConversation = (messages.length > 10 ? messages.slice(-10) : messages)
            .concat([{ role: 'user', text: userText }, { role: 'agent', text: aiText }])
          generateSummary(recentConversation).then(s => { if (s) storeSummary(s) })
        }
      } else {
        setMessages(prev => [...prev, { role: 'agent', text: t('chat.no_key') }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: t('chat.error') }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterApp = () => {
    setShowLanding(false)
    sessionStorage.setItem('chino_landing', 'true')
  }

  const handleGoLanding = () => {
    sessionStorage.removeItem('chino_landing')
    setShowLanding(true)
  }

  return (
    <ErrorBoundary>
    <AnimatePresence mode="wait">
      {showLanding ? (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <LandingView legends={legends} agentGender={agentGender} onEnter={handleEnterApp} />
        </motion.div>
        </Suspense>
      ) : (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-90 z-0" />

        <header className="z-10 p-4 bg-slate-800/80 backdrop-blur-md border-b border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full overflow-hidden shadow-lg flex-shrink-0 cursor-pointer ${agentGender === 'male' ? 'shadow-blue-500/50 bg-blue-600' : 'shadow-pink-500/50 bg-pink-600'}`} onClick={handleGoLanding} title={t('app.back_landing')}>
            <img src="/chino-avatar.png" alt={agentGender === 'male' ? t('app.avatar_male') : t('app.avatar_female')} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t('app.title')}</h1>
            <p className={`text-xs ${agentGender === 'male' ? 'text-blue-300' : 'text-pink-300'}`}>{agentGender === 'male' ? t('app.subtitle') : t('app.subtitle_female')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 tab-scroll">
          <button onClick={() => setCurrentTab('chat')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Sparkles size={11} className="inline mr-0.5" />{t('header.chat')}
          </button>
          <button onClick={() => setCurrentTab('gamer')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'gamer' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Trophy size={11} className="inline mr-0.5" />{t('header.gamer')}
          </button>
          <button onClick={() => setCurrentTab('rankings')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'rankings' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Medal size={11} className="inline mr-0.5" />{t('header.ranking')}
          </button>
          <button onClick={() => setCurrentTab('matches')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'matches' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Calendar size={11} className="inline mr-0.5" />{t('header.matches')}
          </button>
          <button onClick={() => setCurrentTab('academy')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'academy' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Star size={11} className="inline mr-0.5" />Academia
          </button>
          <button onClick={() => setCurrentTab('sections')}
            className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'sections' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Sparkles size={11} className="inline mr-0.5" />{t('header.seccions')}
          </button>
          {adminMode && (
            <button onClick={() => setCurrentTab('biz')}
              className={`text-[11px] px-2.5 py-1.5 rounded-full transition-colors ${currentTab === 'biz' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              <BarChart3 size={11} className="inline mr-0.5" />{t('header.biz')}
            </button>
          )}
          <div className="w-px h-6 bg-slate-600 mx-1" />
          <button onClick={toggleAdmin}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400">
            <Settings size={13} />
          </button>

          <button onClick={() => setAgentGender(g => {
              const newG = g === 'male' ? 'female' : 'male'
              setMessages([{ role: 'agent', text: newG === 'male' ? t('chat.switch_male') : t('chat.switch_female') }])
              return newG
            })}
            className={`text-xs px-1.5 py-1.5 rounded-full transition-colors font-bold ${agentGender === 'male' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>
            {agentGender === 'male' ? '👨' : '👩'}
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1" />
          <div className="relative">
            <button onClick={() => setShowVoicePicker(!showVoicePicker)}
              className={`p-1.5 rounded-full transition-colors ${selectedVoiceURI ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}>
              <Volume2 size={13} />
            </button>
            {showVoicePicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold">{t('voice.manual')}</p>
                </div>
                <button onClick={() => { setSelectedVoiceURI(''); setShowVoicePicker(false); localStorage.removeItem('chino_voice') }}
                  className={`w-full text-left text-xs px-3 py-2 hover:bg-slate-700 transition-colors ${!selectedVoiceURI ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'}`}>
                  {t('voice.auto_detect')}
                </button>
                {voices.filter(v => v.lang.startsWith('es') || v.lang.startsWith('gl') || v.lang.startsWith('en')).map(v => (
                  <button key={v.voiceURI} onClick={() => { setSelectedVoiceURI(v.voiceURI); setShowVoicePicker(false); localStorage.setItem('chino_voice', v.voiceURI) }}
                    className={`w-full text-left text-xs px-3 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2 ${selectedVoiceURI === v.voiceURI ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'}`}>
                    <span>{v.lang.startsWith('es') ? '🇪🇸' : v.lang.startsWith('gl') ? '🇪🇸' : '🇬🇧'}</span>
                    <span className="flex-1 truncate">{v.name}</span>
                    <span className="text-[9px] text-slate-500">{v.lang}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <PushNotif supabase={supabase} user={user} />
          {user && <XpBar supabase={supabase} user={user} compact onLevelUp={(lvl, title) => {
            setLevelUpMsg({ level: lvl, title: title || t(`academy.levels.${lvl}`, `Level ${lvl}`) })
            setTimeout(() => setLevelUpMsg(null), 5000)
          }} onAcademy={() => setCurrentTab('academy')} />}
          <div className="relative">
            <button onClick={() => setShowLangDropdown(d => !d)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xs">
              {i18n.language?.startsWith('gl') ? <GaliciaFlag className="w-[18px] h-[12px] inline-block align-middle" /> : i18n.language?.startsWith('en') ? <UKFlag className="w-[18px] h-[12px] inline-block align-middle" /> : <SpainFlag className="w-[18px] h-[12px] inline-block align-middle" />}
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden min-w-[130px]">
                {[
                  { code: 'gl', label: 'Galego', flag: <GaliciaFlag className="w-[18px] h-[14px] inline-block align-middle" /> },
                  { code: 'es', label: 'Español', flag: <SpainFlag className="w-[18px] h-[12px] inline-block align-middle" /> },
                  { code: 'en', label: 'English', flag: <UKFlag className="w-[18px] h-[12px] inline-block align-middle" /> },
                ].map(l => {
                  const active = i18n.language?.startsWith(l.code)
                  return (
                    <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setShowLangDropdown(false) }}
                      className={`w-full text-left text-xs px-3 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors ${active ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'}`}>
                      <span className="flex items-center">{l.flag}</span>
                      <span className="flex-1">{l.label}</span>
                      {active && <span className="text-blue-400">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {user ? (
            <button onClick={() => setCurrentTab('profile')} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${currentTab === 'profile' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-[10px] text-slate-300 max-w-[60px] truncate">{user.email?.split('@')[0]}</span>
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 rounded-full px-2.5 py-1.5 transition-colors">
              <LogIn size={11} className="text-white" />
              <span className="text-[10px] font-bold text-white">{t('header.entrar')}</span>
            </button>
          )}
          <AnimatePresence>
            {levelUpMsg && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute right-0 top-full mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl z-50 whitespace-nowrap border border-yellow-400/30">
                🏆 ¡Nivel {levelUpMsg.level}! — {levelUpMsg.title}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {xpToast && (
              <motion.div initial={{ opacity: 0, x: 20, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-green-400/30">
                +{xpToast.gain} XP{xpToast.streak > 0 ? ` (🔥 +${xpToast.streak})` : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {currentTab === 'profile' ? (
        <ProfileView supabase={supabase} user={user} agentGender={agentGender} setAgentGender={setAgentGender} speak={speak} theme={theme} setTheme={setTheme} onClose={(goto) => setCurrentTab(goto || 'chat')} />
      ) : currentTab === 'rankings' ? (
        <RankingsView key={`rankings-${rankingTab}`} supabase={supabase} user={user} initialTab={rankingTab} onClose={() => { setRankingTab('players'); setCurrentTab('chat') }} />
      ) : currentTab === 'matches' ? (
        <MatchesView supabase={supabase} onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'sections' ? (
        <SectionsView onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'biz' ? (
        <BusinessView supabase={supabase} onClose={() => setCurrentTab('chat')} />
      ) : currentTab === 'academy' ? (
        <AcademyView supabase={supabase} user={user} onClose={() => setCurrentTab('chat')} onNavigate={(t) => { setRankingTab(t === 'rewards' ? 'rewards' : 'players'); setCurrentTab('rankings') }} />
      ) : currentTab === 'gamer' ? (
        <ChinoGamer supabase={supabase} user={user} speak={speak} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto p-4 z-10 space-y-4 pb-40">
            <AnimatePresence>
              {messages.map((msg, idx) => {
                const prev = messages[idx - 1]
                const sameSender = prev && prev.role === msg.role
                const showAvatar = msg.role === 'agent' && !sameSender
                const now = new Date()
                const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
                const reacted = reactions[idx]
                return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-600 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30">
                      <img src="/chino-avatar.png" alt={t('app.avatar_male')} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!showAvatar && msg.role === 'agent' && <div className="w-8 flex-shrink-0" />}
                  <div className={`max-w-[80%] ${sameSender ? 'mt-1' : ''}`}>
                    <div className={`p-3 ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm shadow-lg shadow-blue-600/20'
                      : 'bg-slate-800/90 border border-blue-500/20 text-gray-100 rounded-2xl rounded-bl-sm shadow-lg shadow-black/20'}`}>
                      {!sameSender && msg.role === 'user' && (
                        <p className="text-[10px] text-blue-200/70 mb-1 font-medium">{user?.email?.split('@')[0] || t('app.avatar_female')}</p>
                      )}
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.role === 'agent' && msg.showPitch && <PitchXI />}
                      {msg.role === 'agent' && msg.actions?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.actions.map((a, i) => (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${a.type === 'oferta' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow'}`}>
                              {a.type === 'oferta' ? '🎁' : '🔗'} {a.label}
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.role === 'agent' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                          <button onClick={() => speak(msg.text, agentGender)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs transition-colors">
                            <Volume2 size={12} /> {t('header.escutar')}
                          </button>
                          {user && (
                            <button onClick={() => setCorrectionFor(correctionFor === idx ? null : idx)}
                              className="text-slate-500 hover:text-yellow-400 flex items-center gap-1 text-xs transition-colors">
                              <AlertTriangle size={10} /> {t('header.corrixir')}
                            </button>
                          )}
                          <div className="relative">
                            <button onClick={() => handleShare(idx)}
                              className="text-slate-500 hover:text-green-400 flex items-center gap-1 text-xs transition-colors">
                              <Share2 size={10} /> {t('header.share')}
                            </button>
                            {shareOpen === idx && (
                              <div className="absolute bottom-full left-0 mb-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
                                <button onClick={() => shareAction('twitter', msg.text)}
                                  className="w-full text-left text-xs px-3 py-2 flex items-center gap-2 hover:bg-slate-700 text-slate-300">
                                  <Twitter size={12} className="text-blue-400" /> {t('header.share_twitter')}
                                </button>
                                <button onClick={() => shareAction('whatsapp', msg.text)}
                                  className="w-full text-left text-xs px-3 py-2 flex items-center gap-2 hover:bg-slate-700 text-slate-300">
                                  <MessageCircle size={12} className="text-green-400" /> {t('header.share_whatsapp')}
                                </button>
                                <button onClick={() => shareAction('copy', msg.text)}
                                  className="w-full text-left text-xs px-3 py-2 flex items-center gap-2 hover:bg-slate-700 text-slate-300">
                                  {copiedIdx === idx ? <Check size={12} className="text-green-400" /> : <Share2 size={12} />} {copiedIdx === idx ? t('header.share_copied') : t('header.share_copy')}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="relative ml-auto">
                            <button onClick={() => setReactionOpen(reactionOpen === idx ? null : idx)}
                              className="text-slate-500 hover:text-yellow-400 flex items-center gap-1 text-xs transition-colors">
                              <span className="text-sm">{reacted || '🙂'}</span>
                            </button>
                            {reactionOpen === idx && (
                              <div className="absolute bottom-full right-0 mb-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 px-2 py-1.5 flex gap-1">
                                {['👍', '❤️', '😂', '😮', '🔥', '😢'].map(emoji => (
                                  <button key={emoji} onClick={() => {
                                    setReactions(prev => ({ ...prev, [idx]: prev[idx] === emoji ? null : emoji }))
                                    setReactionOpen(null)
                                  }}
                                    className={`text-lg hover:scale-125 transition-transform ${reacted === emoji ? 'scale-110 ring-1 ring-blue-400 rounded' : ''}`}>
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {correctionFor === idx && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <textarea value={correctionText} onChange={e => setCorrectionText(e.target.value)}
                            placeholder={t('chat.correction_placeholder')}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-500 mb-1" rows={2} />
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => { setCorrectionFor(null); setCorrectionText('') }}
                              className="text-[10px] text-slate-500 px-2 py-1 rounded hover:bg-slate-700">{t('chat.cancel')}</button>
                            <button onClick={() => handleCorrection(idx)}
                              className="text-[10px] bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-500 disabled:opacity-50 font-bold"
                              disabled={!correctionText.trim()}>{t('chat.send')}</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] text-slate-600 mt-0.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{time}</p>
                  </div>
                </motion.div>
              )})}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-600 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30">
                  <img src="/chino-avatar.png" alt={t('app.avatar_male')} className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-800/90 border border-blue-500/20 rounded-2xl rounded-bl-sm shadow-lg shadow-black/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{t('chat.typing')}</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {currentTab === 'chat' && (
            <div className="z-10 px-4 pb-1 bg-slate-900/90 backdrop-blur-md">
              <LiveResultsBanner supabase={supabase} />
            </div>
          )}
          <footer className="z-10 p-4 bg-slate-900/90 backdrop-blur-md border-t border-blue-500/30 fixed bottom-0 w-full">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <button onClick={startListening}
                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}>
                <Mic size={22} />
              </button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/30">
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2">{t('app.footer')}</p>
          </footer>
        </>
      )}

      <AnimatePresence>
        {showAuth && <Suspense fallback={null}><AuthModal supabase={supabase} onClose={() => setShowAuth(false)} /></Suspense>}
      </AnimatePresence>


      </motion.div>
        </Suspense>
    )}
    </AnimatePresence>
    </ErrorBoundary>
  )
}
