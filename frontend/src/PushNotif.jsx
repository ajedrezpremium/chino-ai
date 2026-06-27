import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Check, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export default function PushNotif({ supabase, user }) {
  const { t } = useTranslation()
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [browserSupported, setBrowserSupported] = useState(true)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setBrowserSupported(false)
      return
    }
    if (Notification.permission === 'granted') {
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    } catch {}
  }

  const subscribe = async () => {
    if (!user) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setLoading(false); return }
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: PUBLIC_VAPID_KEY || undefined
        })
      }
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: sub.endpoint,
        keys: sub.toJSON().keys,
        user_agent: navigator.userAgent
      }, { onConflict: 'endpoint' })
      setSubscribed(true)
    } catch {}
    setLoading(false)
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      if (user) {
        await supabase.from('push_subscriptions').delete().eq('user_id', user.id)
      }
      setSubscribed(false)
    } catch {}
    setLoading(false)
  }

  if (!browserSupported || !user) return null

  return (
    <button onClick={subscribed ? unsubscribe : subscribe} disabled={loading}
      className={`p-1.5 rounded-full transition-colors ${subscribed ? 'bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
      title={subscribed ? t('notif.disable') : t('notif.enable')}>
      {loading ? <Loader size={13} className="animate-spin" /> : subscribed ? <Bell size={13} /> : <BellOff size={13} />}
    </button>
  )
}
