import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Ticket, Star, MapPin, Building2, CreditCard, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const sections = [
  {
    id: 'store',
    title: 'Tenda Oficial',
    icon: <ShoppingBag size={32} />,
    color: 'from-blue-600 to-blue-800',
    desc: 'Camisetas, bufandas, roupa oficial e agasallos do RC Celta',
    items: [
      { label: 'Primeira equipación 25/26', price: '85€', badge: 'NOVA' },
      { label: 'Segunda equipación 25/26', price: '75€', badge: 'NOVA' },
      { label: 'Bufanda oficial', price: '25€', badge: null },
      { label: 'Chaqueta oficial', price: '120€', badge: null },
    ],
    link: 'https://shop.rccelta.es',
    linkLabel: 'IR Á TENDA'
  },
  {
    id: 'season',
    title: 'Plan de Abonados',
    icon: <Ticket size={32} />,
    color: 'from-yellow-500 to-amber-700',
    desc: 'Sé parte do Celta. Disfruta de Balaídos toda a tempada',
    items: [
      { label: 'Abono xeral', price: 'Desde 280€', badge: null },
      { label: 'Abono socio', price: 'Desde 220€', badge: 'SOCIO' },
      { label: 'Pack familiar (4 pax)', price: '900€', badge: 'AFORRO' },
      { label: 'Abono xuvenil (-25)', price: '150€', badge: 'MOZO' },
    ],
    link: 'https://rccelta.es/celtismo/celtistas',
    linkLabel: 'VER PLANES'
  },
  {
    id: 'sponsors',
    title: 'Patrocinadores',
    icon: <Star size={32} />,
    color: 'from-green-600 to-green-800',
    desc: 'Empresas que fan grande o RC Celta',
    items: [
      { label: 'Estrella Galicia', price: 'Patrocinador Principal', badge: 'OFICIAL' },
      { label: 'Abanca', price: 'Patrocinador Financeiro', badge: 'OFICIAL' },
      { label: 'Adidas', price: 'Provedor Técnico', badge: 'OFICIAL' },
      { label: 'Gaes', price: 'Patrocinador Saúde', badge: null },
    ],
    link: 'https://rccelta.es/club/patrocinadores',
    linkLabel: 'VER TODOS'
  },
  {
    id: 'tour',
    title: 'Visita Balaídos',
    icon: <MapPin size={32} />,
    color: 'from-purple-600 to-purple-800',
    desc: 'Visita guiada ao templo celeste: vestiarios, césped, museo',
    items: [
      { label: 'Tour básico', price: '12€', badge: null },
      { label: 'Tour VIP + museo', price: '25€', badge: 'VIP' },
      { label: 'Experiencia partido', price: '50€', badge: 'EXCLUSIVO' },
      { label: 'Grupos (+20 pax)', price: '8€/pax', badge: 'GRUPO' },
    ],
    link: 'https://rccelta.es/entradas',
    linkLabel: 'RESERVAR TOUR'
  },
  {
    id: 'museum',
    title: 'Museo do Celta',
    icon: <Building2 size={32} />,
    color: 'from-red-600 to-red-800',
    desc: 'A historia viva do club. Trofeos, camisetas históricas, Mostovoi, Aspas...',
    items: [
      { label: 'Entrada xeral', price: '8€', badge: null },
      { label: 'Entrada reducida', price: '5€', badge: null },
      { label: 'Socio', price: 'Gratis', badge: 'GRATIS' },
      { label: 'Visita guiada', price: '15€', badge: 'GUIADA' },
    ],
    link: 'https://rccelta.es/el-club/historia',
    linkLabel: 'DESCUBRIR'
  },
  {
    id: 'membership',
    title: 'Facerte Socio',
    icon: <CreditCard size={32} />,
    color: 'from-cyan-600 to-cyan-800',
    desc: 'Únete á familia celeste. Vota, participa, sé parte do club',
    items: [
      { label: 'Socio numerario', price: '180€/ano', badge: 'RECOMENDADO' },
      { label: 'Socio xuvenil', price: '90€/ano', badge: null },
      { label: 'Socio infantil (-14)', price: '50€/ano', badge: null },
      { label: 'Socio internacional', price: '120€/ano', badge: 'ONLINE' },
    ],
    link: 'https://rccelta.es/celtismo/celtistas',
    linkLabel: 'FACERTE SOCIO'
  },
]

const colorMap = {
  'NOVA': 'bg-blue-600',
  'SOCIO': 'bg-yellow-600',
  'AFORRO': 'bg-green-600',
  'MOZO': 'bg-purple-600',
  'OFICIAL': 'bg-green-600',
  'VIP': 'bg-purple-600',
  'EXCLUSIVO': 'bg-red-600',
  'GRUPO': 'bg-orange-600',
  'GRATIS': 'bg-emerald-600',
  'GUIADA': 'bg-blue-600',
  'RECOMENDADO': 'bg-yellow-600',
  'ONLINE': 'bg-cyan-600',
}

export default function SectionsView({ onClose }) {
  const { t } = useTranslation()
  return (
    <div className="flex-1 overflow-y-auto z-10 pb-4">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 border-b border-blue-500/20">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black text-white">🌐 {t('sections.title')}</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <ExternalLink size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">{t('sections.subtitle')}</p>
      </div>

      <div className="p-4 space-y-6">
        {sections.map((section, si) => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}
            className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
            <div className={`bg-gradient-to-r ${section.color} p-4 flex items-center gap-3`}>
              <div className="text-white">{section.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{t(`sections.${section.id}_title`)}</h3>
                <p className="text-sm text-white/80">{t(`sections.${section.id}_desc`)}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] ${colorMap[item.badge] || 'bg-blue-600'} text-white px-1.5 py-0.5 rounded-full font-bold`}>{item.badge}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-blue-400">{item.price}</span>
                </div>
              ))}
            </div>
            <a href={section.link} target="_blank" rel="noopener noreferrer"
              className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 transition-colors text-sm">
              <ExternalLink size={14} className="inline mr-2" />{t(`sections.${section.id}_link`)}
            </a>
          </motion.div>
        ))}
        <p className="text-center text-[10px] text-slate-600 pt-2 pb-20">
          {t('sections.footer')}
        </p>
      </div>
    </div>
  )
}
