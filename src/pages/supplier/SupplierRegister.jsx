import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../context/AppContext.jsx'
import { MATERIAL_CATEGORIES, UNITS } from '../../data/seed.js'
import Stepper from '../../components/Stepper.jsx'
import './supplier.css'

function emptyLine() {
  return { key: Math.random().toString(36).slice(2), category: MATERIAL_CATEGORIES[0], specification: '', quantity: '', unit: UNITS[0] }
}

export default function SupplierRegister() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', aadhar: '', storeLocation: '', phone: '' })
  const [lines, setLines] = useState([emptyLine()])
  const [errors, setErrors] = useState({})

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }
  function updateLine(key, field, value) { setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [field]: value } : l))) }
  function addLine() { setLines((ls) => [...ls, emptyLine()]) }
  function removeLine(key) { setLines((ls) => ls.filter((l) => l.key !== key)) }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Enter a business or contact name.'
    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(form.aadhar.trim())) e.aadhar = 'Enter a 12-digit Aadhar number.'
    if (!form.storeLocation.trim()) e.storeLocation = 'Enter your store or warehouse location.'
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a 10-digit phone number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const validLines = lines.filter((l) => l.specification.trim() && l.quantity)
    dispatch({ type: 'SET_DRAFT_MATERIALS', materials: validLines })
    navigate('/supplier/pricing', {
      state: {
        name: form.name.trim(),
        aadhar: `•••• •••• ${form.aadhar.trim().slice(-4)}`,
        storeLocation: form.storeLocation.trim(),
        phone: form.phone.trim(),
      },
    })
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details & stock', 'Pricing & logistics']} current={0} />
      <h1>Tell us about your supply business</h1>

      <form onSubmit={handleSubmit} className="card" noValidate>
        <div className="field">
          <label htmlFor="name">Business / contact name</label>
          <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Brahmaputra Yarn Co." />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="field">
          <label htmlFor="aadhar">Aadhar number</label>
          <input id="aadhar" value={form.aadhar} onChange={(e) => update('aadhar', e.target.value)} placeholder="XXXX XXXX XXXX" inputMode="numeric" />
          {errors.aadhar && <div className="field-error">{errors.aadhar}</div>}
        </div>
        <div className="field">
          <label htmlFor="loc">Location of store / warehouse</label>
          <input id="loc" value={form.storeLocation} onChange={(e) => update('storeLocation', e.target.value)} placeholder="e.g. Guwahati, Assam" />
          {errors.storeLocation && <div className="field-error">{errors.storeLocation}</div>}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit mobile number" inputMode="numeric" />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        <hr className="divider" />
        <h3>What do you supply?</h3>
        {lines.map((line) => (
          <div key={line.key} style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-m)', padding: '1rem 1.1rem', marginBottom: '0.9rem', background: 'var(--white)' }}>
            {lines.length > 1 && (
              <button type="button" className="line-item-remove" style={{ position: 'static', float: 'right', background: 'transparent', border: 'none', color: 'var(--rust)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }} onClick={() => removeLine(line.key)}>Remove</button>
            )}
            <div className="field">
              <label>Material category</label>
              <select value={line.category} onChange={(e) => updateLine(line.key, 'category', e.target.value)}>
                {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="supplier-material-row" style={{ border: 'none', padding: 0, marginBottom: 0 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Specification</label>
                <input value={line.specification} onChange={(e) => updateLine(line.key, 'specification', e.target.value)} placeholder="e.g. Terracotta potting clay, fine grade" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Quantity available</label>
                <input type="number" min="0" value={line.quantity} onChange={(e) => updateLine(line.key, 'quantity', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Unit</label>
                <select value={line.unit} onChange={(e) => updateLine(line.key, 'unit', e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={addLine} style={{ marginBottom: '1.5rem' }}>+ Add another material</button>

        <button type="submit" className="btn btn-primary btn-block">Continue to pricing</button>
      </form>
    </div>
  )
}
