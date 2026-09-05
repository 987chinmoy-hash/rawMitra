import React, { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'

const INITIAL_AVAILABLE_DEALS = [
  {
    id: 'DEAL-101',
    material: 'Bamboo & Cane Bundles (500 pcs)',
    budget: '₹18,500',
    location: 'Majuli, Assam',
    supplier: { name: 'Assam Timber Co.', phone: '+91 91234 56789' },
    artisans: [
      { name: 'Biren Das', phone: '+91 98765 11111' },
      { name: 'Ramen Kalita', phone: '+91 98765 22222' },
      { name: 'Pinku Nath', phone: '+91 98765 33333' }
    ]
  },
  {
    id: 'DEAL-102',
    material: 'Raw Muga Silk Yarn (15 kg) & Dyes (10 litre)',
    budget: '₹42,000',
    location: 'Sualkuchi, Assam',
    supplier: { name: 'North East Fabrics', phone: '+91 94321 87654' },
    artisans: [
      { name: 'Prativa Gogoi', phone: '+91 98111 44444' },
      { name: 'Junali Saikia', phone: '+91 98111 55555' }
    ]
  },
  {
    id: 'DEAL-103',
    material: 'Terracotta Clay (1,200 kg) & Metal (25 kg)',
    budget: '₹12,000',
    location: 'Asharikandi, Assam',
    supplier: { name: 'Clay Craft India', phone: '+91 95555 66677' },
    artisans: [
      { name: 'Jitul Saikia', phone: '+91 97777 11122' },
      { name: 'Dhiren Paul', phone: '+91 97777 33344' },
      { name: 'Mukul Ray', phone: '+91 97777 55566' },
      { name: 'Sunita Biswas', phone: '+91 97777 77788' }
    ]
  }
]

const INITIAL_ACTIVE_DEALS = [
  {
    id: 'ACTIVE-201',
    material: 'Cotton Yarn (250 kg) & Packaging (300 piece)',
    budget: '₹28,000',
    location: 'Tezpur, Assam',
    status: 'In Transit',
    supplier: { name: 'Valley Tex & Pack', phone: '+91 97060 98765' },
    artisans: [
      { name: 'Mina Chetri', phone: '+91 98540 12345' },
      { name: 'Rina Barman', phone: '+91 98541 67890' }
    ]
  },
  {
    id: 'ACTIVE-202',
    material: 'Metal Fittings (50 kg)',
    budget: '₹15,400',
    location: 'Guwahati, Assam',
    status: 'Out for Delivery',
    supplier: { name: 'Brahmaputra Metals', phone: '+91 98640 44556' },
    artisans: [
      { name: 'Kamala Kanta', phone: '+91 94350 11223' },
      { name: 'Bhaskar Roy', phone: '+91 94350 33445' },
      { name: 'Dipak Sutradhar', phone: '+91 94350 55667' }
    ]
  },
  {
    id: 'ACTIVE-203',
    material: 'Handloom Dyes (25 litre)',
    budget: '₹9,800',
    location: 'Jorhat, Assam',
    status: 'Delivered',
    supplier: { name: 'ColorCraft Assam', phone: '+91 94351 22334' },
    artisans: [
      { name: 'Hiranya Hazarika', phone: '+91 91270 88990' },
      { name: 'Bhabesh Medhi', phone: '+91 91270 66778' }
    ]
  }
]

export default function CoordinatorDashboard() {
  const appState = useAppState ? useAppState() : {}
  const authUser = appState?.authUser

  const [availableDeals, setAvailableDeals] = useState(INITIAL_AVAILABLE_DEALS)
  const [activeDeals, setActiveDeals] = useState(INITIAL_ACTIVE_DEALS)

  // Move deal from Available to Active
  const handleAcceptDeal = (deal) => {
    setAvailableDeals((prev) => prev.filter((d) => d.id !== deal.id))
    setActiveDeals((prev) => [{ ...deal, status: 'In Progress' }, ...prev])
  }

  // Reject / Remove from Available
  const handleRejectDeal = (dealId) => {
    setAvailableDeals((prev) => prev.filter((d) => d.id !== dealId))
  }

  // Advance tracking status sequentially
  const handleCycleStatus = (dealId) => {
    const statusOrder = ['In Progress', 'In Transit', 'Out for Delivery', 'Delivered']
    setActiveDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== dealId) return deal
        const nextIndex = (statusOrder.indexOf(deal.status) + 1) % statusOrder.length
        return { ...deal, status: statusOrder[nextIndex] }
      })
    )
  }

  // Remove deal from Active list (enabled once status is Delivered)
  const handleDeleteActiveDeal = (dealId) => {
    setActiveDeals((prev) => prev.filter((d) => d.id !== dealId))
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
      
      {/* Profile Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>{authUser?.name || 'Venugopal'}</h1>
        <p style={{ color: '#666', margin: '0.25rem 0' }}>3 years experience</p>
        <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ 5.0</div>
      </div>

      {/* Available Deals Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Deals needing a coordinator</h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Open orders needing assigned logistics coordinators. Accept to take ownership or reject to remove.
        </p>

        {availableDeals.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '1rem', background: '#f9f9f9', borderRadius: '6px' }}>
            No open deals right now — all requests have been assigned.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {availableDeals.map((deal) => (
              <div
                key={deal.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{deal.material}</h3>
                  <span style={{ fontWeight: 'bold', color: '#15803d', fontSize: '1rem' }}>{deal.budget}</span>
                </div>

                <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  <strong>Location:</strong> {deal.location}
                </p>

                {/* Artisan Group Contacts */}
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', margin: '0.75rem 0', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>Artisans Group ({deal.artisans.length}):</div>
                  {deal.artisans.map((artisan, i) => (
                    <div key={i} style={{ color: '#475569', marginLeft: '0.5rem' }}>
                      • {artisan.name} — <a href={`tel:${artisan.phone}`} style={{ color: '#2563eb' }}>{artisan.phone}</a>
                    </div>
                  ))}
                  <div style={{ marginTop: '0.5rem', fontWeight: '600', color: '#334155' }}>
                    Supplier: <span style={{ fontWeight: 'normal', color: '#475569' }}>{deal.supplier.name} (<a href={`tel:${deal.supplier.phone}`} style={{ color: '#2563eb' }}>{deal.supplier.phone}</a>)</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleAcceptDeal(deal)}
                    style={{
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Accept Deal
                  </button>
                  <button
                    onClick={() => handleRejectDeal(deal.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Deals Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Your active deals</h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Manage tracking stages. Deals marked as <strong>Delivered</strong> can be cleared from your workspace.
        </p>

        {activeDeals.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '1rem', background: '#f9f9f9', borderRadius: '6px' }}>
            No active deals. Accept a deal above to begin tracking.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {activeDeals.map((deal) => {
              const isDelivered = deal.status === 'Delivered'

              return (
                <div
                  key={deal.id}
                  style={{
                    border: isDelivered ? '1px solid #86efac' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    backgroundColor: isDelivered ? '#f0fdf4' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{deal.material}</h3>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor: isDelivered ? '#dcfce7' : '#e0f2fe',
                        color: isDelivered ? '#166534' : '#0369a1'
                      }}
                    >
                      {deal.status}
                    </span>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    <strong>Location:</strong> {deal.location} | <strong>Budget:</strong> {deal.budget}
                  </p>

                  {/* Artisan Group Contacts */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', padding: '0.75rem', borderRadius: '6px', margin: '0.75rem 0', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '600', color: '#334155' }}>Artisans Group ({deal.artisans.length}):</div>
                    {deal.artisans.map((artisan, i) => (
                      <div key={i} style={{ color: '#475569', marginLeft: '0.5rem' }}>
                        • {artisan.name} — <a href={`tel:${artisan.phone}`} style={{ color: '#2563eb' }}>{artisan.phone}</a>
                      </div>
                    ))}
                    <div style={{ marginTop: '0.4rem', fontWeight: '600', color: '#334155' }}>
                      Supplier: <span style={{ fontWeight: 'normal', color: '#475569' }}>{deal.supplier.name} (<a href={`tel:${deal.supplier.phone}`} style={{ color: '#2563eb' }}>{deal.supplier.phone}</a>)</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleCycleStatus(deal.id)}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Update Status
                    </button>

                    {isDelivered && (
                      <button
                        onClick={() => handleDeleteActiveDeal(deal.id)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Delete Deal
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Reviews */}
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
