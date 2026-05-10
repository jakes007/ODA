import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { importedLandingData } from '../data/importedLandingData';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import { getDivisions } from '../services/adminDivisionService';
import { getTeams } from '../services/adminTeamService';
import { getAdminFixtures } from '../services/adminFixtureService';
import { bootstrapPlacementsCompetition } from '../services/bootstrapPlacementsService';
import {
  FiUsers,
  FiUser,
  FiShield,
  FiCalendar,
  FiTarget,
  FiInbox,
  FiEdit,
  FiAward,
  FiFlag,
  FiLayers,
  FiSettings,
  FiChevronRight
} from 'react-icons/fi';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();

  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [bootstrappingPlacements, setBootstrappingPlacements] = useState(false);

  async function loadAdminDashboardData() {
    const [
      loadedSeasons,
      loadedCompetitions,
      loadedDivisions,
      loadedTeams,
      loadedFixtures
    ] = await Promise.all([
      getSeasons(),
      getCompetitions(),
      getDivisions(),
      getTeams(),
      getAdminFixtures()
    ]);

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);
    setDivisions(loadedDivisions);
    setTeams(loadedTeams);
    setFixtures(loadedFixtures);
  }

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  async function handleBootstrapPlacements() {
    try {
      setBootstrappingPlacements(true);
      await bootstrapPlacementsCompetition();
      await loadAdminDashboardData();
    } catch (error) {
      console.error(error);
    } finally {
      setBootstrappingPlacements(false);
    }
  }

  function getSeasonName(id) {
    return seasons.find((season) => season.id === id)?.name || '2026';
  }

  function getDivisionName(id) {
    return divisions.find((division) => division.id === id)?.name || 'No division';
  }

  function getTeamName(id) {
    return teams.find((team) => team.id === id)?.name || 'No team';
  }

  const placementsCompetition = competitions.find(
    (competition) => String(competition.name || '').toLowerCase() === 'placements'
  );

  const activeCompetition =
    placementsCompetition ||
    competitions.find((competition) => competition.status === 'active') ||
    null;

  const currentCompetition = activeCompetition || {
    name: 'Placements',
    seasonId: null,
    status: 'active'
  };

  const upcomingAdminFixtures = useMemo(() => {
    return fixtures
      .filter((fixture) => fixture.status === 'upcoming' && !fixture.complete)
      .sort((a, b) => {
        const dateA = `${a.fixtureDate || ''} ${a.fixtureTime || ''}`;
        const dateB = `${b.fixtureDate || ''} ${b.fixtureTime || ''}`;
        return dateA.localeCompare(dateB);
      })
      .slice(0, 3);
  }, [fixtures]);

  return (
    <div className="page-stack admin-dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${currentUser?.displayName ?? 'Admin'}`}
      />

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><FiShield /></div>
          <div className="admin-stat-main">
            <span className="admin-stat-label">Clubs</span>
            <strong className="admin-stat-value">{importedLandingData.summary.clubs}</strong>
          </div>
          <div className="admin-stat-subtext">
            <span>Total</span>
            <strong>Registered Clubs</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><FiUsers /></div>
          <div className="admin-stat-main">
            <span className="admin-stat-label">Teams</span>
            <strong className="admin-stat-value">{importedLandingData.summary.teams}</strong>
          </div>
          <div className="admin-stat-subtext">
            <span>Total</span>
            <strong>Registered Teams</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><FiUser /></div>
          <div className="admin-stat-main">
            <span className="admin-stat-label">Active Players</span>
            <strong className="admin-stat-value">{importedLandingData.summary.players}</strong>
          </div>
          <div className="admin-stat-subtext">
            <span>Total</span>
            <strong>Active Players</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><FiCalendar /></div>
          <div className="admin-stat-main">
          <span className="admin-stat-label">Fixtures Played</span>
            <strong className="admin-stat-value">{importedLandingData.summary.fixtures}</strong>
          </div>
          <div className="admin-stat-subtext">
            <span>Total</span>
            <strong>Fixtures Played</strong>
          </div>
        </div>
      </div>

      <section className="panel premium-panel admin-competition-panel">
        <div className="admin-competition-content">
          <div className="admin-competition-left">
            <div className="admin-competition-icon">
              <FiAward />
            </div>

            <div>
              <div className="admin-section-kicker">Current Competition</div>
              <h3 className="admin-competition-title">{currentCompetition.name}</h3>

              <div className="admin-competition-meta">
                <span>
                  Season {currentCompetition.seasonId ? getSeasonName(currentCompetition.seasonId) : '2026'}
                </span>
                <span>{currentCompetition.status || 'active'}</span>
              </div>
            </div>
          </div>

          <div className="admin-season-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={handleBootstrapPlacements}
              disabled={bootstrappingPlacements}
            >
              {bootstrappingPlacements ? 'Importing...' : 'Import Placements'}
            </button>

            <Link to="/admin/competitions" className="admin-manage-competition-btn">
              Manage Competition
              <FiChevronRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="panel premium-panel admin-workflow-panel">
        <div className="panel-header">
          <h3 className="panel-title">Setup & Management Workflow</h3>
        </div>

        <div className="admin-workflow-track">
          {[
            {
              number: '01',
              title: 'Season',
              text: 'Create & manage',
              icon: <FiFlag />,
              link: '/admin/seasons'
            },
            {
              number: '02',
              title: 'Competition',
              text: 'Create & manage',
              icon: <FiAward />,
              link: '/admin/competitions'
            },
            {
              number: '03',
              title: 'Divisions',
              text: 'Setup divisions',
              icon: <FiLayers />,
              link: '/admin/divisions'
            },
            {
              number: '04',
              title: 'Teams',
              text: 'Manage teams',
              icon: <FiUsers />,
              link: '/admin/teams'
            },
            {
              number: '05',
              title: 'Match Formats',
              text: 'Configure rules',
              icon: <FiSettings />,
              link: '/admin/match-formats'
            },
            {
              number: '06',
              title: 'Fixtures',
              text: 'Create & generate',
              icon: <FiCalendar />,
              link: '/admin/fixtures'
            }
          ].map((item, index) => {
            const content = (
              <>
                <div className="admin-workflow-icon">{item.icon}</div>
                <div className="admin-workflow-number">{item.number}</div>

                {index < 5 ? (
                  <div className="admin-workflow-arrow">
                    <FiChevronRight />
                  </div>
                ) : null}

                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </>
            );

            return (
              <Link
                key={item.number}
                to={item.link}
                className="admin-workflow-step admin-workflow-link"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="panel premium-panel admin-modules-panel">
        <div className="panel-header">
          <h3 className="panel-title">Admin Modules</h3>
        </div>

        <div className="admin-module-grid">
        <Link to="/player" className="admin-module-card premium-module">
  <div className="admin-module-icon blue"><FiUsers /></div>
  <strong>Registry & Players</strong>
  <p>Manage player records and registry-linked profiles.</p>
</Link>

<Link to="/admin/teams" className="admin-module-card premium-module">
  <div className="admin-module-icon orange"><FiShield /></div>
  <strong>Teams & Captains</strong>
  <p>Assign players, captains, and team memberships.</p>
</Link>

<Link to="/admin/fixtures" className="admin-module-card premium-module">
  <div className="admin-module-icon blue"><FiCalendar /></div>
  <strong>Fixture Generator</strong>
  <p>Create fixtures, board allocations, and match nights.</p>
</Link>

<Link to="/captain" className="admin-module-card premium-module">
  <div className="admin-module-icon orange"><FiTarget /></div>
  <strong>Live Scoring Control</strong>
  <p>Start scoring sessions and monitor live fixtures.</p>
</Link>

<Link to="/admin" className="admin-module-card premium-module">
  <div className="admin-module-icon blue"><FiInbox /></div>
  <strong>Access Requests</strong>
  <p>Review registrations and approve account access.</p>
</Link>

<Link to="/admin/fixtures" className="admin-module-card premium-module">
  <div className="admin-module-icon orange"><FiEdit /></div>
  <strong>Results & Corrections</strong>
  <p>Review scores, fix mistakes, and verify final results.</p>
</Link>
        </div>
      </section>

      <div className="content-grid admin-dashboard-grid">
      <section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Competition Status</h3>
  </div>

  <div className="admin-status-grid">
    <div className="admin-status-item">
      <span className="admin-status-label">Competition</span>
      <strong>{currentCompetition.name}</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Season</span>
      <strong>
        {currentCompetition.seasonId
          ? getSeasonName(currentCompetition.seasonId)
          : '2026'}
      </strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Divisions</span>
      <strong>{divisions.length}</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Teams Registered</span>
      <strong>{teams.length}</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Fixtures Played</span>
      <strong>{importedLandingData.summary.fixtures}</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Upcoming Fixtures</span>
      <strong>{upcomingAdminFixtures.length}</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Match Formats</span>
      <strong>Configured</strong>
    </div>

    <div className="admin-status-item">
      <span className="admin-status-label">Live Scoring</span>
      <strong>Offline</strong>
    </div>
  </div>
</section>

        <section className="panel premium-panel">
          <div className="panel-header">
            <h3 className="panel-title">Upcoming Fixtures</h3>
            <Link to="/admin/fixtures" className="panel-link">
              View All Fixtures
            </Link>
          </div>

          <div className="admin-fixtures-list">
            {upcomingAdminFixtures.length === 0 ? (
              <p className="muted-text">No upcoming fixtures created yet.</p>
            ) : (
              upcomingAdminFixtures.map((fixture) => (
                <div key={fixture.id} className="admin-fixture-row">
                  <div className="admin-fixture-date">
                    <strong>{fixture.fixtureDate?.slice(8, 10) || '--'}</strong>
                    <span>{fixture.fixtureDate?.slice(5, 7) || '--'}</span>
                  </div>

                  <div className="admin-fixture-main">
                    <strong>{getTeamName(fixture.homeTeamId)}</strong>
                    <span>vs</span>
                    <strong>{getTeamName(fixture.awayTeamId)}</strong>
                  </div>

                  <div className="admin-fixture-meta">
                    <span className="fixture-badge upper">
                      {getDivisionName(fixture.divisionId)}
                    </span>

                    <span className="fixture-status">
                      Scheduled<br />{fixture.fixtureTime || '19:30'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}