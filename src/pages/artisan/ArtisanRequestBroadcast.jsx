import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { MATERIAL_CATEGORIES, UNITS } from '../../data/seed.js'
import { specsMatch, isNearby } from '../../utils/matching.js'
import Stepper from '../../components/Stepper.jsx'

export default function ArtisanRequestBroadcast() {
  const [params] = useSearchParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state) || (state.authUser?.role === 'artisan' ? state.authUser : null)

  const defaultDeadline = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const [form, setForm] = useState({
    category: params.get('category') || MATERIAL_CATEGORIES[0],
    specification: params.get('spec') || '',
    quantity: '',
    unit: params.get('unit') || UNITS[0],
    location: params.get('location') || artisan?.storeLocation || '',
    deadline: defaultDeadline,
    note: '',
  })

  if (!artisan) { navigate('/artisan/register'); return null }

  const matchingBroadcasts = state.broadcasts.filter(
    (b) => b.status === 'open' && b.artisanId !== artisan.id &&
      b.category === form.category && specsMatch(b.specification, form.specification) && isNearby(b.location, form.location)
  )

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.specification.trim() || !form.quantity || !form.location.trim()) return
    dispatch({
      type: 'ADD_BROADCAST',
      payload: {
        category: form.category,
        specification: form.specification.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        location: form.location.trim(),
        deadline: form.deadline || defaultDeadline,
        notes: form.note.trim(),
      },
    })
    navigate('/artisan/matching')
  }

  return (
    <div className="page page-narrow">
      <Stepper steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']} current={2} />
      <h1>Broadcast a material request</h1>
      <p>No supplier matched your group yet. Post this and it appears to other artisans with similar needs — once enough of you match, you're grouped for bulk pricing (step 3.2) automatically.</p>

      {matchingBroadcasts.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--thread-green)' }}>
          <strong>{matchingBroadcasts.length} other artisan{matchingBroadcasts.length > 1 ? 's' : ''} already posted a similar request nearby.</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Posting yours below will group you with them automatically.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="field-row">
          <div className="field">
            <label>Material category</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Specification</label>
            <input value={form.specification} onChange={(e) => update('specification', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Quantity</label>
            <input type="number" min="0" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
          </div>
          <div className="field">
            <label>Unit</label>
            <select value={form.unit} onChange={(e) => update('unit', e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={form.location} onChange={(e) => update('location', e.target.value)} />
        </div>
        <div className="field">
          <label>Note to other artisans (optional)</label>
          <textarea rows={2} value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="e.g. Happy to combine orders, flexible on delivery date" />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Post request</button>
      </form>
    </div>
  )
}
