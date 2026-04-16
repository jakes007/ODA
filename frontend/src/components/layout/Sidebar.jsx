import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/competition/overview', label: 'Overview' },
  { to: '/competition/standings', label: 'Standings' },
  { to: '/competition/rankings', label: 'Rankings' },
  { to: '/competition/fixtures', label: 'Fixtures' },
  { to: '/player/player_jason', label: 'Player Profile' }
];

export default function Sidebar({ mobile = false, isOpen = false, onClose = null }) {
  const sidebarClassName = mobile
    ? `sidebar mobile-sidebar${isOpen ? ' open' : ''}`
    : 'sidebar';

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">ODA Manager</div>

        {mobile ? (
          <button
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
            type="button"
          >
            ✕
          </button>
        ) : null}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/login"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `sidebar-link sidebar-login-link${isActive ? ' active' : ''}`
          }
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `sidebar-link sidebar-login-link${isActive ? ' active' : ''}`
          }
        >
          Register
        </NavLink>
      </div>
    </aside>
  );
}