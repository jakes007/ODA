import PageHeader from '../components/common/PageHeader';

export default function RegisterPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Register"
        subtitle="Create access for player, captain, or admin workflows."
      />

      <section className="panel auth-panel">
        <form className="auth-form">
          <div className="form-row">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              className="form-input"
              type="text"
              placeholder="Enter your full name"
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
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              className="form-input"
              type="text"
              placeholder="Enter your phone number"
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
              placeholder="Enter your association"
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

          <div className="form-row">
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

          <button type="button" className="primary-btn auth-submit-btn">
            Register
          </button>
        </form>
      </section>
    </div>
  );
}