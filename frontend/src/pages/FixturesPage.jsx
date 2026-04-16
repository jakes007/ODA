import PageHeader from '../components/common/PageHeader';
import { getCompetitionFixtures } from '../services/competitionData';

export default function FixturesPage() {
  const data = getCompetitionFixtures();

  return (
    <div className="page-stack">
      <PageHeader
        title="Fixtures"
        subtitle={`${data.competition.name} • ${data.competition.season}`}
      />

      <div className="card-list">
        {data.fixtures.map((fixture) => (
          <div key={fixture.id} className="panel">
            <div className="fixture-card-header">
              <h3 className="panel-title">{fixture.fixtureName}</h3>
              <span className="fixture-score">{fixture.scoreText}</span>
            </div>
            <div className="muted-text">
              Status: {fixture.complete ? 'Completed' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}