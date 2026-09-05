import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppState } from '../context/AppContext.jsx'
import RatingStars from './RatingStars.jsx'

export default function ReviewList({ targetId, targetLabel }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const entries = state.ratings[targetId] || []

  

  function submit(e) {
    
    e.preventDefault()
    if (!state.currentUserId) return

    dispatch({
      type: 'ADD_RATING',
      targetId,
      rating: Number(rating),
      review
  })

    setReview('')
    navigate('/')
 }
    
  }

  return (
    <div>
      <h3>Ratings &amp; reviews {targetLabel ? `for ${targetLabel}` : ''}</h3>
      {entries.length === 0 && <p className="field-hint">No reviews yet — be the first once a deal is complete.</p>}
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {entries.map((r, i) => (
          <div key={i} className="card" style={{ padding: '0.9rem 1.1rem' }}>
            <RatingStars value={r.rating} />
            {r.review && <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>{r.review}</p>}
          </div>
        ))}
      </div>
      {state.currentUserId && (
        <form onSubmit={submit} className="card" style={{ padding: '1rem 1.1rem' }}>
          <div className="field">
            <label htmlFor="rating">Your rating</label>
            <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="review">Review (optional)</label>
            <textarea id="review" rows={2} value={review} onChange={(e) => setReview(e.target.value)} placeholder="How was the material quality, pricing or timeliness?" />
          </div>
          <button type="submit" className="btn btn-outline">Submit review</button>
        </form>
      )}
    </div>
  )
}
