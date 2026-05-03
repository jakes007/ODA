import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import CustomSelect from '../components/common/CustomSelect';
import { importedRegistryData } from '../data/importedRegistryData';
import { getSeasons } from '../services/adminSeasonService';
import { getCompetitions } from '../services/adminCompetitionService';
import { getDivisions } from '../services/adminDivisionService';
import {
  createTeam,
  deleteTeam,
  getTeams,
  updateTeam
} from '../services/adminTeamService';

function getClubOptions() {
  return (importedRegistryData.clubs || []).map((club) => ({
    value: club.clubName,
    label: club.clubName
  }));
}

export default function AdminTeamsPage() {
  const [seasons, setSeasons] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);

  const [seasonId, setSeasonId] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [clubName, setClubName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');
  const [teamToDelete, setTeamToDelete] = useState(null);

  const [editingTeamId, setEditingTeamId] = useState('');
  const [editingTeamName, setEditingTeamName] = useState('');
  const [editingClubName, setEditingClubName] = useState('');
  const [editingSeasonId, setEditingSeasonId] = useState('');
  const [editingCompetitionId, setEditingCompetitionId] = useState('');
  const [editingDivisionId, setEditingDivisionId] = useState('');

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    const loadedSeasons = await getSeasons();
    const loadedCompetitions = await getCompetitions();
    const loadedDivisions = await getDivisions();
    const loadedTeams = await getTeams();

    setSeasons(loadedSeasons);
    setCompetitions(loadedCompetitions);
    setDivisions(loadedDivisions);
    setTeams(loadedTeams);

    const activeSeason = loadedSeasons.find((season) => season.status === 'active');
    const activeCompetition = loadedCompetitions.find(
      (competition) => competition.status === 'active'
    );

    if (activeSeason) setSeasonId(activeSeason.id);
    if (activeCompetition) setCompetitionId(activeCompetition.id);
  }

  async function handleCreateTeam(event) {
    event.preventDefault();

    const selectedSeason = seasons.find((season) => season.id === seasonId);
    const selectedCompetition = competitions.find(
      (competition) => competition.id === competitionId
    );
    const selectedDivision = divisions.find((division) => division.id === divisionId);

    try {
      const newTeam = await createTeam({
        teamName,
        clubName,
        seasonId,
        seasonName: selectedSeason?.name,
        competitionId,
        competitionName: selectedCompetition?.name,
        divisionId,
        divisionName: selectedDivision?.name
      });

      setTeams((current) => [newTeam, ...current]);
      setTeamName('');
      setMessage('Team created successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not create team.');
    }
  }

  function startEditingTeam(team) {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
    setEditingClubName(team.clubName || '');
    setEditingSeasonId(team.seasonId || '');
    setEditingCompetitionId(team.competitionId || '');
    setEditingDivisionId(team.divisionId || '');
    setMessage('');
  }

  function cancelEditingTeam() {
    setEditingTeamId('');
    setEditingTeamName('');
    setEditingClubName('');
    setEditingSeasonId('');
    setEditingCompetitionId('');
    setEditingDivisionId('');
  }

  async function handleSaveTeam(teamId) {
    const selectedSeason = seasons.find((season) => season.id === editingSeasonId);
    const selectedCompetition = competitions.find(
      (competition) => competition.id === editingCompetitionId
    );
    const selectedDivision = divisions.find(
      (division) => division.id === editingDivisionId
    );

    try {
      await updateTeam({
        teamId,
        teamName: editingTeamName,
        clubName: editingClubName,
        seasonId: editingSeasonId,
        seasonName: selectedSeason?.name,
        competitionId: editingCompetitionId,
        competitionName: selectedCompetition?.name,
        divisionId: editingDivisionId,
        divisionName: selectedDivision?.name
      });

      setMessage('Team updated.');
      cancelEditingTeam();
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not update team.');
    }
  }

  async function confirmDeleteTeam() {
    if (!teamToDelete) return;

    try {
      await deleteTeam(teamToDelete.id);
      setTeamToDelete(null);
      setMessage('Team deleted.');
      await loadPageData();
    } catch (error) {
      setMessage(error.message || 'Could not delete team.');
    }
  }

  const clubOptions = getClubOptions();

  return (
    <div className="page-stack admin-teams-page">
      <PageHeader
        title="Team Manager"
        subtitle="Create and manage teams inside divisions."
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Team</h3>

          <Link to="/admin" className="panel-link">
            Dashboard
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleCreateTeam}>
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
              <label className="form-label">Division</label>

              <CustomSelect
                value={divisionId}
                onChange={setDivisionId}
                options={divisions.map((division) => ({
                  value: division.id,
                  label: `${division.name} • ${division.competitionName || 'No competition'}`
                }))}
                placeholder="Select division"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Club</label>

              <CustomSelect
                value={clubName}
                onChange={setClubName}
                options={clubOptions}
                placeholder="Select club"
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="teamName">
                Team Name
              </label>

              <input
                id="teamName"
                className="form-input"
                type="text"
                placeholder="Example: Guardians 1"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
            </div>
          </div>

          {message ? <div className="form-success">{message}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Create Team
          </button>
        </form>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Existing Teams</h3>
        </div>

        <div className="admin-season-list">
          {teams.length === 0 ? (
            <p className="muted-text">No teams created yet.</p>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
                  {editingTeamId === team.id ? (
                    <>
                      <input
                        className="form-input admin-season-edit-input"
                        type="text"
                        value={editingTeamName}
                        onChange={(event) => setEditingTeamName(event.target.value)}
                      />

                      <CustomSelect
                        value={editingClubName}
                        onChange={setEditingClubName}
                        options={clubOptions}
                        placeholder="Select club"
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
                          label: `${competition.name} • ${competition.seasonName || 'No season'}`
                        }))}
                        placeholder="Select competition"
                      />

                      <CustomSelect
                        value={editingDivisionId}
                        onChange={setEditingDivisionId}
                        options={divisions.map((division) => ({
                          value: division.id,
                          label: `${division.name} • ${division.competitionName || 'No competition'}`
                        }))}
                        placeholder="Select division"
                      />
                    </>
                  ) : (
                    <>
                      <strong>{team.name}</strong>

                      <div className="competition-tags-row">
                        <span className="admin-season-status inactive">
                          {team.clubName || 'No club'}
                        </span>

                        <span className="admin-season-status inactive">
                          {team.divisionName || 'No division'}
                        </span>

                        <span className="admin-season-status inactive">
                          {team.competitionName || 'No competition'}
                        </span>

                        <span className="admin-season-status active">
                          {team.status || 'active'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="admin-season-actions">
                  {editingTeamId === team.id ? (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleSaveTeam(team.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={cancelEditingTeam}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => startEditingTeam(team)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="secondary-btn danger-btn"
                        onClick={() => setTeamToDelete(team)}
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

      {teamToDelete ? (
        <div className="premium-confirm-backdrop">
          <div className="premium-confirm-modal">
            <div className="premium-confirm-kicker">Confirm Delete</div>

            <h3>Delete Team?</h3>

            <p>
              You are about to delete <strong>{teamToDelete.name}</strong>.
              This action cannot be undone.
            </p>

            <div className="premium-confirm-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setTeamToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="secondary-btn danger-btn"
                onClick={confirmDeleteTeam}
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}