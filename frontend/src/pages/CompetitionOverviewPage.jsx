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
        <section className="panel">
          <h3 className="panel-title">Top Teams</h3>
          {data.topTeams.map((team) => (
            <div key={team.teamName} className="list-row">
              <span>{team.teamName}</span>
              <span>{team.leaguePoints} pts</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h3 className="panel-title">Top Players</h3>
          {data.topPlayers.map((player) => (
            <div key={player.playerId} className="list-row">
              <span>{player.displayName}</span>
              <span>{player.threeDartAverage}</span>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <h3 className="panel-title">Recent Fixtures</h3>
        {data.recentFixtures.map((fixture) => (
          <div key={fixture.fixtureName} className="list-row">
            <span>{fixture.fixtureName}</span>
            <span>{fixture.score.teamA} - {fixture.score.teamB}</span>
          </div>
        ))}
      </section>
    </div>
  );
}