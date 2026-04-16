import PageHeader from '../components/common/PageHeader';
import { fixturesRows } from '../data/mockCompetitionData';

export default function FixturesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Fixtures"
        subtitle="Competition results and fixtures"
      />

      <div className="card-list">
        {fixturesRows.map((fixture) => (
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