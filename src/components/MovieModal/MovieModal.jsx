import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiBookmark, FiCheck, FiStar, FiPlay, FiClock, FiCalendar, FiGlobe } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getMovieDetails } from '../../api/tmdb'
import { IMG_SIZES } from '../../config'
import { useModal } from '../../context/ModalContext'
import { useLibrary } from '../../context/LibraryContext'
import StarRating from '../StarRating/StarRating'
import './MovieModal.css'

const POSTER_PLACEHOLDER = 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'

export default function MovieModal() {
  const { selectedMovieId, closeModal } = useModal()
  const {
    isInWatchlist, addToWatchlist, removeFromWatchlist,
    isWatched, markAsWatched, removeFromWatched,
    getReview, saveReview, deleteReview,
  } = useLibrary()

  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', selectedMovieId],
    queryFn: () => getMovieDetails(selectedMovieId),
    enabled: !!selectedMovieId,
    staleTime: 1000 * 60 * 10,
  })

  // Load existing review when modal opens
  useEffect(() => {
    if (movie) {
      const existing = getReview(movie.id)
      if (existing) {
        setReviewText(existing.text || '')
        setReviewRating(existing.rating || 0)
      } else {
        setReviewText('')
        setReviewRating(0)
      }
    }
    setActiveTab('overview')
  }, [movie?.id])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  // Prevent body scroll when open
  useEffect(() => {
    if (selectedMovieId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedMovieId])

  if (!selectedMovieId) return null

  const inWatchlist = movie ? isInWatchlist(movie.id) : false
  const watched = movie ? isWatched(movie.id) : false
  const existingReview = movie ? getReview(movie.id) : null

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id)
      toast.success(`Removed from Watchlist`)
    } else {
      addToWatchlist(movie)
      toast.success(`Added to Watchlist 🎬`)
    }
  }

  const handleWatched = () => {
    if (watched) {
      removeFromWatched(movie.id)
      toast.success(`Marked as unwatched`)
    } else {
      markAsWatched(movie)
      toast.success(`Marked as Watched ✅`)
    }
  }

  const handleSaveReview = () => {
    if (!reviewRating && !reviewText.trim()) {
      toast.error('Add a rating or write something first!')
      return
    }
    saveReview({
      movieId: movie.id,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      rating: reviewRating,
      text: reviewText.trim(),
    })
    toast.success('Review saved to your diary! 📝')
  }

  const handleDeleteReview = () => {
    deleteReview(movie.id)
    setReviewText('')
    setReviewRating(0)
    toast.success('Review deleted')
  }

  const backdropUrl = movie?.backdrop_path
    ? `${IMG_SIZES.backdrop.lg}${movie.backdrop_path}`
    : null
  const posterUrl = movie?.poster_path
    ? `${IMG_SIZES.poster.lg}${movie.poster_path}`
    : POSTER_PLACEHOLDER

  const trailer = movie?.videos?.results?.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  )

  const runtime = movie?.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  const cast = movie?.credits?.cast?.slice(0, 8) || []
  const similar = movie?.similar?.results?.slice(0, 6) || []

  return (
    <AnimatePresence>
      {selectedMovieId && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <button className="modal__close" onClick={closeModal} aria-label="Close">
              <FiX size={18} />
            </button>

            {isLoading ? (
              <div className="modal__loading">
                <div className="modal__loading-backdrop skeleton" />
                <div className="modal__loading-content">
                  <div className="skeleton" style={{ width: '40%', height: '28px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '6px', marginTop: '12px' }} />
                  <div className="skeleton" style={{ width: '80%', height: '80px', borderRadius: '6px', marginTop: '16px' }} />
                </div>
              </div>
            ) : movie ? (
              <>
                {/* Hero backdrop */}
                <div className="modal__hero">
                  {backdropUrl && (
                    <img src={backdropUrl} alt="" className="modal__backdrop" />
                  )}
                  <div className="modal__hero-overlay" />

                  <div className="modal__hero-content">
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="modal__poster"
                      onError={(e) => { e.target.src = POSTER_PLACEHOLDER }}
                    />
                    <div className="modal__hero-info">
                      <h1 className="modal__title">{movie.title}</h1>
                      {movie.tagline && (
                        <p className="modal__tagline">"{movie.tagline}"</p>
                      )}
                      <div className="modal__meta-row">
                        {movie.release_date && (
                          <span className="modal__meta-item">
                            <FiCalendar size={13} /> {movie.release_date.slice(0, 4)}
                          </span>
                        )}
                        {runtime && (
                          <span className="modal__meta-item">
                            <FiClock size={13} /> {runtime}
                          </span>
                        )}
                        {movie.vote_average > 0 && (
                          <span className="modal__meta-item modal__meta-item--gold">
                            <FiStar size={13} style={{ fill: 'var(--gold)' }} />
                            {movie.vote_average.toFixed(1)}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>
                              /10
                            </span>
                          </span>
                        )}
                        {movie.original_language && (
                          <span className="modal__meta-item">
                            <FiGlobe size={13} />
                            {movie.original_language.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Genres */}
                      {movie.genres?.length > 0 && (
                        <div className="modal__genres">
                          {movie.genres.map(g => (
                            <span key={g.id} className="tag tag--genre">{g.name}</span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="modal__actions">
                        <button
                          className={`btn ${watched ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={handleWatched}
                        >
                          <FiCheck size={15} />
                          {watched ? 'Watched' : 'Mark Watched'}
                        </button>
                        <button
                          className={`btn ${inWatchlist ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={handleWatchlist}
                          style={inWatchlist ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
                        >
                          <FiBookmark size={15} style={inWatchlist ? { fill: 'var(--gold)' } : {}} />
                          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                        {trailer && (
                          <a
                            href={`https://www.youtube.com/watch?v=${trailer.key}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost"
                          >
                            <FiPlay size={15} /> Trailer
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="modal__body">
                  <div className="tabs" style={{ marginBottom: '24px' }}>
                    {['overview', 'cast', 'review', 'similar'].map(tab => (
                      <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === 'review' && existingReview && (
                          <span style={{
                            marginLeft: '6px', background: 'var(--gold)',
                            color: '#000', borderRadius: '4px', fontSize: '0.6rem',
                            padding: '1px 5px', fontWeight: 700
                          }}>★ {existingReview.rating}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="modal__tab-content animate-fade-in">
                      {movie.overview && (
                        <p className="modal__overview">{movie.overview}</p>
                      )}
                      {movie.budget > 0 && (
                        <div className="modal__stat-row">
                          <div className="modal__stat">
                            <span className="modal__stat-label">Budget</span>
                            <span className="modal__stat-value">
                              ${(movie.budget / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          {movie.revenue > 0 && (
                            <div className="modal__stat">
                              <span className="modal__stat-label">Revenue</span>
                              <span className="modal__stat-value" style={{ color: 'var(--green)' }}>
                                ${(movie.revenue / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          )}
                          {movie.vote_count > 0 && (
                            <div className="modal__stat">
                              <span className="modal__stat-label">Votes</span>
                              <span className="modal__stat-value">
                                {movie.vote_count.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cast Tab */}
                  {activeTab === 'cast' && (
                    <div className="modal__tab-content animate-fade-in">
                      {cast.length > 0 ? (
                        <div className="modal__cast-grid">
                          {cast.map(person => (
                            <div key={person.id} className="modal__cast-item">
                              <div className="modal__cast-avatar">
                                {person.profile_path ? (
                                  <img
                                    src={`${IMG_SIZES.poster.sm}${person.profile_path}`}
                                    alt={person.name}
                                  />
                                ) : (
                                  <div className="modal__cast-placeholder">
                                    {person.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="modal__cast-name">{person.name}</div>
                              <div className="modal__cast-role">{person.character}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No cast info available.</p>
                      )}
                    </div>
                  )}

                  {/* Review Tab */}
                  {activeTab === 'review' && (
                    <div className="modal__tab-content animate-fade-in">
                      <div className="modal__review-section">
                        <div className="modal__review-header">
                          <h3>Your Rating</h3>
                          <StarRating
                            value={reviewRating}
                            onChange={setReviewRating}
                            max={10}
                          />
                        </div>

                        <div className="modal__review-body">
                          <label className="modal__review-label">Your Review</label>
                          <textarea
                            className="modal__review-textarea"
                            placeholder="Write your thoughts about this film... What did you feel? What stood out?"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={5}
                          />
                        </div>

                        <div className="modal__review-actions">
                          <button className="btn btn-primary" onClick={handleSaveReview}>
                            💾 Save to Diary
                          </button>
                          {existingReview && (
                            <button
                              className="btn btn-ghost"
                              onClick={handleDeleteReview}
                              style={{ color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                            >
                              🗑 Delete Review
                            </button>
                          )}
                        </div>

                        {existingReview && (
                          <div className="modal__review-saved">
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Last updated: {new Date(existingReview.updatedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Similar Tab */}
                  {activeTab === 'similar' && (
                    <div className="modal__tab-content animate-fade-in">
                      {similar.length > 0 ? (
                        <div className="modal__similar-grid">
                          {similar.map(m => (
                            <SimilarCard key={m.id} movie={m} onOpen={closeModal} />
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No similar movies found.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Small card used inside Similar tab to avoid circular import
function SimilarCard({ movie, onOpen }) {
  const { openModal } = useModal()
  const posterUrl = movie.poster_path
    ? `${IMG_SIZES.poster.sm}${movie.poster_path}`
    : 'https://via.placeholder.com/150x225/1a1a1a/666666?text=No+Poster'

  return (
    <div
      className="modal__similar-card"
      onClick={() => { onOpen(); openModal(movie.id) }}
      title={movie.title}
    >
      <img src={posterUrl} alt={movie.title} />
      <div className="modal__similar-title">{movie.title}</div>
    </div>
  )
}
