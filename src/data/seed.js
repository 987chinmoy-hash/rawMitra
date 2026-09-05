// Demo seed data so the matching/bulk-pricing flow has something to show
// before real accounts + a backend exist. Replace with API responses later.

export const MATERIAL_CATEGORIES = [
  'Bamboo',
  'Yarn',
  'Clay',
  'Dyes',
  'Metal',
  'Packaging materials',
]

export const UNITS = ['kg', 'g', 'litre', 'metre', 'roll', 'piece', 'bundle', 'sack', 'pole']

export const seedArtisans = [
  { id: 'A-1001', name: 'Deepa Boro', aadhar: '•••• •••• 4821', storeLocation: 'Sualkuchi, Assam', phone: '9864000001', rating: 4.6, reviews: 12 },
  { id: 'A-1002', name: 'Rukmini Das', aadhar: '•••• •••• 2290', storeLocation: 'Sualkuchi, Assam', phone: '9435000002', rating: 4.3, reviews: 8 },
  { id: 'A-1003', name: 'Bipul Kalita', aadhar: '•••• •••• 6743', storeLocation: 'Hajo, Assam', phone: '8011000003', rating: 4.8, reviews: 20 },
  { id: 'A-1004', name: 'Tarun Rabha', aadhar: '•••• •••• 9912', storeLocation: 'Guwahati, Assam', phone: '9706000004', rating: 4.7, reviews: 14 },
  { id: 'A-1005', name: 'Hemen Medhi', aadhar: '•••• •••• 5519', storeLocation: 'Sarthebari, Assam', phone: '9435000005', rating: 4.9, reviews: 26 },
  { id: 'A-1006', name: 'Pranita Saikia', aadhar: '•••• •••• 8102', storeLocation: 'Sualkuchi, Assam', phone: '9864000006', rating: 4.5, reviews: 11 },
  { id: 'A-1007', name: 'Jadav Das', aadhar: '•••• •••• 3341', storeLocation: 'Hajo, Assam', phone: '7002000007', rating: 4.7, reviews: 17 },
]

export const seedSuppliers = [
  {
    id: 'S-2001',
    name: 'Brahmaputra Yarn Co.',
    aadhar: '•••• •••• 1120',
    storeLocation: 'Guwahati, Assam',
    phone: '9101000011',
    rating: 4.7,
    reviews: 34,
    logistics: 'shipment',
    transportCharge: 600,
    validity: '2026-09-22',
    materials: [
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3200, minBulkQty: 20 },
      { category: 'Yarn', specification: 'Mulberry silk yarn, Grade A', unit: 'kg', pricePerUnit: 2400, minBulkQty: 15 },
    ],
  },
  {
    id: 'S-2002',
    name: 'Kamrup Textile Supplies',
    aadhar: '•••• •••• 5567',
    storeLocation: 'Sualkuchi, Assam',
    phone: '9954000012',
    rating: 4.4,
    reviews: 19,
    logistics: 'pickup',
    transportCharge: 350,
    validity: '2026-09-20',
    materials: [
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 2950, minBulkQty: 15 },
      { category: 'Dyes', specification: 'Natural indigo dye powder', unit: 'kg', pricePerUnit: 850, minBulkQty: 5 },
      { category: 'Dyes', specification: 'Madder root organic red dye', unit: 'kg', pricePerUnit: 720, minBulkQty: 8 },
    ],
  },
  {
    id: 'S-2003',
    name: 'Hajo Clay & Craft Depot',
    aadhar: '•••• •••• 9834',
    storeLocation: 'Hajo, Assam',
    phone: '7002000013',
    rating: 4.9,
    reviews: 41,
    logistics: 'shipment',
    transportCharge: 500,
    validity: '2026-09-24',
    materials: [
      { category: 'Clay', specification: 'Terracotta potting clay, fine grade', unit: 'kg', pricePerUnit: 22, minBulkQty: 100 },
      { category: 'Packaging materials', specification: 'Corrugated boxes, medium', unit: 'piece', pricePerUnit: 14, minBulkQty: 50 },
    ],
  },
  {
    id: 'S-2004',
    name: 'Assam Bamboo & Cane Syndicate',
    aadhar: '•••• •••• 8841',
    storeLocation: 'Guwahati, Assam',
    phone: '9435000014',
    rating: 4.8,
    reviews: 52,
    logistics: 'shipment',
    transportCharge: 750,
    validity: '2026-09-25',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 110, minBulkQty: 40 },
      { category: 'Bamboo', specification: 'Cane split ribs for weaving', unit: 'bundle', pricePerUnit: 340, minBulkQty: 10 },
    ],
  },
  {
    id: 'S-2005',
    name: 'Sarthebari Bell Metal Works Co-op',
    aadhar: '•••• •••• 7732',
    storeLocation: 'Sarthebari, Assam',
    phone: '9864000015',
    rating: 4.9,
    reviews: 38,
    logistics: 'shipment',
    transportCharge: 650,
    validity: '2026-09-28',
    materials: [
      { category: 'Metal', specification: 'High-purity Bell metal alloy ingots (Kanh)', unit: 'kg', pricePerUnit: 780, minBulkQty: 25 },
      { category: 'Metal', specification: 'Brass scrap sheets (Pitol)', unit: 'kg', pricePerUnit: 520, minBulkQty: 30 },
    ],
  },
]

