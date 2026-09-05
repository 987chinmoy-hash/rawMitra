import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { analyzeCompatibleArtisans, generateProcurementChoices } from '../../utils/matching.js'
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
      storeLocation: 'Sualkuchi, Assam',
    }

  const queryBatchId = searchParams.get('batchId') || state.currentBatchId
  const queryCat = searchParams.get('category')
  const queryReqId = searchParams.get('reqId')

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
        location: artisan.storeLocation || 'Sualkuchi, Assam',
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

  // Track independent choice selection per material request ID: { [reqId]: choiceId }
  const [selectedChoicesByReq, setSelectedChoicesByReq] = useState({})

  // Active choice ID for currentReq (defaults to 'choice-mega-bulk')
  const activeChoiceId =
    (currentReq && selectedChoicesByReq[currentReq.id]) ||
    'choice-mega-bulk'

  // 1. Run database compatibility analysis strictly for this material
  const analysis = useMemo(() => {
    if (!currentReq) return null
    return analyzeCompatibleArtisans(
      currentReq,
      state.materialRequests || [],
      state.artisans || []
    )
  }, [currentReq, state.materialRequests, state.artisans])

  // 2. Generate 3 curated procurement choices strictly for this material
  const choices = useMemo(() => {
    if (!currentReq || !analysis) return []
    return generateProcurementChoices(
      currentReq,
      analysis,
      state.suppliers || [],
      artisan
    )
  }, [currentReq, analysis, state.suppliers, artisan])

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
      const a = analyzeCompatibleArtisans(
        req,
        state.materialRequests || [],
        state.artisans || []
      )
      const ch = generateProcurementChoices(
        req,
        a,
        state.suppliers || [],
        artisan
      )
      map[req.id] = ch
    }
    return map
  }, [myRequests, state.materialRequests, state.artisans, state.suppliers, artisan])

  // Consolidated batch item representations
  const batchItems = useMemo(() => {
    return myRequests.map((req) => {
      const choicesForReq = allChoicesByReq[req.id] || []
      const chosenChoiceId = selectedChoicesByReq[req.id] || 'choice-mega-bulk'
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

        neededBy: req.requiredDate,
        
        chosenPlanId: chosenPlan?.id || 'choice-mega-bulk',
        chosenPlanTitle: chosenPlan?.title || 'District Mega-Bulk Tier',
        chosenPlanBadge: chosenPlan?.badge || '🏆 Maximum Savings',
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

      neededBy: batchItems[0]?.neededBy || currentReq?.requiredDate,

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
      current_step: 'order_confirmation',
      onboarding_complete: false,
    })

    navigate('/artisan/confirm')
  }

  return (
    <div className="page">
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
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

      {/* 1. Database Compatibility Analysis Radar (Dynamic according to selected group) */}
      {analysis && activeChoice && (
        <section className="analysis-radar-card" aria-label="Database Compatibility Radar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div className="analysis-radar-title">
              <span>📡</span>
              <span>{t('dbAnalysisHeader') || 'Database Analysis & Dynamic Group Radar'}</span>
            </div>
            <span
              style={{
                background: 'rgba(251, 191, 36, 0.2)',
                color: '#fef08a',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              ⚡ Active Group: {activeChoice.title}
            </span>
          </div>

          <p className="analysis-radar-sub">
            {`Scanned Assam craft network for ${currentReq.category} (${currentReq.specification || 'craft grade'}). Displaying real-time allocation for selected group strategy (${activeChoice.badge}) supplied by ${activeChoice.supplier.supplierName} (${activeChoice.supplier.supplierLocation}).`}
          </p>

          {/* Group Strategy Selector Quick Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
            {choices.map((c) => {
              const isCurrent = c.id === activeChoice.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectChoice(c.id)}
                  style={{
                    background: isCurrent ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                    border: isCurrent ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.18)',
                    color: isCurrent ? '#fbbf24' : '#ffffff',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.badge.split(' ')[0]} {c.title}
                </button>
              )
            })}
          </div>

          {/* Dynamic KPIs driven by active selected group */}
          <div className="analysis-kpi-grid">
            <div className="analysis-kpi-item">
              <div className="analysis-kpi-val">{activeChoice.perArtisan.length} Artisans</div>
              <div className="analysis-kpi-lbl">Artisans in Selected Group</div>
            </div>
            <div className="analysis-kpi-item">
              <div className="analysis-kpi-val">
                {activeChoice.totalPooledQuantity} {currentReq.unit}
              </div>
              <div className="analysis-kpi-lbl">Consolidated Group Volume</div>
            </div>
            <div className="analysis-kpi-item">
              <div className="analysis-kpi-val">
                Save {activeChoice.soloComparison.savingsPct}%
              </div>
              <div className="analysis-kpi-lbl">Group Syndicate Discount</div>
            </div>
            <div className="analysis-kpi-item">
              <div className="analysis-kpi-val">{activeChoice.deliveryEta}</div>
              <div className="analysis-kpi-lbl">Estimated Delivery ETA</div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Three Curated Procurement Choices */}
      <section className="choices-section-heading">
        <h2 style={{ fontSize: '1.45rem', margin: '0 0 0.35rem' }}>
          {t('threeChoicesHeading') || 'Select Your Procurement Plan (3 Curated Choices)'}
        </h2>
        <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '0.92rem' }}>
          {t('threeChoicesSub') ||
            'Choose between local rapid dispatch, maximum wholesale tier savings, or verified top-rated direct delivery.'}
        </p>
      </section>

      <div className="choices-grid">
        {choices.map((choice) => {
          const isSelected = activeChoiceId === choice.id

          return (
            <div
              key={choice.id}
              className={`choice-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelectChoice(choice.id)}
            >
              <div>
                <span
                  className="choice-badge-top"
                  style={{
                    background: isSelected ? 'var(--brass)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#334155',
                  }}
                >
                  {choice.badge}
                </span>

                <h3 className="choice-title">{choice.title}</h3>
                <div className="choice-subtitle">{choice.subtitle}</div>

                {/* Supplier Preview */}
                <div className="choice-supplier-box">
                  <div>
                    <strong>{choice.supplier.supplierName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      📍 {choice.supplier.supplierLocation} &middot; {choice.deliveryEta}
                    </div>
                  </div>
                  <RatingStars value={choice.supplier.supplierRating} />
                </div>

                {/* Fellow Artisans Pooled */}
                <div className="choice-peers-wrap">
                  <span className="choice-peers-label">
                    {t('fellowArtisansInPool') || 'Pooled Artisans'} ({choice.perArtisan.length}):
                  </span>
                  <div className="choice-peers-list">
                    {choice.perArtisan.map((member) => (
                      <div
                        key={member.artisanId}
                        className={`peer-chip ${member.isMe ? 'is-me' : ''}`}
                      >
                        <span>
                          {member.isMe ? '👤 You' : `👥 ${member.name}`}
                          {!member.isMe && (
                            <span style={{ color: 'var(--ink-soft)', fontSize: '0.74rem' }}>
                              {' '}
                              ({member.location.split(',')[0]} &middot; {member.distanceKm} km)
                            </span>
                          )}
                        </span>
                        <span>
                          {member.quantity} {currentReq.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Cost Highlights */}
              <div>
                <div className="choice-cost-highlight">
                  <div className="choice-cost-main">
                    <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                      {t('yourTotalPayable') || 'Your Total Share'}:
                    </span>
                    <span className="choice-cost-val">
                      ₹{choice.myShare.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="choice-cost-breakdown">
                    ₹{choice.myShare.materialCost.toLocaleString('en-IN')} material (@ ₹{choice.unitPrice}/{currentReq.unit}) + ₹{choice.myShare.transportShare.toLocaleString('en-IN')} freight share
                  </div>

                  <div className="choice-savings-tag">
                    🎉 Save ₹{choice.soloComparison.savings.toLocaleString('en-IN')} ({choice.soloComparison.savingsPct}% off retail)
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-select-choice"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectChoice(choice.id)
                  }}
                >
                  {isSelected ? (t('selectedPlanBadge') || '✓ Selected Plan') : (t('selectPlanBtn') || 'Select This Plan')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Detailed Itemized Cost Breakdown for Selected Choice */}
      {activeChoice && (
        <section className="selected-plan-detail-card" aria-label="Cost Allocation Breakdown">
          <div className="selected-plan-header">
            <div>
              <span className="tag tag-brass" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                Active Plan for {currentReq.category}: {activeChoice.title}
              </span>
              <h3 style={{ margin: 0 }}>
                {t('costCalculationHeading') || 'Itemized Whole Cost Calculation Breakdown'} ({currentReq.category})
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                {t('quoteFreezeNotice') ||
                  `Quotation valid until ${activeChoice.supplier.validity || '2026-09-28'} from ${activeChoice.supplier.supplierName}. Zero hidden transport fees.`}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Consolidated Order Total</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>
                ₹{activeChoice.grandTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                {activeChoice.totalPooledQuantity} {currentReq.unit} bulk order
              </div>
            </div>
          </div>

          <table className="selected-plan-table">
            <thead>
              <tr>
                <th>{t('colArtisan') || 'Artisan'}</th>
                <th>Location / Distance</th>
                <th>{t('colQuantity') || 'Quantity'}</th>
                <th>{t('materialCost') || 'Material Share'}</th>
                <th>{t('freightShare') || 'Fair Freight Share'}</th>
                <th>{t('totalPayable') || 'Total Payable'}</th>
              </tr>
            </thead>
            <tbody>
              {activeChoice.perArtisan.map((member) => (
                <tr
                  key={member.artisanId}
                  className={member.isMe ? 'active-row' : ''}
                >
                  <td>
                    {member.isMe ? <strong>👤 {artisan.name} (You)</strong> : member.name}
                  </td>
                  <td>
                    {member.location} {member.distanceKm > 0 ? `(${member.distanceKm} km)` : ''}
                  </td>
                  <td>
                    {member.quantity} {currentReq.unit} ({Math.round(member.share * 100)}%)
                  </td>
                  <td>₹{member.materialCost.toLocaleString('en-IN')}</td>
                  <td>₹{member.transportShare.toLocaleString('en-IN')}</td>
                  <td>
                    <strong>₹{member.totalCost.toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Single Item Action Bar (If only 1 material in batch) */}
          {myRequests.length === 1 && (
            <div className="action-bar-confirm">
              <div>
                <div style={{ fontSize: '1.05rem' }}>
                  Your Final Amount Payable:{' '}
                  <strong style={{ color: 'var(--brass-dark, #8F6415)', fontSize: '1.3rem' }}>
                    ₹{activeChoice.myShare.totalCost.toLocaleString('en-IN')}
                  </strong>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  Includes ₹{activeChoice.myShare.materialCost} raw material + ₹{activeChoice.myShare.transportShare} freight allocation
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
                onClick={handleProceedToConfirm}
              >
                {t('proceedToConfirmBtn') || `Proceed with ${activeChoice.title} →`}
              </button>
            </div>
          )}
        </section>
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
              Confirm All {batchItems.length} Materials (₹{batchGrandTotal.toLocaleString('en-IN')}) →
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
