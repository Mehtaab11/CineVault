import { IMG_SIZES } from '../../config'
import { useModal } from '../../context/ModalContext'
import { useLibrary } from '../../context/LibraryContext'
import { FiStar, FiPlus, FiCheck } from 'react-icons/fi'
import './MovieCard.css'

const POSTER_PLACEHOLDER = 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Poster'

export default function MovieCard({ movie, size = 'md' }) {
  const { openModal } = useModal()
  const { getMovieStatus, getReview } = useLibrary()

  const status = getMovieStatus(movie.id)
  const review = getReview(movie.id)

  const posterUrl = movie.poster_path
    ? `${IMG_SIZES.poster[size === 'sm' ? 'sm' : 'md']}${movie.poster_path}`
    : POSTER_PLACEHOLDER

  const year = movie.release_date?.slice(0, 4)
  const rating = movie.vote_average?.toFixed(1)

  return (
    <div
      className={`movie-card movie-card--${size}`}
      onClick={() => openModal(movie.id)}
      title={movie.title}
    >
      <img
        src={posterUrl}
        alt={movie.title}
        className="movie-card__poster"
        loading="lazy"
        onError={(e) => { e.target.src = POSTER_PLACEHOLDER }}
      />

      {/* Status badge */}
      {status && (
        <span className={`movie-card__status status--${status}`}>
          {status === 'watched' ? <FiCheck size={10} /> : <FiPlus size={10} />}
          {status === 'watched' ? 'Watched' : 'Watchlist'}
        </span>
      )}

      {/* User rating badge */}
      {review?.rating && (
        <span className="movie-card__rating-badge">
          <FiStar size={9} style={{ fill: 'currentColor' }} />
          {review.rating}
        </span>
      )}

      {/* Hover overlay */}
      <div className="movie-card__overlay">
        <div className="movie-card__title">{movie.title}</div>
        <div className="movie-card__meta">
          {year && <span>{year}</span>}
          {rating && (
            <>
              <span className="movie-card__dot" />
              <span style={{ color: 'var(--gold)' }}>★ {rating}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
