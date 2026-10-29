/**
 * CineVault — Main Application Controller
 * Handles Navigation, Home Rows, Search/Filter, Vault Diary, Modal, & Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.CineVaultConfig;
  const api = window.CineVaultAPI;
  const storage = window.CineVaultStorage;
  const fallback = window.CineVaultFallback;

  // State
  let currentView = 'home';
  let heroMovies = [];
  let currentHeroIndex = 0;
  let heroInterval = null;
  let currentTrendingWindow = 'week';
  let activeGenreId = 'all';
  let activeSortBy = 'popularity.desc';
  let searchDebounceTimer = null;
  let activeModalMovie = null;
  let currentSelectedRating = 0;
  let activeVaultTab = 'watchlist';

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const navWatchlistCount = document.getElementById('navWatchlistCount');
  const navWatchedCount = document.getElementById('navWatchedCount');
  const navSearchInput = document.getElementById('navSearchInput');
  const apiStatusText = document.getElementById('apiStatusText');
  const apiStatusDot = document.getElementById('apiStatusDot');

  // Hero Elements
  const heroBanner = document.getElementById('heroBanner');
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroOverview = document.getElementById('heroOverview');
  const heroRatingBadge = document.getElementById('heroRatingBadge');
  const heroYearBadge = document.getElementById('heroYearBadge');
  const heroGenreBadge = document.getElementById('heroGenreBadge');
  const heroPlayTrailerBtn = document.getElementById('heroPlayTrailerBtn');
  const heroWatchlistBtn = document.getElementById('heroWatchlistBtn');
  const heroMoreInfoBtn = document.getElementById('heroMoreInfoBtn');
  const heroCyclerDots = document.getElementById('heroCyclerDots');

  // Rows Elements
  const trendingTrack = document.getElementById('trendingTrack');
  const popularTrack = document.getElementById('popularTrack');
  const topRatedTrack = document.getElementById('topRatedTrack');
  const nowPlayingTrack = document.getElementById('nowPlayingTrack');
  const upcomingTrack = document.getElementById('upcomingTrack');

  // Explore Elements
  const exploreSearchInput = document.getElementById('exploreSearchInput');
  const exploreSearchClear = document.getElementById('exploreSearchClear');
  const genreFilterTrack = document.getElementById('genreFilterTrack');
  const exploreSortSelect = document.getElementById('exploreSortSelect');
  const exploreResultsCount = document.getElementById('exploreResultsCount');
  const exploreMoviesGrid = document.getElementById('exploreMoviesGrid');

  // Vault Elements
  const statWatchlistCount = document.getElementById('statWatchlistCount');
  const statWatchedCount = document.getElementById('statWatchedCount');
  const statReviewsCount = document.getElementById('statReviewsCount');
  const statAvgRating = document.getElementById('statAvgRating');
  const vaultTabBtns = document.querySelectorAll('.vault-tab-btn');
  const vaultContentArea = document.getElementById('vaultContentArea');
  const exportVaultBtn = document.getElementById('exportVaultBtn');
  const importVaultInput = document.getElementById('importVaultInput');
  const importVaultBtn = document.getElementById('importVaultBtn');

  // Modal Elements
  const movieModal = document.getElementById('movieModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalHero = document.getElementById('modalHero');
  const modalVideoContainer = document.getElementById('modalVideoContainer');
  const modalVideoIframe = document.getElementById('modalVideoIframe');
  const modalPlayTrailerBtn = document.getElementById('modalPlayTrailerBtn');
  const modalPosterImg = document.getElementById('modalPosterImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalTagline = document.getElementById('modalTagline');
  const modalRating = document.getElementById('modalRating');
  const modalYear = document.getElementById('modalYear');
  const modalRuntime = document.getElementById('modalRuntime');
  const modalGenres = document.getElementById('modalGenres');
  const modalOverview = document.getElementById('modalOverview');
  const modalWatchlistBtn = document.getElementById('modalWatchlistBtn');
  const modalWatchedBtn = document.getElementById('modalWatchedBtn');
  const modalCastTrack = document.getElementById('modalCastTrack');
  const modalStarBtns = document.querySelectorAll('.star-btn');
  const modalRatingLabel = document.getElementById('modalRatingLabel');
  const modalReviewNotes = document.getElementById('modalReviewNotes');
  const modalSaveReviewBtn = document.getElementById('modalSaveReviewBtn');

  // Toasts
  const toastContainer = document.getElementById('toastContainer');

  // --------------------------------------------------------------------------
  // 1. Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✓';
    if (type === 'danger') icon = '✕';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-closing');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 2. Navigation & View Routing
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    currentView = viewName;

    // Update active nav link
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Update active view section
    viewSections.forEach(section => {
      section.classList.toggle('active', section.id === `${viewName}View`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'explore') {
      loadExploreMovies();
    } else if (viewName === 'vault') {
      renderVault();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) switchView(view);
    });
  });

  // Navbar scroll background effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Global search input in navbar
  navSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = navSearchInput.value.trim();
      if (q) {
        switchView('explore');
        exploreSearchInput.value = q;
        triggerExploreSearch();
      }
    }
  });

  // --------------------------------------------------------------------------
  // 3. API Status Listener
  // --------------------------------------------------------------------------
  api.onStatusChange((online) => {
    if (online) {
      apiStatusDot.classList.remove('offline');
      apiStatusText.textContent = 'TMDB Live';
    } else {
      apiStatusDot.classList.add('offline');
      apiStatusText.textContent = 'Demo Mode';
    }
  });

  // --------------------------------------------------------------------------
  // 4. Vault Badges & Counters Synchronization
  // --------------------------------------------------------------------------
  function updateVaultCounters() {
    const stats = storage.getStats();
    if (navWatchlistCount) navWatchlistCount.textContent = stats.watchlistCount;
    if (navWatchedCount) navWatchedCount.textContent = stats.watchedCount;
    if (statWatchlistCount) statWatchlistCount.textContent = stats.watchlistCount;
    if (statWatchedCount) statWatchedCount.textContent = stats.watchedCount;
    if (statReviewsCount) statReviewsCount.textContent = stats.reviewsCount;
    if (statAvgRating) statAvgRating.textContent = `${stats.averageRating} ★`;
  }

  window.addEventListener('vaultUpdated', () => {
    updateVaultCounters();
    // Update card badges if any are rendered
    document.querySelectorAll('.card-vault-badge').forEach(badge => {
      const movieId = badge.dataset.id;
      if (!movieId) return;
      const inWatchlist = storage.isInWatchlist(movieId);
      const isWatched = storage.isWatched(movieId);

      badge.classList.toggle('in-watchlist', inWatchlist);
      badge.classList.toggle('watched', isWatched);
      badge.innerHTML = isWatched ? '✓' : inWatchlist ? '★' : '+';
    });

    if (currentView === 'vault') {
      renderVault();
    }
  });

  // --------------------------------------------------------------------------
  // 5. Card Component Builder
  // --------------------------------------------------------------------------
  function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;

    const posterUrl = config.getPosterUrl(movie.poster_path, 'md');
    const rating = (movie.vote_average || 0).toFixed(1);
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const inWatchlist = storage.isInWatchlist(movie.id);
    const isWatched = storage.isWatched(movie.id);

    card.innerHTML = `
      <div class="movie-poster-wrap">
        <img class="movie-poster-img" src="${posterUrl}" alt="${movie.title || 'Movie'}" loading="lazy" />
        <div class="card-rating-badge">★ ${rating}</div>
        <div class="card-vault-badge ${isWatched ? 'watched' : inWatchlist ? 'in-watchlist' : ''}" data-id="${movie.id}">
          ${isWatched ? '✓' : inWatchlist ? '★' : '+'}
        </div>
        <div class="card-hover-overlay">
          <div class="card-overlay-actions">
            <button class="btn btn-primary btn-sm card-quick-play-btn" data-id="${movie.id}">▶ Trailer</button>
            <button class="btn btn-secondary btn-sm card-quick-watchlist-btn" data-id="${movie.id}">
              ${inWatchlist ? '✓ Added' : '+ List'}
            </button>
          </div>
        </div>
      </div>
      <div class="movie-card-info">
        <h4 class="movie-card-title" title="${movie.title}">${movie.title}</h4>
        <div class="movie-card-meta">
          <span>${releaseYear}</span>
          <span>Movie</span>
        </div>
      </div>
    `;

    // Click on card opens modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-quick-play-btn')) {
        e.stopPropagation();
        openMovieModal(movie.id, true);
        return;
      }
      if (e.target.closest('.card-quick-watchlist-btn')) {
        e.stopPropagation();
        const added = storage.toggleWatchlist(movie);
        showToast(added ? `Added "${movie.title}" to Watchlist` : `Removed "${movie.title}" from Watchlist`, added ? 'success' : 'info');
        return;
      }
      openMovieModal(movie.id, false);
    });

    return card;
  }

  function renderCardsToTrack(track, movies) {
    track.innerHTML = '';
    if (!movies || movies.length === 0) {
      track.innerHTML = '<p class="text-secondary" style="padding: 1rem;">No movies available.</p>';
      return;
    }
    movies.forEach(m => {
      track.appendChild(createMovieCard(m));
    });
  }

  // --------------------------------------------------------------------------
  // 6. Hero Spotlight Banner
  // --------------------------------------------------------------------------
  function setHeroMovie(index) {
    if (!heroMovies || heroMovies.length === 0) return;
    currentHeroIndex = (index + heroMovies.length) % heroMovies.length;
    const movie = heroMovies[currentHeroIndex];

    const backdropUrl = config.getBackdropUrl(movie.backdrop_path, 'lg');
    heroBanner.style.backgroundImage = `url('${backdropUrl}')`;

    heroTitle.textContent = movie.title;
    heroTagline.textContent = movie.tagline || 'Experience the cinematic masterpiece.';
    heroOverview.textContent = movie.overview || 'Explore details and trailer inside CineVault.';
    heroRatingBadge.innerHTML = `★ ${(movie.vote_average || 0).toFixed(1)} TMDB`;
    heroYearBadge.textContent = movie.release_date ? movie.release_date.split('-')[0] : '2024';

    // Find genre name
    if (movie.genre_ids && movie.genre_ids.length) {
      const g = fallback.genres.find(x => x.id === movie.genre_ids[0]);
      heroGenreBadge.textContent = g ? g.name : 'Cinema';
    } else if (movie.genres && movie.genres.length) {
      heroGenreBadge.textContent = movie.genres[0].name;
    } else {
      heroGenreBadge.textContent = 'Feature';
    }

    // Update watchlist button state
    const inWatchlist = storage.isInWatchlist(movie.id);
    heroWatchlistBtn.innerHTML = inWatchlist ? '✓ In Watchlist' : '+ Watchlist';

    // Update dots
    document.querySelectorAll('.cycler-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentHeroIndex);
    });

    // Button event listeners
    heroPlayTrailerBtn.onclick = () => openMovieModal(movie.id, true);
    heroMoreInfoBtn.onclick = () => openMovieModal(movie.id, false);
    heroWatchlistBtn.onclick = () => {
      const added = storage.toggleWatchlist(movie);
      heroWatchlistBtn.innerHTML = added ? '✓ In Watchlist' : '+ Watchlist';
      showToast(added ? `Added "${movie.title}" to Watchlist` : `Removed "${movie.title}" from Watchlist`, added ? 'success' : 'info');
    };
  }

  function startHeroAutoRotate() {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      setHeroMovie(currentHeroIndex + 1);
    }, 7500);
  }

  // --------------------------------------------------------------------------
  // 7. Load Home Data
  // --------------------------------------------------------------------------
  async function loadHomeContent() {
    try {
      const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.all([
        api.getTrending(currentTrendingWindow),
        api.getPopular(),
        api.getTopRated(),
        api.getNowPlaying(),
        api.getUpcoming(),
      ]);

      heroMovies = (trending && trending.length > 0) ? trending.slice(0, 5) : fallback.movies.slice(0, 5);

      // Render dots
      heroCyclerDots.innerHTML = '';
      heroMovies.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `cycler-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          setHeroMovie(idx);
          startHeroAutoRotate();
        });
        heroCyclerDots.appendChild(dot);
      });

      setHeroMovie(0);
      startHeroAutoRotate();

      renderCardsToTrack(trendingTrack, trending);
      renderCardsToTrack(popularTrack, popular);
      renderCardsToTrack(topRatedTrack, topRated);
      renderCardsToTrack(nowPlayingTrack, nowPlaying);
      renderCardsToTrack(upcomingTrack, upcoming);
    } catch (err) {
      console.error('Error loading home data:', err);
      // Fallback rendering
      heroMovies = fallback.movies.slice(0, 5);
      setHeroMovie(0);
      renderCardsToTrack(trendingTrack, fallback.movies);
      renderCardsToTrack(popularTrack, fallback.movies);
    }
  }

  // Trending Day/Week Toggle
  document.querySelectorAll('.row-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.row-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTrendingWindow = btn.dataset.window;
      const data = await api.getTrending(currentTrendingWindow);
      renderCardsToTrack(trendingTrack, data);
    });
  });

  // Row Scroll Buttons
  document.querySelectorAll('.row-scroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.track;
      const track = document.getElementById(trackId);
      if (!track) return;
      const scrollAmt = btn.classList.contains('scroll-left') ? -600 : 600;
      track.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    });
  });

  // --------------------------------------------------------------------------
  // 8. Explore & Search Page
  // --------------------------------------------------------------------------
  async function setupExploreGenres() {
    const genres = await api.getGenres();
    genreFilterTrack.innerHTML = '';

    const allChip = document.createElement('button');
    allChip.className = 'genre-chip active';
    allChip.dataset.genre = 'all';
    allChip.textContent = 'All Genres';
    genreFilterTrack.appendChild(allChip);

    genres.forEach(g => {
      const chip = document.createElement('button');
      chip.className = 'genre-chip';
      chip.dataset.genre = g.id;
      chip.textContent = g.name;
      genreFilterTrack.appendChild(chip);
    });

    genreFilterTrack.addEventListener('click', (e) => {
      const chip = e.target.closest('.genre-chip');
      if (!chip) return;
      document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeGenreId = chip.dataset.genre;
      loadExploreMovies();
    });
  }

  async function loadExploreMovies() {
    const query = exploreSearchInput.value.trim();
    exploreMoviesGrid.innerHTML = '<div class="skeleton" style="height: 300px; grid-column: 1/-1;"></div>';

    let data;
    if (query) {
      data = await api.searchMovies(query);
    } else {
      data = await api.discoverMovies({
        genreId: activeGenreId,
        sortBy: activeSortBy
      });
    }

    const movies = data.results || [];
    exploreResultsCount.textContent = `Showing ${movies.length} titles`;

    exploreMoviesGrid.innerHTML = '';
    if (movies.length === 0) {
      exploreMoviesGrid.innerHTML = `
        <div class="vault-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No Movies Found</h3>
          <p class="empty-desc">Try searching for another title, or select another genre.</p>
        </div>
      `;
      return;
    }

    movies.forEach(m => {
      exploreMoviesGrid.appendChild(createMovieCard(m));
    });
  }

  function triggerExploreSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadExploreMovies();
    }, 320);
  }

  exploreSearchInput.addEventListener('input', () => {
    exploreSearchClear.style.display = exploreSearchInput.value ? 'block' : 'none';
    triggerExploreSearch();
  });

  exploreSearchClear.addEventListener('click', () => {
    exploreSearchInput.value = '';
    exploreSearchClear.style.display = 'none';
    loadExploreMovies();
  });

  exploreSortSelect.addEventListener('change', () => {
    activeSortBy = exploreSortSelect.value;
    loadExploreMovies();
  });

  // --------------------------------------------------------------------------
  // 9. Personal Vault Diary Page
  // --------------------------------------------------------------------------
  function renderVault() {
    updateVaultCounters();
    vaultTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeVaultTab);
    });

    vaultContentArea.innerHTML = '';

    if (activeVaultTab === 'watchlist') {
      const list = storage.getWatchlist();
      if (list.length === 0) {
        vaultContentArea.innerHTML = `
          <div class="vault-empty-state">
            <div class="empty-icon">🍿</div>
            <h3 class="empty-title">Your Watchlist is Empty</h3>
            <p class="empty-desc">Browse trending films or search your favorite cinema to plan your next movie night.</p>
            <button class="btn btn-primary" onclick="window.switchCineVaultView('explore')">Explore Titles</button>
          </div>
        `;
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'movies-grid';
      list.forEach(m => grid.appendChild(createMovieCard(m)));
      vaultContentArea.appendChild(grid);
    } else if (activeVaultTab === 'watched') {
      const list = storage.getWatched();
      if (list.length === 0) {
        vaultContentArea.innerHTML = `
          <div class="vault-empty-state">
            <div class="empty-icon">🎬</div>
            <h3 class="empty-title">No Watched History Yet</h3>
            <p class="empty-desc">Log films you've watched, rate your experience, and build your cinema diary.</p>
            <button class="btn btn-primary" onclick="window.switchCineVaultView('home')">Find Movies</button>
          </div>
        `;
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'movies-grid';
      list.forEach(m => grid.appendChild(createMovieCard(m)));
      vaultContentArea.appendChild(grid);
    } else if (activeVaultTab === 'reviews') {
      const reviewsObj = storage.getReviews();
      const reviews = Object.values(reviewsObj).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      if (reviews.length === 0) {
        vaultContentArea.innerHTML = `
          <div class="vault-empty-state">
            <div class="empty-icon">⭐</div>
            <h3 class="empty-title">No Reviews Written</h3>
            <p class="empty-desc">Click any movie to rate it, write your personal review notes, and track your thoughts.</p>
            <button class="btn btn-primary" onclick="window.switchCineVaultView('home')">Browse Movies</button>
          </div>
        `;
        return;
      }

      const reviewsGrid = document.createElement('div');
      reviewsGrid.className = 'reviews-grid';

      reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        const posterUrl = config.getPosterUrl(r.poster_path, 'sm');
        const starsHtml = '★'.repeat(r.rating) + '☆'.repeat(Math.max(0, 5 - r.rating));
        const formattedDate = new Date(r.updatedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        card.innerHTML = `
          <div class="review-card-header">
            <img class="review-movie-poster" src="${posterUrl}" alt="${r.movieTitle}" />
            <div class="review-header-details">
              <h4 class="review-movie-title">${r.movieTitle}</h4>
              <div class="review-stars">${starsHtml} <span style="font-size: 0.8rem; margin-left: 0.3rem;">(${r.rating}/5)</span></div>
              <div class="review-date">Logged on ${formattedDate}</div>
            </div>
          </div>
          <div class="review-body">
            "${r.reviewText || 'No written thoughts, just pure cinema vibes.'}"
          </div>
          <div class="review-card-footer">
            <button class="btn btn-glass btn-sm" onclick="window.openCineVaultModal('${r.movieId}')">Edit Review</button>
            <button class="btn btn-glass btn-sm" style="color: var(--brand-red);" onclick="window.deleteCineVaultReview('${r.movieId}')">Delete</button>
          </div>
        `;
        reviewsGrid.appendChild(card);
      });

      vaultContentArea.appendChild(reviewsGrid);
    }
  }

  vaultTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeVaultTab = btn.dataset.tab;
      renderVault();
    });
  });

  // Vault Export / Import
  exportVaultBtn.addEventListener('click', () => {
    storage.exportBackup();
    showToast('Vault backup JSON downloaded!', 'success');
  });

  importVaultBtn.addEventListener('click', () => {
    importVaultInput.click();
  });

  importVaultInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = storage.importBackup(evt.target.result);
      if (res.success) {
        showToast('Vault data restored successfully!', 'success');
        renderVault();
      } else {
        showToast(`Import error: ${res.error}`, 'danger');
      }
    };
    reader.readAsText(file);
  });

  // --------------------------------------------------------------------------
  // 10. Movie Details & Trailer Modal
  // --------------------------------------------------------------------------
  async function openMovieModal(movieId, autoPlayTrailer = false) {
    try {
      modalVideoContainer.classList.remove('active');
      modalVideoIframe.src = '';
      modalHero.style.display = 'flex';

      movieModal.classList.add('open');
      document.body.style.overflow = 'hidden';

      const movie = await api.getMovieDetails(movieId);
      activeModalMovie = movie;

      // Populate hero backdrop
      const backdropUrl = config.getBackdropUrl(movie.backdrop_path, 'original');
      modalHero.style.backgroundImage = `url('${backdropUrl}')`;

      // Populate poster
      modalPosterImg.src = config.getPosterUrl(movie.poster_path, 'lg');
      modalTitle.textContent = movie.title || movie.name;
      modalTagline.textContent = movie.tagline || '';
      modalRating.textContent = `★ ${(movie.vote_average || 0).toFixed(1)} / 10`;
      modalYear.textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
      modalRuntime.textContent = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Feature';

      // Genres
      modalGenres.innerHTML = '';
      const genresList = movie.genres || [];
      genresList.forEach(g => {
        const badge = document.createElement('span');
        badge.className = 'badge badge-muted';
        badge.textContent = g.name;
        modalGenres.appendChild(badge);
      });

      modalOverview.textContent = movie.overview || 'No synopsis available.';

      // Watchlist & Watched buttons state
      updateModalVaultButtons();

      // Cast
      modalCastTrack.innerHTML = '';
      const cast = (movie.credits && movie.credits.cast) ? movie.credits.cast.slice(0, 8) : [];
      if (cast.length > 0) {
        cast.forEach(c => {
          const card = document.createElement('div');
          card.className = 'cast-card';
          card.innerHTML = `
            <img class="cast-avatar" src="${config.getProfileUrl(c.profile_path)}" alt="${c.name}" loading="lazy" />
            <div class="cast-name">${c.name}</div>
            <div class="cast-role">${c.character || 'Cast'}</div>
          `;
          modalCastTrack.appendChild(card);
        });
      } else {
        modalCastTrack.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">Cast information not available.</span>';
      }

      // Populate Existing Review
      const existingReview = storage.getReview(movie.id);
      if (existingReview) {
        currentSelectedRating = existingReview.rating || 0;
        modalReviewNotes.value = existingReview.reviewText || '';
      } else {
        currentSelectedRating = 0;
        modalReviewNotes.value = '';
      }
      updateStarRatingDisplay(currentSelectedRating);

      // Play trailer handler
      modalPlayTrailerBtn.onclick = async () => {
        playTrailer(movie.id);
      };

      if (autoPlayTrailer) {
        playTrailer(movie.id);
      }
    } catch (err) {
      console.error('Error opening movie modal:', err);
    }
  }

  async function playTrailer(movieId) {
    const key = await api.getTrailer(movieId);
    if (key) {
      modalVideoIframe.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
      modalHero.style.display = 'none';
      modalVideoContainer.classList.add('active');
    } else {
      showToast('Trailer not available for this title.', 'info');
    }
  }

  function closeMovieModal() {
    movieModal.classList.remove('open');
    document.body.style.overflow = '';
    modalVideoContainer.classList.remove('active');
    modalVideoIframe.src = '';
    activeModalMovie = null;
  }

  modalCloseBtn.addEventListener('click', closeMovieModal);
  movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) closeMovieModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && movieModal.classList.contains('open')) {
      closeMovieModal();
    }
  });

  function updateModalVaultButtons() {
    if (!activeModalMovie) return;
    const inWatchlist = storage.isInWatchlist(activeModalMovie.id);
    const isWatched = storage.isWatched(activeModalMovie.id);

    modalWatchlistBtn.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-glass'}`;
    modalWatchlistBtn.innerHTML = inWatchlist ? '✓ In Watchlist' : '+ Watchlist';

    modalWatchedBtn.className = `btn ${isWatched ? 'btn-primary' : 'btn-glass'}`;
    modalWatchedBtn.style.background = isWatched ? 'var(--accent-green)' : '';
    modalWatchedBtn.innerHTML = isWatched ? '✓ Watched' : 'Mark Watched';
  }

  modalWatchlistBtn.addEventListener('click', () => {
    if (!activeModalMovie) return;
    const added = storage.toggleWatchlist(activeModalMovie);
    updateModalVaultButtons();
    showToast(added ? `Added "${activeModalMovie.title}" to Watchlist` : `Removed from Watchlist`, added ? 'success' : 'info');
  });

  modalWatchedBtn.addEventListener('click', () => {
    if (!activeModalMovie) return;
    const watched = storage.toggleWatched(activeModalMovie);
    updateModalVaultButtons();
    showToast(watched ? `Marked "${activeModalMovie.title}" as Watched` : `Removed from Watched History`, watched ? 'success' : 'info');
  });

  // Star Rating Interaction
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Masterpiece!'];

  function updateStarRatingDisplay(rating) {
    modalStarBtns.forEach(btn => {
      const val = Number(btn.dataset.val);
      btn.classList.toggle('active', val <= rating);
    });
    modalRatingLabel.textContent = rating ? `${rating} / 5 (${ratingLabels[rating]})` : 'Tap to rate';
  }

  modalStarBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const val = Number(btn.dataset.val);
      modalStarBtns.forEach(b => {
        b.classList.toggle('hovered', Number(b.dataset.val) <= val);
      });
    });

    btn.addEventListener('mouseleave', () => {
      modalStarBtns.forEach(b => b.classList.remove('hovered'));
    });

    btn.addEventListener('click', () => {
      currentSelectedRating = Number(btn.dataset.val);
      updateStarRatingDisplay(currentSelectedRating);
    });
  });

  modalSaveReviewBtn.addEventListener('click', () => {
    if (!activeModalMovie) return;
    if (currentSelectedRating === 0) {
      showToast('Please select a star rating first!', 'info');
      return;
    }
    storage.saveReview(activeModalMovie, currentSelectedRating, modalReviewNotes.value);
    showToast(`Saved review for "${activeModalMovie.title}"!`, 'success');
    updateModalVaultButtons();
  });

  // Global helper functions for inline clicks
  window.switchCineVaultView = switchView;
  window.openCineVaultModal = (id) => openMovieModal(id, false);
  window.deleteCineVaultReview = (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      storage.deleteReview(id);
      showToast('Review deleted', 'info');
    }
  };

  // --------------------------------------------------------------------------
  // 11. Initial Application Boot
  // --------------------------------------------------------------------------
  async function init() {
    updateVaultCounters();
    await setupExploreGenres();
    await loadHomeContent();
  }

  init();
});
