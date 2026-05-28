import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const moments = [
  { title: 'Aleksandr Mostovoi', subtitle: '"O Zar" · 1996–2002', desc: '72 goles · 235 partidos · 3 semifinais europeas', gradient: 'from-blue-950 via-blue-800 to-amber-900' },
  { title: 'Iago Aspas', subtitle: 'Capitán · 2008–', desc: '210 goles · 450 partidos · Lenda viva', gradient: 'from-sky-950 via-blue-900 to-slate-900' },
  { title: 'O Soño Europeo', subtitle: 'UEFA 2000–01', desc: 'Mostovoi · Karpin · Makelele · Salgado · Contra a Juventus', gradient: 'from-blue-950 via-indigo-900 to-slate-900' },
]

export default function LandingView({ legends, onEnter }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % moments.length), 5000)
    return () => clearInterval(t)
  }, [])

  const m = moments[idx]

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${m.gradient}`} />
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-5 left-1/4 w-72 h-72 border border-white/30 rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 p-6">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }}
            className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-600/40 border-2 border-blue-400/30 overflow-hidden shadow-xl shadow-blue-500/30">
              <img src="/chino-avatar.png" alt="Chiño" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{m.title}</h2>
            <p className="text-lg text-blue-200 font-semibold mt-2 drop-shadow">{m.subtitle}</p>
            <p className="text-sm text-white/60 mt-2">{m.desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-8">
          {moments.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`} />
          ))}
        </div>
      </div>

      {legends.length > 0 && (
        <div className="z-10 px-4 pb-6">
          <p className="text-[10px] text-blue-300/60 text-center mb-3 uppercase tracking-widest">Lendas do Celta</p>
          <div className="grid grid-cols-5 gap-2">
            {legends.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-slate-800/40 backdrop-blur-sm border border-blue-500/10 rounded-xl p-2 text-center hover:bg-slate-800/60 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-1.5 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                  {l.name.charAt(0)}
                </div>
                <p className="text-[10px] font-semibold text-white truncate leading-tight">{l.name}</p>
                <p className="text-[7px] text-blue-300/70 truncate">{l.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <motion.button onClick={onEnter} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 right-6 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/40 hover:shadow-blue-400/60 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group">
        <img src="/chino-avatar.png" alt="Chiño" className="w-11 h-11 rounded-full group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
          <MessageCircle size={10} className="text-white" />
        </span>
        <span className="absolute -bottom-8 text-[10px] text-white/50 font-medium whitespace-nowrap">Falar con Chiño</span>
      </motion.button>
    </div>
  )
}
