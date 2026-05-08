import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { importedFixturesData } from '../data/importedFixturesData';
import { resolvePlayerDisplayName } from '../utils/playerNameResolver';

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
        <span>vs {resolvePlayerDisplayName(row.opponentName) || 'Unknown Opponent'}</span>
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
        <span>{resolvePlayerDisplayName(player.playerName)}</span>
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

function buildFixturePlayerRankings(fixture) {
  const playerMap = new Map();

  (fixture.playerRows || [])
    .filter((row) => row.fixtureId === fixture.id)
    .forEach((row) => {
      const key = row.playerId || row.playerName;

      if (!playerMap.has(key)) {
        playerMap.set(key, {
          playerId: row.playerId,
          playerName: row.playerName,
          teamName: row.teamName,
          total: 0,
          dartsUsed: 0,
          played: 0,
          won: 0,
          tons: 0,
          oneEighties: 0,
          highestClose: 0
        });
      }

      const player = playerMap.get(key);

      player.total += Number(row.total || 0);
      player.dartsUsed += Number(row.dartsUsed || 0);
      player.played += 1;
      player.won += row.singlesWon ? 1 : 0;
      player.tons += Number(row.tons || 0);
      player.oneEighties += Number(row.oneEighties || 0);
      player.highestClose = Math.max(
        player.highestClose,
        Number(row.highestClose || 0)
      );
    });

  return Array.from(playerMap.values())
    .map((player) => {
      const average =
        player.dartsUsed > 0
          ? (player.total / player.dartsUsed) * 3
          : 0;

      const winPercentage =
        player.played > 0
          ? (player.won / player.played) * 100
          : 0;

      const rankingScore = average * 0.7 + winPercentage * 0.3;

      return {
        ...player,
        lost: player.played - player.won,
        average,
        winPercentage,
        rankingScore
      };
    })
    .sort((a, b) => {
      if (b.rankingScore !== a.rankingScore) {
        return b.rankingScore - a.rankingScore;
      }

      if (b.average !== a.average) {
        return b.average - a.average;
      }

      return b.won - a.won;
    });
}

export default function FixtureDetailPage() {
  const { fixtureId } = useParams();
  const fixture = getAllFixtures().find((item) => item.id === fixtureId);

  if (!fixture) {
    return <EmptyState message="Fixture not found." />;
  }

  const { homePlayers, awayPlayers } = groupPlayersByTeam(fixture);

  const fixturePlayerRankings = buildFixturePlayerRankings(fixture);

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

        <section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Fixture Player Rankings</h3>
  </div>

  {!fixturePlayerRankings.length ? (
    <p className="muted-text">No fixture ranking data found.</p>
  ) : (
    <div className="club-table-scroll">
      <table className="club-ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>Avg</th>
            <th>Win %</th>
            <th>Tons</th>
            <th>180s</th>
            <th>H/C</th>
            <th>Ranking</th>
          </tr>
        </thead>

        <tbody>
          {fixturePlayerRankings.map((player, index) => (
            <tr key={player.playerId || player.playerName}>
              <td>{index + 1}</td>
              <td>{resolvePlayerDisplayName(player.playerName)}</td>
              <td>{player.teamName}</td>
              <td>{player.played}</td>
              <td>
  <span className="result-win">
    {player.won}
  </span>
</td>

<td>
  <span className="result-loss">
    {player.lost}
  </span>
</td>
              <td className="orange-stat">{formatAverage(player.average)}</td>
              <td>{formatAverage(player.winPercentage)}%</td>
              <td>{player.tons}</td>
              <td>{player.oneEighties}</td>
              <td>{player.highestClose}</td>
              <td className="orange-stat">
                {Number(player.rankingScore || 0).toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

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