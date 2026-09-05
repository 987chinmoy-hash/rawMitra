import { useState } from 'react'
import './CoordinatorDashboard.css' // Ensure styling is linked if applicable

const INITIAL_AVAILABLE_DEALS = [
  {
    id: 'DEAL-101',
    artisans: [
      { name: 'Assam Craft Collective', phone: '+91 98765 43210' },
      { name: 'Pranjal Weavers Group', phone: '+91 98123 45678' },
    ],
    supplier: { name: 'GreenFiber Supplies', phone: '+91 91234 56789' },
    materials: [
      { name: 'Bamboo', quantity: '150', unit: 'piece' },
      { name: 'Packaging', quantity: '200', unit: 'piece' },
    ],
    location: 'Guwahati, Assam',
    trackingStatus: 'Pending Assignment',
  },
  {
    id: 'DEAL-102',
    artisans: [{ name: 'Srimanta Silk Guild', phone: '+91 98111 22233' }],
    supplier: { name: 'Eastern Color & Textile Mills', phone: '+91 94321 87654' },
    materials: [
      { name: 'Yarn', quantity: '45', unit: 'kg' },
      { name: 'Dyes', quantity: '12', unit: 'litre' },
    ],
    location: 'Jorhat, Assam',
    trackingStatus: 'Pending Assignment',
  },
  {
    id: 'DEAL-103',
    artisans: [{ name: 'Terracotta Artisans Society', phone: '+91 97777 88899' }],
    supplier: { name: 'Assam Earth & Ore Co.', phone: '+91 95555 66677' },
    materials: [
      { name: 'Clay', quantity: '800', unit: 'kg' },
      { name: 'Metal', quantity: '25', unit: 'kg' },
    ],
    location: 'Dhubri, Assam',
    trackingStatus: 'Pending Assignment',
  },
]

const INITIAL_ACTIVE_DEALS = [
  {
    id: 'DEAL-201',
    artisans: [
      { name: 'NorthEast Cane Craftsmen', phone: '+91 98540 12345' },
      { name: 'Barpeta Bamboo Works', phone: '+91 98541 67890' },
    ],
    supplier: { name: 'Cane & Craft Distributors', phone: '+91 97060 98765' },
    materials: [
      { name: 'Bamboo', quantity: '500', unit: 'piece' },
      { name: 'Dyes', quantity: '500', unit: 'g' },
    ],
    location: 'Dibrugarh, Assam',
    trackingStatus: 'In Transit',
  },
  {
    id: 'DEAL-202',
    artisans: [{ name: 'Majuli Handloom Artisans', phone: '+91 94350 11223' }],
    supplier: { name: 'TexPack India Ltd.', phone: '+91 98640 44556' },
    materials: [
      { name: 'Yarn', quantity: '250', unit: 'metre' },
      { name: 'Packaging', quantity: '300', unit: 'piece' },
    ],
    location: 'Majuli, Assam',
    trackingStatus: 'Processing at Hub',
  },
  {
    id: 'DEAL-203',
    artisans: [{ name: 'Brahmaputra Pottery Hub', phone: '+91 91270 33445' }],
    supplier: { name: 'Valley Raw Materials', phone: '+91 94351 77889' },
    materials: [
      { name: 'Clay', quantity: '1200', unit: 'kg' },
      { name: 'Metal', quantity: '15', unit: 'kg' },
    ],
    location: 'Tezpur, Assam',
    trackingStatus: 'Out for Delivery',
  },
]

export default function CoordinatorDashboard() {
  const [availableDeals, setAvailableDeals] = useState(INITIAL_AVAILABLE_DEALS)
  const [activeDeals, setActiveDeals] = useState(INITIAL_ACTIVE_DEALS)
  const [selectedDeal, setSelectedDeal] = useState(null)

  function handleAssignCoordinator(deal) {
    const assignedDeal = { ...deal, trackingStatus: 'Assigned - Preparing Dispatch' }
    setAvailableDeals((prev) => prev.filter((item) => item.id !== deal.id))
    setActiveDeals((prev) => [assignedDeal, ...prev])
  }

  return (
    <div className="coordinator-dashboard" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Venugopal</h1>
      <p style={{ color: '#666' }}>3 years experience • ★★★★★ 5.0</p>

      {/* Section 1: Deals Needing a Coordinator */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2>Deals needing a coordinator</h2>
        {availableDeals.length === 0 ? (
          <p style={{ color: '#777' }}>No open deals right now — confirmed orders that need a coordinator will show up here.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {availableDeals.map((deal) => (
              <div key={deal.id} style={{ border: '1px solid #e0e0e0', padding: '1.25rem', borderRadius: '8px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Deal #{deal.id}</h3>
                  <button
                    onClick={() => handleAssignCoordinator(deal)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#2d5a27', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Assign to this Deal
                  </button>
                </div>
                <p><strong>Location:</strong> {deal.location}</p>
                <p>
                  <strong>Materials Needed:</strong>{' '}
                  {deal.materials.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Active Deals */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Your active deals</h2>
        <p style={{ color: '#777' }}>Deals you take on appear here. Click any deal to view full artisan/supplier contact details and tracking info.</p>
        
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              style={{ border: '1px solid #ccc', padding: '1.25rem', borderRadius: '8px', background: '#fafafa', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Deal #{deal.id}</h3>
                <span style={{ padding: '0.25rem 0.75rem', background: '#e2f0d9', color: '#2d5a27', borderRadius: '12px', fontSize: '0.875rem' }}>
                  {deal.trackingStatus}
                </span>
              </div>
              <p style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}><strong>Location:</strong> {deal.location}</p>
              <p style={{ margin: 0 }}>
                <strong>Materials:</strong> {deal.materials.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detail Modal for Selected Active Deal */}
      {selectedDeal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>Deal Details: #{selectedDeal.id}</h2>
            <hr />

            <h4>Artisans Involved:</h4>
            <ul>
              {selectedDeal.artisans.map((artisan, index) => (
                <li key={index}>
                  <strong>{artisan.name}</strong> — Phone: {artisan.phone}
                </li>
              ))}
            </ul>

            <h4>Supplier Details:</h4>
            <p><strong>{selectedDeal.supplier.name}</strong> — Phone: {selectedDeal.supplier.phone}</p>

            <h4>Materials Ordered:</h4>
            <ul>
              {selectedDeal.materials.map((mat, index) => (
                <li key={index}>
                  {mat.name}: {mat.quantity} {mat.unit}
                </li>
              ))}
            </ul>

            <h4>Delivery Location:</h4>
            <p>{selectedDeal.location}</p>

            <h4>Tracking Status:</h4>
            <p style={{ fontWeight: 'bold', color: '#2d5a27' }}>{selectedDeal.trackingStatus}</p>

            <button
              onClick={() => setSelectedDeal(null)}
              style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
