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

function emptyLine(defaultLocation, initialData = {}) {
  const cat = initialData.category || MATERIAL_CATEGORIES[0]
  const defaults = CATEGORY_DEFAULTS[cat] || {}
  return {
    key: Math.random().toString(36).slice(2),
    category: cat,
    specification: initialData.spec || defaults.spec || '',
    quantity: initialData.qty || defaults.qty || '10',
    unit: initialData.unit || defaults.unit || UNITS[0],
    location: initialData.location || defaultLocation || 'Sualkuchi, Assam',
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
      storeLocation: 'Sualkuchi, Assam',
    }

  const queryCat = searchParams.get('category')
  const querySpec = searchParams.get('spec')
  const queryUnit = searchParams.get('unit')
  const queryQty = searchParams.get('qty')
  const queryLoc = searchParams.get('location')

  const [lines, setLines] = useState(() => [
    emptyLine(artisan.storeLocation, {
      category: queryCat,
      spec: querySpec,
      unit: queryUnit,
      qty: queryQty,
      location: queryLoc,
    }),
  ])

  // Update line if search params change
  useEffect(() => {
    if (queryCat || querySpec) {
      setLines([
        emptyLine(artisan.storeLocation, {
          category: queryCat,
          spec: querySpec,
          unit: queryUnit,
          qty: queryQty,
          location: queryLoc,
        }),
      ])
    }
  }, [
    queryCat,
    querySpec,
    queryUnit,
    queryQty,
    queryLoc,
    artisan.storeLocation,
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
    setLines((ls) => [...ls, emptyLine(artisan.storeLocation)])
  }

  function removeLine(key) {
    setLines((ls) => ls.filter((l) => l.key !== key))
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
        location: (l.location && l.location.trim()) || artisan.storeLocation || 'Sualkuchi, Assam',
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
      `/artisan/matching?batchId=${batchId}&category=${encodeURIComponent(primaryReq.category)}&reqId=${encodeURIComponent(primaryReq.id)}`
    )
  }

  return (
    <div className="page page-narrow">
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
        current={1}
      />

      <h1>{t('materialsTitle')}</h1>
      <p>{t('materialsSub')}</p>

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
              <label>{t('locLabel')}</label>
              <input
                value={line.location}
                onChange={(e) =>
                  updateLine(line.key, 'location', e.target.value)
                }
                placeholder="e.g. Sualkuchi, Assam"
              />
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
