import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import NavBar from './components/NavBar.jsx'
import Welcome from './pages/Welcome.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import GuideBook from './pages/GuideBook.jsx'
import SearchResults from './pages/SearchResults.jsx'
import DemandForecast from './pages/DemandForecast.jsx'

import ArtisanRegister from './pages/artisan/ArtisanRegister.jsx'
import ArtisanMaterials from './pages/artisan/ArtisanMaterials.jsx'
import ArtisanMatching from './pages/artisan/ArtisanMatching.jsx'
import ArtisanRequestBroadcast from './pages/artisan/ArtisanRequestBroadcast.jsx'
import ArtisanOrderConfirm from './pages/artisan/ArtisanOrderConfirm.jsx'
import ArtisanTracking from './pages/artisan/ArtisanTracking.jsx'

import SupplierRegister from './pages/supplier/SupplierRegister.jsx'
import SupplierPricing from './pages/supplier/SupplierPricing.jsx'
import SupplierDashboard from './pages/supplier/SupplierDashboard.jsx'

import CoordinatorRegister from './pages/coordinator/CoordinatorRegister.jsx'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard.jsx'

import BroadcastPopup from './components/BroadcastPopup.jsx'
import { useAppState } from './context/AppContext.jsx'
import { api } from './services/api.js'
import './App.css'

function PageWrapper({ children }) {
  const ref = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('page-enter')
      void ref.current.offsetWidth
      ref.current.classList.add('page-enter')
    }
  }, [location.pathname])

  return (
    <div ref={ref} className="page-wrapper">
      {children}
    </div>
  )
}

/*
 * Determines where an authenticated user should go
 * when starting a NEW workflow/order.
 *
 * This is intentionally different from getProgressPath().
 *
 * A user's saved current_step belongs to the previous
 * or unfinished workflow. When the user returns to the
 * home page and chooses their role again, they should
 * be able to start a new order without filling in
 * personal details again.
 */
function getNewWorkflowPath(user) {
  if (!user) return null

  switch (user.role) {
    case 'artisan':
      return '/artisan/materials'

    case 'supplier':
      return '/supplier/pricing'

    case 'coordinator':
      return '/coordinator/dashboard'

    default:
      return null
  }
}

/*
 * Determines where an authenticated user should resume
 * an unfinished workflow.
 *
 * This function is kept available for workflow-resume
 * logic and can be used when we specifically want to
 * restore an interrupted order.
 */
function getProgressPath(user) {
  if (!user) return null

  const role = user.role
  const step = user.current_step || 'role_setup'

  if (role === 'artisan') {
    switch (step) {
      case 'role_setup':
      case 'material_requirement':
        return '/artisan/materials'

      case 'group_matching':
      case 'supplier_offers':
        return '/artisan/matching'

      case 'deal_selection':
      case 'order_confirmation':
        return '/artisan/confirm'

      case 'delivery_tracking':
        return '/artisan/tracking'

      case 'completed':
        return '/artisan/materials'

      default:
        return '/artisan/materials'
    }
  }

  if (role === 'supplier') {
    switch (step) {
      case 'role_setup':
      case 'supplier_setup':
      case 'supplier_offers':
        return '/supplier/pricing'

      case 'supplier_dashboard':
      case 'supplier_fulfillment':
        return '/supplier/dashboard'

      case 'completed':
        return '/supplier/pricing'

      default:
        return '/supplier/pricing'
    }
  }

  if (role === 'coordinator') {
    switch (step) {
      case 'role_setup':
      case 'coordinator_setup':
      case 'coordinator_dashboard':
      case 'deal_claim':
      case 'coordinator_tracking':
      case 'coordinator_delivery':
        return '/coordinator/dashboard'

      case 'completed':
        return '/coordinator/dashboard'

      default:
        return '/coordinator/dashboard'
    }
  }

  return null
}

/*
 * SessionRedirect
 *
 * Restores the authenticated user from the JWT.
 *
 * IMPORTANT:
 *
 * The home/start pages now behave as "start a new workflow"
 * entry points for existing users.
 *
 * Therefore:
 *
 * Existing Artisan
 *      / or /start
 *          ↓
 *      /artisan/materials
 *
 * Existing Supplier
 *      / or /start
 *          ↓
 *      /supplier/pricing
 *
 * Existing Coordinator
 *      / or /start
 *          ↓
 *      /coordinator/dashboard
 *
 * The user does NOT get sent back to the previous order's
 * current_step after completing an order.
 */
