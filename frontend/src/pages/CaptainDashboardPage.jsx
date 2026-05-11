import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { getTeams } from '../services/adminTeamService';
import { getCaptainFixtures } from '../services/captainFixtureService';

export default function CaptainDashboardPage() {
  const { currentUser } = useAuth();

  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [currentUser?.playerId]);

  async function loadDashboard() {
    if (!currentUser?.playerId) {
      setLoading(false);
      return;
    }
  
    try {
      const loadedTeams = await getTeams();
  
      const captainTeams = loadedTeams.filter(
        (team) => team.captainPlayerId === currentUser.playerId
      );
  
      setTeams(captainTeams);
  
      if (!captainTeams.length) {
        setFixtures([]);
        return;
      }
  
      const captainFixtures = await Promise.all(
        captainTeams.map((team) => getCaptainFixtures(team.id))
      );
  
      setFixtures(captainFixtures.flat());
    } catch (error) {
      console.error('Captain dashboard load failed:', error);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }

  const mainTeam = teams[0];

  const uniqueFixtures = useMemo(() => {
    const map = new Map();
  
    fixtures.forEach((fixture) => {
      map.set(fixture.id, fixture);
    });
  
    const statusPriority = {
      ready_to_play: 1,
      ready_for_lineups: 2,
      waiting_for_opponent: 3,
      active: 4,
      upcoming: 5,
      completed: 6
    };
  
    return Array.from(map.values()).sort((a, b) => {
      const priorityA =
        statusPriority[a.status] ?? 999;
  
      const priorityB =
        statusPriority[b.status] ?? 999;
  
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
  
      const dateA =
        `${a.fixtureDate || ''} ${a.fixtureTime || ''}`;
  
      const dateB =
        `${b.fixtureDate || ''} ${b.fixtureTime || ''}`;
  
      return dateA.localeCompare(dateB);
    });
  }, [fixtures]);

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Captain Dashboard" />
        <p className="muted-text">Loading captain dashboard...</p>
      </div>
    );
  }

  if (!mainTeam) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Captain Dashboard"
          subtitle="No captain assignment found."
        />

        <section className="panel premium-panel">
          <p className="muted-text">
            This account is not currently linked to a team captain record.
          </p>
        </section>
      </div>
    );
  }

  const readyForLineups = uniqueFixtures.filter(
    (fixture) => fixture.status === 'ready_for_lineups'
  ).length;

  const waiting = uniqueFixtures.filter(
    (fixture) => fixture.status === 'waiting_for_opponent'
  ).length;

  const readyToPlay = uniqueFixtures.filter(
    (fixture) => fixture.status === 'ready_to_play'
  ).length;

  const completed = uniqueFixtures.filter(
    (fixture) => fixture.status === 'completed' || fixture.complete
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Dashboard"
        subtitle={`${mainTeam.name} • ${mainTeam.divisionName || 'Division'} • ${mainTeam.competitionName || 'Competition'}`}
      />

      <div className="stats-grid">
        <StatCard label="My Team" value={mainTeam.name} />
        <StatCard label="Fixtures" value={uniqueFixtures.length} />
        <StatCard label="Ready For Lineups" value={readyForLineups} />
        <StatCard label="Waiting" value={waiting} />
        <StatCard label="Ready To Play" value={readyToPlay} />
        <StatCard label="Completed" value={completed} />
      </div>

      <section className="panel premium-panel">
        <h3 className="panel-title">My Team Fixtures</h3>

        <div className="captain-fixture-list">
          {!uniqueFixtures.length ? (
            <p className="muted-text">No fixtures found for this team yet.</p>
          ) : null}

          {uniqueFixtures.map((fixture) => {
            const isHome = fixture.homeTeamId === mainTeam.id;
            const opponentName = isHome
              ? fixture.awayTeamName || 'Away Team'
              : fixture.homeTeamName || 'Home Team';

            return (
              <div key={fixture.id} className="captain-fixture-card">
                <div className="captain-fixture-main">
                  <div className="history-title">
                    {fixture.homeTeamName || 'Home'} vs{' '}
                    {fixture.awayTeamName || 'Away'}
                  </div>

                  <div className="muted-text">Opponent: {opponentName}</div>
                  <div className="muted-text">
                    Status: {formatStatus(fixture.status || 'upcoming')}
                  </div>
                  <div className="muted-text">
                    Date: {fixture.fixtureDate || 'No date'}{' '}
                    {fixture.fixtureTime || ''}
                  </div>
                </div>

                <div className="captain-fixture-side">
                  <Link
                    to={getCaptainFixtureRoute(fixture)}
                    className="secondary-btn captain-action-btn"
                  >
                    Open Fixture
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getCaptainFixtureRoute(fixture) {
  if (fixture.status === 'active' || fixture.status === 'completed') {
    return `/captain/fixture/${fixture.id}/live`;
  }

  return `/captain/fixture/${fixture.id}/setup`;
}

function formatStatus(status) {
  const labels = {
    upcoming: 'Upcoming',
    ready_for_lineups: 'Ready For Lineups',
    waiting_for_opponent: 'Waiting For Opponent',
    ready_to_play: 'Ready To Play',
    active: 'Active',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}