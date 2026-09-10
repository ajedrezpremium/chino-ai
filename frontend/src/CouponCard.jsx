import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CouponCard({ code, supabase, user, onClaim }) {
  const { t } = useTranslation()
  const [promo, setPromo] = useState(null)
  const [copied, setCopied] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!supabase || !code) return
    supabase.from('promo_codes').select('*').eq('code', code).eq('active', true).single()
      .then(({ data }) => { if (data) setPromo(data) })
      .catch(() => {})
    if (user?.id) {
      supabase.from('coupon_claims').select('id').eq('user_id', user.id).eq('code', code).limit(1)
        .then(({ data }) => { if (data?.length) setClaimed(true) })
        .catch(() => {})
    }
  }, [supabase, code, user?.id])

  const copy = () => {
    try { navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) } catch {}
  }

  const claim = async () => {
    if (!user?.id || !supabase || claiming || claimed) return
    setClaiming(true)
    try {
      const { error } = await supabase.from('coupon_claims').insert({ user_id: user.id, code })
      if (!error) { setClaimed(true); onClaim?.() }
    } catch {}
    setClaiming(false)
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Ticket size={14} className="text-yellow-400" />
        <span className="text-xs font-bold text-yellow-300">{promo?.label || t('coupon.title')}</span>
        {promo?.discount_text && (
          <span className="ml-auto text-[10px] font-black bg-yellow-600 text-white px-2 py-0.5 rounded-full">{promo.discount_text}</span>
        )}
      </div>
      {promo?.description && <p className="text-[10px] text-slate-400 mb-2">{promo.description}</p>}
      <div className="flex items-center gap-2">
        <button onClick={copy}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900/60 border border-dashed border-yellow-500/50 rounded-lg px-2 py-1.5 font-mono text-sm font-black text-yellow-300 tracking-widest">
          {code}
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-slate-500" />}
        </button>
        {user && (
          <button onClick={claim} disabled={claiming || claimed}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${claimed ? 'bg-green-900/50 text-green-400' : 'bg-yellow-600 hover:bg-yellow-500 text-white'} disabled:opacity-70`}>
            {claimed ? `✅ ${t('coupon.claimed')}` : t('coupon.claim')}
          </button>
        )}
      </div>
    </motion.div>
  )
}
