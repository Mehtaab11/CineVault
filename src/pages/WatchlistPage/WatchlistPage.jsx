import { useState } from 'react'
import { FiBookmark, FiCheck, FiTrash2 } from 'react-icons/fi'
import { useLibrary } from '../../context/LibraryContext'
import { useModal } from '../../context/ModalContext'
import { IMG_SIZES } from '../../config'
import toast from 'react-hot-toast'
import './WatchlistPage.css'

const POSTER_PH = 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState('watchlist')
  const { watchlist, watched, removeFromWatchlist, removeFromWatched, markAsWatched } = useLibrary()
  const { openModal } = useModal()

  const items = activeTab === 'watchlist' ? watchlist : watched

  const handleMarkWatched = (e, movie) => {
    e.stopPropagation()
    markAsWatched(movie)
    toast.success(`"${movie.title}" marked as watched ✅`)
  }

  const handleRemove = (e, id, title) => {
    e.stopPropagation()
    if (activeTab === 'watchlist') removeFromWatchlist(id)
    else removeFromWatched(id)
    toast(`"${title}" removed`, { icon: '🗑' })
  }

  return (
    <div className="watchlist-page container">
      <div className="watchlist-page__header">
        <div>
          <h1 className="watchlist-page__title">
            {activeTab === 'watchlist' ? (
              <><FiBookmark /> My Watchlist</>
            ) : (
              <><FiCheck /> Watched</>
            )}
          </h1>
          <p className="watchlist-page__subtitle">
            {activeTab === 'watchlist'
              ? `${watchlist.length} movie${watchlist.length !== 1 ? 's' : ''} queued up`
              : `${watched.length} movie${watched.length !== 1 ? 's' : ''} watched`}
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <FiBookmark size={13} /> Watchlist ({watchlist.length})
          </button>
          <button
            className={`tab ${activeTab === 'watched' ? 'active' : ''}`}
            onClick={() => setActiveTab('watched')}
          >
            <FiCheck size={13} /> Watched ({watched.length})
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            {activeTab === 'watchlist' ? '🍿' : '🎬'}
          </div>
          <h3>
            {activeTab === 'watchlist'
              ? 'Your watchlist is empty'
              : 'No watched movies yet'}
          </h3>
          <p>
            {activeTab === 'watchlist'
              ? 'Browse movies and add them to your watchlist to watch later.'
              : 'Start watching movies and mark them as watched to track your progress.'}
          </p>
        </div>
      ) : (
        <div className="watchlist-grid animate-fade-in">
          {items.map((movie) => {
            const posterUrl = movie.poster_path
              ? `${IMG_SIZES.poster.md}${movie.poster_path}`
              : POSTER_PH
            const addedDate = new Date(movie.addedAt || movie.watchedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })

            return (
              <div
                key={movie.id}
                className="watchlist-card"
                onClick={() => openModal(movie.id)}
              >
                <div className="watchlist-card__poster-wrap">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="watchlist-card__poster"
                    onError={(e) => { e.target.src = POSTER_PH }}
                  />
                  <div className="watchlist-card__poster-overlay">
                    <span className="watchlist-card__view">View Details</span>
                  </div>
                </div>

                <div className="watchlist-card__info">
                  <h3 className="watchlist-card__title">{movie.title}</h3>
                  <div className="watchlist-card__meta">
                    <span>{movie.release_date?.slice(0, 4) || 'Unknown'}</span>
                    {movie.vote_average > 0 && (
                      <>
                        <span className="watchlist-card__dot" />
                        <span style={{ color: 'var(--gold)' }}>
                          ★ {movie.vote_average.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="watchlist-card__date">
                    {activeTab === 'watchlist' ? '📌 Added' : '✅ Watched'} {addedDate}
                  </div>
                  {movie.overview && (
                    <p className="watchlist-card__overview">{movie.overview}</p>
                  )}

                  <div className="watchlist-card__actions">
                    {activeTab === 'watchlist' && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                        onClick={(e) => handleMarkWatched(e, movie)}
                      >
                        <FiCheck size={13} /> Mark Watched
                      </button>
                    )}
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', padding: '7px 14px', color: '#ff6b6b' }}
                      onClick={(e) => handleRemove(e, movie.id, movie.title)}
                    >
                      <FiTrash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
