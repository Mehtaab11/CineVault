import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config'

const LibraryContext = createContext(null)

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage write failed', e)
  }
}

export const LibraryProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => readStorage(STORAGE_KEYS.WATCHLIST))
  const [watched, setWatched] = useState(() => readStorage(STORAGE_KEYS.WATCHED))
  const [reviews, setReviews] = useState(() => readStorage(STORAGE_KEYS.REVIEWS))

  // Persist on change
  useEffect(() => { writeStorage(STORAGE_KEYS.WATCHLIST, watchlist) }, [watchlist])
  useEffect(() => { writeStorage(STORAGE_KEYS.WATCHED, watched) }, [watched])
  useEffect(() => { writeStorage(STORAGE_KEYS.REVIEWS, reviews) }, [reviews])

  // Watchlist helpers
  const isInWatchlist = useCallback((id) => watchlist.some(m => m.id === id), [watchlist])
  const addToWatchlist = useCallback((movie) => {
    if (!isInWatchlist(movie.id)) {
      setWatchlist(prev => [{ ...movie, addedAt: new Date().toISOString() }, ...prev])
    }
  }, [isInWatchlist])
  const removeFromWatchlist = useCallback((id) => {
    setWatchlist(prev => prev.filter(m => m.id !== id))
  }, [])

  // Watched helpers
  const isWatched = useCallback((id) => watched.some(m => m.id === id), [watched])
  const markAsWatched = useCallback((movie) => {
    setWatched(prev => {
      const exists = prev.some(m => m.id === movie.id)
      if (!exists) return [{ ...movie, watchedAt: new Date().toISOString() }, ...prev]
      return prev
    })
    // Also remove from watchlist if present
    setWatchlist(prev => prev.filter(m => m.id !== movie.id))
  }, [])
  const removeFromWatched = useCallback((id) => {
    setWatched(prev => prev.filter(m => m.id !== id))
  }, [])

  // Reviews helpers
  const getReview = useCallback((id) => reviews.find(r => r.movieId === id) || null, [reviews])
  const saveReview = useCallback(({ movieId, rating, text, movieTitle, posterPath }) => {
    setReviews(prev => {
      const existing = prev.findIndex(r => r.movieId === movieId)
      const entry = {
        movieId,
        movieTitle,
        posterPath,
        rating,
        text,
        updatedAt: new Date().toISOString(),
        createdAt: existing >= 0 ? prev[existing].createdAt : new Date().toISOString(),
      }
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = entry
        return next
      }
      return [entry, ...prev]
    })
  }, [])
  const deleteReview = useCallback((movieId) => {
    setReviews(prev => prev.filter(r => r.movieId !== movieId))
  }, [])

  const getMovieStatus = useCallback((id) => {
    if (isWatched(id)) return 'watched'
    if (isInWatchlist(id)) return 'watchlist'
    return null
  }, [isWatched, isInWatchlist])

  return (
    <LibraryContext.Provider value={{
      watchlist, watched, reviews,
      isInWatchlist, addToWatchlist, removeFromWatchlist,
      isWatched, markAsWatched, removeFromWatched,
      getReview, saveReview, deleteReview,
      getMovieStatus,
    }}>
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}
