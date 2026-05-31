import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GaliciaFlag } from './i18n/LanguageSwitcher'
import { MessageCircle } from 'lucide-react'

const moments = [
  { img: '/Mostovoi Celta.jpg' },
  { img: '/Iago Aspas · MITO VIVIENTE.jpg' },
  { img: '/11deMemoria Celta.jpg' },
  { img: '/Celta de Vigo · ASCENSO A 1ª.jpg' },
  { img: '/2025 El regreso a Europa.webp' },
]

const PARTICLES = 20
const MOMENT_KEYS = ['m0', 'm1', 'm2', 'm3', 'm4']

const LANG_BTNS = [
  { code: 'gl', flag: <GaliciaFlag className="w-[18px] h-[14px] inline-block align-middle" /> },
  { code: 'es', flag: <span className="text-sm leading-none">🇪🇸</span> },
  { code: 'en', flag: <span className="text-sm leading-none">🇬🇧</span> },
]

export default function LandingView({ agentGender, onEnter }) {
  const { t, i18n } = useTranslation()
  const [idx, setIdx] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % moments.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      setMouse({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 })
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  const currentLang = i18n.language?.startsWith('gl') ? 'gl' : i18n.language?.startsWith('en') ? 'en' : 'es'
  const m = moments[idx]

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Array.from({ length: PARTICLES }).map((_, i) => (
          <motion.div key={i}
            className="absolute text-blue-400/20 text-xs select-none"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360],
            }}
            transition={{ duration: 6 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5, ease: 'easeInOut' }}>
            ✦
          </motion.div>
        ))}
      </div>

      {/* Language selector */}
      <div className="absolute top-4 right-4 z-30 flex gap-1">
        {LANG_BTNS.map(l => {
          const active = currentLang === l.code
          return (
            <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
              className={`flex items-center px-1.5 py-1 rounded text-[11px] font-bold transition-all duration-150 ${
                active
                  ? 'bg-white/20 text-white ring-1 ring-white/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}>
              {l.flag}
            </button>
          )
        })}
      </div>

      {/* Background with parallax */}
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{ transform: `translate(${mouse.x * -15}px, ${mouse.y * -15}px)` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40 z-10" />
          <img src={m.img} alt={t(`landing.${MOMENT_KEYS[idx]}_title`)} className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 p-6">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }}
            className="text-center max-w-lg">
            <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="text-[10px] uppercase tracking-[0.3em] text-blue-300/70 mb-2 font-semibold">
              {t('landing.tagline')}
            </motion.p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">{t(`landing.${MOMENT_KEYS[idx]}_title`)}</h2>
            <p className="text-lg text-blue-200 font-semibold mt-2 drop-shadow-lg">{t(`landing.${MOMENT_KEYS[idx]}_sub`)}</p>
            <p className="text-sm text-white/70 mt-2 drop-shadow">{t(`landing.${MOMENT_KEYS[idx]}_desc`)}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-8">
          {moments.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>

      <motion.button onClick={onEnter} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        className={`fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full shadow-xl shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group ${agentGender === 'male' ? 'bg-gradient-to-br from-blue-500 to-blue-700 hover:shadow-blue-400/60' : 'bg-gradient-to-br from-pink-500 to-pink-700 hover:shadow-pink-400/60'}`}
        title={t('app.title')}>
        <img src="/chino-avatar.png" alt={agentGender === 'male' ? t('app.avatar_male') : t('app.avatar_female')} className="w-11 h-11 rounded-full group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
          <MessageCircle size={10} className="text-white" />
        </span>
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
          {t('app.title')}
        </span>
        <span className="absolute -bottom-7 text-[10px] text-white/70 font-medium whitespace-nowrap drop-shadow">{t('landing.cta')}</span>
      </motion.button>
    </div>
  )
}
