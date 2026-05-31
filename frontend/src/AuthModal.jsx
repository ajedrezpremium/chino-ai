import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader, Send, Key, AtSign, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AuthModal({ supabase, onClose }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const showError = (msg) => { setMessage(msg); setMessageType('error') }
  const showSuccess = (msg) => { setMessage(msg); setMessageType('success') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          const msg = error.message.toLowerCase()
          if (msg.includes('invalid login') || msg.includes('invalid credentials')) throw new Error(t('auth.error_invalid'))
          if (msg.includes('email not confirmed')) throw new Error(t('auth.error_confirmed'))
          throw new Error(error.message)
        }
        onClose()
      } else {
        const username = email.split('@')[0]
        const { data: signUpData, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        })
        if (error) {
          if (error.message?.includes('already registered')) throw new Error(t('auth.error_registered'))
          throw new Error(error.message)
        }
        if (signUpData?.user?.identities?.length === 0) {
          showError(t('auth.error_registered'))
          setMode('login')
        } else if (signUpData?.session) {
          try {
            await supabase.from('user_profiles').upsert({
              id: signUpData.user.id,
              username,
              display_name: username
            })
          } catch {}
          onClose()
        } else {
          try {
            await supabase.from('user_profiles').upsert({
              id: signUpData.user.id,
              username,
              display_name: username
            })
          } catch {}
          showSuccess(t('auth.success_created'))
          setMode('login')
        }
      }
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { showError(error.message); setLoading(false) }
  }

  const handleMagicLink = async () => {
    if (!email.trim()) { showError(t('auth.enter_email')); return }
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) { showError(error.message); setLoading(false); return }
    showSuccess(t('auth.magic_sent'))
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-blue-600/30 border-2 border-blue-400/30 overflow-hidden">
            <img src="/chino-avatar.png" alt="" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-black text-white">{t('app.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">{mode === 'login' ? t('auth.login_title') : t('auth.signup_title')}</p>
        </div>

        {/* Mensaxes de feedback */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs text-center font-medium ${messageType === 'error' ? 'bg-red-900/50 text-red-300 border border-red-700/50' : 'bg-green-900/50 text-green-300 border border-green-700/50'}`}>
            {message}
          </div>
        )}

        {/* Formulario email + contrasinal */}
        {mode !== 'magic' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t('auth.email')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required={mode === 'signup'} placeholder={t('auth.password')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading && <Loader size={16} className="animate-spin" />}
              {mode === 'login' ? t('auth.login_btn') : t('auth.signup_btn')}
            </button>
          </form>
        )}

        {/* Formulario solo email para Magic Link */}
        {mode === 'magic' && (
          <div className="space-y-3">
            <div className="bg-slate-900/70 rounded-xl p-3 border border-blue-800/40">
              <p className="text-xs text-blue-300 font-medium mb-1">{t('auth.what_is_magic')}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t('auth.magic_desc')}</p>
            </div>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t('auth.email')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={handleMagicLink} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader size={16} className="animate-spin" /> : <Send size={14} />}
              {loading ? t('auth.sending') : t('auth.magic_title')}
            </button>
          </div>
        )}

        {/* Separador - só mostrar se hai formulario visible */}
        {mode !== 'magic' && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center"><span className="bg-slate-800 px-3 text-[10px] text-slate-500">{t('auth.or')}</span></div>
          </div>
        )}

        {/* Google + Magic Link (só se non estamos en modo magic) */}
        {mode !== 'magic' && (
          <>
            <button onClick={handleGoogle}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              disabled={loading}>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t('auth.google_btn')}
            </button>
            <button onClick={() => { setMode('magic'); setMessage('') }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              <Send size={14} /> {t('auth.magic_link')}
            </button>
          </>
        )}

        {/* Volver do modo magic */}
        {mode === 'magic' && (
          <button onClick={() => { setMode('login'); setMessage('') }}
            className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
            {t('auth.back')}
          </button>
        )}

        <p className="text-xs text-slate-500 text-center mt-4">
          {mode === 'login' ? t('auth.no_account') : mode === 'signup' ? t('auth.has_account') : ''}
          {mode !== 'magic' && (
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }} className="text-blue-400 hover:underline">
              {mode === 'login' ? t('auth.signup_link') : t('auth.login_link')}
            </button>
          )}
        </p>
      </motion.div>
    </motion.div>
  )
}
