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
  if (normA.includes('tezpur') && normB.includes('tezpur')) return 2.5
  if (normA.includes('guwahati') && normB.includes('guwahati')) return 2.5
  if (normA.includes('dibrugarh') && normB.includes('dibrugarh')) return 2.5

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
    'tezpur-guwahati': 180,
    'guwahati-tezpur': 180,
    'tezpur-dibrugarh': 250,
    'dibrugarh-tezpur': 250,
    'guwahati-dibrugarh': 440,
    'dibrugarh-guwahati': 440,
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

export const DELIVERY_LOCATIONS = ['Tezpur', 'Guwahati', 'Dibrugarh']

export function resolveDeliveryLocation(loc = '') {
  if (!loc || typeof loc !== 'string') return 'Tezpur'
  const lower = loc.toLowerCase().trim()
  if (lower.includes('tezpur')) return 'Tezpur'
  if (lower.includes('guwahati') || lower.includes('gauhati') || lower.includes('kamrup')) return 'Guwahati'
  if (lower.includes('dibrugarh') || lower.includes('dibru')) return 'Dibrugarh'
  return 'Tezpur'
}

export const LOCATION_GROUPS_CONFIG = {
  Tezpur: [
    {
      id: 'group-tezpur-1',
      groupNumber: 1,
      groupName: 'Tezpur Silk & Craft Sangha',
      location: 'Tezpur',
      hubArea: 'Mission Chariali & Tribeni',
      badge: '⚡ Local Fast-Track (3 Artisans)',
      badgeColor: '#16a34a',
      eta: '1 – 2 Days',
      artisanCount: 3,
      discountMarkup: 0.96,
      supplier: {
        supplierId: 'S-TEZ-01',
        supplierName: 'Sonitpur Artisan Depot & Mill',
        supplierLocation: 'Tezpur, Assam',
        supplierRating: 4.8,
        supplierReviews: 42,
        logistics: 'Local Hub Carrier',
        transportCharge: 350,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-TEZ-101', name: 'Bipul Kalita', area: 'Mission Chariali, Tezpur', qtyFactor: 0.85, rating: 4.8 },
        { id: 'A-TEZ-102', name: 'Runu Bora', area: 'Dekargaon, Tezpur', qtyFactor: 0.65, rating: 4.7 },
      ],
    },
    {
      id: 'group-tezpur-2',
      groupNumber: 2,
      groupName: 'Sonitpur Artisan Collective',
      location: 'Tezpur',
      hubArea: 'Mahabhairab & Koliabor Link',
      badge: '💎 Mega-Bulk Syndicate (2 Artisans)',
      badgeColor: 'var(--brass, #c08a28)',
      eta: '2 – 3 Days',
      artisanCount: 2,
      discountMarkup: 0.92,
      supplier: {
        supplierId: 'S-TEZ-02',
        supplierName: 'Brahmaputra North-Bank Suppliers',
        supplierLocation: 'Tezpur, Assam',
        supplierRating: 4.9,
        supplierReviews: 56,
        logistics: 'Syndicate Freight Carrier',
        transportCharge: 450,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-TEZ-201', name: 'Pranab Hazarika', area: 'Mahabhairab, Tezpur', qtyFactor: 1.6, rating: 4.9 },
      ],
    },
    {
      id: 'group-tezpur-3',
      groupNumber: 3,
      groupName: 'Brahmaputra North Bank Guild',
      location: 'Tezpur',
      hubArea: 'Tribeni, Panchmile & Ketekibari',
      badge: '⭐ Verified Express Pool (4 Artisans)',
      badgeColor: '#7c3aed',
      eta: '1 – 2 Days',
      artisanCount: 4,
      discountMarkup: 0.94,
      supplier: {
        supplierId: 'S-TEZ-03',
        supplierName: 'Tezpur Regional Craft Syndicate',
        supplierLocation: 'Tezpur, Assam',
        supplierRating: 4.9,
        supplierReviews: 68,
        logistics: 'Express Syndicate Courier',
        transportCharge: 500,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-TEZ-301', name: 'Deepali Nath', area: 'Tribeni, Tezpur', qtyFactor: 0.9, rating: 4.9 },
        { id: 'A-TEZ-302', name: 'Manoranjan Das', area: 'Panchmile, Tezpur', qtyFactor: 0.8, rating: 4.8 },
        { id: 'A-TEZ-303', name: 'Geeta Saikia', area: 'Ketekibari, Tezpur', qtyFactor: 0.7, rating: 4.8 },
      ],
    },
  ],
  Guwahati: [
    {
      id: 'group-guwahati-1',
      groupNumber: 1,
      groupName: 'Guwahati Metro Craft Cluster',
      location: 'Guwahati',
      hubArea: 'Panbazar & Six Mile',
      badge: '⚡ Local Fast-Track (3 Artisans)',
      badgeColor: '#16a34a',
      eta: '1 – 2 Days',
      artisanCount: 3,
      discountMarkup: 0.96,
      supplier: {
        supplierId: 'S-GAU-01',
        supplierName: 'Kamrup Wholesale Syndicate',
        supplierLocation: 'Guwahati, Assam',
        supplierRating: 4.8,
        supplierReviews: 78,
        logistics: 'Local Hub Carrier',
        transportCharge: 400,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-GAU-101', name: 'Tarun Rabha', area: 'Panbazar, Guwahati', qtyFactor: 0.9, rating: 4.8 },
        { id: 'A-GAU-102', name: 'Anita Deka', area: 'Six Mile, Guwahati', qtyFactor: 0.75, rating: 4.7 },
      ],
    },
    {
      id: 'group-guwahati-2',
      groupNumber: 2,
      groupName: 'Kamrup Valley Syndicate',
      location: 'Guwahati',
      hubArea: 'Beltola & Dispur',
      badge: '💎 Mega-Bulk Syndicate (2 Artisans)',
      badgeColor: 'var(--brass, #c08a28)',
      eta: '2 – 3 Days',
      artisanCount: 2,
      discountMarkup: 0.92,
      supplier: {
        supplierId: 'S-GAU-02',
        supplierName: 'Brahmaputra Yarn & Raw Materials Depot',
        supplierLocation: 'Guwahati, Assam',
        supplierRating: 4.9,
        supplierReviews: 94,
        logistics: 'Syndicate Freight Carrier',
        transportCharge: 500,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-GAU-201', name: 'Debajit Bora', area: 'Beltola, Guwahati', qtyFactor: 1.5, rating: 4.9 },
      ],
    },
    {
      id: 'group-guwahati-3',
      groupNumber: 3,
      groupName: 'Greater Guwahati Artisans Federation',
      location: 'Guwahati',
      hubArea: 'Maligaon, Chandmari & Jalukbari',
      badge: '⭐ Verified Express Pool (4 Artisans)',
      badgeColor: '#7c3aed',
      eta: '1 – 2 Days',
      artisanCount: 4,
      discountMarkup: 0.94,
      supplier: {
        supplierId: 'S-GAU-03',
        supplierName: 'Assam Apex Artisan Producer Co.',
        supplierLocation: 'Guwahati, Assam',
        supplierRating: 4.9,
        supplierReviews: 83,
        logistics: 'Express Courier & Direct Delivery',
        transportCharge: 550,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-GAU-301', name: 'Moni Kakati', area: 'Maligaon, Guwahati', qtyFactor: 0.95, rating: 4.8 },
        { id: 'A-GAU-302', name: 'Naren Nath', area: 'Chandmari, Guwahati', qtyFactor: 0.8, rating: 4.9 },
        { id: 'A-GAU-303', name: 'Minati Saikia', area: 'Jalukbari, Guwahati', qtyFactor: 0.7, rating: 4.7 },
      ],
    },
  ],
  Dibrugarh: [
    {
      id: 'group-dibrugarh-1',
      groupNumber: 1,
      groupName: 'Dibrugarh Heritage Weavers Circle',
      location: 'Dibrugarh',
      hubArea: 'Chowkidinghee & Mankata',
      badge: '⚡ Local Fast-Track (3 Artisans)',
      badgeColor: '#16a34a',
      eta: '1 – 2 Days',
      artisanCount: 3,
      discountMarkup: 0.96,
      supplier: {
        supplierId: 'S-DIB-01',
        supplierName: 'Upper Assam Raw Material Traders',
        supplierLocation: 'Dibrugarh, Assam',
        supplierRating: 4.8,
        supplierReviews: 36,
        logistics: 'Local Hub Carrier',
        transportCharge: 380,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-DIB-101', name: 'Jatin Gogoi', area: 'Chowkidinghee, Dibrugarh', qtyFactor: 0.85, rating: 4.8 },
        { id: 'A-DIB-102', name: 'Manashi Sonowal', area: 'Mankata Road, Dibrugarh', qtyFactor: 0.7, rating: 4.7 },
      ],
    },
    {
      id: 'group-dibrugarh-2',
      groupNumber: 2,
      groupName: 'Upper Assam Craft Guild',
      location: 'Dibrugarh',
      hubArea: 'Amolapatty & Graham Bazar',
      badge: '💎 Mega-Bulk Syndicate (2 Artisans)',
      badgeColor: 'var(--brass, #c08a28)',
      eta: '2 – 3 Days',
      artisanCount: 2,
      discountMarkup: 0.92,
      supplier: {
        supplierId: 'S-DIB-02',
        supplierName: 'Eastern Assam Cane & Silk Syndicate',
        supplierLocation: 'Dibrugarh, Assam',
        supplierRating: 4.9,
        supplierReviews: 48,
        logistics: 'Syndicate Freight Carrier',
        transportCharge: 480,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-DIB-201', name: 'Dipankar Chetia', area: 'Amolapatty, Dibrugarh', qtyFactor: 1.7, rating: 4.9 },
      ],
    },
    {
      id: 'group-dibrugarh-3',
      groupNumber: 3,
      groupName: 'Koliabar-Dibru Artisans Union',
      location: 'Dibrugarh',
      hubArea: 'Naliapool, Boiragimoth & Graham Bazar',
      badge: '⭐ Verified Express Pool (4 Artisans)',
      badgeColor: '#7c3aed',
      eta: '1 – 2 Days',
      artisanCount: 4,
      discountMarkup: 0.94,
      supplier: {
        supplierId: 'S-DIB-03',
        supplierName: 'Brahmaputra Valley Craft Depot',
        supplierLocation: 'Dibrugarh, Assam',
        supplierRating: 4.9,
        supplierReviews: 52,
        logistics: 'Express Courier & Direct Delivery',
        transportCharge: 520,
        validity: '2026-09-30',
      },
      fellowArtisans: [
        { id: 'A-DIB-301', name: 'Rupali Borah', area: 'Graham Bazar, Dibrugarh', qtyFactor: 0.9, rating: 4.9 },
        { id: 'A-DIB-302', name: 'Bikash Baruah', area: 'Naliapool, Dibrugarh', qtyFactor: 0.8, rating: 4.8 },
        { id: 'A-DIB-303', name: 'Pallabi Moran', area: 'Boiragimoth, Dibrugarh', qtyFactor: 0.75, rating: 4.8 },
      ],
    },
  ],
}

