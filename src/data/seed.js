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
  { id: 'A-1001', name: 'Deepa Boro', aadhar: '•••• •••• 4821', storeLocation: 'Tezpur, Assam', phone: '9864000001', rating: 4.6, reviews: 12 },
  { id: 'A-1002', name: 'Rukmini Das', aadhar: '•••• •••• 2290', storeLocation: 'Tezpur, Assam', phone: '9435000002', rating: 4.3, reviews: 8 },
  { id: 'A-1003', name: 'Bipul Kalita', aadhar: '•••• •••• 6743', storeLocation: 'Tezpur, Assam', phone: '8011000003', rating: 4.8, reviews: 20 },
  { id: 'A-1004', name: 'Tarun Rabha', aadhar: '•••• •••• 9912', storeLocation: 'Guwahati, Assam', phone: '9706000004', rating: 4.7, reviews: 14 },
  { id: 'A-1005', name: 'Anita Deka', aadhar: '•••• •••• 5519', storeLocation: 'Guwahati, Assam', phone: '9435000005', rating: 4.9, reviews: 26 },
  { id: 'A-1006', name: 'Jatin Gogoi', aadhar: '•••• •••• 8102', storeLocation: 'Dibrugarh, Assam', phone: '9864000006', rating: 4.8, reviews: 15 },
  { id: 'A-1007', name: 'Manashi Sonowal', aadhar: '•••• •••• 3341', storeLocation: 'Dibrugarh, Assam', phone: '7002000007', rating: 4.7, reviews: 17 },
]

