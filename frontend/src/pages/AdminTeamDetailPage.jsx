import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { importedRegistryData } from '../data/importedRegistryData';
import { getTeamById, updateTeamSquad } from '../services/adminTeamService';

export default function AdminTeamDetailPage() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  async function loadTeam() {
    const loadedTeam = await getTeamById(teamId);
    setTeam(loadedTeam);
    setSelectedPlayerIds(loadedTeam.squadPlayerIds || []);
  }

  const availablePlayers = useMemo(() => {
    if (!team) return [];

    return (importedRegistryData.players || [])
      .filter((player) => {
        if (!team.clubName) return true;
        return player.clubName === team.clubName;
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [team]);

  function togglePlayer(playerId) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  async function handleSaveSquad() {
    try {
      await updateTeamSquad({
        teamId,
        squadPlayerIds: selectedPlayerIds
      });

      setMessage('Squad saved successfully.');
      await loadTeam();
    } catch (error) {
      setMessage(error.message || 'Could not save squad.');
    }
  }

  if (!team) {
    return (
      <div className="page-stack">
        <PageHeader title="Team Squad Manager" />
        <p className="muted-text">Loading team...</p>
      </div>
    );
  }

  return (
    <div className="page-stack admin-team-detail-page">
      <PageHeader
        title={team.name}
        subtitle={`${team.clubName || 'No club'} • ${team.divisionName || 'No division'} • ${team.competitionName || 'No competition'}`}
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Squad Management</h3>

          <Link to="/admin/teams" className="panel-link">
            Back to Teams
          </Link>
        </div>

        <p className="muted-text">
          Select players from this club who belong to this team squad.
        </p>

        {message ? <div className="form-success">{message}</div> : null}

        <div className="admin-squad-list">
          {availablePlayers.map((player) => {
            const checked = selectedPlayerIds.includes(player.playerId);

            return (
              <button
                key={player.playerId}
                type="button"
                className={`admin-squad-player ${checked ? 'selected' : ''}`}
                onClick={() => togglePlayer(player.playerId)}
              >
                <span>{player.fullName}</span>
                <span>{checked ? 'Selected' : 'Add'}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="primary-btn auth-submit-btn"
          onClick={handleSaveSquad}
        >
          Save Squad
        </button>
      </section>
    </div>
  );
}