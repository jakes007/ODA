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
const winnerSide = getWinnerSide(matchup);

const isResultEntryMode =
  matchup.scoringMode === 'result_entry' &&
  !winnerSide;

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

{isResultEntryMode ? (
  <div className="plb-result-entry-notice">
    <div className="plb-result-entry-icon">!</div>

    <div>
      <strong>Result Entry Mode Selected</strong>
      <span>
        This leg will not be scored turn-by-turn. The final result and stats will appear once the captain submits the result.
      </span>
    </div>
  </div>
) : null}

{!isResultEntryMode ? (
  <div className="plb-history-board">
  <div className="plb-turn-column">
    <div className="plb-turn-title">{players.home}</div>
  </div>

  <div className="plb-du-column">
    <div className="plb-du-title">D/U</div>
  </div>

  <div className="plb-turn-column away">
    <div className="plb-turn-title">{players.away}</div>
  </div>

  {getVisibleHistoryRows(matchup).map((row) => (
    <div className="plb-history-row" key={row.dartsUsedTotal}>
      <div className="plb-turn-row">
      {row.homeTurn ? (
  <>
    <div>{row.homeTurn.score}</div>
    <span>→</span>
    <div>{row.homeTurn.resultingScore}</div>
  </>
) : shouldShowWaitingBlock(row, 'home', matchup) ? (
  <div
    className={`plb-empty-history ${
      isActiveWaitingRow(row, currentSide, 'home', matchup)
        ? 'active-waiting'
        : 'inactive-waiting'
    }`}
  >
    {isActiveWaitingRow(row, currentSide, 'home', matchup) ? 'Waiting' : ''}
  </div>
) : (
  <div className="plb-empty-history inactive-waiting" />
)}
      </div>

      <div
  className={`plb-du-bubble ${
    row.homeTurn && row.awayTurn
      ? 'completed'
      : 'pending'
  }`}
>
  {row.dartsUsedTotal}
</div>

      <div className="plb-turn-row away">
      {row.awayTurn ? (
  <>
    <div>{row.awayTurn.resultingScore}</div>
    <span>←</span>
    <div>{row.awayTurn.score}</div>
  </>
) : shouldShowWaitingBlock(row, 'away', matchup) ? (
  <div
    className={`plb-empty-history ${
      isActiveWaitingRow(row, currentSide, 'away', matchup)
        ? 'active-waiting'
        : 'inactive-waiting'
    }`}
  >
    {isActiveWaitingRow(row, currentSide, 'away', matchup) ? 'Waiting' : ''}
  </div>
) : (
  <div className="plb-empty-history inactive-waiting" />
)}
      </div>
    </div>
  ))}
</div>
) : null}

