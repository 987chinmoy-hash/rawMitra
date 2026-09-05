import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppState, getCurrentArtisan } from '../context/AppContext.jsx'
import RatingStars from './RatingStars.jsx'

export default function ReviewList({ targetId, targetLabel }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state) || (state.authUser?.role === 'artisan' ? state.authUser : null)

  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const entries = state.ratings[targetId] || []

  function submit(e) {
    e.preventDefault()

    const byId = state.currentUserId || state.authUser?.id || artisan?.id || 'A-1001'

    dispatch({
      type: 'ADD_RATING',
      targetId,
      rating: Number(rating),
      review: review.trim(),
    })

    setSubmitted(true)
    setReview('')
  }

  return (
    <div>
      <h3 style={{ marginBottom: '0.75rem' }}>
        Ratings &amp; reviews {targetLabel ? `for ${targetLabel}` : ''}
      </h3>

      {entries.length === 0 && (
        <p className="field-hint" style={{ marginBottom: '1rem' }}>
          No reviews yet — be the first once a deal is complete.
        </p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {entries.map((r, i) => (
          <div key={i} className="card" style={{ padding: '0.9rem 1.1rem' }}>
            <RatingStars value={r.rating} />
            {r.review && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
                {r.review}
              </p>
            )}
            <span className="field-hint" style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.75rem' }}>
              ✓ Verified Artisan Review · {new Date(r.date || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>

      {submitted ? (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            textAlign: 'center',
            borderRadius: '12px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🎉</div>
          <h3 style={{ margin: '0 0 0.4rem', color: '#166534', fontSize: '1.25rem' }}>
            Thank You, {artisan?.name || 'Artisan'}!
          </h3>
          <p
            style={{
              margin: '0 auto 1.25rem',
              maxWidth: '460px',
              fontSize: '0.92rem',
              color: '#15803d',
              lineHeight: '1.5',
            }}
          >
            Your verified review for <strong>{targetLabel || 'the supplier'}</strong> has been successfully recorded.
            Your feedback protects fellow artisans, promotes transparent pricing, and strengthens our cluster!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/artisan/materials')}
            >
              🧶 Start Next Procurement →
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/artisan/matching')}
            >
              👥 View Group Deals
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.82rem' }}
              onClick={() => setSubmitted(false)}
            >
              Write another note
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card" style={{ padding: '1.2rem' }}>
          <h4 style={{ margin: '0 0 0.85rem', fontSize: '1rem' }}>
            Leave a Review for {targetLabel || 'Supplier'}
          </h4>

          <div className="field" style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="rating" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Your rating
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={{ width: '100%', maxWidth: '200px', padding: '0.45rem 0.6rem', borderRadius: '6px' }}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''} {n === 5 ? '★ (Excellent)' : n === 4 ? '★ (Good)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor="review" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Review notes (optional)
            </label>
            <textarea
              id="review"
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How was the material quality, pricing fairness, or delivery timeliness?"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--line, #cbd5e1)' }}
            />
          </div>

          <button type="submit" className="btn btn-brass">
            ⭐ Submit Review &amp; Complete Order
          </button>
        </form>
      )}
    </div>
  )
}
