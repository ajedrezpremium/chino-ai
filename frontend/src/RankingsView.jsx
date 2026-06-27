import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Shield, TrendingUp, Award, Users, Eye, Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PlayerCard from './PlayerCard'
import RewardsView from './RewardsView'

const playerRankingFallback = [
  { pos: 1, name: 'Iago Aspas', role: 'Dianteiro', era: '2008-', stats: '210 goles · 450 partidos · 85 asistencias', score: 9850, badge: 'Lenda' },
  { pos: 2, name: 'Alejandro Mostovoi', role: 'Centrocampista', era: '1996-2004', stats: '72 goles · 235 partidos · 45 asistencias', score: 9200, badge: 'O Zar' },
  { pos: 3, name: 'Míchel Salgado', role: 'Defensa', era: '1995-1999', stats: '18 goles · 290 partidos · 22 asistencias', score: 8800, badge: 'Muro' },
  { pos: 4, name: 'Gustavo López', role: 'Centrocampista', era: '1996-2002', stats: '45 goles · 250 partidos · 60 asistencias', score: 8500, badge: 'Máxico' },
  { pos: 5, name: 'Mazinho', role: 'Centrocampista', era: '1991-1995', stats: '25 goles · 180 partidos · 30 asistencias', score: 8100, badge: 'Campión 94' },
  { pos: 6, name: 'Manolo Rodríguez', role: 'Defensa', era: '1960-1975', stats: '12 goles · 512 partidos · 28 asistencias', score: 8000, badge: '512 partidos' },
  { pos: 7, name: 'Patxi Salinas', role: 'Defensa', era: '1988-1993', stats: '8 goles · 180 partidos · 10 asistencias', score: 7800, badge: 'Roca vasca' },
  { pos: 8, name: 'Fernando Veloso', role: 'Centrocampista', era: '1970-1978', stats: '38 goles · 240 partidos · 15 asistencias', score: 7600, badge: 'Elegancia' },
  { pos: 9, name: 'Valery Karpin', role: 'Centrocampista', era: '1997-2002', stats: '30 goles · 180 partidos · 40 asistencias', score: 7400, badge: 'Zar ruso' },
  { pos: 10, name: 'Nolito', role: 'Extremo', era: '2013-2016', stats: '39 goles · 103 partidos · 19 asistencias', score: 7300, badge: 'Internacional' },
  { pos: 11, name: 'Hugo Mallo', role: 'Defensa', era: '2012-2023', stats: '10 goles · 350 partidos · 30 asistencias', score: 7100, badge: 'Canteirán' },
  { pos: 12, name: 'Claude Makelele', role: 'Centrocampista', era: '1998-2000', stats: '4 goles · 70 partidos · 5 asistencias', score: 7000, badge: 'Lenda mundial' },
  { pos: 13, name: 'Silvinho', role: 'Defensa', era: '1999-2001', stats: '5 goles · 80 partidos · 15 asistencias', score: 6900, badge: 'Lateral fino' },
  { pos: 14, name: 'Catanha', role: 'Dianteiro', era: '1999-2002', stats: '45 goles · 120 partidos · 18 asistencias', score: 6800, badge: 'Goleador' },
  { pos: 15, name: 'Pahiño', role: 'Dianteiro', era: '1943-1949', stats: '80 goles · 150 partidos · 12 asistencias', score: 6700, badge: 'Lenda 40s' },
  { pos: 16, name: 'Benni McCarthy', role: 'Dianteiro', era: '1999-2002', stats: '40 goles · 95 partidos · 20 asistencias', score: 6600, badge: 'Potencia' },
  { pos: 17, name: 'Borja Iglesias', role: 'Dianteiro', era: '2025-', stats: '14 goles · 36 partidos · 2 asistencias', score: 6500, badge: '14 goles' },
  { pos: 18, name: 'Juanfran', role: 'Defensa', era: '1998-2005', stats: '5 goles · 200 partidos · 18 asistencias', score: 6400, badge: 'Consistencia' },
  { pos: 19, name: 'Brais Méndez', role: 'Centrocampista', era: '2018-2022', stats: '20 goles · 160 partidos · 25 asistencias', score: 6300, badge: 'Canteira' },
  { pos: 20, name: 'Gabriel Veiga', role: 'Centrocampista', era: '2022-2023', stats: '11 goles · 50 partidos · 4 asistencias', score: 6200, badge: '40M€' },
  { pos: 21, name: 'Sergio Álvarez', role: 'Portero', era: '2008-2019', stats: '0 goles · 250 partidos · 80 clean sheets', score: 6100, badge: 'Seguridade' },
  { pos: 22, name: 'Rubén Blanco', role: 'Portero', era: '2015-2023', stats: '0 goles · 120 partidos · 35 clean sheets', score: 6000, badge: 'Canteirán' },
  { pos: 23, name: 'Óscar Mingueza', role: 'Defensa', era: '2024-', stats: '3 goles · 36 partidos · 4 asistencias', score: 5900, badge: '18M€' },
  { pos: 24, name: 'Mauro Rodríguez', role: 'Dianteiro', era: '1950-1960', stats: '55 goles · 180 partidos · 10 asistencias', score: 5800, badge: 'Clásico' },
  { pos: 25, name: 'Lubo Penev', role: 'Dianteiro', era: '1994-1995', stats: '20 goles · 50 partidos · 5 asistencias', score: 5700, badge: 'Búlgaro' },
]

