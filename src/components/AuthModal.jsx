import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAppDispatch } from '../context/AppContext.jsx'
import './AuthModal.css'

const ROLE_LANDING = {
  artisan: '/artisan/materials',
  supplier: '/supplier/dashboard',
  coordinator: '/coordinator/dashboard',
}

export default function AuthModal({ isOpen, onClose, initialRole = 'artisan', initialTab = 'login' }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [role, setRole] = useState(initialRole)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [aadhar, setAadhar] = useState('')
  const [locationOrExp, setLocationOrExp] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      setRole(initialRole)
      setError(null)
    }
  }, [isOpen, initialRole, initialTab])

  if (!isOpen) return null

  function afterAuth(user) {
    dispatch({ type: 'SET_AUTH_USER', user })
    onClose()
    navigate(ROLE_LANDING[user.role] || '/')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await api.auth.login({ phone, password })
        afterAuth(res.user)
      } else {
        const res = await api.auth.register({
          role,
          name,
          phone,
          password,
          aadhar,
          storeLocation: role !== 'coordinator' ? locationOrExp : undefined,
          experience: role === 'coordinator' ? locationOrExp : undefined,
        })
        afterAuth(res.user)
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          &times;
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`}
            onClick={() => { setTab('login'); setError(null) }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'signup' ? 'is-active' : ''}`}
            onClick={() => { setTab('signup'); setError(null) }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <strong>⚠️ Notice:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <div className="field">
                <label>Select Your Role</label>
                <div className="auth-role-select">
                  {['artisan', 'supplier', 'coordinator'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`auth-role-btn ${role === r ? 'is-active' : ''}`}
                      onClick={() => setRole(r)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Full Name / Business Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name or business name"
                  required
                />
              </div>

              <div className="field">
                <label>12-digit Aadhaar Number (KYC Verification)</label>
                <input
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  required
                />
                <span className="field-hint">Never stored in plain text. Hashed with SHA-256 for fraud unicity check.</span>
              </div>

              <div className="field">
                <label>{role === 'coordinator' ? 'Logistics Experience' : 'Store / Workshop Location'}</label>
                <input
                  value={locationOrExp}
                  onChange={(e) => setLocationOrExp(e.target.value)}
                  placeholder={role === 'coordinator' ? 'Enter logistics experience' : 'Enter location (City, State)'}
                  required
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Mobile Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : tab === 'login' ? 'Log In to rawMitra' : 'Complete Verification & Register'}
          </button>
        </form>
      </div>
    </div>
  )
}