import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { getCaptainDashboardData } from '../services/captainData';

export default function CaptainDashboardPage() {
  const { currentUser } = useAuth();
  const data = currentUser?.playerId
    ? getCaptainDashboardData(currentUser.playerId)
    : null;

  if (!data) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Captain Dashboard"
          subtitle="No captain assignment found."
        />

        <section className="panel">
          <p className="muted-text">
            This account does not currently have captain dashboard data linked.
          </p>
        </section>
      </div>
    );
  }

  const totalFixtures = data.fixtures.length;
  const readyForLineups = data.fixtures.filter(
    (fixture) => fixture.status === 'ready_for_lineups'
  ).length;
  const waitingForOpponent = data.fixtures.filter(
    (fixture) => fixture.status === 'waiting_for_opponent'
  ).length;
  const readyToPlay = data.fixtures.filter(
    (fixture) => fixture.status === 'ready_to_play'
  ).length;
  const completed = data.fixtures.filter(
    (fixture) => fixture.status === 'completed'
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Dashboard"
        subtitle={`${data.team.teamName} • ${data.competition.name} ${data.competition.season}`}
      />

      <div className="stats-grid">
        <StatCard label="My Team" value={data.team.teamName} />
        <StatCard label="Fixtures" value={totalFixtures} />
        <StatCard label="Ready For Lineups" value={readyForLineups} />
        <StatCard label="Waiting" value={waitingForOpponent} />
        <StatCard label="Ready To Play" value={readyToPlay} />
        <StatCard label="Completed" value={completed} />
      </div>

      <section className="panel">
        <h3 className="panel-title">Captain Actions</h3>
        <div className="landing-actions">
          <Link to="/captain/fixture/fixture_001/setup" className="primary-btn">
            Open Fixture Setup
          </Link>
          <button type="button" className="secondary-btn">
            Open Fixtures
          </button>
          <button type="button" className="secondary-btn">
            View Team Stats
          </button>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">My Team Fixtures</h3>

        <div className="captain-fixture-list">
          {data.fixtures.map((fixture) => (
            <div key={fixture.fixtureId} className="captain-fixture-card">
              <div className="captain-fixture-main">
                <div className="history-title">{fixture.fixtureName}</div>
                <div className="muted-text">Opponent: {fixture.opponentName}</div>
                <div className="muted-text">Status: {formatStatus(fixture.status)}</div>
                <div className="muted-text">
                  Lineups: {fixture.lineupsRevealed ? 'Revealed' : 'Hidden until both submit'}
                </div>
              </div>

              <div className="captain-fixture-side">
                <div className="fixture-score">{fixture.scoreText}</div>

                <Link
                  to={getCaptainFixtureRoute(fixture)}
                  className="secondary-btn captain-action-btn"
                >
                  {fixture.captainAction}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">What comes next</h3>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Private Lineup Submission</div>
            <div className="muted-text">
              Each captain submits privately. Opposing lineups are hidden until both sides submit.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Match Start Control</div>
            <div className="muted-text">
              A fixture can only move to live play after both captains have submitted.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Multi-Board Live Control</div>
            <div className="muted-text">
              The next phase will support multiple active games and dedicated scoring routes.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCaptainFixtureRoute(fixture) {
  if (fixture.status === 'active') {
    return `/captain/fixture/${fixture.fixtureId}/live`;
  }

  return `/captain/fixture/${fixture.fixtureId}/setup`;
}

function formatStatus(status) {
  const labels = {
    ready_for_lineups: 'Ready For Lineups',
    waiting_for_opponent: 'Waiting For Opponent',
    ready_to_play: 'Ready To Play',
    active: 'Active',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}