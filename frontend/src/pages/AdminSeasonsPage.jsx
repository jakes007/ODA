import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import {
  createSeason,
  deleteSeason,
  getSeasons,
  setActiveSeason,
  updateSeasonName
} from '../services/adminSeasonService';
import { Link } from 'react-router-dom';
import AdminStepNavigation from '../components/admin/AdminStepNavigation';

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState([]);
  const [seasonName, setSeasonName] = useState('');
  const [seasonMessage, setSeasonMessage] = useState('');
  const [editingSeasonId, setEditingSeasonId] = useState('');
  const [editingSeasonName, setEditingSeasonName] = useState('');
  const [seasonToDelete, setSeasonToDelete] = useState(null);

  useEffect(() => {
    loadSeasons();
  }, []);

  async function loadSeasons() {
    const loadedSeasons = await getSeasons();
    setSeasons(loadedSeasons);
  }

  async function handleCreateSeason(event) {
    event.preventDefault();

    try {
      const newSeason = await createSeason({ seasonName });

      setSeasons((current) => [newSeason, ...current]);
      setSeasonName('');
      setSeasonMessage('Season created successfully.');
    } catch (error) {
      setSeasonMessage(error.message || 'Could not create season.');
    }
  }

  function startEditingSeason(season) {
    setEditingSeasonId(season.id);
    setEditingSeasonName(season.name);
    setSeasonMessage('');
  }

  async function handleSaveSeasonName(seasonId) {
    try {
      await updateSeasonName({
        seasonId,
        seasonName: editingSeasonName
      });

      setEditingSeasonId('');
      setEditingSeasonName('');
      setSeasonMessage('Season updated successfully.');
      await loadSeasons();
    } catch (error) {
      setSeasonMessage(error.message || 'Could not update season.');
    }
  }

  async function handleSetActiveSeason(seasonId) {
    try {
      await setActiveSeason(seasonId);
      setSeasonMessage('Active season updated.');
      await loadSeasons();
    } catch (error) {
      setSeasonMessage(error.message || 'Could not activate season.');
    }
  }

  function requestDeleteSeason(season) {
    if (season.status === 'active') {
      setSeasonMessage('You cannot delete the active season. Set another season active first.');
      return;
    }

    setSeasonToDelete(season);
  }

  async function confirmDeleteSeason() {
    if (!seasonToDelete) return;

    try {
      await deleteSeason(seasonToDelete.id);
      setSeasonToDelete(null);
      setSeasonMessage('Season deleted.');
      await loadSeasons();
    } catch (error) {
      setSeasonMessage(error.message || 'Could not delete season.');
    }
  }

  return (
    <div className="page-stack admin-seasons-page">
      <PageHeader
        title="Season Manager"
        subtitle="Create and manage competition seasons."
      />
      <AdminStepNavigation
  previousTo="/admin"
  previousLabel="Dashboard"
  nextTo="/admin/competitions"
  nextLabel="Next: Competitions"
/>

      <section className="panel premium-panel admin-season-panel">
      <div className="panel-header">
  <h3 className="panel-title">Create Season</h3>

  <Link to="/admin" className="panel-link">
    Dashboard
  </Link>
</div>

        <form className="auth-form" onSubmit={handleCreateSeason}>
          <div className="form-row">
            <label className="form-label" htmlFor="seasonName">
              Season Name
            </label>

            <input
              id="seasonName"
              className="form-input"
              type="text"
              placeholder="Example: 2026"
              value={seasonName}
              onChange={(event) => setSeasonName(event.target.value)}
            />
          </div>

          {seasonMessage ? (
            <div className="form-success">{seasonMessage}</div>
          ) : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Season
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Seasons</h3>
        </div>

        <div className="admin-season-list">
          {seasons.length === 0 ? (
            <p className="muted-text">No seasons created yet.</p>
          ) : (
            seasons.map((season) => (
              <div key={season.id} className="admin-season-row">
                <div className="admin-season-main">
                  {editingSeasonId === season.id ? (
                    <input
                      className="form-input admin-season-edit-input"
                      type="text"
                      value={editingSeasonName}
                      onChange={(event) => setEditingSeasonName(event.target.value)}
                    />
                  ) : (
                    <strong>{season.name}</strong>
                  )}

                  <span className={`admin-season-status ${season.status === 'active' ? 'active' : 'inactive'}`}>
                    {season.status}
                  </span>
                </div>

                <div className="admin-season-actions">
                  {editingSeasonId === season.id ? (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleSaveSeasonName(season.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setEditingSeasonId('');
                          setEditingSeasonName('');
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {season.status !== 'active' ? (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleSetActiveSeason(season.id)}
                        >
                          Set Active
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => startEditingSeason(season)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="secondary-btn danger-btn"
                        onClick={() => requestDeleteSeason(season)}
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

      {seasonToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Season?</h3>

            <p>
              You are about to delete <strong>{seasonToDelete.name}</strong>. This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSeasonToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteSeason}
              >
                Delete Season
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}