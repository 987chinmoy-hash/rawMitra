import bcrypt from 'bcryptjs'
import db, { initDatabase } from './database.js'
import { generateIdentityHash, maskAadhaar } from '../services/fraudService.js'

export function seedDatabase() {
  initDatabase()

  // Clear existing records
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM penalty_ledger;
    DELETE FROM order_splits;
    DELETE FROM orders;
    DELETE FROM broadcasts;
    DELETE FROM material_requests;
    DELETE FROM supplier_materials;
    DELETE FROM users;
  `)

  const passHash = bcrypt.hashSync('password123', 8)

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, experience, rating, reviews_count, onboarding_complete, current_step)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'completed')
  `)

  // 1. Artisans
  const artisans = [
    { id: 'A-1001', name: 'Deepa Boro', phone: '9864000001', aadhaar: '888898640001', loc: 'Sualkuchi, Assam', rating: 4.6, revs: 12 },
    { id: 'A-1002', name: 'Rukmini Das', phone: '9435000002', aadhaar: '888894350002', loc: 'Sualkuchi, Assam', rating: 4.3, revs: 8 },
    { id: 'A-1003', name: 'Bipul Kalita', phone: '8011000003', aadhaar: '888880110003', loc: 'Hajo, Assam', rating: 4.8, revs: 20 },
    { id: 'A-1004', name: 'Tarun Rabha', phone: '9706000004', aadhaar: '888897060004', loc: 'Guwahati, Assam', rating: 4.7, revs: 14 },
    { id: 'A-1005', name: 'Hemen Medhi', phone: '9435000005', aadhaar: '888894350005', loc: 'Sarthebari, Assam', rating: 4.9, revs: 26 },
    { id: 'A-1006', name: 'Pranita Saikia', phone: '9864000006', aadhaar: '888898640006', loc: 'Sualkuchi, Assam', rating: 4.5, revs: 11 },
  ]

  for (const a of artisans) {
    insertUser.run(
      a.id,
      'artisan',
      a.name,
      a.phone,
      passHash,
      generateIdentityHash(a.aadhaar),
      maskAadhaar(a.aadhaar),
      a.loc,
      null,
      a.rating,
      a.revs
    )
  }

  // 2. Suppliers
  const suppliers = [
    { id: 'S-2001', name: 'Brahmaputra Yarn Co.', phone: '9101000011', aadhaar: '888891010011', loc: 'Guwahati, Assam', rating: 4.7, revs: 34 },
    { id: 'S-2002', name: 'Kamrup Textile Supplies', phone: '9954000012', aadhaar: '888899540012', loc: 'Sualkuchi, Assam', rating: 4.4, revs: 19 },
    { id: 'S-2003', name: 'Hajo Clay & Craft Depot', phone: '7002000013', aadhaar: '888870020013', loc: 'Hajo, Assam', rating: 4.9, revs: 41 },
    { id: 'S-2004', name: 'Assam Bamboo & Cane Syndicate', phone: '9435000014', aadhaar: '888894350014', loc: 'Guwahati, Assam', rating: 4.8, revs: 52 },
    { id: 'S-2005', name: 'Sarthebari Bell Metal Works Co-op', phone: '9864000015', aadhaar: '888898640015', loc: 'Sarthebari, Assam', rating: 4.9, revs: 38 },
  ]

  for (const s of suppliers) {
    insertUser.run(
      s.id,
      'supplier',
      s.name,
      s.phone,
      passHash,
      generateIdentityHash(s.aadhaar),
      maskAadhaar(s.aadhaar),
      s.loc,
      null,
      s.rating,
      s.revs
    )
  }

  // 3. Coordinators
  const coordinators = [
    { id: 'C-3001', name: 'Manash Sarma', phone: '9678000020', aadhaar: '888896780020', exp: '6 years in handloom logistics, ex-Assam Apex Weavers Co-op', rating: 4.7, revs: 15 },
    { id: 'C-3002', name: 'Anowar Hussain', phone: '9864000021', aadhaar: '888898640021', exp: '8 years rural transport coordinator across Kamrup and Barpeta', rating: 4.8, revs: 22 },
  ]

  for (const c of coordinators) {
    insertUser.run(
      c.id,
      'coordinator',
      c.name,
      c.phone,
      passHash,
      generateIdentityHash(c.aadhaar),
      maskAadhaar(c.aadhaar),
      'Guwahati, Assam',
      c.exp,
      c.rating,
      c.revs
    )
  }

  // 4. Supplier Materials Catalog
  const insertMat = db.prepare(`
    INSERT INTO supplier_materials (id, supplier_id, category, specification, unit, price_per_unit, min_bulk_qty, transport_charge, validity_date, logistics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const materials = [
    ['SM-01', 'S-2001', 'Yarn', 'Muga silk yarn, 20/22 denier', 'kg', 3200, 20, 600, '2026-09-28', 'shipment'],
    ['SM-02', 'S-2001', 'Yarn', 'Mulberry silk yarn, Grade A', 'kg', 2400, 15, 550, '2026-09-28', 'shipment'],
    ['SM-03', 'S-2002', 'Yarn', 'Muga silk yarn, 20/22 denier', 'kg', 2950, 15, 350, '2026-09-26', 'pickup'],
    ['SM-04', 'S-2002', 'Dyes', 'Natural indigo dye powder', 'kg', 850, 5, 300, '2026-09-26', 'pickup'],
    ['SM-05', 'S-2003', 'Clay', 'Terracotta potting clay, fine grade', 'kg', 22, 100, 500, '2026-09-28', 'shipment'],
    ['SM-06', 'S-2003', 'Packaging materials', 'Corrugated boxes, medium', 'piece', 14, 50, 400, '2026-09-28', 'shipment'],
    ['SM-07', 'S-2004', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 'piece', 110, 40, 750, '2026-09-28', 'shipment'],
    ['SM-08', 'S-2005', 'Metal', 'High-purity Bell metal alloy ingots (Kanh)', 'kg', 780, 25, 650, '2026-09-30', 'shipment'],
  ]

  for (const m of materials) {
    insertMat.run(...m)
  }

  // 5. Open Material Demands
  const insertReq = db.prepare(`
    INSERT INTO material_requests (id, artisan_id, category, specification, quantity, unit, location, required_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
  `)

  const requests = [
    ['R-01', 'A-1001', 'Yarn', 'Muga silk yarn, 20/22 denier', 8, 'kg', 'Sualkuchi, Assam', '2026-09-20'],
    ['R-02', 'A-1002', 'Yarn', 'Muga silk yarn, 20/22 denier', 6, 'kg', 'Sualkuchi, Assam', '2026-09-22'],
    ['R-03', 'A-1006', 'Yarn', 'Muga silk yarn, 20/22 denier', 12, 'kg', 'Sualkuchi, Assam', '2026-09-24'],
    ['R-04', 'A-1003', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 25, 'piece', 'Guwahati, Assam', '2026-09-25'],
    ['R-05', 'A-1004', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 20, 'piece', 'Guwahati, Assam', '2026-09-26'],
    ['R-06', 'A-1003', 'Clay', 'Terracotta potting clay, fine grade', 50, 'kg', 'Hajo, Assam', '2026-09-25'],
    ['R-07', 'A-1002', 'Dyes', 'Natural indigo dye powder', 4, 'kg', 'Sualkuchi, Assam', '2026-09-25'],
    ['R-08', 'A-1005', 'Metal', 'High-purity Bell metal alloy ingots (Kanh)', 20, 'kg', 'Sarthebari, Assam', '2026-09-28'],
  ]

  for (const r of requests) {
    insertReq.run(...r)
  }

  console.log('✅ SQLite Database successfully initialized and seeded with artisans, suppliers, materials & requests.')
}

// Allow running directly via CLI: node db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
}
