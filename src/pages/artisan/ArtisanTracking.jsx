import { useState } from 'react'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import ReviewList from '../../components/ReviewList.jsx'
import '../artisan/artisan.css'

const CATEGORY_ICONS = {
  Bamboo: '🎋',
  Clay: '🏺',
  Yarn: '🧵',
  Dyes: '🎨',
  Metal: '⚒️',
  Packaging: '📦',
}

export default function ArtisanTracking() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const [showHistory, setShowHistory] = useState(false)

  const artisan =
    getCurrentArtisan(state) ||
    (state.authUser?.role === 'artisan' ? state.authUser : null) ||
    state.artisans[0] || {
      id: 'A-1001',
      name: 'Deepa Boro',
      role: 'artisan',
      storeLocation: 'Sualkuchi, Assam',
    }

  const currentArtisanId = artisan?.id || state.currentUserId || 'A-1001'

  // Match orders by artisan ID or fallback to all active platform orders for demo visibility
  let myOrders = (state.orders || []).filter(
    (o) =>
      (o.perArtisan &&
        o.perArtisan.some(
          (p) => p.artisanId === currentArtisanId || !p.artisanId
        )) ||
      o.artisanId === currentArtisanId
  )

  if (myOrders.length === 0 && (state.orders || []).length > 0) {
    myOrders = state.orders
  }

  const queryOrderId = searchParams.get('orderId')

  // Identify the active/current order (matching URL param, or the most recent order)
  const currentOrder = queryOrderId
    ? myOrders.find((o) => o.id === queryOrderId) || myOrders[0]
    : myOrders[0]

  // Past orders are strictly isolated from the current order view
  const previousOrders = myOrders.filter((o) => o.id !== currentOrder?.id)

  const stages = [
    t('stage1') || 'Order Placed',
    t('stage2') || 'Confirmed & Escrow Locked',
    t('stage3') || 'Packed & Dispatched',
    t('stage4') || 'Out for Delivery',
    t('stage5') || 'Delivered',
  ]

  function handleCreateSampleOrder() {
    const newId = `ORD-DEMO-${Date.now().toString().slice(-4)}`
    dispatch({
      type: 'CREATE_ORDER',
      payload: {
        id: newId,
        groupId: 'G-DEMO1',
        category: 'Bamboo',
        specification: 'Treated Bhaluka bamboo poles, 10ft',
        unit: 'piece',
        totalQuantity: 25,
        supplierId: 'S-2004',
        supplierName: 'Assam Bamboo & Cane Syndicate',
        pricePerUnit: 98,
        logistics: 'shipment',
        transportCharge: 500,
        validity: '2026-09-30',
        purchaseMode: 'group',
        materialTotal: 2450,
        transportTotal: 500,
        totalCost: 2950,
        perArtisan: [
          {
            artisanId: currentArtisanId,
            name: artisan.name,
            location: artisan.storeLocation,
            quantity: 25,
            share: 1,
            materialCost: 2450,
            transportShare: 500,
            totalCost: 2950,
          },
        ],
      },
    })
    setSearchParams({ orderId: newId })
  }

  function renderOrderCard(order, isCurrent = true) {
    const isMultiItem = Boolean(order.items && order.items.length > 1)

    return (
      <div
        className="card"
        key={order.id}
        style={{
          marginBottom: '1.75rem',
          border: isCurrent
            ? '2px solid var(--brass, #c08a28)'
            : '1px solid var(--line, #cbd5e1)',
          background: isCurrent ? '#ffffff' : '#fcfcfc',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                {isMultiItem
                  ? `📦 Multi-Material Batch Consignment (${order.items.length} Materials)`
                  : `${t(order.category) || order.category} — ${order.specification}`}
              </h3>
              {isCurrent && (
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  ⚡ Current Order
                </span>
              )}
            </div>

            {isMultiItem && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.35rem 0' }}>
                {order.items.map((it, idx) => (
                  <span
                    key={idx}
                    className="tag tag-brass"
                    style={{ fontSize: '0.78rem', padding: '0.15rem 0.55rem' }}
                  >
                    {CATEGORY_ICONS[it.category] || '📦'} {it.category} ({it.quantity} {it.unit})
                  </span>
                ))}
              </div>
            )}

            <span className="field-hint">
              Order #{order.id} &middot; {order.totalQuantity} {order.unit} &middot; Total: ₹
              {order.totalCost?.toLocaleString('en-IN')}
            </span>
          </div>

          <span
            className={`tag ${
              order.status === 'cancelled' ? 'tag-rust' : 'tag-green'
            }`}
          >
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
                <li
                  key={stage}
                  className={
                    i < order.trackingStage
                      ? 'done'
                      : i === order.trackingStage
                      ? 'active'
                      : ''
                  }
                >
                  <span className="timeline-dot">
                    {i < order.trackingStage ? '✓' : i + 1}
                  </span>
                  <div>
                    <strong>{stage}</strong>
                    {i === order.trackingStage && (
                      <div
                        className="field-hint"
                        style={{
                          color: 'var(--brass-dark, #92400e)',
                          fontWeight: 600,
                        }}
                      >
                        ● {t('currentStageBadge') || 'Current status'}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              {order.trackingStage < stages.length - 1 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      dispatch({
                        type: 'ADVANCE_TRACKING',
                        orderId: order.id,
                      })
                    }
                  >
                    ⚡ Advance Stage: {stages[order.trackingStage + 1]} →
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: 'var(--rust)', fontSize: '0.84rem' }}
                    onClick={() =>
                      dispatch({
                        type: 'CANCEL_ORDER',
                        orderId: order.id,
                      })
                    }
                  >
                    {t('btnCancelOrder') || 'Cancel Order (10% penalty)'}
                  </button>
                </>
              ) : (
                <span
                  className="tag tag-green"
                  style={{ fontSize: '0.9rem', padding: '0.45rem 0.85rem' }}
                >
                  ✓ {stages[4]} — Delivered to Artisan Workshop
                </span>
              )}
            </div>
          </>
        )}

        {/* Itemized Consignment Manifest for Multi-Material Batch */}
        {isMultiItem && (
          <div
            style={{
              marginTop: '1.25rem',
              background: '#fafaf9',
              border: '1px solid #e7e5e4',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.65rem', color: 'var(--ink)' }}>
              📦 Consignment Manifest ({order.items.length} Materials):
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>{CATEGORY_ICONS[it.category] || '📦'} {it.category}</strong> — {it.specification} ({it.quantity} {it.unit})
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      Supplier: {it.supplierName} ({it.supplierLocation}) &middot; {it.chosenPlanTitle}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{it.myTotalCost?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 5: Delivered -> Ratings & Reviews Flow (Strictly scoped to this order) */}
        {order.trackingStage === stages.length - 1 && (
          <div
            style={{
              marginTop: '1.75rem',
              borderTop: '1px solid var(--line, #e2e8f0)',
              paddingTop: '1.25rem',
            }}
          >
            <ReviewList
              targetId={order.supplierId}
              targetLabel={order.supplierName}
              orderId={order.id}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
        current={4}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <h1 style={{ margin: 0 }}>
          {t('trackingTitle') || '5. Order Tracking & Delivery'}
        </h1>
        <button
          type="button"
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
          onClick={() => navigate('/artisan/materials')}
        >
          + Buy More Materials
        </button>
      </div>

      {!currentOrder ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: '#fdfbf7',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>
            {t('noShipmentsTitle') || 'No Active Shipments Found'}
          </h2>
          <p
            style={{
              color: 'var(--ink-soft)',
              maxWidth: '420px',
              margin: '0 auto 1.25rem',
              fontSize: '0.92rem',
            }}
          >
            {t('noShipmentsSub') ||
              'You have not placed a raw material order yet. Start procurement or test the live tracking simulator below.'}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
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
        <>
          {/* Main Card: ONLY the current order being tracked */}
          {renderOrderCard(currentOrder, true)}

          {/* Collapsible Past Orders Section: Keeps screen completely clean for current order */}
          {previousOrders.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                borderTop: '1px dashed var(--line, #cbd5e1)',
                paddingTop: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--ink-soft)',
                    fontWeight: 600,
                  }}
                >
                  Previous Orders Archive ({previousOrders.length})
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory
                    ? '▲ Hide Previous Orders'
                    : `▼ View ${previousOrders.length} Previous Order${
                        previousOrders.length > 1 ? 's' : ''
                      }`}
                </button>
              </div>

              {showHistory && (
                <div style={{ marginTop: '1rem' }}>
                  {previousOrders.map((prevOrder) =>
                    renderOrderCard(prevOrder, false)
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
