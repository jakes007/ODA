import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { importedRegistryData } from '../data/importedRegistryData';
import { importedFixturesData } from '../data/importedFixturesData';
import {
  getTeamById,
  updateTeamSquad,
  updateTeamCaptain
} from '../services/adminTeamService';

function normalizeName(value = '') {
  return String(value)
    .replace(/^boo\b/i, 'Best Of Order')
    .replace(/^eastside\b/i, 'East Side')
    .replace(/\s+\d+$/, '')
    .replace(/\bdarts?\s*club\b/gi, '')
    .replace(/\bclub\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeExactTeamName(value = '') {
  return String(value)
    .replace(/^boo\b/i, 'Best Of Order')
    .replace(/^eastside\b/i, 'East Side')
    .replace(/\bdarts?\s*club\b/gi, '')
    .replace(/\bclub\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getFixturePlayersForTeam(teamName) {
  const normalizedTeam = normalizeExactTeamName(teamName);
  const divisions = importedFixturesData?.divisions || {};

  return Object.values(divisions)
    .flatMap((fixtures) => fixtures || [])
    .flatMap((fixture) => fixture.playerRows || [])
    .filter((row) => {
      return normalizeExactTeamName(row.teamName) === normalizedTeam;
    });
}

export default function AdminTeamDetailPage() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [message, setMessage] = useState('');
  const [captainPlayerId, setCaptainPlayerId] = useState('');

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  async function loadTeam() {
    const loadedTeam = await getTeamById(teamId);

    setTeam(loadedTeam);
    setSelectedPlayerIds(loadedTeam.squadPlayerIds || []);
    setCaptainPlayerId(loadedTeam.captainPlayerId || '');
  }

  const availablePlayers = useMemo(() => {
    if (!team) return [];

    const teamClub = normalizeName(team.clubName || team.name);

    return (importedRegistryData.players || [])
      .filter(
        (player) =>
          normalizeName(player.clubName || player.club) ===
          teamClub
      )
      .sort((a, b) =>
        String(a.fullName || '').localeCompare(
          String(b.fullName || '')
        )
      );
  }, [team]);

  function isPlayerSelected(player) {
    return selectedPlayerIds.includes(player.playerId);
  }

  const selectedSquadPlayers = availablePlayers.filter((player) =>
    isPlayerSelected(player)
  );

  function togglePlayer(playerId) {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  }

  async function handleAutoFillSquadFromStats() {
    try {
      const fixturePlayers = getFixturePlayersForTeam(team.name);

      const normalizedFixtureNames = [
        ...new Set(
          fixturePlayers.map((row) =>
            normalizeName(
              row.playerName ||
                row.player ||
                row.name
            )
          )
        )
      ];

      const matchedRegistryPlayers = availablePlayers.filter(
        (registryPlayer) =>
          normalizedFixtureNames.includes(
            normalizeName(registryPlayer.fullName)
          )
      );

      const matchedRegistryPlayerIds =
        matchedRegistryPlayers.map(
          (player) => player.playerId
        );

      if (!matchedRegistryPlayerIds.length) {
        setMessage(
          'No imported fixture players found for this team.'
        );
        return;
      }

      await updateTeamSquad({
        teamId,
        squadPlayerIds: matchedRegistryPlayerIds
      });

      setSelectedPlayerIds(matchedRegistryPlayerIds);

      setMessage(
        `Squad auto-filled with ${matchedRegistryPlayerIds.length} players from fixtures.`
      );

      await loadTeam();
    } catch (error) {
      setMessage(
        error.message ||
          'Could not auto-fill squad from fixtures.'
      );
    }
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

  async function handleSaveCaptain() {
    if (!captainPlayerId) {
      setMessage('Please select a captain.');
      return;
    }
  
    try {
      console.log('SAVING CAPTAIN:', captainPlayerId);
  
      await updateTeamCaptain({
        teamId,
        captainPlayerId: captainPlayerId
      });
  
      setTeam((current) => ({
        ...current,
        captainPlayerId
      }));
  
      setMessage('Captain saved successfully.');
  
      await loadTeam();
    } catch (error) {
      console.error(error);
  
      setMessage(
        error.message || 'Could not save captain.'
      );
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
          <h3 className="panel-title">
            Captain Assignment
          </h3>
        </div>

        <p className="muted-text">
          Choose one player from the selected squad to captain this team.
        </p>

        <div className="admin-squad-list">
          {!selectedSquadPlayers.length ? (
            <p className="muted-text">
              Select and save squad players first.
            </p>
          ) : null}

          {selectedSquadPlayers.map((player) => (
            <button
              key={player.playerId}
              type="button"
              className={`admin-squad-player ${
                captainPlayerId === player.playerId
                  ? 'selected'
                  : ''
              }`}
              onClick={() =>
                setCaptainPlayerId(player.playerId)
              }
            >
              <span>{player.fullName}</span>

              <span>
                {captainPlayerId === player.playerId
                  ? 'Captain'
                  : 'Set Captain'}
              </span>
            </button>
          ))}
        </div>

        <button
  type="button"
  className="primary-btn auth-submit-btn"
  onClick={async () => {
    console.log('SAVE BUTTON CLICKED');

    console.log('TEAM ID:', team.id);

    console.log('SELECTED CAPTAIN:', captainPlayerId);

    await handleSaveCaptain();
  }}
>
  Save Captain
</button>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">
            Squad Management
          </h3>

          <Link
            to="/admin/teams"
            className="panel-link"
          >
            Back to Teams
          </Link>
        </div>

        <p className="muted-text">
          Select players from this club who belong to this team squad.
        </p>

        <button
          type="button"
          className="secondary-btn"
          onClick={handleAutoFillSquadFromStats}
        >
          Auto-fill Squad From Imported Fixtures
        </button>

        {message ? (
          <div className="form-success">
            {message}
          </div>
        ) : null}

        <div className="admin-squad-list">
          {!availablePlayers.length ? (
            <p className="muted-text">
              No players found for {team.clubName}.
              Check registry club naming.
            </p>
          ) : null}

          {availablePlayers.map((player) => {
            const checked =
              isPlayerSelected(player);

            return (
              <button
                key={player.playerId}
                type="button"
                className={`admin-squad-player ${
                  checked ? 'selected' : ''
                }`}
                onClick={() =>
                  togglePlayer(player.playerId)
                }
              >
                <span>{player.fullName}</span>

                <span>
                  {checked ? 'Selected' : 'Add'}
                </span>
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