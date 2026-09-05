import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppState, getCurrentArtisan } from '../../context/AppContext.jsx'
import { MATERIAL_CATEGORIES, UNITS } from '../../data/seed.js'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import '../artisan/artisan.css'

function emptyLine(defaultLocation, initialData = {}) {
  return {
    key: Math.random().toString(36).slice(2),
    category: initialData.category || MATERIAL_CATEGORIES[0],
    specification: initialData.spec || '',
    quantity: initialData.qty || '',
    unit: initialData.unit || UNITS[0],
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

    const valid = lines.filter(
      (l) =>
        l.specification.trim() &&
        l.quantity &&
        l.location.trim() &&
        l.requiredDate
    )

    if (valid.length === 0) return

    dispatch({
      type: 'ADD_MATERIAL_REQUESTS',
      requests: valid.map((l) => ({
        category: l.category,
        specification: l.specification.trim(),
        quantity: Number(l.quantity),
        unit: l.unit,
        location: l.location.trim(),
        requiredDate: l.requiredDate,
      })),
    })

    // Save the user's workflow progress in the backend.
    // The user has completed the material requirement step
    // and should resume from the group matching step next time.
    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'group_matching',
      onboarding_complete: false,
    })

    navigate('/artisan/matching')
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
                    updateLine(line.key, 'category', e.target.value)
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
