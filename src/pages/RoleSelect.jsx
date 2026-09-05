import { Link } from 'react-router-dom'
import { useTranslation } from '../utils/i18n.js'
import RulesBanner from '../components/RulesBanner.jsx'
import './RoleSelect.css'

export default function RoleSelect() {
  const { t } = useTranslation()

  const roles = [
    {
      id: 'artisan',
      title: t('artisanTitle'),
      desc: t('artisanDesc'),
      to: '/artisan/register',
      points: [t('artisanPoint1'), t('artisanPoint2'), t('artisanPoint3')],
      cta: t('artisanCta'),
    },
    {
      id: 'supplier',
      title: t('supplierTitle'),
      desc: t('supplierDesc'),
      to: '/supplier/register',
      points: [t('supplierPoint1'), t('supplierPoint2'), t('supplierPoint3')],
      cta: t('supplierCta'),
    },
    {
      id: 'coordinator',
      title: t('coordinatorTitle'),
      desc: t('coordDesc'),
      to: '/coordinator/register',
      points: [t('coordPoint1'), t('coordPoint2'), t('coordPoint3')],
      cta: t('coordCta'),
    },
  ]

  return (
    <div className="page">
      <h1>{t('roleSelectTitle')}</h1>
      <p>{t('roleSelectSub')}</p>

      <div className="role-grid">
        {roles.map((r) => (
          <Link to={r.to} key={r.id} className="role-card">
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <ul>
              {r.points.map((p, idx) => <li key={idx}>{p}</li>)}
            </ul>
            <span className="role-cta">{r.cta}</span>
          </Link>
        ))}
      </div>

      <RulesBanner />
    </div>
  )
}
