import { Routes, Route } from 'react-router-dom'
import { LibraryProvider } from './context/LibraryContext'
import { ModalProvider } from './context/ModalContext'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage/HomePage'
import SearchPage from './pages/SearchPage/SearchPage'
import WatchlistPage from './pages/WatchlistPage/WatchlistPage'
import DiaryPage from './pages/DiaryPage/DiaryPage'
import MovieModal from './components/MovieModal/MovieModal'

function App() {
  return (
    <LibraryProvider>
      <ModalProvider>
        <div className="app">
          <Navbar />
          <div className="page-wrapper">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/diary" element={<DiaryPage />} />
            </Routes>
          </div>
          <MovieModal />
        </div>
      </ModalProvider>
    </LibraryProvider>
  )
}

export default App
