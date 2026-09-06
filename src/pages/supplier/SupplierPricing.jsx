import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../../context/AppContext.jsx'
import { api } from '../../services/api.js'
import Stepper from '../../components/Stepper.jsx'
import './supplier.css'

const LOGISTICS_OPTIONS = [
  { id: 'shipment', label: 'I can arrange shipment', desc: 'You ship the bulk order to the artisan group directly.' },
  { id: 'pickup', label: 'I can arrange pickup', desc: 'Artisans or a coordinator collect the order from your store.' },
  { id: 'none', label: 'None — coordinator needed', desc: 'A rawMitra coordinator should arrange transport.' },
]

export default function SupplierPricing() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const profile = location.state

  if (!profile) { navigate('/supplier/register'); return null }

  const [prices, setPrices] = useState(
    Object.fromEntries(state.draftMaterials.map((l) => [l.key, '']))
  )
  const [minBulk, setMinBulk] = useState(
    Object.fromEntries(state.draftMaterials.map((l) => [l.key, '']))
  )
  const [logistics, setLogistics] = useState('shipment')
  const [transportCharge, setTransportCharge] = useState('350')
  const [validity, setValidity] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const materials = state.draftMaterials
      .filter((l) => prices[l.key])
      .map((l) => ({
        category: l.category,
        specification: l.specification,
        unit: l.unit,
        pricePerUnit: Number(prices[l.key]),
        minBulkQty: Number(minBulk[l.key]) || 1,
        transportCharge: Number(transportCharge) || 0,
        validity: validity || '2026-09-30',
      }))

    const supplierPayload = {
      ...profile,
      materials,
      logistics,
      transportCharge: Number(transportCharge) || 350,
      validity: validity || '2026-09-30',
    }

    try {
      await api.supplier.registerSupplier(supplierPayload)
    } catch (apiErr) {
      console.warn('Backend supplier registration notice:', apiErr.message)
    }

    dispatch({
      type: 'REGISTER_SUPPLIER',
      payload: supplierPayload,
    })

    navigate('/supplier/dashboard')
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details & stock', 'Pricing & logistics']} current={1} />
      <h1>Set your bulk pricing &amp; quotation terms</h1>
      <p>Specify wholesale rates, delivery charges, and quotation validity for grouped artisan orders.</p>

      <form onSubmit={handleSubmit} className="card">
        {state.draftMaterials.map((l) => (
          <div key={l.key} className="supplier-material-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}>
            <div>
              <strong>{l.specification}</strong>
              <div className="field-hint">{l.category} · up to {l.quantity} {l.unit} in stock</div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Bulk price per {l.unit} (₹)</label>
              <input type="number" min="0" value={prices[l.key]} onChange={(e) => setPrices((p) => ({ ...p, [l.key]: e.target.value }))} required />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Minimum bulk quantity</label>
              <input type="number" min="1" value={minBulk[l.key]} onChange={(e) => setMinBulk((p) => ({ ...p, [l.key]: e.target.value }))} placeholder="e.g. 20" />
            </div>
          </div>
        ))}

        <hr className="divider" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="field">
            <label>Estimated transport charge (₹)</label>
            <input
              type="number"
              min="0"
              value={transportCharge}
              onChange={(e) => setTransportCharge(e.target.value)}
              placeholder="e.g. 500"
            />
            <span className="field-hint">Fairly split across artisans in the group.</span>
          </div>

          <div className="field">
            <label>Quotation validity date</label>
            <input
              type="date"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              required
            />
            <span className="field-hint">Guaranteed price until this date.</span>
          </div>
        </div>

        <hr className="divider" />
        <h3>Can you arrange shipment or pickup?</h3>
        <div className="logistics-options">
          {LOGISTICS_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className={`logistics-option ${logistics === opt.id ? 'is-selected' : ''}`}
              onClick={() => setLogistics(opt.id)}
              role="radio"
              aria-checked={logistics === opt.id}
              tabIndex={0}
            >
              <strong>{opt.label}</strong>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{opt.desc}</p>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-block">Publish my quotation &amp; listing</button>
      </form>
    </div>
  )
}
