import { useModal } from '../../context/ModalContext'
import { useLibrary } from '../../context/LibraryContext'
import { IMG_SIZES } from '../../config'
import { FiPlay, FiBookmark, FiCheck, FiInfo, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './HeroBanner.css'

export default function HeroBanner({ movie }) {
  const { openModal } = useModal()
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isWatched, markAsWatched } = useLibrary()

  const inWatchlist = isInWatchlist(movie.id)
  const watched = isWatched(movie.id)

  const backdropUrl = movie.backdrop_path
    ? `${IMG_SIZES.backdrop.original}${movie.backdrop_path}`
    : null

  const handleWatchlist = (e) => {
    e.stopPropagation()
    if (inWatchlist) {
      removeFromWatchlist(movie.id)
      toast.success('Removed from Watchlist')
    } else {
      addToWatchlist(movie)
      toast.success('Added to Watchlist 🎬')
    }
  }

  const handleWatched = (e) => {
    e.stopPropagation()
    if (!watched) {
      markAsWatched(movie)
      toast.success('Marked as Watched ✅')
    }
  }

  return (
    <div className="hero">
      {backdropUrl && (
        <div
          className="hero__backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      <div className="hero__overlay" />

      <div className="hero__content container">
        <div className="hero__badge">
          <span className="hero__trending-label">🔥 #1 Trending</span>
        </div>

        <h1 className="hero__title">{movie.title}</h1>

        {movie.vote_average > 0 && (
          <div className="hero__rating">
            <FiStar size={16} style={{ fill: 'var(--gold)', color: 'var(--gold)' }} />
            <span>{movie.vote_average.toFixed(1)}</span>
            <span className="hero__rating-label">/ 10 TMDB</span>
            {movie.release_date && (
              <>
                <span className="hero__dot" />
                <span>{movie.release_date.slice(0, 4)}</span>
              </>
            )}
          </div>
        )}

        {movie.overview && (
          <p className="hero__overview">
            {movie.overview.length > 200
              ? `${movie.overview.slice(0, 200)}...`
              : movie.overview}
          </p>
        )}

        <div className="hero__actions">
          <button className="btn btn-primary hero__btn" onClick={() => openModal(movie.id)}>
            <FiInfo size={16} /> More Info
          </button>
          <button
            className={`btn hero__btn ${watched ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleWatched}
          >
            <FiCheck size={16} />
            {watched ? 'Watched' : 'Mark Watched'}
          </button>
          <button
            className="btn btn-secondary hero__btn"
            onClick={handleWatchlist}
            style={inWatchlist ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
          >
            <FiBookmark size={16} style={inWatchlist ? { fill: 'var(--gold)' } : {}} />
            {inWatchlist ? 'In Watchlist' : 'Watchlist'}
          </button>
        </div>
      </div>
    </div>
  )
}
