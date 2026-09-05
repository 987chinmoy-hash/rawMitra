import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppState, getCurrentArtisan } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import RatingStars from './RatingStars.jsx'

export default function ReviewList({ targetId, targetLabel, orderId }) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan = getCurrentArtisan(state) || (state.authUser?.role === 'artisan' ? state.authUser : null)

  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [selectedTag, setSelectedTag] = useState('Authentic Quality')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showThankYouModal, setShowThankYouModal] = useState(false)

  const entries = state.ratings[targetId] || []

  // Check if THIS specific order already has a review
  const currentOrder = (state.orders || []).find((o) => o.id === orderId)
  const thisOrderReview =
    currentOrder?.userReview ||
    (orderId ? entries.find((r) => r.orderId === orderId) : null)

  // Estimated arrival / delivery date snapshot
  const arrivalDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)

    const byId = state.currentUserId || state.authUser?.id || artisan?.id || 'A-1001'
    const fullReviewText = selectedTag ? `[${selectedTag}] ${review.trim()}` : review.trim()

    // Try backend sync if available
    if (api.getToken() && orderId) {
      try {
        await api.reviews.add({
          orderId,
          targetId,
          rating: Number(rating),
          reviewText: fullReviewText,
        })
      } catch (err) {
        console.warn('Backend review sync note:', err.message)
      }
    }

    dispatch({
      type: 'ADD_RATING',
      targetId,
      orderId,
      rating: Number(rating),
      review: fullReviewText,
      byId,
    })

    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'completed',
      onboarding_complete: true,
    })

    setSubmitting(false)
    setSubmitted(true)
    setShowThankYouModal(true)
    setReview('')

    // Show Thank You modal for 1.8 to 2 seconds, then smoothly navigate to home page ('/')
    // The user session and login credentials are fully preserved so they can continue buying materials!
    setTimeout(() => {
      navigate('/')
    }, 1850)
  }

  // =========================================================================
  // Case 1: Order-Specific Review (in Shipment Tracking)
  // When an order is tracked, show ONLY review status/form for THIS order.
  // Never show earlier reviews from past orders/batches!
  // =========================================================================
  if (orderId) {
    // If this order was already reviewed (or just submitted now)
    if (thisOrderReview || submitted) {
      const activeReview = thisOrderReview || {
        rating,
        review: selectedTag ? `[${selectedTag}] ${review.trim()}` : review.trim(),
        date: new Date().toISOString(),
      }

      return (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '8px',
          }}
        >
          {showThankYouModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(27, 42, 74, 0.72)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '2.2rem 2.4rem',
                  maxWidth: '500px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.22)',
                  border: '2px solid var(--brass, #c08a28)',
                }}
              >
                <div style={{ fontSize: '3.2rem', marginBottom: '0.4rem' }}>🤝</div>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    margin: '0 0 0.4rem',
                    color: 'var(--ink, #1b2a4a)',
                  }}
                >
                  Thank You for Doing Business with Us!
                </h2>
                <p
                  style={{
                    color: '#15803d',
                    fontWeight: 600,
                    fontSize: '1.02rem',
                    margin: '0 0 0.75rem',
                  }}
                >
                  ✓ Your review has been placed &amp; recorded.
                </p>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    margin: '0.75rem 0 1.25rem',
                    fontSize: '0.88rem',
                    color: 'var(--ink-soft, #475569)',
                    lineHeight: 1.5,
                  }}
                >
                  <span>
                    Your order #{orderId} is placed &amp; recorded. Next batch shipment will arrive by{' '}
                    <strong style={{ color: 'var(--ink, #1b2a4a)' }}>{arrivalDate}</strong>.
                  </span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--ink-soft)',
                    background: '#f1f5f9',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                  }}
                >
                  <span className="spinner" style={{ width: '12px', height: '12px' }}></span>
                  <span>Returning to rawMitra Home... (Stay logged in)</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <strong style={{ color: '#166534', fontSize: '0.98rem' }}>
              ✓ Verified Review Submitted for this Order (#{orderId})
            </strong>
            <RatingStars value={activeReview.rating} />
          </div>

          {activeReview.review && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#14532d' }}>
              {activeReview.review}
            </p>
          )}

          <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.76rem', color: '#16a34a' }}>
            Submitted for {targetLabel || 'Supplier'} &middot; Tied specifically to Order #{orderId}
          </span>
        </div>
      )
    }

    // This order has NOT been reviewed yet: render review form ONLY for this order
    return (
      <form
        onSubmit={submit}
        className="card"
        style={{
          padding: '1.25rem',
          background: '#fdfbf7',
          border: '1.5px solid var(--brass, #c08a28)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--ink)' }}>
            Leave a Review for this Delivery (Order #{orderId})
          </h4>
          <span className="tag tag-brass" style={{ fontSize: '0.75rem' }}>
            {targetLabel || 'Supplier'}
          </span>
        </div>

        <div className="field" style={{ marginBottom: '0.85rem' }}>
          <label
            htmlFor={`rating-${orderId}`}
            style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}
          >
            Your Rating for this order
          </label>
          <select
            id={`rating-${orderId}`}
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

        {/* Quick Quality Tags */}
        <div style={{ marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '0.35rem' }}>
            Quality Highlight:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Authentic Quality', 'Fair Wholesale Price', 'Fast Dispatch', 'Exact Weight', 'Polite Courier'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedTag === tag ? 'var(--brass)' : '#cbd5e1',
                  background: selectedTag === tag ? '#fef3c7' : '#ffffff',
                  color: selectedTag === tag ? '#92400e' : '#475569',
                  cursor: 'pointer',
                  fontWeight: selectedTag === tag ? 700 : 500,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginBottom: '1rem' }}>
          <label
            htmlFor={`review-${orderId}`}
            style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}
          >
            Review notes for this batch (optional)
          </label>
          <textarea
            id={`review-${orderId}`}
            rows={2}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="How was the raw material quality or delivery for this specific order?"
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--line, #cbd5e1)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-brass"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : `⭐ Submit Review for Order #${orderId}`}
        </button>
      </form>
    )
  }

  // =========================================================================
  // Case 2: General/Public Reviews (e.g. Coordinator Dashboard)
  // When no specific orderId is passed, render the public reviews feed.
  // =========================================================================
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

            <span
              className="field-hint"
              style={{
                display: 'block',
                marginTop: '0.3rem',
                fontSize: '0.75rem',
              }}
            >
              ✓ Verified Review {r.orderId ? `(Order #${r.orderId})` : ''} &middot;{' '}
              {new Date(r.date || Date.now()).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

