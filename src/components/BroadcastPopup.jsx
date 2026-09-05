import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { useTranslation } from '../utils/i18n.js'
import './BroadcastPopup.css'

export default function BroadcastPopup() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [visibleBroadcast, setVisibleBroadcast] = useState(null)

  useEffect(() => {
    const dismissed = state.dismissedBroadcasts || []
    const active = state.broadcasts?.find((b) => b.status === 'open' && !dismissed.includes(b.id))
    if (active) {
      const timer = setTimeout(() => {
        setVisibleBroadcast(active)
      }, 1200)
      return () => clearTimeout(timer)
    } else {
      setVisibleBroadcast(null)
    }
  }, [state.broadcasts, state.dismissedBroadcasts])

  if (!visibleBroadcast) return null

  function handleDismiss() {
    dispatch({ type: 'DISMISS_BROADCAST', broadcastId: visibleBroadcast.id })
    setVisibleBroadcast(null)
  }

  return (
    <div className="broadcast-popup" role="alert" aria-live="polite">
      <div className="broadcast-header">
        <span className="broadcast-badge">{t('activePoolBadge')}</span>
        <button className="broadcast-close" onClick={handleDismiss} title="Dismiss notification">
          &times;
        </button>
      </div>

      <div className="broadcast-title">
        {t(visibleBroadcast.category) || visibleBroadcast.category} — {visibleBroadcast.specification}
      </div>

      <div className="broadcast-body">
        {visibleBroadcast.notes || `Artisan seeking partners to combine orders for bulk wholesale rate.`}
      </div>

      <div className="broadcast-meta">
        <span>📍 {visibleBroadcast.location}</span>
        <span>⏱️ Target: {visibleBroadcast.quantity} {visibleBroadcast.unit}</span>
      </div>

      <div className="broadcast-actions">
        <Link
          to={`/artisan/materials?category=${encodeURIComponent(visibleBroadcast.category)}&spec=${encodeURIComponent(visibleBroadcast.specification)}`}
          className="btn-popup-join"
          onClick={handleDismiss}
        >
          {t('joinGroupReqBtn')}
        </Link>
        <button className="btn-popup-dismiss" onClick={handleDismiss}>
          {t('notNowBtn')}
        </button>
      </div>
    </div>
  )
}
