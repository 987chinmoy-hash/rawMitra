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
  const [form, setForm] = useState({ name: '', aadhar: '', storeLocation: '', phone: '', password: '' })
  const [lines, setLines] = useState([emptyLine()])
  const [errors, setErrors] = useState({})

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }
  function updateLine(key, field, value) { setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [field]: value } : l))) }
  function addLine() { setLines((ls) => [...ls, emptyLine()]) }
  function removeLine(key) { setLines((ls) => ls.filter((l) => l.key !== key)) }

  function handleRandomAadhaar() {
    const randomAadhaar = `8888 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`
    update('aadhar', randomAadhaar)
  }

  function handleDemoFill() {
    const randPhone = `9864${Math.floor(100000 + Math.random() * 900000)}`
    const randAadhaar = `8888 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`
    setForm({
      name: 'Maa Kamakhya Craft Materials',
      aadhar: randAadhaar,
      storeLocation: 'Mission Chariali, Tezpur',
      phone: randPhone,
      password: 'password123',
    })
    setLines([
      { key: 'demo-1', category: 'Clay', specification: 'Terracotta potting clay, fine grade', quantity: '500', unit: 'kg' },
      { key: 'demo-2', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: '200', unit: 'piece' },
    ])
    setErrors({})
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Enter a business or contact name.'
    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(form.aadhar.trim())) e.aadhar = 'Enter a 12-digit Aadhar number.'
    if (!form.storeLocation.trim()) e.storeLocation = 'Enter your store or warehouse location (e.g. Tezpur, Guwahati, Dibrugarh).'
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a 10-digit phone number.'
    if (!form.password || form.password.trim().length < 4) e.password = 'Enter a password (at least 4 characters).'
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
        aadhar: `•••• •••• ${form.aadhar.trim().replace(/\s/g, '').slice(-4)}`,
        rawAadhar: form.aadhar.trim().replace(/\s/g, ''),
        storeLocation: form.storeLocation.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      },
    })
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details & stock', 'Pricing & logistics']} current={0} />
      <h1>Tell us about your supply business</h1>

      {/* Demo Autofill Helper Toolbar */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleDemoFill}
          className="btn btn-outline"
          style={{ background: '#fdf8ec', borderColor: 'var(--brass, #c08a28)', color: 'var(--brass-dark, #8f6415)', fontSize: '0.84rem', fontWeight: 600 }}
        >
          ✨ Fast 1-Click Demo Fill (Tezpur Supplier)
        </button>
        <button
          type="button"
          onClick={handleRandomAadhaar}
          className="btn btn-outline"
          style={{ fontSize: '0.84rem' }}
        >
          🎲 Generate Demo Aadhaar
        </button>
      </div>

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
          <input id="loc" value={form.storeLocation} onChange={(e) => update('storeLocation', e.target.value)} placeholder="e.g. Mission Chariali, Tezpur" />
          <span className="field-hint">Enter city / hub (e.g. Tezpur, Guwahati, Dibrugarh)</span>
          {errors.storeLocation && <div className="field-error">{errors.storeLocation}</div>}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit mobile number" inputMode="numeric" />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>
        <div className="field">
          <label htmlFor="password">Login Password (for Supplier Dashboard)</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Enter password (e.g. 123456)"
            autoComplete="new-password"
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
          <span className="field-hint">You will use this password and phone number to log into your Supplier Portal.</span>
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
