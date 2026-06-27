import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Star, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const parseStats = (statsStr) => {
  const g = statsStr.match(/(\d+)\s*goles/i)
  const a = statsStr.match(/(\d+)\s*asistencias/i)
  const p = statsStr.match(/(\d+)\s*partidos/i)
  return {
    goles: g ? parseInt(g[1]) : 0,
    asistencias: a ? parseInt(a[1]) : 0,
    partidos: p ? parseInt(p[1]) : 0
  }
}

const computeRadar = (player) => {
  const parsed = parseStats(player.stats || '')
  const score = player.score || 5000
  const maxGoals = 210, maxAssists = 85, maxMatches = 512, maxScore = 9850

  const goles = Math.min(parsed.goles / maxGoals, 1)
  const asistencias = Math.min(parsed.asistencias / maxAssists, 1)
  const partidos = Math.min(parsed.partidos / maxMatches, 1)
  const trofeos = Math.min(score / maxScore, 1)
  const liderazgo = player.badge && /capitán|lenda|muro|zar/i.test(player.badge) ? 0.9 : 0.5 + (score / maxScore) * 0.4
  const longevidad = (() => {
    const era = player.era || ''
    const m = era.match(/(\d{4})/g)
    if (m && m.length >= 2) return Math.min((parseInt(m[m.length - 1]) - parseInt(m[0])) / 20, 1)
    return 0.5
  })()

  return { goles, asistencias, partidos, trofeos, liderazgo, longevidad }
}

const RADAR_LABELS = ['goles', 'asistencias', 'partidos', 'trofeos', 'liderazgo', 'longevidad']

const RadarChart = ({ values, size = 160 }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.4
  const angles = RADAR_LABELS.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / RADAR_LABELS.length)

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const gridPolygons = gridLevels.map(level =>
    angles.map(a => `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`).join(' ')
  )

  const axes = angles.map(a => ({ x1: cx, y1: cy, x2: cx + r * Math.cos(a), y2: cy + r * Math.sin(a) }))
  const labels = angles.map((a, i) => {
    const lx = cx + (r + 24) * Math.cos(a)
    const ly = cy + (r + 24) * Math.sin(a)
    const anchor = a > -0.1 && a < Math.PI - 0.1 ? 'start' : a < -Math.PI + 0.1 || a > Math.PI - 0.1 ? 'end' : 'middle'
    const dy = a > -0.1 && a < 0.1 ? '-0.3em' : a > Math.PI - 0.1 || a < -Math.PI + 0.1 ? '-0.3em' : '0.3em'
    return { x: lx, y: ly, anchor, dy, label: RADAR_LABELS[i] }
  })

  const dataPoints = angles.map((a, i) => ({
    x: cx + r * (values[i] ?? 0.5) * Math.cos(a),
    y: cy + r * (values[i] ?? 0.5) * Math.sin(a)
  }))
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={1} />
      ))}
      {axes.map((a, i) => (
        <line key={i} {...a} stroke="rgba(148,163,184,0.15)" strokeWidth={1} />
      ))}
      <polygon points={polygon} fill="rgba(59,130,246,0.25)" stroke="rgba(59,130,246,0.8)" strokeWidth={2} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} dy={l.dy}
          className="fill-slate-400 text-[9px] font-medium" style={{ fontFamily: 'system-ui' }}>
          {l.label}
        </text>
      ))}
    </svg>
  )
}

const RatingCircle = ({ value, max = 100, size = 64 }) => {
  const pct = Math.min(value / max, 1)
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct > 0.8 ? '#22c55e' : pct > 0.6 ? '#3b82f6' : pct > 0.4 ? '#eab308' : '#ef4444'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="fill-white font-black text-sm">
        {Math.round(pct * 100)}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" className="fill-slate-400 text-[7px]">
        OVR
      </text>
    </svg>
  )
}

const statsConfig = [
  { key: 'goles', label: 'Goles', color: '#3b82f6' },
  { key: 'asistencias', label: 'Asistencias', color: '#22c55e' },
  { key: 'partidos', label: 'Partidos', color: '#eab308' },
  { key: 'trofeos', label: 'Trofeos', color: '#a855f7' },
  { key: 'liderazgo', label: 'Liderazgo', color: '#ec4899' },
  { key: 'longevidad', label: 'Longevidad', color: '#f97316' },
]

export default function PlayerCard({ player, onClose }) {
  const { t } = useTranslation()
  const radar = useMemo(() => computeRadar(player), [player])
  const radarValues = [radar.goles, radar.asistencias, radar.partidos, radar.trofeos, radar.liderazgo, radar.longevidad]
  const overall = Math.round((radarValues.reduce((a, b) => a + b, 0) / radarValues.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-2xl shadow-blue-900/30 max-w-sm mx-auto"
    >
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-slate-700/80 rounded-full hover:bg-slate-600 transition-colors z-10">
          <X size={14} className="text-slate-400" />
        </button>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30">
          {player.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg leading-tight truncate">{player.name}</h3>
          <p className="text-xs text-slate-400">{player.role} · {player.era}</p>
          {player.badge && (
            <span className="inline-block mt-1 text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full font-medium">
              {player.badge}
            </span>
          )}
        </div>
        <RatingCircle value={overall} size={60} />
      </div>

      <div className="flex justify-center mb-4">
        <RadarChart values={radarValues} size={170} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {statsConfig.map(s => {
          const val = radar[s.key]
          return (
            <div key={s.key} className="bg-slate-800/60 rounded-lg p-2 text-center">
              <div className="text-sm font-black" style={{ color: s.color }}>{Math.round(val * 100)}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
          <Shield size={10} /> <span>{t('player_card.stats_detail') || 'Estadísticas'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{player.stats}</p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><Star size={10} /> {player.score || 0} pts</span>
        <span className="flex items-center gap-1"><TrendingUp size={10} /> #{player.pos || '-'} {t('rankings.players')}</span>
      </div>
    </motion.div>
  )
}
