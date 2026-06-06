import { Link } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';

const initialFormValues = {
  firstNames: '',
  surname: '',
  idNumber: '',
  membershipNumber: '',
  email: '',
  cellNumber: '',
  association: '',
  password: '',
  confirmPassword: ''
};

const mobileSteps = [
  { id: 1, shortLabel: 'Personal', title: 'Your details' },
  { id: 2, shortLabel: 'Membership', title: 'Membership details' },
  { id: 3, shortLabel: 'Account', title: 'Secure your account' }
];

export default function RegisterPage() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [mobileStep, setMobileStep] = useState(1);

  function updateField(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

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

          <form className="auth-form register-form register-desktop-form">
            <div className="register-form-grid">
              <AccessField prefix="desktop" name="firstNames" label="First Names" placeholder="Enter your first names" value={formValues.firstNames} onChange={updateField} />
              <AccessField prefix="desktop" name="surname" label="Surname" placeholder="Enter your surname" value={formValues.surname} onChange={updateField} />
              <AccessField prefix="desktop" name="idNumber" label="ID Number" placeholder="Enter your ID number" value={formValues.idNumber} onChange={updateField} />
              <AccessField prefix="desktop" name="membershipNumber" label="DSA / Membership Number" placeholder="Enter your membership number" value={formValues.membershipNumber} onChange={updateField} />
              <AccessField prefix="desktop" name="email" label="Email Address" placeholder="Enter your email" type="email" value={formValues.email} onChange={updateField} />
              <AccessField prefix="desktop" name="cellNumber" label="Cell Number" placeholder="Enter your cell number" value={formValues.cellNumber} onChange={updateField} />
              <AccessField prefix="desktop" name="association" label="Association" placeholder="(Optional) Enter your association" value={formValues.association} onChange={updateField} />
              <AccessField prefix="desktop" name="password" label="Password" placeholder="Create a password" type="password" value={formValues.password} onChange={updateField} />
              <AccessField prefix="desktop" name="confirmPassword" label="Confirm Password" placeholder="Confirm your password" type="password" value={formValues.confirmPassword} onChange={updateField} className="register-full-row" />
            </div>

            <button type="button" className="primary-btn auth-submit-btn login-submit-btn">
              Submit Access Request
            </button>
          </form>

          <form className="auth-form register-mobile-form">
            <div className="mobile-register-progress" aria-label={`Step ${mobileStep} of 3`}>
              {mobileSteps.map((step) => (
                <div
                  key={step.id}
                  className={`mobile-register-progress-step${mobileStep === step.id ? ' active' : ''}${mobileStep > step.id ? ' complete' : ''}`}
                >
                  <span>{step.id}</span>
                  <strong>{step.shortLabel}</strong>
                </div>
              ))}
            </div>

            <div className="mobile-register-step-heading">
              <span>Step {mobileStep} of 3</span>
              <h3>{mobileSteps[mobileStep - 1].title}</h3>
            </div>

            <div className="mobile-register-fields">
              {mobileStep === 1 ? (
                <>
                  <AccessField prefix="mobile" name="firstNames" label="First Names" placeholder="Enter your first names" value={formValues.firstNames} onChange={updateField} />
                  <AccessField prefix="mobile" name="surname" label="Surname" placeholder="Enter your surname" value={formValues.surname} onChange={updateField} />
                  <AccessField prefix="mobile" name="email" label="Email Address" placeholder="Enter your email" type="email" value={formValues.email} onChange={updateField} />
                  <AccessField prefix="mobile" name="cellNumber" label="Cell Number" placeholder="Enter your cell number" value={formValues.cellNumber} onChange={updateField} />
                </>
              ) : null}

              {mobileStep === 2 ? (
                <>
                  <AccessField prefix="mobile" name="idNumber" label="ID Number" placeholder="Enter your ID number" value={formValues.idNumber} onChange={updateField} />
                  <AccessField prefix="mobile" name="membershipNumber" label="DSA / Membership Number" placeholder="Enter your membership number" value={formValues.membershipNumber} onChange={updateField} />
                  <AccessField prefix="mobile" name="association" label="Association" placeholder="(Optional) Enter your association" value={formValues.association} onChange={updateField} />
                </>
              ) : null}

              {mobileStep === 3 ? (
                <>
                  <AccessField prefix="mobile" name="password" label="Password" placeholder="Create a password" type="password" value={formValues.password} onChange={updateField} />
                  <AccessField prefix="mobile" name="confirmPassword" label="Confirm Password" placeholder="Confirm your password" type="password" value={formValues.confirmPassword} onChange={updateField} />
                  <p className="mobile-register-review-note">
                    Your request will be reviewed before access is activated.
                  </p>
                </>
              ) : null}
            </div>

            <div className="mobile-register-actions">
              {mobileStep > 1 ? (
                <button
                  type="button"
                  className="secondary-btn mobile-register-back-btn"
                  onClick={() => setMobileStep((currentStep) => currentStep - 1)}
                >
                  Back
                </button>
              ) : null}

              <button
                type="button"
                className="primary-btn auth-submit-btn login-submit-btn"
                onClick={() => {
                  if (mobileStep < 3) setMobileStep((currentStep) => currentStep + 1);
                }}
              >
                {mobileStep === 3 ? 'Submit Access Request' : 'Continue'}
              </button>
            </div>

            <Link to="/login" className="mobile-auth-secondary-link">
              Already have access? Sign in
            </Link>
          </form>
        </section>
      </section>
    </div>
  );
}

function AccessField({
  prefix,
  name,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className = ''
}) {
  const id = `${prefix}-${name}`;

  return (
    <div className={`form-row${className ? ` ${className}` : ''}`}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="form-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
