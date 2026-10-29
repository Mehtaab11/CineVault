// TMDB API Configuration
// Replace YOUR_TMDB_API_KEY_HERE with your actual TMDB v3 API key
// Get one free at: https://www.themoviedb.org/settings/api
export const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const IMG_SIZES = {
  poster: {
    sm: `${TMDB_IMAGE_BASE}/w185`,
    md: `${TMDB_IMAGE_BASE}/w342`,
    lg: `${TMDB_IMAGE_BASE}/w500`,
    xl: `${TMDB_IMAGE_BASE}/w780`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    sm: `${TMDB_IMAGE_BASE}/w300`,
    md: `${TMDB_IMAGE_BASE}/w780`,
    lg: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
}

// Local Storage Keys
export const STORAGE_KEYS = {
  WATCHLIST: 'cinevault_watchlist',
  WATCHED: 'cinevault_watched',
  REVIEWS: 'cinevault_reviews',
}
