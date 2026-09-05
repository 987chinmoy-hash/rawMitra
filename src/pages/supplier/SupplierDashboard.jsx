import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, getCurrentSupplier } from '../../context/AppContext.jsx'
import { api } from '../../services/api.js'
import './supplier.css'

export default function SupplierDashboard() {
  const state = useAppState()
  const navigate = useNavigate()
  const supplier = getCurrentSupplier(state) || (state.authUser && state.authUser.role === 'supplier' ? state.authUser : null)
  const [myStock, setMyStock] = useState([])
  const [stockLoading, setStockLoading] = useState(false)

  useEffect(() => {
    if (!supplier) return
    if (state.authUser && state.authUser.role === 'supplier') {
      setStockLoading(true)
      api.supplier.getMyStock()
        .then((res) => setMyStock(res.materials || []))
        .catch(() => {})
        .finally(() => setStockLoading(false))
    } else if (supplier.materials) {
      setMyStock(supplier.materials)
    }
  }, [supplier ? supplier.id : null])

  if (!supplier) { navigate('/supplier/register'); return null }

  const openRequests = state.materialRequests.filter((r) => r.status === 'open')
  const activeOrders = state.orders.filter(
    (o) => o.supplierId === supplier.id && o.status !== 'cancelled'
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Welcome back, {supplier.name}</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
            {supplier.storeLocation || ''} &middot; Rating: {supplier.rating || 5.0} &#9733;
          </p>
        </div>
        <Link to="/supplier/register" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>+ Update Catalog</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Open Requests', value: openRequests.length, icon: '📋', color: 'var(--brass)' },
          { label: 'Active Orders', value: activeOrders.length, icon: '📦', color: '#16a34a' },
          { label: 'Catalog Items', value: myStock.length, icon: '🗄️', color: '#0369a1' },
          { label: 'Your Rating', value: String(supplier.rating || 5.0) + ' ★', icon: '⭐', color: '#7c3aed' },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {stockLoading && <p style={{ color: 'var(--ink-soft)' }}>Loading your catalog...</p>}

      {myStock.length > 0 && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>Your Catalog</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {myStock.map((m, i) => (
              <div key={m.id || i} className="card" style={{ borderLeft: '3px solid #0369a1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="tag tag-brass">{m.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Valid till {m.validity}</span>
                </div>
                <div style={{ fontWeight: 600 }}>{m.specification}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: '0.3rem' }}>
                  Rs.{m.pricePerUnit}/{m.unit} &middot; Min {m.minBulkQty} {m.unit}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginBottom: '0.75rem' }}>Artisan Demand Pool</h2>
      {openRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No open requests right now.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {openRequests.map((r) => {
            const artisan = state.artisans.find((a) => a.id === r.artisanId) || { name: 'Artisan', storeLocation: r.location }
            return (
              <div key={r.id} className="card" style={{ borderLeft: '3px solid var(--brass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="tag tag-brass">{r.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>By {r.requiredDate}</span>
                </div>
                <div style={{ fontWeight: 600 }}>{r.specification}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
                  {r.quantity} {r.unit} &middot; {artisan.storeLocation}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>Artisan: <strong>{artisan.name}</strong></div>
              </div>
            )
          })}
        </div>
      )}

      <h2 style={{ marginBottom: '0.75rem' }}>Your Active Orders</h2>
      {activeOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No active orders yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {activeOrders.map((o) => (
            <div key={o.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="tag tag-green" style={{ textTransform: 'capitalize' }}>{o.status}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{o.id}</span>
              </div>
              <div style={{ fontWeight: 600 }}>{o.category}</div>
              <div style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--ink-soft)' }}>{o.totalQuantity} {o.unit}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Stage: <strong>{o.trackingStage}/4</strong></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
