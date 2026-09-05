// Simple demo matching logic and intelligent compatible artisan clustering.
// Groups open material requests by: same category, closely matching
// specification text, and geographic proximity across Assam craft clusters.

function normalize(str = '') {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Estimates road distance (in km) between Assam craft centers and clusters
export function getDistanceKm(locationA = '', locationB = '') {
  const normA = normalize(locationA).split(',')[0].trim()
  const normB = normalize(locationB).split(',')[0].trim()

  if (normA === normB && normA.length > 0) return 2.5 // Same town/cluster

  const distanceMatrix = {
    'sualkuchi-hajo': 14,
    'hajo-sualkuchi': 14,
    'sualkuchi-guwahati': 32,
    'guwahati-sualkuchi': 32,
    'hajo-guwahati': 28,
    'guwahati-hajo': 28,
    'sualkuchi-sarthebari': 48,
    'sarthebari-sualkuchi': 48,
    'hajo-sarthebari': 42,
    'sarthebari-hajo': 42,
    'guwahati-sarthebari': 72,
    'sarthebari-guwahati': 72,
    'sualkuchi-barpeta': 85,
    'barpeta-sualkuchi': 85,
    'guwahati-barpeta': 95,
    'barpeta-guwahati': 95,
  }

  const key = `${normA}-${normB}`
  return distanceMatrix[key] || 25
}

// Treat two locations as "nearby" if they share a town/city name or distance <= 35km
export function isNearby(locationA, locationB) {
  const dist = getDistanceKm(locationA, locationB)
  return dist <= 35
}

export function specsMatch(specA = '', specB = '') {
  const a = normalize(specA)
  const b = normalize(specB)
  if (!a || !b) return true
  if (a === b || a.includes(b) || b.includes(a)) return true
  // loose match: share most significant words (> 3 chars)
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 3))
  const wordsB = b.split(' ').filter((w) => w.length > 3)
  const shared = wordsB.filter((w) => wordsA.has(w))
  return shared.length >= Math.min(1, wordsB.length)
}

