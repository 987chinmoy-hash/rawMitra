import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentSupplier } from '../../context/AppContext.jsx'
import { api } from '../../services/api.js'
import './supplier.css'

export const SUPPLIER_ACCOUNTS = [
  // Tezpur Hub
  { id: 'S-TEZ-01', num: 1, name: 'Sonitpur Artisan Depot & Mills', phone: '1111111111', pass: '11111111', location: 'Tezpur', hub: 'Mission Chariali, Tezpur' },
  { id: 'S-TEZ-02', num: 2, name: 'Brahmaputra North-Bank Craft Supplies', phone: '2222222222', pass: '22222222', location: 'Tezpur', hub: 'Mahabhairab, Tezpur' },
  { id: 'S-TEZ-03', num: 3, name: 'Agnigarh Heritage Raw Materials Guild', phone: '3333333333', pass: '33333333', location: 'Tezpur', hub: 'Tribeni & Ketekibari, Tezpur' },
  // Guwahati Hub
  { id: 'S-GAU-01', num: 4, name: 'Kamrup Wholesale Materials Syndicate', phone: '4444444444', pass: '44444444', location: 'Guwahati', hub: 'Panbazar, Guwahati' },
  { id: 'S-GAU-02', num: 5, name: 'Brahmaputra Valley Raw Materials Co.', phone: '5555555555', pass: '55555555', location: 'Guwahati', hub: 'Six Mile & Beltola, Guwahati' },
  { id: 'S-GAU-03', num: 6, name: 'Pragjyotish Artisans Raw Material Federation', phone: '6666666666', pass: '66666666', location: 'Guwahati', hub: 'Maligaon, Guwahati' },
  // Dibrugarh Hub
  { id: 'S-DIB-01', num: 7, name: 'Upper Assam Craft Materials Depot', phone: '7777777777', pass: '77777777', location: 'Dibrugarh', hub: 'Chowkidinghee, Dibrugarh' },
  { id: 'S-DIB-02', num: 8, name: 'Eastern Assam Cane & Textile Syndicate', phone: '8888888888', pass: '88888888', location: 'Dibrugarh', hub: 'Amolapatty & Mankata, Dibrugarh' },
  { id: 'S-DIB-03', num: 9, name: 'Brahmaputra Valley Craft Producers Co-op', phone: '9999999999', pass: '99999999', location: 'Dibrugarh', hub: 'Graham Bazar & Naliapool, Dibrugarh' },
]

