import PageHeader from '../components/common/PageHeader';

export default function RegisterPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Request Access"
        subtitle="Submit your details so your account can be linked to an official player registry record."
      />

      <section className="panel auth-panel">
        <div className="muted-text" style={{ marginBottom: '16px' }}>
          This does not directly create an official player record. It submits an access
          request that can later be matched to the association registry.
        </div>

        <form className="auth-form">
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
              placeholder="Enter your membership number if available"
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
            Submit Access Request
          </button>
        </form>
      </section>
    </div>
  );
}