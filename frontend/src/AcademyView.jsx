import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Zap, MessageCircle, Target, Award, Eye, Check, ChevronRight, Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLevel, getLevelProgress, awardXp } from './XpBar'

const LEVEL_NAMES = {
  1: { title: 'Aficionado', color: 'from-slate-500 to-slate-600', icon: '🌱', xp: 0 },
  2: { title: 'Seguidor', color: 'from-blue-500 to-blue-600', icon: '⭐', xp: 500 },
  3: { title: 'Celtista', color: 'from-cyan-500 to-blue-600', icon: '🔵', xp: 1500 },
  4: { title: 'Celeste', color: 'from-sky-400 to-blue-500', icon: '💙', xp: 3000 },
  5: { title: 'Internacional', color: 'from-indigo-500 to-purple-600', icon: '🌍', xp: 5000 },
  6: { title: 'Mostovoi', color: 'from-purple-500 to-pink-600', icon: '👑', xp: 8000 },
  7: { title: 'Zar', color: 'from-pink-500 to-red-600', icon: '⚡', xp: 12000 },
  8: { title: 'Lenda', color: 'from-amber-500 to-orange-600', icon: '🌟', xp: 18000 },
  9: { title: 'Inmortal', color: 'from-yellow-400 to-amber-500', icon: '🔥', xp: 25000 },
  10: { title: 'Celta de #Lenda', color: 'from-yellow-300 to-amber-400', icon: '🏆', xp: 35000 },
}

const ACHIEVEMENTS = [
  { id: 'first_chat', name: 'Primeira Conversa', desc: 'Envía o teu primeiro mensaje', icon: '💬', check: (xp) => xp >= 10, xp: 10 },
  { id: 'streak_3', name: 'Racha de 3', desc: 'Mantén unha racha de 3 días', icon: '🔥', check: (xp, streak) => streak >= 3, xp: 3 },
  { id: 'streak_7', name: 'Racha de 7', desc: 'Mantén unha racha de 7 días', icon: '🔥', check: (xp, streak) => streak >= 7, xp: 7 },
  { id: 'streak_30', name: 'Racha de 30', desc: 'Un mes sen fallar', icon: '💪', check: (xp, streak) => streak >= 30, xp: 30 },
  { id: 'chat_100', name: 'Centenario', desc: '100 mensajes no chat', icon: '💬', check: (xp) => xp >= 1000, xp: 1000 },
  { id: 'xp_5000', name: 'Coleccionista de XP', desc: 'Acumula 5.000 XP', icon: '⭐', check: (xp) => xp >= 5000, xp: 5000 },
  { id: 'xp_10000', name: 'Master Celeste', desc: 'Acumula 10.000 XP', icon: '💎', check: (xp) => xp >= 10000, xp: 10000 },
  { id: 'xp_25000', name: 'Inmortal', desc: 'Acumula 25.000 XP', icon: '🏅', check: (xp) => xp >= 25000, xp: 25000 },
  { id: 'level_5', name: 'Internacional', desc: 'Alcanza o nivel 5', icon: '🌍', check: (xp) => getLevel(xp) >= 5, xp: 5 },
  { id: 'level_8', name: 'Lenda', desc: 'Alcanza o nivel 8', icon: '🌟', check: (xp) => getLevel(xp) >= 8, xp: 8 },
  { id: 'level_10', name: 'Celta de #Lenda', desc: 'Alcanza o nivel máximo', icon: '🏆', check: (xp) => getLevel(xp) >= 10, xp: 10 },
]

