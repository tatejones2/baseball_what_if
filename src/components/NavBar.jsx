import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/standings', label: 'Standings' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/whatif', label: 'What-If' },
]

function NavBar({ mobileOpen = false, onNavigate }) {
  return (
    <nav className={`nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'is-active' : ''}`
          }
          end={link.to === '/'}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default NavBar