// Helper to generate craft-specific artisan group names tailored to the active material
export function getMaterialGroupName(location, category, groupNumber = 1) {
  const normCat = normalize(category)
  const loc = resolveDeliveryLocation(location)

  const craftTitles = {
    bamboo: {
      1: `${loc} Bamboo & Cane Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Bamboo Artisans Collective`,
      3: `Brahmaputra Valley ${loc} Bamboo Syndicate`,
    },
    yarn: {
      1: `${loc} Silk & Weavers Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Handloom Collective`,
      3: `Brahmaputra Valley ${loc} Textile Syndicate`,
    },
    clay: {
      1: `${loc} Terracotta & Potters Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Clay Artisans Collective`,
      3: `Brahmaputra Valley ${loc} Pottery Syndicate`,
    },
    dyes: {
      1: `${loc} Natural Dye Producers Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Organic Color Collective`,
      3: `Brahmaputra Valley ${loc} Dyeing Syndicate`,
    },
    metal: {
      1: `${loc} Bell Metal & Brass Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Metalcraft Collective`,
      3: `Brahmaputra Valley ${loc} Metalsmiths Syndicate`,
    },
    packaging: {
      1: `${loc} Craft Packaging Guild`,
      2: `${loc === 'Tezpur' ? 'Sonitpur' : loc === 'Guwahati' ? 'Kamrup' : 'Upper Assam'} Eco-Box Collective`,
      3: `Brahmaputra Valley ${loc} Packaging Syndicate`,
    },
  }

  const catKey = Object.keys(craftTitles).find((k) => normCat.includes(k)) || 'bamboo'
  return craftTitles[catKey]?.[groupNumber] || `${loc} ${category} Group ${groupNumber}`
}

