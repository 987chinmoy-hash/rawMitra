import React, { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'

const MOCK_DEALS = [
  {
    id: 'DEAL-901',
    artisanName: 'Biren Das',
    material: 'Bamboo & Cane Bundles',
    quantity: '500 pcs',
    location: 'Majuli, Assam',
    supplier: 'Assam Timber Co.',
    budget: '₹18,500',
    date: '06 Sep 2026'
  },
  {
    id: 'DEAL-902',
    artisanName: 'Prativa Gogoi',
    material: 'Raw Muga Silk Yarn',
    quantity: '15 kg',
    location: 'Sualkuchi, Assam',
    supplier: 'North East Fabrics',
    budget: '₹42,000',
    date: '05 Sep 2026'
  },
  {
    id: 'DEAL-903',
    artisanName: 'Jitul Saikia',
    material: 'Terracotta Clay',
    quantity: '1,200 kg',
    location: 'Asharikandi, Assam',
    supplier: 'Clay Craft India',
    budget: '₹12,000',
    date: '04 Sep 2026'
  }
]

export default function CoordinatorDashboard() {
  const appState = useAppState ? useAppState() : {}
  const authUser = appState?.authUser
  const broadcastRequests = appState?.broadcastRequests || []

  const [activeDeals, setActiveDeals] = useState([])

  // Uses live broadcast requests if any exist, otherwise defaults to sample deals
  const displayDeals = broadcastRequests.length > 0 ? broadcastRequests : MOCK_DEALS

  const handleAcceptDeal = (deal) => {
    setActiveDeals((prev) => [...prev, { ...deal, status: 'In Progress' }])
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', color: '#1a1a1a' }}>
      {/* Profile Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>{authUser?.name || 'Venugopal'}</h1>
        <p style={{ color: '#666', margin: '0.25rem 0' }}>2 years</p>
        <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ 5.0</div>
      </div>

      {/* Deals Needing a Coordinator */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Deals needing a coordinator</h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Open deals right now — confirmed orders that need a coordinator will show up here.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {displayDeals.map((deal) => (
            <div 
              key={deal.id} 
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>
                  {deal.material} ({deal.quantity || 'Batch'})
                </div>
                <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <strong>Artisan:</strong> {deal.artisanName} • <strong>Location:</strong> {deal.location}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Supplier: {deal.supplier || 'Direct Supplier'} | Total: <strong>{deal.budget || deal.totalPrice}</strong>
                </div>
              </div>

              <button
                onClick={() => handleAcceptDeal(deal)}
                style={{
                  backgroundColor: '#166534',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Accept Deal
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Active Deals */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Your active deals</h2>
        {activeDeals.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Deals you take on will appear here so you can update tracking status.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {activeDeals.map((deal) => (
              <div 
                key={deal.id}
                style={{
                  border: '1px solid #bbf7d0',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{deal.material}</strong> — {deal.artisanName} ({deal.location})
                  <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.2rem' }}>
                    Status: {deal.status}
                  </div>
                </div>
                <button
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Update Status
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ratings & Reviews */}
      <section>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
          Ratings & Reviews for {authUser?.name || 'Venugopal'}
        </h2>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>
          No reviews yet — be the first once a deal is complete.
        </p>
      </section>
    </div>
  )
}
