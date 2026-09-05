import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
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
  const { t, lang } = useTranslation()

  const results = useMemo(() => {
    if (!q.trim()) return { orders: [], artisans: [], suppliers: [], coordinators: [], materials: [] }

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

    return { orders, artisans, suppliers, coordinators, materials }
  }, [q, state])

  const total =
    results.orders.length +
    results.artisans.length +
    results.suppliers.length +
    results.coordinators.length +
    results.materials.length

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>
          {t('searchTitle')} {q && <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>"{q}"</span>}
        </h1>
        <span className="tag tag-brass">Special Feature: Multi-Field Search (≥ 2 Fields)</span>
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', margin: '0 0 1.25rem' }}>
        {t('searchIndexingInfo')}
      </p>

      {!q.trim() && <p>{t('searchPrompt')}</p>}
      {q.trim() && total === 0 && <p>{t('noMatches')}</p>}

      {/* Orders Matching */}
      {results.orders.length > 0 && (
        <>
          <h2 style={{ color: 'var(--brass-dark, #8c5b05)' }}>📦 {t('lblOrders')}</h2>
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
        </>
      )}

      {/* Suppliers Matching */}
      {results.suppliers.length > 0 && (
        <>
          <h2>{t('lblSuppliers')}</h2>
          {results.suppliers.map((s) => (
            <div className="search-result" key={s.id}>
              <strong>{s.name}</strong> — {localizeLocation(s.storeLocation, lang)}
              <div className="field-hint">
                {t('lblSupplies')}{' '}
                {s.materials.map((m) => `${t(m.category) || m.category}: ${m.specification}`).join('; ')}
              </div>
              <RatingStars value={s.rating} />
            </div>
          ))}
        </>
      )}

      {/* Artisans Matching */}
      {results.artisans.length > 0 && (
        <>
          <h2>{t('lblArtisans')}</h2>
          {results.artisans.map((a) => (
            <div className="search-result" key={a.id}>
              <strong>{a.name}</strong> — {localizeLocation(a.storeLocation, lang)}
              <div><RatingStars value={a.rating} /></div>
            </div>
          ))}
        </>
      )}

      {/* Coordinators Matching */}
      {results.coordinators.length > 0 && (
        <>
          <h2>{t('lblCoordinators')}</h2>
          {results.coordinators.map((c) => (
            <div className="search-result" key={c.id}>
              <strong>{c.name}</strong>
              <div className="field-hint">{c.experience}</div>
              <RatingStars value={c.rating} />
            </div>
          ))}
        </>
      )}

      {/* Open Material Requests Matching */}
      {results.materials.length > 0 && (
        <>
          <h2>{t('lblOpenRequests')}</h2>
          {results.materials.map((r) => (
            <div className="search-result" key={r.id}>
              <strong>{t(r.category) || r.category} — {r.specification}</strong>
              <div className="field-hint">
                {r.quantity} {r.unit} · {localizeLocation(r.location, lang)} · {t('lblNeededBy')} {r.requiredDate} · {localizeStatus(r.status, lang)}
              </div>
            </div>
          ))}
        </>
      )}

      {q.trim() && (
        <p style={{ marginTop: '2rem' }}>
          Not what you're looking for? <Link to="/start">Register or sign in</Link> to list your own need or offer.
        </p>
      )}
    </div>
  )
}
