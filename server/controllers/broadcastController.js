import db from '../db/database.js'

function genId(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export function addBroadcast(req, res) {
  try {
    const { category, specification, quantity, unit, location, deadline, notes } = req.body
    const artisanId = req.user.id

    if (!category || !specification || !quantity || !unit || !location || !deadline) {
      return res.status(400).json({ error: 'Missing required broadcast fields: category, specification, quantity, unit, location, deadline.' })
    }

    const id = genId('B')

    db.prepare(`
      INSERT INTO broadcasts (id, artisan_id, category, specification, quantity, unit, location, deadline, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(id, artisanId, category, specification.trim(), Number(quantity), unit, location.trim(), deadline, notes || null)

    const artisan = db.prepare('SELECT name, store_location FROM users WHERE id = ?').get(artisanId)

    return res.status(201).json({
      broadcast: {
        id,
        artisanId,
        artisanName: artisan ? artisan.name : 'Artisan',
        category,
        specification: specification.trim(),
        quantity: Number(quantity),
        unit,
        location: location.trim(),
        deadline,
        notes: notes || null,
        status: 'open',
      },
    })
  } catch (err) {
    console.error('Add broadcast error:', err)
    return res.status(500).json({ error: 'Failed to post broadcast.' })
  }
}
