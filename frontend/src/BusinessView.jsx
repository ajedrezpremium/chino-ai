import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Euro, BarChart3, Eye, Activity, X, Settings } from 'lucide-react'

const kpi = [
  { label: 'Abonados', value: '22.000', unit: '', change: '+12%', icon: Users, color: 'blue' },
  { label: 'Engagement Diario', value: '68', unit: '%', change: '+23%', icon: Activity, color: 'emerald' },
  { label: 'Valor Plataforma', value: '2.5M', unit: '€', change: 'estimado', icon: Euro, color: 'yellow' },
  { label: 'Retención', value: '91', unit: '%', change: '+8%', icon: TrendingUp, color: 'purple' },
]

const channels = [
  { name: 'Chat IA', users: 85, color: 'bg-blue-500' },
  { name: 'Chiño Gamer', users: 62, color: 'bg-emerald-500' },
  { name: 'Rankings', users: 47, color: 'bg-yellow-500' },
  { name: 'Business', users: 33, color: 'bg-purple-500' },
]

const revenue = [
  { tier: 'MVP', ingreso: 0, color: 'bg-blue-500/40' },
  { tier: 'PRO', ingreso: 65, color: 'bg-blue-500' },
  { tier: 'Enterprise', ingreso: 100, color: 'bg-blue-600' },
]

const roadmap = [
  { phase: 'FASE 1 · MVP', done: true, items: ['Chat IA histórico', 'Chiño Gamer', '3 idiomas', 'Rankings'], time: '24h', cost: '0€' },
  { phase: 'FASE 2 · PRO', done: false, items: ['+500 preguntas', 'Premios reais', 'Auth abonados', 'Analytics'], time: 'Semana 2', cost: 'X€/mes' },
  { phase: 'FASE 3 · Enterprise', done: false, items: ['App Oficial', 'Venta entradas', 'CRM completo', 'API partners'], time: 'Mes 2', cost: 'Y€/mes' },
]

export default function BusinessView({ onClose }) {
  const [showDetails, setShowDetails] = useState(false)

  const Bar = ({ label, value, color, delay }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ delay, duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color} flex items-center justify-end pr-2`}>
          <span className="text-[10px] text-white font-bold">{value}%</span>
        </motion.div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto z-10 pb-28">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">📊 Business Case</h2>
          <p className="text-xs text-blue-300">Propuesta de valor · Director General RC Celta</p>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
          <Eye size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpi.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <k.icon size={18} className={`text-${k.color}-400`} />
                <span className={`text-[10px] font-bold ${k.change.startsWith('+') ? 'text-emerald-400' : 'text-blue-400'}`}>{k.change}</span>
              </div>
              <div className="text-2xl font-black text-white">{k.value}<span className="text-sm text-slate-400">{k.unit}</span></div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Engagement Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-400" /> Engagement por funcionalidade</h3>
          <div className="space-y-3">
            {channels.map((c, i) => <Bar key={c.name} label={c.name} value={c.users} color={c.color} delay={0.4 + i * 0.15} />)}
          </div>
        </motion.div>

        {/* Revenue Projection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Euro size={16} className="text-yellow-400" /> Proxección de Ingresos</h3>
          <div className="flex items-end gap-4 h-32">
            {revenue.map((r, i) => (
              <div key={r.tier} className="flex-1 flex flex-col items-center gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: `${r.ingreso}%` }} transition={{ delay: 0.6 + i * 0.2, duration: 1 }}
                  className={`w-full ${r.color} rounded-t-lg`} style={{ maxHeight: r.ingreso === 0 ? 8 : undefined, minHeight: r.ingreso === 0 ? 8 : undefined }} />
                <span className="text-[10px] text-slate-400 font-bold">{r.tier}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>Gratuito (demostración)</span>
            <span>Suscripción abonados</span>
            <span>Licencias club + partners</span>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3 className="font-bold text-white mb-3">🗺️ Roadmap</h3>
          <div className="space-y-3">
            {roadmap.map((p, i) => (
              <div key={p.phase} className={`rounded-xl border p-4 ${p.done ? 'bg-blue-900/20 border-blue-500/40' : 'bg-slate-800/60 border-slate-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{p.phase}</h4>
                  <span className="text-[10px] text-blue-300">{p.time} · {p.cost}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.items.map(item => (
                    <span key={item} className={`text-[10px] px-2 py-1 rounded-full ${p.done ? 'bg-blue-800/50 text-blue-200' : 'bg-slate-700 text-slate-300'}`}>
                      {p.done ? '✅' : '📌'} {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cierre */}
        <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-200 font-semibold mb-1">"O primeiro axente de IA na historia do fútbol"</p>
          <p className="text-xs text-slate-400">Chiño AI © 2026 · Listo para debutar · https://chinoaiagent.vercel.app</p>
        </div>
      </div>
    </div>
  )
}
