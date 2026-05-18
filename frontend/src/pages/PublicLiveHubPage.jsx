import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

import { getActivePublicLiveFixtures } from '../services/captainFixtureService';

export default function PublicLiveHubPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixtures();

    const intervalId = setInterval(() => {
      loadFixtures();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  async function loadFixtures() {
    const liveFixtures = await getActivePublicLiveFixtures();

    setFixtures(liveFixtures);
    setLoading(false);
  }

  const hubStats = useMemo(() => {
    const activeBoards = fixtures.reduce(
      (total, fixture) => total + Number(fixture.liveSession?.activeBoardCount || 0),
      0
    );

    const totalMatchups = fixtures.reduce(
      (total, fixture) => total + Number(fixture.liveSession?.games?.length || 0),
      0
    );

    return {
      liveFixtures: fixtures.length,
      activeBoards,
      totalMatchups
    };
  }, [fixtures]);

  if (loading) {
    return <EmptyState message="Loading live fixtures..." />;
  }

  return (
    <div className="page-stack public-live-hub-page">
      <div className="public-live-hero">
        <div>
          <div className="public-live-kicker">
            <span className="live-dot" />
            Live Scoring
          </div>

          <PageHeader
            title="Live Match Hub"
            subtitle="All fixtures currently being played live"
          />
        </div>

        <div className="public-live-refresh">
          <span>↻</span>
          Auto refresh in 5s
        </div>
      </div>

      <section className="public-live-stats-grid">
  <div className="public-live-stat-card">
    <div className="public-live-stat-icon">☈</div>

    <div>
      <strong>{hubStats.liveFixtures}</strong>
      <span>Live Fixtures</span>
    </div>
  </div>

  <div className="public-live-stat-card">
    <div className="public-live-stat-icon">◎</div>

    <div>
      <strong>{hubStats.activeBoards}</strong>
      <span>Active Boards</span>
    </div>
  </div>

  <div className="public-live-stat-card">
    <div className="public-live-stat-icon">⚔</div>

    <div>
      <strong>{hubStats.totalMatchups}</strong>
      <span>Total Matchups</span>
    </div>
  </div>

  <div className="public-live-stat-card live">
    <div className="public-live-stat-icon">●</div>

    <div>
      <strong>Live</strong>
      <span>Updates</span>
    </div>
  </div>
</section>

      {fixtures.length === 0 ? (
        <section className="panel public-live-empty">
          <div className="public-live-empty-icon">◎</div>
          <h3>No fixtures are currently live</h3>
          <p>Live fixtures will appear here automatically once scoring starts.</p>
        </section>
      ) : (
        <div className="public-live-fixture-list">
          {fixtures.map((fixture) => (
            <article key={fixture.fixtureId} className="public-live-fixture-card">
              <div className="public-live-card-top">
                <div>
                  <div className="public-live-competition">
                    {fixture.competition?.name || 'Live Fixture'} •{' '}
                    {fixture.competition?.season || '2026 Season'}
                  </div>
                </div>

                <span className="public-live-badge">Live</span>
              </div>

              <div className="public-live-score-row">
                <div className="public-live-team home">
                <div className="public-live-team-mark">
  {getTeamInitials(fixture.homeTeam.teamName)}
</div>
                  <h3>{fixture.homeTeam.teamName}</h3>
                </div>

                <div className="public-live-score">
                  {formatScoreText(fixture.scoreText)}
                </div>

                <div className="public-live-team away">
                  <h3>{fixture.awayTeam.teamName}</h3>
                  <div className="public-live-team-mark">
  {getTeamInitials(fixture.awayTeam.teamName)}
</div>
                </div>
              </div>

              <div className="public-live-meta-row">
              <span
  className={
    fixture.status === 'active'
      ? 'public-live-status-pill active'
      : 'public-live-status-pill'
  }
>
  <span className="live-dot" />
  {formatStatus(fixture.status)}
</span>

                <span>{fixture.liveSession?.activeBoardCount ?? 0} active boards</span>

                <span>{fixture.liveSession?.games?.length ?? 0} matchups</span>
              </div>

              <div className="public-live-card-footer">
                <div className="public-live-small-note">
                  Scores update automatically while the fixture is live.
                </div>

                <Link to={`/live/${fixture.fixtureId}`} className="primary-btn public-live-watch-btn">
                  Watch Live →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="public-live-info-card">
        <div className="public-live-info-icon">i</div>
        <div>
          <strong>Live scoring updates automatically.</strong>
          <p>Fixture scores and board activity refresh every few seconds.</p>
        </div>
      </section>
    </div>
  );
}

function getTeamInitials(teamName = '') {
  return teamName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(status) {
  const labels = {
    active: 'In Progress',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}

function formatScoreText(scoreText) {
  if (!scoreText) return '0 - 0';
  return scoreText;
}