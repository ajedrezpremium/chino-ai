import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher({ onSelect, landing }) {
  const { i18n, t } = useTranslation()

  const langs = [
    { code: 'gl', flag: '🇪🇸', color: 'border-blue-500 hover:bg-blue-600/20' },
    { code: 'es', flag: '🇪🇸', color: 'border-yellow-500 hover:bg-yellow-600/20' },
    { code: 'en', flag: '🇬🇧', color: 'border-red-500 hover:bg-red-600/20' },
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
              <span className="text-4xl">{l.flag}</span>
              <span className={`text-sm font-bold ${current === l.code ? 'text-white' : 'text-slate-400'}`}>{t(`landing.${l.code}`)}</span>
              {current === l.code && <span className="text-[10px] text-blue-400 font-bold">✓</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      {langs.map(l => (
        <button key={l.code} onClick={() => handleSelect(l.code)}
          className={`text-[10px] px-1.5 py-1 rounded transition-colors ${current === l.code ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          {l.flag} {t(`landing.${l.code}`)}
        </button>
      ))}
    </div>
  )
}
