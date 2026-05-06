import { Link } from 'react-router-dom';

export default function AdminStepNavigation({
  previousTo,
  previousLabel,
  nextTo,
  nextLabel,
  finish = false
}) {
  return (
    <section className="panel premium-panel admin-step-navigation">
      <div className="admin-step-nav-actions">
        {previousTo ? (
          <Link to={previousTo} className="secondary-btn">
            ← {previousLabel}
          </Link>
        ) : (
          <Link to="/admin" className="secondary-btn">
            ← Dashboard
          </Link>
        )}

        <Link to="/admin" className="secondary-btn">
          Dashboard
        </Link>

        {nextTo ? (
          <Link to={nextTo} className="primary-btn">
            {nextLabel} →
          </Link>
        ) : finish ? (
          <Link to="/admin" className="primary-btn">
            Finish →
          </Link>
        ) : null}
      </div>
    </section>
  );
}