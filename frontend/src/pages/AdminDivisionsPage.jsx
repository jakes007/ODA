import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import {
  createDivision,
  deleteDivision,
  getDivisions,
  updateDivision
} from '../services/adminDivisionService';
import AdminStepNavigation from '../components/admin/AdminStepNavigation';


export default function AdminDivisionsPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [seasonId, setSeasonId] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [message, setMessage] = useState('');
  const [divisionToDelete, setDivisionToDelete] = useState(null);

  const [editingDivisionId, setEditingDivisionId] = useState('');
  const [editingDivisionName, setEditingDivisionName] = useState('');
  const [editingSeasonId, setEditingSeasonId] = useState('');
  const [editingCompetitionId, setEditingCompetitionId] = useState('');

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

    if (activeSeason) setSeasonId(activeSeason.id);
    if (activeCompetition) setCompetitionId(activeCompetition.id);
  }

  function getSeasonNameById(targetSeasonId) {
    return seasons.find((season) => season.id === targetSeasonId)?.name || 'No season';
  }

  function getCompetitionNameById(targetCompetitionId) {
    return (
      competitions.find((competition) => competition.id === targetCompetitionId)?.name ||
      'No competition'
    );
  }

  async function handleCreateDivision(event) {
    event.preventDefault();

    try {
      const newDivision = await createDivision({
        divisionName,
        seasonId,
        competitionId
      });

      setDivisions((current) => [newDivision, ...current]);
      setDivisionName('');
      setMessage('Division created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create division.');
    }
  }

  function startEditingDivision(division) {
    setEditingDivisionId(division.id);
    setEditingDivisionName(division.name);
    setEditingSeasonId(division.seasonId || '');
    setEditingCompetitionId(division.competitionId || '');
    setMessage('');
  }

  function cancelEditingDivision() {
    setEditingDivisionId('');
    setEditingDivisionName('');
    setEditingSeasonId('');
    setEditingCompetitionId('');
  }

  async function handleSaveDivision(divisionId) {
    try {
      await updateDivision({
        divisionId,
        divisionName: editingDivisionName,
        seasonId: editingSeasonId,
        competitionId: editingCompetitionId
      });

      setMessage('Division updated.');
      cancelEditingDivision();
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not update division.');
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
      <AdminStepNavigation
  previousTo="/admin/competitions"
  previousLabel="Previous: Competitions"
  nextTo="/admin/teams"
  nextLabel="Next: Teams"
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
                  label: `${competition.name} • ${getSeasonNameById(competition.seasonId)}`
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
                  {editingDivisionId === division.id ? (
                    <>
                      <input
                        className="form-input admin-season-edit-input"
                        type="text"
                        value={editingDivisionName}
                        onChange={(event) => setEditingDivisionName(event.target.value)}
                      />

                      <CustomSelect
                        value={editingSeasonId}
                        onChange={setEditingSeasonId}
                        options={seasons.map((season) => ({
                          value: season.id,
                          label: season.name
                        }))}
                        placeholder="Select season"
                      />

                      <CustomSelect
                        value={editingCompetitionId}
                        onChange={setEditingCompetitionId}
                        options={competitions.map((competition) => ({
                          value: competition.id,
                          label: `${competition.name} • ${getSeasonNameById(competition.seasonId)}`
                        }))}
                        placeholder="Select competition"
                      />
                    </>
                  ) : (
                    <>
                      <strong>{division.name}</strong>

                      <div className="competition-tags-row">
                        <span className="admin-season-status inactive">
                          {getSeasonNameById(division.seasonId)}
                        </span>

                        <span className="admin-season-status inactive">
                          {getCompetitionNameById(division.competitionId)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="admin-season-actions">
                  {editingDivisionId === division.id ? (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleSaveDivision(division.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={cancelEditingDivision}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => startEditingDivision(division)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="secondary-btn danger-btn"
                        onClick={() => setDivisionToDelete(division)}
                      >
                        Delete
                      </button>
                    </>
                  )}
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