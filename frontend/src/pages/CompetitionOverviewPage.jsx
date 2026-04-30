import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { getCompetitionOverview } from '../services/competitionData';

export default function CompetitionOverviewPage() {
  const data = getCompetitionOverview();

  return (
    <div className="page-stack">
      <PageHeader
        title={`${data.competition.name} Overview`}
        subtitle={`${data.competition.season} • ${data.competition.status}`}
      />

      <div className="stats-grid">
        <StatCard label="Teams" value={data.summary.totalTeams} />
        <StatCard label="Ranked Players" value={data.summary.totalRankedPlayers} />
        <StatCard label="Fixtures" value={data.summary.totalFixtures} />
        <StatCard label="Completed" value={data.summary.completedFixtures} />
      </div>

      <div className="content-grid">
      <section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Top Teams</h3>
  </div>

  <div className="overview-list">
    {data.topTeams.map((team) => (
      <div key={team.teamName} className="overview-card">
        <span className="overview-main">{team.teamName}</span>
        <span className="overview-highlight">{team.leaguePoints} pts</span>
      </div>
    ))}
  </div>
</section>

<section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Top Players</h3>
  </div>

  <div className="overview-list">
    {data.topPlayers.map((player) => (
      <div key={player.playerId} className="overview-card">
        <span className="overview-main">{player.displayName}</span>
        <span className="overview-highlight">{player.threeDartAverage}</span>
      </div>
    ))}
  </div>
</section>
      </div>

      <section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Recent Fixtures</h3>
  </div>

  <div className="fixtures-list">
    {data.recentFixtures.map((fixture) => (
      <div key={fixture.fixtureName} className="fixture-result-card">
        <div>
          <h3 className="fixture-result-title">{fixture.fixtureName}</h3>
        </div>

        <div className="fixture-result-score">
          {fixture.score.teamA} - {fixture.score.teamB}
        </div>
      </div>
    ))}
  </div>
</section>
    </div>
  );
}