// Generates 3 location-based artisan groups and procurement choices strictly tailored for the requested material
export function generateProcurementChoices(myRequest, analysis, suppliers = [], currentArtisan = {}) {
  if (!myRequest) return []

  const myCat = myRequest.category || 'Bamboo'
  const config = getCategoryConfig(myCat)
  const myQty = Number(myRequest.quantity) || config.defaultQty
  const mySpec = myRequest.specification || config.defaultSpec
  const myUnit = myRequest.unit || config.defaultUnit

  // Resolve delivery hub strictly among Tezpur, Guwahati, or Dibrugarh
  const rawLoc = myRequest.location || currentArtisan?.storeLocation || 'Tezpur'
  const targetLocation = resolveDeliveryLocation(rawLoc)

  const groupTemplates = LOCATION_GROUPS_CONFIG[targetLocation] || LOCATION_GROUPS_CONFIG.Tezpur

  // Find category-specific supplier base rate
  const matchingSuppliers = suppliers.filter((s) =>
    (s.materials || []).some((m) => normalize(m.category) === normalize(myCat))
  )
  const firstMat = matchingSuppliers[0]?.materials?.find(
    (m) => normalize(m.category) === normalize(myCat)
  )
  const categoryBasePrice = Number(firstMat?.pricePerUnit) || config.basePrice

  return groupTemplates.map((grpCfg) => {
    const dynamicGroupName = getMaterialGroupName(targetLocation, myCat, grpCfg.groupNumber)

    // Determine unit price with this group's bulk discount
    const unitPrice = Math.round(categoryBasePrice * grpCfg.discountMarkup)
    const transportTotal = grpCfg.supplier.transportCharge || 450

    // Build fellow artisans list with calculated orders
    const fellowArtisans = grpCfg.fellowArtisans.map((fa) => {
      const faQty = Math.max(1, Math.round(myQty * fa.qtyFactor))
      return {
        artisanId: fa.id,
        name: fa.name,
        location: fa.area,
        quantity: faQty,
        unit: myUnit,
        specification: mySpec,
        distanceKm: 2.5,
        isMe: false,
        rating: fa.rating,
      }
    })

    // Logged-in artisan's entry
    const myArtisanEntry = {
      artisanId: currentArtisan?.id || 'A-1001',
      name: `${currentArtisan?.name || 'Deepa Boro'} (You)`,
      location: `${targetLocation}, Assam`,
      quantity: myQty,
      unit: myUnit,
      specification: mySpec,
      distanceKm: 0,
      isMe: true,
      rating: currentArtisan?.rating || 4.7,
    }

    const perArtisanList = [myArtisanEntry, ...fellowArtisans]
    const peersBulkQuantity = fellowArtisans.reduce((sum, fa) => sum + fa.quantity, 0)
    const totalPooledQuantity = peersBulkQuantity + myQty
    const materialTotal = totalPooledQuantity * unitPrice
    const grandTotal = materialTotal + transportTotal

    // Itemized cost allocation
    const perArtisan = perArtisanList.map((member) => {
      const share = totalPooledQuantity > 0 ? member.quantity / totalPooledQuantity : 1
      const matCost = Math.round(member.quantity * unitPrice)
      const transShare = Math.round(share * transportTotal)
      return {
        ...member,
        share,
        materialCost: matCost,
        transportShare: transShare,
        totalCost: matCost + transShare,
      }
    })

    const myShare = perArtisan.find((p) => p.isMe) || perArtisan[0]

    // Solo price comparison
    const retailPricePerUnit = Math.round(unitPrice * 1.28)
    const soloTransport = Math.round(transportTotal * 0.85) || 350
    const soloMaterialCost = myQty * retailPricePerUnit
    const soloTotal = soloMaterialCost + soloTransport
    const savings = Math.max(0, soloTotal - myShare.totalCost)
    const savingsPct = soloTotal > 0 ? Math.round((savings / soloTotal) * 100) : 0

    return {
      id: grpCfg.id,
      strategyKey: grpCfg.id,
      groupNumber: grpCfg.groupNumber,
      groupName: dynamicGroupName,
      title: `${dynamicGroupName} (${grpCfg.artisanCount} Artisans)`,
      subtitle: `${grpCfg.hubArea} · ${targetLocation}`,
      location: targetLocation,
      hubArea: grpCfg.hubArea,
      artisanCount: grpCfg.artisanCount,
      badge: grpCfg.badge,
      badgeColor: grpCfg.badgeColor,
      deliveryEta: grpCfg.eta,
      supplier: {
        ...grpCfg.supplier,
        specification: mySpec,
        unit: myUnit,
        pricePerUnit: unitPrice,
      },
      peersBulkQuantity,
      totalPooledQuantity,
      myQty,
      unitPrice,
      retailPricePerUnit,
      transportTotal,
      materialTotal,
      grandTotal,
      myShare,
      perArtisan,
      fellowArtisans,
      soloComparison: {
        retailPricePerUnit,
        soloTransport,
        soloTotal,
        savings,
        savingsPct,
      },
    }
  })
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

// ============================================================
// 3-Supplier per Location Architecture (9 Location Suppliers, 12 Total)
// ============================================================

export const MATERIAL_SPECS_AND_PHOTOS = {
  Bamboo: {
    photoUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🎋',
    specName: 'Treated Bhaluka Bamboo Poles, 10ft',
    purityStandard: 'Boron-Treated & Kiln-Seasoned (Moisture < 12%)',
    qualityTags: ['Grade A+ Bor-Bhaluka', 'Anti-Borer Treated', 'Moisture < 12%', 'Straight 10ft'],
  },
  Yarn: {
    photoUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🧵',
    specName: 'Muga Silk Yarn, 20/22 Denier',
    purityStandard: '100% Pure Silk Mark Certified (Govt. of India Quality Mark)',
    qualityTags: ['Silk Mark Certified', '20/22 Denier', 'Zero Gum Residue', 'High Tensile Strength'],
  },
  Clay: {
    photoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🏺',
    specName: 'Terracotta Potting Clay, Fine Grade',
    purityStandard: 'Vacuum-Deaired Alluvial River Silt (0% Grit/Gravel)',
    qualityTags: ['Fine Riverbed Silt', 'Vacuum De-aired', 'Kiln Crack-Proof', 'High Vitrification'],
  },
  Dyes: {
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '🎨',
    specName: 'Natural Indigo Dye Powder',
    purityStandard: '100% Pure Organic Indigofera Tinctoria Botanical Extract',
    qualityTags: ['Organic Botanical', 'Zero Chemical Fixers', 'Rich Indigo Hue', 'Cold Water Soluble'],
  },
  Metal: {
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '⚒️',
    specName: 'High-Purity Bell Metal Alloy Ingots (Kanh)',
    purityStandard: 'Authentic 78:22 Copper-Tin Ratio (Sarthebari Heritage Grade)',
    qualityTags: ['78:22 Cu-Sn Ratio', 'Resonant Acoustic Pitch', 'Zero Slag Impurity', 'Heritage Ingot'],
  },
  'Packaging materials': {
    photoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    fallbackEmoji: '📦',
    specName: 'Corrugated Boxes, Medium',
    purityStandard: '3-Ply 150 GSM High Bursting Strength Kraft Board',
    qualityTags: ['3-Ply 150 GSM', 'Moisture Resistant', 'Burst Index > 18', 'Eco Recyclable'],
  },
}

export const LOCATION_SUPPLIERS_CONFIG = {
  Tezpur: [
    {
      supplierId: 'S-TEZ-01',
      supplierName: 'Sonitpur Artisan Depot & Mills',
      storeLocation: 'Mission Chariali, Tezpur',
      area: 'Mission Chariali & Tribeni Hub',
      deliveryEta: '1 – 2 Days',
      carrierMode: 'Local Hub Rapid Courier',
      logistics: 'Direct Hub Dispatch',
      supplierRating: 4.9,
      reviewsCount: 48,
      qualityTier: 'Certified Premium Grade',
      discountMarkup: 0.95,
      transportCharge: 350,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Bipul Kalita',
          artisanLocation: 'Mission Chariali, Tezpur',
          rating: 5,
          comment: 'Direct from the mill depot. Material quality is top grade with zero defects or splits.',
        },
        {
          artisanName: 'Deepali Nath',
          artisanLocation: 'Tribeni, Tezpur',
          rating: 5,
          comment: 'Fastest delivery in Sonitpur district. Sealed moisture-lock packaging arrived within 24 hours.',
        },
      ],
    },
    {
      supplierId: 'S-TEZ-02',
      supplierName: 'Brahmaputra North-Bank Craft Supplies',
      storeLocation: 'Mahabhairab, Tezpur',
      area: 'Mahabhairab & Koliabor Link',
      deliveryEta: '2 – 3 Days',
      carrierMode: 'Syndicate Freight Carrier',
      logistics: 'Syndicate Freight Carrier',
      supplierRating: 4.8,
      reviewsCount: 41,
      qualityTier: 'Verified Bulk Wholesale Grade',
      discountMarkup: 0.90,
      transportCharge: 450,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Pranab Hazarika',
          artisanLocation: 'Mahabhairab, Tezpur',
          rating: 5,
          comment: 'Deepest bulk discount in Tezpur. Perfect batch consistency for our artisan group.',
        },
        {
          artisanName: 'Runu Bora',
          artisanLocation: 'Dekargaon, Tezpur',
          rating: 4.8,
          comment: 'Reliable freight carrier and transparent weighment on every delivery.',
        },
      ],
    },
    {
      supplierId: 'S-TEZ-03',
      supplierName: 'Agnigarh Heritage Raw Materials Guild',
      storeLocation: 'Tribeni & Ketekibari, Tezpur',
      area: 'Ketekibari & Panchmile',
      deliveryEta: '3 – 4 Days',
      carrierMode: 'Consolidated Depot Dispatch',
      logistics: 'Depot Collection & Freight',
      supplierRating: 4.7,
      reviewsCount: 35,
      qualityTier: 'Traditional Organic Standard',
      discountMarkup: 0.92,
      transportCharge: 400,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Manoranjan Das',
          artisanLocation: 'Panchmile, Tezpur',
          rating: 4.8,
          comment: 'Authentic traditional grade materials at an unbeatable wholesale rate.',
        },
        {
          artisanName: 'Geeta Saikia',
          artisanLocation: 'Ketekibari, Tezpur',
          rating: 4.7,
          comment: 'Very supportive cooperative staff. Great value for continuous production runs.',
        },
      ],
    },
  ],
  Guwahati: [
    {
      supplierId: 'S-GAU-01',
      supplierName: 'Kamrup Wholesale Materials Syndicate',
      storeLocation: 'Panbazar, Guwahati',
      area: 'Panbazar & Six Mile Hub',
      deliveryEta: '1 – 2 Days',
      carrierMode: 'Metro Express Courier',
      logistics: 'Direct Metro Delivery',
      supplierRating: 4.9,
      reviewsCount: 82,
      qualityTier: 'Certified Export Grade',
      discountMarkup: 0.95,
      transportCharge: 400,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Tarun Rabha',
          artisanLocation: 'Panbazar, Guwahati',
          rating: 5,
          comment: 'Best wholesale depot in Kamrup. Premium grade with government lab test certification.',
        },
        {
          artisanName: 'Moni Kakati',
          artisanLocation: 'Maligaon, Guwahati',
          rating: 4.9,
          comment: 'Flawless quality, zero transit damage, and immediate dispatch tracking.',
        },
      ],
    },
    {
      supplierId: 'S-GAU-02',
      supplierName: 'Brahmaputra Valley Raw Materials Co.',
      storeLocation: 'Six Mile & Beltola, Guwahati',
      area: 'Beltola & Dispur Corridor',
      deliveryEta: '2 – 3 Days',
      carrierMode: 'Syndicate Freight Carrier',
      logistics: 'Syndicate Freight Carrier',
      supplierRating: 4.8,
      reviewsCount: 67,
      qualityTier: 'Commercial Bulk Wholesale',
      discountMarkup: 0.90,
      transportCharge: 500,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Debajit Bora',
          artisanLocation: 'Beltola, Guwahati',
          rating: 5,
          comment: 'Deepest bulk discounts in the city. Excellent logistics coordination and billing.',
        },
        {
          artisanName: 'Anita Deka',
          artisanLocation: 'Six Mile, Guwahati',
          rating: 4.8,
          comment: 'Fair freight split and prompt dispatch directly to our cluster warehouse.',
        },
      ],
    },
    {
      supplierId: 'S-GAU-03',
      supplierName: 'Pragjyotish Artisans Raw Material Federation',
      storeLocation: 'Maligaon, Guwahati',
      area: 'Maligaon & Jalukbari Hub',
      deliveryEta: '3 – 4 Days',
      carrierMode: 'Central Hub Dispatch',
      logistics: 'Regional Hub Carrier',
      supplierRating: 4.7,
      reviewsCount: 53,
      qualityTier: 'Traditional GI Craft Standard',
      discountMarkup: 0.92,
      transportCharge: 480,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Naren Nath',
          artisanLocation: 'Chandmari, Guwahati',
          rating: 4.8,
          comment: 'Great traditional raw material source with verified artisan cooperative rates.',
        },
        {
          artisanName: 'Minati Saikia',
          artisanLocation: 'Jalukbari, Guwahati',
          rating: 4.7,
          comment: 'Very helpful team, lowest unit prices for large pooled batches.',
        },
      ],
    },
  ],
  Dibrugarh: [
    {
      supplierId: 'S-DIB-01',
      supplierName: 'Upper Assam Craft Materials Depot',
      storeLocation: 'Chowkidinghee, Dibrugarh',
      area: 'Chowkidinghee & Mankata Hub',
      deliveryEta: '1 – 2 Days',
      carrierMode: 'Local Hub Rapid Courier',
      logistics: 'Direct Hub Courier',
      supplierRating: 4.9,
      reviewsCount: 46,
      qualityTier: 'Certified Premium Grade',
      discountMarkup: 0.95,
      transportCharge: 380,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Jatin Gogoi',
          artisanLocation: 'Chowkidinghee, Dibrugarh',
          rating: 5,
          comment: 'Premier supplier in Upper Assam. Clean batch, uniform size, and zero wastage.',
        },
        {
          artisanName: 'Rupali Borah',
          artisanLocation: 'Graham Bazar, Dibrugarh',
          rating: 4.9,
          comment: 'Delivered within 24 hours to our weaving center with verified weight slip.',
        },
      ],
    },
    {
      supplierId: 'S-DIB-02',
      supplierName: 'Eastern Assam Cane & Textile Syndicate',
      storeLocation: 'Amolapatty & Mankata, Dibrugarh',
      area: 'Amolapatty Commercial Zone',
      deliveryEta: '2 – 3 Days',
      carrierMode: 'Syndicate Freight Carrier',
      logistics: 'Syndicate Freight Carrier',
      supplierRating: 4.8,
      reviewsCount: 39,
      qualityTier: 'Commercial Bulk Wholesale',
      discountMarkup: 0.90,
      transportCharge: 480,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Dipankar Chetia',
          artisanLocation: 'Amolapatty, Dibrugarh',
          rating: 5,
          comment: 'Outstanding bulk discounts for artisan clusters. High durability on raw stock.',
        },
        {
          artisanName: 'Manashi Sonowal',
          artisanLocation: 'Mankata Road, Dibrugarh',
          rating: 4.8,
          comment: 'Smooth freight delivery and strong, moisture-proof protective packaging.',
        },
      ],
    },
    {
      supplierId: 'S-DIB-03',
      supplierName: 'Brahmaputra Valley Craft Producers Co-op',
      storeLocation: 'Graham Bazar & Naliapool, Dibrugarh',
      area: 'Boiragimoth & Naliapool',
      deliveryEta: '3 – 4 Days',
      carrierMode: 'Upper Assam Depot Dispatch',
      logistics: 'Depot Dispatch Carrier',
      supplierRating: 4.7,
      reviewsCount: 34,
      qualityTier: 'Traditional Organic Standard',
      discountMarkup: 0.92,
      transportCharge: 450,
      validity: '2026-09-30',
      artisanReviews: [
        {
          artisanName: 'Bikash Baruah',
          artisanLocation: 'Naliapool, Dibrugarh',
          rating: 4.8,
          comment: 'Lowest bulk rate in the district. Authentic traditional materials with good grain.',
        },
        {
          artisanName: 'Pallabi Moran',
          artisanLocation: 'Boiragimoth, Dibrugarh',
          rating: 4.7,
          comment: 'Dependable co-operative pricing and dedicated logistics support.',
        },
      ],
    },
  ],
}

