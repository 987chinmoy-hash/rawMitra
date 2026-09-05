import { useAppState, useAppDispatch, getCurrentCoordinator } from '../../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../utils/i18n.js'
import RatingStars from '../../components/RatingStars.jsx'
import ReviewList from '../../components/ReviewList.jsx'
import './coordinator.css'

export default function CoordinatorDashboard() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  // Accept both locally-registered coordinators and backend-authenticated users
  const coordinator = getCurrentCoordinator(state) || (state.authUser?.role === 'coordinator' ? state.authUser : null)

  if (!coordinator) { navigate('/coordinator/register'); return null }

  // Deals needing a coordinator: orders whose supplier logistics is "none",
  // or already assigned to this coordinator.
  const dealsToPickUp = state.orders.filter(
    (o) => o.status !== 'cancelled' && o.logistics === 'none' && !o.coordinatorId
  )
  const myDeals = state.orders.filter((o) => o.coordinatorId === coordinator.id)

  function claimDeal(orderId) {
    dispatch({ type: 'CLAIM_DEAL', orderId, coordinatorId: coordinator.id })
  }

  return (
    <div className="page">
      <h1>{coordinator.name}</h1>
      <p>{coordinator.experience}</p>
      <RatingStars value={coordinator.rating} />

      <h2 style={{ marginTop: '2.5rem' }}>{t('dealsNeedingCoord')}</h2>
      {dealsToPickUp.length === 0 && (
        <p className="field-hint">{t('noDealsNeedingCoord')}</p>
      )}
      {dealsToPickUp.map((order) => (
        <div className="deal-card" key={order.id}>
          <strong>{t(order.category) || order.category} — {order.specification}</strong>
          <div className="field-hint">
            {order.totalQuantity} {order.unit} · {t('lblFromSupplier')} {order.supplierName} · #{order.id}
          </div>
          <button className="btn btn-outline" style={{ marginTop: '0.75rem' }} onClick={() => claimDeal(order.id)}>
            {t('takeThisDeal')}
          </button>
        </div>
      ))}

      <h2 style={{ marginTop: '2.5rem' }}>{t('yourActiveDeals')}</h2>
      {myDeals.length === 0 && (
        <p className="field-hint">Deals you take on will appear here so you can update tracking status.</p>
      )}
      {myDeals.map((order) => (
        <div className="deal-card" key={order.id}>
          <strong>{t(order.category) || order.category} — {order.specification}</strong>
          <div className="field-hint">
            {order.totalQuantity} {order.unit} · {t('currentStageBadge')}: {order.trackingStage + 1} / 5
          </div>
          {order.trackingStage < 4 && (
            <button className="btn btn-outline" style={{ marginTop: '0.75rem' }} onClick={() => dispatch({ type: 'ADVANCE_TRACKING', orderId: order.id })}>
              {t('btnAdvanceStage')}
            </button>
          )}
        </div>
      ))}

      <div style={{ marginTop: '3rem' }}>
        <ReviewList targetId={coordinator.id} targetLabel={coordinator.name} />
      </div>
    </div>
  )
}
