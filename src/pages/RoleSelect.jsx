import { useState } from 'react'
import { useTranslation } from '../utils/i18n.js'
import RulesBanner from '../components/RulesBanner.jsx'
import AuthModal from '../components/AuthModal.jsx'
import './RoleSelect.css'

export default function RoleSelect() {
  const { t } = useTranslation()
  const [modalConfig, setModalConfig] = useState({ isOpen: false, role: 'artisan' })

  const roles = [
    {
      id: 'artisan',
      title: t('artisanTitle'),
      desc: t('artisanDesc'),
      points: [t('artisanPoint1'), t('artisanPoint2'), t('artisanPoint3')],
      cta: t('artisanCta'),
    },
    {
      id: 'supplier',
      title: t('supplierTitle'),
      desc: t('supplierDesc'),
      points: [t('supplierPoint1'), t('supplierPoint2'), t('supplierPoint3')],
      cta: t('supplierCta'),
    },
    {
      id: 'coordinator',
      title: t('coordinatorTitle'),
      desc: t('coordDesc'),
      points: [t('coordPoint1'), t('coordPoint2'), t('coordPoint3')],
      cta: t('coordCta'),
    },
  ]

  function handleSelectRole(roleId) {
    setModalConfig({ isOpen: true, role: roleId })
  }

  return (
    <div className="page">
      <h1>{t('roleSelectTitle')}</h1>
      <p>{t('roleSelectSub')}</p>

      <div className="role-grid">
        {roles.map((r) => (
          <div
            key={r.id}
            className="role-card"
            onClick={() => handleSelectRole(r.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleSelectRole(r.id)
            }}
          >
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <ul>
              {r.points.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
            <span className="role-cta">{r.cta}</span>
          </div>
        ))}
      </div>

      <RulesBanner />

      <AuthModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        initialRole={modalConfig.role}
        initialTab="signup"
      />
    </div>
  )
}