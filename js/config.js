/**
 * CineVault — Global Configuration
 * Contains TMDB API keys, image CDNs, endpoints, and storage keys.
 */
window.CineVaultConfig = {
  // TMDB API credentials provided by user
  TMDB_API_KEY: '236fb776ea978855c5f9fa63ae50eb99',
  TMDB_READ_ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMzZmYjc3NmVhOTc4ODU1YzVmOWZhNjNhZTUwZWI5OSIsIm5iZiI6MTc5MzI0MDg3NC42LCJzdWIiOiI2YWUyYWYyYTgwZTEwZmRhMTFkMDdmMjUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.6g36cq1nsZZo3LRuwnu51yPfpfKbl5llxvfezmtD36M',
  
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',

  IMG_SIZES: {
    poster: {
      sm: 'https://image.tmdb.org/t/p/w185',
      md: 'https://image.tmdb.org/t/p/w342',
      lg: 'https://image.tmdb.org/t/p/w500',
      xl: 'https://image.tmdb.org/t/p/w780',
      original: 'https://image.tmdb.org/t/p/original',
    },
    backdrop: {
      sm: 'https://image.tmdb.org/t/p/w300',
      md: 'https://image.tmdb.org/t/p/w780',
      lg: 'https://image.tmdb.org/t/p/w1280',
      original: 'https://image.tmdb.org/t/p/original',
    },
    profile: {
      sm: 'https://image.tmdb.org/t/p/w185',
      md: 'https://image.tmdb.org/t/p/h632',
    }
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    WATCHLIST: 'cinevault_watchlist',
    WATCHED: 'cinevault_watched',
    REVIEWS: 'cinevault_reviews',
    PREFERENCES: 'cinevault_preferences',
  },

  // Helper to safely get poster url with fallback
  getPosterUrl(path, size = 'md') {
    if (!path) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513" viewBox="0 0 342 513" fill="%2314161f"><rect width="342" height="513" fill="%2314161f"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%23e50914" font-family="sans-serif" font-size="28" font-weight="bold">CINEVAULT</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif" font-size="14">No Poster Available</text></svg>';
    }
    if (path.startsWith('http')) return path;
    const base = this.IMG_SIZES.poster[size] || this.IMG_SIZES.poster.md;
    return `${base}${path}`;
  },

  // Helper to safely get backdrop url with fallback
  getBackdropUrl(path, size = 'lg') {
    if (!path) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="%230e1017"><rect width="1280" height="720" fill="%230e1017"/><circle cx="640" cy="360" r="120" fill="%23e50914" opacity="0.1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23e50914" font-family="sans-serif" font-size="42" font-weight="bold">CINEVAULT</text></svg>';
    }
    if (path.startsWith('http')) return path;
    const base = this.IMG_SIZES.backdrop[size] || this.IMG_SIZES.backdrop.lg;
    return `${base}${path}`;
  },

  // Helper to safely get cast profile url
  getProfileUrl(path) {
    if (!path) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="185" height="185" viewBox="0 0 185 185" fill="%231a1e29"><rect width="185" height="185" fill="%231a1e29"/><circle cx="92.5" cy="70" r="35" fill="%234b5563"/><path d="M40 160 C40 120, 145 120, 145 160" fill="%234b5563"/></svg>';
    }
    if (path.startsWith('http')) return path;
    return `${this.IMG_SIZES.profile.sm}${path}`;
  }
};
