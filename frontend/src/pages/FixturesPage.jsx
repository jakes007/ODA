import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { importedFixturesData } from '../data/importedFixturesData';

function parseDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function formatMonth(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown Month';
  }

  return parsed.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric'
  });
}

function groupFixturesByMonthAndDate(fixtures) {
  return fixtures.reduce((groups, fixture) => {
    const month = formatMonth(fixture.date);
    const date = fixture.date || 'Unknown Date';

    if (!groups[month]) {
      groups[month] = {};
    }

    if (!groups[month][date]) {
      groups[month][date] = [];
    }

    groups[month][date].push(fixture);
    return groups;
  }, {});
}

export default function FixturesPage() {
  const [division, setDivision] = useState('Upper');
  const [openDates, setOpenDates] = useState({});

  const fixtures = (importedFixturesData.divisions[division] || [])
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const groupedFixtures = groupFixturesByMonthAndDate(fixtures);

  function toggleDate(date) {
    setOpenDates((current) => ({
      ...current,
      [date]: !current[date]
    }));
  }

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

        <div className="fixtures-month-list">
          {Object.entries(groupedFixtures).map(([month, dateGroups]) => (
            <section key={month} className="fixtures-month-group">
              <h3 className="fixtures-month-title">{month}</h3>

              <div className="fixtures-date-list">
                {Object.entries(dateGroups).map(([date, dateFixtures]) => {
                  const isOpen = openDates[date] || false;

                  return (
                    <section key={date} className="fixtures-date-group">
                      <button
                        type="button"
                        className="fixtures-date-header"
                        onClick={() => toggleDate(date)}
                      >
                        <span>{date}</span>
                        <span>
                          {dateFixtures.length} fixture
                          {dateFixtures.length === 1 ? '' : 's'} •{' '}
                          {isOpen ? 'Hide' : 'Show'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="fixtures-list">
                          {dateFixtures.map((fixture) => (
                            <Link
                              key={fixture.id}
                              to={`/competition/fixtures/${fixture.id}`}
                              className="fixture-result-card fixture-result-link"
                            >
                              <div>
                                <h3 className="fixture-result-title">
                                  {fixture.fixtureName}
                                </h3>
                                <div className="muted-text">
                                  Completed • {fixture.division} Division
                                </div>
                              </div>

                              <div className="fixture-result-score">
                                {fixture.scoreText}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}