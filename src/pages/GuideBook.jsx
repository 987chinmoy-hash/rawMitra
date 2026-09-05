import { useState } from 'react'
import './GuideBook.css'
import { useTranslation } from '../utils/i18n'

const GUIDES = {
  Artisan: {
    intro: 'guideArtisanIntro',
    steps: [
      'guideArtisanStep1',
      'guideArtisanStep2',
      'guideArtisanStep3',
      'guideArtisanStep4',
      'guideArtisanStep5',
      'guideArtisanStep6',
    ],
    tips: [
      'guideArtisanTip1',
      'guideArtisanTip2',
    ],
  },

  Supplier: {
    intro: 'guideSupplierIntro',
    steps: [
      'guideSupplierStep1',
      'guideSupplierStep2',
      'guideSupplierStep3',
      'guideSupplierStep4',
      'guideSupplierStep5',
    ],
    tips: [
      'guideSupplierTip1',
      'guideSupplierTip2',
    ],
  },

  Coordinator: {
    intro: 'guideCoordinatorIntro',
    steps: [
      'guideCoordinatorStep1',
      'guideCoordinatorStep2',
      'guideCoordinatorStep3',
      'guideCoordinatorStep4',
      'guideCoordinatorStep5',
    ],
    tips: [
      'guideCoordinatorTip1',
    ],
  },
}

export default function GuideBook() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('Artisan')

  const g = GUIDES[tab]

  const roleLabels = {
    Artisan: t('guideArtisan'),
    Supplier: t('guideSupplier'),
    Coordinator: t('guideCoordinator'),
  }

  return (
    <div className="page page-narrow">
      <h1>{t('guideTitle')}</h1>

      <p>{t('guideSubtitle')}</p>

      <div className="guide-tabs">
        {Object.keys(GUIDES).map((role) => (
          <button
            key={role}
            className={`guide-tab ${tab === role ? 'active' : ''}`}
            onClick={() => setTab(role)}
          >
            {roleLabels[role]}
          </button>
        ))}
      </div>

      <div className="guide-section">
        <p>{t(g.intro)}</p>

        <h3>{t('guideSteps')}</h3>

        <ol>
          {g.steps.map((step) => (
            <li key={step}>
              {t(step)}
            </li>
          ))}
        </ol>

        <h3>{t('guideTips')}</h3>

        <ul>
          {g.tips.map((tip) => (
            <li key={tip}>
              {t(tip)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
