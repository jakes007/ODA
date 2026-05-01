import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { importedLandingData } from '../data/importedLandingData';
import {
  FiUsers,
  FiShield,
  FiCalendar,
  FiTarget,
  FiInbox,
  FiEdit
} from 'react-icons/fi';


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

<section className="panel premium-panel admin-workflow-panel">
  <div className="panel-header">
    <h3 className="panel-title">Setup & Management Workflow</h3>
  </div>

  <div className="admin-workflow-steps">
    <div className="admin-workflow-step">
      <span>1</span>
      <strong>Season</strong>
      <p>Create & manage</p>
    </div>

    <div className="admin-workflow-step">
      <span>2</span>
      <strong>Competition</strong>
      <p>Create & manage</p>
    </div>

    <div className="admin-workflow-step">
      <span>3</span>
      <strong>Divisions</strong>
      <p>Setup divisions</p>
    </div>

    <div className="admin-workflow-step">
      <span>4</span>
      <strong>Teams</strong>
      <p>Manage teams</p>
    </div>

    <div className="admin-workflow-step">
      <span>5</span>
      <strong>Fixtures</strong>
      <p>Create & generate</p>
    </div>

    <div className="admin-workflow-step">
      <span>6</span>
      <strong>Match Formats</strong>
      <p>Configure rules</p>
    </div>
  </div>
</section>
<section className="panel premium-panel admin-modules-panel">
  <div className="panel-header">
    <h3 className="panel-title">Admin Modules</h3>
  </div>

  <div className="admin-module-grid">
    <div className="admin-module-card premium-module">
      <div className="admin-module-icon blue">
        <FiUsers />
      </div>
      <strong>Registry & Players</strong>
      <p>Manage player records and registry-linked profiles.</p>
    </div>

    <div className="admin-module-card premium-module">
      <div className="admin-module-icon orange">
        <FiShield />
      </div>
      <strong>Teams & Captains</strong>
      <p>Assign players, captains, and team memberships.</p>
    </div>

    <div className="admin-module-card premium-module">
      <div className="admin-module-icon blue">
        <FiCalendar />
      </div>
      <strong>Fixture Generator</strong>
      <p>Create fixtures, board allocations, and match nights.</p>
    </div>

    <div className="admin-module-card premium-module">
      <div className="admin-module-icon orange">
        <FiTarget />
      </div>
      <strong>Live Scoring Control</strong>
      <p>Start scoring sessions and monitor live fixtures.</p>
    </div>

    <div className="admin-module-card premium-module">
      <div className="admin-module-icon blue">
        <FiInbox />
      </div>
      <strong>Access Requests</strong>
      <p>Review registrations and approve account access.</p>
    </div>

    <div className="admin-module-card premium-module">
      <div className="admin-module-icon orange">
        <FiEdit />
      </div>
      <strong>Results & Corrections</strong>
      <p>Review scores, fix mistakes, and verify final results.</p>
    </div>
  </div>
</section>

<div className="content-grid admin-dashboard-grid">
  <section className="panel premium-panel">
    <div className="panel-header">
      <h3 className="panel-title">Recent Admin Activity</h3>
    </div>

    <div className="admin-activity-list">
      <div className="admin-activity-row">
        <strong>Competition data imported</strong>
        <span>Placements 2026</span>
      </div>

      <div className="admin-activity-row">
        <strong>Fixture data verified</strong>
        <span>Upper & Lower divisions</span>
      </div>

      <div className="admin-activity-row">
        <strong>Registry linked</strong>
        <span>Players matched to DSA records</span>
      </div>
    </div>
  </section>

  <section className="panel premium-panel">
    <div className="panel-header">
      <h3 className="panel-title">Upcoming Admin Work</h3>
    </div>

    <div className="admin-activity-list">
      <div className="admin-activity-row">
        <strong>Season setup</strong>
        <span>Create/manage seasons inside admin</span>
      </div>

      <div className="admin-activity-row">
        <strong>Competition builder</strong>
        <span>Replace Excel import workflow</span>
      </div>

      <div className="admin-activity-row">
        <strong>Fixture generator</strong>
        <span>Use templates, boards, and formats</span>
      </div>
    </div>
  </section>
</div>
    </div>
  );
}