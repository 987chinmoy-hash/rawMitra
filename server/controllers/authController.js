import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db/database.js'
import { JWT_SECRET } from '../middleware/auth.js'
import { generateIdentityHash, maskAadhaar, checkDuplicateIdentity } from '../services/fraudService.js'

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function cleanPhone(raw) {
  if (!raw) return ''
  let digits = raw.toString().replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length > 10) digits = digits.slice(-10)
  return digits
}

export function register(req, res) {
  try {
    const { role, name, phone: rawPhone, password, aadhar, storeLocation, experience } = req.body

    if (!role || !['artisan', 'supplier', 'coordinator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid or missing role.' })
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' })
    }

    const phone = cleanPhone(rawPhone)
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number required.' })
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' })
    }
    if (!aadhar || !/^\d{12}$/.test(aadhar.toString().replace(/\s+/g, '').trim())) {
      return res.status(400).json({ error: 'Valid 12-digit Aadhaar number required for identity verification.' })
    }

    // 1. Check duplicate phone
    const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)
    if (existingPhone) {
      return res.status(409).json({ error: 'This phone number is already registered. Please log in.' })
    }

    // 2. Fraud Prevention: Anti-Duplicate Identity check via cryptographic hash
    const identityHash = generateIdentityHash(aadhar)
    const duplicateIdentity = checkDuplicateIdentity(db, identityHash)
    if (duplicateIdentity) {
      return res.status(409).json({
        error: 'Fraud Alert: This identity (Aadhaar) is already registered under an existing account.',
        code: 'DUPLICATE_IDENTITY_DETECTED',
      })
    }

    // 3. Hash password and generate user
    const prefix = role === 'artisan' ? 'A' : role === 'supplier' ? 'S' : 'C'
    const id = genId(prefix)
    const passwordHash = bcrypt.hashSync(password, 8)
    const aadharMasked = maskAadhaar(aadhar)

    db.prepare(`
      INSERT INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, role, name.trim(), phone, passwordHash, identityHash, aadharMasked, storeLocation?.trim() || null, experience?.trim() || null)

    const user = {
      id,
      role,
      name: name.trim(),
      phone,
      aadhar_masked: aadharMasked,
      storeLocation: storeLocation?.trim() || null,
      experience: experience?.trim() || null,
      rating: 5.0,
      reviews_count: 0,
    }

    const token = jwt.sign({ id, role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

    return res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: err.message || 'Registration failed.' })
  }
}

export function login(req, res) {
  try {
    const { phone: rawPhone, password } = req.body

    if (!rawPhone) {
      return res.status(400).json({ error: 'Mobile phone number required.' })
    }

    const phone = cleanPhone(rawPhone)
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' })
    }

    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)

    // Demo Mode Auto-Provisioning:
    // In demo mode, if an unregistered phone number attempts login, automatically create an Artisan account
    if (!user) {
      const id = genId('A')
      const pass = password || 'password123'
      const passHash = bcrypt.hashSync(pass, 8)
      const demoAadhaar = `8888${phone.slice(-8)}`
      const idHash = generateIdentityHash(demoAadhaar)
      const masked = maskAadhaar(demoAadhaar)

      db.prepare(`
        INSERT INTO users (id, role, name, phone, password_hash, identity_hash, aadhar_masked, store_location, rating, reviews_count)
        VALUES (?, 'artisan', ?, ?, ?, ?, ?, 'Assam', 5.0, 0)
      `).run(id, `Demo Artisan (${phone.slice(-4)})`, phone, passHash, idHash, masked)

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    } else {
      // Check password (accept match or universal demo password)
      if (password && user.password_hash) {
        const isMatch = bcrypt.compareSync(password, user.password_hash) || password === 'password123'
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect password. Try "password123" for demo accounts.' })
        }
      }
    }

    if (user.is_suspended) {
      return res.status(403).json({
        error: 'Account is suspended due to outstanding order cancellation penalty violations.',
        suspended: true,
      })
    }

    const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

    const safeUser = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      aadhar_masked: user.aadhar_masked,
      storeLocation: user.store_location,
      experience: user.experience,
      rating: user.rating,
      reviews_count: user.reviews_count,
    }

    return res.json({ token, user: safeUser, message: 'Logged in successfully.' })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed: ' + (err.message || 'Server error') })
  }
}

export function me(req, res) {
  return res.json({ user: req.user })
}

export function bootstrap(req, res) {
  try {
    const users = db.prepare('SELECT id, role, name, phone, aadhar_masked, store_location, experience, rating, reviews_count FROM users').all()
    const suppliers = users.filter((u) => u.role === 'supplier').map((s) => {
      const materials = db.prepare('SELECT * FROM supplier_materials WHERE supplier_id = ?').all(s.id).map(m => ({
        category: m.category,
        specification: m.specification,
        unit: m.unit,
        pricePerUnit: m.price_per_unit,
        minBulkQty: m.min_bulk_qty,
        transportCharge: m.transport_charge,
        validity: m.validity_date,
        logistics: m.logistics,
      }))
      return {
        id: s.id,
        name: s.name,
        aadhar: s.aadhar_masked,
        storeLocation: s.store_location,
        phone: s.phone,
        rating: s.rating,
        reviews: s.reviews_count,
        logistics: materials[0]?.logistics || 'shipment',
        transportCharge: materials[0]?.transportCharge || 500,
        validity: materials[0]?.validity || '2026-09-25',
        materials,
      }
    })

    const artisans = users.filter((u) => u.role === 'artisan').map((a) => ({
      id: a.id,
      name: a.name,
      aadhar: a.aadhar_masked,
      storeLocation: a.store_location,
      phone: a.phone,
      rating: a.rating,
      reviews: a.reviews_count,
    }))

    const coordinators = users.filter((u) => u.role === 'coordinator').map((c) => ({
      id: c.id,
      name: c.name,
      aadhar: c.aadhar_masked,
      phone: c.phone,
      experience: c.experience,
      rating: c.rating,
      reviews: c.reviews_count,
    }))

    const materialRequests = db.prepare(`
      SELECT id, artisan_id as artisanId, category, specification, quantity, unit, location, required_date as requiredDate, status
      FROM material_requests
      WHERE status = 'open'
    `).all()

    const ordersRaw = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
    const orders = ordersRaw.map((o) => {
      const splits = db.prepare(`
        SELECT artisan_id as artisanId, quantity, material_cost as materialCost, transport_share as transportShare, total_payable as totalCost
        FROM order_splits
        WHERE order_id = ?
      `).all(o.id)
      const supplier = suppliers.find((s) => s.id === o.supplier_id)
      return {
        id: o.id,
        category: o.category,
        specification: o.specification,
        unit: o.unit,
        totalQuantity: o.total_quantity,
        supplierId: o.supplier_id,
        supplierName: supplier?.name || o.supplier_id,
        coordinatorId: o.coordinator_id,
        pricePerUnit: o.price_per_unit,
        materialTotal: o.material_total,
        transportTotal: o.transport_total,
        totalCost: o.total_cost,
        status: o.status,
        trackingStage: o.tracking_stage,
        validity: o.validity_snapshot,
        perArtisan: splits,
      }
    })

    const broadcasts = db.prepare(`
      SELECT b.id, b.artisan_id as artisanId, u.name as artisanName, b.category, b.specification, b.quantity, b.unit, b.location, b.deadline, b.notes, b.status
      FROM broadcasts b
      LEFT JOIN users u ON u.id = b.artisan_id
      WHERE b.status = 'open'
    `).all()

    const penalties = db.prepare('SELECT * FROM penalty_ledger ORDER BY created_at DESC').all()

    return res.json({
      artisans,
      suppliers,
      coordinators,
      materialRequests,
      orders,
      broadcasts,
      penalties,
    })
  } catch (err) {
    console.error('Bootstrap error:', err)
    return res.status(500).json({ error: 'Failed to retrieve database state.' })
  }
}

export function sendOtp(req, res) {
  try {
    const { target: rawTarget, type = 'phone' } = req.body
    if (!rawTarget) {
      return res.status(400).json({ error: 'Target phone or email is required.' })
    }

    const cleanTarget = type === 'phone' ? cleanPhone(rawTarget) : rawTarget.trim().toLowerCase()
    if (type === 'phone' && cleanTarget.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' })
    }
    if (type === 'email' && !cleanTarget.includes('@')) {
      return res.status(400).json({ error: 'Enter a valid email address.' })
    }

    // Generate realistic 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    db.prepare(`
      INSERT INTO otps (target, otp, type, expires_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(target) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at, created_at = CURRENT_TIMESTAMP
    `).run(cleanTarget, otp, type, expiresAt)

    let existingUser = null
    if (type === 'phone') {
      existingUser = db.prepare('SELECT id, name, role FROM users WHERE phone = ?').get(cleanTarget)
    } else {
      existingUser = db.prepare('SELECT id, name, role FROM users WHERE email = ?').get(cleanTarget)
    }

    return res.json({
      success: true,
      message: `OTP sent to ${cleanTarget}`,
      target: cleanTarget,
      type,
      demoOtp: otp,
      isExisting: Boolean(existingUser),
      user: existingUser || null,
    })
  } catch (err) {
    console.error('Send OTP error:', err)
    return res.status(500).json({ error: 'Failed to dispatch OTP.' })
  }
}

export function verifyOtp(req, res) {
  try {
    const { target: rawTarget, otp, role = 'artisan', name, aadhar, locationOrExp } = req.body
    if (!rawTarget || !otp) {
      return res.status(400).json({ error: 'Target and OTP are required.' })
    }

    const isEmail = rawTarget.toString().includes('@')
    const cleanTarget = isEmail ? rawTarget.trim().toLowerCase() : cleanPhone(rawTarget)

    const storedOtp = db.prepare('SELECT * FROM otps WHERE target = ?').get(cleanTarget)
    
    // In demo mode: accept either exact stored OTP OR standard demo OTP '4821' or '1234' or any 4 digits
    const isValidOtp = (storedOtp && storedOtp.otp === otp.trim()) || otp.trim() === '4821' || otp.trim() === '1234' || (otp.trim().length === 4 && /^\d{4}$/.test(otp.trim()))
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' })
    }

    let user = null
    if (isEmail) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanTarget)
    } else {
      user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanTarget)
    }

    if (!user) {
      const defaultName = name?.trim() || (isEmail ? cleanTarget.split('@')[0] : `Artisan ${cleanTarget.slice(-4)}`)
      const prefix = role === 'artisan' ? 'A' : role === 'supplier' ? 'S' : 'C'
      const id = genId(prefix)
      const aadharDigits = (aadhar && aadhar.replace(/\D/g, '').length === 12) ? aadhar.replace(/\D/g, '') : `12345678${Math.floor(1000 + Math.random() * 9000)}`
      const identityHash = generateIdentityHash(aadharDigits)
      const masked = maskAadhaar(aadharDigits)
      const passwordHash = bcrypt.hashSync('demo_otp_login', 8)
      const phone = isEmail ? `9864${Math.floor(100000 + Math.random() * 900000)}` : cleanTarget
      const email = isEmail ? cleanTarget : null

      db.prepare(`
        INSERT INTO users (id, role, name, phone, email, password_hash, identity_hash, aadhar_masked, store_location, experience, rating, reviews_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1)
      `).run(
        id,
        role,
        defaultName,
        phone,
        email,
        passwordHash,
        identityHash,
        masked,
        role !== 'coordinator' ? (locationOrExp || 'Sualkuchi, Assam') : null,
        role === 'coordinator' ? (locationOrExp || 'Handloom and craft logistics coordinator') : null
      )

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    db.prepare('DELETE FROM otps WHERE target = ?').run(cleanTarget)

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        phone: user.phone,
        email: user.email,
        aadhar_masked: user.aadhar_masked,
        storeLocation: user.store_location,
        experience: user.experience,
        rating: user.rating,
        reviewsCount: user.reviews_count,
        isSuspended: Boolean(user.is_suspended),
      },
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ error: 'Failed to verify OTP and authenticate.' })
  }
}

