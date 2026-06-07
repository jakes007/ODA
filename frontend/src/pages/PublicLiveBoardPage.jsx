import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Radio,
  Target
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import {
  GlowDart,
  LivePulse,
  TeamCrest,
  getMatchupPlayers,
  getScoreParts
} from '../components/public/PublicBroadcast';
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
    setFixture(await getPublicLiveFixtureData(fixtureId));
    setLoading(false);
  }

  const matchup = useMemo(
    () => fixture?.liveSession?.games?.find((game) => String(game.matchupId) === String(matchupId)),
    [fixture, matchupId]
  );
  const orderedMatchups = useMemo(
    () => [...(fixture?.liveSession?.games || [])].sort(sortMatchups),
    [fixture]
  );
  const matchupIndex = orderedMatchups.findIndex((game) => String(game.matchupId) === String(matchupId));
  const previousMatchup = matchupIndex > 0 ? orderedMatchups[matchupIndex - 1] : null;
  const nextMatchup = matchupIndex >= 0 && matchupIndex < orderedMatchups.length - 1 ? orderedMatchups[matchupIndex + 1] : null;

  if (loading) return <EmptyState message="Loading live board..." />;
  if (!fixture || !matchup) return <EmptyState message="Live board not found." />;

  const players = getMatchupPlayers(matchup);
  const currentSide = matchup.liveState?.currentTurnSide || 'home';
  const currentPlayer = currentSide === 'home' ? players.home : players.away;
  const score = getScoreParts(fixture.scoreText);
  const historyRows = getVisibleHistoryRows(matchup);
  const winnerSide = matchup.liveState?.winnerSide || matchup.result?.winnerSide || null;
  const resultEntry = matchup.scoringMode === 'result_entry' && !winnerSide;

  return (
    <main className="pb-board-page">
      <header className="pb-board-topbar">
        <Link to={`/live/${fixtureId}`}><ArrowLeft size={21} /> Back to Match Centre</Link>
        <div className="pb-board-brand">ODA <strong>Live</strong></div>
        <div className="pb-board-top-meta"><Target size={19} /><span>Board {matchup.boardNumber || '-'}</span><LivePulse label="Live Sync" /></div>
      </header>

      <section className="pb-board-fixture-strip">
        <div className="home"><TeamCrest teamName={fixture.homeTeam.teamName} side="home" size="small" /></div>
        <div className="pb-board-fixture-score">
          <div className="home"><span>{fixture.homeTeam.teamName}</span><b>{score.home}</b></div>
          <em>-</em>
          <div className="away"><b>{score.away}</b><span>{fixture.awayTeam.teamName}</span></div>
        </div>
        <div className="away"><TeamCrest teamName={fixture.awayTeam.teamName} side="away" size="small" /></div>
      </section>

      <section className="pb-board-score-grid">
        <PlayerScore
          side="home"
          playerName={players.home}
          score={matchup.liveState?.homeScoreLeft ?? 501}
          active={currentSide === 'home'}
        />
        <div className="pb-board-score-vs">VS</div>
        <PlayerScore
          side="away"
          playerName={players.away}
          score={matchup.liveState?.awayScoreLeft ?? 501}
          active={currentSide === 'away'}
        />
      </section>

      {resultEntry ? (
        <section className="pb-board-result-entry">
          <Radio size={24} />
          <div><strong>Result entry mode</strong><span>Turn-by-turn scores will appear when the captain submits the final result.</span></div>
        </section>
      ) : (
        <section className="pb-throws-panel">
          <div className="pb-throws-heading"><i /><h2>Latest Throws</h2><i /></div>
          <div className="pb-throws-table">
            <div className="pb-throws-table-head">
              <strong>{players.home}</strong><span>Total Darts</span><strong>{players.away}</strong>
            </div>
            {historyRows.map((row) => (
              <ThrowRow key={row.rowIndex} row={row} currentSide={currentSide} />
            ))}
          </div>
          <div className="pb-next-throw"><GlowDart side={currentSide} size={22} /> {currentPlayer} to throw</div>
        </section>
      )}

      <section className="pb-board-stats">
        <PlayerStats side="home" teamName={fixture.homeTeam.teamName} playerName={players.home} matchup={matchup} />
        <PlayerStats side="away" teamName={fixture.awayTeam.teamName} playerName={players.away} matchup={matchup} />
      </section>

      <footer className="pb-board-navigation">
        {previousMatchup ? (
          <Link to={`/live/${fixtureId}/board/${previousMatchup.matchupId}`}><ChevronLeft size={20} /> Previous Board</Link>
        ) : (
          <span className="disabled"><ChevronLeft size={20} /> Previous Board</span>
        )}
        <Link to={`/live/${fixtureId}`}><Target size={20} /> Back to Match Centre</Link>
        {nextMatchup ? (
          <Link to={`/live/${fixtureId}/board/${nextMatchup.matchupId}`}>Next Board <ChevronRight size={20} /></Link>
        ) : (
          <span className="disabled">Next Board <ChevronRight size={20} /></span>
        )}
      </footer>

      {winnerSide && (
        <div className="pb-winner-overlay">
          <div className="pb-winner-card">
            <div className="pb-winner-heading">
              <CheckCircle2 size={42} />
              <div><span>Game Complete</span><h2>{winnerSide === 'home' ? players.home : players.away} wins</h2></div>
            </div>
            <div className="pb-winner-stats">
              <PlayerStats side="home" teamName={fixture.homeTeam.teamName} playerName={players.home} matchup={matchup} />
              <PlayerStats side="away" teamName={fixture.awayTeam.teamName} playerName={players.away} matchup={matchup} />
            </div>
            <Link to={`/live/${fixtureId}`}>Back to Match Centre <ArrowRight size={20} /></Link>
          </div>
        </div>
      )}
    </main>
  );
}

