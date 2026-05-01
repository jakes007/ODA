import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { importedLandingData } from '../data/importedLandingData';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="page-stack admin-dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${currentUser?.displayName ?? 'Admin'}`}
      />

      <div className="stats-grid">
        <StatCard label="Clubs" value={importedLandingData.summary.clubs} />
        <StatCard label="Teams" value={importedLandingData.summary.teams} />
        <StatCard label="Active Players" value={importedLandingData.summary.players} />
        <StatCard label="Fixtures" value={importedLandingData.summary.fixtures} />
      </div>

      <section className="panel premium-panel admin-competition-panel">
  <div className="admin-competition-content">
    <div>
      <div className="admin-section-kicker">Current Competition</div>
      <h3 className="admin-competition-title">Placements</h3>

      <div className="admin-competition-meta">
        <span>Season 2026</span>
        <span>Active</span>
      </div>
    </div>

    <div className="admin-competition-badge">Upper & Lower Div.</div>
  </div>
</section>
    </div>
  );
}