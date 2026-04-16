import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import {
  getCompetitionOverview,
  getCompetitionStandings,
  getCompetitionRankings,
  getCompetitionFixtures
} from '../services/competitionData';

export default function LandingPage() {
  const overview = getCompetitionOverview();
  const standings = getCompetitionStandings();
  const rankings = getCompetitionRankings();
  const fixtures = getCompetitionFixtures();

  const latestResults = fixtures.fixtures.slice(0, 3);
  const standingsSnapshot = standings.standings.slice(0, 3);
  const topPlayers = rankings.rankings.slice(0, 3);

  return (
    <div className="page-stack landing-page">
      <section className="landing-hero panel">
        <div className="landing-hero-content">
          <div className="landing-badge">
            {overview.competition.name} • {overview.competition.season}
          </div>

          <PageHeader
            title="Live darts hub for players, captains, and supporters"
            subtitle="Fixtures, standings, rankings, player profiles, and live match data in one place."
          />

          <div className="landing-actions">
            <Link to="/competition/overview" className="primary-btn">
              View Competition
            </Link>
            <Link to="/competition/fixtures" className="secondary-btn">
              Latest Results
            </Link>
            <Link to="/player/player_jason" className="secondary-btn">
              Player Profiles
            </Link>
          </div>
        </div>

        <div className="landing-hero-stats">
          <StatCard label="Teams" value={overview.summary.totalTeams} />
          <StatCard label="Ranked Players" value={overview.summary.totalRankedPlayers} />
          <StatCard label="Fixtures" value={overview.summary.totalFixtures} />
          <StatCard label="Completed" value={overview.summary.completedFixtures} />
        </div>
      </section>

      <div className="content-grid landing-grid">
        <section className="panel">
          <div className="section-heading-row">
            <h3 className="panel-title">Latest Results</h3>
            <Link to="/competition/fixtures" className="text-link">
              View all
            </Link>
          </div>

          {latestResults.map((fixture) => (
            <div key={fixture.id} className="result-card">
              <div>
                <div className="result-title">{fixture.fixtureName}</div>
                <div className="muted-text">
                  {fixture.complete ? 'Completed' : 'Pending'}
                </div>
              </div>
              <div className="result-score">{fixture.scoreText}</div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="section-heading-row">
            <h3 className="panel-title">Standings Snapshot</h3>
            <Link to="/competition/standings" className="text-link">
              Full table
            </Link>
          </div>

          {standingsSnapshot.map((team, index) => (
            <div key={team.teamId} className="list-row">
              <span>
                {index + 1}. {team.teamName}
              </span>
              <span>{team.leaguePoints} pts</span>
            </div>
          ))}
        </section>
      </div>

      <div className="content-grid landing-grid">
        <section className="panel">
          <div className="section-heading-row">
            <h3 className="panel-title">Top Players</h3>
            <Link to="/competition/rankings" className="text-link">
              Full rankings
            </Link>
          </div>

          {topPlayers.map((player, index) => (
            <Link
              key={player.playerId}
              to={`/player/${player.playerId}`}
              className="list-row clickable-row"
            >
              <span>
                {index + 1}. {player.displayName}
              </span>
              <span>{player.threeDartAverage}</span>
            </Link>
          ))}
        </section>

        <section className="panel">
          <div className="section-heading-row">
            <h3 className="panel-title">What you can do here</h3>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-title">Track standings</div>
              <div className="muted-text">
                Follow team tables, rankings, and competition movement.
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-title">View player stats</div>
              <div className="muted-text">
                Explore profiles, match history, averages, and checkouts.
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-title">Follow fixtures</div>
              <div className="muted-text">
                See results, fixture progress, and match-by-match outcomes.
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="panel landing-cta">
        <div>
          <h3 className="panel-title">Players, captains, and admins</h3>
          <p className="page-subtitle">
            Login access and dashboards will connect here next as the pilot grows.
          </p>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="primary-btn">
            Login
          </Link>
          <Link to="/register" className="secondary-btn">
            Register
          </Link>
        </div>
      </section>
    </div>
  );
}