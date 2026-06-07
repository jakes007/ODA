import { createElement, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, CheckCircle2, Clock3, Edit3, Flag, Radio,
  RotateCcw, Save, Target, Trophy, X
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getTeamLogo } from '../utils/teamLogos';
import {
  getCaptainMatchupScoringData,
  setCaptainMatchupScoringMode,
  setCaptainMatchupStartingSide,
  submitCaptainMatchupResultEntry,
  submitCaptainMatchupTurn,
  updateCaptainMatchupTurn
} from '../services/captainFixtureService';

export default function CaptainMatchupScoringPage() {
  const { fixtureId, matchupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [turnScore, setTurnScore] = useState('');
  const [editingTurnIndex, setEditingTurnIndex] = useState(null);
  const [showFinishDarts, setShowFinishDarts] = useState(false);
  const [finishDartOptions, setFinishDartOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [scoringMode, setScoringMode] = useState('turn_by_turn');
  const [result, setResult] = useState({
    winnerSide: '', homeScoreLeft: '', awayScoreLeft: '', homeDartsUsed: '',
    awayDartsUsed: '', homeTons: '', awayTons: '', homeOneEighties: '',
    awayOneEighties: '', homeHighCheckout: '', awayHighCheckout: '', notes: ''
  });

  useEffect(() => {
    loadScoringData();
  }, [fixtureId, matchupId, currentUser?.playerId]);

  async function loadScoringData() {
    if (!fixtureId || !matchupId || !currentUser?.playerId) {
      setLoading(false);
      return;
    }
    setData(await getCaptainMatchupScoringData({
      fixtureId,
      matchupId,
      captainPlayerId: currentUser.playerId
    }));
    setLoading(false);
  }

  if (loading) return <EmptyState message="Loading matchup scoring data..." />;
  if (!data) return <EmptyState message="Matchup scoring data not found." />;

  const { fixture, matchup } = data;
  if ((matchup.status !== 'in_progress' && matchup.status !== 'completed') || !matchup.liveState) {
    return (
      <div className="captain-scorer-unavailable">
        <Target size={34} />
        <h2>Board Not Started</h2>
        <p>This matchup must be started from the live match centre before scoring begins.</p>
        <Link to={`/captain/fixture/${fixtureId}/live`}><ArrowLeft size={18} /> Match Centre</Link>
      </div>
    );
  }

  const turns = matchup.liveState.turns || [];
  const hasExistingTurns = turns.length > 0;
  const lockedScoringMode = matchup.scoringMode === 'result_entry'
    ? 'result_entry'
    : hasExistingTurns ? 'turn_by_turn' : scoringMode;
  const homePlayerName = buildSideDisplayLabel(matchup.homePlayers, 'Home Player');
  const awayPlayerName = buildSideDisplayLabel(matchup.awayPlayers, 'Away Player');
  const currentTurnPlayerName = matchup.liveState.currentTurnSide === 'home'
    ? getCurrentPlayerName(matchup.homePlayers, matchup.liveState.currentPlayerIndex, homePlayerName)
    : getCurrentPlayerName(matchup.awayPlayers, matchup.liveState.currentPlayerIndex, awayPlayerName);

  async function runAction(action) {
    const actionResult = await action();
    if (!actionResult.success) {
      setErrorMessage(actionResult.message);
      setSuccessMessage('');
      return null;
    }
    setErrorMessage('');
    setSuccessMessage(actionResult.message);
    await loadScoringData();
    return actionResult;
  }

  async function handleSetScoringMode(nextMode) {
    const actionResult = await runAction(() => setCaptainMatchupScoringMode({
      fixtureId, captainPlayerId: currentUser.playerId, matchupId, scoringMode: nextMode
    }));
    if (actionResult) setScoringMode(nextMode);
  }

  async function handleSetStartingSide(startingSide) {
    await runAction(() => setCaptainMatchupStartingSide({
      fixtureId, captainPlayerId: currentUser.playerId, matchupId, startingSide
    }));
  }

  function handleEditTurn(turn, index) {
    setTurnScore(String(turn.score));
    setEditingTurnIndex(index);
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    setErrorMessage('');
    setSuccessMessage(`Editing turn ${index + 1}`);
  }

  function cancelTurnEdit(clearMessages = true) {
    setEditingTurnIndex(null);
    setTurnScore('');
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    if (clearMessages) {
      setErrorMessage('');
      setSuccessMessage('');
    }
  }

  async function handleSubmitTurn(event) {
    event.preventDefault();
    const actionResult = editingTurnIndex === null
      ? await submitCaptainMatchupTurn({
        fixtureId, captainPlayerId: currentUser.playerId, matchupId, score: turnScore
      })
      : await updateCaptainMatchupTurn({
        fixtureId, captainPlayerId: currentUser.playerId, matchupId,
        turnIndex: editingTurnIndex, score: turnScore
      });

    if (!actionResult.success) {
      setErrorMessage(actionResult.message);
      setSuccessMessage('');
      setShowFinishDarts(false);
      return;
    }
    if (editingTurnIndex === null && actionResult.requiresFinishDarts) {
      setErrorMessage('');
      setSuccessMessage(actionResult.message);
      setShowFinishDarts(true);
      setFinishDartOptions(actionResult.possibleDartsUsed || [3]);
      return;
    }
    setSuccessMessage(actionResult.message);
    cancelTurnEdit(false);
    await loadScoringData();
  }

  async function handleFinishWithDarts(dartsUsed) {
    const actionResult = await submitCaptainMatchupTurn({
      fixtureId, captainPlayerId: currentUser.playerId, matchupId, score: turnScore, dartsUsed
    });
    if (!actionResult.success) {
      setErrorMessage(actionResult.message);
      return;
    }
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  async function handleSubmitResultEntry() {
    const actionResult = await submitCaptainMatchupResultEntry({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      matchupId,
      winnerSide: result.winnerSide,
      homeScoreLeft: result.homeScoreLeft,
      awayScoreLeft: result.awayScoreLeft,
      homeDartsUsed: result.homeDartsUsed,
      awayDartsUsed: result.awayDartsUsed,
      homeTons: result.homeTons,
      awayTons: result.awayTons,
      homeOneEighties: result.homeOneEighties,
      awayOneEighties: result.awayOneEighties,
      homeHighCheckout: result.homeHighCheckout,
      awayHighCheckout: result.awayHighCheckout,
      notes: result.notes
    });
    if (!actionResult.success) {
      setErrorMessage(actionResult.message);
      setSuccessMessage('');
      return;
    }
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  return (
    <div className="captain-scorer-page">
      <header className="captain-scorer-topbar">
        <Link to={`/captain/fixture/${fixtureId}/live`}><ArrowLeft size={20} /> Match Centre</Link>
        <div className="captain-scorer-title">
          <span><Radio size={17} /> Board {matchup.boardNumber ?? '-'}</span>
          <h1>Match Scorer</h1>
        </div>
        <div className={`captain-scorer-status ${matchup.status}`}>
          {matchup.status === 'completed' ? <CheckCircle2 size={17} /> : <i />}
          {matchup.status === 'completed' ? 'Complete' : 'Live'}
        </div>
      </header>

      <section className="captain-scorer-scoreboard">
        <ScorerSide side="home" teamName={fixture.homeTeamName || 'Home'} playerName={homePlayerName} score={matchup.liveState.homeScoreLeft} active={matchup.status !== 'completed' && matchup.liveState.currentTurnSide === 'home'} />
        <div className="captain-scorer-centre"><span>{matchup.formatLabel}</span><strong>VS</strong><small>Block {matchup.blockNumber} · Match {matchup.blockOrder}</small></div>
        <ScorerSide side="away" teamName={fixture.awayTeamName || 'Away'} playerName={awayPlayerName} score={matchup.liveState.awayScoreLeft} active={matchup.status !== 'completed' && matchup.liveState.currentTurnSide === 'away'} />
      </section>

      <section className="captain-scorer-toolbar">
        <div className="captain-scorer-mode">
          <button type="button" className={lockedScoringMode === 'turn_by_turn' ? 'active' : ''} disabled={hasExistingTurns || matchup.status === 'completed'} onClick={() => handleSetScoringMode('turn_by_turn')}><Target size={18} /> Turn by Turn</button>
          <button type="button" className={lockedScoringMode === 'result_entry' ? 'active' : ''} disabled={hasExistingTurns || matchup.status === 'completed'} onClick={() => handleSetScoringMode('result_entry')}><Flag size={18} /> Result Entry</button>
        </div>
        <StarterControl matchup={matchup} homeName={homePlayerName} awayName={awayPlayerName} onChange={handleSetStartingSide} />
      </section>

      {errorMessage ? <div className="captain-scorer-message error">{errorMessage}</div> : null}
      {successMessage ? <div className="captain-scorer-message success">{successMessage}</div> : null}

      {lockedScoringMode === 'turn_by_turn' ? (
        <div className="captain-scorer-workspace">
          <ScoreEntry
            matchup={matchup}
            currentName={currentTurnPlayerName}
            turnScore={turnScore}
            setTurnScore={setTurnScore}
            editingTurnIndex={editingTurnIndex}
            onSubmit={handleSubmitTurn}
            onCancel={cancelTurnEdit}
            showFinishDarts={showFinishDarts}
            finishDartOptions={finishDartOptions}
            onFinish={handleFinishWithDarts}
          />
          <TurnHistory turns={turns} matchup={matchup} homeName={homePlayerName} awayName={awayPlayerName} editingTurnIndex={editingTurnIndex} onEdit={handleEditTurn} />
        </div>
      ) : (
        <ResultEntryPanel matchup={matchup} result={result} setResult={setResult} onSubmit={handleSubmitResultEntry} />
      )}
    </div>
  );
}

function ScorerSide({ side, teamName, playerName, score, active }) {
  return (
    <article className={`captain-scorer-side ${side} ${active ? 'active' : ''}`}>
      <img src={getTeamLogo(teamName)} alt="" />
      <div><span>{teamName}</span><strong>{playerName}</strong></div>
      <b>{score}</b>
      <small>{active ? <><Radio size={15} /> To throw</> : 'Remaining'}</small>
    </article>
  );
}

function StarterControl({ matchup, homeName, awayName, onChange }) {
  const unlocked = matchup.liveState.turns.length === 0 && matchup.status !== 'completed';
  const side = matchup.liveState.startingSide ?? 'home';
  return (
    <div className="captain-scorer-starter">
      <span>Throws first</span>
      {unlocked ? <div>
        <button type="button" className={`home ${side === 'home' ? 'active' : ''}`} onClick={() => onChange('home')}>{homeName}</button>
        <button type="button" className={`away ${side === 'away' ? 'active' : ''}`} onClick={() => onChange('away')}>{awayName}</button>
      </div> : <strong>{side === 'home' ? homeName : awayName}</strong>}
    </div>
  );
}

function ScoreEntry({ matchup, currentName, turnScore, setTurnScore, editingTurnIndex, onSubmit, onCancel, showFinishDarts, finishDartOptions, onFinish }) {
  const locked = matchup.status === 'completed' && editingTurnIndex === null;
  return (
    <section className="captain-scorer-entry">
      <SectionHeading icon={Target} title={editingTurnIndex === null ? 'Current Throw' : `Editing Turn ${editingTurnIndex + 1}`} meta={locked ? 'Select a turn to edit' : currentName} />
      <form onSubmit={onSubmit}>
        <label htmlFor="turnScore">Score thrown</label>
        <div className="captain-scorer-score-input">
          <input id="turnScore" type="number" min="0" max="180" inputMode="numeric" value={turnScore} onChange={(event) => setTurnScore(event.target.value)} placeholder="0" disabled={locked} />
          {turnScore ? <button type="button" onClick={() => setTurnScore('')} aria-label="Clear score"><X size={22} /></button> : null}
        </div>
        <div className="captain-scorer-quick-scores">
          {[26, 41, 45, 60, 81, 85, 100, 121, 140, 180].map((value) => <button key={value} type="button" className={value === 180 ? 'maximum' : value >= 100 ? 'ton' : ''} onClick={() => setTurnScore(String(value))} disabled={locked}>{value}</button>)}
        </div>
        <div className="captain-scorer-entry-actions">
          {editingTurnIndex !== null ? <button type="button" className="cancel" onClick={onCancel}><RotateCcw size={19} /> Cancel Edit</button> : null}
          <button type="submit" className="submit" disabled={!turnScore || locked}>{editingTurnIndex === null ? <><Check size={21} /> Submit Turn</> : <><Save size={20} /> Save Correction</>}</button>
        </div>
        {showFinishDarts ? <div className="captain-scorer-finish"><Trophy size={25} /><strong>Checkout confirmed. Darts used?</strong><div>{finishDartOptions.map((darts) => <button key={darts} type="button" onClick={() => onFinish(darts)}>{darts}</button>)}</div></div> : null}
      </form>
    </section>
  );
}

function TurnHistory({ turns, matchup, homeName, awayName, editingTurnIndex, onEdit }) {
  return (
    <section className="captain-scorer-history">
      <SectionHeading icon={Clock3} title="Throw History" meta={`${turns.length} turns`} />
      <div className="captain-scorer-history-list">
        {!turns.length ? <div className="captain-scorer-empty">Waiting for the first throw.</div> : turns.map((turn, index) => (
          <article key={`${turn.createdAt}-${index}`} className={`${turn.side} ${editingTurnIndex === index ? 'editing' : ''}`}>
            <div className="captain-scorer-turn-number">{index + 1}</div>
            <div><strong>{getTurnPlayerLabel(turn, matchup, homeName, awayName)}</strong><span>{turn.bust ? 'Bust · score unchanged' : `${turn.resultingScore} remaining`}</span></div>
            <b>{turn.score}</b>
            <button type="button" onClick={() => onEdit(turn, index)} aria-label={`Edit turn ${index + 1}`}><Edit3 size={17} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultEntryPanel({ matchup, result, setResult, onSubmit }) {
  const update = (key, value) => setResult((current) => ({ ...current, [key]: value }));
  const rows = [
    ['Score Left', 'homeScoreLeft', 'awayScoreLeft'], ['Darts Used', 'homeDartsUsed', 'awayDartsUsed'],
    ['Ton+', 'homeTons', 'awayTons'], ['180s', 'homeOneEighties', 'awayOneEighties'],
    ['High Checkout', 'homeHighCheckout', 'awayHighCheckout']
  ];
  return (
    <section className="captain-result-entry">
      <SectionHeading icon={Flag} title="Final Result Entry" />
      <div className="captain-result-winner">
        <button type="button" className={`home ${result.winnerSide === 'home' ? 'active' : ''}`} onClick={() => update('winnerSide', 'home')}><Trophy size={19} /> {buildSideDisplayLabel(matchup.homePlayers, 'Home')}</button>
        <span>Winner</span>
        <button type="button" className={`away ${result.winnerSide === 'away' ? 'active' : ''}`} onClick={() => update('winnerSide', 'away')}><Trophy size={19} /> {buildSideDisplayLabel(matchup.awayPlayers, 'Away')}</button>
      </div>
      <div className="captain-result-grid">
        <strong>Home</strong><span>Match statistics</span><strong>Away</strong>
        {rows.map(([label, homeKey, awayKey]) => <div className="captain-result-row" key={label}><input type="number" min="0" value={result[homeKey]} onChange={(event) => update(homeKey, event.target.value)} /><label>{label}</label><input type="number" min="0" value={result[awayKey]} onChange={(event) => update(awayKey, event.target.value)} /></div>)}
      </div>
      <textarea rows={3} value={result.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Optional match notes" />
      <button type="button" className="captain-result-submit" onClick={onSubmit} disabled={!result.winnerSide || matchup.status === 'completed'}><Save size={20} /> Save Final Result</button>
    </section>
  );
}

function SectionHeading({ icon: Icon, title, meta }) {
  return <div className="captain-scorer-section-heading"><div>{createElement(Icon, { size: 21 })}<span>{title}</span></div>{meta ? <strong>{meta}</strong> : null}</div>;
}

function buildSideDisplayLabel(players, fallback) {
  return players?.map((player) => player.displayName).filter(Boolean).join(' + ') || fallback;
}

function getCurrentPlayerName(players, index, fallback) {
  return players?.[index ?? 0]?.displayName || fallback;
}

function getTurnPlayerLabel(turn, matchup, fallbackHome, fallbackAway) {
  const players = turn.side === 'home' ? matchup.homePlayers : matchup.awayPlayers;
  return players?.[turn.playerIndex ?? 0]?.displayName || (turn.side === 'home' ? fallbackHome : fallbackAway);
}
