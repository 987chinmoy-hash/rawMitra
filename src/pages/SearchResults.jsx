import { useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { useTranslation, expandSearchTokens, localizeLocation, localizeStatus } from '../utils/i18n.js'
import RatingStars from '../components/RatingStars.jsx'
import './SearchResults.css'

function matchesAny(tokens, ...fields) {
  if (!tokens || tokens.length === 0) return false
  const combined = fields.map((f) => (f || '').toString().toLowerCase()).join(' ')
  return tokens.some((token) => combined.includes(token))
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t, lang } = useTranslation()

  const results = useMemo(() => {
    if (!q.trim()) return { orders: [], artisans: [], suppliers: [], coordinators: [], materials: [], catalogItems: [] }

    const tokens = expandSearchTokens(q)

    // Match Orders (ID, category, specification, supplierName, status, logistics)
    const orders = (state.orders || []).filter((o) =>
      matchesAny(tokens, o.id, o.category, o.specification, o.supplierName, o.status, o.logistics)
    )

    // Every record type is matched on at least two text fields
    const artisans = state.artisans.filter((a) =>
      matchesAny(tokens, a.name, a.storeLocation, a.phone)
    )

    const suppliers = state.suppliers.filter((s) =>
      matchesAny(tokens, s.name, s.storeLocation) ||
      s.materials.some((m) => matchesAny(tokens, m.specification, m.category))
    )

    const coordinators = state.coordinators.filter((c) =>
      matchesAny(tokens, c.name, c.experience, c.phone)
    )

    const materials = state.materialRequests.filter((r) =>
      matchesAny(tokens, r.specification, r.category, r.location, r.unit)
    )

    // Extract all specific raw material items offered by suppliers that match the query
    const catalogItems = []
    state.suppliers.forEach((s) => {
      (s.materials || []).forEach((m) => {
        if (matchesAny(tokens, m.specification, m.category, s.name, s.storeLocation)) {
          catalogItems.push({
            ...m,
            supplierId: s.id,
            supplierName: s.name,
            supplierLocation: s.storeLocation,
            supplierRating: s.rating,
            supplierLogistics: s.logistics,
            supplierTransportCharge: s.transportCharge,
            supplierValidity: s.validity,
          })
        }
      })
    })

    return { orders, artisans, suppliers, coordinators, materials, catalogItems }
  }, [q, state])

  const total =
    results.orders.length +
    results.artisans.length +
    results.suppliers.length +
    results.coordinators.length +
    results.materials.length +
    results.catalogItems.length

  function handleBuyMaterial(item) {
    const params = new URLSearchParams({
      category: item.category,
      spec: item.specification,
      unit: item.unit || 'kg',
      qty: item.minBulkQty ? String(item.minBulkQty) : '10',
      location: item.supplierLocation || '',
    })
    navigate(`/artisan/materials?${params.toString()}`)
  }

  function handleJoinOpenRequest(req) {
    const params = new URLSearchParams({
      category: req.category,
      spec: req.specification,
      unit: req.unit || 'kg',
      qty: String(req.quantity || '10'),
      location: req.location || '',
    })
    navigate(`/artisan/materials?${params.toString()}`)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>
          {t('searchTitle')} {q && <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>"{q}"</span>}
        </h1>
        <span className="tag tag-brass">Live Marketplace &amp; Supplier Catalog</span>
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', margin: '0 0 1.25rem' }}>
        {t('searchIndexingInfo')}
      </p>

      {!q.trim() && <p>{t('searchPrompt')}</p>}
      {q.trim() && total === 0 && <p>{t('noMatches')}</p>}

      {/* 1. Directly Available Raw Materials from Suppliers to Buy */}
      {results.catalogItems.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧶 Available Raw Materials to Buy ({results.catalogItems.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {results.catalogItems.map((item, idx) => (
              <div
                key={`${item.supplierId}-${item.specification}-${idx}`}
                className="card"
                style={{
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1.5px solid var(--brass, #c08a28)',
                  background: '#fdfbf7',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="tag tag-brass">{t(item.category) || item.category}</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                      ₹{item.pricePerUnit?.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--ink-soft)' }}>/ {item.unit}</span>
                    </span>
                  </div>
                  <h3 style={{ margin: '0.6rem 0 0.3rem', fontSize: '1.1rem' }}>
                    {item.specification}
                  </h3>
                  <div className="field-hint" style={{ marginBottom: '0.6rem' }}>
                    🏢 <strong>{item.supplierName}</strong> · 📍 {localizeLocation(item.supplierLocation, lang)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <span className="tag tag-green">Min Bulk Qty: {item.minBulkQty || 5} {item.unit}</span>
                    {item.supplierValidity && (
                      <span className="tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                        📅 Valid until {item.supplierValidity}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleBuyMaterial(item)}
                  >
                    🛒 Buy / Group Buy This →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Suppliers Matching */}
      {results.suppliers.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>🏢 {t('lblSuppliers')} ({results.suppliers.length})</h2>
          {results.suppliers.map((s) => (
            <div className="search-result" key={s.id} style={{ padding: '1.1rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>{s.name}</strong> — {localizeLocation(s.storeLocation, lang)}
                  <div style={{ marginTop: '0.25rem' }}>
                    <RatingStars value={s.rating} />
                  </div>
                </div>
                <span className="tag tag-brass">Verified Supplier</span>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink)' }}>Available Catalog Stock:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {s.materials.map((m, mIdx) => (
                    <button
                      key={mIdx}
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      onClick={() => handleBuyMaterial({ ...m, supplierLocation: s.storeLocation, supplierName: s.name })}
                    >
                      🛒 {m.specification} (₹{m.pricePerUnit}/{m.unit})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3. Open Material Requests & Group Pools to Join */}
      {results.materials.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>👥 Active Group Buying Pools ({results.materials.length})</h2>
          {results.materials.map((r) => (
            <div className="search-result" key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '1.02rem' }}>{t(r.category) || r.category} — {r.specification}</strong>
                <div className="field-hint" style={{ marginTop: '0.25rem' }}>
                  Pool Total: {r.quantity} {r.unit} · 📍 {localizeLocation(r.location, lang)} · Needed by: {r.requiredDate} · <span className="tag tag-green">{localizeStatus(r.status, lang)}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-brass"
                onClick={() => handleJoinOpenRequest(r)}
              >
                👥 Join This Group Buy Pool →
              </button>
            </div>
          ))}
        </section>
      )}

      {/* 4. Orders Matching */}
      {results.orders.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--brass-dark, #8c5b05)' }}>📦 {t('lblOrders')} ({results.orders.length})</h2>
          {results.orders.map((o) => (
            <div className="search-result" key={o.id} style={{ borderLeft: '4px solid var(--brass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <strong>{t(o.category) || o.category} — {o.specification}</strong>
                <span className="tag tag-green">{localizeStatus(o.status, lang)}</span>
              </div>
              <div className="field-hint" style={{ margin: '0.35rem 0' }}>
                Order #{o.id} · {o.totalQuantity} {o.unit} · {t('lblFromSupplier')} {o.supplierName} · Total: ₹{o.totalCost?.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/artisan/tracking" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                  {t('lblTrackOrder')}
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 5. Artisans Matching */}
      {results.artisans.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>🧶 {t('lblArtisans')}</h2>
          {results.artisans.map((a) => (
            <div className="search-result" key={a.id}>
              <strong>{a.name}</strong> — {localizeLocation(a.storeLocation, lang)}
              <div><RatingStars value={a.rating} /></div>
            </div>
          ))}
        </section>
      )}

      {/* 6. Coordinators Matching */}
      {results.coordinators.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>🚚 {t('lblCoordinators')}</h2>
          {results.coordinators.map((c) => (
            <div className="search-result" key={c.id}>
              <strong>{c.name}</strong>
              <div className="field-hint">{c.experience}</div>
              <RatingStars value={c.rating} />
            </div>
          ))}
        </section>
      )}

      {q.trim() && (
        <p style={{ marginTop: '2rem' }}>
          Looking for something else? <Link to="/artisan/materials">Post a custom material request</Link> to broadcast to suppliers.
        </p>
      )}
    </div>
  )
}
