import bcrypt from 'bcryptjs'
import db, { initDatabase } from './database.js'
import { generateIdentityHash, maskAadhaar } from '../services/fraudService.js'

export function seedDatabase() {
  initDatabase()

  // Clear existing records to ensure fresh idempotent seed
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

  const defaultPassword = 'password123'
  const passwordHash = bcrypt.hashSync(defaultPassword, 8)

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, experience, rating, reviews_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // 1. Seed Artisans
  insertUser.run('A-1001', 'artisan', 'Deepa Boro', '9864000001', passwordHash, generateIdentityHash('123456784821'), maskAadhaar('123456784821'), 'Sualkuchi, Assam', null, 4.6, 12)
  insertUser.run('A-1002', 'artisan', 'Rukmini Das', '9435000002', passwordHash, generateIdentityHash('234567892290'), maskAadhaar('234567892290'), 'Sualkuchi, Assam', null, 4.3, 8)
  insertUser.run('A-1003', 'artisan', 'Bipul Kalita', '8011000003', passwordHash, generateIdentityHash('345678906743'), maskAadhaar('345678906743'), 'Hajo, Assam', null, 4.8, 20)
  insertUser.run('A-1004', 'artisan', 'Tarun Rabha', '9706000004', passwordHash, generateIdentityHash('456789019912'), maskAadhaar('456789019912'), 'Guwahati, Assam', null, 4.7, 14)

  // 2. Seed Suppliers
  insertUser.run('S-2001', 'supplier', 'Brahmaputra Yarn Co.', '9101000011', passwordHash, generateIdentityHash('567890121120'), maskAadhaar('567890121120'), 'Guwahati, Assam', null, 4.7, 34)
  insertUser.run('S-2002', 'supplier', 'Kamrup Textile Supplies', '9954000012', passwordHash, generateIdentityHash('678901235567'), maskAadhaar('678901235567'), 'Sualkuchi, Assam', null, 4.4, 19)
  insertUser.run('S-2003', 'supplier', 'Hajo Clay & Craft Depot', '7002000013', passwordHash, generateIdentityHash('789012349834'), maskAadhaar('789012349834'), 'Hajo, Assam', null, 4.9, 41)
  insertUser.run('S-2004', 'supplier', 'Assam Bamboo & Cane Syndicate', '9435000014', passwordHash, generateIdentityHash('890123458841'), maskAadhaar('890123458841'), 'Guwahati, Assam', null, 4.8, 52)

  // 3. Seed Coordinators
  insertUser.run('C-3001', 'coordinator', 'Manash Sarma', '9678000020', passwordHash, generateIdentityHash('901234563345'), maskAadhaar('901234563345'), null, '6 years in handloom logistics, ex-Assam Apex Weavers Co-op', 4.7, 15)

  // 4. Seed Supplier Materials
  const insertMat = db.prepare(`
    INSERT INTO supplier_materials (id, supplier_id, category, specification, unit, price_per_unit, min_bulk_qty, transport_charge, validity_date, logistics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertMat.run('SM-1', 'S-2001', 'Yarn', 'Muga silk yarn, 20/22 denier', 'kg', 3200, 20, 600, '2026-09-22', 'shipment')
  insertMat.run('SM-2', 'S-2002', 'Yarn', 'Muga silk yarn, 20/22 denier', 'kg', 2950, 15, 350, '2026-09-20', 'pickup')
  insertMat.run('SM-3', 'S-2002', 'Dyes', 'Natural indigo dye powder', 'kg', 850, 5, 350, '2026-09-20', 'pickup')
  insertMat.run('SM-4', 'S-2003', 'Clay', 'Terracotta potting clay, fine grade', 'kg', 22, 100, 500, '2026-09-24', 'shipment')
  insertMat.run('SM-5', 'S-2003', 'Packaging materials', 'Corrugated boxes, medium', 'piece', 14, 50, 500, '2026-09-24', 'shipment')
  insertMat.run('SM-6', 'S-2004', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 'piece', 110, 40, 750, '2026-09-25', 'shipment')

  // 5. Seed Material Requests
  const insertReq = db.prepare(`
    INSERT INTO material_requests (id, artisan_id, category, specification, quantity, unit, location, required_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertReq.run('R-01', 'A-1001', 'Yarn', 'Muga silk yarn, 20/22 denier', 8, 'kg', 'Sualkuchi, Assam', '2026-09-12', 'open')
  insertReq.run('R-02', 'A-1002', 'Yarn', 'Muga silk yarn, 20/22 denier', 6, 'kg', 'Sualkuchi, Assam', '2026-09-14', 'open')
  insertReq.run('R-03', 'A-1004', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 25, 'piece', 'Guwahati, Assam', '2026-09-18', 'open')
  insertReq.run('R-04', 'A-1003', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 20, 'piece', 'Guwahati, Assam', '2026-09-19', 'open')

  // 6. Seed Broadcasts
  const insertBroadcast = db.prepare(`
    INSERT INTO broadcasts (id, artisan_id, category, specification, quantity, unit, location, deadline, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertBroadcast.run('B-101', 'A-1002', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 15, 'piece', 'Sualkuchi, Assam', '2026-09-12', 'Need 2 more artisans to reach 40-pole bulk discount tier with supplier!', 'open')

  console.log('✅ SQLite Database successfully initialized and seeded with demo artisans, suppliers, and requests.')
}

// Allow running directly via CLI: node db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
}