<div className="plb-stats-grid">
          <StatPill label="AVG" value={getAverage(matchup, 'home')} />
          <StatPill label="180s" value={getCount(matchup, 'home', 180)} />
          <StatPill label="TON+" value={getTons(matchup, 'home')} />

          <StatPill label="AVG" value={getAverage(matchup, 'away')} away />
          <StatPill label="180s" value={getCount(matchup, 'away', 180)} away />
          <StatPill label="TON+" value={getTons(matchup, 'away')} away />
        </div>
        </section>

        {winnerSide && (
  <div className="plb-winner-overlay">
    <div className="plb-winner-card">
      <div className="plb-winner-kicker">
        GAME COMPLETE
      </div>

      <h2>
        {getWinnerName(matchup, players)} wins
      </h2>

      <div className="plb-winner-stats-grid">
  <WinnerStats
    playerName={players.home}
    average={getAverage(matchup, 'home')}
    oneEighties={getCount(matchup, 'home', 180)}
    tons={getTons(matchup, 'home')}
    highestScore={getHighestScore(matchup, 'home')}
    totalDarts={getTotalDarts(matchup, 'home')}
    scoreLeft={matchup.liveState?.homeScoreLeft}
    checkout={getCheckoutScore(matchup, 'home')}
    checkoutDarts={getCheckoutDarts(matchup, 'home')}
    winner={winnerSide === 'home'}
  />

  <WinnerStats
    playerName={players.away}
    average={getAverage(matchup, 'away')}
    oneEighties={getCount(matchup, 'away', 180)}
    tons={getTons(matchup, 'away')}
    highestScore={getHighestScore(matchup, 'away')}
    totalDarts={getTotalDarts(matchup, 'away')}
    scoreLeft={matchup.liveState?.awayScoreLeft}
    checkout={getCheckoutScore(matchup, 'away')}
    checkoutDarts={getCheckoutDarts(matchup, 'away')}
    winner={winnerSide === 'away'}
    away
  />
</div>

      <Link
        to={`/live/${fixtureId}`}
        className="plb-winner-back-btn"
      >
        ← Back To Progress Board
      </Link>
    </div>
  </div>
)}

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
  const visibleTurns = turns.slice(-5);

  return (
    <div className={`plb-turn-column ${away ? 'away' : ''}`}>
      <div className="plb-turn-title">{title}</div>

      {visibleTurns.length === 0 ? (
        <div className="plb-empty-history">Waiting for first score</div>
      ) : (
        visibleTurns.map((turn, index) => (
          <div key={`${turn.createdAt}-${index}`} className="plb-turn-row">
            {!away ? (
              <>
                <div>{turn.score}</div>
                <span>→</span>
                <div>{turn.resultingScore}</div>
              </>
            ) : (
              <>
                <div>{turn.resultingScore}</div>
                <span>←</span>
                <div>{turn.score}</div>
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

function WinnerStats({
  playerName,
  average,
  oneEighties,
  tons,
  highestScore,
  totalDarts,
  scoreLeft,
  checkout,
  checkoutDarts,
  winner,
  away = false
}) {
  return (
    <div className={`plb-winner-player-card ${away ? 'away' : ''}`}>
      <div className="plb-winner-player-header">
        <h3>{playerName}</h3>

        {winner && (
          <span className="plb-winner-badge">
            WINNER
          </span>
        )}
      </div>

      {winner ? (
        <div className="plb-checkout-banner">
          Checkout {checkout}
          <span>
            • {checkoutDarts} dart finish
          </span>
        </div>
      ) : (
        <div className="plb-score-left-banner">
          {scoreLeft} Remaining
        </div>
      )}

      <div className="plb-winner-stat-row">
        <span>AVG</span>
        <strong>{average}</strong>
      </div>

      <div className="plb-winner-stat-row">
        <span>180s</span>
        <strong>{oneEighties}</strong>
      </div>

      <div className="plb-winner-stat-row">
        <span>TON+</span>
        <strong>{tons}</strong>
      </div>

      <div className="plb-winner-stat-row">
        <span>Highest Score</span>
        <strong>{highestScore}</strong>
      </div>

      <div className="plb-winner-stat-row">
        <span>Total Darts</span>
        <strong>{totalDarts}</strong>
      </div>
    </div>
  );
}

function getWinnerName(matchup, players) {
  const winnerSide = getWinnerSide(matchup);

  if (winnerSide === 'home') return players.home;
  if (winnerSide === 'away') return players.away;

  return 'Winner';
}

function getWinnerSide(matchup) {
  return matchup.liveState?.winnerSide || matchup.result?.winnerSide || null;
}

function getHighestScore(matchup, side) {
  const turns = getTurnsForSide(matchup, side);

  if (!turns.length) {
    return 0;
  }

  return Math.max(...turns.map((turn) => Number(turn.score || 0)));
}

function getTotalDarts(matchup, side) {
  const summaryKey = side === 'home' ? 'homeDartsUsed' : 'awayDartsUsed';

  if (matchup.scoringMode === 'result_entry') {
    return Number(matchup.summaryResult?.[summaryKey] || 0);
  }

  return getTurnsForSide(matchup, side).reduce(
    (sum, turn) => sum + Number(turn.dartsUsed || 3),
    0
  );
}

function getCheckoutScore(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    const key = side === 'home' ? 'homeHighCheckout' : 'awayHighCheckout';
    return Number(matchup.summaryResult?.[key] || 0);
  }

  const turns = getTurnsForSide(matchup, side);

  if (!turns.length) return 0;

  const finalTurn = turns[turns.length - 1];

  return finalTurn.score || 0;
}

function getCheckoutDarts(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    return getTotalDarts(matchup, side);
  }

  const turns = getTurnsForSide(matchup, side);

  if (!turns.length) return 0;

  const finalTurn = turns[turns.length - 1];

  return finalTurn.dartsUsed || 3;
}

function getMatchupPlayerNames(matchup) {
  const parts = String(matchup.label || '').split(' vs ');

  return {
    home: parts[0]?.trim() || 'Home Player',
    away: parts[1]?.trim() || 'Away Player'
  };
}

function getCombinedTurns(matchup) {
  return matchup.liveState?.turns ?? [];
}

function getTurnsForSide(matchup, side) {
  return getCombinedTurns(matchup).filter((turn) => turn.side === side);
}

function getAverage(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    const dartsUsed = getTotalDarts(matchup, side);

    if (!dartsUsed) return '0.00';

    const scoreLeftKey = side === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';

    const scoreLeft = Number(
      matchup.summaryResult?.[scoreLeftKey] ??
      matchup.liveState?.[scoreLeftKey] ??
      501
    );

    const totalScored = 501 - scoreLeft;

    return ((totalScored / dartsUsed) * 3).toFixed(2);
  }

  const stats = side === 'home'
    ? matchup.liveState?.homeStats
    : matchup.liveState?.awayStats;

  if (stats?.average !== undefined) {
    return stats.average;
  }

  const turns = getTurnsForSide(matchup, side);

  if (!turns.length) return '0.00';

  const totalScored = turns.reduce(
    (sum, turn) => sum + Number(turn.score || 0),
    0
  );

  const dartsUsed = turns.reduce(
    (sum, turn) => sum + Number(turn.dartsUsed || 3),
    0
  );

  return dartsUsed
    ? ((totalScored / dartsUsed) * 3).toFixed(2)
    : '0.00';
}

function getCount(matchup, side, score) {
  if (matchup.scoringMode === 'result_entry' && score === 180) {
    const key = side === 'home' ? 'homeOneEighties' : 'awayOneEighties';
    return Number(matchup.summaryResult?.[key] || 0);
  }

  const stats = side === 'home'
    ? matchup.liveState?.homeStats
    : matchup.liveState?.awayStats;

  if (score === 180 && stats?.oneEighties !== undefined) {
    return stats.oneEighties;
  }

  return getTurnsForSide(matchup, side).filter(
    (turn) => Number(turn.score) === score
  ).length;
}

function getTons(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    const key = side === 'home' ? 'homeTons' : 'awayTons';
    return Number(matchup.summaryResult?.[key] || 0);
  }

  const stats = side === 'home'
    ? matchup.liveState?.homeStats
    : matchup.liveState?.awayStats;

  if (stats?.tons !== undefined) {
    return stats.tons;
  }

  return getTurnsForSide(matchup, side).filter(
    (turn) => Number(turn.score) >= 100
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

function getVisibleHistoryRows(matchup) {
  const homeTurns = getTurnsForSide(matchup, 'home');
  const awayTurns = getTurnsForSide(matchup, 'away');

  const isLegComplete = Boolean(matchup.liveState?.winnerSide);

  let unlockedRows = Math.max(homeTurns.length, awayTurns.length, 1);

  const lastUnlockedRowComplete =
    homeTurns.length === awayTurns.length &&
    homeTurns.length > 0 &&
    !isLegComplete;

  if (lastUnlockedRowComplete) {
    unlockedRows += 1;
  }

  const rows = Array.from({ length: unlockedRows }).map((_, index) => ({
    rowIndex: index,
    dartsUsedTotal: (index + 1) * 3,
    homeTurn: homeTurns[index] || null,
    awayTurn: awayTurns[index] || null
  }));

  return rows.slice(-3);
}

function isActiveWaitingRow(row, currentSide, side, matchup) {
  if (currentSide !== side) {
    return false;
  }

  return shouldShowWaitingBlock(row, side, matchup);
}

function shouldShowWaitingBlock(row, side, matchup) {
  const startingSide = matchup.liveState?.startingSide || 'home';
  const otherSide = side === 'home' ? 'away' : 'home';

  const sideTurn = side === 'home' ? row.homeTurn : row.awayTurn;
  const otherTurn = otherSide === 'home' ? row.homeTurn : row.awayTurn;

  if (sideTurn) {
    return false;
  }

  if (startingSide === side) {
    return !otherTurn;
  }

  return Boolean(otherTurn);
}
