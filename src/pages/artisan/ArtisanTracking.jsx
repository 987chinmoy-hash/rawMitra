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
  const { t } = useTranslation()

  const artisan = getCurrentArtisan(state) || (state.authUser?.role === 'artisan' ? state.authUser : null) || state.artisans[0] || {
    id: 'A-1001',
    name: 'Deepa Boro',
    role: 'artisan',
    storeLocation: 'Sualkuchi, Assam',
  }

  const currentArtisanId = artisan?.id || state.currentUserId || 'A-1001'

  // Match orders by artisan ID or fallback to all active platform orders for demo visibility
  let myOrders = (state.orders || []).filter((o) =>
    (o.perArtisan && o.perArtisan.some((p) => p.artisanId === currentArtisanId || !p.artisanId)) ||
    o.artisanId === currentArtisanId
  )

  if (myOrders.length === 0 && (state.orders || []).length > 0) {
    myOrders = state.orders
  }

  const stages = [
    t('stage1') || 'Order Placed',
    t('stage2') || 'Confirmed & Escrow Locked',
    t('stage3') || 'Packed & Dispatched',
    t('stage4') || 'Out for Delivery',
    t('stage5') || 'Delivered',
  ]

  function handleCreateSampleOrder() {
    dispatch({
      type: 'CREATE_ORDER',
      payload: {
        groupId: 'G-DEMO1',
        category: 'silk',
        specification: 'Muga Silk Yarn — 20/22 denier',
        unit: 'kg',
        totalQuantity: 25,
        supplierId: 'S-1001',
        supplierName: 'Assam Silk Guild',
        pricePerUnit: 3800,
        logistics: 'shipment',
        transportCharge: 500,
        validity: '2026-09-25',
        purchaseMode: 'group',
        materialTotal: 95000,
        transportTotal: 500,
        totalCost: 95500,
        perArtisan: [
          {
            artisanId: currentArtisanId,
            quantity: 25,
            share: 1,
            materialCost: 95000,
            transportShare: 500,
            totalCost: 95500,
          },
        ],
      },
    })
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']} current={4} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>{t('trackingTitle') || '5. Order Tracking & Delivery'}</h1>
        <button
          type="button"
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
          onClick={() => navigate('/artisan/materials')}
        >
          + Buy More Materials
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#fdfbf7' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>{t('noShipmentsTitle') || 'No Active Shipments Found'}</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 1.25rem', fontSize: '0.92rem' }}>
            {t('noShipmentsSub') || 'You have not placed a raw material order yet. Start procurement or test the live tracking simulator below.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/artisan/materials')}
            >
              🛒 Start Raw Material Procurement →
            </button>
            <button
              type="button"
              className="btn btn-brass"
              onClick={handleCreateSampleOrder}
            >
              ⚡ Create Sample Order for Live Demo
            </button>
          </div>
        </div>
      ) : (
        myOrders.map((order) => (
          <div className="card" key={order.id} style={{ marginBottom: '2rem', border: '1.5px solid var(--line, #cbd5e1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {t(order.category) || order.category} — {order.specification}
                </h3>
                <span className="field-hint">
                  Order #{order.id} · {order.totalQuantity} {order.unit} from <strong>{order.supplierName}</strong> · Total: ₹{order.totalCost?.toLocaleString('en-IN')}
                </span>
              </div>
              <span className={`tag ${order.status === 'cancelled' ? 'tag-rust' : 'tag-green'}`}>
                {order.status}
              </span>
            </div>

            {order.status === 'cancelled' ? (
              <p style={{ color: 'var(--rust)' }}>
                This order was cancelled. The cancellation penalty described in the rules has been applied.
              </p>
            ) : (
              <>
                <ol className="timeline">
                  {stages.map((stage, i) => (
                    <li key={stage} className={i < order.trackingStage ? 'done' : i === order.trackingStage ? 'active' : ''}>
                      <span className="timeline-dot">{i < order.trackingStage ? '✓' : i + 1}</span>
                      <div>
                        <strong>{stage}</strong>
                        {i === order.trackingStage && (
                          <div className="field-hint" style={{ color: 'var(--brass-dark, #92400e)', fontWeight: 600 }}>
                            ● {t('currentStageBadge') || 'Current status'}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
                  {order.trackingStage < stages.length - 1 ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => dispatch({ type: 'ADVANCE_TRACKING', orderId: order.id })}
                      >
                        ⚡ Advance Stage: {stages[order.trackingStage + 1]} →
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: 'var(--rust)', fontSize: '0.84rem' }}
                        onClick={() => dispatch({ type: 'CANCEL_ORDER', orderId: order.id })}
                      >
                        {t('btnCancelOrder') || 'Cancel Order (10% penalty)'}
                      </button>
                    </>
                  ) : (
                    <span className="tag tag-green" style={{ fontSize: '0.9rem', padding: '0.45rem 0.85rem' }}>
                      ✓ {stages[4]} — Delivered to Artisan Workshop
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Stage 5: Delivered -> Ratings & Reviews Flow */}
            {order.trackingStage === stages.length - 1 && (
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--line, #e2e8f0)', paddingTop: '1.25rem' }}>
                <ReviewList targetId={order.supplierId} targetLabel={order.supplierName} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
