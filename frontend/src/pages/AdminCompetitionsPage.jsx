import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { getSeasons } from '../services/adminSeasonService';
import {
  createCompetition,
  deleteCompetition,
  getCompetitions,
  updateCompetitionStatus,
  updateCompetitionNameAndSeason
} from '../services/adminCompetitionService';
import CustomSelect from '../components/common/CustomSelect';

export default function AdminCompetitionsPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [competitionName, setCompetitionName] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [message, setMessage] = useState('');
  const [competitionToDelete, setCompetitionToDelete] = useState(null);
  const [editingCompetitionId, setEditingCompetitionId] = useState('');
const [editingCompetitionName, setEditingCompetitionName] = useState('');
const [editingSeasonId, setEditingSeasonId] = useState('');

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const loadedSeasons = await getSeasons();
    const loadedCompetitions = await getCompetitions();

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);

    const activeSeason = loadedSeasons.find((season) => season.status === 'active');

    if (activeSeason) {
      setSeasonId(activeSeason.id);
    }
  }

  async function handleCreateCompetition(event) {
    event.preventDefault();
  
    try {
      const newCompetition = await createCompetition({
        competitionName,
        seasonId,
        status: 'upcoming'
      });
  
      setCompetitions((current) => [newCompetition, ...current]);
      setCompetitionName('');
      setMessage('Competition created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create competition.');
    }
  }

  async function handleStatusChange(competitionId, nextStatus) {
    try {
      await updateCompetitionStatus({
        competitionId,
        status: nextStatus
      });

      setMessage('Competition status updated.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not update competition.');
    }
  }

  function startEditingCompetition(competition) {
    setEditingCompetitionId(competition.id);
    setEditingCompetitionName(competition.name);
    setEditingSeasonId(competition.seasonId || '');
  }
  
  function cancelEditingCompetition() {
    setEditingCompetitionId('');
    setEditingCompetitionName('');
    setEditingSeasonId('');
  }
  
  async function handleSaveCompetition(competitionId) {
    try {
      await updateCompetitionNameAndSeason({
        competitionId,
        name: editingCompetitionName,
        seasonId: editingSeasonId
      });
  
      setMessage('Competition updated.');
      cancelEditingCompetition();
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not update competition.');
    }
  }

  async function confirmDeleteCompetition() {
    if (!competitionToDelete) return;

    try {
      await deleteCompetition(competitionToDelete.id);
      setCompetitionToDelete(null);
      setMessage('Competition deleted.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not delete competition.');
    }
  }

  function getSeasonNameById(targetSeasonId) {
    return (
      seasons.find((season) => season.id === targetSeasonId)?.name ||
      'No season'
    );
  }
  
  return (
    <div className="page-stack admin-competitions-page">
      <PageHeader
        title="Competition Manager"
        subtitle="Create and manage competitions linked to seasons."
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Competition</h3>

          <Link to="/admin" className="panel-link">
            Dashboard
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleCreateCompetition}>
          <div className="register-form-grid">
            <div className="form-row">
              <label className="form-label" htmlFor="competitionName">
                Competition Name
              </label>

              <input
                id="competitionName"
                className="form-input"
                type="text"
                placeholder="Example: Placements"
                value={competitionName}
                onChange={(event) => setCompetitionName(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="seasonId">
                Season
              </label>

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
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Competition
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Competitions</h3>
        </div>

        <div className="admin-season-list">
          {competitions.length === 0 ? (
            <p className="muted-text">No competitions created yet.</p>
          ) : (
            competitions.map((competition) => (
              <div key={competition.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
  {editingCompetitionId === competition.id ? (
    <>
      <input
        className="form-input admin-season-edit-input"
        type="text"
        value={editingCompetitionName}
        onChange={(event) =>
          setEditingCompetitionName(event.target.value)
        }
      />

      <CustomSelect
        value={editingSeasonId}
        onChange={setEditingSeasonId}
        options={seasons.map((season) => ({
          value: season.id,
          label: season.name
        }))}
      />
    </>
  ) : (
    <>
      <strong>{competition.name}</strong>

      <div className="competition-tags-row">
      <span className="admin-season-status inactive">
  {getSeasonNameById(competition.seasonId)}
</span>

        <span
          className={`admin-season-status ${
            competition.status === 'active' ? 'active' : 'inactive'
          }`}
        >
          {competition.status}
        </span>
      </div>
    </>
  )}
</div>

<div className="admin-season-actions">
  {editingCompetitionId === competition.id ? (
    <>
      <button
        type="button"
        className="secondary-btn"
        onClick={() => handleSaveCompetition(competition.id)}
      >
        Save
      </button>

      <button
        type="button"
        className="secondary-btn"
        onClick={cancelEditingCompetition}
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="secondary-btn"
        onClick={() => handleStatusChange(competition.id, 'active')}
      >
        Active
      </button>

      <button
        type="button"
        className="secondary-btn"
        onClick={() => handleStatusChange(competition.id, 'completed')}
      >
        Completed
      </button>

      <button
        type="button"
        className="secondary-btn"
        onClick={() => startEditingCompetition(competition)}
      >
        Edit
      </button>

      <button
        type="button"
        className="secondary-btn danger-btn"
        onClick={() => setCompetitionToDelete(competition)}
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

      {competitionToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Competition?</h3>

            <p>
              You are about to delete <strong>{competitionToDelete.name}</strong>.
              This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setCompetitionToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteCompetition}
              >
                Delete Competition
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}