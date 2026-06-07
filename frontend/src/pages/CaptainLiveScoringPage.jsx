import { createElement, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Flag,
  LayoutGrid,
  Play,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getTeamLogo } from '../utils/teamLogos';
import {
  getCaptainLiveScoringData,
  startCaptainFixtureMatchup,
  applyCaptainSubstitution,
  submitCaptainPostMatchWrapUp
} from '../services/captainFixtureService';

export default function CaptainLiveScoringPage() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [outgoingPlayerId, setOutgoingPlayerId] = useState('');
  const [incomingPlayerId, setIncomingPlayerId] = useState('');
  const [selectedOpponentPotmPlayerId, setSelectedOpponentPotmPlayerId] = useState('');
  const [captainNotes, setCaptainNotes] = useState('');
  const [confirmScoresheet, setConfirmScoresheet] = useState(false);
  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('live');
  const [showSubstitutions, setShowSubstitutions] = useState(false);

  useEffect(() => {
    loadLiveFixture();
  }, [fixtureId, currentUser?.playerId]);

  async function loadLiveFixture() {
    if (!fixtureId || !currentUser?.playerId) {
      setLoading(false);
      return;
    }

    const liveFixture = await getCaptainLiveScoringData({
      fixtureId,
      captainPlayerId: currentUser.playerId
    });

    setFixture(liveFixture);
    setLoading(false);
  }

  if (loading) return <EmptyState message="Loading live scoring fixture..." />;
  if (!fixture) return <EmptyState message="Live scoring fixture not found." />;

  if (fixture.status !== 'active' && fixture.status !== 'completed') {
    return (
      <div className="page-stack">
        <PageHeader title="Captain Live Scoring" subtitle="This fixture has not been started yet." />
        <section className="panel">
          <p className="muted-text">{fixture.fixtureName} is currently {formatStatus(fixture.status)}.</p>
          <Link to={`/captain/fixture/${fixtureId}/setup`} className="text-link">
            Return to fixture setup
          </Link>
        </section>
      </div>
    );
  }

  const isFixtureCompleted = fixture.status === 'completed';
  const isHomeCaptain = fixture.captainSide === 'home';
  const canControlFixtureFlow = isHomeCaptain && !isFixtureCompleted;
  const homeTeamName = isHomeCaptain ? fixture.team.teamName : fixture.opponent.teamName;
  const awayTeamName = isHomeCaptain ? fixture.opponent.teamName : fixture.team.teamName;
  const [homeScore, awayScore] = parseScore(fixture.scoreText);
  const matchups = fixture.liveSession?.games ?? [];
  const activeMatchups = matchups.filter((game) => game.status === 'in_progress');
  const waitingMatchups = matchups.filter((game) => game.status === 'waiting');
  const completedMatchups = matchups.filter((game) => game.status === 'completed');
  const myCurrentLineupIds = fixture.myTeam.currentLineup.filter(Boolean);
  const myBenchPlayers = fixture.myTeam.squad.filter(
    (player) => !myCurrentLineupIds.includes(player.playerId)
  );
  const eligibleOutgoingPlayerIds = new Set(
    waitingMatchups.flatMap((matchup) => {
      const players = fixture.captainSide === 'home' ? matchup.homePlayers : matchup.awayPlayers;
      return (players ?? []).map((player) => player.playerId).filter(Boolean);
    })
  );
  const eligibleOutgoingPlayers = fixture.myTeam.squad.filter(
    (player) =>
      myCurrentLineupIds.includes(player.playerId) &&
      eligibleOutgoingPlayerIds.has(player.playerId)
  );
  const myPostMatch = fixture.postMatch?.[fixture.captainSide] ?? {
    selectedOpponentPotmPlayerId: '',
    selectedOpponentPotmPlayerName: '',
    notes: '',
    confirmedAt: null
  };
  const opponentCaptainSide = fixture.captainSide === 'home' ? 'away' : 'home';
  const opponentPostMatch = fixture.postMatch?.[opponentCaptainSide] ?? { confirmedAt: null };
  const wrapUpOpponentSquad = fixture.opponentTeam?.squad ?? [];

  async function handleStartMatchup(matchupId) {
    const result = await startCaptainFixtureMatchup({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      matchupId
    });
    handleResult(result);
    if (result.success) await loadLiveFixture();
  }

  async function handleApplySubstitution() {
    const result = await applyCaptainSubstitution({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      outgoingPlayerId,
      incomingPlayerId
    });
    handleResult(result);
    if (result.success) {
      setOutgoingPlayerId('');
      setIncomingPlayerId('');
      setShowSubstitutions(false);
      await loadLiveFixture();
    }
  }

  async function handleSubmitPostMatchWrapUp() {
    const result = await submitCaptainPostMatchWrapUp({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      selectedOpponentPotmPlayerId,
      notes: captainNotes,
      confirmScoresheet
    });
    handleResult(result);
    if (result.success) await loadLiveFixture();
  }

  function handleResult(result) {
    setErrors(result.success ? [] : [result.message]);
    setSuccessMessage(result.success ? result.message : '');
  }

  function openMatchupScorer(matchupId) {
    navigate(`/captain/fixture/${fixtureId}/matchup/${matchupId}`);
  }

  return (
    <div className="captain-live-page">
      <header className="captain-live-titlebar">
        <div className="captain-live-title-icon"><CircleDot size={22} /></div>
        <div>
          <span>Captain</span>
          <strong>Live Scoring</strong>
        </div>
        <button type="button" className="captain-live-icon-btn" onClick={loadLiveFixture} title="Refresh live data">
          <RefreshCw size={18} />
        </button>
      </header>

      <section className="captain-live-scoreboard">
        <div className="captain-live-score-kicker">Observatory Darts Association</div>
        <div className="captain-live-score-main">
          <TeamScore side="home" name={homeTeamName} score={homeScore} />
          <div className="captain-live-score-centre">
            <span className="captain-live-score-dash">-</span>
            <div className={`captain-live-state ${isFixtureCompleted ? 'complete' : ''}`}>
              <i /> {isFixtureCompleted ? 'Final' : 'Live'}
            </div>
          </div>
          <TeamScore side="away" name={awayTeamName} score={awayScore} />
        </div>
        <div className="captain-live-score-meta">
          <span><Trophy size={16} /> {fixture.competition.name}</span>
          <strong>{fixture.format?.name ?? 'Fixture Format'}</strong>
          <span><ShieldCheck size={16} /> {isHomeCaptain ? 'Home Captain' : 'Away Captain'}</span>
          <button
            type="button"
            className="captain-live-sub-mobile"
            onClick={() => setShowSubstitutions((value) => !value)}
            aria-label="Open substitutions"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>
      </section>

      {(errors.length > 0 || successMessage) && (
        <div className={`captain-live-notice ${errors.length > 0 ? 'error' : 'success'}`}>
          {errors[0] ?? successMessage}
        </div>
      )}

      <nav className="captain-live-mobile-tabs" aria-label="Matchup views">
        <MobileTab icon={CircleDot} label="Live" count={activeMatchups.length} active={mobileView === 'live'} onClick={() => setMobileView('live')} />
        <MobileTab icon={Clock3} label="Waiting" count={waitingMatchups.length} active={mobileView === 'waiting'} onClick={() => setMobileView('waiting')} />
        <MobileTab icon={CheckCircle2} label="Complete" count={completedMatchups.length} active={mobileView === 'complete'} onClick={() => setMobileView('complete')} />
      </nav>

      <div className="captain-live-desktop-grid">
        <main className="captain-live-workspace">
          <section className="captain-live-progress">
            <div className="captain-live-progress-label">
              <BarChart3 size={17} /> Fixture Progress
            </div>
            <ProgressItem status="live" label={`${activeMatchups.length} live`} />
            <ProgressItem status="waiting" label={`${waitingMatchups.length} waiting`} />
            <ProgressItem status="complete" label={`${completedMatchups.length} complete`} />
            <strong>{completedMatchups.length}/{matchups.length}</strong>
          </section>

          <section className={`captain-live-section captain-live-mobile-view ${mobileView === 'live' ? 'selected' : ''}`}>
            <SectionTitle icon={Target} title="Active Boards" accent="orange" action={`${activeMatchups.length} live`} />
            {activeMatchups.length > 0 ? (
              <div className="captain-live-board-grid">
                {activeMatchups.map((matchup) => (
                  <ActiveBoardCard
                    key={matchup.matchupId}
                    matchup={matchup}
                    homeTeamName={homeTeamName}
                    awayTeamName={awayTeamName}
                    canOpen={canControlFixtureFlow}
                    onOpen={() => openMatchupScorer(matchup.matchupId)}
                  />
                ))}
              </div>
            ) : (
              <LiveEmpty icon={Target} text={isFixtureCompleted ? 'All boards are complete.' : 'No boards are currently live.'} />
            )}
          </section>

          <section className={`captain-live-section captain-live-mobile-view ${mobileView === 'waiting' ? 'selected' : ''}`}>
            <SectionTitle icon={Clock3} title="Waiting Matchups" accent="cyan" action={`${waitingMatchups.length} waiting`} />
            <div className="captain-live-row-list">
              {waitingMatchups.map((matchup) => (
                <MatchupRow
                  key={matchup.matchupId}
                  matchup={matchup}
                  status="waiting"
                  actionLabel={canControlFixtureFlow ? 'Start Match' : null}
                  onAction={() => handleStartMatchup(matchup.matchupId)}
                />
              ))}
              {waitingMatchups.length === 0 && <LiveEmpty icon={Clock3} text="No waiting matchups." />}
            </div>
          </section>

          <section className={`captain-live-section captain-live-mobile-view ${mobileView === 'complete' ? 'selected' : ''}`}>
            <SectionTitle icon={CheckCircle2} title="Completed Matchups" accent="green" action={`${completedMatchups.length} complete`} />
            <div className="captain-live-row-list">
              {completedMatchups.map((matchup) => (
                <MatchupRow
                  key={matchup.matchupId}
                  matchup={matchup}
                  status="complete"
                  actionLabel="Edit"
                  onAction={() => openMatchupScorer(matchup.matchupId)}
                />
              ))}
              {completedMatchups.length === 0 && <LiveEmpty icon={CheckCircle2} text="No completed matchups yet." />}
            </div>
          </section>
        </main>

        <aside className="captain-live-controls">
          <ControlPanel icon={ShieldCheck} title="Captain Status">
            <StatusLine label="Role" value={isHomeCaptain ? 'Home Captain' : 'Away Captain'} accent="orange" />
            <StatusLine label="Team" value={fixture.team.teamName} />
            <StatusLine label="Status" value={isFixtureCompleted ? 'Complete' : 'Active'} accent="green" />
            <StatusCheck label="My lineup" />
            <StatusCheck label="Opponent lineup" />
          </ControlPanel>

          <ControlPanel icon={UsersRound} title="Lineup Actions">
            <button type="button" className="captain-live-control-action" onClick={() => setShowSubstitutions((value) => !value)}>
              <ArrowLeftRight size={21} />
              <span><strong>Substitutions</strong><small>Make player changes</small></span>
              <ChevronRight size={18} />
            </button>
            {showSubstitutions && (
              <SubstitutionForm
                outgoingPlayers={eligibleOutgoingPlayers}
                benchPlayers={myBenchPlayers}
                outgoingPlayerId={outgoingPlayerId}
                incomingPlayerId={incomingPlayerId}
                setOutgoingPlayerId={setOutgoingPlayerId}
                setIncomingPlayerId={setIncomingPlayerId}
                onApply={handleApplySubstitution}
              />
            )}
          </ControlPanel>

          <ControlPanel icon={LayoutGrid} title="Match Controls">
            <Link to={`/captain/fixture/${fixtureId}/setup`} className="captain-live-control-action">
              <LayoutGrid size={21} />
              <span><strong>Fixture Setup</strong><small>Review lineups and format</small></span>
              <ChevronRight size={18} />
            </Link>
            <button type="button" className="captain-live-control-action" onClick={loadLiveFixture}>
              <RefreshCw size={21} />
              <span><strong>Refresh Data</strong><small>Sync latest scores</small></span>
              <ChevronRight size={18} />
            </button>
          </ControlPanel>
        </aside>
      </div>

      {showSubstitutions && (
        <section className="captain-live-sub-mobile-sheet">
          <div className="captain-live-sheet-heading">
            <div><ArrowLeftRight size={21} /><strong>Substitutions</strong></div>
            <button type="button" onClick={() => setShowSubstitutions(false)}>Close</button>
          </div>
          <SubstitutionForm
            outgoingPlayers={eligibleOutgoingPlayers}
            benchPlayers={myBenchPlayers}
            outgoingPlayerId={outgoingPlayerId}
            incomingPlayerId={incomingPlayerId}
            setOutgoingPlayerId={setOutgoingPlayerId}
            setIncomingPlayerId={setIncomingPlayerId}
            onApply={handleApplySubstitution}
          />
        </section>
      )}

      {isFixtureCompleted && (
        <section className="captain-live-wrapup">
          <SectionTitle icon={Flag} title="Post-Match Wrap-Up" accent="orange" action={myPostMatch.confirmedAt ? 'Submitted' : 'Action required'} />
          <div className="captain-live-wrapup-status">
            <StatusCheck label={myPostMatch.confirmedAt ? 'Your wrap-up submitted' : 'Your wrap-up pending'} checked={Boolean(myPostMatch.confirmedAt)} />
            <StatusCheck label={opponentPostMatch.confirmedAt ? 'Opponent submitted' : 'Waiting for opponent'} checked={Boolean(opponentPostMatch.confirmedAt)} />
          </div>
          {!myPostMatch.confirmedAt && (
            <div className="captain-live-wrapup-form">
              <label>
                <span>Opponent player of the match</span>
                <select className="form-input" value={selectedOpponentPotmPlayerId} onChange={(event) => setSelectedOpponentPotmPlayerId(event.target.value)}>
                  <option value="">Select opponent POTM</option>
                  {wrapUpOpponentSquad.map((player) => <option key={player.playerId} value={player.playerId}>{player.displayName}</option>)}
                </select>
              </label>
              <label>
                <span>Captain notes</span>
                <textarea className="form-input" rows={3} value={captainNotes} onChange={(event) => setCaptainNotes(event.target.value)} />
              </label>
              <label className="captain-live-confirm">
                <input type="checkbox" checked={confirmScoresheet} onChange={(event) => setConfirmScoresheet(event.target.checked)} />
                <span>I confirm the digital scoresheet is correct.</span>
              </label>
              <button type="button" className="captain-live-primary" disabled={!selectedOpponentPotmPlayerId || !confirmScoresheet} onClick={handleSubmitPostMatchWrapUp}>
                <Check size={20} /> Submit Wrap-Up <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>
      )}

      {canControlFixtureFlow && waitingMatchups.length > 0 && mobileView !== 'live' && (
        <button type="button" className="captain-live-mobile-sticky" onClick={() => handleStartMatchup(waitingMatchups[0].matchupId)}>
          <Flag size={22} /> Start Next Match <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}

function TeamScore({ side, name, score }) {
  return (
    <div className={`captain-live-team ${side}`}>
      <div className="captain-live-team-mark">
        <img src={getTeamLogo(name)} alt="" />
      </div>
      <div className="captain-live-team-name">
        <strong>{name}</strong>
        <span>{side}</span>
      </div>
      <b>{score}</b>
    </div>
  );
}

function MobileTab({ icon, label, count, active, onClick }) {
  return (
    <button type="button" className={active ? 'active' : ''} onClick={onClick}>
      {createElement(icon, { size: 16 })}<span>{label}</span><b>{count}</b>
    </button>
  );
}

function ProgressItem({ status, label }) {
  const Icon = status === 'live' ? CircleDot : status === 'waiting' ? Clock3 : CheckCircle2;
  return <div className={`captain-live-progress-item ${status}`}><Icon size={17} /><span>{label}</span></div>;
}

function SectionTitle({ icon, title, accent, action }) {
  return (
    <div className={`captain-live-section-title ${accent}`}>
      <div>{createElement(icon, { size: 21 })}<h2>{title}</h2></div>
      <span>{action}</span>
    </div>
  );
}

function ActiveBoardCard({ matchup, homeTeamName, awayTeamName, canOpen, onOpen }) {
  const homeName = getPlayerNames(matchup.homePlayers, 'Home Player');
  const awayName = getPlayerNames(matchup.awayPlayers, 'Away Player');
  return (
    <article className="captain-live-board">
      <div className="captain-live-board-head">
        <span>Board {matchup.boardNumber ?? '-'}</span>
        <strong><i /> Live</strong>
      </div>
      <div className="captain-live-board-players">
        <div><strong>{homeName}</strong><span>{homeTeamName}</span></div>
        <em>VS</em>
        <div><strong>{awayName}</strong><span>{awayTeamName}</span></div>
      </div>
      <div className="captain-live-board-scores">
        <div><b>{matchup.liveState?.homeScoreLeft ?? '-'}</b><span>Remaining</span></div>
        <div><b>{matchup.liveState?.awayScoreLeft ?? '-'}</b><span>Remaining</span></div>
      </div>
      <div className="captain-live-board-format">{matchup.formatLabel}</div>
      {canOpen ? (
        <button type="button" className="captain-live-primary" onClick={onOpen}>
          <Target size={21} /> Open Scorer <ChevronRight size={21} />
        </button>
      ) : (
        <div className="captain-live-board-readonly">Home captain controls scorer access</div>
      )}
    </article>
  );
}

function MatchupRow({ matchup, status, actionLabel, onAction }) {
  return (
    <article className={`captain-live-row ${status}`}>
      <div className="captain-live-row-icon">{status === 'complete' ? <CheckCircle2 size={20} /> : <Clock3 size={20} />}</div>
      <div className="captain-live-row-copy">
        <strong>{matchup.label}</strong>
        <span>Block {matchup.blockNumber} - {matchup.formatLabel}</span>
      </div>
      {status === 'complete' && <b>{matchup.result?.winnerTeamName ?? 'Recorded'}</b>}
      {actionLabel && <button type="button" onClick={onAction}>{actionLabel}<ChevronRight size={17} /></button>}
    </article>
  );
}

function ControlPanel({ icon, title, children }) {
  return (
    <section className="captain-live-control-panel">
      <div className="captain-live-control-heading">{createElement(icon, { size: 20 })}<h3>{title}</h3></div>
      {children}
    </section>
  );
}

function StatusLine({ label, value, accent = '' }) {
  return <div className="captain-live-status-line"><span>{label}</span><strong className={accent}>{value}</strong></div>;
}

function StatusCheck({ label, checked = true }) {
  return <div className={`captain-live-status-check ${checked ? '' : 'pending'}`}><CheckCircle2 size={17} /><span>{label}</span></div>;
}

function SubstitutionForm({
  outgoingPlayers,
  benchPlayers,
  outgoingPlayerId,
  incomingPlayerId,
  setOutgoingPlayerId,
  setIncomingPlayerId,
  onApply
}) {
  return (
    <div className="captain-live-sub-form">
      <select value={outgoingPlayerId} onChange={(event) => setOutgoingPlayerId(event.target.value)}>
        <option value="">Player going off</option>
        {outgoingPlayers.map((player) => <option key={player.playerId} value={player.playerId}>{player.displayName}</option>)}
      </select>
      <select value={incomingPlayerId} onChange={(event) => setIncomingPlayerId(event.target.value)}>
        <option value="">Player coming on</option>
        {benchPlayers.map((player) => <option key={player.playerId} value={player.playerId}>{player.displayName}</option>)}
      </select>
      <button type="button" disabled={!outgoingPlayerId || !incomingPlayerId} onClick={onApply}>
        <ArrowLeftRight size={18} /> Apply Substitution
      </button>
    </div>
  );
}

function LiveEmpty({ icon, text }) {
  return <div className="captain-live-empty">{createElement(icon, { size: 25 })}<span>{text}</span></div>;
}

function getPlayerNames(players = [], fallback) {
  return players.map((player) => player.displayName).filter(Boolean).join(' & ') || fallback;
}

function parseScore(scoreText = '0 - 0') {
  const scores = String(scoreText).match(/\d+/g) ?? [];
  return [scores[0] ?? '0', scores[1] ?? '0'];
}

function formatStatus(status) {
  const labels = {
    ready_for_lineups: 'Ready For Lineups',
    waiting_for_opponent: 'Waiting For Opponent',
    ready_to_play: 'Ready To Play',
    active: 'Active',
    completed: 'Completed'
  };
  return labels[status] ?? status;
}
