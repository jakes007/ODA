import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { importedFixturesData } from '../data/importedFixturesData';

function getAllFixtures() {
  return [
    ...(importedFixturesData.divisions?.Upper || []),
    ...(importedFixturesData.divisions?.Lower || [])
  ];
}

function formatAverage(value) {
  return Number(value || 0).toFixed(2);
}

function groupRowsByPlayer(rows) {
  const map = new Map();

  rows.forEach((row) => {
    const key = row.playerId || row.playerName;

    if (!map.has(key)) {
      map.set(key, {
        playerName: row.playerName,
        rows: []
      });
    }

    map.get(key).rows.push(row);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.playerName.localeCompare(b.playerName)
  );
}

function getNameSignature(name) {
  const cleaned = String(name || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = cleaned.split(' ').filter(Boolean);

  if (!parts.length) {
    return '';
  }

  const firstInitial = parts[0][0] || '';
  const surname = parts[parts.length - 1] || '';

  return `${firstInitial}${surname}`;
}

function groupPlayersByTeam(fixture) {
  const homeRows = [];
  const awayRows = [];

  (fixture.playerRows || [])
    .filter((row) => row.fixtureId === fixture.id)
    .forEach((row) => {
      if (row.teamName === fixture.homeTeamDisplay || row.teamName === fixture.homeTeam) {
        homeRows.push(row);
      } else if (row.teamName === fixture.awayTeamDisplay || row.teamName === fixture.awayTeam) {
        awayRows.push(row);
      }
    });

  return {
    homePlayers: groupRowsByPlayer(homeRows),
    awayPlayers: groupRowsByPlayer(awayRows)
  };
}

function OpponentRow({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixture-opponent-card">
      <button
        type="button"
        className="fixture-opponent-summary"
        onClick={() => setOpen((current) => !current)}
      >
        <span>vs {row.opponentName || 'Unknown Opponent'}</span>
        <span>{open ? 'Hide' : 'Details'}</span>
      </button>

      {open && (
        <div className="fixture-player-details">
          <div className="fixture-detail-stat">
            <span>Total</span>
            <strong>{row.total}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>Darts Used</span>
            <strong>{row.dartsUsed}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>Average</span>
            <strong>{formatAverage(row.average)}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>Tons</span>
            <strong>{row.tons}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>180s</span>
            <strong>{row.oneEighties}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>Highest Close</span>
            <strong>{row.highestClose}</strong>
          </div>

          <div className="fixture-detail-stat">
            <span>Result</span>
            <strong>{row.singlesWon ? 'Won' : 'Lost'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerGroupCard({ player }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixture-player-card">
      <button
        type="button"
        className="fixture-player-summary"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{player.playerName}</span>
        <span>{open ? 'Hide opponents' : 'View opponents'}</span>
      </button>

      {open && (
        <div className="fixture-opponent-list">
          {player.rows.map((row, index) => (
            <OpponentRow
              key={`${player.playerName}-${row.opponentName}-${index}`}
              row={row}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamPlayerList({ title, players }) {
  return (
    <section className="fixture-team-player-panel">
      <h3 className="panel-title">{title}</h3>

      {!players.length ? (
        <p className="muted-text">No player rows found for this team.</p>
      ) : (
        <div className="fixture-team-player-list">
          {players.map((player) => (
            <PlayerGroupCard key={player.playerName} player={player} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function FixtureDetailPage() {
  const { fixtureId } = useParams();
  const fixture = getAllFixtures().find((item) => item.id === fixtureId);

  if (!fixture) {
    return <EmptyState message="Fixture not found." />;
  }

  const { homePlayers, awayPlayers } = groupPlayersByTeam(fixture);

  return (
    <div className="page-stack fixture-detail-page">
      <PageHeader
        title={fixture.fixtureName}
        subtitle={`${importedFixturesData.competitionName} • ${fixture.division} Division • ${fixture.date}`}
      />

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Match Result</h3>

          <Link to="/competition/fixtures" className="panel-link">
            Back to fixtures
          </Link>
        </div>

        <div className="fixture-detail-score">
          <span>{fixture.homeTeamDisplay || fixture.homeTeam}</span>
          <strong>{fixture.scoreText}</strong>
          <span>{fixture.awayTeamDisplay || fixture.awayTeam}</span>
        </div>
      </section>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Player Match Data</h3>
        </div>

        <div className="fixture-team-grid">
          <TeamPlayerList
            title={fixture.homeTeamDisplay || fixture.homeTeam}
            players={homePlayers}
          />

          <TeamPlayerList
            title={fixture.awayTeamDisplay || fixture.awayTeam}
            players={awayPlayers}
          />
        </div>
      </section>
    </div>
  );
}