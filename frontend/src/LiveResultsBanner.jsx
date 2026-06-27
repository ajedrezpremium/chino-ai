import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Calendar, Clock, ChevronRight, Loader, Goal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function LiveResultsBanner({ supabase }) {
  const { t, i18n } = useTranslation()
  const [latestMatch, setLatestMatch] = useState(null)
  const [nextMatch, setNextMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchLiveData = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('realtime_celta')
        .select('payload, fetched_at')
        .eq('data_type', 'matches')
        .order('fetched_at', { ascending: false })
        .limit(1)
      if (data?.length > 0 && data[0].payload) {
        const matches = Array.isArray(data[0].payload) ? data[0].payload
          : data[0].payload.matches || data[0].payload.data || []
        const now = new Date()
        const past = matches.filter(m => new Date(m.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date))
        const future = matches.filter(m => new Date(m.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
        if (past.length > 0) setLatestMatch(past[0])
        if (future.length > 0) setNextMatch(future[0])
        else setNextMatch(null)
      }
    } catch {}
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 60000)
    return () => clearInterval(interval)
  }, [fetchLiveData])

  if (loading) return null
  if (!latestMatch && !nextMatch) return null

  const formatDate = (d) => {
    const dt = new Date(d)
    const dd = String(dt.getDate()).padStart(2, '0')
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}`
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-2 bg-gradient-to-r from-blue-900/40 via-slate-800/60 to-blue-900/40 border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="flex divide-x divide-blue-500/20 text-xs">
          {latestMatch && (
            <div className="flex-1 p-2.5 text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">{t('live.last_match')}</p>
              <p className="text-white font-semibold text-[11px] truncate">
                {latestMatch.home ? t('live.celta') : latestMatch.opponent}
                <span className="text-blue-400 mx-1">{latestMatch.result || '-'}</span>
                {latestMatch.home ? latestMatch.opponent : t('live.celta')}
              </p>
              <p className="text-[9px] text-slate-500">{formatDate(latestMatch.date)}</p>
            </div>
          )}
          {latestMatch && nextMatch && <div className="w-px bg-blue-500/20 self-stretch" />}
          {nextMatch && (
            <div className="flex-1 p-2.5 text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">{t('live.next_match')}</p>
              <p className="text-white font-semibold text-[11px] truncate">
                <span className="text-yellow-400">⚽</span>{' '}
                {nextMatch.home ? `${t('live.celta')} vs ${nextMatch.opponent}` : `${nextMatch.opponent} vs ${t('live.celta')}`}
              </p>
              <p className="text-[9px] text-slate-500">{formatDate(nextMatch.date)}{nextMatch.time ? ` · ${nextMatch.time}` : ''}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
