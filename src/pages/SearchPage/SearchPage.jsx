import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'
import { searchMovies, getGenres } from '../../api/tmdb'
import MovieCard from '../../components/MovieCard/MovieCard'
import './SearchPage.css'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQ, setDebouncedQ] = useState(query)
  const inputRef = useRef(null)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query)
      if (query) setSearchParams({ q: query })
      else setSearchParams({})
    }, 420)
    return () => clearTimeout(t)
  }, [query])

  // Auto-focus
  useEffect(() => { inputRef.current?.focus() }, [])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQ],
    queryFn: () => searchMovies(debouncedQ),
    enabled: debouncedQ.length >= 2,
    staleTime: 1000 * 60 * 2,
  })

  const results = data?.results || []
  const totalResults = data?.total_results || 0

  return (
    <div className="search-page container">
      {/* Search header */}
      <div className="search-page__header">
        <h1 className="search-page__title">Search Movies</h1>
        <p className="search-page__subtitle">
          Explore the entire TMDB catalogue and add to your personal vault
        </p>
      </div>

      {/* Search bar */}
      <div className="search-bar search-page__bar">
        <FiSearch className="search-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for movies, directors, genres..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="search-input"
          autoComplete="off"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => { setQuery(''); setDebouncedQ('') }}
            aria-label="Clear search"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Results area */}
      <div className="search-page__results">
        {/* Loading */}
        {(isLoading || isFetching) && debouncedQ && (
          <div className="search-page__status">
            <div className="search-page__spinner" />
            <span>Searching...</span>
          </div>
        )}

        {/* Result count */}
        {!isLoading && !isFetching && debouncedQ && results.length > 0 && (
          <div className="search-page__count">
            <span className="search-page__count-num">{totalResults.toLocaleString()}</span> results for
            <strong> "{debouncedQ}"</strong>
          </div>
        )}

        {/* Grid */}
        {results.length > 0 && (
          <div className="movies-grid search-page__grid animate-fade-in">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && debouncedQ.length >= 2 && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🎬</div>
            <h3>No results found</h3>
            <p>Try a different title, director, or genre.</p>
          </div>
        )}

        {/* Initial prompt */}
        {!debouncedQ && (
          <div className="search-page__prompt">
            <div className="search-page__prompt-icon">🔍</div>
            <h2>What are you looking for?</h2>
            <p>Search for any movie to add to your watchlist or diary.</p>
          </div>
        )}
      </div>
    </div>
  )
}
