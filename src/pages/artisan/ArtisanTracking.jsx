import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import ReviewList from '../../components/ReviewList.jsx'
import '../artisan/artisan.css'

export default function ArtisanTracking() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state) || (state.authUser?.role === 'artisan' ? state.authUser : null)
  const { t } = useTranslation()

  if (!artisan) { navigate('/artisan/register'); return null }

  const myOrders = state.orders.filter((o) => o.perArtisan.some((p) => p.artisanId === artisan.id))

  const stages = [
    t('stage1'),
    t('stage2'),
    t('stage3'),
    t('stage4'),
    t('stage5'),
  ]

  if (myOrders.length === 0) {
    return (
      <div className="page page-narrow">
        <h1>{t('noShipmentsTitle')}</h1>
        <p>{t('noShipmentsSub')}</p>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']} current={4} />
      <h1>{t('trackingTitle')}</h1>

      {myOrders.map((order) => (
        <div className="card" key={order.id} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>{t(order.category) || order.category} — {order.specification}</h3>
              <span className="field-hint">Order {order.id} · {order.totalQuantity} {order.unit} from {order.supplierName}</span>
            </div>
            <span className={`tag ${order.status === 'cancelled' ? 'tag-rust' : 'tag-green'}`}>{order.status}</span>
          </div>

          {order.status === 'cancelled' ? (
            <p style={{ color: 'var(--rust)' }}>This order was cancelled. The cancellation penalty described in the rules has been applied.</p>
          ) : (
            <>
              <ol className="timeline">
                {stages.map((stage, i) => (
                  <li key={stage} className={i < order.trackingStage ? 'done' : i === order.trackingStage ? 'active' : ''}>
                    <span className="timeline-dot">{i < order.trackingStage ? '✓' : i + 1}</span>
                    <div>
                      <strong>{stage}</strong>
                      {i === order.trackingStage && <div className="field-hint">{t('currentStageBadge')}</div>}
                    </div>
                  </li>
                ))}
              </ol>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {order.trackingStage < stages.length - 1 ? (
                  <>
                    <button className="btn btn-outline" onClick={() => dispatch({ type: 'ADVANCE_TRACKING', orderId: order.id })}>
                      {t('btnAdvanceStage')}
                    </button>
                    <button className="btn btn-ghost" style={{ color: 'var(--rust)' }} onClick={() => dispatch({ type: 'CANCEL_ORDER', orderId: order.id })}>
                      {t('btnCancelOrder')}
                    </button>
                  </>
                ) : (
                  <span className="tag tag-green" style={{ fontSize: '0.88rem', padding: '0.45rem 0.85rem' }}>
                    ✓ {t('stage5')} — Delivered to Artisan Workshop
                  </span>
                )}
              </div>
            </>
          )}

          {order.trackingStage === stages.length - 1 && (
            <div style={{ marginTop: '1.5rem' }}>
              <ReviewList targetId={order.supplierId} targetLabel={order.supplierName} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
