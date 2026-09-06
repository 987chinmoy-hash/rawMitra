import bcrypt from 'bcryptjs'
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
      groupName,
      deliveryLocation,
      status,
    } = req.body

    if (!category || !specification || !supplierId || !perArtisan || perArtisan.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields.' })
    }

    const orderId = req.body.id || genId('O')
    const materialTotal = Number(totalQuantity) * Number(pricePerUnit)
    const transportTotal = Number(transportCharge) || 0
    const totalCost = materialTotal + transportTotal
    const orderStatus = status || 'placed'

    db.exec('BEGIN TRANSACTION;')
    try {
      // Ensure supplier exists in users table to satisfy FOREIGN KEY constraint
      const existingSupplier = db.prepare('SELECT id FROM users WHERE id = ? OR phone = ?').get(supplierId, supplierId)
      const resolvedSupplierId = existingSupplier ? existingSupplier.id : supplierId
      if (!existingSupplier) {
        const dummyPass = bcrypt.hashSync('password123', 8)
        const dummyAadhaar = `8888${Math.random().toString().slice(2, 10)}`
        db.prepare(`
          INSERT OR IGNORE INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, rating, reviews_count, onboarding_complete, current_step)
          VALUES (?, 'supplier', ?, ?, ?, ?, ?, ?, 4.9, 12, 1, 'completed')
        `).run(
          resolvedSupplierId,
          req.body.supplierName || 'Verified Supplier',
          `9865${Math.random().toString().slice(2, 8)}`,
          dummyPass,
          dummyAadhaar,
          `•••• •••• ${dummyAadhaar.slice(-4)}`,
          deliveryLocation || 'Tezpur, Assam'
        )
      }

      // 1. Insert order with immutable price snapshot (Anti-Price-Gouging) - IDEMPOTENT REPLACE
      db.prepare(`
        INSERT OR REPLACE INTO orders (id, category, specification, unit, total_quantity, supplier_id, coordinator_id, price_per_unit, material_total, transport_total, total_cost, status, tracking_stage, validity_snapshot, group_name, delivery_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      `).run(
        orderId,
        category,
        specification,
        unit || 'kg',
        Number(totalQuantity),
        resolvedSupplierId,
        coordinatorId || null,
        Number(pricePerUnit),
        materialTotal,
        transportTotal,
        totalCost,
        orderStatus,
        validity || '2026-09-30',
        groupName || 'Artisan Syndicate Pool',
        deliveryLocation || 'Tezpur'
      )

      // 2. Clear any prior splits for idempotency and insert itemized per-artisan splits
      try {
        db.prepare('DELETE FROM order_splits WHERE order_id = ?').run(orderId)
      } catch (e) {}

      const insertSplit = db.prepare(`
        INSERT OR REPLACE INTO order_splits (id, order_id, artisan_id, quantity, material_cost, transport_share, total_payable, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `)

      const splits = []
      const involvedArtisanIds = []
      for (const p of perArtisan) {
        const artisanId = p.artisanId || 'A-1001'
        // Ensure artisan exists in users table to satisfy FOREIGN KEY constraint
        const existingUser = db.prepare('SELECT id FROM users WHERE id = ? OR phone = ?').get(artisanId, artisanId)
        const resolvedArtisanId = existingUser ? existingUser.id : artisanId
        if (!existingUser) {
          const defaultPass = bcrypt.hashSync('password123', 8)
          const dummyAadhaar = `8888${Math.random().toString().slice(2, 10)}`
          db.prepare(`
            INSERT OR IGNORE INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, rating, reviews_count, onboarding_complete, current_step)
            VALUES (?, 'artisan', ?, ?, ?, ?, ?, ?, 4.8, 10, 1, 'completed')
          `).run(
            resolvedArtisanId,
            p.artisanName || p.name || 'Artisan Member',
            `9864${Math.random().toString().slice(2, 8)}`,
            defaultPass,
            dummyAadhaar,
            `•••• •••• ${dummyAadhaar.slice(-4)}`,
            deliveryLocation || 'Tezpur, Assam'
          )
        }

        const splitId = genId('OS')
        const q = Number(p.quantity)
        const mCost = Number(p.materialCost || (q * pricePerUnit))
        const tShare = Number(p.transportShare || 0)
        const tCost = Number(p.totalCost || p.cost || (mCost + tShare))

        insertSplit.run(splitId, orderId, resolvedArtisanId, q, mCost, tShare, tCost)
        involvedArtisanIds.push(resolvedArtisanId)
        splits.push({
          artisanId,
          artisanName: p.artisanName || p.name || 'Artisan Member',
          quantity: q,
          materialCost: mCost,
          transportShare: tShare,
          totalCost: tCost,
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
          status: orderStatus,
          trackingStage: 0,
          validity: validity || '2026-09-30',
          groupName: groupName || 'Artisan Syndicate Pool',
          deliveryLocation: deliveryLocation || 'Tezpur',
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

export function getSupplierOrders(req, res) {
  try {
    const rawSupplierId = req.query.supplierId || req.user?.id
    if (!rawSupplierId) {
      return res.json({ orders: [] })
    }

    // Resolve supplier id by id or phone
    const supUser = db.prepare('SELECT id, phone, name FROM users WHERE id = ? OR phone = ?').get(rawSupplierId, rawSupplierId)
    const supplierId = supUser ? supUser.id : rawSupplierId

    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE supplier_id = ? OR supplier_id = ?
      ORDER BY created_at DESC
    `).all(supplierId, rawSupplierId)

    const fullOrders = orders.map((o) => {
      const splits = db.prepare(`
        SELECT 
          s.id,
          s.order_id,
          s.artisan_id as artisanId,
          COALESCE(u.name, s.artisan_id) as artisanName,
          u.phone as artisanPhone,
          u.store_location as artisanLocation,
          s.quantity,
          s.material_cost as materialCost,
          s.transport_share as transportShare,
          s.total_payable as totalCost,
          s.payment_status as paymentStatus
        FROM order_splits s
        LEFT JOIN users u ON u.id = s.artisan_id
        WHERE s.order_id = ?
      `).all(o.id)

      return {
        id: o.id,
        category: o.category,
        specification: o.specification,
        unit: o.unit,
        totalQuantity: o.total_quantity,
        supplierId: o.supplier_id,
        coordinatorId: o.coordinator_id,
        pricePerUnit: o.price_per_unit,
        materialTotal: o.material_total,
        transportTotal: o.transport_total,
        totalCost: o.total_cost,
        status: o.status,
        trackingStage: o.tracking_stage,
        validity: o.validity_snapshot,
        groupName: o.group_name || 'Artisan Collective Group',
        deliveryLocation: o.delivery_location || 'Tezpur',
        createdAt: o.created_at,
        perArtisan: splits,
      }
    })

    return res.json({ orders: fullOrders })
  } catch (err) {
    console.error('Get supplier orders error:', err)
    return res.status(500).json({ error: 'Failed to retrieve supplier orders.' })
  }
}

export function acceptOrder(req, res) {
  try {
    const { id } = req.params
    const supplierId = req.user?.id || req.body?.supplierId

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }
    if (supplierId && order.supplier_id && order.supplier_id !== supplierId) {
      return res.status(403).json({ error: 'You are not authorized to accept this order.' })
    }

    db.prepare("UPDATE orders SET status = 'accepted', tracking_stage = 1 WHERE id = ?").run(id)
    return res.json({
      success: true,
      message: 'Order accepted successfully. Batch moving to packaging stage.',
      status: 'accepted',
      trackingStage: 1,
    })
  } catch (err) {
    console.error('Accept order error:', err)
    return res.status(500).json({ error: 'Failed to accept order.' })
  }
}

export function rejectOrder(req, res) {
  try {
    const { id } = req.params
    const supplierId = req.user?.id || req.body?.supplierId
    const { reason } = req.body || {}

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }
    if (supplierId && order.supplier_id && order.supplier_id !== supplierId) {
      return res.status(403).json({ error: 'You are not authorized to reject this order.' })
    }

    db.prepare("UPDATE orders SET status = 'rejected' WHERE id = ?").run(id)
    return res.json({
      success: true,
      message: 'Order rejected.',
      status: 'rejected',
      reason: reason || 'Capacity reached',
    })
  } catch (err) {
    console.error('Reject order error:', err)
    return res.status(500).json({ error: 'Failed to reject order.' })
  }
}

export function resetOrderToPending(req, res) {
  try {
    const { id } = req.params
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    db.prepare("UPDATE orders SET status = 'placed', tracking_stage = 0 WHERE id = ?").run(id)
    return res.json({
      success: true,
      message: 'Order reset to pending review.',
      status: 'placed',
      trackingStage: 0,
    })
  } catch (err) {
    console.error('Reset order error:', err)
    return res.status(500).json({ error: 'Failed to reset order.' })
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
