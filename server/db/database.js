import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, 'rawmitra.db')
const db = new DatabaseSync(DB_PATH)

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;')

export function initDatabase() {
  // Check if legacy orders table has old check constraint
  try {
    const ordersSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'").get()
    if (ordersSchema && ordersSchema.sql && !ordersSchema.sql.includes("'placed'")) {
      db.exec(`
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS penalty_ledger;
        DROP TABLE IF EXISTS order_splits;
        DROP TABLE IF EXISTS orders;
      `)
    }
  } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('artisan', 'supplier', 'coordinator')),
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      identity_hash TEXT UNIQUE NOT NULL,
      aadhar_masked TEXT NOT NULL,
      store_location TEXT,
      experience TEXT,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      is_suspended INTEGER DEFAULT 0,
      onboarding_complete INTEGER DEFAULT 0,
      current_step TEXT DEFAULT 'role_setup',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS supplier_materials (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      specification TEXT NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      min_bulk_qty INTEGER DEFAULT 1,
      transport_charge REAL DEFAULT 500,
      validity_date DATE NOT NULL,
      logistics TEXT NOT NULL CHECK(logistics IN ('shipment', 'pickup', 'none'))
    );

    CREATE TABLE IF NOT EXISTS material_requests (
      id TEXT PRIMARY KEY,
      artisan_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      specification TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      location TEXT NOT NULL,
      required_date DATE NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'grouped', 'fulfilled', 'withdrawn')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      specification TEXT NOT NULL,
      unit TEXT NOT NULL,
      total_quantity REAL NOT NULL,
      supplier_id TEXT NOT NULL REFERENCES users(id),
      coordinator_id TEXT REFERENCES users(id),
      price_per_unit REAL NOT NULL,
      material_total REAL NOT NULL,
      transport_total REAL NOT NULL,
      total_cost REAL NOT NULL,
      status TEXT DEFAULT 'placed' CHECK(status IN ('placed', 'confirmed', 'accepted', 'rejected', 'in_transit', 'delivered', 'cancelled')),
      tracking_stage INTEGER DEFAULT 0,
      validity_snapshot DATE,
      group_name TEXT,
      delivery_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_splits (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      artisan_id TEXT NOT NULL REFERENCES users(id),
      quantity REAL NOT NULL,
      material_cost REAL NOT NULL,
      transport_share REAL NOT NULL,
      total_payable REAL NOT NULL,
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'escrowed', 'released', 'refunded'))
    );

    CREATE TABLE IF NOT EXISTS penalty_ledger (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      penalty_amount REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'settled', 'waived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS broadcasts (
      id TEXT PRIMARY KEY,
      artisan_id TEXT NOT NULL REFERENCES users(id),
      category TEXT NOT NULL,
      specification TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      deadline DATE NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'fulfilled', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      target_id TEXT NOT NULL REFERENCES users(id),
      by_user_id TEXT NOT NULL REFERENCES users(id),
      rating REAL NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // ============================================================
  // DATABASE MIGRATIONS
  // Safely adds columns to existing tables
  // ============================================================

  const userColumns = db.prepare(`PRAGMA table_info(users)`).all()
  const hasOnboardingComplete = userColumns.some(col => col.name === 'onboarding_complete')
  const hasCurrentStep = userColumns.some(col => col.name === 'current_step')

  if (!hasOnboardingComplete) {
    db.exec(`ALTER TABLE users ADD COLUMN onboarding_complete INTEGER DEFAULT 0`)
  }
  if (!hasCurrentStep) {
    db.exec(`ALTER TABLE users ADD COLUMN current_step TEXT DEFAULT 'role_setup'`)
  }

  const orderColumns = db.prepare(`PRAGMA table_info(orders)`).all()
  const hasGroupName = orderColumns.some(col => col.name === 'group_name')
  const hasDeliveryLocation = orderColumns.some(col => col.name === 'delivery_location')

  if (!hasGroupName) {
    try { db.exec(`ALTER TABLE orders ADD COLUMN group_name TEXT`) } catch (e) {}
  }
  if (!hasDeliveryLocation) {
    try { db.exec(`ALTER TABLE orders ADD COLUMN delivery_location TEXT`) } catch (e) {}
  }
}

export default db
