import { Link } from 'react-router-dom'
import { useTranslation } from '../utils/i18n.js'
import './Welcome.css'

export default function Welcome() {
  const { t } = useTranslation()

  return (
    <div>
      <section className="hero">
        <div className="hero-thread" aria-hidden="true">
          <svg viewBox="0 0 800 300" preserveAspectRatio="none">
            <path d="M0,150 C150,50 250,250 400,150 C550,50 650,250 800,150" fill="none" stroke="#C08A28" strokeWidth="2" opacity="0.5"/>
            <path d="M0,180 C150,80 250,280 400,180 C550,80 650,280 800,180" fill="none" stroke="#1B2A4A" strokeWidth="2" opacity="0.35"/>
            <path d="M0,120 C150,220 250,20 400,120 C550,220 650,20 800,120" fill="none" stroke="#3F6B4F" strokeWidth="1.5" opacity="0.3"/>
          </svg>
        </div>
        <div className="hero-content page">
          <h1>{t('welcomeHeroTitle')}</h1>
          <p className="hero-sub">
            {t('welcomeHeroSub')}
          </p>
          <div className="hero-actions">
            <Link to="/start" className="btn btn-primary">{t('enterBtn')}</Link>
            <Link to="/guide" className="btn btn-outline">{t('readGuideBtn')}</Link>
          </div>
        </div>
      </section>

      <section className="page how-it-works">
        <h2>{t('howTitle')}</h2>
        <div className="how-grid">
          <div className="how-card">
            <span className="how-num">1</span>
            <h3>{t('howStep1Title')}</h3>
            <p>{t('howStep1Desc')}</p>
          </div>
          <div className="how-card">
            <span className="how-num">2</span>
            <h3>{t('howStep2Title')}</h3>
            <p>{t('howStep2Desc')}</p>
          </div>
          <div className="how-card">
            <span className="how-num">3</span>
            <h3>{t('howStep3Title')}</h3>
            <p>{t('howStep3Desc')}</p>
          </div>
          <div className="how-card">
            <span className="how-num">4</span>
            <h3>{t('howStep4Title')}</h3>
            <p>{t('howStep4Desc')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
