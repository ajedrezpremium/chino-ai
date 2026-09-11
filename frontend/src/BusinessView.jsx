import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Users, MessageSquare, Eye, Ticket, MousePointerClick, Filter, Tags, HeartHandshake, Search, Download, X, Flame, Trophy } from 'lucide-react'
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
  const [bizTab, setBizTab] = useState('metrics')
  const [profiles, setProfiles] = useState([])
  const [xpAll, setXpAll] = useState([])
  const [sessions, setSessions] = useState([])
  const [promos, setPromos] = useState([])
  const [crmSearch, setCrmSearch] = useState('')
  const [crmSegment, setCrmSegment] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

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
      supabase.from('link_clicks').select('user_id, kind, label, created_at').order('created_at', { ascending: false }).limit(1000),
      supabase.from('coupon_claims').select('user_id, code, created_at').order('created_at', { ascending: false }).limit(500),
      supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('corrections').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id, username, display_name').limit(500),
      supabase.from('user_xp').select('user_id, xp, level, streak, max_streak, updated_at').limit(500),
      supabase.from('game_sessions').select('user_id, score').order('score', { ascending: false }).limit(500),
      supabase.from('promo_codes').select('*').order('code', { ascending: true }),
    ]).then(([m, u, c, cl, g, co, p, x, s, pr]) => {
      if (m.status === 'fulfilled' && m.value.data) setMsgs(m.value.data)
      if (u.status === 'fulfilled') setTotalUsers(u.value.count ?? 0)
      if (c.status === 'fulfilled' && c.value.data) setClicks(c.value.data)
      if (cl.status === 'fulfilled' && cl.value.data) setClaims(cl.value.data)
      if (g.status === 'fulfilled') setTotalSessions(g.value.count ?? 0)
      if (co.status === 'fulfilled') setTotalCorrections(co.value.count ?? 0)
      if (p.status === 'fulfilled' && p.value.data) setProfiles(p.value.data)
      if (x.status === 'fulfilled' && x.value.data) setXpAll(x.value.data)
      if (s.status === 'fulfilled' && s.value.data) setSessions(s.value.data)
      if (pr.status === 'fulfilled' && pr.value.data) setPromos(pr.value.data)
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

  // CRM: ficha 360° por usuario (perfís + XP + actividade)
  const crmRows = useMemo(() => {
    const byId = {}
    const ensure = (id) => {
      if (!byId[id]) byId[id] = { id, name: id.slice(0, 8), xp: 0, level: 1, streak: 0, msgs: 0, clicks: 0, claims: [], sessions: 0, best: 0, last: 0 }
      return byId[id]
    }
    profiles.forEach(p => { const r = ensure(p.id); r.name = p.display_name || p.username || r.name })
    xpAll.forEach(x => { const r = ensure(x.user_id); r.xp = x.xp || 0; r.level = x.level || 1; r.streak = x.streak || 0; const t = new Date(x.updated_at).getTime(); if (t > r.last) r.last = t })
    msgs.forEach(m => { if (!m.user_id) return; const r = ensure(m.user_id); if (m.role === 'user') r.msgs++; const t = new Date(m.created_at).getTime(); if (t > r.last) r.last = t })
    clicks.forEach(c => { if (!c.user_id) return; const r = ensure(c.user_id); r.clicks++; const t = new Date(c.created_at).getTime(); if (t > r.last) r.last = t })
    claims.forEach(c => { if (!c.user_id) return; const r = ensure(c.user_id); r.claims.push(c.code); const t = new Date(c.created_at).getTime(); if (t > r.last) r.last = t })
    sessions.forEach(s => { if (!s.user_id) return; const r = ensure(s.user_id); r.sessions++; if ((s.score || 0) > r.best) r.best = s.score })
    return Object.values(byId).sort((a, b) => b.xp - a.xp)
  }, [profiles, xpAll, msgs, clicks, claims, sessions])

  const crmFiltered = useMemo(() => {
    const now = Date.now()
    const q = crmSearch.toLowerCase()
    return crmRows.filter(r => {
      if (q && !r.name.toLowerCase().includes(q)) return false
      if (crmSegment === 'active') return now - r.last < 7 * 86400000 && r.last > 0
      if (crmSegment === 'dormant') return r.last === 0 || now - r.last > 30 * 86400000
      if (crmSegment === 'vip') return r.level >= 5
      return true
    })
  }, [crmRows, crmSearch, crmSegment])

  const exportCsv = () => {
    const head = 'nombre;xp;nivel;racha;mensajes;clics;partidas;mejor_puntos;cupones;ultima_actividad\n'
    const body = crmFiltered.map(r => [
      `"${r.name.replace(/"/g, '')}"`, r.xp, r.level, r.streak, r.msgs, r.clicks, r.sessions, r.best,
      `"${r.claims.join(',')}"`, r.last ? new Date(r.last).toISOString().split('T')[0] : ''
    ].join(';')).join('\n')
    const blob = new Blob(['\ufeff' + head + body], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `chino_crm_${crmSegment}_${dayKey(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

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

      <div className="px-4 pt-3 flex gap-2">
        {[
          { id: 'metrics', label: `📈 ${t('business.tab_metrics')}` },
          { id: 'crm', label: `👥 ${t('business.tab_crm')}` },
          { id: 'coupons', label: `🎟️ ${t('business.tab_coupons')}` },
        ].map(tb => (
          <button key={tb.id} onClick={() => setBizTab(tb.id)}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${bizTab === tb.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
      {bizTab === 'metrics' && (<>
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
      </>)}

      {bizTab === 'crm' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={crmSearch} onChange={e => setCrmSearch(e.target.value)}
              placeholder={t('business.crm_search')}
              className="w-full bg-slate-800 border border-slate-700 rounded-full pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-1.5">
            {[['all', t('business.seg_all')], ['active', t('business.seg_active')], ['dormant', t('business.seg_dormant')], ['vip', t('business.seg_vip')]].map(([id, label]) => (
              <button key={id} onClick={() => setCrmSegment(id)}
                className={`flex-1 text-[10px] py-1.5 rounded-full font-bold transition-colors ${crmSegment === id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500">{crmFiltered.length} {t('business.crm_contacts')}</p>
            <button onClick={exportCsv}
              className="flex items-center gap-1 text-[10px] font-bold bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-full transition-colors">
              <Download size={11} /> CSV
            </button>
          </div>
          <div className="space-y-1.5">
            {crmFiltered.slice(0, 100).map(r => (
              <button key={r.id} onClick={() => setSelectedUser(r)}
                className="w-full text-left bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 flex items-center gap-2.5 hover:bg-slate-700/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600/40 flex items-center justify-center text-xs font-black text-blue-300 flex-shrink-0">
                  {(r.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{r.name}</p>
                  <p className="text-[9px] text-slate-500">Nv {r.level} · {r.xp.toLocaleString()} XP · {r.msgs} msg</p>
                </div>
                {r.streak > 0 && <span className="text-[9px] text-orange-400 flex items-center gap-0.5 flex-shrink-0"><Flame size={9} />{r.streak}</span>}
                {r.claims.length > 0 && <span className="text-[9px] text-yellow-400 flex-shrink-0">🎟️{r.claims.length}</span>}
              </button>
            ))}
            {crmFiltered.length === 0 && <p className="text-[11px] text-slate-500 text-center py-6">{t('business.no_data')}</p>}
          </div>
        </div>
      )}

      {bizTab === 'coupons' && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500">{t('business.coupons_hint')}</p>
          {promos.length === 0 && <p className="text-[11px] text-slate-500 text-center py-6">{t('business.no_data')}</p>}
          {promos.map(p => {
            const n = claims.filter(c => c.code === p.code).length
            return (
              <div key={p.code} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-yellow-400" />
                  <span className="font-mono text-sm font-black text-yellow-300 tracking-widest">{p.code}</span>
                  <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${p.active ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {p.active ? '●' : '○'}
                  </span>
                </div>
                <p className="text-[11px] text-white font-bold mt-1">{p.label}</p>
                {p.description && <p className="text-[10px] text-slate-500">{p.description}</p>}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">{p.discount_text}</span>
                  <span className="text-xs font-black text-yellow-400">{n} {t('business.claimed')}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-600/40 flex items-center justify-center font-black text-blue-300">
                    {(selectedUser.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{selectedUser.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><Trophy size={9} className="text-yellow-400" /> Nivel {selectedUser.level}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-1.5 bg-slate-700 rounded-full hover:bg-slate-600">
                  <X size={14} className="text-slate-300" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [selectedUser.xp.toLocaleString(), 'XP'],
                  [selectedUser.msgs, t('business.crm_msgs')],
                  [selectedUser.sessions, t('business.crm_games')],
                  [selectedUser.best.toLocaleString(), t('business.crm_best')],
                  [selectedUser.clicks, t('business.crm_clicks')],
                  [`${selectedUser.streak}🔥`, t('business.crm_streak')],
                ].map(([v, l]) => (
                  <div key={l} className="bg-slate-900/60 rounded-xl py-2">
                    <div className="text-sm font-black text-white">{v}</div>
                    <div className="text-[9px] text-slate-500">{l}</div>
                  </div>
                ))}
              </div>
              {selectedUser.claims.length > 0 && (
                <div className="mt-2 text-[11px] text-slate-300">🎟️ {selectedUser.claims.join(', ')}</div>
              )}
              <p className="mt-2 text-[10px] text-slate-500">
                {t('business.crm_last')}: {selectedUser.last ? new Date(selectedUser.last).toLocaleDateString() : '—'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="bg-gradient-to-r from-blue-900/40 via-blue-800/20 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-200 font-semibold mb-1">{t('business.quote')}</p>
          <p className="text-xs text-slate-400">{t('business.footer')}</p>
        </div>
      </div>
    </div>
  )
}
