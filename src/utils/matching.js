// Simple demo matching logic.
// Groups open material requests by: same category, closely matching
// specification text, and same "nearby" location.
// This is a placeholder for a real geo + fuzzy-text matching service —
// swap normalizeLocation()/specsMatch() out once the matching API exists.

function normalize(str = '') {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Treat two locations as "nearby" if they share a town/city name
// (the part before the comma). Good enough for a demo; a real version
// would use geocoded distance.
export function isNearby(locationA, locationB) {
  const a = normalize(locationA).split(',')[0]
  const b = normalize(locationB).split(',')[0]
  return a === b
}

export function specsMatch(specA, specB) {
  const a = normalize(specA)
  const b = normalize(specB)
  if (a === b) return true
  // loose match: share most significant words
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 3))
  const wordsB = b.split(' ').filter((w) => w.length > 3)
  const shared = wordsB.filter((w) => wordsA.has(w))
  return shared.length >= Math.min(2, wordsB.length)
}

// Groups an array of material requests into clusters of
// { category, specification, unit, location, requests: [...], totalQuantity }
export function groupRequests(requests) {
  const open = requests.filter((r) => r.status === 'open')
  const groups = []

  open.forEach((req) => {
    const existing = groups.find(
      (g) =>
        g.category === req.category &&
        g.unit === req.unit &&
        specsMatch(g.specification, req.specification) &&
        isNearby(g.location, req.location)
    )
    if (existing) {
      existing.requests.push(req)
      existing.totalQuantity += Number(req.quantity)
    } else {
      groups.push({
        id: `G-${req.category.slice(0, 2).toUpperCase()}-${req.location.split(',')[0].slice(0, 3).toUpperCase()}-${groups.length + 1}`,
        category: req.category,
        specification: req.specification,
        unit: req.unit,
        location: req.location,
        requests: [req],
        totalQuantity: Number(req.quantity),
      })
    }
  })

  return groups
}

// Finds suppliers who carry a matching material, sorted by a blended
// score of price (lower better), rating (higher better) and whether
// the supplier is nearby.
export function findSupplierOffers(group, suppliers) {
  const offers = []
  suppliers.forEach((s) => {
    s.materials.forEach((m) => {
      if (m.category === group.category && specsMatch(m.specification, group.specification)) {
        offers.push({
          supplierId: s.id,
          supplierName: s.name,
          supplierRating: s.rating,
          supplierReviews: s.reviews,
          logistics: s.logistics,
          location: s.storeLocation,
          nearby: isNearby(s.storeLocation, group.location),
          specification: m.specification,
          unit: m.unit,
          pricePerUnit: m.pricePerUnit,
          minBulkQty: m.minBulkQty,
          transportCharge: m.transportCharge ?? s.transportCharge ?? 500,
          validity: m.validity ?? s.validity ?? '2026-09-25',
          meetsMinimum: group.totalQuantity >= m.minBulkQty,
        })
      }
    })
  })

  return offers.sort((a, b) => {
    // meets bulk minimum first, then nearby, then price, then rating
    if (a.meetsMinimum !== b.meetsMinimum) return a.meetsMinimum ? -1 : 1
    if (a.nearby !== b.nearby) return a.nearby ? -1 : 1
    if (a.pricePerUnit !== b.pricePerUnit) return a.pricePerUnit - b.pricePerUnit
    return b.supplierRating - a.supplierRating
  })
}
