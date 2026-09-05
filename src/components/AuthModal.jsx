import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAppDispatch } from '../context/AppContext.jsx'
import './AuthModal.css'

const ROLE_LANDING = {
  artisan: '/artisan/materials',
  supplier: '/supplier/dashboard',
  coordinator: '/coordinator/dashboard',
}

export default function AuthModal({ isOpen, onClose }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [role, setRole] = useState('artisan')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [aadhar, setAadhar] = useState('')
  const [locationOrExp, setLocationOrExp] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function afterAuth(user) {
    dispatch({ type: 'SET_AUTH_USER', user })
    onClose()
    navigate(ROLE_LANDING[user.role] || '/')
  }

  async function handleQuickLogin(demoPhone, demoPass) {
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.login({ phone: demoPhone, password: demoPass })
      afterAuth(res.user)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await api.auth.login({ phone, password: password || 'password123' })
        afterAuth(res.user)
      } else {
        const res = await api.auth.register({
          role,
          name,
          phone,
          password: password || 'password123',
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

        {/* Demo Fast Fill Bar for Judges */}
        <div className="auth-demo-bar">
          <strong>⚡ 1-Click Instant Demo Login:</strong>
          <div className="auth-demo-buttons">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickLogin('9864000001', 'password123')}
              disabled={loading}
              title="Instant sign-in as Deepa Boro"
            >
              🟢 Deepa (Artisan)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickLogin('9435000014', 'password123')}
              disabled={loading}
              title="Instant sign-in as Assam Bamboo Syndicate"
            >
              🔵 Assam Bamboo (Supplier)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickLogin('9678000020', 'password123')}
              disabled={loading}
              title="Instant sign-in as Manash Sarma"
            >
              🟣 Manash (Coordinator)
            </button>
          </div>
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
                  placeholder="e.g. Tarun Rabha"
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
                  placeholder={role === 'coordinator' ? 'e.g. 5 years in transport co-op' : 'e.g. Sualkuchi, Assam'}
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
              placeholder={tab === 'login' ? '10-digit phone (e.g. 9864000001 or your number)' : '10-digit mobile number'}
              required
            />
            {tab === 'login' && (
              <span className="field-hint">💡 In demo mode: Any 10-digit phone number is accepted and auto-logged in.</span>
            )}
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
