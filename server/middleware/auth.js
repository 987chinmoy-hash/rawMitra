import jwt from 'jsonwebtoken'
import db from '../db/database.js'

export const JWT_SECRET = process.env.JWT_SECRET || 'rawmitra_assam_jwt_secret_2026'

/**
 * Middleware: Verifies JWT token and attaches authenticated user to req.user
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, role, name, phone, aadhar_masked, store_location, experience, rating, is_suspended FROM users WHERE id = ?').get(decoded.id)

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' })
    }

    if (user.is_suspended) {
      return res.status(403).json({
        error: 'Account suspended due to unresolved order cancellation violations.',
        suspended: true,
      })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' })
  }
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 * e.g. requireRole('artisan'), requireRole('supplier'), requireRole('coordinator')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. This action is restricted to [${allowedRoles.join(', ')}] roles. Your current role is [${req.user.role}].`,
      })
    }
    next()
  }
}
