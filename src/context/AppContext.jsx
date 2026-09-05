import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  seedArtisans, seedSuppliers, seedCoordinators,
  seedMaterialRequests, seedOrders, seedBroadcasts, seedRatings,
} from '../data/seed.js'
import { api } from '../services/api.js'

const STORAGE_KEY = 'rawmitra-state-v2'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Could not read saved state, starting fresh.', e)
  }
  return {
    language: 'en',
    role: null,
    currentUserId: null,
    authUser: null,
    isBackendOnline: true,
    artisans: seedArtisans,
    suppliers: seedSuppliers,
    coordinators: seedCoordinators,
    materialRequests: seedMaterialRequests,
    broadcasts: seedBroadcasts,
    orders: seedOrders,
    ratings: seedRatings,
    penalties: [],
    draftMaterials: [],
    pendingOrder: null,
    dismissedBroadcasts: [],
  }
}

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role }

    case 'SET_LANGUAGE':
      return { ...state, language: action.language }

    case 'REGISTER_ARTISAN': {
      const id = genId('A')
      const artisan = { id, rating: 0, reviews: 0, ...action.payload }
      const authUser = { id, name: artisan.name, role: 'artisan', phone: artisan.phone, aadhar_masked: artisan.aadhar, storeLocation: artisan.storeLocation }
      return { ...state, artisans: [...state.artisans, artisan], currentUserId: id, role: 'artisan', authUser }
    }
    case 'REGISTER_SUPPLIER': {
      const id = genId('S')
      const supplier = { id, rating: 0, reviews: 0, materials: [], logistics: 'none', transportCharge: 500, validity: '2026-09-25', ...action.payload }
      const authUser = { id, name: supplier.name, role: 'supplier', phone: supplier.phone, aadhar_masked: supplier.aadhar, storeLocation: supplier.storeLocation }
      return { ...state, suppliers: [...state.suppliers, supplier], currentUserId: id, role: 'supplier', authUser }
    }
    case 'REGISTER_COORDINATOR': {
      const id = genId('C')
      const coordinator = { id, rating: 0, reviews: 0, activeDeals: 0, ...action.payload }
      const authUser = { id, name: coordinator.name, role: 'coordinator', phone: coordinator.phone, aadhar_masked: coordinator.aadhar, experience: coordinator.experience }
      return { ...state, coordinators: [...state.coordinators, coordinator], currentUserId: id, role: 'coordinator', authUser }
    }

    case 'UPDATE_SUPPLIER': {
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.id ? { ...s, ...action.payload } : s
        ),
      }
    }

    case 'SET_DRAFT_MATERIALS':
      return { ...state, draftMaterials: action.materials }

    case 'SET_PENDING_ORDER':
      return { ...state, pendingOrder: action.payload }

    case 'ADD_MATERIAL_REQUESTS': {
      const currentArtisanId = state.currentUserId || state.authUser?.id || 'A-1001'
      const newReqs = action.requests.map((r) => ({
        id: genId('R'),
        artisanId: currentArtisanId,
        status: 'open',
        ...r,
      }))
      return { ...state, materialRequests: [...state.materialRequests, ...newReqs] }
    }

    case 'WITHDRAW_REQUEST': {
      // Participant withdrawal rule: recalculate requests by removing the withdrawn item
      return {
        ...state,
        materialRequests: state.materialRequests.filter((r) => r.id !== action.requestId),
      }
    }

    case 'ADD_BROADCAST': {
      const currentArtisanId = state.currentUserId || state.authUser?.id || 'A-1001'
      const broadcast = { id: genId('B'), artisanId: currentArtisanId, status: 'open', ...action.payload }
      return { ...state, broadcasts: [...state.broadcasts, broadcast] }
    }

    case 'DISMISS_BROADCAST': {
      return {
        ...state,
        dismissedBroadcasts: [...(state.dismissedBroadcasts || []), action.broadcastId],
      }
    }

    case 'CREATE_ORDER': {
      const currentArtisanId = state.currentUserId || state.authUser?.id || 'A-1001'
      const perArtisan = Array.isArray(action.payload.perArtisan) && action.payload.perArtisan.length > 0
        ? action.payload.perArtisan
        : [{
            artisanId: currentArtisanId,
            quantity: action.payload.totalQuantity || 10,
            materialCost: action.payload.materialTotal || action.payload.totalCost || 1000,
            transportShare: action.payload.transportTotal || 0,
            totalCost: action.payload.totalCost || 1000,
          }]

      const order = {
        id: genId('O'),
        status: 'confirmed',
        trackingStage: 0,
        coordinatorId: action.payload.coordinatorId || null,
        ...action.payload,
        perArtisan,
      }
      const involvedIds = new Set(perArtisan.map((p) => p.artisanId).filter(Boolean))
      return {
        ...state,
        orders: [order, ...state.orders],
        pendingOrder: null,
        materialRequests: state.materialRequests.map((r) =>
          involvedIds.has(r.artisanId) && r.category === order.category && r.status === 'open'
            ? { ...r, status: 'fulfilled' }
            : r
        ),
      }
    }

    case 'CLAIM_DEAL': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, coordinatorId: action.coordinatorId } : o
        ),
      }
    }

    case 'ADVANCE_TRACKING': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, trackingStage: Math.min(o.trackingStage + 1, 4) }
            : o
        ),
      }
    }

    case 'CANCEL_ORDER': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: 'cancelled', penaltyApplied: true } : o
        ),
      }
    }

    case 'ADD_RATING': {
      const key = action.targetId
      const existing = state.ratings[key] || []
      const updated = [...existing, { rating: action.rating, review: action.review, by: state.currentUserId, date: new Date().toISOString() }]
      return { ...state, ratings: { ...state.ratings, [key]: updated } }
    }

    case 'SET_AUTH_USER': {
      const u = action.user
      return {
        ...state,
        authUser: u,
        role: u ? u.role : state.role,
        currentUserId: u ? u.id : state.currentUserId,
      }
    }

    case 'LOGOUT':
    case 'RESET_SESSION':
      return {
        ...state,
        authUser: null,
        role: null,
        currentUserId: null,
        draftMaterials: [],
        pendingOrder: null,
      }

    case 'HYDRATE_SERVER_DATA': {
      const d = action.data || {}
      return {
        ...state,
        isBackendOnline: true,
        artisans: d.artisans && d.artisans.length > 0 ? d.artisans : state.artisans,
        suppliers: d.suppliers && d.suppliers.length > 0 ? d.suppliers : state.suppliers,
        coordinators: d.coordinators && d.coordinators.length > 0 ? d.coordinators : state.coordinators,
        materialRequests: d.materialRequests && d.materialRequests.length > 0 ? d.materialRequests : state.materialRequests,
        orders: d.orders && d.orders.length > 0 ? d.orders : state.orders,
        broadcasts: d.broadcasts && d.broadcasts.length > 0 ? d.broadcasts : state.broadcasts,
        penalties: d.penalties || state.penalties || [],
      }
    }

    default:
      return state
  }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Could not persist state', e)
    }
  }, [state])

  // Bootstrap data from backend on startup
  useEffect(() => {
    let active = true
    async function syncInit() {
      try {
        const data = await api.bootstrap()
        if (active && data) {
          dispatch({ type: 'HYDRATE_SERVER_DATA', data })
        }
      } catch (err) {
        console.warn('Backend offline, running in resilient standalone mode.', err)
      }

      try {
        const meRes = await api.auth.getMe()
        if (active && meRes?.user) {
          dispatch({ type: 'SET_AUTH_USER', user: meRes.user })
        }
      } catch (err) {
        // Guest or unauthenticated session
      }
    }
    syncInit()
    return () => { active = false }
  }, [])

  // Enhanced async dispatch that transparently synchronizes with backend SQLite
  const enhancedDispatch = async (action) => {
    dispatch(action)

    try {
      if (action.type === 'CREATE_ORDER') {
        await api.orders.create(action.payload)
      } else if (action.type === 'WITHDRAW_REQUEST') {
        await api.materials.withdraw(action.requestId)
      } else if (action.type === 'CLAIM_DEAL') {
        await api.orders.claim(action.orderId)
      } else if (action.type === 'ADVANCE_TRACKING') {
        await api.orders.advanceStage(action.orderId)
      } else if (action.type === 'CANCEL_ORDER') {
        await api.orders.cancel(action.orderId)
      } else if (action.type === 'ADD_MATERIAL_REQUESTS') {
        await api.materials.addRequests(action.requests)
      } else if (action.type === 'ADD_BROADCAST') {
        await api.broadcasts.post(action.payload)
      } else if (action.type === 'REGISTER_SUPPLIER') {
        // Sync supplier catalog to DB when registered via the "Get Started" flow
        if (action.payload?.materials?.length > 0) {
          await api.supplier.saveStock({
            materials: action.payload.materials,
            logistics: action.payload.logistics || 'shipment',
            transportCharge: action.payload.transportCharge || 500,
            validityDate: action.payload.validity || '2026-12-31',
          })
        }
      } else if (action.type === 'LOGOUT') {
        api.auth.logout()
      }
    } catch (err) {
      console.warn(`[Sync with backend error for ${action.type}]:`, err.message || err)
    }
  }

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={enhancedDispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider')
  return ctx
}

// Convenience getters
export function getCurrentArtisan(state) {
  return state.artisans.find((a) => a.id === state.currentUserId) ||
    (state.authUser && state.authUser.role === 'artisan' ? state.authUser : null)
}
export function getCurrentSupplier(state) {
  return state.suppliers.find((s) => s.id === state.currentUserId) ||
    (state.authUser && state.authUser.role === 'supplier' ? state.authUser : null)
}
export function getCurrentCoordinator(state) {
  return state.coordinators.find((c) => c.id === state.currentUserId) ||
    (state.authUser && state.authUser.role === 'coordinator' ? state.authUser : null)
}
