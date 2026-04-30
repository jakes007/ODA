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

function groupPlayersByTeam(fixture) {
  const homePlayers = [];
  const awayPlayers = [];

  (fixture.playerRows || []).forEach((row) => {
    if (row.teamName === fixture.homeTeamDisplay || row.teamName === fixture.homeTeam) {
      homePlayers.push(row);
    } else if (row.teamName === fixture.awayTeamDisplay || row.teamName === fixture.awayTeam) {
      awayPlayers.push(row);
    }
  });

  return { homePlayers, awayPlayers };
}

function PlayerMatchCard({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixture-player-card">
      <button
        type="button"
        className="fixture-player-summary"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{row.playerName}</span>
        <span>{open ? 'Hide details' : 'View details'}</span>
      </button>

      {open && (
        <div className="fixture-player-details">
          <div className="fixture-detail-stat">
            <span>Opponent</span>
            <strong>{row.opponentName || 'Unknown'}</strong>
          </div>

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

function TeamPlayerList({ title, players }) {
  return (
    <section className="fixture-team-player-panel">
      <h3 className="panel-title">{title}</h3>

      {!players.length ? (
        <p className="muted-text">No player rows found for this team.</p>
      ) : (
        <div className="fixture-team-player-list">
          {players.map((row, index) => (
            <PlayerMatchCard key={`${row.playerName}-${index}`} row={row} />
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