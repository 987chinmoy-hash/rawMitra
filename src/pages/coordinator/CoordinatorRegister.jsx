import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../context/AppContext.jsx'

export default function CoordinatorRegister() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', aadhar: '', phone: '', experience: '' })
  const [errors, setErrors] = useState({})

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Enter your full name.'
    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(form.aadhar.trim())) e.aadhar = 'Enter a 12-digit Aadhar number.'
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a 10-digit phone number.'
    if (!form.experience.trim()) e.experience = 'Describe your previous logistics experience.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    dispatch({
      type: 'REGISTER_COORDINATOR',
      payload: {
        name: form.name.trim(),
        aadhar: `•••• •••• ${form.aadhar.trim().slice(-4)}`,
        phone: form.phone.trim(),
        experience: form.experience.trim(),
      },
    })
    navigate('/coordinator/dashboard')
  }

  return (
    <div className="page page-narrow">
      <h1>Join as a coordinator</h1>
      <p>You'll oversee confirmed deals — pickup or shipment — and keep both artisans and suppliers updated until delivery.</p>

      <form onSubmit={handleSubmit} className="card" noValidate>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="field">
          <label htmlFor="aadhar">Aadhar number</label>
          <input id="aadhar" value={form.aadhar} onChange={(e) => update('aadhar', e.target.value)} placeholder="XXXX XXXX XXXX" inputMode="numeric" />
          {errors.aadhar && <div className="field-error">{errors.aadhar}</div>}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} inputMode="numeric" />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>
        <div className="field">
          <label htmlFor="experience">Previous experience</label>
          <textarea id="experience" rows={3} value={form.experience} onChange={(e) => update('experience', e.target.value)} placeholder="e.g. 6 years coordinating handloom shipments for a weavers' co-operative" />
          {errors.experience && <div className="field-error">{errors.experience}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block">Continue to dashboard</button>
      </form>
    </div>
  )
}
