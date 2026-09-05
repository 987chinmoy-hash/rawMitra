import db from '../db/database.js'

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

export function addRequests(req, res) {
  try {
    const { requests } = req.body
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: 'No material requests provided.' })
    }

    const artisanId = req.user.id
    const insertStmt = db.prepare(`
      INSERT INTO material_requests (id, artisan_id, category, specification, quantity, unit, location, required_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `)

    const newReqs = []
    db.exec('BEGIN TRANSACTION;')
    try {
      for (const r of requests) {
        if (!r.specification || !r.quantity || !r.location || !r.requiredDate) continue
        const id = genId('R')
        insertStmt.run(id, artisanId, r.category, r.specification.trim(), Number(r.quantity), r.unit || 'kg', r.location.trim(), r.requiredDate)
        newReqs.push({
          id,
          artisanId,
          category: r.category,
          specification: r.specification.trim(),
          quantity: Number(r.quantity),
          unit: r.unit || 'kg',
          location: r.location.trim(),
          requiredDate: r.requiredDate,
          status: 'open',
        })
      }
      db.exec('COMMIT;')
    } catch (err) {
      db.exec('ROLLBACK;')
      throw err
    }

    return res.status(201).json({ requests: newReqs })
  } catch (err) {
    console.error('Add requests error:', err)
    return res.status(500).json({ error: 'Failed to save material requests.' })
  }
}

export function withdrawRequest(req, res) {
  try {
    const { id } = req.params
    const request = db.prepare('SELECT * FROM material_requests WHERE id = ?').get(id)

    if (!request) {
      return res.status(404).json({ error: 'Material request not found.' })
    }

    // Ownership check: only creator can withdraw unless privileged
    if (req.user && req.user.role === 'artisan' && req.user.id !== request.artisan_id) {
      return res.status(403).json({ error: 'Forbidden: You can only withdraw your own requests.' })
    }

    // Fraud check: Cannot withdraw if already part of a confirmed order
    const isLockedInOrder = db.prepare(`
      SELECT o.id FROM orders o
      JOIN order_splits os ON os.order_id = o.id
      WHERE os.artisan_id = ? AND o.category = ? AND o.status != 'cancelled'
    `).get(request.artisan_id, request.category)

    if (isLockedInOrder) {
      return res.status(400).json({
        error: 'Fraud Rule: Participant cannot withdraw after an order is confirmed. Must follow cancellation penalty protocol.',
        code: 'ORDER_ALREADY_CONFIRMED',
      })
    }

    db.prepare('DELETE FROM material_requests WHERE id = ?').run(id)

    return res.json({
      success: true,
      message: 'Participant withdrawn before confirmation. Remaining quantities and cost shares recalculated.',
      withdrawnRequestId: id,
    })
  } catch (err) {
    console.error('Withdraw request error:', err)
    return res.status(500).json({ error: 'Failed to withdraw material request.' })
  }
}

export function addSupplierStock(req, res) {
  try {
    const { materials, logistics, transportCharge, validityDate } = req.body
    const supplierId = req.user.id

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Materials list is required.' })
    }

    const insertStmt = db.prepare(`
      INSERT INTO supplier_materials (id, supplier_id, category, specification, unit, price_per_unit, min_bulk_qty, transport_charge, validity_date, logistics)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    db.exec('BEGIN TRANSACTION;')
    try {
      db.prepare('DELETE FROM supplier_materials WHERE supplier_id = ?').run(supplierId)
      for (const m of materials) {
        insertStmt.run(
          genId('SM'),
          supplierId,
          m.category,
          m.specification,
          m.unit,
          Number(m.pricePerUnit),
          Number(m.minBulkQty) || 1,
          Number(transportCharge) || 500,
          validityDate || '2026-09-30',
          logistics || 'shipment'
        )
      }
      db.exec('COMMIT;')
    } catch (err) {
      db.exec('ROLLBACK;')
      throw err
    }

    return res.json({ success: true, message: 'Supplier stock and quotation terms published.' })
  } catch (err) {
    console.error('Add supplier stock error:', err)
    return res.status(500).json({ error: 'Failed to save supplier stock.' })
  }
}

export function getMyStock(req, res) {
  try {
    const supplierId = req.user.id
    const materials = db.prepare('SELECT * FROM supplier_materials WHERE supplier_id = ?').all(supplierId)
    const mapped = materials.map((m) => ({
      id: m.id,
      category: m.category,
      specification: m.specification,
      unit: m.unit,
      pricePerUnit: m.price_per_unit,
      minBulkQty: m.min_bulk_qty,
      transportCharge: m.transport_charge,
      validity: m.validity_date,
      logistics: m.logistics,
    }))
    return res.json({ materials: mapped })
  } catch (err) {
    console.error('Get my stock error:', err)
    return res.status(500).json({ error: 'Failed to retrieve supplier stock.' })
  }
}
