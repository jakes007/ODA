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
import AdminStepNavigation from '../components/admin/AdminStepNavigation';


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

    const activeSeason = loadedSeasons.find((s) => s.status === 'active');
    const activeCompetition = loadedCompetitions.find(
      (c) => c.status === 'active'
    );

    if (activeSeason) setSeasonId(activeSeason.id);
    if (activeCompetition) setCompetitionId(activeCompetition.id);
  }

  // 🔥 LOOKUP HELPERS
  function getSeasonName(id) {
    return seasons.find((s) => s.id === id)?.name || 'No season';
  }

  function getCompetitionName(id) {
    return competitions.find((c) => c.id === id)?.name || 'No competition';
  }

  function getDivisionName(id) {
    return divisions.find((d) => d.id === id)?.name || 'No division';
  }

  async function handleCreateTeam(e) {
    e.preventDefault();

    try {
      const newTeam = await createTeam({
        teamName,
        clubName,
        seasonId,
        competitionId,
        divisionId
      });

      setTeams((cur) => [newTeam, ...cur]);
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
  }

  function cancelEditingTeam() {
    setEditingTeamId('');
  }

  async function handleSaveTeam(teamId) {
    try {
      await updateTeam({
        teamId,
        teamName: editingTeamName,
        clubName: editingClubName,
        seasonId: editingSeasonId,
        competitionId: editingCompetitionId,
        divisionId: editingDivisionId
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

  const sortedTeams = [...teams].sort((a, b) => {
    const competitionA = getCompetitionName(a.competitionId);
    const competitionB = getCompetitionName(b.competitionId);
  
    if (competitionA !== competitionB) {
      return competitionA.localeCompare(competitionB);
    }
  
    const divisionA = getDivisionName(a.divisionId);
    const divisionB = getDivisionName(b.divisionId);
  
    if (divisionA !== divisionB) {
      return divisionA.localeCompare(divisionB);
    }
  
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  return (
    <div className="page-stack admin-teams-page">
      <PageHeader title="Team Manager" />

      <AdminStepNavigation
  previousTo="/admin/divisions"
  previousLabel="Previous: Divisions"
  nextTo="/admin/match-formats"
  nextLabel="Next: Match Formats"
/>
  
      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Create Team</h3>
          <Link to="/admin" className="panel-link">Dashboard</Link>
        </div>
  
        <form onSubmit={handleCreateTeam} className="auth-form">
          <div className="register-form-grid">
  
            <div className="form-row">
              <label className="form-label">Season</label>
              <CustomSelect
                value={seasonId}
                onChange={setSeasonId}
                options={seasons.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select season"
              />
            </div>
  
            <div className="form-row">
              <label className="form-label">Competition</label>
              <CustomSelect
                value={competitionId}
                onChange={setCompetitionId}
                options={competitions.map(c => ({
                  value: c.id,
                  label: `${c.name} • ${getSeasonName(c.seasonId)}`
                }))}
                placeholder="Select competition"
              />
            </div>
  
            <div className="form-row">
              <label className="form-label">Division</label>
              <CustomSelect
                value={divisionId}
                onChange={setDivisionId}
                options={divisions.map(d => ({
                  value: d.id,
                  label: `${d.name} • ${getCompetitionName(d.competitionId)}`
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
              <label className="form-label">Team Name</label>
              <input
                className="form-input"
                placeholder="Example: Guardians 1"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
  
          </div>
  
          {message && <div className="form-success">{message}</div>}
  
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
            sortedTeams.map((team) => (
              <div key={team.id} className="admin-season-row">
                <div className="admin-season-main competition-main-stacked">
  
                  {editingTeamId === team.id ? (
                    <>
                      <input
                        className="form-input admin-season-edit-input"
                        value={editingTeamName}
                        onChange={(e) => setEditingTeamName(e.target.value)}
                      />
  
                      <CustomSelect
                        value={editingDivisionId}
                        onChange={setEditingDivisionId}
                        options={divisions.map(d => ({
                          value: d.id,
                          label: d.name
                        }))}
                      />
                    </>
                  ) : (
                    <>
                      <strong>{team.name}</strong>
  
                      <div className="competition-tags-row">
                        <span className="admin-season-status inactive">
                          {team.clubName}
                        </span>
  
                        <span className="admin-season-status inactive">
                          {getDivisionName(team.divisionId)}
                        </span>
  
                        <span className="admin-season-status inactive">
                          {getCompetitionName(team.competitionId)}
                        </span>
  
                        <span className="admin-season-status inactive">
                          {getSeasonName(team.seasonId)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
  
                <div className="admin-season-actions admin-actions-spaced">
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
        You are about to delete <strong>{teamToDelete.name}</strong>. This action
        cannot be undone.
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