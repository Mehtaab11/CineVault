/**
 * CineVault — Vault Manager (Personal Movie Diary)
 * Manages Watchlist, Watched History, Star Ratings, and Reviews in localStorage.
 */
window.CineVaultStorage = (function () {
  const keys = window.CineVaultConfig.STORAGE_KEYS;

  function load(key, defaultVal = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultVal;
    }
  }

  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('vaultUpdated', { detail: { key } }));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  return {
    // ---- Watchlist ----
    getWatchlist() {
      return load(keys.WATCHLIST, []);
    },

    isInWatchlist(movieId) {
      const list = this.getWatchlist();
      return list.some(m => String(m.id) === String(movieId));
    },

    addToWatchlist(movie) {
      const list = this.getWatchlist();
      if (!this.isInWatchlist(movie.id)) {
        list.unshift({
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          addedAt: new Date().toISOString()
        });
        save(keys.WATCHLIST, list);
        return true;
      }
      return false;
    },

    removeFromWatchlist(movieId) {
      let list = this.getWatchlist();
      const initialLen = list.length;
      list = list.filter(m => String(m.id) !== String(movieId));
      if (list.length !== initialLen) {
        save(keys.WATCHLIST, list);
        return true;
      }
      return false;
    },

    toggleWatchlist(movie) {
      if (this.isInWatchlist(movie.id)) {
        this.removeFromWatchlist(movie.id);
        return false;
      } else {
        this.addToWatchlist(movie);
        return true;
      }
    },

    // ---- Watched History ----
    getWatched() {
      return load(keys.WATCHED, []);
    },

    isWatched(movieId) {
      const list = this.getWatched();
      return list.some(m => String(m.id) === String(movieId));
    },

    markAsWatched(movie) {
      const list = this.getWatched();
      if (!this.isWatched(movie.id)) {
        list.unshift({
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
          watchedAt: new Date().toISOString()
        });
        save(keys.WATCHED, list);
      }
      // If was in watchlist, prompt or auto remove from watchlist
      this.removeFromWatchlist(movie.id);
      return true;
    },

    removeFromWatched(movieId) {
      let list = this.getWatched();
      list = list.filter(m => String(m.id) !== String(movieId));
      save(keys.WATCHED, list);
      return true;
    },

    toggleWatched(movie) {
      if (this.isWatched(movie.id)) {
        this.removeFromWatched(movie.id);
        return false;
      } else {
        this.markAsWatched(movie);
        return true;
      }
    },

    // ---- Reviews & Ratings ----
    getReviews() {
      return load(keys.REVIEWS, {});
    },

    getReview(movieId) {
      const reviews = this.getReviews();
      return reviews[String(movieId)] || null;
    },

    saveReview(movie, rating, reviewText) {
      const reviews = this.getReviews();
      reviews[String(movie.id)] = {
        movieId: movie.id,
        movieTitle: movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
        rating: Number(rating) || 0,
        reviewText: (reviewText || '').trim(),
        updatedAt: new Date().toISOString()
      };
      save(keys.REVIEWS, reviews);

      // Auto-mark as watched when rated/reviewed
      this.markAsWatched(movie);
      return reviews[String(movie.id)];
    },

    deleteReview(movieId) {
      const reviews = this.getReviews();
      if (reviews[String(movieId)]) {
        delete reviews[String(movieId)];
        save(keys.REVIEWS, reviews);
        return true;
      }
      return false;
    },

    // ---- Vault Stats ----
    getStats() {
      const watchlist = this.getWatchlist();
      const watched = this.getWatched();
      const reviews = Object.values(this.getReviews());

      const totalRatings = reviews.filter(r => r.rating > 0);
      const avgRating = totalRatings.length
        ? (totalRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings.length).toFixed(1)
        : '0.0';

      return {
        watchlistCount: watchlist.length,
        watchedCount: watched.length,
        reviewsCount: reviews.length,
        averageRating: avgRating
      };
    },

    // ---- Export & Import ----
    exportBackup() {
      const data = {
        appName: 'CineVault',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        watchlist: this.getWatchlist(),
        watched: this.getWatched(),
        reviews: this.getReviews()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinevault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importBackup(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');

        if (Array.isArray(data.watchlist)) save(keys.WATCHLIST, data.watchlist);
        if (Array.isArray(data.watched)) save(keys.WATCHED, data.watched);
        if (data.reviews && typeof data.reviews === 'object') save(keys.REVIEWS, data.reviews);

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    clearAll() {
      save(keys.WATCHLIST, []);
      save(keys.WATCHED, []);
      save(keys.REVIEWS, {});
    }
  };
})();
