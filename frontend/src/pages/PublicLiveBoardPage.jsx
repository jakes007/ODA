import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import { getPublicLiveFixtureData } from '../services/captainFixtureService';

export default function PublicLiveBoardPage() {
  const { fixtureId, matchupId } = useParams();
  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixture();
    const intervalId = setInterval(loadFixture, 2500);
    return () => clearInterval(intervalId);
  }, [fixtureId]);

  async function loadFixture() {
    const liveFixture = await getPublicLiveFixtureData(fixtureId);
    setFixture(liveFixture);
    setLoading(false);
  }

  const matchup = useMemo(() => {
    const games = fixture?.liveSession?.games ?? [];
    return games.find((game) => String(game.matchupId) === String(matchupId));
  }, [fixture, matchupId]);

  if (loading) return <EmptyState message="Loading live board..." />;
  if (!fixture || !matchup) return <EmptyState message="Live board not found." />;

  const players = getMatchupPlayerNames(matchup);
  const currentSide = matchup.liveState?.currentTurnSide ?? 'home';

  return (
    <div className="plb-page">
      <div className="plb-top-bar">
        <Link to={`/live/${fixtureId}`} className="plb-back-link">
          ← Back To Progress Board
        </Link>

        <div className="plb-live-sync">
          ● LIVE SYNC
        </div>
      </div>

      <section className="plb-scoreboard">
        <div className="plb-header">
          <div className="plb-brand">ODA LIVE SCORER</div>

          <div>
            <div className="plb-fixture-title">
              {fixture.homeTeam?.teamName} vs {fixture.awayTeam?.teamName}
            </div>

            <div className="plb-board-meta">
              Board {matchup.boardNumber ?? '-'} • {matchup.label}
            </div>
          </div>

          <div className="plb-live-box">
            LIVE
          </div>
        </div>

        <div className="plb-main-grid">
          <ScorePanel
            side="home"
            active={currentSide === 'home'}
            playerName={players.home}
            score={matchup.liveState?.homeScoreLeft ?? 501}
          />

          <div className="plb-vs">VS</div>

          <ScorePanel
            side="away"
            active={currentSide === 'away'}
            playerName={players.away}
            score={matchup.liveState?.awayScoreLeft ?? 501}
          />
        </div>

        <div className="plb-status-strip">
  <div className="plb-status-item plb-status-left">
    <span>Current Throw</span>
    <strong>{currentSide === 'home' ? players.home : players.away}</strong>
  </div>

  <div className="plb-team-score-status">
    <span>{fixture.homeTeam?.teamName}</span>
    <strong>{getScoreParts(fixture.scoreText).home} - {getScoreParts(fixture.scoreText).away}</strong>
    <span>{fixture.awayTeam?.teamName}</span>
  </div>

  <div className="plb-status-item plb-status-right">
    <span>Leg Status</span>
    <strong>In Progress</strong>
  </div>
</div>

        <div className="plb-history-board">
          <TurnColumn title={players.home} turns={getTurnsForSide(matchup, 'home')} />

          <div className="plb-du-column">
            <div className="plb-du-title">D/U</div>

            {getDartsUsedList(matchup).map((value, index) => (
              <div key={index} className="plb-du-bubble">
                {value}
              </div>
            ))}
          </div>

          <TurnColumn title={players.away} turns={getTurnsForSide(matchup, 'away')} away />
        </div>

        <div className="plb-stats-grid">
          <StatPill label="AVG" value={getAverage(matchup, 'home')} />
          <StatPill label="180s" value={getCount(matchup, 'home', 180)} />
          <StatPill label="TON+" value={getTons(matchup, 'home')} />

          <StatPill label="AVG" value={getAverage(matchup, 'away')} away />
          <StatPill label="180s" value={getCount(matchup, 'away', 180)} away />
          <StatPill label="TON+" value={getTons(matchup, 'away')} away />
        </div>
      </section>
    </div>
  );
}

function ScorePanel({ side, active, playerName, score }) {
  return (
    <div className={`plb-score-panel ${side} ${active ? 'active' : ''}`}>
      <div className="plb-player-row">
        <span className="plb-player-dot" />
        <strong>{playerName}</strong>
      </div>

      <div className="plb-score-number">
        {score}
      </div>
    </div>
  );
}

function TurnColumn({ title, turns, away = false }) {
  const latestTurns = turns.slice(-5).reverse();

  return (
    <div className={`plb-turn-column ${away ? 'away' : ''}`}>
      <div className="plb-turn-title">{title}</div>

      {latestTurns.length === 0 ? (
        <div className="plb-empty-history">Waiting for first score</div>
      ) : (
        latestTurns.map((turn, index) => (
          <div key={index} className="plb-turn-row">
            {!away ? (
              <>
                <div>{turn.scored}</div>
                <span>→</span>
                <div>{turn.remaining}</div>
              </>
            ) : (
              <>
                <div>{turn.remaining}</div>
                <span>←</span>
                <div>{turn.scored}</div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function StatPill({ label, value, away = false }) {
  return (
    <div className={`plb-stat-pill ${away ? 'away' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getMatchupPlayerNames(matchup) {
  const parts = String(matchup.label || '').split(' vs ');

  return {
    home: parts[0]?.trim() || 'Home Player',
    away: parts[1]?.trim() || 'Away Player'
  };
}

function getCombinedTurns(matchup) {
  return matchup.liveState?.turnHistory ?? [];
}

function getTurnsForSide(matchup, side) {
  return getCombinedTurns(matchup).filter((turn) => turn.side === side);
}

function getDartsUsedList(matchup) {
  const turns = getCombinedTurns(matchup).slice(-5).reverse();

  if (!turns.length) {
    return [3, 6, 9];
  }

  return turns.map((turn, index) => turn.dartsUsedTotal ?? (index + 1) * 3);
}

function getAverage(matchup, side) {
  const turns = getTurnsForSide(matchup, side);
  if (!turns.length) return '0.00';

  const totalScored = turns.reduce((sum, turn) => sum + Number(turn.scored || 0), 0);
  const dartsUsed = turns.reduce((sum, turn) => sum + Number(turn.dartsUsed || 3), 0);

  return dartsUsed ? ((totalScored / dartsUsed) * 3).toFixed(2) : '0.00';
}

function getCount(matchup, side, score) {
  return getTurnsForSide(matchup, side).filter(
    (turn) => Number(turn.scored) === score
  ).length;
}

function getTons(matchup, side) {
  return getTurnsForSide(matchup, side).filter(
    (turn) => Number(turn.scored) >= 100
  ).length;
}

function getScoreParts(scoreText) {
  const parts = String(scoreText || '0 - 0')
    .split('-')
    .map((part) => part.trim());

  return {
    home: parts[0] || '0',
    away: parts[1] || '0'
  };
}