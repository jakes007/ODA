import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Radio,
  Target
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import {
  BroadcastHeading,
  CompetitionLabel,
  FixtureScoreboard,
  LivePulse,
  getMatchupPlayers
} from '../components/public/PublicBroadcast';
import { getPublicLiveFixtureData } from '../services/captainFixtureService';

export default function PublicLiveFixturePage() {
  const { fixtureId } = useParams();
  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('live');

  useEffect(() => {
    loadFixture();
    const intervalId = setInterval(loadFixture, 4000);
    return () => clearInterval(intervalId);
  }, [fixtureId]);

  async function loadFixture() {
    setFixture(await getPublicLiveFixtureData(fixtureId));
    setLoading(false);
  }

  const matchups = useMemo(() => fixture?.liveSession?.games ?? [], [fixture]);
  const active = matchups.filter((game) => game.status === 'in_progress');
  const waiting = matchups.filter((game) => game.status === 'waiting');
  const completed = matchups.filter((game) => game.status === 'completed');
  const groupedBlocks = groupMatchupsByBlock(matchups);

  if (loading) return <EmptyState message="Loading live fixture..." />;
  if (!fixture) return <EmptyState message="Public live fixture not found." />;

  return (
    <div className="pb-page pb-fixture-centre">
      <BroadcastHeading
        title="Live Match Centre"
        subtitle={<CompetitionLabel fixture={fixture} />}
        action={<Link to="/live" className="pb-back-action"><ArrowLeft size={18} /> Back to live hub</Link>}
      />

      <FixtureScoreboard fixture={fixture} compact />

      <section className="pb-active-boards-section">
        <div className="pb-section-heading">
          <div><Target size={21} /><h2>Active Boards</h2></div>
          <LivePulse label={`${active.length} Live`} />
        </div>
        {active.length ? (
          <div className={`pb-active-board-grid ${active.length === 1 ? 'single' : ''}`}>
            {active.map((matchup) => (
              <ActiveBoardPreview key={matchup.matchupId} fixture={fixture} matchup={matchup} />
            ))}
          </div>
        ) : (
          <div className="pb-empty-state compact"><Target size={27} /><p>No boards are currently active.</p></div>
        )}
      </section>

      <nav className="pb-mobile-tabs">
        <MobileTab label="Live" count={active.length} active={mobileView === 'live'} onClick={() => setMobileView('live')} />
        <MobileTab label="Waiting" count={waiting.length} active={mobileView === 'waiting'} onClick={() => setMobileView('waiting')} />
        <MobileTab label="Complete" count={completed.length} active={mobileView === 'complete'} onClick={() => setMobileView('complete')} />
      </nav>

      <section className="pb-progress-section">
        <div className="pb-section-heading">
          <div><BarChart3 size={21} /><h2>Fixture Progress</h2></div>
          <span>{completed.length}/{matchups.length} complete</span>
        </div>
        <div className="pb-block-grid">
          {groupedBlocks.map((block) => (
            <ProgressBlock
              key={block.blockNumber}
              fixture={fixture}
              block={block}
              mobileView={mobileView}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ActiveBoardPreview({ fixture, matchup }) {
  const players = getMatchupPlayers(matchup);
  const currentName = matchup.liveState?.currentTurnSide === 'away' ? players.away : players.home;

  return (
    <article className="pb-active-board-preview">
      <div className="pb-board-number">Board {matchup.boardNumber || '-'}</div>
      <div className="pb-board-score-pair">
        <div className="home"><strong>{players.home}</strong><b>{matchup.liveState?.homeScoreLeft ?? 501}</b><span>Remaining</span></div>
        <div className="pb-board-vs">VS</div>
        <div className="away"><strong>{players.away}</strong><b>{matchup.liveState?.awayScoreLeft ?? 501}</b><span>Remaining</span></div>
      </div>
      <div className="pb-current-throw"><Target size={19} /><span>Current throw</span><strong>{currentName}</strong></div>
      <Link to={`/live/${fixture.fixtureId}/board/${matchup.matchupId}`} className="pb-primary-action">
        <Target size={21} /><span>Watch Board</span><ArrowRight size={21} />
      </Link>
    </article>
  );
}

function ProgressBlock({ fixture, block, mobileView }) {
  const visibleMatchups = block.matchups.filter((matchup) => {
    if (mobileView === 'live') return matchup.status === 'in_progress';
    if (mobileView === 'complete') return matchup.status === 'completed';
    return matchup.status === 'waiting';
  });

  return (
    <article className="pb-progress-block">
      <div className="pb-progress-block-head">
        <strong>Block {block.blockNumber}</strong>
        <BlockStatus matchups={block.matchups} />
      </div>
      <div className="pb-progress-matchups">
        {block.matchups.map((matchup) => <ProgressMatchup key={matchup.matchupId} fixture={fixture} matchup={matchup} />)}
        <div className="pb-mobile-progress-only">
          {visibleMatchups.map((matchup) => <ProgressMatchup key={`mobile-${matchup.matchupId}`} fixture={fixture} matchup={matchup} />)}
          {!visibleMatchups.length && <span>No {mobileView} matchups in this block.</span>}
        </div>
      </div>
    </article>
  );
}

function ProgressMatchup({ fixture, matchup }) {
  const Icon = matchup.status === 'completed' ? CheckCircle2 : matchup.status === 'in_progress' ? Radio : Clock3;
  const players = getMatchupPlayers(matchup);
  const winnerSide = matchup.liveState?.winnerSide || matchup.result?.winnerSide;
  const winnerName = winnerSide === 'home' ? players.home : winnerSide === 'away' ? players.away : null;

  return (
    <Link to={`/live/${fixture.fixtureId}/board/${matchup.matchupId}`} className={`pb-progress-matchup ${matchup.status}`}>
      <Icon size={17} />
      <div>
        <strong>{matchup.label}</strong>
        <span className={winnerName ? 'pb-progress-winner' : ''}>
          {winnerName ? <><b>Winner</b>{winnerName}</> : <>{matchup.formatLabel} {matchup.boardNumber ? `/ Board ${matchup.boardNumber}` : ''}</>}
        </span>
      </div>
      <ArrowRight size={17} />
    </Link>
  );
}

function BlockStatus({ matchups }) {
  const status = matchups.some((game) => game.status === 'in_progress') ? 'Live' : matchups.every((game) => game.status === 'completed') ? 'Complete' : 'Waiting';
  return <span className={status.toLowerCase()}>{status}</span>;
}

function MobileTab({ label, count, active, onClick }) {
  return <button type="button" className={active ? 'active' : ''} onClick={onClick}>{label}<b>{count}</b></button>;
}

function groupMatchupsByBlock(matchups) {
  const map = new Map();
  matchups.forEach((matchup) => {
    if (!map.has(matchup.blockNumber)) map.set(matchup.blockNumber, []);
    map.get(matchup.blockNumber).push(matchup);
  });
  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([blockNumber, games]) => ({
    blockNumber,
    matchups: games.sort((a, b) => a.blockOrder - b.blockOrder)
  }));
}
