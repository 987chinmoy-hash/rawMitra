// Centralized API client for rawMitra backend communication
// Manages JWT token storage and automatically sends
// Bearer authentication headers with authenticated requests.

const API_BASE = import.meta.env.VITE_API_URL || 'https://rawmitra-backend.onrender.com/api'
const TOKEN_KEY = 'rawmitra_auth_token'

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    return null
  }
}

function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch (e) {}
}

async function request(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Automatically attach JWT to every API request
  // when the user is logged in.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  /*
   * If the JWT has expired or is invalid, remove it.
   * This prevents the frontend from repeatedly using
   * an invalid authentication token.
   */
  if (response.status === 401) {
    setToken(null)
  }

  if (!response.ok) {
    const error = new Error(
      data.error || 'Request failed'
    )

    error.status = response.status
    error.code = data.code

    throw error
  }

  return data
}

export const api = {
  getToken,
  setToken,

  // Auth & Profile
  auth: {
    login: async (credentials) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      // Save JWT after successful login
      if (data.token) {
        setToken(data.token)
      }

      return data
    },

    register: async (userData) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      // Save JWT after successful registration
      if (data.token) {
        setToken(data.token)
      }

      return data
    },

    /*
     * Restore the currently logged-in user.
     *
     * The JWT is automatically attached by request().
     *
     * Backend response includes:
     * - user.id
     * - user.role
     * - user.name
     * - user.current_step
     * - user.onboarding_complete
     */
    getMe: () => request('/auth/me'),

    /*
     * Save the user's current workflow progress.
     *
     * Example:
     *
     * api.auth.updateProgress({
     *   current_step: 'group_matching',
     *   onboarding_complete: false
     * })
     */
    updateProgress: async ({
      current_step,
      onboarding_complete,
    }) => {
      return request('/auth/progress', {
        method: 'PATCH',
        body: JSON.stringify({
          current_step,
          onboarding_complete,
        }),
      })
    },

    /*
     * Clear JWT from browser storage.
     */
    logout: () => {
      setToken(null)
    },
  },

  // Bootstrap initial DB state
  bootstrap: () => request('/bootstrap'),

  // Material Demands (Artisan)
  materials: {
    addRequests: (requests) =>
      request('/materials/request', {
        method: 'POST',
        body: JSON.stringify({ requests }),
      }),

    withdraw: (id) =>
      request(`/materials/request/${id}`, {
        method: 'DELETE',
      }),
  },

  // Supplier stock & catalog
  supplier: {
    getAll: () => request('/suppliers'),

    saveStock: (payload) =>
      request('/supplier/stock', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMyStock: () =>
      request('/supplier/my-stock'),

    getOrders: (supplierId) =>
      request('/supplier/orders' + (supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : '')),

    registerSupplier: async (data) => {
      const authRes = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          role: 'supplier',
          name: data.name,
          phone: data.phone,
          password: data.password || 'password123',
          aadhar: data.aadhar,
          storeLocation: data.storeLocation,
        }),
      })

      if (authRes?.token) {
        setToken(authRes.token)
      }

      if (data.materials && data.materials.length > 0) {
        try {
          await request('/supplier/stock', {
            method: 'POST',
            body: JSON.stringify({
              materials: data.materials,
              logistics: data.logistics || 'shipment',
              transportCharge: data.transportCharge || 350,
              validityDate: data.validity || '2026-09-30',
            }),
          })
        } catch (stockErr) {
          console.warn('Could not save initial stock on backend:', stockErr.message)
        }
      }

      return authRes
    },
  },

  // Broadcasts / pool requests
  broadcasts: {
    post: (payload) =>
      request('/broadcasts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Orders & Coordination
  orders: {
    create: (orderPayload) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      }),

    accept: (orderId, supplierId) =>
      request(`/orders/${orderId}/accept`, {
        method: 'PATCH',
        body: JSON.stringify({ supplierId }),
      }),

    reject: (orderId, reason, supplierId) =>
      request(`/orders/${orderId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason, supplierId }),
      }),

    reset: (orderId) =>
      request(`/orders/${orderId}/reset`, {
        method: 'PATCH',
      }),

    claim: (orderId) =>
      request(`/orders/${orderId}/claim`, {
        method: 'PATCH',
      }),

    advanceStage: (orderId) =>
      request(`/orders/${orderId}/stage`, {
        method: 'PATCH',
      }),

    cancel: (orderId) =>
      request(`/orders/${orderId}/cancel`, {
        method: 'POST',
      }),
  },

  // Reviews
  reviews: {
    add: (payload) =>
      request('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Security & Fraud Prevention Audit Engine
  audit: {
    getSecurityAudit: () =>
      request('/audit/security'),
  },

  // Search
  search: (query) =>
    request(
      `/search?q=${encodeURIComponent(query)}`
    ),
}
