import React from 'react'
import { motion } from 'framer-motion'

const metrics = [
  { label: 'Abonados', value: '22.000+', desc: 'Potencial de conexión directa', color: 'blue' },
  { label: 'Historia', value: '103 años', desc: 'Desde 1923', color: 'yellow' },
  { label: 'Preguntas BD', value: '20+', desc: 'Trivial expandible a 500+', color: 'green' },
  { label: 'Leyendas', value: '10+', desc: 'Jugadores históricos catalogados', color: 'purple' },
]

const features = [
  { icon: '🎮', title: 'Chiño Gamer', desc: 'Trivial diario. Rankings. Premios. Fidelización mediante competición sana.' },
  { icon: '📊', title: 'Analítica de Abonados', desc: 'Sabemos qué preguntas interesan, qué jugadores son tendencia, qué horarios conectan.' },
  { icon: '🎟️', title: 'Gestión de Entradas', desc: 'Venta, reventa oficial, recomendación personalizada de partidos.' },
  { icon: '🛍️', title: 'Comercio Inteligente', desc: 'Cross-sell: responde una pregunta histórica → oferta camiseta relacionada.' },
  { icon: '🌐', title: 'Multilingüe', desc: 'Gallego, Español, Inglés. Alcance global para la marca Celta.' },
  { icon: '📱', title: 'Web + Móvil', desc: 'Sin app store. Funciona en cualquier navegador. Coste de desarrollo cero.' },
]

const plans = [
  { tier: 'MVP', cost: '0€', timeline: 'En 24h', items: ['Chat con IA histórica', 'Chiño Gamer (20 preguntas)', 'Web + Móvil responsive', 'Datos semilla cargados'] },
  { tier: 'PRO', cost: 'X€/mes', timeline: 'Semana 2', items: ['+500 preguntas', 'Rankings reales con premios', 'Autenticación abonados', 'Panel de analytics'] },
  { tier: 'ENTERPRISE', cost: 'Y€/mes', timeline: 'Mes 2', items: ['App Oficial integrada', 'Venta de entradas', 'CRM abonados completo', 'API para partners'] },
]

export default function BusinessView() {
  return (
    <div className="flex-1 overflow-y-auto p-6 z-10 space-y-8 pb-28">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-black text-white mb-1">Chiño AI · Business Case</h2>
        <p className="text-blue-300 text-sm">Propuesta de valor para el Director General del RC Celta</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-slate-800/80 border border-${m.color}-500/30 rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-black text-${m.color}-400`}>{m.value}</div>
            <div className="text-sm font-bold text-white mt-1">{m.label}</div>
            <div className="text-xs text-slate-400">{m.desc}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">🚀 Capacidades del Producto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="text-2xl mb-1">{f.icon}</div>
              <h4 className="font-bold text-white text-sm">{f.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">📈 Roadmap de Expansión</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map((p, i) => (
            <motion.div key={p.tier} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className={`rounded-xl p-4 border ${i === 0 ? 'bg-blue-900/40 border-blue-500/50' : 'bg-slate-800/60 border-slate-700'}`}>
              <div className="text-xs text-blue-400 font-bold">{p.timeline}</div>
              <div className="text-lg font-black text-white">{p.tier}</div>
              <div className="text-2xl font-black text-blue-400 my-2">{p.cost}</div>
              <ul className="space-y-1">
                {p.items.map(item => <li key={item} className="text-xs text-slate-300">✅ {item}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 text-center">
        <p className="text-sm text-blue-200 mb-2">"El primer club de fútbol con un agente de IA propio. No es un chatbot. Es un miembro digital de la familia celeste."</p>
        <p className="text-xs text-slate-400">Chiño AI © 2026 — Listo para debutar en el primer equipo</p>
      </div>
    </div>
  )
}
