import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getCaptainLiveScoringData } from '../services/captainData';

export default function CaptainLiveScoringPage() {
  const { fixtureId } = useParams();
  const { currentUser } = useAuth();

  const fixture = currentUser?.playerId
    ? getCaptainLiveScoringData(currentUser.playerId, fixtureId)
    : null;

  if (!fixture) {
    return <EmptyState message="Live scoring fixture not found." />;
  }

  if (fixture.status !== 'active' && fixture.status !== 'completed') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Captain Live Scoring"
          subtitle="This fixture has not been started yet."
        />

        <section className="panel">
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-title">Fixture</div>
              <div className="muted-text">{fixture.fixtureName}</div>
            </div>

            <div className="feature-item">
              <div className="feature-title">Current Status</div>
              <div className="muted-text">{formatStatus(fixture.status)}</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Link to={`/captain/fixture/${fixtureId}/setup`} className="text-link">
              Return to fixture setup
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const orderedPlayers =
    (fixture.submittedLineup ?? fixture.currentLineup ?? [])
      .map((playerId) => fixture.squad.find((player) => player.playerId === playerId))
      .filter(Boolean);

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Live Scoring"
        subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Live Fixture Session</h3>
          <Link to={`/captain/fixture/${fixtureId}/setup`} className="text-link">
            Back to Fixture Setup
          </Link>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">My Team</div>
            <div className="muted-text">{fixture.team.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Opponent</div>
            <div className="muted-text">{fixture.opponent.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Fixture Status</div>
            <div className="muted-text">{formatStatus(fixture.status)}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Score</div>
            <div className="muted-text">{fixture.scoreText}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Submitted Playing Order</h3>

        <div className="feature-list">
          {orderedPlayers.map((player, index) => (
            <div key={player.playerId} className="feature-item">
              <div className="feature-title">
                {index + 1}. {player.displayName}
              </div>
              <div className="muted-text">{player.playerId}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Live Session Status</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Session State</div>
            <div className="muted-text">
              {fixture.liveSession?.status ? formatStatus(fixture.liveSession.status) : 'Not started'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Started At</div>
            <div className="muted-text">
              {fixture.liveSession?.startedAt
                ? new Date(fixture.liveSession.startedAt).toLocaleString()
                : '-'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Current Game Index</div>
            <div className="muted-text">
              {typeof fixture.liveSession?.currentGameIndex === 'number'
                ? fixture.liveSession.currentGameIndex + 1
                : '-'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Games Loaded</div>
            <div className="muted-text">
              {Array.isArray(fixture.liveSession?.games)
                ? fixture.liveSession.games.length
                : 0}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Next Milestone Placeholder</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">What comes next</div>
            <div className="muted-text">
              The next step is fixture-driven live scoring: loading games in order, opening the
              active game, and carrying game results back into fixture progress.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatStatus(status) {
  const labels = {
    ready_for_lineup: 'Ready For Lineup',
    ready_to_play: 'Ready To Play',
    active: 'Active',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}