import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Trophy, Calendar, Settings, LogOut, ShoppingBag, Ticket, Gamepad2, Star, Clock, Target, Volume2, ChevronRight } from 'lucide-react'

export default function ProfileView({ supabase, user, agentGender, setAgentGender, speak, onClose }) {
  const [profile, setProfile] = useState(null)
  const [gamerStats, setGamerStats] = useState({ total: 0, best: 0, totalPoints: 0 })
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
    loadGamerStats()
  }, [user?.id])

  const loadProfile = async () => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
    if (data) { setProfile(data); setDisplayName(data.display_name || data.username || 'Siareiro') }
  }

  const loadGamerStats = async () => {
    const { data } = await supabase.from('game_sessions').select('score').eq('user_id', user.id)
    if (data?.length) {
      setGamerStats({
        total: data.length,
        best: Math.max(...data.map(s => s.score)),
        totalPoints: data.reduce((sum, s) => sum + (s.score || 0), 0)
      })
    }
  }

  const saveProfile = async () => {
    if (!displayName.trim()) return
    await supabase.from('user_profiles').upsert({ id: user.id, username: displayName, display_name: displayName })
    setProfile(p => ({ ...p, display_name: displayName, username: displayName }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setEditing(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (onClose) onClose()
  }

  const initials = (profile?.display_name || user?.email || '?').charAt(0).toUpperCase()

  const quickLinks = [
    { label: 'Tenda Oficial', icon: <ShoppingBag size={16} />, link: 'https://shop.rccelta.es', color: 'from-blue-600 to-blue-800' },
    { label: 'Entradas', icon: <Ticket size={16} />, link: 'https://rccelta.es/entradas', color: 'from-yellow-500 to-amber-700' },
    { label: 'Carnet Celtista', icon: <Star size={16} />, link: 'https://rccelta.es/celtismo/celtistas', color: 'from-green-600 to-green-800' },
    { label: 'Chiño Gamer', icon: <Gamepad2 size={16} />, link: null, action: () => onClose && onClose('gamer'), color: 'from-purple-600 to-purple-800' },
  ]

  return (
    <div className="flex-1 overflow-y-auto z-10 pb-4">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><User size={18} /> O meu Perfil</h2>
          {onClose && (
            <button onClick={() => onClose()} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 text-xs">Pechar</button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Tarxeta de usuario */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black text-white border-2 border-white/40">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex gap-2">
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-sm text-white w-full focus:outline-none focus:border-white/60"
                    placeholder="O teu nome" autoFocus />
                  <button onClick={saveProfile} className="bg-white text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">Gardar</button>
                  <button onClick={() => setEditing(false)} className="text-white/70 text-xs px-2">X</button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white truncate">{profile?.display_name || user?.email?.split('@')[0] || 'Siareiro'}</h3>
                  <p className="text-xs text-blue-200 truncate">{user?.email}</p>
                  <p className="text-[10px] text-blue-300/70 mt-0.5">
                    Membro desde {new Date(user?.created_at || Date.now()).toLocaleDateString('gl-ES', { month: 'long', year: 'numeric' })}
                  </p>
                </>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-white/60 hover:text-white">
                <Settings size={16} />
              </button>
            )}
          </div>
          {saved && <p className="text-xs text-green-300 mt-2 text-center font-medium">✅ Gardado!</p>}
        </motion.div>

        {/* Estadísticas Gamer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-yellow-400" />
            <h3 className="font-bold text-white text-sm">Chiño Gamer</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-blue-400">{gamerStats.total}</p>
              <p className="text-[10px] text-slate-400">Partidas</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-yellow-400">{gamerStats.best}</p>
              <p className="text-[10px] text-slate-400">Mellor</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-400">{gamerStats.totalPoints}</p>
              <p className="text-[10px] text-slate-400">Puntos totais</p>
            </div>
          </div>
        </motion.div>

        {/* Configuración rápida */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} className="text-slate-400" />
            <h3 className="font-bold text-white text-sm">Preferencias</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{agentGender === 'male' ? '👨' : '👩'}</span>
                <span className="text-sm text-white">Xénero do axente</span>
              </div>
              <button onClick={() => setAgentGender(g => g === 'male' ? 'female' : 'male')}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${agentGender === 'male' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>
                {agentGender === 'male' ? 'Chiño' : 'Chiña'}
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Volume2 size={14} className="text-slate-400" />
                <span className="text-sm text-white">Voz</span>
              </div>
              <button onClick={() => speak('Ola! Son Chiño, o teu colega celeste', agentGender)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-full transition-colors">
                Probar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Experiencias do club */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-yellow-400" />
            <h3 className="font-bold text-white text-sm">Experiencias</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((item, i) => (
              item.link ? (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                  className={`bg-gradient-to-r ${item.color} rounded-xl p-3 flex items-center gap-2 hover:opacity-90 transition-opacity`}>
                  <span className="text-white">{item.icon}</span>
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  <ChevronRight size={12} className="text-white/60 ml-auto" />
                </a>
              ) : (
                <button key={i} onClick={item.action}
                  className={`bg-gradient-to-r ${item.color} rounded-xl p-3 flex items-center gap-2 hover:opacity-90 transition-opacity text-left`}>
                  <span className="text-white">{item.icon}</span>
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  <ChevronRight size={12} className="text-white/60 ml-auto" />
                </button>
              )
            ))}
          </div>
        </motion.div>

        {/* Plan de abono */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-blue-400" />
            <h3 className="font-bold text-white text-sm">Plan de Abonado</h3>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-2">Aínda non tes un plan de abonado vinculado</p>
            <a href="https://rccelta.es/celtismo/celtistas" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors">
              Ver plans de abonado
            </a>
          </div>
        </motion.div>

        {/* Peche de sesión */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button onClick={handleSignOut}
            className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <LogOut size={14} /> Pechar sesión
          </button>
        </motion.div>

        <p className="text-center text-[10px] text-slate-600 pb-10">Chiño AI © 2026 — Real Club Celta de Vigo</p>
      </div>
    </div>
  )
}
