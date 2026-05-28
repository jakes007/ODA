import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import guardiansLogo from '../../assets/guardians-logo.png';
import odaLogo from '../../assets/oda2-logo.png';

const publicNavItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/competition/standings', label: 'Standings', icon: 'trophy' },
  { to: '/competition/rankings', label: 'Rankings', icon: 'chart' },
  { to: '/competition/club-rankings', label: 'Club Rankings', icon: 'target' },
  { to: '/competition/fixtures', label: 'Fixtures', icon: 'calendar' },
  { to: '/player/player_jason', label: 'Player Profile', icon: 'user' }
];

export default function Sidebar({ mobile = false, isOpen = false, onClose = null }) {
  const { currentUser, isAuthenticated, logout } = useAuth();

  const isCaptain = isAuthenticated && currentUser?.role === 'captain';

  const sidebarClassName = mobile
    ? `sidebar premium-sidebar mobile-sidebar${isOpen ? ' open' : ''}`
    : 'sidebar premium-sidebar';

  function handleLogout() {
    logout();
    if (mobile && onClose) onClose();
  }

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-inner">
        <div className="sidebar-top-content">
          <div className="sidebar-brand-row">
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

            <div className="sidebar-logo-wrap">
              <img
                src={isCaptain ? guardiansLogo : odaLogo}
                alt={isCaptain ? 'Guardians Dart Club' : 'Observatory Darts Association'}
              />
            </div>

            <div className="sidebar-brand-copy">
              {isCaptain ? (
                <>
                  <strong>Guardians 3</strong>
                  <span>Captain Portal</span>
                </>
              ) : (
                <>
                  <strong>Observatory</strong>
                  <span>Darts Association</span>
                </>
              )}
            </div>
          </div>

          <div className="sidebar-section-label">Navigation</div>

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
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          {isAuthenticated ? (
            <>
              {isCaptain ? (
                <NavLink
                  to="/captain"
                  onClick={mobile ? onClose : undefined}
                  className={({ isActive }) =>
                    `sidebar-link sidebar-login-link${isActive ? ' active' : ''}`
                  }
                >
                  <Icon name="shield" />
                  <span>Captain Dashboard</span>
                </NavLink>
              ) : null}

              <button
                type="button"
                className="sidebar-link sidebar-action-btn"
                onClick={handleLogout}
              >
                <Icon name="logout" />
                <span>Logout</span>
              </button>
            </>
          ) : null}

          <div className="sidebar-version">v1.0.0</div>
        </div>
      </div>
    </aside>
  );
}

function Icon({ name }) {
  const icons = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /><path d="M9 20v-6h6v6" /></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M6 6H4a3 3 0 0 0 3 3" /><path d="M18 6h2a3 3 0 0 1-3 3" /><path d="M12 13v4" /><path d="M8 21h8" /><path d="M10 17h4" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5" /><path d="M12 16V8" /><path d="M16 16v-3" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    calendar: <><path d="M7 2v4" /><path d="M17 2v4" /><path d="M3 9h18" /><rect x="3" y="4" width="18" height="17" rx="2" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name] || icons.home}</svg>;
}