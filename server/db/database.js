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
      status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'in_transit', 'delivered', 'cancelled')),
      tracking_stage INTEGER DEFAULT 0,
      validity_snapshot DATE,
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
      location TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS otps (
      target TEXT PRIMARY KEY,
      otp TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('phone', 'email')),
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  try {
    db.exec('ALTER TABLE users ADD COLUMN email TEXT;')
  } catch (e) {
    // Column already exists
  }
}

export default db
