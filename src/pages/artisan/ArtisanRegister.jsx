import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../context/AppContext.jsx'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'

export default function ArtisanRegister() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', aadhar: '', storeLocation: '', phone: '' })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Enter your full name.'
    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(form.aadhar.trim())) e.aadhar = 'Enter a 12-digit verification number.'
    if (!form.storeLocation.trim()) e.storeLocation = 'Enter your store or workshop location.'
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a 10-digit phone number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    dispatch({
      type: 'REGISTER_ARTISAN',
      payload: {
        name: form.name.trim(),
        aadhar: `•••• •••• ${form.aadhar.trim().slice(-4)}`,
        storeLocation: form.storeLocation.trim(),
        phone: form.phone.trim(),
      },
    })
    navigate('/artisan/materials')
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']} current={0} />
      <h1>{t('artisanRegTitle')}</h1>
      <p>{t('artisanRegSub')}</p>

      <form onSubmit={handleSubmit} className="card" noValidate>
        <div className="field">
          <label htmlFor="name">{t('fullName')}</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Enter full name"
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="field">
          <label htmlFor="aadhar">{t('aadharNum')}</label>
          <input
            id="aadhar"
            value={form.aadhar}
            onChange={(e) => update('aadhar', e.target.value)}
            placeholder="XXXX XXXX XXXX"
            inputMode="numeric"
          />
          {errors.aadhar && <div className="field-error">{errors.aadhar}</div>}
          <div className="field-hint">{t('aadharHint')}</div>
        </div>
        <div className="field">
          <label htmlFor="loc">{t('storeLoc')}</label>
          <input
            id="loc"
            value={form.storeLocation}
            onChange={(e) => update('storeLocation', e.target.value)}
            placeholder="Enter location (City, State)"
          />
          {errors.storeLocation && <div className="field-error">{errors.storeLocation}</div>}
        </div>
        <div className="field">
          <label htmlFor="phone">{t('phoneNum')}</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="10-digit mobile number"
            inputMode="numeric"
          />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
          <div className="field-hint">{t('phoneHint')}</div>
        </div>
        <button type="submit" className="btn btn-primary btn-block">{t('nextMaterialBtn')}</button>
      </form>
    </div>
  )
}
