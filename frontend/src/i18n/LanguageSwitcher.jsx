import React from 'react'
import { useTranslation } from 'react-i18next'

export const GaliciaFlag = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className}>
    <rect width="3" height="2" fill="#fff"/>
    <polygon points="0,0 0.45,0 3,1.55 3,2 2.55,2 0,0.45" fill="#0398cf"/>
  </svg>
)

export const SpainFlag = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className}>
    <rect width="3" height="2" fill="#c60b1e"/>
    <rect y="0.5" width="3" height="1" fill="#ffc400"/>
  </svg>
)

export const UKFlag = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className}>
    <rect width="3" height="2" fill="#012169"/>
    <path d="M0,0 L3,2 M3,0 L0,2" stroke="#fff" strokeWidth="0.6"/>
    <path d="M0,0 L3,2 M3,0 L0,2" stroke="#c60b1e" strokeWidth="0.25"/>
    <rect width="3" height="0.25" fill="#fff" y="0.875"/>
    <rect width="3" height="0.25" fill="#c60b1e" y="0.9"/>
    <rect x="1.375" width="0.25" height="2" fill="#fff"/>
    <rect x="1.4" width="0.25" height="2" fill="#c60b1e"/>
  </svg>
)

export default function LanguageSwitcher({ onSelect, landing }) {
  const { i18n, t } = useTranslation()

  const langs = [
    { code: 'gl', flag: <GaliciaFlag className="inline-block w-5 h-4 align-middle" />, flagBig: <GaliciaFlag className="w-16 h-12" />, color: 'border-blue-500 hover:bg-blue-600/20' },
    { code: 'es', flag: <SpainFlag className="inline-block w-5 h-4 align-middle" />, flagBig: <SpainFlag className="w-16 h-12" />, color: 'border-yellow-500 hover:bg-yellow-600/20' },
    { code: 'en', flag: <UKFlag className="inline-block w-5 h-4 align-middle" />, flagBig: <UKFlag className="w-16 h-12" />, color: 'border-red-500 hover:bg-red-600/20' },
  ]

  const handleSelect = (code) => {
    i18n.changeLanguage(code)
    if (onSelect) onSelect(code)
  }

  const current = i18n.language?.startsWith('gl') ? 'gl' : i18n.language?.startsWith('es') ? 'es' : 'en'

  if (landing) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-1">{t('landing.language_title')}</h2>
          <p className="text-sm text-slate-400">{t('landing.language_sub')}</p>
        </div>
        <div className="flex gap-4">
          {langs.map(l => (
            <button key={l.code} onClick={() => handleSelect(l.code)}
              className={`flex flex-col items-center gap-2 bg-slate-800/80 border-2 ${current === l.code ? l.color + ' border-opacity-100' : 'border-slate-700 hover:border-slate-500'} rounded-2xl px-6 py-5 transition-all min-w-[120px]`}>
              <span className="flex items-center justify-center h-12">{l.flagBig}</span>
              <span className={`text-sm font-bold ${current === l.code ? 'text-white' : 'text-slate-400'}`}>{t(`landing.${l.code}`)}</span>
              {current === l.code && <span className="text-[10px] text-blue-400 font-bold">✓</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-1 items-center">
      {langs.map(l => (
        <button key={l.code} onClick={() => handleSelect(l.code)}
          className={`text-[10px] px-1.5 py-1 rounded transition-colors flex items-center gap-1 ${current === l.code ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          <span className="flex items-center">{l.flag}</span>
          <span>{t(`landing.${l.code}`)}</span>
        </button>
      ))}
    </div>
  )
}
