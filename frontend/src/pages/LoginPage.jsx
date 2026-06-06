import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  function handleLogin(event) {
    event.preventDefault();
    setErrorMessage('');
    setResetMessage('');

    const result = login(email, password);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    const role = result.user.role;

    if (role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (role === 'captain') {
      navigate('/captain', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  function handleForgotPassword() {
    setErrorMessage('');
    setResetMessage(
      'Password reset is not connected yet. Please contact your association admin to reset your access.'
    );
  }

  return (
    <div className="page-stack login-page">
      <section className="login-shell">
        <div className="login-hero-panel">
          <PageHeader
            title="Welcome Back"
            subtitle="Player, captain, and admin access for the ODA Darts Management System."
          />

          <div className="login-feature-list">
            <div className="login-feature-item">Live competition access</div>
            <div className="login-feature-item">Captain and admin dashboards</div>
            <div className="login-feature-item">Player profiles and match stats</div>
          </div>
        </div>

        <section className="panel premium-panel auth-panel login-card">
        <div className="login-card-header">
  <div className="login-header-row">
    <h3 className="panel-title">Sign in</h3>

    <Link to="/register" className="login-request-link">
      Request Access
    </Link>
  </div>

  <p className="muted-text">Enter your account details below.</p>
</div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-row">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="login-password-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

            {resetMessage ? <div className="form-success">{resetMessage}</div> : null}

            <button type="submit" className="primary-btn auth-submit-btn login-submit-btn">
              Login
            </button>

            <Link to="/register" className="mobile-auth-secondary-link">
              Request access
            </Link>
          </form>
        </section>
      </section>
    </div>
  );
}