export default function AcademyView({ supabase, user, onClose, onNavigate }) {
  const { t } = useTranslation()
  const [xpData, setXpData] = useState(null)
  const [tab, setTab] = useState('levels')
  const [claiming, setClaiming] = useState(false)
  const [claimedToday, setClaimedToday] = useState(false)

  const refreshXp = () => {
    if (!supabase || !user?.id) return
    supabase.from('user_xp').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setXpData(data)
    })
  }

  useEffect(() => {
    refreshXp()
  }, [supabase, user?.id])

  useEffect(() => {
    if (xpData?.last_activity_date) {
      const today = new Date().toISOString().split('T')[0]
      setClaimedToday(xpData.last_activity_date === today)
    }
  }, [xpData])

  const claimDailyBonus = async () => {
    if (!supabase || !user?.id || claiming || claimedToday) return
    setClaiming(true)
    const r = await awardXp(supabase, user.id, 'daily_bonus')
    if (r) {
      refreshXp()
      setClaimedToday(true)
    }
    setClaiming(false)
  }

  const xp = xpData?.xp || 0
  const level = xpData?.level || 1
  const streak = xpData?.streak || 0
  const maxStreak = xpData?.max_streak || 0
  const { current, needed, pct } = getLevelProgress(xp)

  const currentLevelData = LEVEL_NAMES[level] || LEVEL_NAMES[1]
  const nextLevelData = LEVEL_NAMES[level + 1] || null

  return (
    <div className="flex-1 overflow-y-auto z-10 pb-4">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-white">🎓 {t('academy.title')}</h2>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button onClick={() => onNavigate('rewards')}
                className="text-[10px] bg-yellow-900/40 text-yellow-400 px-3 py-1.5 rounded-full font-bold hover:bg-yellow-900/60 transition-colors">
                🎁 Recompensas
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                <Eye size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 tab-scroll">
          <button onClick={() => setTab('levels')}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${tab === 'levels' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            <Trophy size={14} className="inline mr-1" /> Niveis
          </button>
          <button onClick={() => setTab('achievements')}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${tab === 'achievements' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            <Star size={14} className="inline mr-1" /> Logros
          </button>
          <button onClick={() => setTab('stats')}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${tab === 'stats' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            <Target size={14} className="inline mr-1" /> Stats
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'levels' && (
          <>
            {/* Current level hero */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${currentLevelData.color} rounded-2xl p-5 text-center shadow-xl`}>
              <div className="text-4xl mb-2">{currentLevelData.icon}</div>
              <p className="text-3xl font-black text-white">{t('academy.level')} {level}</p>
              <p className="text-lg font-bold text-white/90 mt-1">{currentLevelData.title}</p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${pct * 100}%` }} />
              </div>
              <p className="text-xs text-white/70 mt-2">{current.toLocaleString()} / {needed.toLocaleString()} XP</p>
            </motion.div>

            {/* Daily bonus */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={claimDailyBonus}
              disabled={claimedToday || claiming}
              className={`w-full rounded-xl p-3 flex items-center gap-3 border transition-all ${
                claimedToday
                  ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
                  : 'bg-gradient-to-r from-orange-900/40 to-yellow-900/40 border-orange-500/40 hover:from-orange-900/60 hover:to-yellow-900/60 cursor-pointer'
              }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                claimedToday ? 'bg-slate-700' : 'bg-gradient-to-br from-orange-500 to-yellow-500 animate-pulse'
              }`}>
                {claimedToday ? '✅' : '🎁'}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-bold ${claimedToday ? 'text-slate-500' : 'text-white'}`}>
                  {claimedToday ? 'Bono diario reclamado' : '🎁 Bono diario'}
                </p>
                <p className={`text-[10px] ${claimedToday ? 'text-slate-600' : 'text-orange-300'}`}>
                  {claimedToday ? 'Volve mañá para máis XP' : '+50 XP · Reclama cada día'}
                </p>
              </div>
              {!claimedToday && (
                <div className="text-right">
                  <div className="text-sm font-black text-yellow-400">+50</div>
                  <div className="text-[9px] text-yellow-500">XP</div>
                </div>
              )}
            </motion.button>

            {/* All levels */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Tódolos niveis</p>
              {Object.entries(LEVEL_NAMES).map(([lvl, data]) => {
                const l = parseInt(lvl)
                const unlocked = level >= l
                const isCurrent = level === l
                return (
                  <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: l * 0.05 }}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-all ${isCurrent ? 'bg-blue-900/40 border border-blue-500/40' : unlocked ? 'bg-slate-800/40 border border-slate-700/30' : 'bg-slate-800/20 border border-slate-800'}`}>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center text-lg flex-shrink-0`}>
                      {data.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>{data.title}</span>
                        {isCurrent && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">ACTUAL</span>}
                        {unlocked && !isCurrent && <Check size={12} className="text-green-400" />}
                      </div>
                      <p className={`text-[10px] ${unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                        {unlocked ? `Nivel ${l} · ${data.xp.toLocaleString()} XP` : `🔒 ${data.xp.toLocaleString()} XP`}
                      </p>
                    </div>
                    <ChevronRight size={14} className={`${unlocked ? 'text-slate-400' : 'text-slate-600'}`} />
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'achievements' && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 mb-2">Logros desbloqueados segundo o teu progreso</p>
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a) => {
                const done = a.check(xp, streak)
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-xl p-3 border text-center ${done ? 'bg-slate-800/60 border-yellow-500/30' : 'bg-slate-800/30 border-slate-700/30 opacity-60'}`}>
                    <div className="text-2xl mb-1">{done ? a.icon : '🔒'}</div>
                    <p className={`text-xs font-bold ${done ? 'text-white' : 'text-slate-500'}`}>{a.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{done ? '✅ Completado' : a.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 mb-2">As túas estatísticas na Academia Celtista</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'XP Total', value: xp.toLocaleString(), icon: <Zap size={16} className="text-yellow-400" />, color: 'text-yellow-400' },
                { label: 'Nivel', value: `${level}/10`, icon: <Trophy size={16} className="text-blue-400" />, color: 'text-blue-400' },
                { label: 'Racha actual', value: `${streak} días`, icon: <Flame size={16} className="text-orange-400" />, color: 'text-orange-400' },
                { label: 'Mellor racha', value: `${maxStreak} días`, icon: <Star size={16} className="text-purple-400" />, color: 'text-purple-400' },
                { label: 'Progreso', value: `${Math.round(pct * 100)}%`, icon: <Target size={16} className="text-green-400" />, color: 'text-green-400' },
                { label: 'Seguinte nivel', value: nextLevelData ? nextLevelData.title : '—', icon: <ChevronRight size={16} className="text-cyan-400" />, color: 'text-cyan-400' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {stat.icon}
                    <span className="text-[10px] text-slate-500">{stat.label}</span>
                  </div>
                  <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                </motion.div>
              ))}
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mt-2">
              <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><MessageCircle size={10} /> Como gañar XP</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-400"><span>💬 Mensaxe no chat</span><span className="text-green-400">+10 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>✅ Acerto no Gamer</span><span className="text-green-400">+25 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>❌ Fallo no Gamer</span><span className="text-green-400">+5 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>🎯 Pronóstico acertado</span><span className="text-green-400">+100 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>🔥 Bono de racha (diario)</span><span className="text-green-400">+5-35 XP</span></div>
                <div className="flex justify-between text-slate-400"><span>🎲 Trivia diaria</span><span className="text-green-400">+50 XP</span></div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-600 pt-2 pb-20">
          Academia Celtista · 10 niveis · Xuño 2026
        </p>
      </div>
    </div>
  )
}