export const seedCoordinators = [
  { id: 'C-3001', name: 'Manash Sarma', aadhar: '•••• •••• 3345', phone: '9678000020', experience: '6 years in handloom logistics, ex-Assam Apex Weavers Co-op', rating: 4.7, reviews: 15, activeDeals: 2 },
  { id: 'C-3002', name: 'Anowar Hussain', aadhar: '•••• •••• 4421', phone: '9864000021', experience: '8 years rural transport coordinator across Kamrup and Barpeta', rating: 4.8, reviews: 22, activeDeals: 3 },
]

export const seedMaterialRequests = [
  { id: 'R-01', artisanId: 'A-1001', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 8, unit: 'kg', location: 'Sualkuchi, Assam', requiredDate: '2026-09-12', status: 'open' },
  { id: 'R-02', artisanId: 'A-1002', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 6, unit: 'kg', location: 'Sualkuchi, Assam', requiredDate: '2026-09-14', status: 'open' },
  { id: 'R-03', artisanId: 'A-1006', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 12, unit: 'kg', location: 'Sualkuchi, Assam', requiredDate: '2026-09-15', status: 'open' },
  { id: 'R-04', artisanId: 'A-1003', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: 25, unit: 'piece', location: 'Guwahati, Assam', requiredDate: '2026-09-18', status: 'open' },
  { id: 'R-05', artisanId: 'A-1004', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: 20, unit: 'piece', location: 'Guwahati, Assam', requiredDate: '2026-09-19', status: 'open' },
  { id: 'R-06', artisanId: 'A-1007', category: 'Clay', specification: 'Terracotta potting clay, fine grade', quantity: 80, unit: 'kg', location: 'Hajo, Assam', requiredDate: '2026-09-16', status: 'open' },
  { id: 'R-07', artisanId: 'A-1003', category: 'Clay', specification: 'Terracotta potting clay, fine grade', quantity: 50, unit: 'kg', location: 'Hajo, Assam', requiredDate: '2026-09-17', status: 'open' },
  { id: 'R-08', artisanId: 'A-1002', category: 'Dyes', specification: 'Natural indigo dye powder', quantity: 4, unit: 'kg', location: 'Sualkuchi, Assam', requiredDate: '2026-09-15', status: 'open' },
  { id: 'R-09', artisanId: 'A-1005', category: 'Metal', specification: 'High-purity Bell metal alloy ingots (Kanh)', quantity: 20, unit: 'kg', location: 'Sarthebari, Assam', requiredDate: '2026-09-20', status: 'open' },
  { id: 'R-10', artisanId: 'A-1004', category: 'Packaging materials', specification: 'Corrugated boxes, medium', quantity: 40, unit: 'piece', location: 'Guwahati, Assam', requiredDate: '2026-09-22', status: 'open' },
]

export const seedOrders = []
export const seedBroadcasts = [
  {
    id: 'B-101',
    artisanId: 'A-1002',
    artisanName: 'Rukmini Das',
    category: 'Bamboo',
    specification: 'Treated Bhaluka bamboo poles, 10ft',
    quantity: 15,
    unit: 'piece',
    location: 'Sualkuchi, Assam',
    deadline: '2026-09-12',
    notes: 'Need 2 more artisans to reach 40-pole bulk discount tier with supplier!',
    status: 'open',
  },
]
export const seedRatings = {}