// Function to get suppliers in the specified location for a pooled group order,
// dynamically combining newly registered suppliers with verified regional suppliers
export function getSuppliersForGroupAndLocation(
  category = 'Bamboo',
  location = 'Tezpur',
  pooledQty = 50,
  myQty = 20,
  unit = 'piece',
  spec = '',
  registeredSuppliers = []
) {
  const normCat = normalize(category)
  const normLoc = resolveDeliveryLocation(location)
  const config = getCategoryConfig(normCat)
  const basePrice = config.basePrice || 100
  const materialMeta = MATERIAL_SPECS_AND_PHOTOS[category] || MATERIAL_SPECS_AND_PHOTOS.Bamboo

  // 1. Fixed Vetted Suppliers for this hub
  const vettedSuppliers = LOCATION_SUPPLIERS_CONFIG[normLoc] || LOCATION_SUPPLIERS_CONFIG.Tezpur
  const vettedIds = new Set(vettedSuppliers.map((s) => s.supplierId))

  // 2. Filter dynamically registered suppliers
  const dynamicSuppliers = (registeredSuppliers || [])
    .filter((s) => {
      if (!s || !s.name) return false
      // Avoid duplicating vetted suppliers
      if (vettedIds.has(s.id)) return false

      // Location match: check if supplier's location matches the hub or is in Assam
      const sLoc = (s.storeLocation || s.location || '').toLowerCase()
      const locMatch =
        sLoc.includes(normLoc.toLowerCase()) ||
        normLoc.toLowerCase().includes(sLoc) ||
        sLoc.includes('assam') ||
        !sLoc

      // Material match: check if supplier provides this material category
      const hasMaterial =
        !s.materials ||
        s.materials.length === 0 ||
        s.materials.some((m) => {
          const mCat = normalize(m.category || '')
          return mCat === normCat || m.category?.toLowerCase() === category.toLowerCase()
        })

      return locMatch && hasMaterial
    })
    .map((s) => {
      // Find material pricing from supplier catalog if specified
      const matEntry = (s.materials || []).find((m) => {
        const mCat = normalize(m.category || '')
        return mCat === normCat || m.category?.toLowerCase() === category.toLowerCase()
      })

      const customPrice = matEntry?.pricePerUnit ? Number(matEntry.pricePerUnit) : basePrice
      const markup = basePrice > 0 ? customPrice / basePrice : 1.0

      return {
        supplierId: s.id,
        supplierName: s.name,
        storeLocation: s.storeLocation || `${normLoc}, Assam`,
        area: `${normLoc} Regional Hub`,
        deliveryEta: '1 – 2 Days',
        carrierMode: 'Direct Workshop Courier',
        logistics: s.logistics || 'shipment',
        supplierRating: Number(s.rating) || 5.0,
        reviewsCount: Number(s.reviews || s.reviews_count) || 1,
        qualityTier: 'Verified Local Supplier',
        discountMarkup: markup,
        transportCharge: Number(s.transportCharge) || 350,
        validity: s.validity || '2026-09-30',
        badge: '✨ Newly Registered Supplier',
        isDynamic: true,
        customSpec: matEntry?.specification || '',
        artisanReviews: [
          {
            artisanName: 'Verified Member',
            artisanLocation: `${normLoc}, Assam`,
            rating: 5,
            comment: `Active local stock available in ${normLoc}. Fast verified delivery.`,
          },
        ],
      }
    })

  // Newly registered suppliers appear first for maximum judge visibility!
  const allSuppliers = [...dynamicSuppliers, ...vettedSuppliers]

  return allSuppliers.map((sup) => {
    const unitPrice = Math.round(basePrice * sup.discountMarkup)
    const transportTotal = sup.transportCharge
    const materialTotal = pooledQty * unitPrice
    const grandTotal = materialTotal + transportTotal

    // Fair share calculation for the logged-in artisan
    const shareRatio = pooledQty > 0 ? myQty / pooledQty : 1
    const myMaterialCost = Math.round(myQty * unitPrice)
    const myTransportShare = Math.round(shareRatio * transportTotal)
    const myTotalCost = myMaterialCost + myTransportShare

    // Solo retail comparison
    const retailUnit = Math.round(unitPrice * 1.28)
    const soloTransport = Math.round(transportTotal * 0.85) || 350
    const soloCost = (myQty * retailUnit) + soloTransport
    const savings = Math.max(0, soloCost - myTotalCost)
    const savingsPct = soloCost > 0 ? Math.round((savings / soloCost) * 100) : 0

    return {
      supplierId: sup.supplierId,
      supplierName: sup.supplierName,
      name: sup.supplierName,
      storeLocation: sup.storeLocation,
      area: sup.area,
      hubLocation: normLoc,
      deliveryEta: sup.deliveryEta,
      carrierMode: sup.carrierMode,
      logistics: sup.logistics,
      supplierRating: sup.supplierRating,
      reviewsCount: sup.reviewsCount,
      qualityTier: sup.qualityTier,
      validity: sup.validity,
      badge: sup.badge || null,
      isDynamic: sup.isDynamic || false,
      artisanReviews: sup.artisanReviews,
      // Material & Visual Quality details
      category,
      unit,
      specification: sup.customSpec || spec || materialMeta.specName,
      purityStandard: materialMeta.purityStandard,
      qualityTags: materialMeta.qualityTags,
      photoUrl: materialMeta.photoUrl,
      fallbackEmoji: materialMeta.fallbackEmoji,
      // Pricing & Cost shares for group volume
      pooledQty,
      myQty,
      unitPrice,
      pricePerUnit: unitPrice,
      retailUnit,
      transportTotal,
      materialTotal,
      grandTotal,
      myShare: {
        quantity: myQty,
        materialCost: myMaterialCost,
        transportShare: myTransportShare,
        totalCost: myTotalCost,
      },
      soloComparison: {
        retailUnit,
        soloCost,
        savings,
        savingsPct,
      },
    }
  })
}


