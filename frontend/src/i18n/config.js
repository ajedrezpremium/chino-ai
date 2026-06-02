import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import gl from './locales/gl.json'
import es from './locales/es.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { gl: { translation: gl }, es: { translation: es }, en: { translation: en } },
    fallbackLng: 'es',
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    supportedLngs: ['gl', 'es', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'chino_lang',
      caches: ['localStorage'],
    },
  })

export default i18n
