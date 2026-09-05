import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
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
import './App.css'

function PageWrapper({ children }) {
  const ref = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('page-enter')
      void ref.current.offsetWidth // force reflow
      ref.current.classList.add('page-enter')
    }
  }, [location.pathname])

  return <div ref={ref} className="page-wrapper">{children}</div>
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <BroadcastPopup />
      <main>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/start" element={<RoleSelect />} />
            <Route path="/guide" element={<GuideBook />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/forecast" element={<DemandForecast />} />

            <Route path="/artisan/register" element={<ArtisanRegister />} />
            <Route path="/artisan/materials" element={<ArtisanMaterials />} />
            <Route path="/artisan/matching" element={<ArtisanMatching />} />
            <Route path="/artisan/request" element={<ArtisanRequestBroadcast />} />
            <Route path="/artisan/confirm" element={<ArtisanOrderConfirm />} />
            <Route path="/artisan/tracking" element={<ArtisanTracking />} />

            <Route path="/supplier/register" element={<SupplierRegister />} />
            <Route path="/supplier/pricing" element={<SupplierPricing />} />
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />

            <Route path="/coordinator/register" element={<CoordinatorRegister />} />
            <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />

            <Route path="*" element={<Welcome />} />
          </Routes>
        </PageWrapper>
      </main>
    </div>
  )
}