function SessionRedirect() {
  const { authUser } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()

  const [checkingSession, setCheckingSession] = useState(true)
  const [serverUser, setServerUser] = useState(null)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      const token = api.getToken()

      /*
       * No JWT means this is a guest visit.
       */
      if (!token) {
        if (active) {
          setCheckingSession(false)
        }
        return
      }

      try {
        /*
         * Ask the backend for the latest user information.
         * This also verifies the JWT.
         */
        const response = await api.auth.getMe()

        if (active && response?.user) {
          setServerUser(response.user)
        }
      } catch (err) {
        /*
         * Invalid/expired JWT is handled by api.js.
         * The user can continue as a guest.
         */
        console.warn(
          'Session restoration failed:',
          err.message || err
        )
      } finally {
        if (active) {
          setCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  /*
   * Do not redirect while the JWT is being checked.
   */
  if (checkingSession) {
    return null
  }

  const user = serverUser || authUser

  /*
   * No authenticated user.
   * Normal public routing continues.
   */
  if (!user) {
    return null
  }

  /*
   * These are pages where an authenticated user can
   * intentionally start a new workflow.
   *
   * We do NOT use current_step here.
   */
  const newWorkflowEntryPaths = [
    '/',
    '/start',
  ]

  if (newWorkflowEntryPaths.includes(location.pathname)) {
    const newWorkflowPath = getNewWorkflowPath(user)

    if (newWorkflowPath) {
      return <Navigate to={newWorkflowPath} replace />
    }
  }

  /*
   * If an authenticated user somehow opens their
   * registration page again, skip registration and
   * take them directly to their role's starting page.
   *
   * This prevents personal details from being requested
   * again.
   */
  if (
    location.pathname === '/artisan/register' &&
    user.role === 'artisan'
  ) {
    return (
      <Navigate
        to="/artisan/materials"
        replace
      />
    )
  }

  if (
    location.pathname === '/supplier/register' &&
    user.role === 'supplier'
  ) {
    return (
      <Navigate
        to="/supplier/pricing"
        replace
      />
    )
  }

  if (
    location.pathname === '/coordinator/register' &&
    user.role === 'coordinator'
  ) {
    return (
      <Navigate
        to="/coordinator/dashboard"
        replace
      />
    )
  }

  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />

      <BroadcastPopup />

      <main>
        <PageWrapper>
          <SessionRedirect />

          <Routes>
            {/* Public / Entry Pages */}
            <Route
              path="/"
              element={<Welcome />}
            />

            <Route
              path="/start"
              element={<RoleSelect />}
            />

            <Route
              path="/guide"
              element={<GuideBook />}
            />

            <Route
              path="/search"
              element={<SearchResults />}
            />

            <Route
              path="/forecast"
              element={<DemandForecast />}
            />

            {/* Artisan Workflow */}
            <Route
              path="/artisan/register"
              element={<ArtisanRegister />}
            />

            <Route
              path="/artisan/materials"
              element={<ArtisanMaterials />}
            />

            <Route
              path="/artisan/matching"
              element={<ArtisanMatching />}
            />

            <Route
              path="/artisan/request"
              element={<ArtisanRequestBroadcast />}
            />

            <Route
              path="/artisan/confirm"
              element={<ArtisanOrderConfirm />}
            />

            <Route
              path="/artisan/tracking"
              element={<ArtisanTracking />}
            />

            {/* Supplier Workflow */}
            <Route
              path="/supplier/register"
              element={<SupplierRegister />}
            />

            <Route
              path="/supplier/pricing"
              element={<SupplierPricing />}
            />

            <Route
              path="/supplier/dashboard"
              element={<SupplierDashboard />}
            />

            {/* Coordinator Workflow */}
            <Route
              path="/coordinator/register"
              element={<CoordinatorRegister />}
            />

            <Route
              path="/coordinator/dashboard"
              element={<CoordinatorDashboard />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Welcome />}
            />
          </Routes>
        </PageWrapper>
      </main>
    </div>
  )
}
