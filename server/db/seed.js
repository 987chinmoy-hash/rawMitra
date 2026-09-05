import bcrypt from 'bcryptjs'
import db, { initDatabase } from './database.js'

export function seedDatabase() {
  initDatabase()

  // Clear existing records to ensure a fresh, empty database
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

  console.log('✅ SQLite Database successfully initialized and reset to a clean slate.')
}

// Allow running directly via CLI: node db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
}
