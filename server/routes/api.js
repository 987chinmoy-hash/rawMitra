import { Router } from 'express'
import {
  register,
  login,
  me,
  updateProgress,
  bootstrap,
} from '../controllers/authController.js'
import {
  addRequests,
  withdrawRequest,
  addSupplierStock,
  getMyStock,
} from '../controllers/materialController.js'
import {
  createOrder,
  claimDeal,
  advanceStage,
  cancelOrder,
  addReview,
} from '../controllers/orderController.js'
import { addBroadcast } from '../controllers/broadcastController.js'
import { getSecurityAudit } from '../controllers/auditController.js'
import { search } from '../controllers/searchController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public Auth & Bootstrap
router.post('/auth/register', register)
router.post('/auth/login', login)

// Get currently logged-in user and saved workflow progress
router.get('/auth/me', requireAuth, me)

// Update currently logged-in user's workflow progress
router.patch('/auth/progress', requireAuth, updateProgress)

router.get('/bootstrap', bootstrap)

// Security & Fraud Prevention Real-Time Audit Engine
router.get('/audit/security', getSecurityAudit)

// Material Requirements & Sourcing (Artisan)
router.post(
  '/materials/request',
  requireAuth,
  requireRole('artisan'),
  addRequests
)

router.delete(
  '/materials/request/:id',
  requireAuth,
  withdrawRequest
)

// Supplier Catalog & Quotation Management (Supplier)
router.post(
  '/supplier/stock',
  requireAuth,
  requireRole('supplier'),
  addSupplierStock
)

router.get(
  '/supplier/my-stock',
  requireAuth,
  requireRole('supplier'),
  getMyStock
)

// Order Lifecycle & Penalty Enforcement
router.post(
  '/orders',
  requireAuth,
  createOrder
)

router.patch(
  '/orders/:id/claim',
  requireAuth,
  requireRole('coordinator'),
  claimDeal
)

router.patch(
  '/orders/:id/stage',
  requireAuth,
  advanceStage
)

router.post(
  '/orders/:id/cancel',
  requireAuth,
  cancelOrder
)

// Verified Reviews & Ratings
router.post(
  '/reviews',
  requireAuth,
  addReview
)

// Broadcast Pool (Artisan posts open demand to pool)
router.post(
  '/broadcasts',
  requireAuth,
  requireRole('artisan'),
  addBroadcast
)

// Global Multi-field Cross-lingual Search
router.get('/search', search)

export default router
