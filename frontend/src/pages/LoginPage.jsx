import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import odaLogo from '../assets/oda2-logo-512.webp';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage('');
    setResetMessage('');

    const result = await login(email, password);

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
        <div className="mobile-login-intro">
          <img src={odaLogo} alt="Observatory Darts Association" />
          <h1>Welcome back</h1>
          <p>Sign in to manage fixtures, scores and player stats.</p>
        </div>

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
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" aria-hidden="true" />
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
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

              <div className="auth-input-wrap">
                <LockKeyhole className="auth-input-icon" aria-hidden="true" />
                <input
                  id="password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>

            {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

            {resetMessage ? <div className="form-success">{resetMessage}</div> : null}

            <button type="submit" className="primary-btn auth-submit-btn login-submit-btn">
              <span className="desktop-login-label">Login</span>
              <LogIn className="mobile-login-action-icon" aria-hidden="true" />
              <span className="mobile-login-label">Sign in</span>
            </button>

            <div className="mobile-auth-divider"><span>or</span></div>

            <Link to="/register" className="mobile-auth-secondary-link mobile-request-access-link">
              <ShieldCheck aria-hidden="true" />
              <span>Request access</span>
            </Link>

            <div className="mobile-auth-trust">
              <span>Secure</span><i />
              <span>Trusted</span><i />
              <span>Connected</span>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}
