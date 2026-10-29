/**
 * CineVault — TMDB API Client
 * Robust fetch client with automatic fallback, trailer detection, and caching.
 */
window.CineVaultAPI = (function () {
  const config = window.CineVaultConfig;
  const fallback = window.CineVaultFallback;

  let isApiOnline = true;
  let statusListeners = [];

  function notifyStatus(online) {
    if (isApiOnline !== online) {
      isApiOnline = online;
      statusListeners.forEach(fn => fn(online));
    }
  }

  function onStatusChange(callback) {
    statusListeners.push(callback);
    callback(isApiOnline);
  }

  // Common fetch with 6s timeout and authorization
  async function fetchTmdb(endpoint, params = {}) {
    const url = new URL(`${config.TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', config.TMDB_API_KEY);
    url.searchParams.set('language', 'en-US');

    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.set(k, params[k]);
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${config.TMDB_READ_ACCESS_TOKEN}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TMDB HTTP error ${response.status}`);
      }

      const data = await response.json();
      notifyStatus(true);
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`TMDB request to ${endpoint} failed, switching to fallback mode:`, err.message);
      notifyStatus(false);
      throw err;
    }
  }

  return {
    isOnline: () => isApiOnline,
    onStatusChange,

    // Trending Movies (day / week)
    async getTrending(timeWindow = 'week') {
      try {
        const data = await fetchTmdb(`/trending/movie/${timeWindow}`);
        return data.results || [];
      } catch (e) {
        return fallback.movies.slice(0, 10);
      }
    },

    // Popular Movies
    async getPopular(page = 1) {
      try {
        const data = await fetchTmdb('/movie/popular', { page });
        return data.results || [];
      } catch (e) {
        return fallback.movies.slice(2, 12);
      }
    },

    // Top Rated
    async getTopRated(page = 1) {
      try {
        const data = await fetchTmdb('/movie/top_rated', { page });
        return data.results || [];
      } catch (e) {
        return [...fallback.movies].sort((a, b) => b.vote_average - a.vote_average);
      }
    },

    // Now Playing
    async getNowPlaying(page = 1) {
      try {
        const data = await fetchTmdb('/movie/now_playing', { page });
        return data.results || [];
      } catch (e) {
        return fallback.movies.slice(0, 6);
      }
    },

    // Upcoming
    async getUpcoming(page = 1) {
      try {
        const data = await fetchTmdb('/movie/upcoming', { page });
        return data.results || [];
      } catch (e) {
        return fallback.movies.slice(4, 10);
      }
    },

    // Movie Details with Credits, Videos, and Recommendations
    async getMovieDetails(movieId) {
      try {
        const data = await fetchTmdb(`/movie/${movieId}`, {
          append_to_response: 'credits,videos,similar,recommendations'
        });
        return data;
      } catch (e) {
        const local = fallback.movies.find(m => m.id === Number(movieId)) || fallback.movies[0];
        return {
          ...local,
          similar: { results: fallback.movies.filter(m => m.id !== local.id).slice(0, 5) }
        };
      }
    },

    // Search Movies
    async searchMovies(query, page = 1) {
      if (!query || !query.trim()) return { results: [], total_results: 0 };
      try {
        const data = await fetchTmdb('/search/movie', {
          query: query.trim(),
          page,
          include_adult: false
        });
        return data;
      } catch (e) {
        const q = query.toLowerCase();
        const results = fallback.movies.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q)
        );
        return { results, total_results: results.length, page: 1, total_pages: 1 };
      }
    },

    // Genres List
    async getGenres() {
      try {
        const data = await fetchTmdb('/genre/movie/list');
        return data.genres || fallback.genres;
      } catch (e) {
        return fallback.genres;
      }
    },

    // Discover Movies by Genre / Sorting
    async discoverMovies({ genreId, sortBy = 'popularity.desc', page = 1 } = {}) {
      try {
        const params = {
          sort_by: sortBy,
          page,
          include_adult: false
        };
        if (genreId && genreId !== 'all') {
          params.with_genres = genreId;
        }
        const data = await fetchTmdb('/discover/movie', params);
        return data;
      } catch (e) {
        let results = [...fallback.movies];
        if (genreId && genreId !== 'all') {
          const gId = Number(genreId);
          results = results.filter(m => m.genre_ids && m.genre_ids.includes(gId));
        }
        if (sortBy === 'vote_average.desc') {
          results.sort((a, b) => b.vote_average - a.vote_average);
        } else if (sortBy === 'release_date.desc') {
          results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        }
        return { results, total_results: results.length, page: 1, total_pages: 1 };
      }
    },

    // Get Official YouTube Trailer Key
    async getTrailer(movieId) {
      try {
        const data = await fetchTmdb(`/movie/${movieId}/videos`);
        const videos = data.results || [];
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                        videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
                        videos.find(v => v.site === 'YouTube');
        return trailer ? trailer.key : null;
      } catch (e) {
        const local = fallback.movies.find(m => m.id === Number(movieId));
        return local ? local.trailer_key : 'Way9Dexny3w';
      }
    }
  };
})();
