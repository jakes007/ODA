import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import {
  createMatchFormat,
  deleteMatchFormat,
  getMatchFormats,
  updateMatchFormat
} from '../services/adminMatchFormatService';
import AdminStepNavigation from '../components/admin/AdminStepNavigation';

const gameTypes = [
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Doubles' },
  { value: 'team', label: 'Team Game' }
];

const legsModes = [
  { value: 'fixed', label: 'Fixed Legs' },
  { value: 'bestOf', label: 'Best Of' }
];

function createEmptyGame(order) {
  return {
    order,
    label: `Game ${order}`,
    type: 'singles',
    startingScore: 501,
    legsMode: 'fixed',
    totalLegs: 1
  };
}

export default function AdminMatchFormatsPage() {
  const [formats, setFormats] = useState([]);
  const [name, setName] = useState('');
  const [pointsSystem, setPointsSystem] = useState('');
  const [games, setGames] = useState([createEmptyGame(1)]);
  const [message, setMessage] = useState('');
  const [formatToDelete, setFormatToDelete] = useState(null);

  const [editingFormatId, setEditingFormatId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingPointsSystem, setEditingPointsSystem] = useState('');
  const [editingGames, setEditingGames] = useState([]);

  useEffect(() => {
    loadFormats();
  }, []);

  async function loadFormats() {
    const loadedFormats = await getMatchFormats();
    setFormats(loadedFormats);
  }

  function updateGame(index, field, value) {
    setGames((current) =>
      current.map((game, gameIndex) =>
        gameIndex === index
          ? {
              ...game,
              [field]:
                field === 'startingScore' || field === 'totalLegs'
                  ? Number(value || 0)
                  : value
            }
          : game
      )
    );
  }

  function addGame() {
    setGames((current) => [...current, createEmptyGame(current.length + 1)]);
  }

  function removeGame(index) {
    setGames((current) =>
      current
        .filter((_, gameIndex) => gameIndex !== index)
        .map((game, gameIndex) => ({
          ...game,
          order: gameIndex + 1,
          label: game.label || `Game ${gameIndex + 1}`
        }))
    );
  }

  async function handleCreateFormat(event) {
    event.preventDefault();

    try {
      const newFormat = await createMatchFormat({
        name,
        pointsSystem,
        games
      });

      setFormats((current) => [newFormat, ...current]);
      setName('');
      setPointsSystem('');
      setGames([createEmptyGame(1)]);
      setMessage('Match format created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create match format.');
    }
  }

  function startEditingFormat(format) {
    setEditingFormatId(format.id);
    setEditingName(format.name);
    setEditingPointsSystem(format.pointsSystem);
    setEditingGames(format.games || []);
    setMessage('');
  }

  function cancelEditingFormat() {
    setEditingFormatId('');
    setEditingName('');
    setEditingPointsSystem('');
    setEditingGames([]);
  }

  function updateEditingGame(index, field, value) {
    setEditingGames((current) =>
      current.map((game, gameIndex) =>
        gameIndex === index
          ? {
              ...game,
              [field]:
                field === 'startingScore' || field === 'totalLegs'
                  ? Number(value || 0)
                  : value
            }
          : game
      )
    );
  }

  function addEditingGame() {
    setEditingGames((current) => [...current, createEmptyGame(current.length + 1)]);
  }

  function removeEditingGame(index) {
    setEditingGames((current) =>
      current
        .filter((_, gameIndex) => gameIndex !== index)
        .map((game, gameIndex) => ({
          ...game,
          order: gameIndex + 1
        }))
    );
  }

  async function handleSaveFormat(formatId) {
    try {
      await updateMatchFormat({
        formatId,
        name: editingName,
        pointsSystem: editingPointsSystem,
        games: editingGames
      });

      setMessage('Match format updated.');
      cancelEditingFormat();
      await loadFormats();
    } catch (error) {
      setMessage(error.message || 'Could not update match format.');
    }
  }

  async function confirmDeleteFormat() {
    if (!formatToDelete) return;

    try {
      await deleteMatchFormat(formatToDelete.id);
      setFormatToDelete(null);
      setMessage('Match format deleted.');
      await loadFormats();
    } catch (error) {
      setMessage(error.message || 'Could not delete match format.');
    }
  }

  return (
    <div className="page-stack admin-match-formats-page">
      <PageHeader
        title="Match Formats"
        subtitle="Create reusable fixture formats for singles, doubles, and team games."
      />

<AdminStepNavigation
  previousTo="/admin/teams"
  previousLabel="Previous: Teams"
  nextTo="/admin/fixtures"
  nextLabel="Next: Fixtures"
/>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Match Format</h3>

          <Link to="/admin" className="panel-link">
            Dashboard
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleCreateFormat}>
          <div className="register-form-grid">
            <div className="form-row">
              <label className="form-label">Format Name</label>
              <input
                className="form-input"
                placeholder="Example: 32 Point Standard"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Points System</label>
              <input
                className="form-input"
                placeholder="Example: 32"
                value={pointsSystem}
                onChange={(event) => setPointsSystem(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-format-games">
            {games.map((game, index) => (
              <div key={index} className="admin-format-game-card">
                <div className="panel-header">
                  <h4 className="panel-title">Game {index + 1}</h4>

                  {games.length > 1 ? (
                    <button
                      type="button"
                      className="secondary-btn danger-btn"
                      onClick={() => removeGame(index)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="register-form-grid">
                  <div className="form-row">
                    <label className="form-label">Label</label>
                    <input
                      className="form-input"
                      value={game.label}
                      onChange={(event) => updateGame(index, 'label', event.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <label className="form-label">Game Type</label>
                    <CustomSelect
                      value={game.type}
                      onChange={(value) => updateGame(index, 'type', value)}
                      options={gameTypes}
                    />
                  </div>

                  <div className="form-row">
                    <label className="form-label">Starting Score</label>
                    <input
                      className="form-input"
                      type="number"
                      value={game.startingScore}
                      onChange={(event) =>
                        updateGame(index, 'startingScore', event.target.value)
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label className="form-label">Legs Mode</label>
                    <CustomSelect
                      value={game.legsMode}
                      onChange={(value) => updateGame(index, 'legsMode', value)}
                      options={legsModes}
                    />
                  </div>

                  <div className="form-row">
                    <label className="form-label">Total Legs</label>
                    <input
                      className="form-input"
                      type="number"
                      value={game.totalLegs}
                      onChange={(event) =>
                        updateGame(index, 'totalLegs', event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <div className="admin-season-actions">
            <button type="button" className="secondary-btn" onClick={addGame}>
              Add Game
            </button>

            <button type="submit" className="primary-btn auth-submit-btn">
              Create Format
            </button>
          </div>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Match Formats</h3>
        </div>

        <div className="admin-season-list">
          {formats.length === 0 ? (
            <p className="muted-text">No match formats created yet.</p>
          ) : (
            formats.map((format) => (
              <div key={format.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
                  {editingFormatId === format.id ? (
                    <>
                      <input
                        className="form-input admin-season-edit-input"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />

                      <input
                        className="form-input admin-season-edit-input"
                        value={editingPointsSystem}
                        onChange={(event) => setEditingPointsSystem(event.target.value)}
                      />

                      <div className="admin-format-games">
                        {editingGames.map((game, index) => (
                          <div key={index} className="admin-format-game-card">
                            <div className="panel-header">
                              <h4 className="panel-title">Game {index + 1}</h4>

                              {editingGames.length > 1 ? (
                                <button
                                  type="button"
                                  className="secondary-btn danger-btn"
                                  onClick={() => removeEditingGame(index)}
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>

                            <div className="register-form-grid">
                              <input
                                className="form-input"
                                value={game.label}
                                onChange={(event) =>
                                  updateEditingGame(index, 'label', event.target.value)
                                }
                              />

                              <CustomSelect
                                value={game.type}
                                onChange={(value) =>
                                  updateEditingGame(index, 'type', value)
                                }
                                options={gameTypes}
                              />

                              <input
                                className="form-input"
                                type="number"
                                value={game.startingScore}
                                onChange={(event) =>
                                  updateEditingGame(
                                    index,
                                    'startingScore',
                                    event.target.value
                                  )
                                }
                              />

                              <CustomSelect
                                value={game.legsMode}
                                onChange={(value) =>
                                  updateEditingGame(index, 'legsMode', value)
                                }
                                options={legsModes}
                              />

                              <input
                                className="form-input"
                                type="number"
                                value={game.totalLegs}
                                onChange={(event) =>
                                  updateEditingGame(index, 'totalLegs', event.target.value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{format.name}</strong>

                      <div className="competition-tags-row">
                        <span className="admin-season-status inactive">
                          {format.pointsSystem} Point
                        </span>

                        <span className="admin-season-status active">
                          {format.status || 'active'}
                        </span>

                        <span className="admin-season-status inactive">
                          {(format.games || []).length} games
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="admin-season-actions">
                  {editingFormatId === format.id ? (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={addEditingGame}
                      >
                        Add Game
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleSaveFormat(format.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={cancelEditingFormat}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => startEditingFormat(format)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="secondary-btn danger-btn"
                        onClick={() => setFormatToDelete(format)}
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

      {formatToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Match Format?</h3>

            <p>
              You are about to delete <strong>{formatToDelete.name}</strong>. This action
              cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setFormatToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteFormat}
              >
                Delete Format
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}