// Configuration mapping for all craft categories: specifications, realistic pricing, peers, and suppliers
export const CATEGORY_CONFIG = {
  Bamboo: {
    defaultSpec: 'Treated Bhaluka bamboo poles, 10ft',
    defaultUnit: 'piece',
    defaultQty: 25,
    basePrice: 110,
    peers: [
      { id: 'A-1004', name: 'Tarun Rabha', location: 'Guwahati, Assam', rating: 4.8, defaultQty: 25, spec: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece' },
      { id: 'A-1003', name: 'Bipul Kalita', location: 'Hajo, Assam', rating: 4.7, defaultQty: 20, spec: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece' },
      { id: 'A-1008', name: 'Nagen Das', location: 'Barpeta, Assam', rating: 4.8, defaultQty: 30, spec: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece' },
      { id: 'A-1009', name: 'Debajit Bora', location: 'Guwahati, Assam', rating: 4.7, defaultQty: 15, spec: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece' },
    ],
    suppliers: [
      { id: 'S-2004-LOC', name: 'Barpeta Cane & Bamboo Depot', storeLocation: 'Barpeta, Assam', rating: 4.6, reviews: 28, pricePerUnit: 115, transportCharge: 500, validity: '2026-09-28', logistics: 'pickup', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', minBulkQty: 20 },
      { id: 'S-2004', name: 'Assam Bamboo & Cane Syndicate', storeLocation: 'Guwahati, Assam', rating: 4.8, reviews: 52, pricePerUnit: 98, transportCharge: 750, validity: '2026-09-30', logistics: 'shipment', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', minBulkQty: 40 },
      { id: 'S-2004-EXP', name: 'Green Gold Bamboo Producer Co.', storeLocation: 'Guwahati, Assam', rating: 4.9, reviews: 39, pricePerUnit: 108, transportCharge: 600, validity: '2026-09-29', logistics: 'shipment', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', minBulkQty: 25 },
    ],
  },
  Clay: {
    defaultSpec: 'Terracotta potting clay, fine grade',
    defaultUnit: 'kg',
    defaultQty: 50,
    basePrice: 22,
    peers: [
      { id: 'A-1007', name: 'Jadav Das', location: 'Hajo, Assam', rating: 4.9, defaultQty: 60, spec: 'Terracotta potting clay, fine grade', unit: 'kg' },
      { id: 'A-1010', name: 'Karuna Paul', location: 'Hajo, Assam', rating: 4.8, defaultQty: 45, spec: 'Terracotta potting clay, fine grade', unit: 'kg' },
      { id: 'A-1011', name: 'Bhaben Paul', location: 'Hajo, Assam', rating: 4.7, defaultQty: 40, spec: 'Terracotta potting clay, fine grade', unit: 'kg' },
      { id: 'A-1012', name: 'Naren Nath', location: 'Guwahati, Assam', rating: 4.8, defaultQty: 55, spec: 'Terracotta potting clay, fine grade', unit: 'kg' },
    ],
    suppliers: [
      { id: 'S-2003', name: 'Hajo Clay & Craft Depot', storeLocation: 'Hajo, Assam', rating: 4.8, reviews: 41, pricePerUnit: 23, transportCharge: 400, validity: '2026-09-28', logistics: 'pickup', specification: 'Terracotta potting clay, fine grade', unit: 'kg', minBulkQty: 50 },
      { id: 'S-2003-WHL', name: 'Brahmaputra Ceramic & Pottery Syndicate', storeLocation: 'Guwahati, Assam', rating: 4.7, reviews: 35, pricePerUnit: 19, transportCharge: 550, validity: '2026-09-30', logistics: 'shipment', specification: 'Terracotta potting clay, fine grade', unit: 'kg', minBulkQty: 100 },
      { id: 'S-2003-EXP', name: 'Pragjyotish Terracotta Guild', storeLocation: 'Hajo, Assam', rating: 4.9, reviews: 48, pricePerUnit: 22, transportCharge: 450, validity: '2026-09-29', logistics: 'shipment', specification: 'Terracotta potting clay, fine grade', unit: 'kg', minBulkQty: 60 },
    ],
  },
  Yarn: {
    defaultSpec: 'Muga silk yarn, 20/22 denier',
    defaultUnit: 'kg',
    defaultQty: 10,
    basePrice: 3100,
    peers: [
      { id: 'A-1002', name: 'Rukmini Das', location: 'Sualkuchi, Assam', rating: 4.6, defaultQty: 8, spec: 'Muga silk yarn, 20/22 denier', unit: 'kg' },
      { id: 'A-1006', name: 'Pranita Saikia', location: 'Sualkuchi, Assam', rating: 4.8, defaultQty: 12, spec: 'Muga silk yarn, 20/22 denier', unit: 'kg' },
      { id: 'A-1013', name: 'Mridula Baishya', location: 'Sualkuchi, Assam', rating: 4.7, defaultQty: 10, spec: 'Muga silk yarn, 20/22 denier', unit: 'kg' },
      { id: 'A-1014', name: 'Deepali Kalita', location: 'Hajo, Assam', rating: 4.8, defaultQty: 9, spec: 'Muga silk yarn, 20/22 denier', unit: 'kg' },
    ],
    suppliers: [
      { id: 'S-2002', name: 'Kamrup Textile Supplies', storeLocation: 'Sualkuchi, Assam', rating: 4.5, reviews: 19, pricePerUnit: 2950, transportCharge: 350, validity: '2026-09-28', logistics: 'pickup', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', minBulkQty: 15 },
      { id: 'S-2001', name: 'Brahmaputra Yarn Co.', storeLocation: 'Guwahati, Assam', rating: 4.7, reviews: 34, pricePerUnit: 2800, transportCharge: 600, validity: '2026-09-30', logistics: 'shipment', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', minBulkQty: 20 },
      { id: 'S-2001-EXP', name: 'Assam Apex Weavers Silk Guild', storeLocation: 'Guwahati, Assam', rating: 4.9, reviews: 45, pricePerUnit: 3050, transportCharge: 500, validity: '2026-09-29', logistics: 'shipment', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', minBulkQty: 15 },
    ],
  },
  Dyes: {
    defaultSpec: 'Natural indigo dye powder',
    defaultUnit: 'kg',
    defaultQty: 5,
    basePrice: 800,
    peers: [
      { id: 'A-1015', name: 'Anita Deka', location: 'Guwahati, Assam', rating: 4.8, defaultQty: 4, spec: 'Natural indigo dye powder', unit: 'kg' },
      { id: 'A-1016', name: 'Hemaprabha Das', location: 'Sualkuchi, Assam', rating: 4.7, defaultQty: 5, spec: 'Natural indigo dye powder', unit: 'kg' },
      { id: 'A-1017', name: 'Bipul Das', location: 'Hajo, Assam', rating: 4.8, defaultQty: 6, spec: 'Natural indigo dye powder', unit: 'kg' },
      { id: 'A-1018', name: 'Minati Saikia', location: 'Guwahati, Assam', rating: 4.7, defaultQty: 5, spec: 'Natural indigo dye powder', unit: 'kg' },
    ],
    suppliers: [
      { id: 'S-2002-DYE', name: 'Kamrup Textile Supplies', storeLocation: 'Sualkuchi, Assam', rating: 4.5, reviews: 19, pricePerUnit: 850, transportCharge: 300, validity: '2026-09-28', logistics: 'pickup', specification: 'Natural indigo dye powder', unit: 'kg', minBulkQty: 5 },
      { id: 'S-2006-WHL', name: 'Assam Herbal & Natural Colors Syndicate', storeLocation: 'Guwahati, Assam', rating: 4.8, reviews: 29, pricePerUnit: 720, transportCharge: 450, validity: '2026-09-30', logistics: 'shipment', specification: 'Natural indigo dye powder', unit: 'kg', minBulkQty: 8 },
      { id: 'S-2006-EXP', name: 'Brahmaputra Organic Indigo Guild', storeLocation: 'Guwahati, Assam', rating: 4.9, reviews: 33, pricePerUnit: 790, transportCharge: 400, validity: '2026-09-29', logistics: 'shipment', specification: 'Natural indigo dye powder', unit: 'kg', minBulkQty: 6 },
    ],
  },
  Metal: {
    defaultSpec: 'High-purity Bell metal alloy ingots (Kanh)',
    defaultUnit: 'kg',
    defaultQty: 20,
    basePrice: 780,
    peers: [
      { id: 'A-1005', name: 'Hemen Medhi', location: 'Sarthebari, Assam', rating: 4.9, defaultQty: 20, spec: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg' },
      { id: 'A-1019', name: 'Bhupen Tamuly', location: 'Sarthebari, Assam', rating: 4.8, defaultQty: 25, spec: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg' },
      { id: 'A-1020', name: 'Khagen Karmakar', location: 'Sarthebari, Assam', rating: 4.7, defaultQty: 18, spec: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg' },
      { id: 'A-1021', name: 'Naren Baishya', location: 'Barpeta, Assam', rating: 4.8, defaultQty: 22, spec: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg' },
    ],
    suppliers: [
      { id: 'S-2005', name: 'Sarthebari Bell Metal Works Co-op', storeLocation: 'Sarthebari, Assam', rating: 4.9, reviews: 38, pricePerUnit: 780, transportCharge: 650, validity: '2026-09-30', logistics: 'shipment', specification: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg', minBulkQty: 25 },
      { id: 'S-2005-WHL', name: 'Assam Brass & Bell Metal Federation', storeLocation: 'Guwahati, Assam', rating: 4.7, reviews: 42, pricePerUnit: 710, transportCharge: 700, validity: '2026-09-28', logistics: 'shipment', specification: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg', minBulkQty: 30 },
      { id: 'S-2005-EXP', name: 'Heritage Kanh Artisans Emporium', storeLocation: 'Sarthebari, Assam', rating: 4.9, reviews: 31, pricePerUnit: 760, transportCharge: 550, validity: '2026-09-29', logistics: 'shipment', specification: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg', minBulkQty: 20 },
    ],
  },
  'Packaging materials': {
    defaultSpec: 'Corrugated boxes, medium',
    defaultUnit: 'piece',
    defaultQty: 50,
    basePrice: 14,
    peers: [
      { id: 'A-1022', name: 'Moni Kakati', location: 'Guwahati, Assam', rating: 4.8, defaultQty: 45, spec: 'Corrugated boxes, medium', unit: 'piece' },
      { id: 'A-1023', name: 'Diganta Saikia', location: 'Hajo, Assam', rating: 4.7, defaultQty: 50, spec: 'Corrugated boxes, medium', unit: 'piece' },
      { id: 'A-1024', name: 'Ramen Baruah', location: 'Sualkuchi, Assam', rating: 4.8, defaultQty: 60, spec: 'Corrugated boxes, medium', unit: 'piece' },
      { id: 'A-1025', name: 'Bhaben Kalita', location: 'Guwahati, Assam', rating: 4.7, defaultQty: 40, spec: 'Corrugated boxes, medium', unit: 'piece' },
    ],
    suppliers: [
      { id: 'S-2003-PKG', name: 'Hajo Clay & Craft Depot', storeLocation: 'Hajo, Assam', rating: 4.8, reviews: 41, pricePerUnit: 14, transportCharge: 400, validity: '2026-09-28', logistics: 'shipment', specification: 'Corrugated boxes, medium', unit: 'piece', minBulkQty: 50 },
      { id: 'S-2007-WHL', name: 'Pragjyotish Box & Pack Syndicate', storeLocation: 'Guwahati, Assam', rating: 4.7, reviews: 36, pricePerUnit: 11, transportCharge: 450, validity: '2026-09-30', logistics: 'shipment', specification: 'Corrugated boxes, medium', unit: 'piece', minBulkQty: 80 },
      { id: 'S-2007-EXP', name: 'EcoCraft Packaging Express Hub', storeLocation: 'Guwahati, Assam', rating: 4.9, reviews: 44, pricePerUnit: 13, transportCharge: 350, validity: '2026-09-29', logistics: 'shipment', specification: 'Corrugated boxes, medium', unit: 'piece', minBulkQty: 40 },
    ],
  },
}

function getCategoryConfig(category = 'Yarn') {
  const match = Object.keys(CATEGORY_CONFIG).find(
    (k) => normalize(k) === normalize(category)
  )
  return match ? CATEGORY_CONFIG[match] : CATEGORY_CONFIG.Yarn
}

// Analyzes the entire database to discover compatible artisans for a given material request
export function analyzeCompatibleArtisans(myRequest, allRequests = [], allArtisans = []) {
  if (!myRequest) return null

  const myCat = myRequest.category || 'Yarn'
  const config = getCategoryConfig(myCat)
  const mySpec = myRequest.specification || config.defaultSpec
  const myLoc = myRequest.location || 'Sualkuchi, Assam'
  const myArtisanId = myRequest.artisanId || ''
  const myUnit = myRequest.unit || config.defaultUnit

  // 1. Search for other active requests in database strictly matching this category
  const matchingRequests = allRequests.filter((r) => {
    if (r.id === myRequest.id) return false
    if (r.artisanId === myArtisanId && myArtisanId) return false
    if (r.status && r.status !== 'open') return false
    const catMatch = normalize(r.category) === normalize(myCat)
    return catMatch
  })

  // 2. Map into compatible peers with distance and score
  let peers = matchingRequests.map((req) => {
    const artisan = allArtisans.find((a) => a.id === req.artisanId) || {
      id: req.artisanId,
      name: 'Fellow Artisan',
      storeLocation: req.location || myLoc,
      rating: 4.7,
    }
    const distanceKm = getDistanceKm(myLoc, req.location || artisan.storeLocation)
    const proximityTier =
      distanceKm <= 10
        ? 'Local Cluster'
        : distanceKm <= 35
        ? 'District Corridor'
        : 'Regional Hub'

    const distFactor = Math.max(0.6, 1 - distanceKm / 150)
    const compatibilityScore = Math.min(99, Math.round(92 * distFactor + 8))

    return {
      requestId: req.id,
      artisanId: artisan.id,
      artisanName: artisan.name,
      location: req.location || artisan.storeLocation,
      distanceKm,
      proximityTier,
      compatibilityScore,
      specification: req.specification || mySpec,
      quantity: Number(req.quantity) || config.defaultQty,
      unit: req.unit || myUnit,
      rating: artisan.rating || 4.7,
    }
  })

  // 3. Category-specific synthesis to ensure at least 3-4 compatible peers strictly in the same craft discipline
  if (peers.length < 3) {
    const fallbackPeers = config.peers.map((p, idx) => ({
      requestId: `R-PEER-${normalize(myCat).slice(0, 3).toUpperCase()}-${idx + 1}`,
      artisanId: p.id,
      artisanName: p.name,
      location: p.location,
      quantity: Math.max(5, Math.round((Number(myRequest.quantity) || config.defaultQty) * (0.8 + idx * 0.25))),
      specification: mySpec,
      unit: myUnit,
      rating: p.rating,
    }))

    fallbackPeers.forEach((fb) => {
      if (peers.length < 4 && !peers.some((p) => p.artisanName === fb.artisanName || p.artisanId === fb.artisanId)) {
        const distanceKm = getDistanceKm(myLoc, fb.location)
        const proximityTier =
          distanceKm <= 10
            ? 'Local Cluster'
            : distanceKm <= 35
            ? 'District Corridor'
            : 'Regional Hub'
        const compatibilityScore = Math.min(99, Math.round(95 - distanceKm * 0.35))
        peers.push({
          ...fb,
          distanceKm,
          proximityTier,
          compatibilityScore,
        })
      }
    })
  }

  peers.sort((a, b) => a.distanceKm - b.distanceKm)

  const localCount = peers.filter((p) => p.distanceKm <= 15).length
  const districtCount = peers.filter((p) => p.distanceKm > 15).length
  const totalVolume = peers.reduce((sum, p) => sum + p.quantity, 0) + (Number(myRequest.quantity) || config.defaultQty)

  return {
    targetCategory: myCat,
    targetSpec: mySpec,
    myQuantity: Number(myRequest.quantity) || config.defaultQty,
    unit: myUnit,
    location: myLoc,
    compatiblePeers: peers,
    stats: {
      totalPeersFound: peers.length,
      totalAvailableVolume: totalVolume,
      localClusterCount: localCount,
      districtCount,
      avgCompatibilityScore: Math.round(
        peers.reduce((s, p) => s + p.compatibilityScore, 0) / (peers.length || 1)
      ),
    },
  }
}

// Generates 2 to 3 curated procurement choices strictly tailored for the requested material
export function generateProcurementChoices(myRequest, analysis, suppliers = [], currentArtisan = {}) {
  if (!myRequest || !analysis) return []

  const myCat = myRequest.category || 'Yarn'
  const config = getCategoryConfig(myCat)
  const myQty = Number(myRequest.quantity) || config.defaultQty
  const myLoc = myRequest.location || 'Sualkuchi, Assam'
  const mySpec = myRequest.specification || config.defaultSpec
  const myUnit = myRequest.unit || config.defaultUnit
  const peers = analysis.compatiblePeers || []

  // 1. Strictly find suppliers that offer materials for THIS category only.
  // NEVER fall back to suppliers of a different category (e.g. NEVER show clay for bamboo).
  const offers = []

  // Check state suppliers first
  suppliers.forEach((s) => {
    const matchingMaterials = (s.materials || []).filter(
      (m) => normalize(m.category) === normalize(myCat)
    )

    matchingMaterials.forEach((mat) => {
      const dist = getDistanceKm(myLoc, s.storeLocation)
      offers.push({
        supplierId: s.id,
        supplierName: s.name,
        supplierLocation: s.storeLocation,
        supplierRating: s.rating || 4.7,
        supplierReviews: s.reviews || 25,
        logistics: mat.logistics || s.logistics || 'shipment',
        specification: mat.specification || mySpec,
        unit: mat.unit || myUnit,
        pricePerUnit: Number(mat.pricePerUnit) || config.basePrice,
        minBulkQty: Number(mat.minBulkQty) || 15,
        transportCharge: Number(mat.transportCharge ?? s.transportCharge ?? 500),
        validity: mat.validity || s.validity || '2026-09-30',
        distanceKm: dist,
      })
    })
  })

  // If fewer than 3 category-specific offers, supplement with verified category suppliers from config
  if (offers.length < 3) {
    config.suppliers.forEach((cs) => {
      if (!offers.some((o) => o.supplierName === cs.name)) {
        const dist = getDistanceKm(myLoc, cs.storeLocation)
        offers.push({
          supplierId: cs.id,
          supplierName: cs.name,
          supplierLocation: cs.storeLocation,
          supplierRating: cs.rating,
          supplierReviews: cs.reviews,
          logistics: cs.logistics,
          specification: mySpec || cs.specification,
          unit: myUnit,
          pricePerUnit: cs.pricePerUnit,
          minBulkQty: cs.minBulkQty,
          transportCharge: cs.transportCharge,
          validity: cs.validity,
          distanceKm: dist,
        })
      }
    })
  }

  // Sort offers by specialized criteria strictly within THIS category
  const localSupplier =
    [...offers].sort((a, b) => a.distanceKm - b.distanceKm)[0] || offers[0]
  const wholesaleSupplier =
    [...offers].sort((a, b) => a.pricePerUnit - b.pricePerUnit)[0] || offers[0]
  const topRatedSupplier =
    [...offers].sort((a, b) => b.supplierRating - a.supplierRating)[0] || offers[0]

  const myArtisanEntry = {
    artisanId: currentArtisan?.id || 'A-1001',
    artisanName: currentArtisan?.name || 'You',
    location: myLoc,
    quantity: myQty,
    distanceKm: 0,
    isMe: true,
  }

  function calculateChoiceMetrics({
    id,
    strategyKey,
    title,
    subtitle,
    badge,
    badgeColor,
    eta,
    supplier,
    selectedPeers,
    discountMarkup = 1.0,
  }) {
    const pool = [myArtisanEntry, ...selectedPeers.map((p) => ({ ...p, isMe: false }))]
    const totalPooledQuantity = pool.reduce((sum, p) => sum + p.quantity, 0)
    const unitPrice = Math.round(supplier.pricePerUnit * discountMarkup)
    const transportTotal = supplier.transportCharge || 500
    const materialTotal = totalPooledQuantity * unitPrice
    const grandTotal = materialTotal + transportTotal

    // Fair Cost allocation
    const perArtisan = pool.map((member) => {
      const share = totalPooledQuantity > 0 ? member.quantity / totalPooledQuantity : 1
      const matCost = Math.round(member.quantity * unitPrice)
      const transShare = Math.round(share * transportTotal)
      return {
        artisanId: member.artisanId,
        name: member.artisanName,
        location: member.location,
        quantity: member.quantity,
        distanceKm: member.distanceKm,
        isMe: member.isMe,
        share,
        materialCost: matCost,
        transportShare: transShare,
        totalCost: matCost + transShare,
      }
    })

    const myShare = perArtisan.find((p) => p.isMe) || perArtisan[0]

    // Solo price comparison
    const retailPricePerUnit = Math.round(unitPrice * 1.25)
    const soloTransport = Math.round(transportTotal * 0.85) || 350
    const soloMaterialCost = myQty * retailPricePerUnit
    const soloTotal = soloMaterialCost + soloTransport
    const savings = Math.max(0, soloTotal - myShare.totalCost)
    const savingsPct = soloTotal > 0 ? Math.round((savings / soloTotal) * 100) : 0

    return {
      id,
      strategyKey,
      title,
      subtitle,
      badge,
      badgeColor,
      deliveryEta: eta,
      supplier,
      totalPooledQuantity,
      unitPrice,
      retailPricePerUnit,
      transportTotal,
      materialTotal,
      grandTotal,
      myShare,
      perArtisan,
      soloComparison: {
        retailPricePerUnit,
        soloTransport,
        soloTotal,
        savings,
        savingsPct,
      },
    }
  }

  // Choice 1: Local Proximity Cluster (1-2 Days Delivery)
  const localPeers = peers.slice(0, 2)
  const choice1 = calculateChoiceMetrics({
    id: 'choice-local-cluster',
    strategyKey: 'local_cluster',
    title: 'Local Proximity Cluster',
    subtitle: 'Hyper-Local Artisans · Quickest Dispatch',
    badge: '⚡ Fastest Delivery (1-2 Days)',
    badgeColor: '#16a34a',
    eta: '1 – 2 Days',
    supplier: localSupplier,
    selectedPeers: localPeers,
    discountMarkup: 1.0,
  })

  // Choice 2: District Mega-Bulk Tier (Maximum Cost Savings)
  const megaPeers = peers.slice(0, 3)
  const choice2 = calculateChoiceMetrics({
    id: 'choice-mega-bulk',
    strategyKey: 'mega_bulk',
    title: 'District Mega-Bulk Tier',
    subtitle: 'Deepest Wholesale Discount · Lowest Unit Rate',
    badge: '💎 Maximum Savings (30%–36%)',
    badgeColor: 'var(--brass, #c08a28)',
    eta: '3 – 4 Days',
    supplier: wholesaleSupplier,
    selectedPeers: megaPeers,
    discountMarkup: 0.94, // 6% bulk syndicate discount
  })

  // Choice 3: Verified Express & Top Rating Pool (Top Quality & Direct Courier)
  const premiumPeers = [...peers].sort((a, b) => b.rating - a.rating).slice(0, 2)
  const choice3 = calculateChoiceMetrics({
    id: 'choice-premium-pool',
    strategyKey: 'premium_pool',
    title: 'Verified Express & Top Rating Pool',
    subtitle: '4.8★+ Verified Artisans · Direct Carrier Tracking',
    badge: '⭐ Top Quality & Direct Delivery',
    badgeColor: '#7c3aed',
    eta: '2 – 3 Days',
    supplier: topRatedSupplier,
    selectedPeers: premiumPeers,
    discountMarkup: 0.98,
  })

  return [choice1, choice2, choice3]
}

// Legacy helpers maintained for backward compatibility
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
    if (a.meetsMinimum !== b.meetsMinimum) return a.meetsMinimum ? -1 : 1
    if (a.nearby !== b.nearby) return a.nearby ? -1 : 1
    if (a.pricePerUnit !== b.pricePerUnit) return a.pricePerUnit - b.pricePerUnit
    return b.supplierRating - a.supplierRating
  })
}

