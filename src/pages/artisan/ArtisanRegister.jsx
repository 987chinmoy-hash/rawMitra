import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAppState,
  useAppDispatch,
  getCurrentArtisan,
} from '../../context/AppContext.jsx'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'

export default function ArtisanRegister() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const existingArtisan = getCurrentArtisan(state)

  const [form, setForm] = useState({
    name: '',
    aadhar: '',
    storeLocation: '',
    phone: '',
  })

  const [errors, setErrors] = useState({})

  // Preserve and restore the artisan's saved personal details.
  useEffect(() => {
    if (!existingArtisan) return

    setForm({
      name: existingArtisan.name || '',
      aadhar: existingArtisan.aadhar || '',
      storeLocation: existingArtisan.storeLocation || '',
      phone: existingArtisan.phone || '',
    })
  }, [
    existingArtisan?.id,
    existingArtisan?.name,
    existingArtisan?.aadhar,
    existingArtisan?.storeLocation,
    existingArtisan?.phone,
  ])

  // If the user is already a registered artisan,
  // registration should never be required again.
  useEffect(() => {
    if (existingArtisan?.id) {
      navigate('/artisan/materials', { replace: true })
    }
  }, [existingArtisan?.id, navigate])

  function handleDemoFill(city = 'Tezpur') {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const randomAadhaar = `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${randomSuffix}`
    const randomPhone = `9876${Math.floor(100000 + Math.random() * 900000)}`
    setForm({
      name: `Rohit Artisan (${city})`,
      aadhar: randomAadhaar,
      storeLocation: `${city}, Assam`,
      phone: randomPhone,
    })
    setErrors({})
  }

  function handleGenerateAadhaar() {
    const p1 = Math.floor(1000 + Math.random() * 9000)
    const p2 = Math.floor(1000 + Math.random() * 9000)
    const p3 = Math.floor(1000 + Math.random() * 9000)
    update('aadhar', `${p1} ${p2} ${p3}`)
  }

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }))

    setErrors((e) => ({
      ...e,
      [field]: '',
    }))
  }

  function validate() {
    const e = {}

    if (!form.name.trim()) {
      e.name = 'Enter your full name.'
    }

    /*
     * Existing saved Aadhaar values may already be masked
     * (•••• •••• 1234). New registrations must provide
     * the complete 12-digit verification number.
     */
    if (
      !/^\d{4}\s?\d{4}\s?\d{4}$/.test(
        form.aadhar.trim()
      )
    ) {
      e.aadhar = 'Enter a 12-digit verification number.'
    }

    if (!form.storeLocation.trim()) {
      e.storeLocation = 'Enter your store or workshop location.'
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = 'Enter a 10-digit phone number.'
    }

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

        // Keep only the last four digits visible in the UI/state.
        // The original verification number is never displayed.
        aadhar: `•••• •••• ${form.aadhar
          .trim()
          .replace(/\s/g, '')
          .slice(-4)}`,
        rawAadhar: form.aadhar.trim().replace(/\s/g, ''),

        storeLocation: form.storeLocation.trim(),
        phone: form.phone.trim(),

        // Registration is complete, but this is the beginning
        // of a new material-order workflow.
        onboarding_complete: true,
        current_step: 'material_requirement',
      },
    })

    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'material_requirement',
      onboarding_complete: true,
    })

    navigate('/artisan/materials')
  }

  return (
    <div className="page page-narrow">
      <Stepper
        steps={[
          'Your details',
          'Material needs',
          'Artisan groups',
          'Choose supplier',
          'Confirm',
          'Track',
        ]}
        current={0}
      />

      <h1>{t('artisanRegTitle')}</h1>
      <p>{t('artisanRegSub')}</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleDemoFill('Tezpur')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          ✨ Fast Demo Fill (Tezpur Artisan)
        </button>
        <button
          type="button"
          onClick={() => handleDemoFill('Guwahati')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          ✨ Guwahati Artisan
        </button>
        <button
          type="button"
          onClick={() => handleDemoFill('Dibrugarh')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          ✨ Dibrugarh Artisan
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card"
        noValidate
      >
        <div className="field">
          <label htmlFor="name">
            {t('fullName')}
          </label>

          <input
            id="name"
            value={form.name}
            onChange={(e) =>
              update('name', e.target.value)
            }
            placeholder="Enter full name"
          />

          {errors.name && (
            <div className="field-error">
              {errors.name}
            </div>
          )}
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="aadhar">
              {t('aadharNum')}
            </label>
            <button
              type="button"
              onClick={handleGenerateAadhaar}
              style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              🎲 Generate Demo Aadhaar
            </button>
          </div>

          <input
            id="aadhar"
            value={form.aadhar}
            onChange={(e) =>
              update('aadhar', e.target.value)
            }
            placeholder="XXXX XXXX XXXX"
            inputMode="numeric"
          />

          {errors.aadhar && (
            <div className="field-error">
              {errors.aadhar}
            </div>
          )}

          <div className="field-hint">
            {t('aadharHint')}
          </div>
        </div>

        <div className="field">
          <label htmlFor="loc">
            {t('storeLoc')}
          </label>

          <input
            id="loc"
            value={form.storeLocation}
            onChange={(e) =>
              update(
                'storeLocation',
                e.target.value
              )
            }
            placeholder="Enter location (City, State)"
          />

          {errors.storeLocation && (
            <div className="field-error">
              {errors.storeLocation}
            </div>
          )}

          <div className="field-hint">
            Active hubs: <strong style={{ color: '#16a34a', cursor: 'pointer' }} onClick={() => update('storeLocation', 'Tezpur, Assam')}>Tezpur</strong>, <strong style={{ color: '#16a34a', cursor: 'pointer' }} onClick={() => update('storeLocation', 'Guwahati, Assam')}>Guwahati</strong>, <strong style={{ color: '#16a34a', cursor: 'pointer' }} onClick={() => update('storeLocation', 'Dibrugarh, Assam')}>Dibrugarh</strong>
          </div>
        </div>

        <div className="field">
          <label htmlFor="phone">
            {t('phoneNum')}
          </label>

          <input
            id="phone"
            value={form.phone}
            onChange={(e) =>
              update('phone', e.target.value)
            }
            placeholder="10-digit mobile number"
            inputMode="numeric"
          />

          {errors.phone && (
            <div className="field-error">
              {errors.phone}
            </div>
          )}

          <div className="field-hint">
            {t('phoneHint')}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
        >
          {t('nextMaterialBtn')}
        </button>
      </form>
    </div>
  )
}
