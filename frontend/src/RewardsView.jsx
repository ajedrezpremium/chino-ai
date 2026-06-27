import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Gift, Users, Star, ChevronLeft, Medal, Eye, Zap, Target, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { REWARDS, REWARD_WINNERS } from './rewards-data'
import { getLevel, getLevelProgress } from './XpBar'

const typeColors = {
  digital: 'from-blue-500 to-blue-700',
  physical: 'from-emerald-500 to-emerald-700',
  experience: 'from-purple-500 to-purple-700',
  eternal: 'from-yellow-500 to-amber-600',
}

const typeLabels = {
  digital: 'Digital',
  physical: 'Física',
  experience: 'Experiencia',
  eternal: 'Eterna',
}

const LEVEL_TITLES = ['Aficionado','Seguidor','Celtista','Celeste','Internacional','Mostovoi','Zar','Lenda','Inmortal','Celta de #Lenda']

export default function RewardsView({ user, onClose, supabase }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('catalog')
  const [selectedReward, setSelectedReward] = useState(null)
  const [xpData, setXpData] = useState(null)

  useEffect(() => {
    if (!supabase || !user?.id) return
    supabase.from('user_xp').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setXpData(data)
    })
  }, [supabase, user?.id])

  const xp = xpData?.xp || 0
  const level = xpData?.level || 1
  const streak = xpData?.streak || 0
  const { current, needed, pct } = getLevelProgress(xp)

  const pointsFromXp = Math.floor(xp / 10)
  const userPoints = pointsFromXp

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
          <h2 className="text-xl font-black text-white">🎁 Recompensas</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <Eye size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2 tab-scroll">
          <TabButton id="catalog" label="Catálogo" icon={<Gift size={14} className="inline mr-1" />} />
          <TabButton id="winners" label="Gañadores" icon={<Users size={14} className="inline mr-1" />} />
        </div>
        {user && (
          <div className="mt-2 space-y-1">
            <div className="bg-slate-800/60 rounded-lg p-2 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-xs text-slate-400">Os teus puntos:</span>
              <span className="text-sm font-black text-yellow-400">{userPoints.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/40 rounded-lg px-2 py-1.5 flex items-center gap-2">
              <Target size={11} className="text-blue-400" />
              <span className="text-[10px] text-slate-500">Nivel {level}: {LEVEL_TITLES[level - 1]}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[60px]">
                <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full" style={{ width: `${pct * 100}%` }} />
              </div>
              <span className="text-[9px] text-slate-500">{current}/{needed}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {tab === 'catalog' && (
          <>
            <p className="text-[10px] text-slate-500 mb-2">Gana puntos chateando, xogando a Chiño Gamer e acertando pronósticos. Cada 10 XP = 1 punto.</p>
            <div className="space-y-2">
              <AnimatePresence>
                {REWARDS.map((r, i) => {
                  const unlocked = userPoints >= r.points
                  return (
                    <motion.button key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedReward(selectedReward?.id === r.id ? null : r)}
                      className={`w-full text-left bg-slate-800/60 border rounded-xl p-3 transition-all hover:bg-slate-700/60 ${unlocked ? 'border-yellow-500/40' : 'border-slate-700/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeColors[r.type]} flex items-center justify-center text-lg flex-shrink-0`}>
                          {r.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white truncate">{r.name}</h3>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${unlocked ? 'bg-green-900/40 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                              {typeLabels[r.type]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-sm font-black ${unlocked ? 'text-green-400' : 'text-blue-400'}`}>
                            {r.points.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-500">pts</div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedReward?.id === r.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                              <span className={`text-xs ${unlocked ? 'text-green-400' : 'text-slate-500'}`}>
                                {unlocked ? '✅ Desbloqueado' : `🔗 Faltan ${(r.points - userPoints).toLocaleString()} pts`}
                              </span>
                              {user && unlocked && (
                                <button className="text-[10px] bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-3 py-1 rounded-full transition-colors">
                                  Canjear
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mt-4">
              <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Zap size={10} /> Como gañar puntos</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-400"><span>💬 Mensaxe no chat</span><span className="text-green-400">+10 XP (+1 pt)</span></div>
                <div className="flex justify-between text-slate-400"><span>✅ Acerto no Gamer</span><span className="text-green-400">+25 XP (+2 pts)</span></div>
                <div className="flex justify-between text-slate-400"><span>❌ Fallo no Gamer</span><span className="text-green-400">+5 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>🎯 Pronóstico acertado</span><span className="text-green-400">+100 XP (+10 pts)</span></div>
                <div className="flex justify-between text-slate-400"><span>🔥 Bono de racha (diario)</span><span className="text-green-400">+5-35 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>🎲 Bono diario</span><span className="text-green-400">+50 XP (+5 pts)</span></div>
              </div>
            </div>
          </>
        )}

        {tab === 'winners' && (
          <>
            <p className="text-[10px] text-slate-500 mb-2">Usuarios que conseguiron premios reais. O próximo podes ser ti.</p>
            <div className="space-y-2">
              {REWARD_WINNERS.map((w, i) => (
                <motion.div key={w.username} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                    {w.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{w.username}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Medal size={10} className="text-yellow-400" />
                      <span className="truncate">{w.prize}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-black text-blue-400">{w.points.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500">pts</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-[10px] text-slate-600 pt-2 pb-20">
          25 recompensas · desde 500 a 5.000.000 pts · Actualizado: Xuño 2026
        </p>
      </div>
    </div>
  )
}