const coachRankingFallback = [
  { pos: 1, name: 'Víctor Fernández', era: '1998-2002', logros: '3 semifinais europeas · Era dourada', score: 9500 },
  { pos: 2, name: 'Eduardo Berizzo', era: '2014-2017', logros: 'Semifinais Europa League 2017 · 6º Liga', score: 8900 },
  { pos: 3, name: 'Claudio Giráldez', era: '2024-', logros: 'Cuartos UEFA · 6º LaLiga 2026 · Canteira', score: 8500 },
  { pos: 4, name: 'Carlos Aimar', era: '1993-1994', logros: 'Final de Copa 1994 · Subcampeón', score: 8200 },
  { pos: 5, name: 'Luis Enrique', era: '2013-2014', logros: 'Clasificación Champions · Europa League', score: 7900 },
  { pos: 6, name: 'Roque Olsen', era: '1959-1970', logros: '11 anos · Ascenso · Estilo ofensivo', score: 7700 },
  { pos: 7, name: 'Miguel Muñoz', era: '1968-1969', logros: 'Lenda do banquiño celeste', score: 7500 },
  { pos: 8, name: 'Eduardo Coudet', era: '2020-2022', logros: 'Salvación · Fútbol intenso · 8º Liga', score: 7300 },
  { pos: 9, name: 'José Ramón Fernández', era: '2002-2004', logros: 'UEFA · Estilo ofensivo · 5º Liga', score: 7100 },
  { pos: 10, name: 'Paco Herrera', era: '2011-2013', logros: 'Ascenso a Primeira 2012', score: 6900 },
  { pos: 11, name: 'Juan Carlos Unzué', era: '2017-2018', logros: 'Europa League · 13º Liga', score: 6700 },
  { pos: 12, name: 'Fernando Vázquez', era: '2005-2007', logros: 'Permanencia · Canteira · Salto', score: 6500 },
  { pos: 13, name: 'Rafa Benítez', era: '2023-2024', logros: 'Experiencia · 14º Liga', score: 6400 },
  { pos: 14, name: 'Luis Cid "Carriega"', era: '1974-1975', logros: 'Ascenso · Lendario', score: 6200 },
  { pos: 15, name: 'Pepe Villar', era: '1997-1998', logros: 'Ascenso a Primeira 1998', score: 6100 },
  { pos: 16, name: 'Fran Escribá', era: '2019-2020', logros: 'Salvación · 17º Liga', score: 6000 },
  { pos: 17, name: 'Juan Ramón López Caro', era: '2006-2007', logros: 'Clasificación Intertoto', score: 5900 },
  { pos: 18, name: 'Eusebio Sacristán', era: '2015-2016', logros: '6º Liga · Europa League', score: 5800 },
  { pos: 19, name: 'Abel Resino', era: '2012-2013', logros: 'Salvación · Última xornada', score: 5700 },
  { pos: 20, name: 'Óscar García', era: '2014-2015', logros: 'Estilo combinativo · Canteira', score: 5600 },
  { pos: 21, name: 'Juan Arza', era: '1972-1974', logros: 'Mantemento en Primeira', score: 5500 },
  { pos: 22, name: 'Laureano Ruiz', era: '1971-1972', logros: 'Lenda dos 70', score: 5400 },
  { pos: 23, name: 'Antonio Mohamed', era: '2018-2019', logros: '10º Liga · Europa League', score: 5300 },
  { pos: 24, name: 'Hristo Stoichkov', era: '2008-2009', logros: 'Balón de Ouro · Experimental', score: 5200 },
  { pos: 25, name: 'Juan Carlos Valerón', era: '2016-2017', logros: 'Lenda · Segundo adestrador', score: 5100 },
]