export const seedSuppliers = [
  // Tezpur Suppliers (1 - 3)
  {
    id: 'S-TEZ-01',
    name: 'Sonitpur Artisan Depot & Mills',
    aadhar: '•••• •••• 0001',
    storeLocation: 'Mission Chariali, Tezpur',
    phone: '1111111111',
    rating: 4.9,
    reviews: 48,
    logistics: 'shipment',
    transportCharge: 350,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 110, minBulkQty: 25 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3100, minBulkQty: 10 },
      { category: 'Clay', specification: 'Terracotta potting clay, fine grade', unit: 'kg', pricePerUnit: 22, minBulkQty: 50 },
    ],
  },
  {
    id: 'S-TEZ-02',
    name: 'Brahmaputra North-Bank Craft Supplies',
    aadhar: '•••• •••• 0002',
    storeLocation: 'Mahabhairab, Tezpur',
    phone: '2222222222',
    rating: 4.8,
    reviews: 41,
    logistics: 'shipment',
    transportCharge: 450,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 105, minBulkQty: 30 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3050, minBulkQty: 15 },
    ],
  },
  {
    id: 'S-TEZ-03',
    name: 'Agnigarh Heritage Raw Materials Guild',
    aadhar: '•••• •••• 0003',
    storeLocation: 'Tribeni & Ketekibari, Tezpur',
    phone: '3333333333',
    rating: 4.7,
    reviews: 35,
    logistics: 'pickup',
    transportCharge: 400,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 112, minBulkQty: 20 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3150, minBulkQty: 10 },
    ],
  },

  // Guwahati Suppliers (4 - 6)
  {
    id: 'S-GAU-01',
    name: 'Kamrup Wholesale Materials Syndicate',
    aadhar: '•••• •••• 0004',
    storeLocation: 'Panbazar, Guwahati',
    phone: '4444444444',
    rating: 4.9,
    reviews: 82,
    logistics: 'shipment',
    transportCharge: 400,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 108, minBulkQty: 25 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3080, minBulkQty: 10 },
    ],
  },
  {
    id: 'S-GAU-02',
    name: 'Brahmaputra Valley Raw Materials Co.',
    aadhar: '•••• •••• 0005',
    storeLocation: 'Six Mile & Beltola, Guwahati',
    phone: '5555555555',
    rating: 4.8,
    reviews: 67,
    logistics: 'shipment',
    transportCharge: 500,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 102, minBulkQty: 30 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 2980, minBulkQty: 15 },
    ],
  },
  {
    id: 'S-GAU-03',
    name: 'Pragjyotish Artisans Raw Material Federation',
    aadhar: '•••• •••• 0006',
    storeLocation: 'Maligaon, Guwahati',
    phone: '6666666666',
    rating: 4.7,
    reviews: 53,
    logistics: 'shipment',
    transportCharge: 480,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 110, minBulkQty: 20 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3100, minBulkQty: 10 },
    ],
  },

  // Dibrugarh Suppliers (7 - 9)
  {
    id: 'S-DIB-01',
    name: 'Upper Assam Craft Materials Depot',
    aadhar: '•••• •••• 0007',
    storeLocation: 'Chowkidinghee, Dibrugarh',
    phone: '7777777777',
    rating: 4.9,
    reviews: 46,
    logistics: 'shipment',
    transportCharge: 380,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 110, minBulkQty: 25 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3100, minBulkQty: 10 },
    ],
  },
  {
    id: 'S-DIB-02',
    name: 'Eastern Assam Cane & Textile Syndicate',
    aadhar: '•••• •••• 0008',
    storeLocation: 'Amolapatty & Mankata, Dibrugarh',
    phone: '8888888888',
    rating: 4.8,
    reviews: 39,
    logistics: 'shipment',
    transportCharge: 480,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 106, minBulkQty: 30 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3020, minBulkQty: 15 },
    ],
  },
  {
    id: 'S-DIB-03',
    name: 'Brahmaputra Valley Craft Producers Co-op',
    aadhar: '•••• •••• 0009',
    storeLocation: 'Graham Bazar & Naliapool, Dibrugarh',
    phone: '9999999999',
    rating: 4.7,
    reviews: 34,
    logistics: 'shipment',
    transportCharge: 420,
    validity: '2026-09-30',
    materials: [
      { category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', unit: 'piece', pricePerUnit: 112, minBulkQty: 20 },
      { category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', unit: 'kg', pricePerUnit: 3120, minBulkQty: 10 },
    ],
  },
]

export const seedCoordinators = [
  { id: 'C-3001', name: 'Manash Sarma', aadhar: '•••• •••• 3345', phone: '9678000020', experience: '6 years in handloom logistics, ex-Assam Apex Weavers Co-op', rating: 4.7, reviews: 15, activeDeals: 2 },
  { id: 'C-3002', name: 'Anowar Hussain', aadhar: '•••• •••• 4421', phone: '9864000021', experience: '8 years rural transport coordinator across Kamrup and Barpeta', rating: 4.8, reviews: 22, activeDeals: 3 },
]

export const seedMaterialRequests = [
  { id: 'R-01', artisanId: 'A-1001', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 8, unit: 'kg', location: 'Tezpur, Assam', requiredDate: '2026-09-12', status: 'open' },
  { id: 'R-02', artisanId: 'A-1002', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 6, unit: 'kg', location: 'Tezpur, Assam', requiredDate: '2026-09-14', status: 'open' },
  { id: 'R-03', artisanId: 'A-1003', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: 20, unit: 'piece', location: 'Tezpur, Assam', requiredDate: '2026-09-15', status: 'open' },
  { id: 'R-04', artisanId: 'A-1004', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: 25, unit: 'piece', location: 'Guwahati, Assam', requiredDate: '2026-09-18', status: 'open' },
  { id: 'R-05', artisanId: 'A-1005', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 10, unit: 'kg', location: 'Guwahati, Assam', requiredDate: '2026-09-19', status: 'open' },
  { id: 'R-06', artisanId: 'A-1006', category: 'Yarn', specification: 'Muga silk yarn, 20/22 denier', quantity: 12, unit: 'kg', location: 'Dibrugarh, Assam', requiredDate: '2026-09-16', status: 'open' },
  { id: 'R-07', artisanId: 'A-1007', category: 'Bamboo', specification: 'Treated Bhaluka bamboo poles, 10ft', quantity: 30, unit: 'piece', location: 'Dibrugarh, Assam', requiredDate: '2026-09-17', status: 'open' },
  { id: 'R-08', artisanId: 'A-1002', category: 'Dyes', specification: 'Natural indigo dye powder', quantity: 4, unit: 'kg', location: 'Tezpur, Assam', requiredDate: '2026-09-15', status: 'open' },
  { id: 'R-09', artisanId: 'A-1005', category: 'Metal', specification: 'High-purity Bell metal alloy ingots (Kanh)', quantity: 20, unit: 'kg', location: 'Guwahati, Assam', requiredDate: '2026-09-20', status: 'open' },
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
