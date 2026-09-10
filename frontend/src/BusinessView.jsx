import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, MessageSquare, Eye, Ticket, MousePointerClick, Filter, Tags, HeartHandshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STOPWORDS = new Set([
  'para', 'como', 'pero', 'este', 'esta', 'estos', 'estas', 'entre', 'cuando', 'donde', 'porque', 'gracias', 'hola', 'tengo', 'tiene', 'tienen', 'quiero', 'quieres', 'puedes', 'puedo', 'hacer', 'haces', 'saber', 'mucho', 'mucha', 'esto', 'eso', 'otra', 'otro', 'cada', 'todos', 'todas', 'algo', 'alguien', 'siempre', 'nunca', 'ahora', 'despues', 'antes', 'sobre', 'contra', 'desde', 'hasta', 'durante', 'celta', 'chiño', 'vigo', 'balaidos', 'futbol', 'fútbol', 'equipo', 'partido', 'partidos',
  'unha', 'para', 'como', 'pero', 'este', 'esta', 'entre', 'cando', 'onde', 'porque', 'grazas', 'teño', 'quero', 'podes', 'podo', 'facer', 'saber', 'moito', 'moita', 'isto', 'iso', 'outra', 'outro', 'todos', 'todas', 'sempre', 'nunca', 'agora', 'despois', 'antes', 'sobre', 'contra', 'dende', 'ata',
  'that', 'this', 'with', 'from', 'have', 'what', 'when', 'where', 'which', 'about', 'there', 'their', 'your', 'yours', 'hello', 'thanks', 'thank', 'please', 'does', 'tell',
])

const dayKey = (d) => new Date(d).toISOString().split('T')[0]

