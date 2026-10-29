# 🎬 CineVault — Personal Movie Diary & Cinematic Universe

A premium, Netflix-inspired movie tracker and personal cinema diary built using pure static technologies (**HTML5**, **Vanilla CSS3**, and **Vanilla JavaScript**). Zero build steps, zero dependencies, zero npm configuration required.

![CineVault](https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg)

---

## ✨ Features

- **Cinematic Hero Spotlight**: Auto-rotating feature banner showcasing trending blockbusters with synopsis, rating badges, direct trailer launch, and watchlist toggle.
- **Categorized Movie Rows**:
  - 🔥 Trending Movies (with Day / Week toggle)
  - ⭐ Top Rated Masterpieces
  - 🍿 Popular Worldwide
  - 🎟️ In Theaters Now
  - 🚀 Anticipated Upcoming Releases
  - Smooth horizontal scrolling with momentum and chevron buttons.
- **Dynamic Explore & Search**:
  - Instant live search with debouncing.
  - Interactive genre filtering chips (Action, Sci-Fi, Drama, Animation, etc.).
  - Sort by Popularity, Highest Rated, and Latest Release.
- **Personal Vault (Movie Diary)**:
  - **Watchlist**: Track movies you plan to watch with single-click remove or mark as watched.
  - **Watched History**: Keep track of films you've already completed.
  - **Reviews & Ratings**: Interactive 5-star rating system with personal review notes, saved locally via `localStorage`.
  - **Live Stats Dashboard**: Watchlist count, Watched count, Total Reviews, and Average User Rating.
  - **Data Backup & Restore**: Export and Import your entire Vault as a `.json` backup file.
- **Rich Movie Details & Trailer Modal**:
  - High-definition backdrop and poster artwork.
  - Embedded YouTube Trailer player with 1-click play.
  - Cast members cards with real actor photos and character roles.
  - In-modal diary logger: rate and save personal review notes on the spot.
- **TMDB Live + Intelligent Offline Demo Mode**:
  - Configured with official TMDB v3 API key & Read Access Token.
  - Automatically falls back to a curated offline dataset if internet is restricted or TMDB is temporarily unreachable, ensuring 100% testability anytime.
- **Toast Notifications**: Sleek floating micro-feedback alerts for user actions.

---

## 🚀 How to Run

Because this is a 100% static project, you have multiple easy options:

### Option 1: Direct File Open
Simply double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari!

### Option 2: Using Any Lightweight HTTP Server
If you'd like to run it with a local server:

- **VS Code**: Right click `index.html` and choose **"Open with Live Server"**.
- **Python**:
  ```bash
  python -m http.server 3000
  ```
  Open `http://localhost:3000` in your browser.
- **Node.js (npx serve)**:
  ```bash
  npx serve .
  ```

---

## 📁 Project Architecture

```
CC Lab/
├── index.html              # Main HTML5 semantic single-page structure
├── css/
│   ├── style.css           # Global tokens, typography, button system, and reset
│   └── components.css      # Navbar, Hero banner, Movie cards, Rows, Vault, Modal, Toasts
├── js/
│   ├── config.js           # TMDB API keys, endpoints, and CDN image formatters
│   ├── fallbackData.js     # Curated offline dataset for 100% reliability
│   ├── api.js              # TMDB fetch client with trailer finder and error resilience
│   ├── vault.js            # LocalStorage personal diary and watchlist manager
│   └── app.js              # Central UI router and event controller
└── README.md               # Documentation
```

---

## 🔑 TMDB API Credentials

Pre-configured in [js/config.js](file:///c:/Users/Sahil%20Aaftaab/Desktop/CC%20Lab/js/config.js):
- **API Key (v3 auth)**: `236fb776ea978855c5f9fa63ae50eb99`
- **Read Access Token (v4 auth)**: Configured in headers for full API access.
