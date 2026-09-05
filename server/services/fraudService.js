import crypto from 'crypto'

const AADHAAR_SALT = process.env.AADHAAR_SALT || 'rawmitra_assam_trust_salt_2026'

/**
 * Generates an irreversible cryptographic hash of the Aadhaar number
 * for duplicate account detection and anti-impersonation without storing plaintext Aadhaar.
 */
export function generateIdentityHash(rawAadhaar = '') {
  const clean = rawAadhaar.toString().replace(/\s+/g, '').trim()
  if (!/^\d{12}$/.test(clean)) {
    throw new Error('Invalid Aadhaar format. Must be a 12-digit numeric identifier.')
  }
  return crypto.createHmac('sha256', AADHAAR_SALT).update(clean).digest('hex')
}

/**
 * Returns a masked Aadhaar string for visual profile rendering (e.g. •••• •••• 4821)
 */
export function maskAadhaar(rawAadhaar = '') {
  const clean = rawAadhaar.toString().replace(/\s+/g, '').trim()
  const last4 = clean.slice(-4) || 'XXXX'
  return `•••• •••• ${last4}`
}

/**
 * Fraud Check: Checks if Aadhaar was already used to register an account
 */
export function checkDuplicateIdentity(db, identityHash, excludeUserId = null) {
  const query = excludeUserId
    ? db.prepare('SELECT id, name, role FROM users WHERE identity_hash = ? AND id != ?')
    : db.prepare('SELECT id, name, role FROM users WHERE identity_hash = ?')

  const existing = excludeUserId
    ? query.get(identityHash, excludeUserId)
    : query.get(identityHash)

  return existing || null
}

/**
 * Enforces the 10% Cancellation Penalty rule per Hackathon governance specifications
 */
export function calculateCancellationPenalty(userCostShare = 0) {
  return Math.round(Number(userCostShare) * 0.10)
}

/**
 * Anti-Astroturfing & Fake Review Guard:
 * Verifies that the reviewer and target counterparty were part of a successfully delivered order.
 */
export function verifyReviewEligibility(db, byUserId, targetId) {
  const deliveredOrder = db.prepare(`
    SELECT o.id, o.supplier_id, o.coordinator_id, os.artisan_id
    FROM orders o
    LEFT JOIN order_splits os ON os.order_id = o.id
    WHERE o.status = 'delivered'
      AND (
        (os.artisan_id = ? AND (o.supplier_id = ? OR o.coordinator_id = ?)) OR
        (o.supplier_id = ? AND (os.artisan_id = ? OR o.coordinator_id = ?)) OR
        (o.coordinator_id = ? AND (os.artisan_id = ? OR o.supplier_id = ?))
      )
    LIMIT 1
  `).get(byUserId, targetId, targetId, byUserId, targetId, targetId, byUserId, targetId, targetId)

  return Boolean(deliveredOrder)
}

/**
 * Evaluates account standing and flags for suspension if penalties exceed threshold (>= 2)
 */
export function updateSuspensionStatus(db, userId) {
  const penalties = db.prepare(`
    SELECT COUNT(*) as count, SUM(penalty_amount) as total
    FROM penalty_ledger
    WHERE user_id = ? AND status = 'applied'
  `).get(userId)

  if (penalties.count >= 2) {
    db.prepare('UPDATE users SET is_suspended = 1 WHERE id = ?').run(userId)
    return { isSuspended: true, count: penalties.count, total: penalties.total }
  }
  return { isSuspended: false, count: penalties.count, total: penalties.total }
}
