import React, { useState } from 'react'
import { ArrowLeft, History, Table2, Swords, ExternalLink, Search, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import MatchesView from './MatchesView'
import { LIGA_TEAMS_2526, LIGA_2526_NOTES, LIGA_2627_SNAPSHOT, LIGA_LIVE_LINKS } from './liga-data'

const zoneStyles = {
  champions: 'border-l-2 border-l-blue-500',
  europa: 'border-l-2 border-l-orange-500',
  conference: 'border-l-2 border-l-green-500',
  relegation: 'border-l-2 border-l-red-500',
}

const zoneBadge = {
  champions: 'UCL',
  europa: 'UEL',
  conference: 'UECL',
  relegation: 'DES',
}

function LeagueTable() {
  const { t } = useTranslation()
  const [season, setSeason] = useState('2026-27')
  const [search, setSearch] = useState('')

  const rows = season === '2025-26'
    ? LIGA_TEAMS_2526.filter(r => r.team.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div className="flex flex-col min-h-0 lg:h-full">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setSeason('2026-27')}
          className={`flex-1 text-[11px] py-1.5 rounded-full font-bold transition-colors ${season === '2026-27' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          2026-27
        </button>
        <button onClick={() => setSeason('2025-26')}
          className={`flex-1 text-[11px] py-1.5 rounded-full font-bold transition-colors ${season === '2025-26' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          2025-26
        </button>
      </div>

      {season === '2025-26' ? (
        <>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('historial.search_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 rounded-full pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
          </div>
          <p className="text-[10px] text-slate-500 mb-2">Táboa final oficial · {LIGA_2526_NOTES.champion} · O Celta, 6º → Europa League</p>
          <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-800 text-slate-400 uppercase text-[9px]">
                  <th className="px-2 py-1.5 text-left">#</th>
                  <th className="px-2 py-1.5 text-left">{t('historial.team')}</th>
                  <th className="px-1.5 py-1.5 text-center">{t('historial.played')}</th>
                  <th className="px-1.5 py-1.5 text-center">{t('historial.won')}</th>
                  <th className="px-1.5 py-1.5 text-center">{t('historial.drawn')}</th>
                  <th className="px-1.5 py-1.5 text-center">{t('historial.lost')}</th>
                  <th className="px-1.5 py-1.5 text-center hidden sm:table-cell">{t('historial.gd')}</th>
                  <th className="px-2 py-1.5 text-center font-black">{t('historial.points')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const isCelta = r.team === 'RC Celta'
                  return (
                    <tr key={r.pos} className={`${isCelta ? 'bg-blue-900/40 font-bold' : 'bg-slate-800/40'} border-t border-slate-700/30 ${zoneStyles[r.zone] || ''}`}>
                      <td className="px-2 py-1.5 text-slate-400">{r.pos}</td>
                      <td className={`px-2 py-1.5 truncate max-w-[110px] ${isCelta ? 'text-blue-300' : 'text-white'}`}>
                        {isCelta ? '★ ' : ''}{r.team}
                        {r.zone && <span className="ml-1 text-[8px] text-slate-500">{zoneBadge[r.zone]}</span>}
                      </td>
                      <td className="px-1.5 py-1.5 text-center text-slate-400">{r.p}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-300">{r.w}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-400">{r.d}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-400">{r.l}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-400 hidden sm:table-cell">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                      <td className={`px-2 py-1.5 text-center font-black ${isCelta ? 'text-blue-300' : 'text-yellow-400'}`}>{r.pts}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 text-[9px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Champions (1-5)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Europa League (6º + Copa)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Conference (7º)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Descenso</span>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-800/40 border border-blue-500/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className="text-yellow-400" />
              <p className="text-xs font-bold text-white">Líder: {LIGA_2627_SNAPSHOT.leader}</p>
            </div>
            <p className="text-[10px] text-slate-400">{LIGA_2627_SNAPSHOT.updated}</p>
          </div>
          {[
            { label: 'Champions', teams: LIGA_2627_SNAPSHOT.championsZone, color: 'text-blue-400', dot: 'bg-blue-500' },
            { label: 'Europa League', teams: LIGA_2627_SNAPSHOT.europaZone, color: 'text-orange-400', dot: 'bg-orange-500' },
            { label: 'Conference', teams: LIGA_2627_SNAPSHOT.conferenceZone, color: 'text-green-400', dot: 'bg-green-500' },
            { label: 'Descenso', teams: LIGA_2627_SNAPSHOT.relegationZone, color: 'text-red-400', dot: 'bg-red-500' },
          ].map(z => (
            <div key={z.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5">
              <p className={`text-[10px] font-bold mb-1 flex items-center gap-1.5 ${z.color}`}>
                <span className={`w-2 h-2 rounded-full inline-block ${z.dot}`} />{z.label}
              </p>
              <p className="text-[11px] text-slate-300">{z.teams.join(' · ')}</p>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 leading-relaxed">{LIGA_2627_SNAPSHOT.note}</p>
          <div className="space-y-1.5">
            {LIGA_LIVE_LINKS.map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2">
                <ExternalLink size={12} /> {l.label} — clasificación en directo
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistorialView({ supabase, onClose }) {
  const { t } = useTranslation()
  const [panel, setPanel] = useState('matches')

  return (
    <main className="flex-1 overflow-y-auto z-10 lg:overflow-hidden">
      <div className="p-4 pb-24 lg:pb-4 lg:h-full lg:flex lg:flex-col">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-blue-400">{t('historial.title')}</h2>
              <p className="text-[10px] text-slate-400">{t('historial.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-3 lg:hidden">
          <button onClick={() => setPanel('matches')}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${panel === 'matches' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            <Swords size={14} className="inline mr-1" />{t('historial.partido_a_partido')}
          </button>
          <button onClick={() => setPanel('table')}
            className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${panel === 'table' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
            <Table2 size={14} className="inline mr-1" />{t('historial.clasificacion_liga')}
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:flex-1 lg:min-h-0">
          <div className={`${panel === 'matches' ? '' : 'hidden'} lg:block lg:min-h-0 lg:h-full lg:overflow-hidden lg:flex lg:flex-col bg-slate-900/40 lg:rounded-2xl lg:border lg:border-slate-700/30 lg:p-2`}>
            <p className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300 px-2 pt-1 pb-2">
              <Swords size={13} className="text-blue-400" />{t('historial.partido_a_partido')}
            </p>
            <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:flex lg:flex-col">
              <MatchesView supabase={supabase} onClose={onClose} embedded />
            </div>
          </div>
          <div className={`${panel === 'table' ? '' : 'hidden'} lg:block lg:min-h-0 lg:h-full lg:overflow-y-auto bg-slate-900/40 lg:rounded-2xl lg:border lg:border-slate-700/30 lg:p-3`}>
            <p className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300 pb-2">
              <Table2 size={13} className="text-yellow-400" />{t('historial.clasificacion_liga')}
            </p>
            <LeagueTable />
          </div>
        </div>
      </div>
    </main>
  )
}
