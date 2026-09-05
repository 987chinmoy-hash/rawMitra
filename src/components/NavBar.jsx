import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { t } from '../utils/i18n.js'
import AuthModal from './AuthModal.jsx'
import SecurityAuditModal from './SecurityAuditModal.jsx'
import './NavBar.css'

export default function NavBar() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const lang = state.language || 'en'
  const [q, setQ] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(!state.authUser)
  const [isAuditOpen, setIsAuditOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function handleSwitchRole() {
    dispatch({ type: 'RESET_SESSION' })
    navigate('/start')
  }

  function handleLangChange(e) {
    dispatch({ type: 'SET_LANGUAGE', language: e.target.value })
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <path d="M4 24 Q10 8 16 24 Q22 8 28 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          rawMitra
        </Link>

        <form className="nav-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder={t('searchPlaceholder', lang)}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search rawMitra"
          />
          <button type="submit" className="nav-search-btn" aria-label="Search">
            <svg viewBox="0 0 20 20" width="17" height="17">
              <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </form>

        <nav className="nav-links">
          <Link to="/forecast">{t('priceOutlook', lang)}</Link>
          <Link to="/guide">{t('guidebook', lang)}</Link>

          <button
            type="button"
            className="nav-audit-trigger-btn"
            onClick={() => setIsAuditOpen(true)}
            title="Inspect live cryptographic identity hashes and fraud prevention ledger"
          >
            {t('trustAudit', lang) || '🛡️ Trust Audit'}
          </button>

          <div className="nav-lang-wrap">
            <span aria-hidden="true" style={{ fontSize: '0.9rem' }}>🌐</span>
            <select
              className="nav-lang-select"
              value={lang}
              onChange={handleLangChange}
              aria-label="Select Language"
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="as">অসমীয়া</option>
            </select>
          </div>

          {state.authUser ? (
            <>
              <div className="nav-user-badge">
                <span className="nav-user-role">{state.authUser.role}</span>
                <span className="nav-user-name">{state.authUser.name}</span>
                <span className="nav-kyc-tag" title={state.authUser.aadhar_masked || 'KYC Verified'}>🛡️ KYC</span>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/') }}
                  title="Sign out of account"
                >
                  {t('signOut', lang)}
                </button>
              </div>
              <button className="btn-ghost" onClick={handleSwitchRole}>{t('switchRole', lang)}</button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-auth-btn"
                onClick={() => setIsAuthOpen(true)}
              >
                🔑 {t('logIn', lang)}
              </button>
              <Link to="/start" className="btn btn-brass nav-cta">{t('getStarted', lang)}</Link>
            </>
          )}
        </nav>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SecurityAuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </header>
  )
}
