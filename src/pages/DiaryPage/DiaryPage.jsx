import { useState } from 'react'
import { FiBook, FiStar, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi'
import { useLibrary } from '../../context/LibraryContext'
import { useModal } from '../../context/ModalContext'
import { IMG_SIZES } from '../../config'
import toast from 'react-hot-toast'
import './DiaryPage.css'

const POSTER_PH = 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'

function StarDisplay({ value, max = 10 }) {
  return (
    <div className="diary-star-display">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < value ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
          ★
        </span>
      ))}
      <span className="diary-star-display__num">{value}/{max}</span>
    </div>
  )
}

export default function DiaryPage() {
  const { reviews, deleteReview, watched } = useLibrary()
  const { openModal } = useModal()
  const [filterQuery, setFilterQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  // Sort & filter
  let displayed = [...reviews]
  if (filterQuery.trim()) {
    const q = filterQuery.toLowerCase()
    displayed = displayed.filter(r =>
      r.movieTitle?.toLowerCase().includes(q) || r.text?.toLowerCase().includes(q)
    )
  }
  if (sortBy === 'rating-high') displayed.sort((a, b) => b.rating - a.rating)
  else if (sortBy === 'rating-low') displayed.sort((a, b) => a.rating - b.rating)
  else displayed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const handleDelete = (e, movieId, title) => {
    e.stopPropagation()
    if (window.confirm(`Delete your review for "${title}"?`)) {
      deleteReview(movieId)
      toast(`Review for "${title}" deleted`, { icon: '🗑' })
    }
  }

  return (
    <div className="diary-page container">
      {/* Header */}
      <div className="diary-page__header">
        <div>
          <h1 className="diary-page__title">
            <FiBook /> My Movie Diary
          </h1>
          <p className="diary-page__subtitle">
            A record of every film you've experienced
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="diary-stats">
        <div className="diary-stat">
          <span className="diary-stat__value">{reviews.length}</span>
          <span className="diary-stat__label">Reviews Written</span>
        </div>
        <div className="diary-stat">
          <span className="diary-stat__value">{watched.length}</span>
          <span className="diary-stat__label">Films Watched</span>
        </div>
        <div className="diary-stat">
          <span className="diary-stat__value" style={{ color: 'var(--gold)' }}>{avgRating}</span>
          <span className="diary-stat__label">Avg Rating</span>
        </div>
        <div className="diary-stat">
          <span className="diary-stat__value" style={{ color: 'var(--netflix-red)' }}>
            {reviews.filter(r => r.rating >= 8).length}
          </span>
          <span className="diary-stat__label">Loved (8+)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📓</div>
          <h3>Your diary is empty</h3>
          <p>
            Click on any movie, go to the <strong>Review</strong> tab,
            rate it and write your thoughts. They'll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Filter / Sort toolbar */}
          <div className="diary-toolbar">
            <div className="search-bar diary-search">
              <FiSearch className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Filter by title or review text..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>
            <select
              className="diary-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3>No matching reviews</h3>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="diary-grid animate-fade-in">
              {displayed.map((review) => {
                const posterUrl = review.posterPath
                  ? `${IMG_SIZES.poster.md}${review.posterPath}`
                  : POSTER_PH
                const date = new Date(review.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })

                return (
                  <div
                    key={review.movieId}
                    className="diary-card"
                    onClick={() => openModal(review.movieId)}
                  >
                    {/* Poster */}
                    <div className="diary-card__poster-col">
                      <img
                        src={posterUrl}
                        alt={review.movieTitle}
                        className="diary-card__poster"
                        onError={(e) => { e.target.src = POSTER_PH }}
                      />
                      {review.rating >= 8 && (
                        <div className="diary-card__love-badge">❤️ Loved</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="diary-card__content">
                      <div className="diary-card__top">
                        <div>
                          <h3 className="diary-card__title">{review.movieTitle}</h3>
                          <div className="diary-card__date">{date}</div>
                        </div>
                        <button
                          className="diary-card__delete"
                          onClick={(e) => handleDelete(e, review.movieId, review.movieTitle)}
                          title="Delete review"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      {review.rating > 0 && (
                        <StarDisplay value={review.rating} />
                      )}

                      {review.text ? (
                        <p className="diary-card__text">{review.text}</p>
                      ) : (
                        <p className="diary-card__text diary-card__text--empty">
                          No written review.
                        </p>
                      )}

                      <div className="diary-card__footer">
                        <span className="diary-card__edit-hint">
                          <FiEdit3 size={11} /> Click to edit review
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
