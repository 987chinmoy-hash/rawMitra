import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import ArtisanSupplierSelect from './pages/artisan/ArtisanSupplierSelect.jsx'
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

function SessionRedirect() {
  const { authUser } = useAppState()
  const location = useLocation()

  const [checkingSession, setCheckingSession] = useState(true)
  const [serverUser, setServerUser] = useState(null)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      const token = api.getToken()

      if (!token) {
        if (active) {
          setCheckingSession(false)
        }
        return
      }

      try {
        const response = await api.auth.getMe()
        if (active && response?.user) {
          setServerUser(response.user)
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message || err)
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

  if (checkingSession) {
    return null
  }

  const user = serverUser || authUser

  if (!user) {
    return null
  }

  if (location.pathname === '/artisan/register' && user.role === 'artisan') {
    return <Navigate to="/artisan/materials" replace />
  }

  if (location.pathname === '/supplier/register' && user.role === 'supplier') {
    return <Navigate to="/supplier/pricing" replace />
  }

  if (location.pathname === '/coordinator/register' && user.role === 'coordinator') {
    return <Navigate to="/coordinator/dashboard" replace />
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
            {/* PUBLIC / ENTRY PAGES */}
            <Route path="/" element={<Welcome />} />
            <Route path="/start" element={<RoleSelect />} />
            <Route path="/guide" element={<GuideBook />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/forecast" element={<DemandForecast />} />

            {/* ARTISAN WORKFLOW */}
            <Route path="/artisan/register" element={<ArtisanRegister />} />
            <Route path="/artisan/materials" element={<ArtisanMaterials />} />
            <Route path="/artisan/matching" element={<ArtisanMatching />} />
            <Route path="/artisan/suppliers" element={<ArtisanSupplierSelect />} />
            <Route path="/artisan/request" element={<ArtisanRequestBroadcast />} />
            <Route path="/artisan/confirm" element={<ArtisanOrderConfirm />} />
            <Route path="/artisan/tracking" element={<ArtisanTracking />} />

            {/* SUPPLIER WORKFLOW */}
            <Route path="/supplier/register" element={<SupplierRegister />} />
            <Route path="/supplier/pricing" element={<SupplierPricing />} />
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />

            {/* COORDINATOR WORKFLOW */}
            <Route path="/coordinator/register" element={<CoordinatorRegister />} />
            <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />

            {/* FALLBACK */}
            <Route path="*" element={<Welcome />} />
          </Routes>
        </PageWrapper>
      </main>
    </div>
  )
}
