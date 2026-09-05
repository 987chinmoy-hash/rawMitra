import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  seedArtisans,
  seedSuppliers,
  seedCoordinators,
  seedMaterialRequests,
  seedOrders,
  seedBroadcasts,
  seedRatings,
} from '../data/seed.js'
import { api } from '../services/api.js'

const STORAGE_KEY = 'rawmitra-state-v2'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (raw) {
      const saved = JSON.parse(raw)

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
        ...saved,
      }
    }
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
      return {
        ...state,
        role: action.role,
      }

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.language,
      }

    /*
     * New backend registration.
     *
     * The backend is now the source of truth for the user ID,
     * authentication and workflow progress.
     */
    case 'REGISTER_ARTISAN': {
      const id = action.payload?.id || genId('A')

      const artisan = {
        id,
        rating: 0,
        reviews: 0,
        ...action.payload,
      }

      const authUser = {
        ...action.payload,
        id,
        name: artisan.name,
        role: 'artisan',
        phone: artisan.phone,
        aadhar_masked: artisan.aadhar_masked || artisan.aadhar,
        storeLocation: artisan.storeLocation,
        current_step: artisan.current_step || 'role_setup',
        onboarding_complete: Boolean(artisan.onboarding_complete),
      }

      return {
        ...state,
        artisans: [...state.artisans, artisan],
        currentUserId: id,
        role: 'artisan',
        authUser,
      }
    }

    case 'REGISTER_SUPPLIER': {
      const id = action.payload?.id || genId('S')

      const supplier = {
        id,
        rating: 0,
        reviews: 0,
        materials: [],
        logistics: 'none',
        transportCharge: 500,
        validity: '2026-09-25',
        ...action.payload,
      }

      const authUser = {
        ...action.payload,
        id,
        name: supplier.name,
        role: 'supplier',
        phone: supplier.phone,
        aadhar_masked: supplier.aadhar_masked || supplier.aadhar,
        storeLocation: supplier.storeLocation,
        current_step: supplier.current_step || 'role_setup',
        onboarding_complete: Boolean(supplier.onboarding_complete),
      }

      return {
        ...state,
        suppliers: [...state.suppliers, supplier],
        currentUserId: id,
        role: 'supplier',
        authUser,
      }
    }

    case 'REGISTER_COORDINATOR': {
      const id = action.payload?.id || genId('C')

      const coordinator = {
        id,
        rating: 0,
        reviews: 0,
        activeDeals: 0,
        ...action.payload,
      }

      const authUser = {
        ...action.payload,
        id,
        name: coordinator.name,
        role: 'coordinator',
        phone: coordinator.phone,
        aadhar_masked: coordinator.aadhar_masked || coordinator.aadhar,
        experience: coordinator.experience,
        current_step: coordinator.current_step || 'role_setup',
        onboarding_complete: Boolean(coordinator.onboarding_complete),
      }

      return {
        ...state,
        coordinators: [...state.coordinators, coordinator],
        currentUserId: id,
        role: 'coordinator',
        authUser,
      }
    }

    /*
     * Store the authenticated backend user.
     *
     * This is important when the application is opened again.
     * The user and their saved current_step are restored from
     * /api/auth/me.
     */
    case 'SET_AUTH_USER': {
      const u = action.user

      if (!u) {
        return {
          ...state,
          authUser: null,
          role: null,
          currentUserId: null,
        }
      }

      return {
        ...state,
        authUser: u,
        role: u.role,
        currentUserId: u.id,
      }
    }

    /*
     * Update the locally stored workflow progress.
     *
     * Backend synchronization is handled by enhancedDispatch().
     */
    case 'UPDATE_PROGRESS': {
      if (!state.authUser) {
        return state
      }

      const updatedUser = {
        ...state.authUser,
        current_step:
          action.current_step ||
          state.authUser.current_step ||
          'role_setup',

        onboarding_complete:
          typeof action.onboarding_complete === 'boolean'
            ? action.onboarding_complete
            : Boolean(state.authUser.onboarding_complete),
      }

      return {
        ...state,
        authUser: updatedUser,
      }
    }

    case 'UPDATE_SUPPLIER': {
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.id
            ? { ...s, ...action.payload }
            : s
        ),
      }
    }

    case 'SET_DRAFT_MATERIALS':
      return {
        ...state,
        draftMaterials: action.materials,
      }

    case 'SET_PENDING_ORDER':
      return {
        ...state,
        pendingOrder: action.payload,
      }

    case 'ADD_MATERIAL_REQUESTS': {
      const currentArtisanId =
        state.currentUserId ||
        state.authUser?.id ||
        'A-1001'

      const newReqs = action.requests.map((r) => ({
        id: genId('R'),
        artisanId: currentArtisanId,
        status: 'open',
        ...r,
      }))

      return {
        ...state,
        materialRequests: [
          ...state.materialRequests,
          ...newReqs,
        ],
      }
    }

    case 'WITHDRAW_REQUEST': {
      return {
        ...state,
        materialRequests: state.materialRequests.filter(
          (r) => r.id !== action.requestId
        ),
      }
    }

    case 'ADD_BROADCAST': {
      const currentArtisanId =
        state.currentUserId ||
        state.authUser?.id ||
        'A-1001'

      const broadcast = {
        id: genId('B'),
        artisanId: currentArtisanId,
        status: 'open',
        ...action.payload,
      }

      return {
        ...state,
        broadcasts: [
          ...state.broadcasts,
          broadcast,
        ],
      }
    }

    case 'DISMISS_BROADCAST': {
      return {
        ...state,
        dismissedBroadcasts: [
          ...(state.dismissedBroadcasts || []),
          action.broadcastId,
        ],
      }
    }

    case 'CREATE_ORDER': {
      const currentArtisanId =
        state.currentUserId ||
        state.authUser?.id ||
        'A-1001'

      const perArtisan =
        Array.isArray(action.payload.perArtisan) &&
        action.payload.perArtisan.length > 0
          ? action.payload.perArtisan
          : [
              {
                artisanId: currentArtisanId,
                quantity:
                  action.payload.totalQuantity || 10,
                materialCost:
                  action.payload.materialTotal ||
                  action.payload.totalCost ||
                  1000,
                transportShare:
                  action.payload.transportTotal || 0,
                totalCost:
                  action.payload.totalCost || 1000,
              },
            ]

      const order = {
        id: genId('O'),
        status: 'confirmed',
        trackingStage: 0,
        coordinatorId:
          action.payload.coordinatorId || null,
        ...action.payload,
        perArtisan,
      }

      const involvedIds = new Set(
        perArtisan
          .map((p) => p.artisanId)
          .filter(Boolean)
      )

      return {
        ...state,
        orders: [order, ...state.orders],
        pendingOrder: null,
        materialRequests:
          state.materialRequests.map((r) =>
            involvedIds.has(r.artisanId) &&
            r.category === order.category &&
            r.status === 'open'
              ? { ...r, status: 'fulfilled' }
              : r
          ),
      }
    }

    case 'CLAIM_DEAL': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                coordinatorId:
                  action.coordinatorId,
              }
            : o
        ),
      }
    }

    case 'ADVANCE_TRACKING': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                trackingStage: Math.min(
                  o.trackingStage + 1,
                  4
                ),
              }
            : o
        ),
      }
    }

    case 'CANCEL_ORDER': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                status: 'cancelled',
                penaltyApplied: true,
              }
            : o
        ),
      }
    }

    case 'ADD_RATING': {
      const key = action.targetId
      const existing = state.ratings[key] || []

      const updated = [
        ...existing,
        {
          rating: action.rating,
          review: action.review,
          by: state.currentUserId,
          date: new Date().toISOString(),
        },
      ]

      return {
        ...state,
        ratings: {
          ...state.ratings,
          [key]: updated,
        },
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

        artisans:
          d.artisans && d.artisans.length > 0
            ? d.artisans
            : state.artisans,

        suppliers:
          d.suppliers && d.suppliers.length > 0
            ? d.suppliers
            : state.suppliers,

        coordinators:
          d.coordinators && d.coordinators.length > 0
            ? d.coordinators
            : state.coordinators,

        materialRequests:
          d.materialRequests &&
          d.materialRequests.length > 0
            ? d.materialRequests
            : state.materialRequests,

        orders:
          d.orders && d.orders.length > 0
            ? d.orders
            : state.orders,

        broadcasts:
          d.broadcasts && d.broadcasts.length > 0
            ? d.broadcasts
            : state.broadcasts,

        penalties:
          d.penalties ||
          state.penalties ||
          [],
      }
    }

    default:
      return state
  }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    loadInitial
  )

  /*
   * Persist frontend state.
   *
   * The JWT itself is managed separately by api.js.
   * Workflow progress is also persisted on the backend.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      )
    } catch (e) {
      console.warn(
        'Could not persist state',
        e
      )
    }
  }, [state])

  /*
   * Automatic session restoration
   *
   * When the application starts:
   *
   * 1. Check whether a JWT exists.
   * 2. If it exists, call /api/auth/me.
   * 3. Backend verifies the JWT.
   * 4. Backend reads the user's latest progress from SQLite.
   * 5. Restore authUser, role and currentUserId.
   *
   * This means the user does NOT need to register/login
   * again while their JWT is still valid.
   */
  useEffect(() => {
    let active = true

    async function syncInit() {
      /*
       * First load public/backend data.
       */
      try {
        const data = await api.bootstrap()

        if (active && data) {
          dispatch({
            type: 'HYDRATE_SERVER_DATA',
            data,
          })
        }
      } catch (err) {
        console.warn(
          'Backend offline, running in resilient standalone mode.',
          err
        )

        if (active) {
          dispatch({
            type: 'HYDRATE_SERVER_DATA',
            data: {},
          })
        }
      }

      /*
       * Only attempt session restoration when a JWT
       * actually exists.
       */
      const token = api.getToken()

      if (!token) {
        return
      }

      try {
        const meRes = await api.auth.getMe()

        if (
          active &&
          meRes?.user
        ) {
          dispatch({
            type: 'SET_AUTH_USER',
            user: meRes.user,
          })
        }
      } catch (err) {
        /*
         * If JWT is expired/invalid, api.js removes it
         * automatically on a 401 response.
         */
        console.warn(
          'Could not restore authenticated session:',
          err.message || err
        )

        if (active) {
          dispatch({
            type: 'SET_AUTH_USER',
            user: null,
          })
        }
      }
    }

    syncInit()

    return () => {
      active = false
    }
  }, [])

  /*
   * Enhanced async dispatch that transparently
   * synchronizes actions with backend SQLite.
   */
  const enhancedDispatch = async (action) => {
    /*
     * Update UI immediately.
     * This keeps the application responsive.
     */
    dispatch(action)

    try {
      if (action.type === 'CREATE_ORDER') {
        await api.orders.create(
          action.payload
        )

        /*
         * Once an order is created, the artisan has
         * moved to the order confirmation stage.
         */
        if (state.authUser?.role === 'artisan') {
          await api.auth.updateProgress({
            current_step:
              'order_confirmation',
            onboarding_complete: false,
          })

          /*
           * Refresh the authenticated user so the
           * local state contains the server value.
           */
          const meRes =
            await api.auth.getMe()

          if (meRes?.user) {
            dispatch({
              type: 'SET_AUTH_USER',
              user: meRes.user,
            })
          }
        }
      } else if (
        action.type === 'WITHDRAW_REQUEST'
      ) {
        await api.materials.withdraw(
          action.requestId
        )
      } else if (
        action.type === 'CLAIM_DEAL'
      ) {
        await api.orders.claim(
          action.orderId
        )

        if (
          state.authUser?.role ===
          'coordinator'
        ) {
          await api.auth.updateProgress({
            current_step: 'coordinator_tracking',
            onboarding_complete: false,
          })
        }
      } else if (
        action.type === 'ADVANCE_TRACKING'
      ) {
        await api.orders.advanceStage(
          action.orderId
        )
      } else if (
        action.type === 'CANCEL_ORDER'
      ) {
        await api.orders.cancel(
          action.orderId
        )
      } else if (
        action.type ===
        'ADD_MATERIAL_REQUESTS'
      ) {
        await api.materials.addRequests(
          action.requests
        )

        /*
         * Material requirement has been submitted.
         * Save the next step on the backend.
         */
        if (
          state.authUser?.role ===
          'artisan'
        ) {
          await api.auth.updateProgress({
            current_step:
              'group_matching',
            onboarding_complete: false,
          })

          const meRes =
            await api.auth.getMe()

          if (meRes?.user) {
            dispatch({
              type: 'SET_AUTH_USER',
              user: meRes.user,
            })
          }
        }
      } else if (
        action.type === 'ADD_BROADCAST'
      ) {
        await api.broadcasts.post(
          action.payload
        )
      } else if (
        action.type ===
        'REGISTER_SUPPLIER'
      ) {
        /*
         * Sync supplier catalog to DB when
         * registered via the "Get Started" flow.
         */
        if (
          action.payload?.materials
            ?.length > 0
        ) {
          await api.supplier.saveStock({
            materials:
              action.payload.materials,
            logistics:
              action.payload.logistics ||
              'shipment',
            transportCharge:
              action.payload.transportCharge ||
              500,
            validityDate:
              action.payload.validity ||
              '2026-12-31',
          })
        }
      } else if (
        action.type ===
        'UPDATE_PROGRESS'
      ) {
        /*
         * Persist workflow progress in SQLite.
         */
        const progressRes =
          await api.auth.updateProgress({
            current_step:
              action.current_step,
            onboarding_complete:
              action.onboarding_complete,
          })

        /*
         * Use the server response as the
         * authoritative progress state.
         */
        if (
          progressRes?.user
        ) {
          dispatch({
            type: 'SET_AUTH_USER',
            user: progressRes.user,
          })
        }
      } else if (
        action.type === 'LOGOUT'
      ) {
        api.auth.logout()
      }
    } catch (err) {
      console.warn(
        `[Sync with backend error for ${action.type}]:`,
        err.message || err
      )
    }
  }

  return (
    <AppStateContext.Provider
      value={state}
    >
      <AppDispatchContext.Provider
        value={enhancedDispatch}
      >
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(
    AppStateContext
  )

  if (!ctx) {
    throw new Error(
      'useAppState must be used within AppProvider'
    )
  }

  return ctx
}

export function useAppDispatch() {
  const ctx = useContext(
    AppDispatchContext
  )

  if (!ctx) {
    throw new Error(
      'useAppDispatch must be used within AppProvider'
    )
  }

  return ctx
}

// Convenience getters
export function getCurrentArtisan(state) {
  return (
    state.artisans.find(
      (a) => a.id === state.currentUserId
    ) ||
    (
      state.authUser &&
      state.authUser.role === 'artisan'
        ? state.authUser
        : null
    )
  )
}

export function getCurrentSupplier(state) {
  return (
    state.suppliers.find(
      (s) => s.id === state.currentUserId
    ) ||
    (
      state.authUser &&
      state.authUser.role === 'supplier'
        ? state.authUser
        : null
    )
  )
}

export function getCurrentCoordinator(state) {
  return (
    state.coordinators.find(
      (c) => c.id === state.currentUserId
    ) ||
    (
      state.authUser &&
      state.authUser.role === 'coordinator'
        ? state.authUser
        : null
    )
  )
}