function PlayerScore({ side, playerName, score, active }) {
  return (
    <article className={`pb-player-score ${side} ${active ? 'active' : ''}`}>
      {active && <span className="pb-current-ribbon"><Radio size={18} /><small>Current Throw</small><strong>{playerName}</strong></span>}
      <div className="pb-player-score-main">
        <div><strong>{playerName}</strong><b>{score}</b><span>Remaining</span></div>
      </div>
    </article>
  );
}

function ThrowRow({ row, currentSide }) {
  const isCurrent = !row.homeTurn || !row.awayTurn;
  const isComplete = Boolean(row.homeTurn && row.awayTurn);
  return (
    <div className={`pb-throw-row ${isCurrent ? 'current' : ''}`}>
      <TurnValue turn={row.homeTurn} waiting={isCurrent && currentSide === 'home'} side="home" />
      <span className={`pb-darts-used ${isComplete ? 'complete' : 'current'}`}>{row.dartsUsedTotal}</span>
      <TurnValue turn={row.awayTurn} waiting={isCurrent && currentSide === 'away'} side="away" />
    </div>
  );
}

function TurnValue({ turn, waiting, side }) {
  if (!turn) return <div className={`pb-turn-value ${side} empty`}>{waiting ? 'Waiting' : '-'}</div>;
  const tier = getScoreTier(turn.score);
  return (
    <div className={`pb-turn-value ${side} ${tier}`}>
      <strong>{turn.score}</strong>
      {tier === 'maximum' && <span>Maximum</span>}
    </div>
  );
}

function PlayerStats({ side, teamName, playerName, matchup }) {
  return (
    <article className={`pb-player-stats ${side}`}>
      <div className="pb-stats-player"><TeamCrest teamName={teamName} side={side} size="small" /><strong>{playerName}</strong></div>
      <Stat label="Avg" value={getAverage(matchup, side)} />
      <Stat label="180s" value={getCount(matchup, side, 180)} />
      <Stat label="Ton+" value={getTons(matchup, side)} />
      <Stat label="Highest" value={getHighestScore(matchup, side)} />
      <Stat label="Darts" value={getTotalDarts(matchup, side)} />
    </article>
  );
}

function Stat({ label, value }) {
  return <div className="pb-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function getTurnsForSide(matchup, side) {
  return (matchup.liveState?.turns || []).filter((turn) => turn.side === side);
}

function getAverage(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    const darts = getTotalDarts(matchup, side);
    const key = side === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';
    const left = Number(matchup.summaryResult?.[key] ?? matchup.liveState?.[key] ?? 501);
    return darts ? (((501 - left) / darts) * 3).toFixed(2) : '0.00';
  }
  const stats = side === 'home' ? matchup.liveState?.homeStats : matchup.liveState?.awayStats;
  if (stats?.average !== undefined) return stats.average;
  const turns = getTurnsForSide(matchup, side);
  const scored = turns.reduce((sum, turn) => sum + Number(turn.score || 0), 0);
  const darts = turns.reduce((sum, turn) => sum + Number(turn.dartsUsed || 3), 0);
  return darts ? ((scored / darts) * 3).toFixed(2) : '0.00';
}

function getCount(matchup, side, score) {
  if (matchup.scoringMode === 'result_entry' && score === 180) {
    return Number(matchup.summaryResult?.[side === 'home' ? 'homeOneEighties' : 'awayOneEighties'] || 0);
  }
  return getTurnsForSide(matchup, side).filter((turn) => Number(turn.score) === score).length;
}

function getTons(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    return Number(matchup.summaryResult?.[side === 'home' ? 'homeTons' : 'awayTons'] || 0);
  }
  return getTurnsForSide(matchup, side).filter((turn) => Number(turn.score) >= 100).length;
}

function getHighestScore(matchup, side) {
  const turns = getTurnsForSide(matchup, side);
  return turns.length ? Math.max(...turns.map((turn) => Number(turn.score || 0))) : 0;
}

function getTotalDarts(matchup, side) {
  if (matchup.scoringMode === 'result_entry') {
    return Number(matchup.summaryResult?.[side === 'home' ? 'homeDartsUsed' : 'awayDartsUsed'] || 0);
  }
  return getTurnsForSide(matchup, side).reduce((sum, turn) => sum + Number(turn.dartsUsed || 3), 0);
}

function getVisibleHistoryRows(matchup) {
  const home = getTurnsForSide(matchup, 'home');
  const away = getTurnsForSide(matchup, 'away');
  let count = Math.max(home.length, away.length, 1);
  if (home.length === away.length && home.length && !matchup.liveState?.winnerSide) count += 1;
  return Array.from({ length: count }).map((_, index) => ({
    rowIndex: index,
    dartsUsedTotal: (index + 1) * 3,
    homeTurn: home[index] || null,
    awayTurn: away[index] || null
  })).slice(-4).reverse();
}

function getScoreTier(score) {
  const value = Number(score || 0);
  if (value === 180) return 'maximum';
  if (value >= 100) return 'ton-plus';
  return 'standard';
}

function sortMatchups(a, b) {
  return Number(a.blockNumber || 0) - Number(b.blockNumber || 0)
    || Number(a.blockOrder || 0) - Number(b.blockOrder || 0)
    || Number(a.boardNumber || 0) - Number(b.boardNumber || 0);
}