const fakeFans = [
  { id: 'fake-1', username: 'CelesteDeCorazón', score: 2840, questions_answered: 47 },
  { id: 'fake-2', username: 'OuveoDeBalaídos', score: 2510, questions_answered: 41 },
  { id: 'fake-3', username: 'MostovoiFan99', score: 2320, questions_answered: 38 },
  { id: 'fake-4', username: 'AspasEterno', score: 2100, questions_answered: 35 },
  { id: 'fake-5', username: 'CanteiránSempre', score: 1950, questions_answered: 32 },
  { id: 'fake-6', username: 'RíaDeVigo', score: 1820, questions_answered: 30 },
  { id: 'fake-7', username: 'GloriaCeleste', score: 1700, questions_answered: 28 },
  { id: 'fake-8', username: 'BalaídosFortín', score: 1550, questions_answered: 26 },
  { id: 'fake-9', username: 'MareCeleste', score: 1420, questions_answered: 24 },
  { id: 'fake-10', username: 'EuroCelta', score: 1310, questions_answered: 22 },
  { id: 'fake-11', username: 'XogadeCoña', score: 1200, questions_answered: 20 },
  { id: 'fake-12', username: 'Celta1923', score: 1100, questions_answered: 18 },
  { id: 'fake-13', username: 'ZonaProhibida', score: 1050, questions_answered: 17 },
  { id: 'fake-14', username: 'Mazinho10', score: 980, questions_answered: 16 },
  { id: 'fake-15', username: 'SalinasGol', score: 920, questions_answered: 15 },
  { id: 'fake-16', username: 'KarpinRuso', score: 850, questions_answered: 14 },
  { id: 'fake-17', username: 'MakeleleFan', score: 800, questions_answered: 13 },
  { id: 'fake-18', username: 'Veiga40M', score: 750, questions_answered: 12 },
  { id: 'fake-19', username: 'Méndez10', score: 700, questions_answered: 11 },
  { id: 'fake-20', username: 'MalloHugo', score: 650, questions_answered: 10 },
  { id: 'fake-21', username: 'GustavoLópez', score: 600, questions_answered: 9 },
  { id: 'fake-22', username: 'NolitoInternacional', score: 550, questions_answered: 8 },
  { id: 'fake-23', username: 'SilvinhoBrasil', score: 500, questions_answered: 7 },
  { id: 'fake-24', username: 'CatanhaGol', score: 450, questions_answered: 6 },
  { id: 'fake-25', username: 'PahiñoGoleador', score: 400, questions_answered: 5 },
]

const badgeColors = ['from-yellow-500 to-amber-600', 'from-slate-400 to-slate-500', 'from-amber-700 to-amber-800']
const badgeLabels = ['🥇', '🥈', '🥉']

