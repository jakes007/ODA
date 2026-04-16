import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const publicNavItems = [
  { to: '/', label: 'Home' },
  { to: '/competition/overview', label: 'Overview' },
  { to: '/competition/standings', label: 'Standings' },
  { to: '/competition/rankings', label: 'Rankings' },
  { to: '/competition/fixtures', label: 'Fixtures' },
  { to: '/player/player_jason', label: 'Player Profile' }
];

export default function Sidebar({ mobile = false, isOpen = false, onClose = null }) {
  const { currentUser, isAuthenticated, logout } = useAuth();

  const sidebarClassName = mobile
    ? `sidebar mobile-sidebar${isOpen ? ' open' : ''}`
    : 'sidebar';

  const dashboardLink =
    currentUser?.role === 'admin'
      ? { to: '/admin', label: 'Admin Dashboard' }
      : currentUser?.role === 'captain'
        ? { to: '/captain', label: 'Captain Dashboard' }
        : { to: '/dashboard', label: 'Dashboard' };

  function handleLogout() {
    logout();
    if (mobile && onClose) {
      onClose();
    }
  }

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
        {publicNavItems.map((item) => (
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
        {isAuthenticated ? (
          <>
            <NavLink
              to={dashboardLink.to}
              onClick={mobile ? onClose : undefined}
              className={({ isActive }) =>
                `sidebar-link sidebar-login-link${isActive ? ' active' : ''}`
              }
            >
              {dashboardLink.label}
            </NavLink>

            <button
              type="button"
              className="sidebar-link sidebar-action-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}