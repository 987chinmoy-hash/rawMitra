import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import RulesBanner from '../../components/RulesBanner.jsx'

export default function ArtisanOrderConfirm() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state)
  const { t } = useTranslation()
  const order = state.pendingOrder

  if (!artisan) {
    navigate('/artisan/register')
    return null
  }

  if (!order) {
    navigate('/artisan/matching')
    return null
  }

  const myShare = order.perArtisan?.find(
    (p) => p.artisanId === artisan.id
  ) || {
    quantity: order.totalQuantity,
    materialCost: order.materialTotal || order.totalCost,
    transportShare: order.transportTotal || 0,
    totalCost: order.totalCost,
  }

  function handleConfirm() {
    // Save the order.
    dispatch({
      type: 'CREATE_ORDER',
      payload: order,
    })

    // The order is now placed, but the workflow is NOT completed.
    // The artisan still needs to go through tracking, delivery,
    // review and thank-you before the workflow becomes "completed".
    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'delivery_tracking',
      onboarding_complete: true,
    })

    // Continue to the tracking page instead of returning home.
    navigate('/artisan/tracking')
  }

  return (
    <div className="page page-narrow">
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
        current={3}
      />

      <h1>{t('confirmOrderTitle')}</h1>
      <p>{t('confirmOrderSub')}</p>

      <div className="card">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.92rem',
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblMaterialSpecs')}
              </td>
              <td
                style={{
                  padding: '0.45rem 0',
                  fontWeight: 600,
                }}
              >
                {t(order.category) || order.category} — {order.specification}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblPurchaseMode')}
              </td>
              <td style={{ padding: '0.45rem 0' }}>
                <span className="tag tag-brass">
                  {order.purchaseMode === 'solo'
                    ? t('buyAlone')
                    : t('groupBuy')}
                </span>
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblGroupTotalQty')}
              </td>
              <td style={{ padding: '0.45rem 0' }}>
                {order.totalQuantity} {order.unit}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblSelectedSupplier')}
              </td>
              <td style={{ padding: '0.45rem 0' }}>
                {order.supplierName}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblQuoteValidity')}
              </td>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: '#166534',
                  fontWeight: 600,
                }}
              >
                📅 {order.validity || '2026-09-25'}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblLogistics')}
              </td>
              <td
                style={{
                  padding: '0.45rem 0',
                  textTransform: 'capitalize',
                }}
              >
                {order.logistics}
              </td>
            </tr>

            {/* Fair cost breakdown rows */}
            <tr>
              <td
                style={{
                  padding: '0.55rem 0',
                  borderTop: '1px solid var(--line)',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblYourMaterialShare')} ({myShare.quantity} {order.unit})
              </td>

              <td
                style={{
                  padding: '0.55rem 0',
                  borderTop: '1px solid var(--line)',
                  fontWeight: 600,
                }}
              >
                ₹
                {myShare.materialCost
                  ? myShare.materialCost.toLocaleString('en-IN')
                  : (myShare.cost || 0).toLocaleString('en-IN')}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  padding: '0.45rem 0',
                  color: 'var(--ink-soft)',
                }}
              >
                {t('lblYourTransportShare')}
              </td>

              <td
                style={{
                  padding: '0.45rem 0',
                  fontWeight: 600,
                }}
              >
                ₹{(myShare.transportShare || 0).toLocaleString('en-IN')}
              </td>
            </tr>

            <tr style={{ background: 'rgba(192, 138, 40, 0.08)' }}>
              <td
                style={{
                  padding: '0.75rem 0.5rem',
                  borderTop: '2px solid var(--ink)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                }}
              >
                {t('lblTotalPayable')}
              </td>

              <td
                style={{
                  padding: '0.75rem 0.5rem',
                  borderTop: '2px solid var(--ink)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: 'var(--ink)',
                }}
              >
                ₹
                {(myShare.totalCost || myShare.cost || 0).toLocaleString(
                  'en-IN'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ margin: '1.25rem 0' }}>
        <RulesBanner compact />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button
          className="btn btn-outline"
          onClick={() => navigate('/artisan/matching')}
        >
          {t('btnBackToMatch')}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleConfirm}
        >
          {t('btnConfirmPlaceOrder')}
        </button>
      </div>
    </div>
  )
}
