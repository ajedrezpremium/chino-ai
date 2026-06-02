import React from 'react'

const players = [
  { name: 'Cañizares', short: 'CAÑ', pos: 'POR', color: 'bg-yellow-400/90', border: 'border-yellow-300', text: 'text-slate-900', top: 'top-3', side: 'center' },
  { name: 'Míchel Salgado', short: 'MÍCH', pos: 'LD', color: 'bg-blue-500/90', border: 'border-blue-400', text: 'text-white', top: 'top-[18%]', side: 'left-2' },
  { name: 'Cáceres', short: 'CÁC', pos: 'DFC', color: 'bg-blue-600/90', border: 'border-blue-500', text: 'text-white', top: 'top-[18%]', side: 'left-[30%]' },
  { name: 'Berizzo', short: 'BERI', pos: 'DFC', color: 'bg-blue-600/90', border: 'border-blue-500', text: 'text-white', top: 'top-[18%]', side: 'right-[30%]' },
  { name: 'Hugo Mallo', short: 'H.MA', pos: 'LI', color: 'bg-blue-500/90', border: 'border-blue-400', text: 'text-white', top: 'top-[18%]', side: 'right-2' },
  { name: 'Karpin', short: 'KARP', pos: 'MC', color: 'bg-sky-500/90', border: 'border-sky-400', text: 'text-white', top: 'top-[38%]', side: 'left-[8%]' },
  { name: 'Mazinho', short: 'MAZI', pos: 'MC', color: 'bg-sky-400/90', border: 'border-sky-300', text: 'text-white', top: 'top-[38%]', side: 'center' },
  { name: 'Mostovoi', short: 'MOST', pos: 'MC', color: 'bg-sky-500/90', border: 'border-sky-400', text: 'text-white', top: 'top-[38%]', side: 'right-[8%]' },
  { name: 'Iago Aspas', short: 'ASP', pos: 'EI', color: 'bg-emerald-500/90', border: 'border-emerald-400', text: 'text-white', top: 'top-[58%]', side: 'left-[8%]' },
  { name: 'Catanha', short: 'CAT', pos: 'DC', color: 'bg-emerald-400/90', border: 'border-emerald-300', text: 'text-slate-900', top: 'top-[58%]', side: 'center' },
  { name: 'Pahiño', short: 'PAHI', pos: 'ED', color: 'bg-emerald-500/90', border: 'border-emerald-400', text: 'text-white', top: 'top-[58%]', side: 'right-[8%]' },
]

export default function PitchXI({ compact }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-green-700/50 ${compact ? 'w-full max-w-[280px]' : 'w-full max-w-[360px]'}`}
      style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)', aspectRatio: '3/4' }}>
      {/* Pitch lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
        <rect x="4" y="4" width="292" height="392" rx="4" fill="none" stroke="white" strokeWidth="1"/>
        <line x1="4" y1="200" x2="296" y2="200" stroke="white" strokeWidth="1"/>
        <circle cx="150" cy="200" r="25" fill="none" stroke="white" strokeWidth="0.8"/>
        <rect x="105" y="8" width="90" height="115" rx="2" fill="none" stroke="white" strokeWidth="0.7"/>
        <rect x="105" y="277" width="90" height="115" rx="2" fill="none" stroke="white" strokeWidth="0.7"/>
      </svg>
      {/* Players */}
      {players.map((p, i) => (
        <div key={i} className={`absolute ${p.top} ${p.side} flex flex-col items-center`}
          style={{ transform: 'translateX(-50%)', left: p.side === 'center' ? '50%' : p.side.startsWith('left') ? '15%' : p.side.startsWith('right') ? '85%' : undefined }}>
          <div className={`w-10 h-10 ${compact ? 'w-8 h-8' : ''} rounded-full ${p.color} ${p.border} border-2 flex items-center justify-center ${p.text} font-black text-[9px] ${compact ? 'text-[7px]' : ''} shadow-lg`}>
            {p.short}
          </div>
          {!compact && <span className="text-[7px] font-bold text-white mt-0.5 bg-slate-900/80 px-1.5 py-0.5 rounded-full whitespace-nowrap">{p.name}</span>}
        </div>
      ))}
      <div className="absolute bottom-1 right-1.5 text-[6px] text-white/20 font-bold">CHIÑO AI</div>
    </div>
  )
}
