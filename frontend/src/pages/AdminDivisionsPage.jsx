import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import {
  createDivision,
  deleteDivision,
  getDivisions
} from '../services/adminDivisionService';

export default function AdminDivisionsPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [seasonId, setSeasonId] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [message, setMessage] = useState('');
  const [divisionToDelete, setDivisionToDelete] = useState(null);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const loadedSeasons = await getSeasons();
    const loadedCompetitions = await getCompetitions();
    const loadedDivisions = await getDivisions();

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);
    setDivisions(loadedDivisions);

    const activeSeason = loadedSeasons.find((season) => season.status === 'active');
    const activeCompetition = loadedCompetitions.find(
      (competition) => competition.status === 'active'
    );

    if (activeSeason) {
      setSeasonId(activeSeason.id);
    }

    if (activeCompetition) {
      setCompetitionId(activeCompetition.id);
    }
  }

  async function handleCreateDivision(event) {
    event.preventDefault();

    const selectedSeason = seasons.find((season) => season.id === seasonId);
    const selectedCompetition = competitions.find(
      (competition) => competition.id === competitionId
    );

    try {
      const newDivision = await createDivision({
        divisionName,
        seasonId,
        seasonName: selectedSeason?.name,
        competitionId,
        competitionName: selectedCompetition?.name
      });

      setDivisions((current) => [newDivision, ...current]);
      setDivisionName('');
      setMessage('Division created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create division.');
    }
  }

  async function confirmDeleteDivision() {
    if (!divisionToDelete) return;

    try {
      await deleteDivision(divisionToDelete.id);
      setDivisionToDelete(null);
      setMessage('Division deleted.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not delete division.');
    }
  }

  return (
    <div className="page-stack admin-divisions-page">
      <PageHeader
        title="Division Manager"
        subtitle="Create and manage divisions inside competitions."
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Division</h3>

          <Link to="/admin" className="panel-link">
            Dashboard
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleCreateDivision}>
          <div className="register-form-grid">
            <div className="form-row">
              <label className="form-label">Season</label>

              <CustomSelect
                value={seasonId}
                onChange={setSeasonId}
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
                onChange={setCompetitionId}
                options={competitions.map((competition) => ({
                  value: competition.id,
                  label: `${competition.name} • ${competition.seasonName || 'No season'}`
                }))}
                placeholder="Select competition"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="divisionName">
                Division Name
              </label>

              <input
                id="divisionName"
                className="form-input"
                type="text"
                placeholder="Example: Upper"
                value={divisionName}
                onChange={(event) => setDivisionName(event.target.value)}
              />
            </div>
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Division
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Divisions</h3>
        </div>

        <div className="admin-season-list">
          {divisions.length === 0 ? (
            <p className="muted-text">No divisions created yet.</p>
          ) : (
            divisions.map((division) => (
              <div key={division.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
                  <strong>{division.name}</strong>

                  <div className="competition-tags-row">
                    <span className="admin-season-status inactive">
                      {division.seasonName || 'No season'}
                    </span>

                    <span className="admin-season-status inactive">
                      {division.competitionName || 'No competition'}
                    </span>
                  </div>
                </div>

                <div className="admin-season-actions">
                  <button
                    type="button"
                    className="secondary-btn danger-btn"
                    onClick={() => setDivisionToDelete(division)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {divisionToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Division?</h3>

            <p>
              You are about to delete <strong>{divisionToDelete.name}</strong>.
              This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDivisionToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteDivision}
              >
                Delete Division
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}