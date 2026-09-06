import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { useTranslation } from '../../utils/i18n.js'
import { api } from '../../services/api.js'
import Stepper from '../../components/Stepper.jsx'
import RulesBanner from '../../components/RulesBanner.jsx'
import {
  getSuppliersForGroupAndLocation,
  resolveDeliveryLocation,
  DELIVERY_LOCATIONS,
  MATERIAL_SPECS_AND_PHOTOS,
} from '../../utils/matching.js'
import './artisan.css'

const CATEGORY_ICONS = {
  Bamboo: '🎋',
  Clay: '🏺',
  Yarn: '🧵',
  Dyes: '🎨',
  Metal: '⚒️',
  Packaging: '📦',
}

const ARTISAN_STEPS = [
  'Your details',
  'Material needs',
  'Artisan groups',
  'Choose supplier',
  'Confirm',
  'Track',
]

export default function ArtisanSupplierSelect() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state)
  const { t } = useTranslation()

  const queryCat = searchParams.get('category')
  const queryLoc = searchParams.get('location')
  const queryBatchId = searchParams.get('batchId')
  const queryReqId = searchParams.get('reqId')
  const queryGroupId = searchParams.get('groupId')

  // Retrieve existing pending order or default context
  const pendingOrder = state.pendingOrder

  // Active category & specification
  const category = queryCat || pendingOrder?.category || state.materialRequests?.[0]?.category || 'Bamboo'
  const specification = pendingOrder?.specification || state.materialRequests?.[0]?.specification || ''

  // Active delivery location (Tezpur, Guwahati, or Dibrugarh)
  const activeLocation = useMemo(() => {
    return resolveDeliveryLocation(
      queryLoc ||
      pendingOrder?.selectedGroup?.location ||
      pendingOrder?.location ||
      artisan?.storeLocation ||
      'Tezpur'
    )
  }, [queryLoc, pendingOrder, artisan])

  // Active artisan group context
  const selectedGroup = useMemo(() => {
    if (pendingOrder?.selectedGroup) {
      return pendingOrder.selectedGroup
    }
    return {
      id: queryGroupId || 'G-DEFAULT',
      groupName: `${activeLocation} ${category} Artisan Syndicate`,
      artisanCount: 3,
      fellowArtisans: [
        { name: 'Prabin Das', location: activeLocation, orderedQty: 25, unit: 'piece' },
        { name: 'Moni Kakati', location: activeLocation, orderedQty: 15, unit: 'piece' },
      ],
      location: activeLocation,
    }
  }, [pendingOrder, queryGroupId, activeLocation, category])

  // Quantities
  const myQty = Number(
    pendingOrder?.myShare?.quantity ||
    state.materialRequests?.find((r) => r.id === queryReqId)?.quantity ||
    state.materialRequests?.[0]?.quantity ||
    20
  )
  const pooledQty = Number(
    pendingOrder?.totalQuantity ||
    selectedGroup.totalPooledQuantity ||
    (myQty + 35)
  )
  const unit = pendingOrder?.unit || state.materialRequests?.[0]?.unit || 'piece'

  // Dynamically fetch registered suppliers from backend
  useEffect(() => {
    api.supplier.getAll()
      .then((res) => {
        if (res?.suppliers && res.suppliers.length > 0) {
          dispatch({
            type: 'HYDRATE_SERVER_DATA',
            data: { suppliers: res.suppliers },
          })
        }
      })
      .catch((err) => console.warn('Could not fetch latest suppliers:', err.message))
  }, [dispatch])

  // Dynamically compute suppliers matching this location, category & pooled quantity
  const suppliers = useMemo(() => {
    return getSuppliersForGroupAndLocation(
      category,
      activeLocation,
      pooledQty,
      myQty,
      unit,
      specification,
      state.suppliers
    )
  }, [category, activeLocation, pooledQty, myQty, unit, specification, state.suppliers])

  // Single supplier selection (defaults to the first matching supplier)
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    () => pendingOrder?.supplierId || ''
  )

  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].supplierId)
    }
  }, [selectedSupplierId, suppliers])

  // Enlarge photo modal state
  const [zoomedPhoto, setZoomedPhoto] = useState(null)

  const activeSupplier = useMemo(() => {
    return suppliers.find((s) => s.supplierId === selectedSupplierId) || suppliers[0]
  }, [suppliers, selectedSupplierId])

  function handleSelectSupplier(supplierId) {
    setSelectedSupplierId(supplierId)
  }

  function handleProceedToConfirm() {
    if (!activeSupplier) return

    // Build consolidated pending order object with chosen supplier details
    const updatedOrder = {
      ...(pendingOrder || {}),
      id: pendingOrder?.id || `ORD-${Date.now().toString().slice(-6)}`,
      batchId: queryBatchId || pendingOrder?.batchId || null,
      selectedGroup,
      category,
      specification: activeSupplier.specification,
      unit,
      totalQuantity: pooledQty,
      // Chosen Supplier details
      supplierId: activeSupplier.supplierId,
      supplierName: activeSupplier.supplierName,
      supplierLocation: activeSupplier.storeLocation,
      supplierRating: activeSupplier.supplierRating,
      reviewsCount: activeSupplier.reviewsCount,
      deliveryEta: activeSupplier.deliveryEta,
      carrierMode: activeSupplier.carrierMode,
      logistics: activeSupplier.logistics,
      qualityTier: activeSupplier.qualityTier,
      photoUrl: activeSupplier.photoUrl,
      validity: activeSupplier.validity,
      // Cost & Share calculations
      pricePerUnit: activeSupplier.unitPrice,
      transportCharge: activeSupplier.transportTotal,
      transportTotal: activeSupplier.transportTotal,
      materialTotal: activeSupplier.materialTotal,
      totalCost: activeSupplier.myShare.totalCost,
      totalSavings: activeSupplier.soloComparison.savings,
      purchaseMode: 'group',
      myShare: activeSupplier.myShare,
      perArtisan: (() => {
        const myArtisanId = artisan?.id || 'A-PARTHA'
        const myArtisanName = artisan?.name || 'Partha'
        const remainingQty = Math.max(0, pooledQty - myQty)
        const peers = selectedGroup.fellowArtisans || []
        const fellowSplits = peers.length > 0
          ? peers.map((p, idx) => {
              const peerQty = p.orderedQty || Math.round(remainingQty / peers.length)
              const peerMatCost = Math.round(peerQty * activeSupplier.unitPrice)
              const peerTransShare = Math.round((activeSupplier.transportTotal || 0) * (peerQty / (pooledQty || 1)))
              return {
                artisanId: p.id || `A-PEER-${idx + 1}`,
                artisanName: p.name || `Artisan Peer ${idx + 1}`,
                artisanLocation: p.location || activeLocation,
                quantity: peerQty,
                materialCost: peerMatCost,
                transportShare: peerTransShare,
                totalCost: peerMatCost + peerTransShare,
              }
            })
          : remainingQty > 0
            ? [
                {
                  artisanId: 'A-TEZ-101',
                  artisanName: 'Bipul Kalita',
                  artisanLocation: activeLocation,
                  quantity: Math.round(remainingQty * 0.55),
                  materialCost: Math.round(remainingQty * 0.55 * activeSupplier.unitPrice),
                  transportShare: Math.round((activeSupplier.transportTotal || 0) * 0.55),
                  totalCost: Math.round(remainingQty * 0.55 * activeSupplier.unitPrice) + Math.round((activeSupplier.transportTotal || 0) * 0.55),
                },
                {
                  artisanId: 'A-TEZ-102',
                  artisanName: 'Deepali Nath',
                  artisanLocation: activeLocation,
                  quantity: remainingQty - Math.round(remainingQty * 0.55),
                  materialCost: Math.round((remainingQty - Math.round(remainingQty * 0.55)) * activeSupplier.unitPrice),
                  transportShare: Math.round((activeSupplier.transportTotal || 0) * 0.45),
                  totalCost: Math.round((remainingQty - Math.round(remainingQty * 0.55)) * activeSupplier.unitPrice) + Math.round((activeSupplier.transportTotal || 0) * 0.45),
                },
              ]
            : []

        return [
          {
            artisanId: myArtisanId,
            artisanName: myArtisanName,
            artisanLocation: artisan?.storeLocation || activeLocation,
            quantity: myQty,
            materialCost: activeSupplier.myShare.materialCost,
            transportShare: activeSupplier.myShare.transportShare,
            totalCost: activeSupplier.myShare.totalCost,
          },
          ...fellowSplits,
        ]
      })(),
    }

    // Save to App State
    dispatch({
      type: 'SET_PENDING_ORDER',
      payload: updatedOrder,
    })

    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'order_confirmation',
      onboarding_complete: false,
    })

    // Navigate to Order Confirmation
    navigate('/artisan/confirm')
  }

  function handleBackToGroups() {
    navigate(
      `/artisan/matching?category=${encodeURIComponent(category)}&location=${encodeURIComponent(activeLocation)}${queryBatchId ? `&batchId=${queryBatchId}` : ''}${queryReqId ? `&reqId=${queryReqId}` : ''}`
    )
  }

  return (
    <div className="page">
      {/* 6-Step Stepper: Step 3 is 'Choose supplier' */}
      <Stepper steps={ARTISAN_STEPS} current={3} />

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏪</span>
              <span>Choose Vetted Supplier in {activeLocation}</span>
            </h1>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--ink-soft)', fontSize: '0.95rem' }}>
              Select <strong>one</strong> trusted supplier for your pooled group order. Evaluate material quality photos, delivery time, and verified ratings from previous artisans.
            </p>
          </div>

          <span className="tag tag-brass" style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.8rem' }}>
            📍 Suppliers in {activeLocation} ({suppliers.length} Available)
          </span>
        </div>
      </div>

      {/* Group & Order Context Pill Banner */}
      {/* Sleek Minimal Context Banner */}
      <div className="supplier-context-banner-clean">
        <div>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>👥 Group: </span>
          <strong>{selectedGroup.groupName || 'Regional Guild'}</strong>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}> ({selectedGroup.artisanCount || 3} Artisans)</span>
        </div>
        <div>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>📍 Hub: </span>
          <strong>{activeLocation}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>📦 Bulk: </span>
          <strong>{pooledQty} {unit} {category}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>👤 Your Share: </span>
          <strong style={{ color: 'var(--brass-dark, #8F6415)' }}>{myQty} {unit}</strong>
        </div>
      </div>

      {/* 3 Suppliers Cards Grid (Minimalist & Clean) */}
      <section style={{ marginTop: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="supplier-cards-grid">
          {suppliers.map((sup, idx) => {
            const isSelected = sup.supplierId === selectedSupplierId

            return (
              <div
                key={sup.supplierId}
                className={`supplier-card-clean ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelectSupplier(sup.supplierId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectSupplier(sup.supplierId)
                  }
                }}
              >
                {/* Header: Name, Store Location & Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`clean-radio-circle ${isSelected ? 'is-checked' : ''}`}>
                        {isSelected ? '✓' : idx + 1}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.25 }}>
                        {sup.supplierName}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.2rem', paddingLeft: '1.7rem' }}>
                      📍 {sup.storeLocation}
                    </div>
                    {sup.badge && (
                      <div style={{ paddingLeft: '1.7rem', marginTop: '0.25rem' }}>
                        <span className="tag" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                          {sup.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="clean-rating-badge">
                      <span style={{ color: '#eab308' }}>★</span> <strong>{sup.supplierRating.toFixed(1)}</strong>
                      <span style={{ color: 'var(--ink-soft)', fontSize: '0.72rem' }}> ({sup.reviewsCount})</span>
                    </div>
                    <span className={`tag ${isSelected ? 'tag-green' : 'tag-brass'}`} style={{ fontSize: '0.7rem', marginTop: '0.25rem', display: 'inline-block' }}>
                      {isSelected ? '✓ Selected' : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Compact Material Quality Thumbnail & Spec */}
                <div className="clean-material-row">
                  <div
                    className="clean-photo-thumb"
                    onClick={(e) => {
                      e.stopPropagation()
                      setZoomedPhoto({
                        url: sup.photoUrl,
                        title: `${category} Sample - ${sup.supplierName}`,
                        spec: sup.specification,
                        purity: sup.purityStandard,
                      })
                    }}
                    title="Click to zoom material photo"
                  >
                    <img src={sup.photoUrl} alt={category} className="clean-thumb-img" />
                    <span className="clean-thumb-zoom">🔍 Zoom</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.25 }}>
                      {sup.specification}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, marginTop: '0.2rem' }}>
                      ✓ {sup.qualityTier}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
                      ⚡ <strong>{sup.deliveryEta}</strong> &middot; {sup.carrierMode}
                    </div>
                  </div>
                </div>

                {/* Minimal Single Verified Review Snippet */}
                {sup.artisanReviews?.[0] && (
                  <div className="clean-review-quote">
                    💬 "{sup.artisanReviews[0].comment}"
                    <span className="clean-review-author">
                      {' '}— {sup.artisanReviews[0].artisanName} ({sup.artisanReviews[0].artisanLocation.split(',')[0]})
                    </span>
                  </div>
                )}

                {/* Clean Wholesale Pricing & Fair Share */}
                <div className="clean-pricing-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Wholesale: </span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>₹{sup.unitPrice}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--ink-soft)' }}>/{sup.unit}</span>
                      <span style={{ textDecoration: 'line-through', fontSize: '0.72rem', color: 'var(--ink-soft)', marginLeft: '0.35rem' }}>
                        ₹{sup.retailUnit}
                      </span>
                    </div>
                    <span className="clean-savings-pill">
                      Save {sup.soloComparison.savingsPct}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(192,138,40,0.2)', paddingTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                      Your Share ({sup.myQty} {sup.unit}):
                    </span>
                    <strong style={{ fontSize: '1.18rem', color: 'var(--brass-dark, #8F6415)' }}>
                      ₹{sup.myShare.totalCost.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Select CTA Button on Card */}
                <button
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.55rem', fontWeight: 700 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectSupplier(sup.supplierId)
                  }}
                >
                  {isSelected ? `✓ Selected: ${sup.supplierName.split(' ')[0]}` : `Choose ${sup.supplierName.split(' ')[0]}`}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Rules Banner for Transparency */}
      <div style={{ marginBottom: '1.5rem' }}>
        <RulesBanner compact />
      </div>

      {/* Sticky Bottom Action Navigation Bar */}
      <div className="supplier-bottom-bar">
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleBackToGroups}
        >
          ← Back to Artisan Groups
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              Chosen Supplier in {activeLocation}:
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>
              {activeSupplier?.supplierName}
            </strong>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1.02rem', fontWeight: 700 }}
            onClick={handleProceedToConfirm}
          >
            Proceed to Order Confirmation with {activeSupplier?.supplierName.split(' ')[0]} →
          </button>
        </div>
      </div>

      {/* High-Resolution Photo Zoom Modal */}
      {zoomedPhoto && (
        <div
          className="photo-modal-overlay"
          onClick={() => setZoomedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{zoomedPhoto.title}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                  {zoomedPhoto.spec} &middot; 🛡️ {zoomedPhoto.purity}
                </p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setZoomedPhoto(null)}
              >
                ✕ Close
              </button>
            </div>

            <div className="photo-modal-img-container">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="photo-modal-img"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
              <span>✓ High-Resolution Verified Quality Sample</span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}
                onClick={() => setZoomedPhoto(null)}
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
