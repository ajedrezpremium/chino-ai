import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const moments = [
  { img: '/Mostovoi Celta.jpg', title: 'Aleksandr Mostovoi', subtitle: '"O Zar" · 1996–2002', desc: '72 goles · 235 partidos · 3 semifinais europeas' },
  { img: '/Iago Aspas · MITO VIVIENTE.jpg', title: 'Iago Aspas', subtitle: 'Capitán · 2008–', desc: '210 goles · 450 partidos · Lenda viva' },
  { img: '/11deMemoria Celta.jpg', title: 'O Soño Europeo', subtitle: 'UEFA 2000–01', desc: 'Contra a Juventus · Semifinais · Lendas en campo' },
  { img: '/Celta de Vigo · ASCENSO A 1ª.jpg', title: 'O Regreso á Elite', subtitle: 'Ascenso a Primeira División', desc: 'Un club, unha cidade, unha historia de superación' },
  { img: '/2025 El regreso a Europa.webp', title: '2025 · Regreso a Europa', subtitle: 'Celta volve a competición continental', desc: 'Cuartos UEFA · 6º en LaLiga · Ilusión renovada' },
]

export default function LandingView({ legends, agentGender, onEnter }) {
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
          className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40 z-10" />
          <img src={m.img} alt={m.title} className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center z-20 p-6">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6 }}
            className="text-center max-w-lg">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full border-2 overflow-hidden shadow-xl backdrop-blur-sm flex items-center justify-center ${agentGender === 'male' ? 'bg-blue-600/40 border-blue-400/30 shadow-blue-500/30' : 'bg-pink-600/40 border-pink-400/30 shadow-pink-500/30'}`}>
              <img src="/chino-avatar.png" alt={agentGender === 'male' ? 'Chiño' : 'Chiña'} className="w-full h-full object-cover rounded-full" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">{m.title}</h2>
            <p className="text-lg text-blue-200 font-semibold mt-2 drop-shadow-lg">{m.subtitle}</p>
            <p className="text-sm text-white/70 mt-2 drop-shadow">{m.desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-8">
          {moments.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>

      {legends.length > 0 && (
        <div className="z-20 px-4 pb-4">
          <p className="text-[10px] text-blue-200/50 text-center mb-2 uppercase tracking-widest">LENDAS DO CELTA</p>
          <div className="grid grid-cols-5 gap-2">
            {legends.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center hover:bg-slate-800/60 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-600/30">
                  {l.name.charAt(0)}
                </div>
                <p className="text-[10px] font-semibold text-white truncate leading-tight">{l.name}</p>
                <p className="text-[7px] text-blue-200/60 truncate">{l.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <motion.button onClick={onEnter} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        className={`fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full shadow-xl shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group ${agentGender === 'male' ? 'bg-gradient-to-br from-blue-500 to-blue-700 hover:shadow-blue-400/60' : 'bg-gradient-to-br from-pink-500 to-pink-700 hover:shadow-pink-400/60'}`}>
        <img src="/chino-avatar.png" alt={agentGender === 'male' ? 'Chiño' : 'Chiña'} className="w-11 h-11 rounded-full group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
          <MessageCircle size={10} className="text-white" />
        </span>
        <span className="absolute -bottom-7 text-[10px] text-white/70 font-medium whitespace-nowrap drop-shadow">{agentGender === 'male' ? 'Falar con Chiño' : 'Falar con Chiña'}</span>
      </motion.button>
    </div>
  )
}
