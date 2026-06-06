import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/oda-logo.png';

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const {
    currentUser,
    isCaptainPreview,
    logout,
    stopCaptainPreview
  } = useAuth();

  const dashboardRoute = getDashboardRoute(currentUser);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleExitCaptainPreview() {
    stopCaptainPreview();
    navigate('/admin', { replace: true });
  }

  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="topbar-brand">
          <img src={logo} alt="ODA Logo" className="topbar-logo" />
        </div>

        <div className="topbar-actions">
          {currentUser ? (
            <>
              {isCaptainPreview ? (
                <button
                  type="button"
                  className="secondary-btn topbar-action-btn"
                  onClick={handleExitCaptainPreview}
                >
                  Exit Captain Test
                </button>
              ) : null}

              <Link to={dashboardRoute} className="secondary-btn topbar-action-btn">
                My Dashboard
              </Link>

              <button
                type="button"
                className="secondary-btn topbar-action-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="secondary-btn topbar-action-btn">
                Login
              </Link>

              <Link to="/register" className="primary-btn topbar-action-btn">
                Request Access
              </Link>
            </>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation"
          type="button"
        >
          ☰
        </button>
      </div>
    </header>
  );
}

function getDashboardRoute(currentUser) {
  if (!currentUser) return '/login';

  if (currentUser.role === 'admin') {
    return '/admin';
  }

  if (currentUser.role === 'captain') {
    return '/captain';
  }

  return '/dashboard';
}
