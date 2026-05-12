import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

import {
  getActivePublicLiveFixtures
} from '../services/captainFixtureService';

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

  if (loading) {
    return <EmptyState message="Loading live fixtures..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Live Match Hub"
        subtitle="All fixtures currently being played live"
      />

      {fixtures.length === 0 ? (
        <section className="panel">
          <div className="muted-text">
            No fixtures are currently live.
          </div>
        </section>
      ) : (
        <div className="captain-fixture-list">
          {fixtures.map((fixture) => (
            <div
              key={fixture.fixtureId}
              className="captain-fixture-card"
            >
              <div className="captain-fixture-main">
                <div className="history-title">
                  {fixture.homeTeam.teamName} vs {fixture.awayTeam.teamName}
                </div>

                <div className="muted-text">
                  Status: {formatStatus(fixture.status)}
                </div>

                <div className="muted-text">
                  Score: {fixture.scoreText}
                </div>

                <div className="muted-text">
                  Active Boards: {fixture.liveSession?.activeBoardCount ?? 0}
                </div>

                <div className="muted-text">
                  Matchups: {fixture.liveSession?.games?.length ?? 0}
                </div>
              </div>

              <div className="captain-fixture-side">
                <Link
                  to={`/live/${fixture.fixtureId}`}
                  className="primary-btn"
                >
                  Watch Live
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatStatus(status) {
  const labels = {
    active: 'Live',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}