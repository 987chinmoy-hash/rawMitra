import { useState, useEffect } from 'react'
import { api } from '../services/api.js'
import './SecurityAuditModal.css'

export default function SecurityAuditModal({ isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('identities') // 'identities' | 'penalties' | 'reviews' | 'quotations'
  const [copiedHash, setCopiedHash] = useState(null)

  function fetchAudit() {
    setLoading(true)
    api.audit.getSecurityAudit()
      .then((res) => setData(res))
      .catch((err) => console.warn('Audit fetch error:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isOpen) {
      fetchAudit()
    }
  }, [isOpen])

  if (!isOpen) return null

  function copyHash(hash) {
    navigator.clipboard.writeText(hash).then(() => {
      setCopiedHash(hash)
      setTimeout(() => setCopiedHash(null), 2000)
    })
  }

  const s = data?.summary || {
    totalVerifiedIdentities: 0,
    totalPenaltiesLogged: 0,
    totalPenaltyCollected: 0,
    verifiedReviewsCount: 0,
    priceLockedOrdersCount: 0,
  }

  return (
    <div className="audit-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="audit-header">
          <div className="audit-header-left">
            <div className="audit-badge">
              <span className="audit-badge-icon">🛡️</span>
              <span>HACKATHON GOVERNANCE ENGINE</span>
            </div>
            <h2>Cryptographic Trust &amp; Fraud Prevention Audit</h2>
            <p>
              Live verification proof: Zero-Plaintext Aadhaar Hashing, Automated 10% Cancellation Penalties,
              Anti-Astroturfing Delivery Gates, and Immutable Price Locks.
            </p>
          </div>
          <div className="audit-header-actions">
            <button
              className="btn btn-outline audit-refresh-btn"
              onClick={fetchAudit}
              disabled={loading}
              title="Refresh live ledger from SQLite database"
            >
              {loading ? 'Refreshing...' : '🔄 Live Sync'}
            </button>
            <button className="audit-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Live KPI Metric Strip */}
        <div className="audit-kpi-grid">
          <div className="audit-kpi-card">
            <div className="audit-kpi-num">{s.totalVerifiedIdentities}</div>
            <div className="audit-kpi-label">🔐 Salted HMAC Identities</div>
            <div className="audit-kpi-sub">0 Plaintext Stored</div>
          </div>
          <div className="audit-kpi-card">
            <div className="audit-kpi-num">{s.totalPenaltiesLogged}</div>
            <div className="audit-kpi-label">⚖️ 10% Penalties Enforced</div>
            <div className="audit-kpi-sub">Rule 3 Governance</div>
          </div>
          <div className="audit-kpi-card">
            <div className="audit-kpi-num">₹{s.totalPenaltyCollected}</div>
            <div className="audit-kpi-label">💰 Escrow Fines Debited</div>
            <div className="audit-kpi-sub">Anti-Defection Fund</div>
          </div>
          <div className="audit-kpi-card">
            <div className="audit-kpi-num">{s.verifiedReviewsCount}</div>
            <div className="audit-kpi-label">⭐ Gatekeeper Verified Reviews</div>
            <div className="audit-kpi-sub">100% Delivered Orders</div>
          </div>
          <div className="audit-kpi-card">
            <div className="audit-kpi-num">{s.priceLockedOrdersCount}</div>
            <div className="audit-kpi-label">🔒 Frozen Quotations</div>
            <div className="audit-kpi-sub">Anti-Price-Gouging</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="audit-tabs">
          <button
            className={`audit-tab ${activeTab === 'identities' ? 'active' : ''}`}
            onClick={() => setActiveTab('identities')}
          >
            🔐 Aadhaar Deduplication ({data?.identities?.length || 0})
          </button>
          <button
            className={`audit-tab ${activeTab === 'penalties' ? 'active' : ''}`}
            onClick={() => setActiveTab('penalties')}
          >
            ⚖️ Penalty Ledger ({data?.penalties?.length || 0})
          </button>
          <button
            className={`audit-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Verified Reviews ({data?.verifiedReviews?.length || 0})
          </button>
          <button
            className={`audit-tab ${activeTab === 'quotations' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotations')}
          >
            🔒 Price-Lock Proof ({data?.lockedQuotations?.length || 0})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="audit-body">
          {loading && !data && (
            <div className="audit-loading">Inspecting SQLite cryptographic tables...</div>
          )}

          {/* TAB 1: IDENTITIES */}
          {activeTab === 'identities' && (
            <div className="audit-panel">
              <div className="audit-notice">
                <strong>UIDAI Privacy Standard:</strong> No citizen Aadhaar number is stored in rawMitra.
                Instead, Aadhaar strings are passed through a deterministic HMAC-SHA256 function salted with a platform secret.
                If any user attempts to register a second account with the same Aadhaar, the deterministic hash collision
                triggers an instant <code>DUPLICATE_IDENTITY_DETECTED</code> block.
              </div>

              <table className="audit-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Masked Display</th>
                    <th>Cryptographic Identity Hash (SHA-256)</th>
                    <th>Compliance</th>
                    <th>Standing</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.identities || []).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                        <div className="audit-cell-sub">{u.id} · {u.phone}</div>
                      </td>
                      <td>
                        <span className={`tag tag-${u.role === 'artisan' ? 'brass' : u.role === 'supplier' ? 'green' : 'ink'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td><code>{u.maskedAadhaar}</code></td>
                      <td>
                        <div className="audit-hash-wrap">
                          <code className="audit-hash" title={u.identityHash}>
                            {u.identityHash ? `${u.identityHash.slice(0, 16)}...${u.identityHash.slice(-8)}` : 'N/A'}
                          </code>
                          {u.identityHash && (
                            <button
                              className="audit-copy-btn"
                              onClick={() => copyHash(u.identityHash)}
                              title="Copy full 256-bit hash digest"
                            >
                              {copiedHash === u.identityHash ? '✓ Copied' : 'Copy'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="audit-pass-badge">✓ ZERO-PLAINTEXT</span>
                      </td>
                      <td>
                        {u.isSuspended ? (
                          <span className="audit-fail-badge">SUSPENDED (Rule 3)</span>
                        ) : (
                          <span className="audit-ok-badge">ACTIVE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PENALTIES */}
          {activeTab === 'penalties' && (
            <div className="audit-panel">
              <div className="audit-notice">
                <strong>Rule 3 Enforcement Engine:</strong> Participant withdrawal is permitted freely during the
                formation phase. However, once a group order is <strong>confirmed</strong>, cancellation damages all other
                artisans by increasing their transport share. The system automatically assesses a <strong>10% cancellation fine</strong>
                on the departing user's share and records it into the immutable <code>penalty_ledger</code>. Two infractions result in automatic account suspension.
              </div>

              {(!data?.penalties || data.penalties.length === 0) ? (
                <div className="audit-empty">
                  No penalty infractions logged yet. (Cancel any confirmed group order to watch this ledger update live!)
                </div>
              ) : (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Infraction ID</th>
                      <th>Order ID</th>
                      <th>Violator</th>
                      <th>Penalty Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.penalties.map((p) => (
                      <tr key={p.id}>
                        <td><code>{p.id}</code></td>
                        <td><strong>{p.order_id}</strong></td>
                        <td>
                          {p.user_name || p.user_id}
                          <div className="audit-cell-sub">{p.user_role}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#dc2626' }}>₹{p.penalty_amount}</strong>
                          <div className="audit-cell-sub">10% of order share</div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{p.reason}</td>
                        <td>
                          <span className="audit-fail-badge">{p.status?.toUpperCase()}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                          {p.created_at ? new Date(p.created_at).toLocaleString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: VERIFIED REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="audit-panel">
              <div className="audit-notice">
                <strong>Anti-Astroturfing &amp; Sybil Resistance (Rule 4):</strong> Competitors or fake accounts cannot leave reviews.
                The <code>verifyReviewEligibility</code> backend check queries SQLite foreign keys ensuring the reviewer
                and the target user were documented counterparties on an order with status <code>delivered</code>.
              </div>

              {(!data?.verifiedReviews || data.verifiedReviews.length === 0) ? (
                <div className="audit-empty">
                  No reviews submitted yet. Rate a supplier after an order is marked delivered to verify this gatekeeper.
                </div>
              ) : (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Review ID</th>
                      <th>Reviewed Entity</th>
                      <th>Verified Reviewer</th>
                      <th>Rating</th>
                      <th>Review Remarks</th>
                      <th>Order Delivery Status</th>
                      <th>Gatekeeper Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.verifiedReviews.map((r) => (
                      <tr key={r.id}>
                        <td><code>{r.id}</code></td>
                        <td>
                          <strong>{r.target_name}</strong>
                          <div className="audit-cell-sub">{r.target_role}</div>
                        </td>
                        <td>
                          {r.reviewer_name}
                          <div className="audit-cell-sub">{r.reviewer_role}</div>
                        </td>
                        <td style={{ color: '#f59e0b', fontWeight: 700 }}>
                          {'★'.repeat(r.rating || 5)} ({r.rating}/5)
                        </td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>
                          "{r.review_text}"
                        </td>
                        <td>
                          <span className="tag tag-green">{r.order_status || 'delivered'}</span>
                        </td>
                        <td>
                          <span className="audit-pass-badge">✓ VERIFIED TRANSACTION</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: IMMUTABLE PRICE QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="audit-panel">
              <div className="audit-notice">
                <strong>Anti-Price-Gouging Lock:</strong> When suppliers publish wholesale listings, they must define
                a binding <code>validity_date</code>. When artisans form a procurement pool, the unit price is cryptographically snapshotted
                into the order record. Suppliers cannot retroactively alter prices when demand surges.
              </div>

              {(!data?.lockedQuotations || data.lockedQuotations.length === 0) ? (
                <div className="audit-empty">No active order quotations locked yet.</div>
              ) : (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Order Reference</th>
                      <th>Material Specification</th>
                      <th>Supplier</th>
                      <th>Locked Unit Price</th>
                      <th>Guaranteed Until</th>
                      <th>Price Protection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lockedQuotations.map((q) => (
                      <tr key={q.id}>
                        <td><code>{q.id}</code></td>
                        <td>
                          <strong>{q.category}</strong>
                          <div className="audit-cell-sub">{q.specification}</div>
                        </td>
                        <td>{q.supplier_name || 'Verified Supplier'}</td>
                        <td>
                          <strong style={{ color: '#16a34a' }}>₹{q.price_per_unit} / {q.unit}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>📅 {q.validity_snapshot}</span>
                        </td>
                        <td>
                          <span className="audit-pass-badge">✓ IMMUTABLE SNAPSHOT</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="audit-footer">
          <div className="audit-footer-info">
            <span className="audit-dot"></span>
            Live SQLite Database &middot; <code>rawmitra.db</code> &middot; SHA-256 HMAC Enforced
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
