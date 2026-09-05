// Centralized API client for rawMitra backend communication
// Manages JWT token storage and Bearer authentication headers.

const API_BASE = '/api'
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
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch (e) {}
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed')
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
      if (data.token) setToken(data.token)
      return data
    },
    register: async (userData) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      if (data.token) setToken(data.token)
      return data
    },
    getMe: () => request('/auth/me'),
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

  // Supplier stock
  supplier: {
    saveStock: (payload) =>
      request('/supplier/stock', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getMyStock: () => request('/supplier/my-stock'),
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
    getSecurityAudit: () => request('/audit/security'),
  },

  // Search
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`),
}

