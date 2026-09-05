import { useState } from 'react'
import { MATERIAL_CATEGORIES } from '../data/seed.js'
import { useAppState } from '../context/AppContext.jsx'
import { forecastOutlook } from '../utils/pricing.js'
import { useTranslation } from '../utils/i18n.js'
import './DemandForecast.css'

export default function DemandForecast() {
  const state = useAppState()
  const { t } = useTranslation()
  const locations = Array.from(new Set(state.suppliers.map((s) => s.storeLocation)))
  const [category, setCategory] = useState(MATERIAL_CATEGORIES[0])
  const [location, setLocation] = useState(locations[0] || 'Guwahati, Assam')

  const outlook = forecastOutlook(`${category}|${location}`)
  const maxAbsPct = Math.max(...outlook.map((d) => Math.abs(d.pricePct)), 5)

  function translateDemand(demand) {
    if (demand === 'High') return t('highDemand')
    if (demand === 'Steady') return t('steadyDemand')
    if (demand === 'Low') return t('lowDemand')
    return demand
  }

  function translateAvail(avail) {
    if (avail === 'Tight') return t('tightAvail')
    if (avail === 'Plentiful') return t('plentifulAvail')
    if (avail === 'Moderate') return t('moderateAvail')
    return avail
  }

  return (
    <div className="page page-narrow">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <h1 style={{ margin: 0 }}>{t('forecastTitle')}</h1>
        <span className="tag tag-brass">Special Feature · Red Ink</span>
      </div>
      <p>{t('forecastSub')}</p>

      <div className="field-row" style={{ marginBottom: '1.5rem' }}>
        <div className="field">
          <label>{t('lblMaterialCat')}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{t(c) || c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('lblLocation')}</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="forecast-card">
        <strong>{t(category) || category} in {location}</strong>
        <div className="forecast-days">
          {outlook.map((d) => (
            <div className="forecast-day" key={d.day}>
              <div className="forecast-bar-track">
                <div
                  className={`forecast-bar ${d.pricePct < 0 ? 'down' : ''}`}
                  style={{ height: `${Math.max(8, (Math.abs(d.pricePct) / maxAbsPct) * 80)}px` }}
                  title={`${d.pricePct > 0 ? '+' : ''}${d.pricePct}%`}
                />
              </div>
              <div className="forecast-pct" style={{ color: d.pricePct < 0 ? 'var(--thread-green)' : 'var(--brass-dark)' }}>
                {d.pricePct > 0 ? '+' : ''}{d.pricePct}%
              </div>
              <div className="forecast-day-label">{d.day}</div>
              <div className="forecast-day-label">{translateDemand(d.demand)}</div>
              <div className="forecast-day-label">{translateAvail(d.availability)}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="field-hint" style={{ marginTop: '1rem' }}>
        Bars show estimated price change versus today's baseline. This demo model is seeded from material and
        location — swap in a real forecasting service once historical order data is available.
      </p>
    </div>
  )
}
