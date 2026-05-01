import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

export default function RegisterPage() {
  return (
    <div className="page-stack register-page">
      <section className="login-shell">
        <div className="login-hero-panel">
          <PageHeader
            title="Request Access"
            subtitle="Submit your details so your account can be linked to an official ODA player registry record."
          />

          <div className="login-feature-list">
            <div className="login-feature-item">Registry-linked player access</div>
            <div className="login-feature-item">Captain and player dashboard access</div>
            <div className="login-feature-item">Secure account review before activation</div>
          </div>
        </div>

        <section className="panel premium-panel auth-panel login-card register-card">
          <div className="login-card-header">
            <div className="login-header-row">
              <h3 className="panel-title">Access Request</h3>

              <Link to="/login" className="login-request-link">
                Login
              </Link>
            </div>

            <p className="muted-text">
              This does not create an official player record. It submits an access
              request that can later be matched to the association registry.
            </p>
          </div>

          <form className="auth-form register-form">
            <div className="register-form-grid">
              <div className="form-row">
                <label className="form-label" htmlFor="firstNames">
                  First Names
                </label>
                <input
                  id="firstNames"
                  className="form-input"
                  type="text"
                  placeholder="Enter your first names"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="surname">
                  Surname
                </label>
                <input
                  id="surname"
                  className="form-input"
                  type="text"
                  placeholder="Enter your surname"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="idNumber">
                  ID Number
                </label>
                <input
                  id="idNumber"
                  className="form-input"
                  type="text"
                  placeholder="Enter your ID number"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="membershipNumber">
                  DSA / Membership Number
                </label>
                <input
                  id="membershipNumber"
                  className="form-input"
                  type="text"
                  placeholder="Enter your membership number"
                />
              </div>

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
                <label className="form-label" htmlFor="cellNumber">
                  Cell Number
                </label>
                <input
                  id="cellNumber"
                  className="form-input"
                  type="text"
                  placeholder="Enter your cell number"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="association">
                  Association
                </label>
                <input
                  id="association"
                  className="form-input"
                  type="text"
                  placeholder="(Optional) Enter your association"
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
                  placeholder="Create a password"
                />
              </div>

              <div className="form-row register-full-row">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  className="form-input"
                  type="password"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button type="button" className="primary-btn auth-submit-btn login-submit-btn">
              Submit Access Request
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}