export default function BusinessView({ supabase, onClose }) {
  const { t } = useTranslation()
  const [msgs, setMsgs] = useState([])
  const [clicks, setClicks] = useState([])
  const [claims, setClaims] = useState([])
  const [totalUsers, setTotalUsers] = useState(null)
  const [totalSessions, setTotalSessions] = useState(null)
  const [totalCorrections, setTotalCorrections] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const chatQuery = supabase.from('chat_history').select('user_id, role, message, has_action, created_at').order('created_at', { ascending: false }).limit(2000)
      .then(
        r => r,
        () => supabase.from('chat_history').select('user_id, role, message, created_at').order('created_at', { ascending: false }).limit(2000)
      )
    Promise.allSettled([
      chatQuery,
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('link_clicks').select('kind, label, created_at').order('created_at', { ascending: false }).limit(1000),
      supabase.from('coupon_claims').select('code, created_at').order('created_at', { ascending: false }).limit(500),
      supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('corrections').select('id', { count: 'exact', head: true }),
    ]).then(([m, u, c, cl, g, co]) => {
      if (m.status === 'fulfilled' && m.value.data) setMsgs(m.value.data)
      if (u.status === 'fulfilled') setTotalUsers(u.value.count ?? 0)
      if (c.status === 'fulfilled' && c.value.data) setClicks(c.value.data)
      if (cl.status === 'fulfilled' && cl.value.data) setClaims(cl.value.data)
      if (g.status === 'fulfilled') setTotalSessions(g.value.count ?? 0)
      if (co.status === 'fulfilled') setTotalCorrections(co.value.count ?? 0)
      setLoaded(true)
    })
  }, [supabase])

  const stats = useMemo(() => {
    const today = dayKey(new Date())
    const weekAgo = Date.now() - 7 * 86400000
    const monthAgo = Date.now() - 30 * 86400000
    const dau = new Set(msgs.filter(m => dayKey(m.created_at) === today && m.user_id).map(m => m.user_id)).size
    const mau = new Set(msgs.filter(m => new Date(m.created_at).getTime() >= monthAgo && m.user_id).map(m => m.user_id)).size
    const msgs7d = msgs.filter(m => new Date(m.created_at).getTime() >= weekAgo).length

    // Actividade 14 días
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const k = dayKey(d)
      days.push({ key: k, label: `${d.getDate()}/${d.getMonth() + 1}`, count: msgs.filter(m => dayKey(m.created_at) === k).length })
    }
    const maxDay = Math.max(1, ...days.map(d => d.count))

    // Embudo comercial
    const offersShown = msgs.filter(m => m.role === 'agent' && m.has_action).length
    const offerClicks = clicks.filter(c => c.kind === 'oferta').length
    const linkClicks = clicks.filter(c => c.kind === 'enlace').length
    const couponClicks = claims.length
    const ctr = offersShown > 0 ? Math.round((offerClicks / offersShown) * 100) : 0

    // Temas (mensaxes de usuario)
    const freq = {}
    msgs.filter(m => m.role === 'user' && m.message).forEach(m => {
      m.message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/[^a-z]+/).filter(w => w.length >= 4 && !STOPWORDS.has(w))
        .forEach(w => { freq[w] = (freq[w] || 0) + 1 })
    })
    const topics = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const maxTopic = Math.max(1, ...(topics.map(x => x[1])))

    // Atribución: top enlaces + cupones por código
    const linkFreq = {}
    clicks.forEach(c => { const k = c.label || c.kind; linkFreq[k] = (linkFreq[k] || 0) + 1 })
    const topLinks = Object.entries(linkFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const couponFreq = {}
    claims.forEach(c => { couponFreq[c.code] = (couponFreq[c.code] || 0) + 1 })
    const topCoupons = Object.entries(couponFreq).sort((a, b) => b[1] - a[1])

    const quality = msgs.length > 0 ? ((totalCorrections / msgs.length) * 1000).toFixed(1) : '0.0'

    return { dau, mau, msgs7d, days, maxDay, offersShown, offerClicks, linkClicks, couponClicks, ctr, topics, maxTopic, topLinks, topCoupons, quality }
  }, [msgs, clicks, claims, totalCorrections])

  const kpi = [
    { label: t('business.kpi_users'), value: totalUsers === null ? '…' : String(totalUsers), icon: Users, color: 'text-blue-400' },
    { label: t('business.kpi_dau'), value: loaded ? String(stats.dau) : '…', icon: TrendingUp, color: 'text-emerald-400' },
    { label: t('business.kpi_msgs7d'), value: loaded ? String(stats.msgs7d) : '…', icon: MessageSquare, color: 'text-purple-400' },
    { label: t('business.kpi_coupons'), value: loaded ? String(stats.couponClicks) : '…', icon: Ticket, color: 'text-yellow-400' },
  ]

  const funnel = [
    { label: t('business.funnel_offers'), value: stats.offersShown, pct: 100 },
    { label: t('business.funnel_clicks'), value: stats.offerClicks + stats.linkClicks, pct: stats.offersShown ? Math.min(100, Math.round(((stats.offerClicks + stats.linkClicks) / stats.offersShown) * 100)) : 0 },
    { label: t('business.funnel_coupons'), value: stats.couponClicks, pct: (stats.offerClicks + stats.linkClicks) ? Math.min(100, Math.round((stats.couponClicks / (stats.offerClicks + stats.linkClicks)) * 100)) : 0 },
  ]

  return (
    <div className="flex-1 overflow-y-auto z-10 pb-28">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">{t('business.title')}</h2>
          <p className="text-xs text-blue-300">{t('business.subtitle')}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
          <Eye size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {kpi.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <k.icon size={18} className={k.color} />
              <div className="text-2xl font-black text-white mt-1">{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[['MAU (30d)', stats.mau], ['Partidas', totalSessions ?? '…'], ['CTR ofertas', `${stats.ctr}%`]].map(([l, v]) => (
            <div key={l} className="bg-slate-800/40 border border-slate-700/50 rounded-xl py-2">
              <div className="text-lg font-black text-white">{v}</div>
              <div className="text-[10px] text-slate-500">{l}</div>
            </div>
          ))}
        </div>

        {/* Actividade 14 días */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3">📈 {t('business.activity14d')}</h3>
          <div className="flex items-end gap-1 h-24">
            {stats.days.map(d => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: ${d.count}`}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.count / stats.maxDay) * 100)}%` }}
                  className={`w-full rounded-t ${dayKey(new Date()) === d.key ? 'bg-yellow-500' : 'bg-blue-500/70'}`} style={{ minHeight: 4 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-slate-500">
            <span>{stats.days[0]?.label}</span><span>{stats.days[13]?.label}</span>
          </div>
        </div>

        {/* Embudo comercial */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5"><Filter size={14} className="text-orange-400" /> {t('business.funnel')}</h3>
          <div className="space-y-2">
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">{i + 1}. {f.label}</span>
                  <span className="font-black text-white">{f.value} <span className="text-slate-500 font-normal">({f.pct}%)</span></span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ delay: 0.2 + i * 0.15 }}
                    className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temas */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5"><Tags size={14} className="text-purple-400" /> {t('business.topics')}</h3>
          {stats.topics.length === 0 ? (
            <p className="text-[11px] text-slate-500">{t('business.no_data')}</p>
          ) : (
            <div className="space-y-1.5">
              {stats.topics.map(([w, c]) => (
                <div key={w} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-300 w-28 truncate">{w}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(c / stats.maxTopic) * 100}%` }}
                      className="h-full bg-purple-500/80 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 w-8 text-right">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atribución */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5"><MousePointerClick size={14} className="text-green-400" /> {t('business.attribution')}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t('business.top_links')}</p>
          {stats.topLinks.length === 0 ? (
            <p className="text-[11px] text-slate-500 mb-3">{t('business.no_data')}</p>
          ) : (
            <div className="space-y-1 mb-3">
              {stats.topLinks.map(([l, c]) => (
                <div key={l} className="flex justify-between text-[11px] bg-slate-900/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-300 truncate mr-2">🔗 {l}</span>
                  <span className="font-black text-green-400 flex-shrink-0">{c}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t('business.top_coupons')}</p>
          {stats.topCoupons.length === 0 ? (
            <p className="text-[11px] text-slate-500">{t('business.no_data')}</p>
          ) : (
            <div className="space-y-1">
              {stats.topCoupons.map(([l, c]) => (
                <div key={l} className="flex justify-between text-[11px] bg-slate-900/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-300 truncate mr-2">🎟️ {l}</span>
                  <span className="font-black text-yellow-400 flex-shrink-0">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calidade */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
          <HeartHandshake size={20} className="text-pink-400 flex-shrink-0" />
          <div className="text-[11px] text-slate-400">
            <span className="font-black text-white text-sm">{totalCorrections}</span> {t('business.corrections')} · {stats.quality}/1000 {t('business.msgs')}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-200 font-semibold mb-1">{t('business.quote')}</p>
          <p className="text-xs text-slate-400">{t('business.footer')}</p>
        </div>
      </div>
    </div>
  )
}
