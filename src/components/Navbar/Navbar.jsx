import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiSearch, FiBookmark, FiBook, FiFilm } from 'react-icons/fi'
import { useLibrary } from '../../context/LibraryContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { watchlist } = useLibrary()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo">
          <FiFilm className="navbar__logo-icon" />
          <span>Cine<span className="navbar__logo-accent">Vault</span></span>
        </NavLink>

        {/* Desktop nav links */}
        <ul className="navbar__links">
          <li>
            <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              <FiSearch size={14} /> Search
            </NavLink>
          </li>
          <li>
            <NavLink to="/watchlist" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              <FiBookmark size={14} />
              Watchlist
              {watchlist.length > 0 && (
                <span className="navbar__badge">{watchlist.length}</span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/diary" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              <FiBook size={14} /> Diary
            </NavLink>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {[
            { to: '/', label: 'Home' },
            { to: '/search', label: 'Search' },
            { to: '/watchlist', label: `Watchlist (${watchlist.length})` },
            { to: '/diary', label: 'Diary' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `navbar__mobile-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
