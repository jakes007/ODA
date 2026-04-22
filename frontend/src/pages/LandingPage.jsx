import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import {
  getCompetitionOverview,
  getCompetitionStandings,
  getCompetitionRankings,
  getCompetitionFixtures
} from '../services/competitionData';
import { getPublicLiveFixtureData } from '../services/captainData';
import './LandingPage.css';

export default function LandingPage() {
  const overview = getCompetitionOverview();
  const standings = getCompetitionStandings();
  const rankings = getCompetitionRankings();
  const fixtures = getCompetitionFixtures();

  const latestResults = fixtures.fixtures.slice(0, 5);
  const standingsSnapshot = standings.standings.slice(0, 5);
  const topPlayers = rankings.rankings.slice(0, 5);

  const featuredCompetitions = [
    {
      competitionId: overview.competition.competitionId,
      name: overview.competition.name,
      season: overview.competition.season,
      status: overview.competition.status,
      teams: overview.summary.totalTeams,
      fixtures: overview.summary.totalFixtures
    }
  ];

  const liveFixtures = ['fixture_001', 'fixture_002', 'fixture_003']
    .map((fixtureId) => getPublicLiveFixtureData(fixtureId))
    .filter((fixture) => fixture && fixture.status === 'active');

  return (
    <div className="page-stack landing-page premium-landing">
      <section className="landing-hero panel premium-hero">
        <div className="premium-hero-glow premium-hero-glow-a" />
        <div className="premium-hero-glow premium-hero-glow-b" />

        <div className="landing-hero-content premium-hero-content">
          <div className="premium-association-badge">Observatory Darts Association</div>

          <PageHeader
            title="Where live darts nights, results, and player performance come together"
            subtitle="A premium public hub for live fixtures, competition movement, player profiles, and match-night coverage."
          />

          <div className="premium-hero-actions">
            <Link
              to={liveFixtures.length > 0 ? `/live/${liveFixtures[0].fixtureId}` : '/competition/fixtures'}
              className="primary-btn premium-watch-btn"
            >
              Watch Live
            </Link>
          </div>
        </div>

        <div className="landing-hero-stats premium-hero-stats">
          <StatCard label="Clubs" value={overview.summary.totalTeams} />
          <StatCard label="Teams" value={overview.summary.totalTeams} />
          <StatCard label="Players" value={overview.summary.totalRankedPlayers} />
          <StatCard label="Fixtures" value={overview.summary.totalFixtures} />
        </div>
      </section>

      <section className="panel premium-panel">
      <div className="panel-header">
          <h3 className="panel-title">Live Fixtures Now</h3>
        </div>

        {liveFixtures.length === 0 ? (
          <div className="premium-empty-state">No fixtures are currently live.</div>
        ) : (
          <div className="premium-live-grid">
            {liveFixtures.map((fixture) => (
              <div key={fixture.fixtureId} className="premium-live-card">
                <div className="premium-live-status">
                  <span className="premium-live-dot" />
                  <span>Live Now</span>
                </div>

                <div className="premium-live-fixture-name">{fixture.fixtureName}</div>

                <div className="premium-live-score-row">
                  <div className="premium-live-teams">
                    <div>{fixture.homeTeam.teamName}</div>
                    <div>{fixture.awayTeam.teamName}</div>
                  </div>

                  <div className="premium-live-score">{fixture.scoreText}</div>
                </div>

                <div className="premium-live-meta">
                  <span>{fixture.format?.name ?? 'Fixture format'}</span>
                  <span>{fixture.liveSession?.activeBoardCount ?? 0} active board(s)</span>
                </div>

                <div className="premium-live-actions">
                  <Link to={`/live/${fixture.fixtureId}`} className="secondary-btn premium-live-btn">
                    Watch Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="content-grid landing-grid premium-grid">
  <section className="panel premium-panel premium-card-section">
    <div className="panel-header">
      <h3 className="panel-title">Competitions</h3>
      <Link to="/competition/overview" className="panel-link">
        View all
      </Link>
    </div>

    {featuredCompetitions.map((competition) => (
            <div key={competition.competitionId} className="premium-info-card">
              <div>
                <div className="premium-card-title">
                  {competition.name} • {competition.season}
                </div>
                <div className="muted-text">{formatCompetitionStatus(competition.status)}</div>
              </div>
            </div>
          ))}
  </section>

  <section className="panel premium-panel premium-card-section">
    <div className="panel-header">
      <h3 className="panel-title">Latest Results</h3>
      <Link to="/competition/fixtures" className="panel-link">
        View all
      </Link>
    </div>

    {latestResults.map((fixture) => (
      <div key={fixture.id} className="premium-info-card">
        <div>
          <div className="premium-card-title">{fixture.fixtureName}</div>
          <div className="muted-text">
            {fixture.complete ? 'Completed' : 'Pending'}
          </div>
        </div>

        <div className="premium-result-score">
          {fixture.scoreText}
        </div>
      </div>
    ))}
  </section>
</div>

<div className="content-grid landing-grid premium-grid">
  <section className="panel premium-panel premium-card-section">
    <div className="panel-header">
      <h3 className="panel-title">Standings</h3>
      <Link to="/competition/standings" className="panel-link">
        Full table
      </Link>
    </div>

    <div className="premium-list">
      {standingsSnapshot.map((team, index) => (
                      <div key={team.teamId} className="premium-list-row">
                      <span>
                        {index + 1}. {team.teamName}
                      </span>
                      <span className="premium-points-value">{team.leaguePoints} pts</span>
                    </div>
      ))}
    </div>
  </section>

  <section className="panel premium-panel premium-card-section">
    <div className="panel-header">
      <h3 className="panel-title">Top Players by Average</h3>
      <Link to="/competition/rankings" className="panel-link">
        Full rankings
      </Link>
    </div>

    <div className="premium-list">
      {topPlayers.map((player, index) => (
                      <Link
                      key={player.playerId}
                      to={`/player/${player.playerId}`}
                      className="premium-list-row premium-clickable-row"
                    >
                      <span>
                        {index + 1}. {player.displayName}
                      </span>
                      <span className="premium-average-value">{player.threeDartAverage}</span>
                    </Link>
      ))}
    </div>
  </section>
</div>

      <section className="panel landing-cta premium-panel premium-cta">
        <div>
          <h3 className="panel-title">Players, captains, and admins</h3>
          <p className="page-subtitle">
            Login for existing users or submit an access request to be linked to an official player record.
          </p>
        </div>

        <div className="landing-actions premium-cta-actions">
          <Link to="/login" className="primary-btn premium-login-btn">
            Login
          </Link>
          <Link to="/register" className="secondary-btn premium-register-btn">
            Request Access
          </Link>
        </div>
      </section>
    </div>
  );
}

function formatCompetitionStatus(status) {
  const labels = {
    active: 'Active Competition',
    completed: 'Completed Competition',
    upcoming: 'Upcoming Competition'
  };

  return labels[status] ?? status;
}