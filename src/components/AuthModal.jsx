import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAppDispatch, useAppState } from '../context/AppContext.jsx'
import './AuthModal.css'

const ROLE_LANDING = {
  artisan: '/artisan/materials',
  supplier: '/supplier/dashboard',
  coordinator: '/coordinator/dashboard',
}

const DEMO_ACCOUNTS = {
  phone: [
    { label: 'Deepa (Artisan)', val: '9864000001', role: 'artisan', name: 'Deepa Boro' },
    { label: 'Assam Bamboo (Supplier)', val: '9435000014', role: 'supplier', name: 'Assam Bamboo Syndicate' },
    { label: 'Manash (Coordinator)', val: '9678000020', role: 'coordinator', name: 'Manash Sarma' },
  ],
  email: [
    { label: 'deepa.artisan@gmail.com', val: 'deepa.artisan@gmail.com', role: 'artisan', name: 'Deepa Boro' },
    { label: 'assam.bamboo@gmail.com', val: 'assam.bamboo@gmail.com', role: 'supplier', name: 'Assam Bamboo Syndicate' },
    { label: 'manash.logistics@gmail.com', val: 'manash.logistics@gmail.com', role: 'coordinator', name: 'Manash Sarma' },
  ],
}

export default function AuthModal({ isOpen, onClose }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [authMethod, setAuthMethod] = useState('email') // 'email' | 'phone'
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpToast, setOtpToast] = useState(null)
  
  // Registration fields
  const [role, setRole] = useState('artisan')
  const [name, setName] = useState('')
  const [locationOrExp, setLocationOrExp] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setOtpSent(false)
      setOtp('')
      setOtpToast(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  function afterAuth(user) {
    dispatch({ type: 'SET_AUTH_USER', user })
    onClose()
    navigate(ROLE_LANDING[user.role] || '/')
  }

  // 1-Click direct demo button for judges
  async function handleQuickDirectLogin(demoPhone) {
    setError(null)
    setLoading(true)
    try {
      const res = await api.auth.login({ phone: demoPhone, password: 'password123' })
      afterAuth(res.user)
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fill on clicking the input field
  function handleInputClick(field) {
    if (field === 'phone' && !phone) {
      setPhone('9864000001')
    } else if (field === 'email' && !email) {
      setEmail('deepa.artisan@gmail.com')
    } else if (field === 'name' && !name) {
      setName('Deepa Boro')
    } else if (field === 'location' && !locationOrExp) {
      setLocationOrExp(role === 'coordinator' ? '5 years in handloom logistics' : 'Sualkuchi, Assam')
    }
  }

  // Choose demo chip
  function applyDemoAccount(item) {
    if (authMethod === 'phone') {
      setPhone(item.val)
    } else {
      setEmail(item.val)
    }
    setRole(item.role)
    setName(item.name)
    setError(null)
  }

  // Step 1: Send OTP
  async function handleSendOtp(e) {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)

    const target = authMethod === 'phone' ? phone : email
    if (!target.trim()) {
      setError(`Please enter your ${authMethod === 'phone' ? 'Phone Number' : 'Gmail address'}.`)
      setLoading(false)
      return
    }

    try {
      const res = await api.auth.sendOtp({ target: target.trim(), type: authMethod })
      setOtpSent(true)
      
      // Auto-populate the OTP immediately for demo speed!
      const deliveredCode = res.demoOtp || '4821'
      setOtp(deliveredCode)

      // Simulated notification toast
      const toastMsg = authMethod === 'phone'
        ? `📱 SMS Notification: Your rawMitra verification code is ${deliveredCode}`
        : `📩 Gmail Alert [Inbox]: rawMitra One-Time Password is ${deliveredCode}`

      setOtpToast({
        text: toastMsg,
        code: deliveredCode,
        type: authMethod,
      })
    } catch (err) {
      setError(err.message || 'Failed to dispatch OTP. Please check input.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Login / Register
  async function handleVerifyOtp(e) {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)

    const target = authMethod === 'phone' ? phone : email
    try {
      const res = await api.auth.verifyOtp({
        target: target.trim(),
        otp: otp.trim() || '4821',
        role,
        name: name.trim() || (authMethod === 'email' ? email.split('@')[0] : 'Artisan'),
        locationOrExp: locationOrExp.trim(),
      })
      afterAuth(res.user)
    } catch (err) {
      setError(err.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          &times;
        </button>

        {/* Header with Security Badge */}
        <div className="auth-header-strip">
          <span className="auth-security-badge">🛡️ OTP Verified Client Access</span>
          <h2>Welcome to rawMitra</h2>
          <p>Login or create an account using Mobile Phone or Gmail OTP.</p>
        </div>

        {/* 1-Click Fast Track Demo Bar */}
        <div className="auth-demo-bar">
          <div className="auth-demo-bar-title">⚡ 1-Click Instant Demo Profiles:</div>
          <div className="auth-demo-buttons">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickDirectLogin('9864000001')}
              disabled={loading}
              title="Instant sign-in as Deepa Boro"
            >
              🟢 Deepa (Artisan)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickDirectLogin('9435000014')}
              disabled={loading}
              title="Instant sign-in as Assam Bamboo Syndicate"
            >
              🔵 Assam Bamboo (Supplier)
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickDirectLogin('9678000020')}
              disabled={loading}
              title="Instant sign-in as Manash Sarma"
            >
              🟣 Manash (Coordinator)
            </button>
          </div>
        </div>

        {/* Method Switcher: Gmail vs Phone */}
        <div className="auth-method-switcher">
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('email'); setOtpSent(false); setOtpToast(null); setError(null) }}
          >
            📧 Gmail / Email OTP
          </button>
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('phone'); setOtpSent(false); setOtpToast(null); setError(null) }}
          >
            📱 Mobile Phone OTP
          </button>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
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
            New Registration
          </button>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <strong>⚠️ Notice:</strong> {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="auth-form-body">
          {tab === 'signup' && (
            <>
              <div className="field">
                <label>I am registering as:</label>
                <div className="auth-role-select">
                  {['artisan', 'supplier', 'coordinator'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`auth-role-btn ${role === r ? 'is-active' : ''}`}
                      onClick={() => setRole(r)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {r === 'artisan' ? '🧶 Artisan' : r === 'supplier' ? '📦 Supplier' : '🚚 Coordinator'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Full Name / Business Name (Click to auto-fill)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onClick={() => handleInputClick('name')}
                  placeholder="e.g. Deepa Boro or Click here to auto-fill"
                  required
                />
              </div>

              <div className="field">
                <label>{role === 'coordinator' ? 'Logistics Experience' : 'Store / Workshop Location'}</label>
                <input
                  value={locationOrExp}
                  onChange={(e) => setLocationOrExp(e.target.value)}
                  onClick={() => handleInputClick('location')}
                  placeholder={role === 'coordinator' ? 'e.g. 5 years in handloom logistics' : 'e.g. Sualkuchi, Assam'}
                  required
                />
              </div>
            </>
          )}

          {/* Primary Identifier Input: Phone or Gmail */}
          {authMethod === 'email' ? (
            <div className="field">
              <label>Gmail / Email Address (Click box to auto-fill):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onClick={() => handleInputClick('email')}
                placeholder="Click here or type your Gmail address"
                required
                disabled={otpSent}
              />
              <div className="auth-quick-chips">
                <span className="auth-chip-label">Quick autofill:</span>
                {DEMO_ACCOUNTS.email.map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    className="auth-chip"
                    onClick={() => applyDemoAccount(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="field">
              <label>Mobile Phone Number (Click box to auto-fill):</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onClick={() => handleInputClick('phone')}
                placeholder="Click here or type 10-digit phone"
                required
                disabled={otpSent}
              />
              <div className="auth-quick-chips">
                <span className="auth-chip-label">Quick autofill:</span>
                {DEMO_ACCOUNTS.phone.map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    className="auth-chip"
                    onClick={() => applyDemoAccount(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Simulated Toast Notification Banner */}
          {otpToast && (
            <div className="auth-otp-toast">
              <div className="auth-toast-icon">{otpToast.type === 'phone' ? '📱' : '📩'}</div>
              <div className="auth-toast-content">
                <strong>Simulated Live Delivery:</strong>
                <div className="auth-toast-text">{otpToast.text}</div>
                <div className="auth-toast-auto-notice">✓ Code auto-filled into verification box below</div>
              </div>
            </div>
          )}

          {/* OTP Verification Input (shown after Send OTP) */}
          {otpSent && (
            <div className="field auth-otp-field">
              <label>Enter 4-digit OTP (Already auto-filled):</label>
              <div className="auth-otp-input-wrap">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="auth-otp-input"
                  placeholder="••••"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline btn-resend"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Resend
                </button>
              </div>
              <span className="field-hint">💡 In demo mode: OTP is automatically filled so you can enter immediately.</span>
            </div>
          )}

          {/* Action Button */}
          {!otpSent ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : `Send OTP to ${authMethod === 'email' ? 'Gmail' : 'Phone'} →`}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-brass btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Verifying & Entering...' : '⚡ Verify OTP & Enter rawMitra Portal'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
