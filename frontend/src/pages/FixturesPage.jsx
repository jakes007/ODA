import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { importedFixturesData } from '../data/importedFixturesData';

export default function FixturesPage() {
  const [division, setDivision] = useState('Upper');

  const fixtures = (importedFixturesData.divisions[division] || [])
  .slice()
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page-stack fixtures-page">
      <PageHeader
        title="Fixtures & Results"
        subtitle={`${importedFixturesData.competitionName} • ${importedFixturesData.season} • ${division} Division`}
      />

      <section className="panel premium-panel fixtures-panel">
        <div className="standings-controls">
          <button
            type="button"
            className={`standings-filter-btn ${division === 'Upper' ? 'active' : ''}`}
            onClick={() => setDivision('Upper')}
          >
            Upper Division
          </button>

          <button
            type="button"
            className={`standings-filter-btn ${division === 'Lower' ? 'active' : ''}`}
            onClick={() => setDivision('Lower')}
          >
            Lower Division
          </button>
        </div>

        <div className="fixtures-list">
          {fixtures.map((fixture) => (
            <div key={fixture.id} className="fixture-result-card">
              <div>
                <div className="fixture-result-date">{fixture.date}</div>
                <h3 className="fixture-result-title">{fixture.fixtureName}</h3>
                <div className="muted-text">Completed • {fixture.division} Division</div>
              </div>

              <div className="fixture-result-score">{fixture.scoreText}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}