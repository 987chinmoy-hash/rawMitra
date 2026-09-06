import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import {
  analyzeCompatibleArtisans,
  generateProcurementChoices,
  DELIVERY_LOCATIONS,
  resolveDeliveryLocation,
} from '../../utils/matching.js'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import RatingStars from '../../components/RatingStars.jsx'
import './artisan.css'

const CATEGORY_ICONS = {
  Bamboo: '🎋',
  Clay: '🏺',
  Yarn: '🧵',
  Dyes: '🎨',
  Metal: '⚒️',
  Packaging: '📦',
}

export default function ArtisanMatching() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const artisan =
    getCurrentArtisan(state) ||
    (state.authUser?.role === 'artisan' ? state.authUser : null) ||
    state.artisans[0] || {
      id: 'A-1001',
      name: 'Deepa Boro',
      role: 'artisan',
      storeLocation: 'Tezpur, Assam',
    }

  const queryBatchId = searchParams.get('batchId') || state.currentBatchId
  const queryCat = searchParams.get('category')
  const queryReqId = searchParams.get('reqId')
  const queryLoc = searchParams.get('location')

  // Find the artisan's active requests strictly for the active batch
  const myRequests = useMemo(() => {
    const all = state.materialRequests || []

    // 1. Strictly filter by batchId if present (from URL or state)
    if (queryBatchId) {
      const byBatch = all.filter((r) => r.batchId === queryBatchId)
      if (byBatch.length > 0) {
        return byBatch
      }
    }

    // 2. If state has currentBatchRequests and it matches
    if (state.currentBatchRequests && state.currentBatchRequests.length > 0) {
      if (!queryBatchId || state.currentBatchId === queryBatchId) {
        return state.currentBatchRequests
      }
    }

    // 3. Fallback: only unfulfilled requests of the most recent batch for this artisan
    const artisanReqs = all.filter(
      (r) => (r.artisanId === artisan.id || !r.artisanId) && r.status !== 'fulfilled'
    )
    if (artisanReqs.length > 0) {
      const latestBatchId = artisanReqs[artisanReqs.length - 1]?.batchId
      if (latestBatchId) {
        const latestBatch = artisanReqs.filter((r) => r.batchId === latestBatchId)
        if (latestBatch.length > 0) return latestBatch
      }
      return [artisanReqs[artisanReqs.length - 1]]
    }

    // 4. Default fallback request
    return [
      {
        id: 'R-MY-01',
        batchId: 'BATCH-DEFAULT',
        artisanId: artisan.id,
        category: 'Bamboo',
        specification: 'Treated Bhaluka bamboo poles, 10ft',
        quantity: 25,
        unit: 'piece',
        location: artisan.storeLocation || 'Tezpur, Assam',
        requiredDate: '2026-09-28',
        status: 'open',
      },
    ]
  }, [state.materialRequests, state.currentBatchRequests, state.currentBatchId, queryBatchId, artisan])

  // Determine initial active request matching query parameters if provided
  const [activeReqIndex, setActiveReqIndex] = useState(() => {
    if (queryReqId) {
      const idx = myRequests.findIndex((r) => r.id === queryReqId)
      if (idx !== -1) return idx
    }
    if (queryCat) {
      const idx = myRequests.findIndex(
        (r) => r.category.toLowerCase() === queryCat.toLowerCase()
      )
      if (idx !== -1) return idx
    }
    return 0
  })

  // Keep activeReqIndex in bounds if requests change
  useEffect(() => {
    if (queryReqId) {
      const idx = myRequests.findIndex((r) => r.id === queryReqId)
      if (idx !== -1) {
        setActiveReqIndex(idx)
        return
      }
    }
    if (queryCat) {
      const idx = myRequests.findIndex(
        (r) => r.category.toLowerCase() === queryCat.toLowerCase()
      )
      if (idx !== -1) {
        setActiveReqIndex(idx)
        return
      }
    }
    if (activeReqIndex >= myRequests.length) {
      setActiveReqIndex(0)
    }
  }, [queryReqId, queryCat, myRequests])

  const currentReq = myRequests[activeReqIndex] || myRequests[0]

  // Track active delivery hub (Tezpur, Guwahati, or Dibrugarh)
  const [activeDeliveryLocation, setActiveDeliveryLocation] = useState(() =>
    resolveDeliveryLocation(queryLoc || currentReq?.location || artisan?.storeLocation || 'Tezpur')
  )

  useEffect(() => {
    if (queryLoc) {
      setActiveDeliveryLocation(resolveDeliveryLocation(queryLoc))
    } else if (currentReq?.location) {
      setActiveDeliveryLocation(resolveDeliveryLocation(currentReq.location))
    }
  }, [queryLoc, currentReq?.location])

  const currentReqWithLoc = useMemo(() => {
    if (!currentReq) return null
    return {
      ...currentReq,
      location: activeDeliveryLocation,
    }
  }, [currentReq, activeDeliveryLocation])

  // Track independent choice selection per material request ID: { [reqId]: choiceId }
  const [selectedChoicesByReq, setSelectedChoicesByReq] = useState({})

  // 1. Run database compatibility analysis strictly for this material in this location
  const analysis = useMemo(() => {
    if (!currentReqWithLoc) return null
    return analyzeCompatibleArtisans(
      currentReqWithLoc,
      state.materialRequests || [],
      state.artisans || []
    )
  }, [currentReqWithLoc, state.materialRequests, state.artisans])

  // 2. Generate 3 curated location-based artisan groups strictly for this material
  const choices = useMemo(() => {
    if (!currentReqWithLoc) return []
    return generateProcurementChoices(
      currentReqWithLoc,
      analysis,
      state.suppliers || [],
      artisan
    )
  }, [currentReqWithLoc, analysis, state.suppliers, artisan])

  // Active choice ID for currentReq (defaults to first group in location)
  const activeChoiceId =
    (currentReq && selectedChoicesByReq[currentReq.id]) ||
    choices[0]?.id ||
    'group-tezpur-1'

  const activeChoice =
    choices.find((c) => c.id === activeChoiceId) || choices[0] || null

  function handleSelectChoice(choiceId) {
    if (!currentReq) return
    setSelectedChoicesByReq((prev) => ({
      ...prev,
      [currentReq.id]: choiceId,
    }))
  }

  // Pre-generate procurement choices for all requests in this batch
  const allChoicesByReq = useMemo(() => {
    const map = {}
    for (const req of myRequests) {
      const rWithLoc = { ...req, location: activeDeliveryLocation }
      const a = analyzeCompatibleArtisans(
        rWithLoc,
        state.materialRequests || [],
        state.artisans || []
      )
      const ch = generateProcurementChoices(
        rWithLoc,
        a,
        state.suppliers || [],
        artisan
      )
      map[req.id] = ch
    }
    return map
  }, [myRequests, state.materialRequests, state.artisans, state.suppliers, artisan, activeDeliveryLocation])

  // Consolidated batch item representations
  const batchItems = useMemo(() => {
    return myRequests.map((req) => {
      const choicesForReq = allChoicesByReq[req.id] || []
      const defaultChoiceId = choicesForReq[0]?.id || 'group-tezpur-1'
      const chosenChoiceId = selectedChoicesByReq[req.id] || defaultChoiceId
      const chosenPlan =
        choicesForReq.find((c) => c.id === chosenChoiceId) ||
        choicesForReq[0] ||
        null

      return {
        reqId: req.id,
        category: req.category,
        specification: chosenPlan?.supplier?.specification || req.specification,
        quantity: req.quantity,
        unit: req.unit,
        chosenPlanId: chosenPlan?.id || defaultChoiceId,
        chosenPlanTitle: chosenPlan?.title || chosenPlan?.groupName || 'Artisan Group',
        chosenPlanBadge: chosenPlan?.badge || '👥 Artisan Group',
        deliveryEta: chosenPlan?.deliveryEta || '3-5 business days',
        supplierId: chosenPlan?.supplier?.supplierId || 'S-DEFAULT',
        supplierName: chosenPlan?.supplier?.supplierName || 'Verified Regional Supplier',
        supplierLocation: chosenPlan?.supplier?.supplierLocation || 'Guwahati, Assam',
        supplierRating: chosenPlan?.supplier?.supplierRating || 4.8,
        unitPrice: chosenPlan?.unitPrice || 100,
        logistics: chosenPlan?.supplier?.logistics || 'shipment',
        myMaterialCost: chosenPlan?.myShare?.materialCost || (req.quantity * 100),
        myTransportShare: chosenPlan?.myShare?.transportShare || 0,
        myTotalCost: chosenPlan?.myShare?.totalCost || (req.quantity * 100),
        totalPooledQuantity: chosenPlan?.totalPooledQuantity || req.quantity,
        perArtisan: chosenPlan?.perArtisan || [],
        soloComparison: chosenPlan?.soloComparison || { savings: 0, savingsPct: 0 },
        validity: chosenPlan?.supplier?.validity || '2026-09-30',
      }
    })
  }, [myRequests, allChoicesByReq, selectedChoicesByReq])

  const batchMaterialTotal = useMemo(
    () => batchItems.reduce((acc, it) => acc + (it.myMaterialCost || 0), 0),
    [batchItems]
  )
  const batchTransportTotal = useMemo(
    () => batchItems.reduce((acc, it) => acc + (it.myTransportShare || 0), 0),
    [batchItems]
  )
  const batchGrandTotal = useMemo(
    () => batchItems.reduce((acc, it) => acc + (it.myTotalCost || 0), 0),
    [batchItems]
  )
  const batchTotalSavings = useMemo(
    () => batchItems.reduce((acc, it) => acc + (it.soloComparison?.savings || 0), 0),
    [batchItems]
  )

  function handleProceedToConfirm() {
    if (!activeChoice && batchItems.length === 0) return

    const isMultiItem = batchItems.length > 1
    const orderId = `ORD-${Date.now().toString().slice(-6)}`

    // Prepare combined order payload for confirmation
    const payload = {
      id: orderId,
      batchId: queryBatchId || `BATCH-${Date.now().toString().slice(-6)}`,
      isBatch: isMultiItem,
      itemsCount: batchItems.length,
      items: batchItems,
      // Aggregated fields for display and backwards compatibility:
      category: isMultiItem
        ? batchItems.map((it) => it.category).join(', ')
        : (currentReq?.category || batchItems[0]?.category),
      specification: isMultiItem
        ? `${batchItems.length} Materials Procurement Bundle`
        : (batchItems[0]?.specification || currentReq?.specification),
      unit: isMultiItem ? 'bundle' : (batchItems[0]?.unit || currentReq?.unit || 'piece'),
      totalQuantity: batchItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0),
      supplierId: batchItems[0]?.supplierId,
      supplierName: isMultiItem
        ? `${batchItems.length} Verified Suppliers`
        : batchItems[0]?.supplierName,
      supplierLocation: batchItems[0]?.supplierLocation,
      planId: isMultiItem ? 'batch-optimized' : activeChoice.id,
      planTitle: isMultiItem ? 'Multi-Material Optimized Procurement' : activeChoice.title,
      planBadge: isMultiItem ? '📦 Batch Order' : activeChoice.badge,
      deliveryEta: batchItems[0]?.deliveryEta || '3-5 business days',
      pricePerUnit: isMultiItem ? 0 : (activeChoice?.unitPrice || 0),
      logistics: 'Syndicate Logistics Network',
      transportCharge: batchTransportTotal,
      validity: batchItems[0]?.validity || '2026-09-30',
      purchaseMode: 'group',
      materialTotal: batchMaterialTotal,
      transportTotal: batchTransportTotal,
      totalCost: batchGrandTotal,
      totalSavings: batchTotalSavings,
      myShare: {
        quantity: batchItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0),
        materialCost: batchMaterialTotal,
        transportShare: batchTransportTotal,
        totalCost: batchGrandTotal,
      },
      perArtisan: batchItems[0]?.perArtisan || [],
    }

    dispatch({
      type: 'SET_PENDING_ORDER',
      payload,
    })

    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'choose_supplier',
      onboarding_complete: false,
    })

    navigate(
      `/artisan/suppliers?category=${encodeURIComponent(currentReq.category)}&location=${encodeURIComponent(activeDeliveryLocation)}${queryBatchId ? `&batchId=${queryBatchId}` : ''}&reqId=${currentReq.id}&groupId=${activeChoice.id}`
    )
  }

  return (
    <div className="page">
      <Stepper
        steps={['Your details', 'Material needs', 'Artisan groups', 'Choose supplier', 'Confirm', 'Track']}
        current={2}
      />

      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('matchingTitle') || '2. Compatible Artisan Matching'}</h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--ink-soft)' }}>
            {t('matchingSub') || 'The system has analyzed regional demand and clustered compatible artisans to give you curated purchasing choices.'}
          </p>
        </div>
      </div>

      {/* Interactive Material Switcher Tabs (Strictly showing materials added in this active order batch) */}
      {myRequests.length > 1 && (
        <div className="material-switcher-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>
              📦 Materials in Active Order Batch ({myRequests.length} Items):
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              Click to configure group & supplier for each material
            </span>
          </div>

          <div className="material-switcher-tabs">
            {myRequests.map((r, i) => {
              const isCurrent = i === activeReqIndex
              const itemConfig = batchItems.find((b) => b.reqId === r.id) || batchItems[i]
              return (
                <button
                  key={r.id || i}
                  type="button"
                  onClick={() => {
                    setActiveReqIndex(i)
                    setSearchParams({
                      batchId: queryBatchId || '',
                      category: r.category,
                      reqId: r.id,
                    })
                  }}
                  className={`material-switcher-tab ${isCurrent ? 'is-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{CATEGORY_ICONS[r.category] || '📦'}</span>
                    <strong>{r.category}</strong>
                    <span className="tab-qty-badge">
                      {r.quantity} {r.unit}
                    </span>
                  </div>
                  <div className="tab-plan-label">
                    {itemConfig?.chosenPlanBadge || '🏆 District Mega-Bulk'} &middot; ₹{itemConfig?.myTotalCost?.toLocaleString('en-IN')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Three Location-Based Artisan Groups Header (Minimalist & Clean) */}
      <div style={{ marginTop: '1.25rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem' }}>
          📍 3 Artisan Groups in {activeDeliveryLocation}
        </h2>
        <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '0.9rem' }}>
          Choose an artisan group pooling orders for <strong>{currentReq.category}</strong> to unlock wholesale rates and share freight.
        </p>
      </div>

      <div className="choices-grid">
        {choices.map((choice) => {
          const isSelected = activeChoiceId === choice.id

          return (
            <div
              key={choice.id}
              className={`choice-card group-choice-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelectChoice(choice.id)}
            >
              <div>
                {/* Header: Group Name and Artisan Count Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div>
                    <h3 className="choice-title" style={{ margin: 0, fontSize: '1.12rem' }}>
                      {choice.groupName}
                    </h3>
                    <div className="choice-subtitle" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>
                      📍 {choice.subtitle}
                    </div>
                  </div>
                  <span className="group-artisan-count-badge" style={{ flexShrink: 0 }}>
                    👥 <strong>{choice.artisanCount} Artisans</strong>
                  </span>
                </div>

                {/* Fellow Artisans & How Much They Ordered (Clean Minimalist List) */}
                <div className="choice-peers-wrap" style={{ marginTop: '0.6rem', marginBottom: '0.75rem' }}>
                  <span className="choice-peers-label" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Group Members & Quantities:
                  </span>
                  <div className="choice-peers-list" style={{ marginTop: '0.4rem', gap: '0.35rem' }}>
                    {choice.perArtisan.map((member) => (
                      <div
                        key={member.artisanId}
                        className={`peer-chip ${member.isMe ? 'is-me' : ''}`}
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                      >
                        <div>
                          <span>{member.isMe ? '👤 ' : '• '}</span>
                          <strong>{member.name}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--ink-soft)', marginLeft: '0.35rem' }}>
                            ({member.location.split(',')[0]})
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: member.isMe ? 'var(--brass-dark, #8F6415)' : 'var(--ink)' }}>
                            {member.quantity} {currentReq.unit}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Bulk Before Ordering */}
                <div className="bulk-stat-box" style={{ padding: '0.6rem 0.8rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
                      📦 Combined Group Volume:
                    </span>
                    <strong style={{ fontSize: '1.02rem', color: '#15803d' }}>
                      {choice.totalPooledQuantity} {currentReq.unit}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Calculated Cost Highlights: Your Payable Amount */}
              <div>
                <div className="choice-cost-highlight" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                  <div className="choice-cost-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                      Your Payable Share:
                    </span>
                    <span className="choice-cost-val" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      ₹{choice.myShare.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="choice-cost-breakdown" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    ₹{choice.myShare.materialCost.toLocaleString('en-IN')} material + ₹{choice.myShare.transportShare.toLocaleString('en-IN')} freight
                  </div>

                  <div className="choice-savings-tag" style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
                    🎉 Save ₹{choice.soloComparison.savings.toLocaleString('en-IN')} ({choice.soloComparison.savingsPct}% vs solo)
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-select-choice"
                  style={{ marginTop: '0.65rem', padding: '0.55rem' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectChoice(choice.id)
                  }}
                >
                  {isSelected ? '✓ Selected Group' : `Select Group ${choice.groupNumber}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Clean Selected Group Summary & CTA Bar */}
      {activeChoice && myRequests.length === 1 && (
        <div className="action-bar-confirm" style={{ marginTop: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
              Selected: {activeChoice.groupName} ({activeChoice.artisanCount} Artisans)
            </div>
            <span style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
              Total pooled bulk: <strong>{activeChoice.totalPooledQuantity} {currentReq.unit}</strong> &middot; Your payable share: <strong style={{ color: 'var(--brass-dark, #8F6415)' }}>₹{activeChoice.myShare.totalCost.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', fontWeight: 700 }}
            onClick={handleProceedToConfirm}
          >
            Proceed to Supplier Selection (3 in {activeDeliveryLocation}) →
          </button>
        </div>
      )}

      {/* 4. Combined Multi-Material Batch Order Summary (Rendered when 2+ materials exist in this batch) */}
      {myRequests.length > 1 && (
        <section className="batch-order-summary-card" aria-label="Combined Batch Order Summary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span className="tag tag-brass" style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'inline-block' }}>
                ⚡ Consolidated Multi-Material Checkout
              </span>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                Complete Batch Order Summary ({batchItems.length} Materials)
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                All {batchItems.length} materials below are consolidated into this single procurement order with fair freight splits.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Total Batch Payable</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
                ₹{batchGrandTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                🎉 Total Batch Savings: ₹{batchTotalSavings.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <table className="batch-summary-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Selected Plan</th>
                <th>Supplier & ETA</th>
                <th>Material Cost</th>
                <th>Freight Share</th>
                <th>Your Share</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {batchItems.map((item, idx) => {
                const isEditing = idx === activeReqIndex
                return (
                  <tr key={item.reqId || idx} className={isEditing ? 'is-editing-row' : ''}>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {CATEGORY_ICONS[item.category] || '📦'} {item.category}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                        {item.specification?.slice(0, 32)}
                      </div>
                    </td>
                    <td>
                      <strong>{item.quantity} {item.unit}</strong>
                    </td>
                    <td>
                      <span className="tag tag-green" style={{ fontSize: '0.78rem' }}>
                        {item.chosenPlanBadge}
                      </span>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>
                        {item.chosenPlanTitle}
                      </div>
                    </td>
                    <td>
                      <div>{item.supplierName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                        📍 {item.supplierLocation} &middot; {item.deliveryEta}
                      </div>
                    </td>
                    <td>₹{item.myMaterialCost.toLocaleString('en-IN')}</td>
                    <td>₹{item.myTransportShare.toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ color: 'var(--ink)' }}>₹{item.myTotalCost.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-text-edit"
                        onClick={() => {
                          setActiveReqIndex(idx)
                          const r = myRequests[idx]
                          if (r) {
                            setSearchParams({ batchId: queryBatchId || '', category: r.category, reqId: r.id })
                          }
                        }}
                      >
                        {isEditing ? '● Editing' : '✏️ Change Plan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                <td colSpan={4} style={{ textAlign: 'right', padding: '0.75rem' }}>
                  Consolidated Batch Totals:
                </td>
                <td style={{ padding: '0.75rem' }}>₹{batchMaterialTotal.toLocaleString('en-IN')}</td>
                <td style={{ padding: '0.75rem' }}>₹{batchTransportTotal.toLocaleString('en-IN')}</td>
                <td colSpan={2} style={{ padding: '0.75rem', fontSize: '1.1rem', color: 'var(--brass-dark, #8F6415)' }}>
                  ₹{batchGrandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="batch-checkout-action-row">
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                Final Batch Payable: ₹{batchGrandTotal.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                Includes {batchItems.length} materials, verified supplier allocations, and consolidated freight dispatch.
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}
              onClick={handleProceedToConfirm}
            >
              Proceed to Choose Suppliers for All {batchItems.length} Materials →
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
