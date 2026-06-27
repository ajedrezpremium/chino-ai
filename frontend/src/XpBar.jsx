import React, { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000]

const getLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

const getLevelProgress = (xp) => {
  const level = getLevel(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000
  return { current: xp - currentThreshold, needed: nextThreshold - currentThreshold, pct: Math.min((xp - currentThreshold) / (nextThreshold - currentThreshold), 1) }
}

const XP_ACTIONS = {
  chat_message: 10,
  gamer_correct: 25,
  gamer_wrong: 5,
  daily_bonus: 50,
  prediction_correct: 100,
}

export { getLevel, getLevelProgress, LEVEL_THRESHOLDS }

export function awardXp(supabase, userId, action, amount) {
  if (!supabase || !userId) return Promise.resolve()
  const xpGain = amount || XP_ACTIONS[action] || 10

  return supabase.rpc('award_xp', { p_user_id: userId, p_xp: xpGain }).catch(() => {
    return supabase.from('user_xp').select('xp, streak, last_activity_date').eq('user_id', userId).single().then(({ data }) => {
      const today = new Date().toISOString().split('T')[0]
      const prevXp = data?.xp || 0
      const prevStreak = data?.streak || 0
      const lastDate = data?.last_activity_date || ''
      const isNewDay = lastDate !== today
      const newStreak = isNewDay ? (lastDate && new Date(today) - new Date(lastDate) <= 86400000 * 2 ? prevStreak + 1 : 1) : prevStreak
      const streakBonus = isNewDay ? Math.min(newStreak, 7) * 5 : 0
      const totalGain = xpGain + streakBonus

      return supabase.from('user_xp').upsert({
        user_id: userId,
        xp: prevXp + totalGain,
        level: getLevel(prevXp + totalGain),
        streak: newStreak,
        max_streak: Math.max(data?.max_streak || 0, newStreak),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      }).catch(() => {})
    }).catch(() => {})
  })
}

export default function XpBar({ supabase, user, compact = false, onLevelUp, onAcademy }) {
  const { t } = useTranslation()
  const [xpData, setXpData] = React.useState(null)
  const [prevLevel, setPrevLevel] = React.useState(1)

  const fetchXp = useCallback(async () => {
    if (!supabase || !user?.id) return
    const { data } = await supabase.from('user_xp').select('*').eq('user_id', user.id).single()
    if (data) {
      setXpData(data)
      if (data.level > prevLevel && prevLevel > 0) {
        onLevelUp?.(data.level)
      }
      setPrevLevel(data.level)
    }
  }, [supabase, user?.id, prevLevel, onLevelUp])

  useEffect(() => {
    fetchXp()
    const interval = setInterval(fetchXp, 30000)
    return () => clearInterval(interval)
  }, [fetchXp])

  if (!user) return null

  const xp = xpData?.xp || 0
  const level = xpData?.level || 1
  const streak = xpData?.streak || 0
  const { current, needed, pct } = getLevelProgress(xp)
  const levelName = t(`academy.levels.${level}`, `Level ${level}`)

  if (compact) {
    return (
      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => onAcademy?.()}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 rounded-full px-2 py-1 transition-colors cursor-pointer">
        <Trophy size={12} className="text-yellow-400" />
        <span className="text-[10px] font-bold text-white">{level}</span>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct * 100}%` }} />
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
            <Flame size={10} /> {streak}
          </span>
        )}
      </motion.button>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <span className="font-bold text-sm text-white">{t('academy.title')}</span>
        </div>
        <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
          {t('academy.level')} {level} · {levelName}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
          className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-yellow-400 rounded-full transition-all duration-700" />
      </div>
      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
        <span>{current} / {needed} XP</span>
        <span className="flex items-center gap-1"><Flame size={10} className="text-orange-400" /> {t('academy.streak')}: {streak} {t('academy.days')}</span>
      </div>
    </motion.div>
  )
}
