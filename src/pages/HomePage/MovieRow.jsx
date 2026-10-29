import { useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import MovieCard from '../../components/MovieCard/MovieCard'
import './MovieRow.css'

export default function MovieRow({ title, movies = [] }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 600, behavior: 'smooth' })
  }

  if (!movies.length) return null

  return (
    <section className="movie-row section">
      <div className="section__header">
        <h2 className="section__title">
          <span className="section__title-bar" />
          {title}
        </h2>
        <div className="movie-row__arrows">
          <button className="movie-row__arrow" onClick={() => scroll(-1)} aria-label="Scroll left">
            <FiChevronLeft size={18} />
          </button>
          <button className="movie-row__arrow" onClick={() => scroll(1)} aria-label="Scroll right">
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="movie-row__track" ref={scrollRef}>
        {movies.map((movie) => (
          <div key={movie.id} className="movie-row__item">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  )
}
