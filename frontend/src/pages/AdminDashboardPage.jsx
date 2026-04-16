import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="page-stack">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${currentUser?.displayName ?? 'Admin'}`}
      />

      <div className="stats-grid">
        <StatCard label="Competitions" value={3} />
        <StatCard label="Fixtures" value={12} />
        <StatCard label="Pending Requests" value={4} />
        <StatCard label="Players" value={48} />
      </div>

      <section className="panel">
        <h3 className="panel-title">Admin Actions</h3>
        <div className="landing-actions">
          <button type="button" className="primary-btn">Manage Players</button>
          <button type="button" className="secondary-btn">Manage Fixtures</button>
          <button type="button" className="secondary-btn">Review Requests</button>
        </div>
      </section>
    </div>
  );
}