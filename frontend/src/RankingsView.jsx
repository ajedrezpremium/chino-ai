import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Shield, TrendingUp, Award, Users, Eye } from 'lucide-react'

const playerRanking = [
  { pos: 1, name: 'Iago Aspas', role: 'Dianteiro', era: '2008-', stats: '210 goles · 450 partidos · 85 asistencias', score: 9850, badge: '👑 Lenda' },
  { pos: 2, name: 'Alejandro Mostovoi', role: 'Centrocampista', era: '1996-2002', stats: '72 goles · 235 partidos · 45 asistencias', score: 9200, badge: '⭐ O Zar' },
  { pos: 3, name: 'Míchel Salgado', role: 'Defensa', era: '1995-1999', stats: '18 goles · 290 partidos · 22 asistencias', score: 8800, badge: '🛡️ Muro' },
  { pos: 4, name: 'Gustavo López', role: 'Centrocampista', era: '1996-2002', stats: '45 goles · 250 partidos · 60 asistencias', score: 8500, badge: '🎯 Máxico' },
  { pos: 5, name: 'Mazinho', role: 'Centrocampista', era: '1991-1995', stats: '25 goles · 180 partidos · 30 asistencias', score: 8100, badge: '🌍 Campión 94' },
  { pos: 6, name: 'Patxi Salinas', role: 'Dianteiro', era: '1988-1993', stats: '65 goles · 180 partidos · 20 asistencias', score: 7800, badge: '⚽ Goleador' },
  { pos: 7, name: 'Fernando Veloso', role: 'Centrocampista', era: '1970-1978', stats: '38 goles · 240 partidos · 15 asistencias', score: 7600, badge: '🎩 Elegancia' },
  { pos: 8, name: 'Óscar Mingueza', role: 'Defensa', era: '2024-', stats: '3 goles · 36 partidos · 4 asistencias', score: 7200, badge: '📈 18M€' },
  { pos: 9, name: 'Borja Iglesias', role: 'Dianteiro', era: '2025-', stats: '14 goles · 36 partidos · 2 asistencias', score: 7000, badge: '🎯 14 goles' },
  { pos: 10, name: 'Nolito', role: 'Extremo', era: '2015-2017', stats: '35 goles · 100 partidos · 15 asistencias', score: 6900, badge: '💫 Internacional' },
]

const coachRanking = [
  { pos: 1, name: 'Víctor Fernández', era: '1998-2002', logros: '3 semifinais europeas · Era dourada', score: 9500 },
  { pos: 2, name: 'Eduardo Berizzo', era: '2014-2017', logros: 'Semifinais Europa League 2017', score: 8900 },
  { pos: 3, name: 'Claudio Giráldez', era: '2024-', logros: 'Cuartos UEFA · 6º LaLiga 2026', score: 8500 },
  { pos: 4, name: 'Carlos Aimar', era: '1993-1994', logros: 'Final de Copa 1994', score: 8200 },
  { pos: 5, name: 'Luis Enrique', era: '2013-2014', logros: 'Clasificación Champions · Europa League', score: 7900 },
  { pos: 6, name: 'Miguel Muñoz', era: '1968-1969', logros: 'Lenda do banquiño celeste', score: 7500 },
  { pos: 7, name: 'José Ramón Fernández', era: '2002-2004', logros: 'UEFA · Estilo ofensivo', score: 7100 },
  { pos: 8, name: 'Fernando Vázquez', era: '2005-2007', logros: 'Permanencia · Canteira', score: 6800 },
  { pos: 9, name: 'Paco Herrera', era: '2011-2013', logros: 'Ascenso a Primeira', score: 6500 },
  { pos: 10, name: 'Juan Ramón López Caro', era: '2006-2007', logros: 'Clasificación Intertoto', score: 6200 },
]

const badgeColors = ['from-yellow-500 to-amber-600', 'from-slate-400 to-slate-500', 'from-amber-700 to-amber-800']
const badgeLabels = ['🥇', '🥈', '🥉']

export default function RankingsView({ supabase, onClose }) {
  const [tab, setTab] = useState('players')
  const [fans, setFans] = useState([])

  useEffect(() => {
    if (tab === 'fans' && supabase) {
      supabase.from('game_sessions')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setFans(data)
        })
    }
  }, [tab, supabase])

  const TabButton = ({ id, label, icon }) => (
    <button onClick={() => setTab(id)}
      className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${tab === id ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
      {icon} {label}
    </button>
  )

  return (
    <div className="flex-1 overflow-y-auto z-10 pb-4">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-white">🏆 Rankings Celestes</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <Eye size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <TabButton id="players" label="Xogadores" icon={<Trophy size={14} className="inline mr-1" />} />
          <TabButton id="coaches" label="Adestradores" icon={<Award size={14} className="inline mr-1" />} />
          <TabButton id="fans" label="Siareiros" icon={<Users size={14} className="inline mr-1" />} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {tab === 'players' && playerRanking.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-slate-800/80 border rounded-xl p-4 ${i < 3 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? `bg-gradient-to-br ${badgeColors[i]}` : 'bg-slate-700'}`}>
                {i < 3 ? badgeLabels[i] : `#${p.pos}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white truncate">{p.name}</h3>
                  <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded-full">{p.badge || p.era}</span>
                </div>
                <p className="text-xs text-slate-400">{p.role} · {p.era}</p>
                <p className="text-[11px] text-blue-300 mt-0.5">{p.stats}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-400">{p.score}</div>
                <div className="text-[10px] text-slate-500">pts</div>
              </div>
            </div>
          </motion.div>
        ))}

        {tab === 'coaches' && coachRanking.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-slate-800/80 border rounded-xl p-4 ${i < 3 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? `bg-gradient-to-br ${badgeColors[i]}` : 'bg-slate-700'}`}>
                {i < 3 ? badgeLabels[i] : `#${c.pos}`}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">{c.era}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.logros}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-400">{c.score}</div>
                <div className="text-[10px] text-slate-500">pts</div>
              </div>
            </div>
          </motion.div>
        ))}

        {tab === 'fans' && (
          <div className="text-center py-8 text-slate-400">
            <Users size={40} className="mx-auto mb-3 text-blue-400" />
            <p className="font-bold text-white text-lg">Ranking de Siareiros</p>
            <p className="text-sm mt-1">Xoga a O Desafío Celeste para aparecer aquí</p>
            <div className="mt-6 space-y-3 text-left">
              {fans.length > 0 ? fans.map((f, i) => (
                <div key={f.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center font-black text-blue-400">
                    {i < 3 ? badgeLabels[i] : `#${i + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Usuario #{f.user_id?.slice(0, 8) || 'Anónimo'}</p>
                    <p className="text-xs text-slate-400">{f.questions_answered || 0} preguntas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-yellow-400">{f.score || 0}</div>
                    <div className="text-[10px] text-slate-500">pts</div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-500 text-sm py-8">
                  Sen partidas aínda. Xoga en Chiño Gamer e sé o primeiro siareiro!
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-600 pt-2 pb-20">
          Actualizado: Maio 2026 · 20 criterios obxectivos · Sistema ponderado
        </p>
      </div>
    </div>
  )
}
