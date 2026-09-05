import db from '../db/database.js'

const SEARCH_SYNONYMS = {
  'বাঁহ': ['bamboo', 'bhaluka'],
  'বাৰ': ['bamboo'],
  'बांस': ['bamboo'],
  'bamboo': ['বাঁহ', 'বাৰ', 'बांस'],
  'সূতা': ['yarn', 'silk', 'muga'],
  'মুগা': ['muga', 'silk', 'yarn'],
  'धागा': ['yarn', 'thread'],
  'yarn': ['সূতা', 'धागा'],
  'মাটি': ['clay', 'terracotta'],
  'मिट्टी': ['clay'],
  'clay': ['মাটি', 'मिट्टी'],
  'ৰং': ['dyes', 'indigo'],
  'रंग': ['dyes'],
  'dyes': ['ৰং', 'रंग'],
  'ধাতু': ['metal'],
  'धातु': ['metal'],
  'metal': ['ধাতু', 'धातु'],
  'পেকেজিং': ['packaging', 'box'],
  'সুৱালকুছি': ['sualkuchi'],
  'গুৱাহাটী': ['guwahati'],
  'হাজো': ['hajo'],
  'অৰ্ডাৰ': ['order'],
  'order': ['অৰ্ডাৰ'],
}

function expandTokens(q = '') {
  const norm = q.toLowerCase().trim()
  if (!norm) return []
  const tokens = norm.split(/\s+/)
  const expanded = new Set([norm, ...tokens])

  for (const t of tokens) {
    for (const [k, syns] of Object.entries(SEARCH_SYNONYMS)) {
      if (t.includes(k.toLowerCase()) || k.toLowerCase().includes(t)) {
        syns.forEach(s => expanded.add(s.toLowerCase()))
      }
    }
  }
  return Array.from(expanded)
}

function matchesAny(tokens, ...fields) {
  const combined = fields.map(f => (f || '').toString().toLowerCase()).join(' ')
  return tokens.some(t => combined.includes(t))
}

export function search(req, res) {
  try {
    const q = req.query.q || ''
    if (!q.trim()) {
      return res.json({ orders: [], suppliers: [], artisans: [], coordinators: [], materials: [] })
    }

    const tokens = expandTokens(q)

    // 1. Match Users
    const allUsers = db.prepare('SELECT id, role, name, phone, aadhar_masked, store_location, experience, rating, reviews_count FROM users').all()
    const artisans = allUsers.filter(u => u.role === 'artisan' && matchesAny(tokens, u.name, u.store_location, u.phone))
    const coordinators = allUsers.filter(u => u.role === 'coordinator' && matchesAny(tokens, u.name, u.experience, u.phone))

    // 2. Match Suppliers and their materials
    const allMaterials = db.prepare('SELECT * FROM supplier_materials').all()
    const suppliers = allUsers.filter(u => u.role === 'supplier').filter(s => {
      const sMats = allMaterials.filter(m => m.supplier_id === s.id)
      const matMatch = sMats.some(m => matchesAny(tokens, m.category, m.specification))
      return matchesAny(tokens, s.name, s.store_location) || matMatch
    }).map(s => {
      const materials = allMaterials.filter(m => m.supplier_id === s.id)
      return { ...s, materials }
    })

    // 3. Match Material Requests
    const allRequests = db.prepare('SELECT * FROM material_requests WHERE status = "open"').all()
    const materials = allRequests.filter(r => matchesAny(tokens, r.category, r.specification, r.location))

    // 4. Match Orders
    const allOrders = db.prepare('SELECT * FROM orders').all()
    const orders = allOrders.filter(o => matchesAny(tokens, o.id, o.category, o.specification, o.status))

    return res.json({ orders, suppliers, artisans, coordinators, materials })
  } catch (err) {
    console.error('Search error:', err)
    return res.status(500).json({ error: 'Search failed.' })
  }
}