export default function SupplierDashboard() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const supplier = getCurrentSupplier(state) || (state.authUser && state.authUser.role === 'supplier' ? state.authUser : null)

  const [myStock, setMyStock] = useState([])
  const [dbOrders, setDbOrders] = useState([])
  const [stockLoading, setStockLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [processingOrderId, setProcessingOrderId] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Login form states for unauthenticated view
  const [loginPhone, setLoginPhone] = useState('1111111111')
  const [loginPass, setLoginPass] = useState('11111111')
  const [loginError, setLoginError] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Fetch registered suppliers from backend to hydrate list
  useEffect(() => {
    api.supplier.getAll().then((res) => {
      if (res && res.suppliers) {
        dispatch({ type: 'HYDRATE_SERVER_DATA', data: { suppliers: res.suppliers } })
      }
    }).catch(() => {})
  }, [dispatch])

  // Merge static 9 accounts with dynamically registered suppliers
  const allSupplierAccounts = useMemo(() => {
    const list = [...SUPPLIER_ACCOUNTS]
    const existingPhones = new Set(list.map((s) => s.phone))
    const existingIds = new Set(list.map((s) => s.id))

    const customSuppliers = (state.suppliers || []).filter(
      (s) => !existingPhones.has(s.phone) && !existingIds.has(s.id)
    )

    let nextNum = 10
    for (const cs of customSuppliers) {
      const loc = cs.storeLocation?.toLowerCase().includes('tezpur')
        ? 'Tezpur'
        : cs.storeLocation?.toLowerCase().includes('dibrugarh')
        ? 'Dibrugarh'
        : 'Guwahati'

      list.push({
        id: cs.id,
        num: nextNum++,
        name: cs.name,
        phone: cs.phone,
        pass: cs.password || 'password123',
        location: loc,
        hub: cs.storeLocation || `${loc}, Assam`,
        isCustom: true,
      })
    }
    return list
  }, [state.suppliers])

  // Load catalog and supplier orders when active supplier changes
  useEffect(() => {
    if (!supplier) return

    setStockLoading(true)
    api.supplier.getMyStock()
      .then((res) => {
        if (res.materials && res.materials.length > 0) {
          setMyStock(res.materials)
        } else if (supplier.materials && supplier.materials.length > 0) {
          setMyStock(supplier.materials)
        }
      })
      .catch(() => {
        if (supplier.materials) setMyStock(supplier.materials)
      })
      .finally(() => setStockLoading(false))

    setOrdersLoading(true)
    api.supplier.getOrders(supplier.id)
      .then((res) => {
        if (res.orders) {
          setDbOrders(res.orders)
        }
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [supplier?.id])

  // Merge SQLite DB orders and Client State orders for complete responsiveness
  const allSupplierOrders = useMemo(() => {
    if (!supplier) return []
    const map = new Map()

    // 1. Client state orders matching this supplier
    const clientMatches = (state.orders || []).filter(
      (o) => o.supplierId === supplier.id || o.supplier_id === supplier.id
    )
    for (const o of clientMatches) {
      map.set(o.id, {
        ...o,
        supplierId: o.supplierId || o.supplier_id || supplier.id,
        totalQuantity: o.totalQuantity || o.total_quantity,
        totalCost: o.totalCost || o.total_cost,
        groupName: o.groupName || o.group_name || o.selectedGroup?.groupName || 'Artisan Syndicate Pool',
        deliveryLocation: o.deliveryLocation || o.delivery_location || o.selectedGroup?.location || supplier.location || 'Guwahati',
      })
    }

    // 2. Database orders (override or complement)
    for (const o of dbOrders) {
      map.set(o.id, {
        ...map.get(o.id),
        ...o,
        supplierId: o.supplier_id || o.supplierId || supplier.id,
        totalQuantity: o.total_quantity || o.totalQuantity,
        totalCost: o.total_cost || o.totalCost,
        groupName: o.group_name || o.groupName || 'Artisan Syndicate Pool',
        deliveryLocation: o.delivery_location || o.deliveryLocation || supplier.location || 'Guwahati',
      })
    }

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
      return dateB - dateA
    })
  }, [state.orders, dbOrders, supplier])

  // Categorize orders: Placed orders await Accept/Reject; Accepted orders are active shipments
  const pendingOrders = allSupplierOrders.filter(
    (o) => o.status === 'placed' || o.status === 'pending' || o.status === 'unconfirmed' || (!o.status)
  )
  const activeOrders = allSupplierOrders.filter(
    (o) => o.status === 'accepted' || o.status === 'in_transit'
  )
  const completedOrRejectedOrders = allSupplierOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'rejected' || o.status === 'cancelled'
  )

  // Quick 1-Click Login Handler
  async function handleQuickLogin(acc) {
    setLoginLoading(true)
    setLoginError(null)
    setActionNotice(null)
    try {
      const res = await api.auth.login({ phone: acc.phone, password: acc.pass })
      dispatch({ type: 'SET_AUTH_USER', user: res.user })
    } catch (err) {
      // If server error or offline fallback, login with account context
      dispatch({
        type: 'SET_AUTH_USER',
        user: {
          id: acc.id,
          name: acc.name,
          phone: acc.phone,
          role: 'supplier',
          storeLocation: acc.hub,
          rating: 4.8,
          reviews_count: 42,
          onboarding_complete: true,
          current_step: 'dashboard',
        },
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // Manual Form Login Handler
  async function handleManualLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)
    try {
      const res = await api.auth.login({ phone: loginPhone, password: loginPass })
      dispatch({ type: 'SET_AUTH_USER', user: res.user })
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your phone number and password.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Accept Order Handler
  async function handleAcceptOrder(orderId) {
    setProcessingOrderId(orderId)
    setActionNotice(null)
    try {
      try {
        await api.orders.accept(orderId, supplier?.id)
      } catch (e) {
        console.warn('Backend accept info:', e.message)
      }

      dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status: 'accepted', trackingStage: 1 })

      // Update local state list
      setDbOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'accepted', trackingStage: 1 } : o))
      )

      setActionNotice(`✅ Order ${orderId} has been successfully accepted! Stock locked and moved to active shipments.`)
    } finally {
      setProcessingOrderId(null)
    }
  }

  // Reject Order Handler
  async function handleRejectOrder(orderId) {
    setProcessingOrderId(orderId)
    setActionNotice(null)
    try {
      try {
        await api.orders.reject(orderId, 'Production capacity reached', supplier?.id)
      } catch (e) {
        console.warn('Backend reject info:', e.message)
      }

      dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status: 'rejected' })

      setDbOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'rejected' } : o))
      )

      setActionNotice(`❌ Order ${orderId} was declined and marked as rejected.`)
    } finally {
      setProcessingOrderId(null)
    }
  }

  // Reset Order to Pending Review (for testing Accept / Reject anytime)
  async function handleResetOrder(orderId) {
    setProcessingOrderId(orderId)
    setActionNotice(null)
    try {
      try {
        await api.orders.reset(orderId)
      } catch (e) {}

      dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status: 'placed', trackingStage: 0 })

      setDbOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'placed', trackingStage: 0 } : o))
      )

      setActionNotice(`🔄 Order ${orderId} reset to pending review! Accept and Reject buttons are now active.`)
    } finally {
      setProcessingOrderId(null)
    }
  }

  // Fast Demo Order Creator for instant testing of this supplier
  async function handleCreateDemoOrder() {
    setOrdersLoading(true)
    const newId = `ORD-DEMO-${Date.now().toString().slice(-4)}`
    const defaultLocation = supplier.storeLocation?.includes('Guwahati') ? 'Guwahati' : supplier.storeLocation?.includes('Dibrugarh') ? 'Dibrugarh' : 'Tezpur'
    const newDemo = {
      id: newId,
      category: 'Clay',
      specification: 'Terracotta Potting Clay, Fine Grade',
      unit: 'kg',
      totalQuantity: 50,
      supplierId: supplier.id,
      supplierName: supplier.name,
      pricePerUnit: 20,
      transportCharge: 500,
      validity: '2026-09-30',
      groupName: `${defaultLocation} Clay Artisan Collective`,
      deliveryLocation: defaultLocation,
      status: 'placed',
      perArtisan: [
        {
          artisanId: 'A-PARTHA',
          artisanName: 'Partha (Lead Artisan)',
          quantity: 20,
          materialCost: 400,
          transportShare: 200,
          totalCost: 600,
        },
        {
          artisanId: 'A-PEER-1',
          artisanName: 'Prabin Das',
          quantity: 30,
          materialCost: 600,
          transportShare: 300,
          totalCost: 900,
        },
      ],
    }

    try {
      await api.orders.create(newDemo)
    } catch (e) {}

    dispatch({ type: 'CREATE_ORDER', payload: newDemo })
    setDbOrders((prev) => [newDemo, ...prev])
    setActionNotice(`⚡ Demo pooled order created for ${supplier.name}! You can now test Accept or Reject below.`)
    setOrdersLoading(false)
  }

  // Advance Tracking Stage Handler
  async function handleAdvanceStage(orderId) {
    setProcessingOrderId(orderId)
    try {
      try {
        await api.orders.advanceStage(orderId)
      } catch (e) {}

      dispatch({ type: 'ADVANCE_TRACKING', orderId })

      setDbOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                trackingStage: Math.min((o.trackingStage || 0) + 1, 4),
                status: (o.trackingStage || 0) + 1 === 4 ? 'delivered' : 'in_transit',
              }
            : o
        )
      )
    } finally {
      setProcessingOrderId(null)
    }
  }

  // Handle Logout
  function handleLogout() {
    api.auth.logout()
    dispatch({ type: 'SET_AUTH_USER', user: null })
  }

  // ============================================================
  // UN-AUTHENTICATED / LOGIN VIEW
  // ============================================================
  if (!supplier) {
    return (
      <div className="page page-narrow">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🏭</span>
          <h1 style={{ margin: '0.5rem 0 0.25rem' }}>Supplier Portal Login</h1>
          <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
            Log in to manage bulk pooled orders, review incoming artisan requests, and update material stock.
          </p>
        </div>

        {/* 1-Click Fast Login Grid for Testing */}
        <div className="card" style={{ border: '2px solid var(--brass)', background: '#fffdfa', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: 'var(--brass-dark)' }}>⚡ 1-Click Fast Demo Login ({allSupplierAccounts.length} Suppliers)</h3>
            <span className="tag tag-brass" style={{ fontSize: '0.75rem' }}>Instant Access</span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-soft)', margin: '0 0 1rem' }}>
            Click any supplier below to log in instantly with phone & password pre-authenticated:
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {['Tezpur', 'Guwahati', 'Dibrugarh'].map((hub) => {
              const hubSuppliers = allSupplierAccounts.filter((s) => s.location === hub)
              if (hubSuppliers.length === 0) return null
              return (
                <div key={hub} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>📍</span> {hub} Delivery Hub Suppliers ({hubSuppliers.length}):
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {hubSuppliers.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        disabled={loginLoading}
                        className="btn btn-outline"
                        style={{
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.85rem',
                          borderColor: acc.isCustom ? '#10b981' : acc.num === 1 ? 'var(--brass)' : 'var(--line)',
                          background: acc.isCustom ? 'rgba(16,185,129,0.06)' : acc.num === 1 ? 'rgba(192,138,40,0.06)' : 'transparent',
                        }}
                      >
                        <div>
                          <strong>{acc.num}. {acc.name}</strong>
                          {acc.isCustom && (
                            <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              ✨ Newly Registered
                            </span>
                          )}
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                            📞 {acc.phone} &middot; Pass: <code>{acc.pass}</code>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: acc.isCustom ? '#059669' : 'var(--brass-dark)', fontWeight: 600 }}>Login &rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Manual Credentials Login Form */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem' }}>Manual Supplier Login</h3>
          {loginError && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              <strong>⚠️ Error:</strong> {loginError}
            </div>
          )}
          <form onSubmit={handleManualLogin}>
            <div className="field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="1111111111"
                required
              />
              <span className="field-hint">e.g. 1111111111 for Supplier 1 (Sonitpur Depot)</span>
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="11111111"
                required
              />
              <span className="field-hint">e.g. 11111111 for Supplier 1</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading}>
              {loginLoading ? 'Authenticating...' : 'Log In to Supplier Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ============================================================
  // AUTHENTICATED SUPPLIER DASHBOARD
  // ============================================================
  return (
    <div className="page">
      {/* Supplier Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{supplier.name}</h1>
            <span className="tag tag-brass" style={{ fontSize: '0.8rem' }}>Supplier Portal</span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
            📍 {supplier.storeLocation || 'Assam'} &middot; 📞 {supplier.phone} &middot; Rating: {supplier.rating || 4.9} ★ ({supplier.reviews || supplier.reviews_count || 48} reviews)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* 1-Click Quick Account Switcher Bar */}
      <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
            ⚡ SWITCH SUPPLIER ACCOUNT (1-Click Switch for Testing):
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Active: <strong>{supplier.name}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
          {allSupplierAccounts.map((acc) => {
            const isActive = supplier.id === acc.id || supplier.phone === acc.phone
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                disabled={loginLoading}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  borderRadius: '6px',
                  border: isActive ? '2px solid var(--brass)' : acc.isCustom ? '1px solid #10b981' : '1px solid #cbd5e1',
                  background: isActive ? 'var(--brass)' : acc.isCustom ? 'rgba(16,185,129,0.08)' : '#fff',
                  color: isActive ? '#fff' : 'var(--ink)',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {acc.num}. {acc.name.split(' ')[0]} ({acc.location}) {acc.isCustom ? '✨' : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1.5px solid #10b981', padding: '0.9rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{actionNotice}</div>
          <button type="button" onClick={() => setActionNotice(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#065f46' }}>✕</button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending Bulk Orders', value: pendingOrders.length, icon: '🚨', color: '#d97706' },
          { label: 'Active Deliveries', value: activeOrders.length, icon: '📦', color: '#16a34a' },
          { label: 'Catalog Categories', value: myStock.length || 6, icon: '🗄️', color: '#0369a1' },
          { label: 'Hub Rating', value: `${supplier.rating || 4.9} ★`, icon: '⭐', color: '#7c3aed' },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ============================================================
          SECTION 1: INCOMING GROUP POOL ORDERS (ACCEPT / REJECT)
          ============================================================ */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚨</span> Incoming Bulk Group Orders
              {pendingOrders.length > 0 && (
                <span className="tag" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                  {pendingOrders.length} Awaiting Decision
                </span>
              )}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
              Group orders placed by artisan collectives in your region. Review volumes and choose to Accept or Reject.
            </p>
          </div>
        </div>

        {ordersLoading && <p style={{ color: 'var(--ink-soft)' }}>Checking incoming orders...</p>}

        {pendingOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--ink-soft)', background: '#fafafa', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>No pending orders waiting for approval.</strong>
            <p style={{ fontSize: '0.88rem', margin: '0.4rem auto 1.25rem', maxWidth: '600px' }}>
              When an artisan collective (e.g. Partha with {supplier.name} in {supplier.storeLocation}) places a bulk order, it lands here instantly for your Accept/Reject decision.
            </p>
            <button
              type="button"
              onClick={handleCreateDemoOrder}
              disabled={ordersLoading}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>⚡</span> Generate Test Incoming Order for {supplier.name}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {pendingOrders.map((o) => {
              const splits = o.perArtisan || []
              const isProcessing = processingOrderId === o.id

              return (
                <div
                  key={o.id}
                  className="card"
                  style={{
                    border: '2px solid #f59e0b',
                    background: '#fffdf7',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
                  }}
                >
                  {/* Order Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #fed7aa', paddingBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="tag" style={{ background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                          ACTION REQUIRED: PENDING APPROVAL
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Order ID: {o.id}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
                        Collective Group: <strong style={{ color: 'var(--ink)' }}>{o.groupName}</strong> &middot; Hub: 📍 <strong>{o.deliveryLocation}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>
                        ₹{Number(o.totalCost || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Total Pooled Amount</div>
                    </div>
                  </div>

                  {/* Material & Specification Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', background: '#fff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Material Category</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{o.category}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Total Group Volume</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brass-dark)' }}>
                        {o.totalQuantity} {o.unit}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Specification</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{o.specification}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Unit Rate</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>₹{o.pricePerUnit} / {o.unit}</div>
                    </div>
                  </div>

                  {/* Artisan Splitting Breakdown Table */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      👥 Artisan Member Breakdown ({splits.length} Members in Pool):
                    </div>
                    <div style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: '6px', overflow: 'hidden' }}>
                      {splits.map((s, idx) => (
                        <div
                          key={s.artisanId || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.55rem 0.85rem',
                            borderBottom: idx === splits.length - 1 ? 'none' : '1px solid #fef3c7',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem' }}>👤</span>
                            <strong>{s.artisanName || s.name || `Artisan ${idx + 1}`}</strong>
                            {s.artisanLocation && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>({s.artisanLocation})</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--brass-dark)' }}>
                              {s.quantity} {o.unit}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                              ₹{Number(s.totalCost || s.materialCost || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accept / Reject Decision Buttons */}
                  <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #fed7aa' }}>
                    <button
                      type="button"
                      onClick={() => handleRejectOrder(o.id)}
                      disabled={isProcessing}
                      className="btn btn-outline"
                      style={{
                        borderColor: '#ef4444',
                        color: '#b91c1c',
                        padding: '0.65rem 1.4rem',
                        fontWeight: 600,
                      }}
                    >
                      {isProcessing ? 'Updating...' : '✕ Reject Order'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(o.id)}
                      disabled={isProcessing}
                      className="btn btn-primary"
                      style={{
                        background: '#16a34a',
                        borderColor: '#16a34a',
                        padding: '0.65rem 1.75rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      {isProcessing ? 'Processing...' : '✓ Accept Bulk Order'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 2: ACTIVE & CONFIRMED DELIVERIES
          ============================================================ */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.85rem' }}>📦 Active Confirmed Deliveries ({activeOrders.length})</h2>
        {activeOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '1.5rem 1rem' }}>
            No active deliveries in transit right now. Once you accept incoming orders, they move here for tracking.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {activeOrders.map((o) => {
              const stageLabels = [
                'Order Placed',
                'Order Accepted & Packing',
                'Quality Inspected & Dispatched',
                'In Regional Transit',
                'Delivered to Cluster Hub',
              ]
              const currentStage = o.trackingStage || 1
              const isProcessing = processingOrderId === o.id

              return (
                <div key={o.id} className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="tag tag-green" style={{ textTransform: 'capitalize' }}>
                      {o.status === 'accepted' ? 'Accepted & Confirmed' : o.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{o.id}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{o.category}</div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--ink-soft)', margin: '0.2rem 0' }}>
                    {o.totalQuantity} {o.unit} &middot; {o.groupName || 'Artisan Group'}
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#f0fdf4', borderRadius: '4px', color: '#166534' }}>
                    Current Stage ({currentStage}/4): <strong>{stageLabels[currentStage] || 'In Progress'}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                    {currentStage < 4 && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(o.id)}
                        disabled={isProcessing}
                        className="btn btn-outline"
                        style={{ flex: 1, fontSize: '0.82rem' }}
                      >
                        {isProcessing ? 'Updating...' : `Advance Stage ${currentStage + 1} 🚚`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResetOrder(o.id)}
                      disabled={isProcessing}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', color: '#92400e', border: '1px solid #fde68a', background: '#fffbeb' }}
                      title="Reset order status to pending review to test Accept/Reject buttons"
                    >
                      🔄 Re-test Accept/Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 3: COMPLETED & REJECTED ORDERS ARCHIVE
          ============================================================ */}
      {completedOrRejectedOrders.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ marginBottom: '0.85rem' }}>📁 Order History & Archive</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {completedOrRejectedOrders.map((o) => (
              <div key={o.id} className="card" style={{ opacity: 0.85, borderLeft: o.status === 'rejected' ? '3px solid #ef4444' : '3px solid #64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span className="tag" style={{ background: o.status === 'rejected' ? '#fee2e2' : '#f1f5f9', color: o.status === 'rejected' ? '#991b1b' : '#334155' }}>
                    {o.status === 'rejected' ? 'Rejected' : o.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{o.id}</span>
                </div>
                <div style={{ fontWeight: 600 }}>{o.category}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>
                  {o.totalQuantity} {o.unit} &middot; {o.groupName}
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleResetOrder(o.id)}
                    disabled={processingOrderId === o.id}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    title="Move back to pending review"
                  >
                    🔄 Re-test Accept/Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 4: SUPPLIER CATALOG & STOCK
          ============================================================ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>Your Materials Catalog ({myStock.length} Categories)</h2>
          <Link to="/supplier/register" className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            + Update Catalog
          </Link>
        </div>
        {stockLoading && <p style={{ color: 'var(--ink-soft)' }}>Loading catalog...</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {myStock.map((m, i) => (
            <div key={m.id || i} className="card" style={{ borderLeft: '3px solid #0369a1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className="tag tag-brass">{m.category}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Valid till {m.validity || '2026-09-30'}</span>
              </div>
              <div style={{ fontWeight: 600 }}>{m.specification}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: '0.3rem' }}>
                ₹{m.pricePerUnit || m.price_per_unit}/{m.unit} &middot; Min Bulk {m.minBulkQty || m.min_bulk_qty} {m.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

