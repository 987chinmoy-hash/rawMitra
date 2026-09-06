import bcrypt from 'bcryptjs'
import db, { initDatabase } from './database.js'
import { generateIdentityHash, maskAadhaar } from '../services/fraudService.js'

export function seedDatabase() {
  // Ensure tables and columns exist
  initDatabase()

  // Clean slate for fresh constraints and relations
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

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, experience, rating, reviews_count, onboarding_complete, current_step)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'completed')
  `)

  const defaultArtisanPass = bcrypt.hashSync('password123', 8)

  // 1. Artisans (including user "Partha" and cluster peer artisans)
  const artisans = [
    { id: 'A-PARTHA', name: 'Partha', phone: '9864000000', aadhaar: '888898640000', loc: 'Tezpur, Assam', rating: 4.9, revs: 18 },
    { id: 'A-1001', name: 'Deepa Boro', phone: '9864000001', aadhaar: '888898640001', loc: 'Tezpur, Assam', rating: 4.6, revs: 12 },
    { id: 'A-1002', name: 'Rukmini Das', phone: '9435000002', aadhaar: '888894350002', loc: 'Tezpur, Assam', rating: 4.3, revs: 8 },
    { id: 'A-1003', name: 'Bipul Kalita', phone: '8011000003', aadhaar: '888880110003', loc: 'Tezpur, Assam', rating: 4.8, revs: 20 },
    { id: 'A-1004', name: 'Tarun Rabha', phone: '9706000004', aadhaar: '888897060004', loc: 'Guwahati, Assam', rating: 4.7, revs: 14 },
    { id: 'A-1005', name: 'Anita Deka', phone: '9435000005', aadhaar: '888894350005', loc: 'Guwahati, Assam', rating: 4.9, revs: 26 },
    { id: 'A-1006', name: 'Jatin Gogoi', phone: '9864000006', aadhaar: '888898640006', loc: 'Dibrugarh, Assam', rating: 4.8, revs: 15 },
    { id: 'A-1007', name: 'Manashi Sonowal', phone: '7002000007', aadhaar: '888870020007', loc: 'Dibrugarh, Assam', rating: 4.7, revs: 17 },
    // Tezpur Group Peers
    { id: 'A-TEZ-101', name: 'Bipul Kalita', phone: '9864000101', aadhaar: '888898640101', loc: 'Mission Chariali, Tezpur', rating: 4.8, revs: 14 },
    { id: 'A-TEZ-102', name: 'Deepali Nath', phone: '9864000102', aadhaar: '888898640102', loc: 'Tribeni, Tezpur', rating: 4.7, revs: 9 },
    { id: 'A-TEZ-201', name: 'Pranab Hazarika', phone: '9864000201', aadhaar: '888898640201', loc: 'Mahabhairab, Tezpur', rating: 4.9, revs: 22 },
    { id: 'A-TEZ-301', name: 'Manoranjan Das', phone: '9864000301', aadhaar: '888898640301', loc: 'Panchmile, Tezpur', rating: 4.7, revs: 11 },
    { id: 'A-TEZ-302', name: 'Geeta Saikia', phone: '9864000302', aadhaar: '888898640302', loc: 'Ketekibari, Tezpur', rating: 4.8, revs: 13 },
    { id: 'A-TEZ-303', name: 'Runu Bora', phone: '9864000303', aadhaar: '888898640303', loc: 'Dekargaon, Tezpur', rating: 4.8, revs: 16 },
    // Guwahati Group Peers
    { id: 'A-GAU-101', name: 'Tarun Rabha', phone: '9706000101', aadhaar: '888897060101', loc: 'Panbazar, Guwahati', rating: 4.8, revs: 19 },
    { id: 'A-GAU-102', name: 'Anita Deka', phone: '9706000102', aadhaar: '888897060102', loc: 'Six Mile, Guwahati', rating: 4.9, revs: 24 },
    { id: 'A-GAU-201', name: 'Debajit Bora', phone: '9706000201', aadhaar: '888897060201', loc: 'Beltola, Guwahati', rating: 4.8, revs: 15 },
    { id: 'A-GAU-301', name: 'Moni Kakati', phone: '9706000301', aadhaar: '888897060301', loc: 'Maligaon, Guwahati', rating: 4.7, revs: 12 },
    { id: 'A-GAU-302', name: 'Naren Nath', phone: '9706000302', aadhaar: '888897060302', loc: 'Chandmari, Guwahati', rating: 4.8, revs: 17 },
    { id: 'A-GAU-303', name: 'Minati Saikia', phone: '9706000303', aadhaar: '888897060303', loc: 'Jalukbari, Guwahati', rating: 4.7, revs: 10 },
    // Dibrugarh Group Peers
    { id: 'A-DIB-101', name: 'Jatin Gogoi', phone: '9864000401', aadhaar: '888898640401', loc: 'Chowkidinghee, Dibrugarh', rating: 4.8, revs: 15 },
    { id: 'A-DIB-102', name: 'Manashi Sonowal', phone: '9864000402', aadhaar: '888898640402', loc: 'Mankata Road, Dibrugarh', rating: 4.7, revs: 18 },
    { id: 'A-DIB-201', name: 'Dipankar Chetia', phone: '9864000501', aadhaar: '888898640501', loc: 'Amolapatty, Dibrugarh', rating: 4.9, revs: 21 },
    { id: 'A-DIB-301', name: 'Rupali Borah', phone: '9864000601', aadhaar: '888898640601', loc: 'Graham Bazar, Dibrugarh', rating: 4.8, revs: 14 },
    { id: 'A-DIB-302', name: 'Bikash Baruah', phone: '9864000602', aadhaar: '888898640602', loc: 'Naliapool, Dibrugarh', rating: 4.7, revs: 13 },
    { id: 'A-DIB-303', name: 'Pallabi Moran', phone: '9864000603', aadhaar: '888898640603', loc: 'Boiragimoth, Dibrugarh', rating: 4.8, revs: 16 },
  ]

  for (const a of artisans) {
    insertUser.run(
      a.id,
      'artisan',
      a.name,
      a.phone,
      defaultArtisanPass,
      generateIdentityHash(a.aadhaar),
      maskAadhaar(a.aadhaar),
      a.loc,
      null,
      a.rating,
      a.revs
    )
  }

  // 2. The 9 Dedicated Suppliers (3 per Hub: Tezpur, Guwahati, Dibrugarh)
  // Strict phone & password mapping: 1111111111/11111111 up to 9999999999/99999999
  const suppliers = [
    // TEZPUR (Suppliers 1 - 3)
    {
      id: 'S-TEZ-01',
      name: 'Sonitpur Artisan Depot & Mills',
      phone: '1111111111',
      pass: '11111111',
      aadhaar: '888811110001',
      loc: 'Mission Chariali, Tezpur',
      rating: 4.9,
      revs: 48,
    },
    {
      id: 'S-TEZ-02',
      name: 'Brahmaputra North-Bank Craft Supplies',
      phone: '2222222222',
      pass: '22222222',
      aadhaar: '888822220002',
      loc: 'Mahabhairab, Tezpur',
      rating: 4.8,
      revs: 41,
    },
    {
      id: 'S-TEZ-03',
      name: 'Agnigarh Heritage Raw Materials Guild',
      phone: '3333333333',
      pass: '33333333',
      aadhaar: '888833330003',
      loc: 'Tribeni & Ketekibari, Tezpur',
      rating: 4.7,
      revs: 35,
    },

    // GUWAHATI (Suppliers 4 - 6)
    {
      id: 'S-GAU-01',
      name: 'Kamrup Wholesale Materials Syndicate',
      phone: '4444444444',
      pass: '44444444',
      aadhaar: '888844440004',
      loc: 'Panbazar, Guwahati',
      rating: 4.9,
      revs: 82,
    },
    {
      id: 'S-GAU-02',
      name: 'Brahmaputra Valley Raw Materials Co.',
      phone: '5555555555',
      pass: '55555555',
      aadhaar: '888855550005',
      loc: 'Six Mile & Beltola, Guwahati',
      rating: 4.8,
      revs: 67,
    },
    {
      id: 'S-GAU-03',
      name: 'Pragjyotish Artisans Raw Material Federation',
      phone: '6666666666',
      pass: '66666666',
      aadhaar: '888866660006',
      loc: 'Maligaon, Guwahati',
      rating: 4.7,
      revs: 53,
    },

    // DIBRUGARH (Suppliers 7 - 9)
    {
      id: 'S-DIB-01',
      name: 'Upper Assam Craft Materials Depot',
      phone: '7777777777',
      pass: '77777777',
      aadhaar: '888877770007',
      loc: 'Chowkidinghee, Dibrugarh',
      rating: 4.9,
      revs: 46,
    },
    {
      id: 'S-DIB-02',
      name: 'Eastern Assam Cane & Textile Syndicate',
      phone: '8888888888',
      pass: '88888888',
      aadhaar: '888888880008',
      loc: 'Amolapatty & Mankata, Dibrugarh',
      rating: 4.8,
      revs: 39,
    },
    {
      id: 'S-DIB-03',
      name: 'Brahmaputra Valley Craft Producers Co-op',
      phone: '9999999999',
      pass: '99999999',
      aadhaar: '888899990009',
      loc: 'Graham Bazar & Naliapool, Dibrugarh',
      rating: 4.7,
      revs: 34,
    },
  ]

  for (const s of suppliers) {
    const hashedPass = bcrypt.hashSync(s.pass, 8)
    insertUser.run(
      s.id,
      'supplier',
      s.name,
      s.phone,
      hashedPass,
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
      defaultArtisanPass,
      generateIdentityHash(c.aadhaar),
      maskAadhaar(c.aadhaar),
      'Guwahati, Assam',
      c.exp,
      c.rating,
      c.revs
    )
  }

  // 4. Supplier Materials Catalog
  // Every supplier provides catalog entries for Bamboo, Yarn, Clay, Dyes, Metal, Packaging
  const insertMat = db.prepare(`
    INSERT INTO supplier_materials (id, supplier_id, category, specification, unit, price_per_unit, min_bulk_qty, transport_charge, validity_date, logistics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const s of suppliers) {
    // 1. Bamboo
    insertMat.run(
      `SM-${s.id}-BAM`,
      s.id,
      'Bamboo',
      'Treated Bhaluka bamboo poles, 10ft',
      'piece',
      110,
      25,
      400,
      '2026-09-30',
      'shipment'
    )
    // 2. Yarn
    insertMat.run(
      `SM-${s.id}-YRN`,
      s.id,
      'Yarn',
      'Muga silk yarn, 20/22 denier',
      'kg',
      3100,
      10,
      350,
      '2026-09-30',
      'shipment'
    )
    // 3. Clay
    insertMat.run(
      `SM-${s.id}-CLY`,
      s.id,
      'Clay',
      'Terracotta potting clay, fine grade',
      'kg',
      22,
      50,
      400,
      '2026-09-30',
      'pickup'
    )
    // 4. Dyes
    insertMat.run(
      `SM-${s.id}-DYE`,
      s.id,
      'Dyes',
      'Natural indigo dye powder',
      'kg',
      800,
      5,
      300,
      '2026-09-30',
      'pickup'
    )
    // 5. Metal
    insertMat.run(
      `SM-${s.id}-MTL`,
      s.id,
      'Metal',
      'High-purity Bell metal alloy ingots (Kanh)',
      'kg',
      780,
      20,
      500,
      '2026-09-30',
      'shipment'
    )
    // 6. Packaging materials
    insertMat.run(
      `SM-${s.id}-PKG`,
      s.id,
      'Packaging materials',
      'Corrugated boxes, medium',
      'piece',
      14,
      50,
      300,
      '2026-09-30',
      'shipment'
    )
  }

  // 5. Open Material Demands
  const insertReq = db.prepare(`
    INSERT INTO material_requests (id, artisan_id, category, specification, quantity, unit, location, required_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
  `)

  const requests = [
    ['R-01', 'A-PARTHA', 'Yarn', 'Muga silk yarn, 20/22 denier', 30, 'kg', 'Tezpur, Assam', '2026-09-28'],
    ['R-02', 'A-1001', 'Yarn', 'Muga silk yarn, 20/22 denier', 8, 'kg', 'Tezpur, Assam', '2026-09-20'],
    ['R-03', 'A-1002', 'Yarn', 'Muga silk yarn, 20/22 denier', 6, 'kg', 'Tezpur, Assam', '2026-09-22'],
    ['R-04', 'A-1003', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 20, 'piece', 'Tezpur, Assam', '2026-09-25'],
    ['R-05', 'A-1004', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 25, 'piece', 'Guwahati, Assam', '2026-09-25'],
    ['R-06', 'A-1005', 'Yarn', 'Muga silk yarn, 20/22 denier', 10, 'kg', 'Guwahati, Assam', '2026-09-26'],
    ['R-07', 'A-1006', 'Yarn', 'Muga silk yarn, 20/22 denier', 12, 'kg', 'Dibrugarh, Assam', '2026-09-24'],
    ['R-08', 'A-1007', 'Bamboo', 'Treated Bhaluka bamboo poles, 10ft', 30, 'piece', 'Dibrugarh, Assam', '2026-09-25'],
  ]

  for (const r of requests) {
    insertReq.run(...r)
  }

  console.log('✅ SQLite Database successfully seeded with 9 suppliers, artisans, all materials & open requests.')
}

// Allow running directly via CLI: node server/db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
}
