import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import { getDivisions } from '../services/adminDivisionService';
import { getTeams } from '../services/adminTeamService';
import {
  createAdminFixture,
  deleteAdminFixture,
  getAdminFixtures
} from '../services/adminFixtureService';
import { adminFixtureTemplates } from '../data/adminFixtureTemplates';

export default function AdminFixturesPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  const [seasonId, setSeasonId] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [fixtureDate, setFixtureDate] = useState('');
  const [fixtureTime, setFixtureTime] = useState('19:30');
  const [templateId, setTemplateId] = useState('oda_32_point_standard');

  const [message, setMessage] = useState('');
  const [fixtureToDelete, setFixtureToDelete] = useState(null);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const loadedSeasons = await getSeasons();
    const loadedCompetitions = await getCompetitions();
    const loadedDivisions = await getDivisions();
    const loadedTeams = await getTeams();
    const loadedFixtures = await getAdminFixtures();

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);
    setDivisions(loadedDivisions);
    setTeams(loadedTeams);
    setFixtures(loadedFixtures);

    const activeSeason = loadedSeasons.find((season) => season.status === 'active');
    const activeCompetition = loadedCompetitions.find(
      (competition) => competition.status === 'active'
    );

    if (activeSeason) setSeasonId(activeSeason.id);
    if (activeCompetition) setCompetitionId(activeCompetition.id);
  }

  function getSeasonName(id) {
    return seasons.find((season) => season.id === id)?.name || 'No season';
  }

  function getCompetitionName(id) {
    return competitions.find((competition) => competition.id === id)?.name || 'No competition';
  }

  function getDivisionName(id) {
    return divisions.find((division) => division.id === id)?.name || 'No division';
  }

  function getTeamName(id) {
    return teams.find((team) => team.id === id)?.name || 'No team';
  }

  const availableDivisions = useMemo(() => {
    return divisions.filter(
      (division) =>
        division.seasonId === seasonId &&
        division.competitionId === competitionId
    );
  }, [divisions, seasonId, competitionId]);

  const availableTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.seasonId === seasonId &&
        team.competitionId === competitionId &&
        team.divisionId === divisionId
    );
  }, [teams, seasonId, competitionId, divisionId]);

  async function handleCreateFixture(event) {
    event.preventDefault();

    const selectedTemplate = adminFixtureTemplates.find(
      (template) => template.templateId === templateId
    );

    try {
      const newFixture = await createAdminFixture({
        seasonId,
        competitionId,
        divisionId,
        homeTeamId,
        awayTeamId,
        fixtureDate,
        fixtureTime,
        template: selectedTemplate
      });

      setFixtures((current) => [newFixture, ...current]);
      setHomeTeamId('');
      setAwayTeamId('');
      setFixtureDate('');
      setMessage('Fixture created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create fixture.');
    }
  }

  async function confirmDeleteFixture() {
    if (!fixtureToDelete) return;

    try {
      await deleteAdminFixture(fixtureToDelete.id);
      setFixtureToDelete(null);
      setMessage('Fixture deleted.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not delete fixture.');
    }
  }

  return (
    <div className="page-stack admin-fixtures-page">
      <PageHeader
        title="Fixture Manager"
        subtitle="Create and manage fixtures from your admin competition structure."
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Fixture</h3>

          <Link to="/admin" className="panel-link">
            Dashboard
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleCreateFixture}>
          <div className="register-form-grid">
            <div className="form-row">
              <label className="form-label">Season</label>

              <CustomSelect
                value={seasonId}
                onChange={(value) => {
                  setSeasonId(value);
                  setDivisionId('');
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={seasons.map((season) => ({
                  value: season.id,
                  label: season.name
                }))}
                placeholder="Select season"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Competition</label>

              <CustomSelect
                value={competitionId}
                onChange={(value) => {
                  setCompetitionId(value);
                  setDivisionId('');
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={competitions.map((competition) => ({
                  value: competition.id,
                  label: `${competition.name} • ${getSeasonName(competition.seasonId)}`
                }))}
                placeholder="Select competition"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Division</label>

              <CustomSelect
                value={divisionId}
                onChange={(value) => {
                  setDivisionId(value);
                  setHomeTeamId('');
                  setAwayTeamId('');
                }}
                options={availableDivisions.map((division) => ({
                  value: division.id,
                  label: division.name
                }))}
                placeholder="Select division"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Home Team</label>

              <CustomSelect
                value={homeTeamId}
                onChange={setHomeTeamId}
                options={availableTeams.map((team) => ({
                  value: team.id,
                  label: team.name
                }))}
                placeholder="Select home team"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Away Team</label>

              <CustomSelect
                value={awayTeamId}
                onChange={setAwayTeamId}
                options={availableTeams
                  .filter((team) => team.id !== homeTeamId)
                  .map((team) => ({
                    value: team.id,
                    label: team.name
                  }))}
                placeholder="Select away team"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Fixture Template</label>

              <CustomSelect
                value={templateId}
                onChange={setTemplateId}
                options={adminFixtureTemplates.map((template) => ({
                  value: template.templateId,
                  label: `${template.name} • ${template.pointsSystem}`
                }))}
                placeholder="Select template"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Fixture Date</label>

              <input
                className="form-input"
                type="date"
                value={fixtureDate}
                onChange={(event) => setFixtureDate(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Fixture Time</label>

              <input
                className="form-input"
                type="time"
                value={fixtureTime}
                onChange={(event) => setFixtureTime(event.target.value)}
              />
            </div>
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Fixture
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Fixtures</h3>
        </div>

        <div className="admin-season-list">
          {fixtures.length === 0 ? (
            <p className="muted-text">No fixtures created yet.</p>
          ) : (
            fixtures.map((fixture) => (
              <div key={fixture.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
                  <strong>
                    {getTeamName(fixture.homeTeamId)} vs {getTeamName(fixture.awayTeamId)}
                  </strong>

                  <div className="competition-tags-row">
                    <span className="admin-season-status inactive">
                      {getSeasonName(fixture.seasonId)}
                    </span>

                    <span className="admin-season-status inactive">
                      {getCompetitionName(fixture.competitionId)}
                    </span>

                    <span className="admin-season-status inactive">
                      {getDivisionName(fixture.divisionId)}
                    </span>

                    <span className="admin-season-status active">
                      {fixture.status || 'upcoming'}
                    </span>

                    <span className="admin-season-status inactive">
                      {fixture.fixtureDate || 'No date'} • {fixture.fixtureTime || '19:30'}
                    </span>
                  </div>
                </div>

                <div className="admin-season-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary-btn danger-btn"
                    onClick={() => setFixtureToDelete(fixture)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {fixtureToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Fixture?</h3>

            <p>
              You are about to delete{' '}
              <strong>
                {getTeamName(fixtureToDelete.homeTeamId)} vs {getTeamName(fixtureToDelete.awayTeamId)}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setFixtureToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteFixture}
              >
                Delete Fixture
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}