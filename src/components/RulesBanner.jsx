import { useState } from 'react'
import { useTranslation } from '../utils/i18n.js'
import './RulesBanner.css'

export default function RulesBanner({ compact = false }) {
  const [open, setOpen] = useState(!compact)
  const { t } = useTranslation()

  const rulesList = [
    t('rule1'),
    t('rule2'),
    t('rule3'),
    t('rule4'),
    t('rule5'),
  ]

  return (
    <section className="rules-banner">
      <button className="rules-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{t('rulesToggle')}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="rules-body">
          <ul>
            {rulesList.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <div className="rules-penalty">
            <strong>{t('penaltyTitle')}</strong> {t('penaltyDesc')}
          </div>
        </div>
      )}
    </section>
  )
}
