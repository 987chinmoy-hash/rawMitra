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
 * Automatically sends an already-authenticated user
 * to the correct workflow step.
 *
 * Example:
 *
 * Artisan:
 * material_requirement -> /artisan/materials
 * group_matching      -> /artisan/matching
 * supplier_offers     -> /artisan/matching
 * deal_selection      -> /artisan/confirm
 * order_confirmation  -> /artisan/confirm
 * delivery_tracking   -> /artisan/tracking
 *
 * Supplier:
 * supplier_setup      -> /supplier/pricing
 * supplier_dashboard  -> /supplier/dashboard
 *
 * Coordinator:
 * coordinator_setup   -> /coordinator/dashboard
 * coordinator_dashboard -> /coordinator/dashboard
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
        return '/artisan/tracking'

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
        return '/supplier/dashboard'

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
 * This runs when the application starts.
 *
 * It checks for the JWT and asks the backend for the
 * latest user + workflow progress.
 *
 * This prevents the user from having to enter signup
 * details again on their next visit.
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
       * No JWT means this is a normal guest visit.
       */
      if (!token) {
        if (active) {
          setCheckingSession(false)
        }
        return
      }

      try {
        /*
         * /api/auth/me verifies the JWT and returns the
         * latest user information directly from SQLite.
         */
        const response = await api.auth.getMe()

        if (active && response?.user) {
          setServerUser(response.user)
        }
      } catch (err) {
        /*
         * Invalid/expired JWT is handled by api.js.
         * User can continue as a guest.
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
   * While checking the JWT, do not redirect.
   *
   * This is important because otherwise the application
   * could redirect a logged-in user to /start before
   * /api/auth/me has finished loading.
   */
  if (checkingSession) {
    return null
  }

  const user = serverUser || authUser

  if (!user) {
    return null
  }

  const progressPath = getProgressPath(user)

  if (!progressPath) {
    return null
  }

  /*
   * Only automatically redirect from entry/onboarding pages.
   *
   * This prevents the user from being forcibly redirected
   * if they are already inside their workflow.
   */
  const entryPaths = [
    '/',
    '/start',
    '/artisan/register',
    '/supplier/register',
    '/coordinator/register',
  ]

  if (!entryPaths.includes(location.pathname)) {
    return null
  }

  /*
   * Existing authenticated user:
   *
   * / -> correct workflow
   * /start -> correct workflow
   * /artisan/register -> correct workflow
   * etc.
   */
  return <Navigate to={progressPath} replace />
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
