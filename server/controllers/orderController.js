import db from '../db/database.js'
import { calculateCancellationPenalty, verifyReviewEligibility, updateSuspensionStatus } from '../services/fraudService.js'

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

export function createOrder(req, res) {
  try {
    const {
      category,
      specification,
      unit,
      totalQuantity,
      supplierId,
      coordinatorId,
      pricePerUnit,
      transportCharge,
      validity,
      perArtisan,
    } = req.body

    if (!category || !specification || !supplierId || !perArtisan || perArtisan.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields.' })
    }

    const orderId = req.body.id || genId('O')
    const materialTotal = Number(totalQuantity) * Number(pricePerUnit)
    const transportTotal = Number(transportCharge) || 0
    const totalCost = materialTotal + transportTotal

    db.exec('BEGIN TRANSACTION;')
    try {
      // 1. Insert order with immutable price snapshot (Anti-Price-Gouging)
      db.prepare(`
        INSERT INTO orders (id, category, specification, unit, total_quantity, supplier_id, coordinator_id, price_per_unit, material_total, transport_total, total_cost, status, tracking_stage, validity_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 0, ?)
      `).run(
        orderId,
        category,
        specification,
        unit || 'kg',
        Number(totalQuantity),
        supplierId,
        coordinatorId || null,
        Number(pricePerUnit),
        materialTotal,
        transportTotal,
        totalCost,
        validity || '2026-09-25'
      )

      // 2. Insert itemized per-artisan splits
      const insertSplit = db.prepare(`
        INSERT INTO order_splits (id, order_id, artisan_id, quantity, material_cost, transport_share, total_payable, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `)

      const splits = []
      const involvedArtisanIds = []
      for (const p of perArtisan) {
        const splitId = genId('OS')
        insertSplit.run(splitId, orderId, p.artisanId, Number(p.quantity), Number(p.materialCost), Number(p.transportShare), Number(p.totalCost || p.cost))
        involvedArtisanIds.push(p.artisanId)
        splits.push({
          artisanId: p.artisanId,
          quantity: Number(p.quantity),
          materialCost: Number(p.materialCost),
          transportShare: Number(p.transportShare),
          totalCost: Number(p.totalCost || p.cost),
        })
      }

      // 3. Mark involved material requests as fulfilled
      const markReq = db.prepare(`
        UPDATE material_requests
        SET status = 'fulfilled'
        WHERE artisan_id = ? AND category = ? AND status = 'open'
      `)
      for (const aId of involvedArtisanIds) {
        markReq.run(aId, category)
      }

      db.exec('COMMIT;')

      return res.status(201).json({
        order: {
          id: orderId,
          category,
          specification,
          unit,
          totalQuantity: Number(totalQuantity),
          supplierId,
          coordinatorId: coordinatorId || null,
          pricePerUnit: Number(pricePerUnit),
          materialTotal,
          transportTotal,
          totalCost,
          status: 'confirmed',
          trackingStage: 0,
          validity: validity || '2026-09-25',
          perArtisan: splits,
        },
      })
    } catch (err) {
      db.exec('ROLLBACK;')
      throw err
    }
  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ error: 'Failed to create order.' })
  }
}

export function claimDeal(req, res) {
  try {
    const { id } = req.params
    const coordinatorId = req.user.id

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }
    if (order.coordinator_id) {
      return res.status(409).json({ error: 'Deal has already been claimed by another coordinator.' })
    }

    db.prepare('UPDATE orders SET coordinator_id = ? WHERE id = ?').run(coordinatorId, id)
    return res.json({ success: true, message: 'Deal claimed successfully.', coordinatorId })
  } catch (err) {
    console.error('Claim deal error:', err)
    return res.status(500).json({ error: 'Failed to claim deal.' })
  }
}

export function advanceStage(req, res) {
  try {
    const { id } = req.params
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    const nextStage = Math.min(order.tracking_stage + 1, 4)
    const newStatus = nextStage === 4 ? 'delivered' : 'in_transit'

    db.prepare('UPDATE orders SET tracking_stage = ?, status = ? WHERE id = ?').run(nextStage, newStatus, id)
    return res.json({ success: true, trackingStage: nextStage, status: newStatus })
  } catch (err) {
    console.error('Advance stage error:', err)
    return res.status(500).json({ error: 'Failed to advance shipment stage.' })
  }
}

export function cancelOrder(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled.' })
    }

    // Find the user's financial share in the order
    const split = db.prepare('SELECT * FROM order_splits WHERE order_id = ? AND artisan_id = ?').get(id, userId)
    const shareAmount = split ? split.total_payable : order.total_cost

    // Fraud rule: 10% cancellation penalty assessment
    const penaltyAmount = calculateCancellationPenalty(shareAmount)
    const penaltyId = genId('PEN')

    db.exec('BEGIN TRANSACTION;')
    try {
      db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(id)
      db.prepare(`
        INSERT INTO penalty_ledger (id, order_id, user_id, penalty_amount, reason, status)
        VALUES (?, ?, ?, ?, 'Cancellation of confirmed group order per Rule 3', 'applied')
      `).run(penaltyId, id, userId, penaltyAmount)

      // Evaluate whether user exceeds allowable infractions
      const standing = updateSuspensionStatus(db, userId)

      db.exec('COMMIT;')

      return res.json({
        success: true,
        message: `Order cancelled. Cancellation penalty of ₹${penaltyAmount} (10% of order share) applied to account.`,
        penalty: { id: penaltyId, amount: penaltyAmount, reason: '10% cancellation fine' },
        accountStanding: standing,
      })
    } catch (err) {
      db.exec('ROLLBACK;')
      throw err
    }
  } catch (err) {
    console.error('Cancel order error:', err)
    return res.status(500).json({ error: 'Failed to cancel order.' })
  }
}

export function addReview(req, res) {
  try {
    const { orderId, targetId, rating, reviewText } = req.body
    const byUserId = req.user.id

    if (!orderId || !targetId || !rating) {
      return res.status(400).json({ error: 'Order ID, target ID, and rating (1-5) are required.' })
    }

    // Fraud Guard: Anti-Astroturfing Verified Transaction Check
    const isEligible = verifyReviewEligibility(db, byUserId, targetId)
    if (!isEligible) {
      return res.status(403).json({
        error: 'Fraud Prevention Rule: Verified Reviews Only. You can only rate suppliers or coordinators from a successfully delivered order.',
        code: 'UNVERIFIED_REVIEW_ATTEMPT',
      })
    }

    const reviewId = genId('REV')
    db.exec('BEGIN TRANSACTION;')
    try {
      db.prepare(`
        INSERT INTO reviews (id, order_id, target_id, by_user_id, rating, review_text)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(reviewId, orderId, targetId, byUserId, Number(rating), reviewText?.trim() || null)

      // Update target user's aggregated rating
      const avg = db.prepare('SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE target_id = ?').get(targetId)
      db.prepare('UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?').run(
        Math.round(avg.avgRating * 10) / 10,
        avg.count,
        targetId
      )

      db.exec('COMMIT;')
      return res.status(201).json({ success: true, reviewId, targetRating: Math.round(avg.avgRating * 10) / 10 })
    } catch (err) {
      db.exec('ROLLBACK;')
      throw err
    }
  } catch (err) {
    console.error('Add review error:', err)
    return res.status(500).json({ error: 'Failed to submit review.' })
  }
}