export default function RankingsView({ supabase, user, onClose, initialTab = 'players' }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(initialTab)
  const [fans, setFans] = useState([])
  const [loadingFans, setLoadingFans] = useState(false)
  const [playerRanking, setPlayerRanking] = useState([])
  const [coachRanking, setCoachRanking] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    if (loaded || !supabase) return
    setLoaded(true)
    supabase.from('rankings_players').select('*').order('pos', { ascending: true }).then(({ data }) => {
      if (data?.length) {
        const seen = new Set()
        setPlayerRanking(data.filter(p => {
          const key = p.pos
          if (seen.has(key)) return false
          seen.add(key)
          return true
        }))
      } else setPlayerRanking(playerRankingFallback)
    }).catch(() => setPlayerRanking(playerRankingFallback))
    supabase.from('rankings_coaches').select('*').order('pos', { ascending: true }).then(({ data }) => {
      if (data?.length) {
        const seen = new Set()
        setCoachRanking(data.filter(c => {
          const key = c.pos
          if (seen.has(key)) return false
          seen.add(key)
          return true
        }))
      } else setCoachRanking(coachRankingFallback)
    }).catch(() => setCoachRanking(coachRankingFallback))
  }, [supabase, loaded])

  useEffect(() => {
    if (tab === 'fans' && supabase) {
      setLoadingFans(true)
      supabase.from('game_sessions')
        .select('id, score, questions_answered, user_id')
        .order('score', { ascending: false })
        .limit(20)
        .then(async ({ data: sessions }) => {
          if (!sessions || sessions.length === 0) {
            setFans(fakeFans)
            return
          }
          const userIds = [...new Set(sessions.map(s => s.user_id))]
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, username, display_name')
            .in('id', userIds)
          const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
          const realFans = sessions.map(s => ({
            ...s,
            username: profileMap[s.user_id]?.display_name || profileMap[s.user_id]?.username || null
          }))
          const combined = [...realFans, ...fakeFans.filter(f => realFans.length < 25)].slice(0, 25)
          setFans(combined)
          setLoadingFans(false)
        })
    }
  }, [tab, supabase])

  const fanName = (f) => {
    if (user && f.user_id === user.id) return t('rankings.you')
    if (f.username) return f.username
    return `${t('rankings.fan_default')} #${String(f.id).slice(-3)}`
  }

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
          <h2 className="text-xl font-black text-white">🏆 {t('rankings.title')}</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <Eye size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2 tab-scroll">
          <TabButton id="players" label={t('rankings.players')} icon={<Trophy size={14} className="inline mr-1" />} />
          <TabButton id="coaches" label={t('rankings.coaches')} icon={<Award size={14} className="inline mr-1" />} />
          <TabButton id="fans" label={t('rankings.fans')} icon={<Users size={14} className="inline mr-1" />} />
          <TabButton id="rewards" label="Premios" icon={<Gift size={14} className="inline mr-1" />} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {tab === 'players' && playerRanking.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
            onClick={() => setSelectedPlayer(p)}
            className={`bg-slate-800/80 border rounded-xl p-4 rank-card cursor-pointer transition-all hover:bg-slate-700/80 hover:border-blue-500/30 ${i < 3 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? `bg-gradient-to-br ${badgeColors[i]}` : 'bg-slate-700'}`}>
                {i < 3 ? badgeLabels[i] : `#${p.pos}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white truncate">{p.name}</h3>
                  <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded-full rank-badge">{p.badge || p.era}</span>
                </div>
                <p className="text-xs text-slate-400">{p.role} · {p.era}</p>
                <p className="text-[11px] text-blue-300 mt-0.5">{p.stats}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-400">{p.score}</div>
                <div className="text-[10px] text-slate-500">{t('rankings.pts')}</div>
              </div>
            </div>
          </motion.div>
        ))}

        {tab === 'coaches' && coachRanking.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
            className={`bg-slate-800/80 border rounded-xl p-4 rank-card ${i < 3 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? `bg-gradient-to-br ${badgeColors[i]}` : 'bg-slate-700'}`}>
                {i < 3 ? badgeLabels[i] : `#${c.pos}`}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full rank-badge">{c.era}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.logros}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-400">{c.score}</div>
                <div className="text-[10px] text-slate-500">{t('rankings.pts')}</div>
              </div>
            </div>
          </motion.div>
        ))}

        {tab === 'fans' && (
          <div className="text-center py-8 text-slate-400">
            <Users size={40} className="mx-auto mb-3 text-blue-400" />
            <p className="font-bold text-white text-lg">{t('rankings.fan_subtitle')}</p>
            <p className="text-sm mt-1">{t('rankings.fan_empty')}</p>
            <div className="mt-6 space-y-3 text-left">
              {loadingFans ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 flex items-center gap-3 bg-slate-800/80 border border-slate-700">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1"><div className="skeleton h-4 w-24 mb-1" /><div className="skeleton h-3 w-16" /></div>
                    <div className="text-right"><div className="skeleton h-5 w-12 mb-1" /><div className="skeleton h-3 w-8 ml-auto" /></div>
                  </div>
                ))
              ) : (fans.length > 0 ? fans : fakeFans).map((f, i) => (
                <div key={f.id} className={`rounded-xl p-4 flex items-center gap-3 ${user && f.user_id === user.id ? 'bg-blue-900/40 border border-blue-500/40' : 'bg-slate-800/80 border border-slate-700'}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center font-black text-blue-400">
                    {i < 3 ? badgeLabels[i] : `#${i + 1}`}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{fanName(f)}</p>
                      {user && f.user_id === user.id && <span className="text-[9px] bg-blue-600 text-white px-1.5 rounded-full font-bold">{t('rankings.is_you')}</span>}
                      {f.id?.toString().startsWith('fake-') && <span className="text-[9px] bg-slate-700 text-slate-400 px-1.5 rounded-full font-bold">{t('rankings.temporary')}</span>}
                    </div>
                    <p className="text-xs text-slate-400">{f.questions_answered || 0} {t('gamer.questions')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-yellow-400">{f.score || 0}</div>
                    <div className="text-[10px] text-slate-500">{t('rankings.pts')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'rewards' && (
          <RewardsView supabase={supabase} user={user} />
        )}

        {tab !== 'rewards' && (
          <p className="text-center text-[10px] text-slate-600 pt-2 pb-20">
            {t('rankings.footer')}
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPlayer(null)}
          >
            <div onClick={e => e.stopPropagation()}>
              <PlayerCard player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
