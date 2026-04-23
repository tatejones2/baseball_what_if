import { useState } from 'react'
import NavBar from './NavBar'

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-lockup">
          <span className="brand-njit">NJIT</span>
          <span className="brand-highlanders">HIGHLANDERS</span>
        </div>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <NavBar
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
      <div className="header-accent" />
    </header>
  )
}

export default Header
