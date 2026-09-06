import { useTranslation } from '../utils/i18n.js'
import './Stepper.css'

const STEP_KEY_MAP = {
  'Your details': 'stepDetails',
  'Material needs': 'stepNeeds',
  'Artisan groups': 'stepGroups',
  'Choose supplier': 'stepSuppliers',
  'Match & buy': 'stepMatch',
  'Confirm': 'stepConfirm',
  'Track': 'stepTrack',
  'Your details & stock': 'stepStock',
  'Pricing & logistics': 'stepPricing',
}

export default function Stepper({ steps, current }) {
  const { t } = useTranslation()

  return (
    <ol className="stepper">
      {steps.map((label, i) => {
        const translated = STEP_KEY_MAP[label] ? t(STEP_KEY_MAP[label]) : label
        return (
          <li key={label} className={i === current ? 'is-current' : i < current ? 'is-done' : ''}>
            <span className="stepper-dot">{i < current ? '✓' : i + 1}</span>
            <span className="stepper-label">{translated}</span>
          </li>
        )
      })}
    </ol>
  )
}
