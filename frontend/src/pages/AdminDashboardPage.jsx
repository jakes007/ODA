import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { importedLandingData } from '../data/importedLandingData';
import {
  FiUsers,
  FiUser,
  FiShield,
  FiCalendar,
  FiTarget,
  FiInbox,
  FiEdit,
  FiAward,
  FiFlag,
  FiLayers,
  FiSettings,
FiChevronRight
} from 'react-icons/fi';


export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="page-stack admin-dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${currentUser?.displayName ?? 'Admin'}`}
      />

<div className="admin-stats-grid">
  <div className="admin-stat-card">
    <div className="admin-stat-icon orange"><FiShield /></div>

    <div className="admin-stat-main">
      <span className="admin-stat-label">Clubs</span>
      <strong className="admin-stat-value">{importedLandingData.summary.clubs}</strong>
    </div>

    <div className="admin-stat-subtext">
      <span>Total</span>
      <strong>Registered Clubs</strong>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon orange"><FiUsers /></div>

    <div className="admin-stat-main">
      <span className="admin-stat-label">Teams</span>
      <strong className="admin-stat-value">{importedLandingData.summary.teams}</strong>
    </div>

    <div className="admin-stat-subtext">
      <span>Total</span>
      <strong>Registered Teams</strong>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon orange"><FiUser /></div>

    <div className="admin-stat-main">
      <span className="admin-stat-label">Active Players</span>
      <strong className="admin-stat-value">{importedLandingData.summary.players}</strong>
    </div>

    <div className="admin-stat-subtext">
      <span>Total</span>
      <strong>Active Players</strong>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon orange"><FiCalendar /></div>

    <div className="admin-stat-main">
      <span className="admin-stat-label">Fixtures</span>
      <strong className="admin-stat-value">{importedLandingData.summary.fixtures}</strong>
    </div>

    <div className="admin-stat-subtext">
      <span>Total</span>
      <strong>Fixtures Scheduled</strong>
    </div>
  </div>
</div>

<section className="panel premium-panel admin-competition-panel">
  

  <div className="admin-competition-content">
    <div className="admin-competition-left">
      <div className="admin-competition-icon">
        <FiAward />
      </div>

      <div>
        <div className="admin-section-kicker">Current Competition</div>
        <h3 className="admin-competition-title">Placements</h3>

        <div className="admin-competition-meta">
          <span>Season 2026</span>
          <span>Active</span>
        </div>
      </div>
    </div>

    <button type="button" className="admin-manage-competition-btn">
      Manage Competition
      <FiChevronRight />
    </button>
  </div>
</section>

<section className="panel premium-panel admin-workflow-panel">
  <div className="panel-header">
    <h3 className="panel-title">Setup & Management Workflow</h3>
  </div>

  <div className="admin-workflow-track">
    {[
      ['01', 'Season', 'Create & manage', <FiFlag />],
      ['02', 'Competition', 'Create & manage', <FiAward />],
      ['03', 'Divisions', 'Setup divisions', <FiLayers />],
      ['04', 'Teams', 'Manage teams', <FiUsers />],
      ['05', 'Fixtures', 'Create & generate', <FiCalendar />],
      ['06', 'Match Formats', 'Configure rules', <FiSettings />]
    ].map(([number, title, text, icon], index) => (
      <div key={number} className="admin-workflow-step">
        <div className="admin-workflow-icon">{icon}</div>
        <div className="admin-workflow-number">{number}</div>

        {index < 5 ? (
          <div className="admin-workflow-arrow">
            <FiChevronRight />
          </div>
        ) : null}

        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    ))}
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

  {/* 🔥 RECENT ACTIVITY */}
  <section className="panel premium-panel">
    <div className="panel-header">
      <h3 className="panel-title">Recent Activity</h3>
    </div>

    <div className="admin-activity-list">

      <div className="admin-activity-row">
        <span className="admin-activity-time">10:42</span>

        <div className="admin-activity-content">
          <strong>New fixture created: Guardians 1 vs Stallion 1 (Upper Division)</strong>
        </div>

        <span className="admin-activity-user">Admin User</span>
      </div>

      <div className="admin-activity-row">
        <span className="admin-activity-time">09:15</span>

        <div className="admin-activity-content">
          <strong>Player assigned: Jason to Guardians 1</strong>
        </div>

        <span className="admin-activity-user">Admin User</span>
      </div>

      <div className="admin-activity-row">
        <span className="admin-activity-time">Yesterday</span>

        <div className="admin-activity-content">
          <strong>Team updated: Best Of Order 1</strong>
        </div>

        <span className="admin-activity-user">Admin User</span>
      </div>

      <div className="admin-activity-row">
        <span className="admin-activity-time">5 May 2026</span>

        <div className="admin-activity-content">
          <strong>Access request approved: New Captain (East Side 1)</strong>
        </div>

        <span className="admin-activity-user">Admin User</span>
      </div>

    </div>

    <div className="admin-activity-footer">
      View All Activity →
    </div>
  </section>


  {/* 🔥 UPCOMING FIXTURES (replaces Admin Work) */}
  <section className="panel premium-panel">
    <div className="panel-header">
      <h3 className="panel-title">Upcoming Fixtures</h3>
      <span className="panel-link">View All Fixtures</span>
    </div>

    <div className="admin-fixtures-list">

      <div className="admin-fixture-row">
        <div className="admin-fixture-date">
          <strong>13</strong>
          <span>May</span>
        </div>

        <div className="admin-fixture-main">
          <strong>Best Of Order 1</strong>
          <span>vs</span>
          <strong>Guardians 1</strong>
        </div>

        <div className="admin-fixture-meta">
          <span className="fixture-badge upper">Upper Division</span>
          <span className="fixture-status">
            Scheduled<br />19:30
          </span>
        </div>
      </div>

      <div className="admin-fixture-row">
        <div className="admin-fixture-date">
          <strong>20</strong>
          <span>May</span>
        </div>

        <div className="admin-fixture-main">
          <strong>Stallion 1</strong>
          <span>vs</span>
          <strong>Cathkin 1</strong>
        </div>

        <div className="admin-fixture-meta">
          <span className="fixture-badge upper">Upper Division</span>
          <span className="fixture-status">
            Scheduled<br />19:30
          </span>
        </div>
      </div>

      <div className="admin-fixture-row">
        <div className="admin-fixture-date">
          <strong>27</strong>
          <span>May</span>
        </div>

        <div className="admin-fixture-main">
          <strong>Guardians 2</strong>
          <span>vs</span>
          <strong>West Point 1</strong>
        </div>

        <div className="admin-fixture-meta">
          <span className="fixture-badge lower">Lower Division</span>
          <span className="fixture-status">
            Scheduled<br />19:30
          </span>
        </div>
      </div>

    </div>

  </section>

</div>
</div>
);
}