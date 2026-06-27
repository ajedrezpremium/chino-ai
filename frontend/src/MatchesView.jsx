import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Goal, ArrowLeft, Loader, PlayCircle, Shirt, RefreshCw, Clock, FileText, ExternalLink, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { awardXp } from './XpBar'

const SEASONS = []
for (let y = 1923; y <= 2026; y++) {
  SEASONS.push(`${y}-${String(y + 1).slice(-2)}`)
}
SEASONS.reverse()

const MOCK_MATCHES = {
  '1923-24': [
    { date: '1923-09-23', competition: 'Campeonato de Galicia', opponent: 'Boetticher', home: true, result: '3-1', scorers: ['Polo', 'Chiarroni', 'Pasarín'], attendance: '8.000', round: 'Jornada 1' }
  ]
}

export default function MatchesView({ onClose, supabase }) {
  const { t, i18n } = useTranslation()
  const [season, setSeason] = useState('2025-26')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [currentUser, setCurrentUser] = useState(null)
  const [predictingId, setPredictingId] = useState(null)

  useEffect(() => {
    setLoading(true)
    setSelectedMatch(null)
    const load = async () => {
      let data = MOCK_MATCHES[season] ? [...MOCK_MATCHES[season]] : []
      if (supabase) {
        try {
          const { data: rows } = await supabase
            .from('match_history')
            .select('*')
            .eq('season', season)
            .order('date', { ascending: true })
          if (rows?.length > 0) {
            data = rows.map(r => ({
              ...r,
              home: r.home ?? true,
              scorers: Array.isArray(r.scorers) ? r.scorers : []
            }))
          }
        } catch {}
      }
      setMatches(data)
      setLoading(false)
    }
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [season, supabase])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user)
        fetchPredictions(session.user.id)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
      if (session?.user) fetchPredictions(session.user.id)
    })
    return () => subscription?.unsubscribe()
  }, [supabase])

  const parseResult = (result) => {
    if (!result) return null
    const parts = result.split('-').map(Number)
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
    if (parts[0] > parts[1]) return 'H'
    if (parts[0] < parts[1]) return 'A'
    return 'D'
  }

  const markPredictions = async (userId) => {
    if (!supabase || !userId) return
    const toMark = matches.filter(m => m.result && predictions[m.id || m._tempId]?.correct === null)
    for (const m of toMark) {
      const actualResult = parseResult(m.result)
      if (!actualResult) continue
      const pred = predictions[m.id || m._tempId]
      if (!pred) continue
      const isCorrect = pred.predicted_result === actualResult
      await supabase.from('match_predictions').update({ correct: isCorrect }).eq('id', pred.id).catch(() => {})
      if (isCorrect) {
        awardXp(supabase, userId, 'prediction_correct').catch(() => {})
      }
      setPredictions(prev => ({ ...prev, [m.id || m._tempId]: { ...pred, correct: isCorrect } }))
    }
  }

  const fetchPredictions = async (userId) => {
    if (!supabase || !userId) return
    const { data } = await supabase.from('match_predictions').select('*').eq('user_id', userId)
    if (data) {
      const map = {}
      data.forEach(p => { map[p.match_id] = p })
      setPredictions(map)
      setTimeout(() => markPredictions(userId), 500)
    }
  }

  const handlePredict = async (match, result) => {
    if (!currentUser || !supabase || predictingId) return
    setPredictingId(match.id || match._tempId)
    try {
      const { data, error } = await supabase.from('match_predictions').upsert({
        user_id: currentUser.id,
        match_id: match.id || match._tempId,
        predicted_result: result,
      }).select().single()
      if (!error && data) {
        setPredictions(prev => ({ ...prev, [match.id || match._tempId]: data }))
        awardXp(supabase, currentUser.id, null, 15).catch(() => {})
      } else {
        setPredictions(prev => ({ ...prev, [match.id || match._tempId]: { predicted_result: result } }))
      }
    } catch {}
    setPredictingId(null)
  }

  const lang = i18n.language?.startsWith('gl') ? 'gl' : i18n.language?.startsWith('en') ? 'en' : 'es'

  return (
    <main className="flex-1 overflow-y-auto z-10">
      <div className="p-4 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-blue-400">{t('matches.title')}</h2>
            <p className="text-[10px] text-slate-400">{t('matches.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => {
            const idx = SEASONS.indexOf(season)
            if (idx < SEASONS.length - 1) setSeason(SEASONS[idx + 1])
          }} className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
            disabled={SEASONS.indexOf(season) >= SEASONS.length - 1}>
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 text-center">
            <span className="bg-slate-800 text-sm font-bold text-white px-4 py-2 rounded-full inline-block">
              <Calendar size={14} className="inline mr-1.5 text-blue-400" />
              {season}
            </span>
          </div>
          <button onClick={() => {
            const idx = SEASONS.indexOf(season)
            if (idx > 0) setSeason(SEASONS[idx - 1])
          }} className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
            disabled={SEASONS.indexOf(season) <= 0}>
            <ChevronRight size={16} />
          </button>
        </div>
        <a href={`https://www.google.com/search?q=RC+Celta+${season}+La+Liga+partidos+resultados`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 mb-3 text-[10px] text-blue-500 hover:text-blue-400 transition-colors">
          <ExternalLink size={10} />
          {t('matches.official_data')}
        </a>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-blue-400 animate-spin" />
          </div>
        ) : selectedMatch ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-4">
            <button onClick={() => setSelectedMatch(null)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3">
              <ChevronLeft size={14} /> {t('matches.back')}
            </button>
            <div className="bg-slate-800/80 border border-blue-500/20 rounded-2xl p-5 shadow-lg">
              <div className="text-center mb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{selectedMatch.competition}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedMatch.date} · {selectedMatch.round}</p>
                <p className="text-2xl font-black text-white mt-3">
                  {selectedMatch.home ? 'Celta' : selectedMatch.opponent} <span className="text-blue-400 mx-2">vs</span>
                  {selectedMatch.home ? selectedMatch.opponent : 'Celta'}
                </p>
                <p className="text-4xl font-black text-blue-400 mt-2">{selectedMatch.result}</p>
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-4">
                {/* ─── Goles con minuto ─── */}
                {selectedMatch.details?.goals?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Goal size={12} className="text-green-400" /> {t('matches.goals')}
                    </p>
                    <div className="space-y-1">
                      {selectedMatch.details.goals.map((g, i) => (
                        <div key={i} className={`flex items-center gap-2 text-sm ${g.for_celta ? 'text-white' : 'text-slate-400'}`}>
                          <span className="text-[10px] font-mono text-slate-500 w-6">{g.minute}'</span>
                          <span className={g.type === 'penalty' ? 'text-yellow-400' : g.type === 'own_goal' ? 'text-red-400' : ''}>
                            {g.type === 'penalty' ? '(p)' : g.type === 'own_goal' ? '(p.p.)' : ''}
                          </span>
                          <span className={`font-semibold ${g.for_celta ? 'text-blue-300' : ''}`}>{g.scorer}</span>
                          {g.assist && <span className="text-[10px] text-slate-500">({g.assist})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Alineaciones ─── */}
                {selectedMatch.details?.lineup_celta?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shirt size={12} className="text-blue-400" /> {t('matches.lineups')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="font-bold text-blue-400 mb-1">Celta</p>
                        {selectedMatch.details.lineup_celta.map((p, i) => (
                          <div key={i} className="flex items-center gap-1 text-white">
                            <span className="text-slate-500 w-4">{p.number}</span>
                            <span className={p.captain ? 'text-yellow-400 font-bold' : ''}>
                              {p.name}{p.captain ? ' ©' : ''}
                            </span>
                            <span className="text-[9px] text-slate-500 ml-auto">{p.pos}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 mb-1">{selectedMatch.opponent}</p>
                        {selectedMatch.details.lineup_opponent?.map((p, i) => (
                          <div key={i} className="flex items-center gap-1 text-slate-300">
                            <span className="text-slate-600 w-4">{p.number}</span>
                            <span>{p.name}</span>
                            <span className="text-[9px] text-slate-600 ml-auto">{p.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Cambios ─── */}
                {selectedMatch.details?.substitutions?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <RefreshCw size={12} className="text-orange-400" /> {t('matches.substitutions')}
                    </p>
                    <div className="space-y-1 text-sm">
                      {selectedMatch.details.substitutions.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-white">
                          <span className="text-[10px] font-mono text-slate-500 w-6">{s.minute}'</span>
                          <span className="text-red-400">↓ {s.out}</span>
                          <span className="text-green-400">↑ {s.in}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Resumen ─── */}
                {selectedMatch.summary && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FileText size={12} className="text-blue-400" /> {t('matches.summary')}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedMatch.summary}</p>
                  </div>
                )}

                {/* ─── Asistencia / Sede ─── */}
                <div className="flex gap-4 text-xs text-slate-400 pt-1">
                  {selectedMatch.attendance && (
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-blue-400" />
                      <span>{selectedMatch.attendance}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-yellow-400" />
                    <span>{selectedMatch.venue || (selectedMatch.home ? 'Balaídos' : 'Visitante')}</span>
                  </div>
                </div>

                {/* ─── Video ─── */}
                {selectedMatch.video_url && (
                  <a href={selectedMatch.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-2 w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl py-3 transition-colors">
                    <PlayCircle size={18} className="text-red-400" />
                    <span className="text-sm font-bold text-red-400">{t('matches.watch_highlights')}</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : matches.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16">
            <Calendar size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{t('matches.empty')}</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {matches.map((m, i) => {
                const mid = m.id || m._tempId || i
                const pred = predictions[mid]
                const isUpcoming = !m.result
                const predResult = pred?.predicted_result
                const predCorrect = pred?.correct

                return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden transition-colors">
                  <button onClick={() => setSelectedMatch(m)}
                    className="w-full text-left p-3 hover:bg-slate-700/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500">{m.date} · {m.competition}</p>
                        <p className="text-sm font-bold text-white mt-0.5 truncate">
                          {m.home ? `${t('matches.celta')} vs ${m.opponent}` : `${m.opponent} vs ${t('matches.celta')}`}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0 flex items-center gap-2">
                        {predCorrect === true && <Check size={14} className="text-green-400" />}
                        {predCorrect === false && <X size={14} className="text-red-400" />}
                        <span className={`text-lg font-black ${m.result ? 'text-blue-400' : 'text-slate-600'}`}>
                          {m.result || '-'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isUpcoming && currentUser && (
                    <div className="px-3 pb-3 pt-0 border-t border-slate-700/50">
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] text-slate-500 mr-1">Pronóstico:</span>
                        {['H', 'D', 'A'].map(r => {
                          const selected = predResult === r
                          const label = r === 'H' ? (m.home ? 'Celta' : m.opponent) : r === 'D' ? 'Empate' : (m.home ? m.opponent : 'Celta')
                          return (
                            <button key={r} onClick={() => handlePredict(m, r)} disabled={predictingId === mid}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                                selected
                                  ? 'bg-blue-600 text-white shadow'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              } disabled:opacity-50`}>
                              {label.substring(0, 5)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )})}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}
