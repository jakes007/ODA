import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

export default function LoginPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Login"
        subtitle="Player, captain, and admin access will connect here next."
      />

      <section className="panel auth-panel">
        <form className="auth-form">
          <div className="form-row">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="Enter your email"
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
            />
          </div>

          <button type="button" className="primary-btn auth-submit-btn">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <span className="muted-text">Need an account?</span>
          <Link to="/register" className="text-link">
            Register
          </Link>
        </div>
      </section>
    </div>
  );
}