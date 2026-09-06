import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppState, getCurrentArtisan } from '../../context/AppContext.jsx'
import { MATERIAL_CATEGORIES, UNITS } from '../../data/seed.js'
import { useTranslation } from '../../utils/i18n.js'
import { api } from '../../services/api.js'
import Stepper from '../../components/Stepper.jsx'
import '../artisan/artisan.css'

const CATEGORY_DEFAULTS = {
  Bamboo: { spec: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', qty: '25' },
  Yarn: { spec: 'Muga silk yarn, 20/22 denier', unit: 'kg', qty: '10' },
  Clay: { spec: 'Terracotta potting clay, fine grade', unit: 'kg', qty: '50' },
  Dyes: { spec: 'Natural indigo dye powder', unit: 'kg', qty: '5' },
  Metal: { spec: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg', qty: '20' },
  'Packaging materials': { spec: 'Corrugated boxes, medium', unit: 'piece', qty: '50' },
}

const DELIVERY_LOCATIONS = [
  { id: 'Tezpur', name: 'Tezpur', hubTag: 'Sonitpur Hub', desc: 'North Bank Craft & Silk Syndicate' },
  { id: 'Guwahati', name: 'Guwahati', hubTag: 'Kamrup Metro Hub', desc: 'Central Commercial & Transport Hub' },
  { id: 'Dibrugarh', name: 'Dibrugarh', hubTag: 'Upper Assam Hub', desc: 'Eastern Tea & Textile Corridor' },
]

function resolveInitialLocation(queryLoc, artisanLoc) {
  const check = (queryLoc || artisanLoc || '').toLowerCase()
  if (check.includes('guwahati') || check.includes('gauhati') || check.includes('kamrup')) return 'Guwahati'
  if (check.includes('dibrugarh') || check.includes('dibru')) return 'Dibrugarh'
  return 'Tezpur'
}

function emptyLine(defaultLocation = 'Tezpur', initialData = {}) {
  const cat = initialData.category || MATERIAL_CATEGORIES[0]
  const defaults = CATEGORY_DEFAULTS[cat] || {}
  return {
    key: Math.random().toString(36).slice(2),
    category: cat,
    specification: initialData.spec || defaults.spec || '',
    quantity: initialData.qty || defaults.qty || '10',
    unit: initialData.unit || defaults.unit || UNITS[0],
    location: initialData.location || defaultLocation || 'Tezpur',
    requiredDate:
      initialData.requiredDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  }
}

export default function ArtisanMaterials() {
  const [searchParams] = useSearchParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Accept both locally-registered artisans and backend-authenticated users, with seed fallback
  const artisan =
    getCurrentArtisan(state) ||
    (state.authUser?.role === 'artisan' ? state.authUser : null) ||
    state.artisans[0] || {
      id: 'A-1001',
      name: 'Deepa Boro',
      role: 'artisan',
      storeLocation: 'Tezpur, Assam',
    }

  const queryCat = searchParams.get('category')
  const querySpec = searchParams.get('spec')
  const queryUnit = searchParams.get('unit')
  const queryQty = searchParams.get('qty')
  const queryLoc = searchParams.get('location')

  const [selectedLocation, setSelectedLocation] = useState(() =>
    resolveInitialLocation(queryLoc, artisan.storeLocation)
  )

  const [lines, setLines] = useState(() => [
    emptyLine(selectedLocation, {
      category: queryCat,
      spec: querySpec,
      unit: queryUnit,
      qty: queryQty,
      location: selectedLocation,
    }),
  ])

  // Update line if search params change
  useEffect(() => {
    if (queryCat || querySpec) {
      setLines([
        emptyLine(selectedLocation, {
          category: queryCat,
          spec: querySpec,
          unit: queryUnit,
          qty: queryQty,
          location: selectedLocation,
        }),
      ])
    }
  }, [
    queryCat,
    querySpec,
    queryUnit,
    queryQty,
    selectedLocation,
  ])

  function handleCategoryChange(key, newCategory) {
    const defaults = CATEGORY_DEFAULTS[newCategory] || {}
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l
        const isDefaultSpec =
          !l.specification ||
          Object.values(CATEGORY_DEFAULTS).some((d) => d.spec === l.specification)
        const isDefaultUnit =
          !l.unit ||
          Object.values(CATEGORY_DEFAULTS).some((d) => d.unit === l.unit)
        const isDefaultQty =
          !l.quantity ||
          Object.values(CATEGORY_DEFAULTS).some((d) => d.qty === l.quantity)

        return {
          ...l,
          category: newCategory,
          specification: isDefaultSpec ? defaults.spec || '' : l.specification,
          unit: isDefaultUnit ? defaults.unit || UNITS[0] : l.unit,
          quantity: isDefaultQty ? defaults.qty || '10' : l.quantity,
        }
      })
    )
  }

  function updateLine(key, field, value) {
    setLines((ls) =>
      ls.map((l) => (l.key === key ? { ...l, [field]: value } : l))
    )
  }

  function addLine() {
    setLines((ls) => [...ls, emptyLine(selectedLocation)])
  }

  function removeLine(key) {
    setLines((ls) => ls.filter((l) => l.key !== key))
  }

  function handleLocationSelect(locId) {
    setSelectedLocation(locId)
    setLines((ls) => ls.map((l) => ({ ...l, location: locId })))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const batchId = `BATCH-${Date.now().toString().slice(-6)}`

    const reqPayload = lines.map((l, idx) => {
      const defaults = CATEGORY_DEFAULTS[l.category] || {}
      return {
        id: `REQ-${l.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}${idx}`,
        batchId,
        artisanId: artisan.id || 'A-1001',
        category: l.category || 'Bamboo',
        specification: (l.specification && l.specification.trim()) || defaults.spec || `${l.category} standard craft grade`,
        quantity: Number(l.quantity) || Number(defaults.qty) || 10,
        unit: l.unit || defaults.unit || 'piece',
        location: selectedLocation,
        requiredDate:
          l.requiredDate ||
          new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'open',
      }
    })

    // Optimistically sync with backend if token present
    if (api.getToken()) {
      api.materials.addRequests(reqPayload).catch((err) => {
        console.warn('Backend material sync note:', err.message)
      })
    }

    dispatch({
      type: 'ADD_MATERIAL_REQUESTS',
      batchId,
      requests: reqPayload,
    })

    // Save the user's workflow progress in the backend.
    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'group_matching',
      onboarding_complete: false,
    })

    const primaryReq = reqPayload[0]
    navigate(
      `/artisan/matching?batchId=${batchId}&category=${encodeURIComponent(primaryReq.category)}&reqId=${encodeURIComponent(primaryReq.id)}&location=${encodeURIComponent(selectedLocation)}`
    )
  }

  return (
    <div className="page page-narrow">
      <Stepper
        steps={['Your details', 'Material needs', 'Artisan groups', 'Choose supplier', 'Confirm', 'Track']}
        current={1}
      />

      <h1>{t('materialsTitle')}</h1>
      <p>{t('materialsSub')}</p>

      {/* 3-Location Delivery Hub Selector (Strictly 1 choice allowed) */}
      <div className="delivery-hub-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>📍</span>
              <span>Delivery Hub & Location (Select One)</span>
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
              Choose your delivery center. Compatible artisan groups in this location will be clustered with you.
            </p>
          </div>
          <span className="tag tag-brass" style={{ fontWeight: 700 }}>
            Single Hub Only
          </span>
        </div>

        <div className="location-selector-grid">
          {DELIVERY_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.id
            return (
              <button
                key={loc.id}
                type="button"
                className={`location-selector-btn ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleLocationSelect(loc.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className="location-pin-icon">📍</span>
                  <span className={`location-radio-pill ${isSelected ? 'is-active' : ''}`}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
                <div className="location-hub-name">{loc.name}</div>
                <div className="location-hub-tag">{loc.hubTag}</div>
                <div className="location-hub-desc">{loc.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {lines.map((line) => (
          <div className="line-item-card" key={line.key}>
            {lines.length > 1 && (
              <button
                type="button"
                className="line-item-remove"
                onClick={() => removeLine(line.key)}
              >
                ✕
              </button>
            )}

            <div className="field-row">
              <div className="field">
                <label>{t('categoryLabel')}</label>
                <select
                  value={line.category}
                  onChange={(e) =>
                    handleCategoryChange(line.key, e.target.value)
                  }
                >
                  {MATERIAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(c) || c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>{t('specLabel')}</label>
                <input
                  value={line.specification}
                  onChange={(e) =>
                    updateLine(line.key, 'specification', e.target.value)
                  }
                  placeholder="e.g. Muga silk yarn, 20/22 denier"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t('qtyLabel')}</label>
                <input
                  type="number"
                  min="0"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.key, 'quantity', e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>{t('unitLabel')}</label>
                <select
                  value={line.unit}
                  onChange={(e) =>
                    updateLine(line.key, 'unit', e.target.value)
                  }
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>{t('reqDateLabel')}</label>
                <input
                  type="date"
                  value={line.requiredDate}
                  onChange={(e) =>
                    updateLine(line.key, 'requiredDate', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('locLabel') || 'Delivery Hub'}</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                  Inherited from selected delivery hub
                </span>
              </label>
              <div className="locked-hub-indicator">
                <span>📍</span>
                <span>
                  <strong>{selectedLocation}</strong>, Assam Hub
                </span>
                <span className="tag tag-green" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>
                  ✓ Locked for order
                </span>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline"
          onClick={addLine}
          style={{ marginBottom: '1.5rem' }}
        >
          {t('addAnotherLine')}
        </button>

        <button
          type="submit"
          className="btn btn-primary btn-block"
        >
          {t('findMatchesBtn')}
        </button>
      </form>
    </div>
  )
}
