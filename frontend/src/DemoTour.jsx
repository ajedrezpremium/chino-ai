import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const steps = [
  {
    id: 'intro',
    title: '🎬 GRABANDO...',
    text: 'Di frente a cámara: "Hola, soy Roberto Paramos. El Celta no es solo un club, es una familia. Y cada familia necesita un miembro que lo sepa todo."',
    lang: 'Español',
    action: null,
  },
  {
    id: 'chat1',
    title: '💬 CHAT · GALEGO',
    text: 'Pulsa el micrófono y di: "Chiño, quen é o máximo goleador da historia?"',
    subtitle: 'O pulsa Send y escribe la pregunta',
    lang: 'Gallego',
    action: 'chat',
  },
  {
    id: 'chat2',
    title: '💬 CHAT · ENGLISH',
    text: 'Di: "Chiño, when was the club founded?"',
    subtitle: 'Chiño responde en inglés automáticamente',
    lang: 'English',
    action: 'chat',
  },
  {
    id: 'gamer',
    title: '🎮 CHIÑO GAMER',
    text: 'Voz en off: "Pero no solo informamos... ¡enganchamos!"',
    subtitle: 'Pulsa el botón GAMER, luego XOGAR AGORA y responde una pregunta',
    lang: 'Español',
    action: 'gamer',
  },
  {
    id: 'business',
    title: '📊 BUSINESS CASE',
    text: 'Di: "Esto es una plataforma de negocio. 22.000 abonados. Datos en tiempo real. Gamificación. Ventas cruzadas."',
    subtitle: 'Muestra el dashboard al Director General',
    lang: 'Español',
    action: 'business',
  },
  {
    id: 'cierre',
    title: '🏁 CIERRE',
    text: 'Di: "Chiño AI está listo para debutar. O primeiro axente de intelixencia artificial na historia do fútbol. Feito en Vigo. Para o mundo celeste. Solo necesitamos o teu SI para saltar ao campo."',
    lang: 'Gallego',
    action: null,
  },
]

export default function DemoTour({ onNavigate, onClose }) {
  const [step, setStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && steps[step]?.action) {
      onNavigate(steps[step].action)
    }
  }, [step, isOpen])

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      setIsOpen(false)
      setStep(0)
      if (onClose) onClose()
    }
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full shadow-lg shadow-red-600/50 font-bold text-sm animate-pulse flex items-center gap-2">
        <span>🔴</span> GRABAR VIDEO
      </button>
    )
  }

  const s = steps[step]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 border-2 border-blue-500 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-slate-400">Paso {step + 1}/{steps.length}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.lang === 'Gallego' ? 'bg-blue-900 text-blue-300' : s.lang === 'English' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {s.lang}
          </span>
        </div>

        <h3 className="text-lg font-black text-white mb-3">{s.title}</h3>
        
        <div className="bg-slate-900 rounded-xl p-4 mb-4 border border-slate-700">
          <p className="text-white text-sm leading-relaxed">{s.text}</p>
          {s.subtitle && <p className="text-blue-300 text-xs mt-2">💡 {s.subtitle}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsOpen(false)}
            className="flex-1 p-2 bg-slate-700 rounded-lg text-xs text-slate-300">❌ Cerrar</button>
          {step > 0 && <button onClick={prev}
            className="flex-1 p-2 bg-slate-700 rounded-lg text-xs text-white">← Anterior</button>}
          <button onClick={next}
            className="flex-1 p-2 bg-blue-600 rounded-lg text-xs text-white font-bold">
            {step < steps.length - 1 ? `Siguiente →` : '✅ Listo!'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
