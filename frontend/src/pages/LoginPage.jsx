import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleLogin(event) {
    event.preventDefault();

    const result = login(email, password);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    const role = result.user.role;
    const from = location.state?.from;

    if (from) {
      navigate(from, { replace: true });
      return;
    }

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

  return (
    <div className="page-stack">
      <PageHeader
        title="Login"
        subtitle="Player, captain, and admin access"
      />

      <section className="panel auth-panel">
        <div className="muted-text" style={{ marginBottom: '16px' }}>
          Demo accounts:
          <br />
          player@oda.com / 123456
          <br />
          captain@oda.com / 123456
          <br />
          admin@oda.com / 123456
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
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage ? (
            <div className="form-error">{errorMessage}</div>
          ) : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted-text">Need access?</span>
          <Link to="/register" className="text-link">
            Request Access
          </Link>
        </div>
      </section>
    </div>
  );
}