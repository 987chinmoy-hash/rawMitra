import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { useTranslation } from '../../utils/i18n.js'
import { api } from '../../services/api.js'
import Stepper from '../../components/Stepper.jsx'
import RulesBanner from '../../components/RulesBanner.jsx'

const CATEGORY_ICONS = {
  Bamboo: '🎋',
  Clay: '🏺',
  Yarn: '🧵',
  Dyes: '🎨',
  Metal: '⚒️',
  Packaging: '📦',
}

export default function ArtisanOrderConfirm() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state)
  const { t } = useTranslation()
  const order = state.pendingOrder
  const [submitting, setSubmitting] = useState(false)

  if (!artisan) {
    navigate('/artisan/register')
    return null
  }

  if (!order) {
    navigate('/artisan/matching')
    return null
  }

  const isMultiItem = Boolean(order.items && order.items.length > 1)

  const myShare = order.myShare || order.perArtisan?.find(
    (p) => p.artisanId === artisan.id
  ) || {
    quantity: order.totalQuantity,
    materialCost: order.materialTotal || order.totalCost,
    transportShare: order.transportTotal || 0,
    totalCost: order.totalCost,
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      // If backend is active, persist to SQLite database
      if (api.getToken()) {
        try {
          if (isMultiItem && order.items) {
            for (const item of order.items) {
              await api.orders.create({
                category: item.category,
                specification: item.specification,
                unit: item.unit,
                totalQuantity: item.quantity,
                supplierId: item.supplierId,
                pricePerUnit: item.unitPrice,
                transportCharge: item.myTransportShare,
                validity: item.validity,
                perArtisan: [
                  {
                    artisanId: artisan.id,
                    quantity: item.quantity,
                    materialCost: item.myMaterialCost,
                    transportShare: item.myTransportShare,
                    totalCost: item.myTotalCost,
                  },
                ],
              })
            }
          } else {
            await api.orders.create({
              category: order.category,
              specification: order.specification,
              unit: order.unit,
              totalQuantity: order.totalQuantity,
              supplierId: order.supplierId,
              pricePerUnit: order.pricePerUnit,
              transportCharge: order.transportTotal || order.transportCharge,
              validity: order.validity,
              
              neededBy: order.neededBy,
              
              perArtisan: (order.perArtisan || []).map((p) => ({
                artisanId: p.artisanId,
                quantity: p.quantity,
                materialCost: p.materialCost,
                transportShare: p.transportShare,
                totalCost: p.totalCost,
              })),
            })
          }
        } catch (apiErr) {
          console.warn('Backend order sync info:', apiErr.message)
        }
      }

      const newOrderId = order.id || `ORD-${Date.now().toString().slice(-6)}`

      // Save the confirmed order to client state
      dispatch({
        type: 'CREATE_ORDER',
        payload: {
          ...order,
          id: newOrderId,
          status: 'confirmed',
          trackingStage: 0,
          createdAt: new Date().toISOString(),
        },
      })

      // Update workflow progress
      dispatch({
        type: 'UPDATE_PROGRESS',
        current_step: 'delivery_tracking',
        onboarding_complete: true,
      })

      navigate(`/artisan/tracking?orderId=${newOrderId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`page ${isMultiItem ? '' : 'page-narrow'}`}>
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
        current={3}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>
          {isMultiItem
            ? `Confirm Batch Order (${order.items.length} Materials)`
            : t('confirmOrderTitle')}
        </h1>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--ink-soft)' }}>
          {isMultiItem
            ? 'Review your consolidated procurement batch before finalizing syndicate order placement.'
            : t('confirmOrderSub')}
        </p>
      </div>

      {isMultiItem ? (
        /* Multi-Material Batch Order Presentation */
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="card" style={{ border: '2px solid var(--brass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <span className="tag tag-brass" style={{ fontWeight: 700 }}>
                  Consolidated Procurement Batch
                </span>
                <span style={{ marginLeft: '0.6rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                  Batch #{order.batchId || order.id}
                </span>
              </div>
              <span className="tag tag-green" style={{ fontWeight: 700 }}>
                {order.items.length} Materials Grouped
              </span>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--paper)', borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'left' }}>Material & Spec</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'left' }}>Quantity</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'left' }}>Procurement Plan & Supplier</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'left' }}>Delivery ETA</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>Material Share</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>Freight Share</th>
                  <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>Item Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={item.reqId || idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.75rem 0.8rem' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{CATEGORY_ICONS[item.category] || '📦'}</span> {item.category}
                      </strong>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>
                        {item.specification}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem' }}>
                      <span className="tag tag-brass" style={{ fontSize: '0.75rem' }}>
                        {item.chosenPlanTitle}
                      </span>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>
                        {item.supplierName} ({item.supplierLocation})
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                      📅 {item.deliveryEta}
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem', textAlign: 'right' }}>
                      ₹{item.myMaterialCost?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem', textAlign: 'right' }}>
                      ₹{item.myTransportShare?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.8rem', textAlign: 'right', fontWeight: 700 }}>
                      ₹{item.myTotalCost?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan={4} style={{ textAlign: 'right', padding: '0.8rem' }}>
                    Batch Totals:
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.8rem' }}>
                    ₹{order.materialTotal?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.8rem' }}>
                    ₹{order.transportTotal?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.8rem', fontSize: '1.15rem', color: 'var(--brass-dark, #8F6415)' }}>
                    ₹{order.totalCost?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Consolidated Batch Cost Summary Box */}
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(192, 138, 40, 0.08)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>
                    Total Payable: ₹{order.totalCost?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    Includes {order.items.length} materials with transparent syndicate freight allocation
                  </div>
                </div>
                {order.totalSavings > 0 && (
                  <span className="tag tag-green" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    🎉 Combined Syndicate Savings: ₹{order.totalSavings?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Single Item Order Presentation */
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
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblMaterialSpecs')}
                </td>
                <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>
                  {t(order.category) || order.category} — {order.specification}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  Procurement Plan
                </td>
                <td style={{ padding: '0.45rem 0' }}>
                  <span className="tag tag-green" style={{ fontWeight: 700 }}>
                    {order.planTitle || 'District Mega-Bulk Tier'}
                  </span>
                  {order.deliveryEta && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginLeft: '0.5rem' }}>
                      ({order.deliveryEta})
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
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
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblGroupTotalQty')}
                </td>
                <td style={{ padding: '0.45rem 0' }}>
                  {order.totalQuantity} {order.unit}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblSelectedSupplier')}
                </td>
                <td style={{ padding: '0.45rem 0' }}>
                  {order.supplierName}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblQuoteValidity')}
                </td>
                <td style={{ padding: '0.45rem 0', color: '#166534', fontWeight: 600 }}>
                  📅 {order.validity || '2026-09-25'}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblLogistics')}
                </td>
                <td style={{ padding: '0.45rem 0', textTransform: 'capitalize' }}>
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
                <td style={{ padding: '0.45rem 0', color: 'var(--ink-soft)' }}>
                  {t('lblYourTransportShare')}
                </td>
                <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>
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
                  ₹{(myShare.totalCost || myShare.cost || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

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
          disabled={submitting}
        >
          {submitting
            ? 'Processing Order...'
            : isMultiItem
            ? `Confirm & Place Batch Order (${order.items.length} Materials) →`
            : t('btnConfirmPlaceOrder')}
        </button>
      </div>
    </div>
  )
}

