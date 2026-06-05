import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainMatchupScoringData,
  submitCaptainMatchupTurn,
  setCaptainMatchupStartingSide,
  updateCaptainMatchupTurn,
  submitCaptainMatchupResultEntry,
  setCaptainMatchupScoringMode
} from '../services/captainFixtureService';

export default function CaptainMatchupScoringPage() {
  const { fixtureId, matchupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [turnScore, setTurnScore] = useState('');
  const [showFinishDarts, setShowFinishDarts] = useState(false);
  const [finishDartOptions, setFinishDartOptions] = useState([]);
  const [editingTurnIndex, setEditingTurnIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [scoringMode, setScoringMode] = useState('turn_by_turn');

  const [resultWinnerSide, setResultWinnerSide] = useState('');
  const [homeScoreLeft, setHomeScoreLeft] = useState('');
const [awayScoreLeft, setAwayScoreLeft] = useState('');
const [homeDartsUsed, setHomeDartsUsed] = useState('');
const [awayDartsUsed, setAwayDartsUsed] = useState('');
const [homeTons, setHomeTons] = useState('');
const [awayTons, setAwayTons] = useState('');
  const [homeOneEighties, setHomeOneEighties] = useState('');
  const [awayOneEighties, setAwayOneEighties] = useState('');
  const [homeHighCheckout, setHomeHighCheckout] = useState('');
  const [awayHighCheckout, setAwayHighCheckout] = useState('');
  const [resultNotes, setResultNotes] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScoringData();
  }, [fixtureId, matchupId, currentUser?.playerId]);

  async function loadScoringData() {
    if (!fixtureId || !matchupId || !currentUser?.playerId) {
      setLoading(false);
      return;
    }

    const scoringData = await getCaptainMatchupScoringData({
      fixtureId,
      matchupId,
      captainPlayerId: currentUser.playerId
    });

    setData(scoringData);
    setLoading(false);
  }

  if (loading) {
    return <EmptyState message="Loading matchup scoring data..." />;
  }

  if (!data) {
    return <EmptyState message="Matchup scoring data not found." />;
  }

  const { fixture, matchup } = data;

  if ((matchup.status !== 'in_progress' && matchup.status !== 'completed') || !matchup.liveState) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Matchup Scoring"
          subtitle={`${matchup.label} • Not yet started`}
        />

        <section className="panel">
          <div className="muted-text">
            This matchup must be started from the live hub before scoring can begin.
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Link to={`/captain/fixture/${fixtureId}/live`} className="text-link">
              Back to Live Hub
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const hasExistingTurns = (matchup.liveState?.turns?.length || 0) > 0;

  const lockedScoringMode =
    matchup.scoringMode === 'result_entry'
      ? 'result_entry'
      : hasExistingTurns
        ? 'turn_by_turn'
        : scoringMode;

  const homePlayerNames = matchup.homePlayers?.map((player) => player.displayName) ?? [];
  const awayPlayerNames = matchup.awayPlayers?.map((player) => player.displayName) ?? [];

  const homePlayerName = homePlayerNames[0] ?? 'Home Player';
  const awayPlayerName = awayPlayerNames[0] ?? 'Away Player';

  const currentTurnPlayerName =
    matchup.liveState?.currentTurnSide === 'home'
      ? homePlayerNames[matchup.liveState?.currentPlayerIndex ?? 0] ?? homePlayerName
      : awayPlayerNames[matchup.liveState?.currentPlayerIndex ?? 0] ?? awayPlayerName;

async function handleSetScoringMode(nextMode) {
  const result = await setCaptainMatchupScoringMode({
    fixtureId,
    captainPlayerId: currentUser.playerId,
    matchupId,
    scoringMode: nextMode
  });

  if (!result.success) {
    setErrorMessage(result.message);
    setSuccessMessage('');
    return;
  }

  setScoringMode(nextMode);
  setErrorMessage('');
  setSuccessMessage(result.message);

  await loadScoringData();
}

  async function handleSetStartingSide(startingSide) {
    const result = await setCaptainMatchupStartingSide({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      matchupId,
      startingSide
    });

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    await loadScoringData();
  }

  function handleEditTurn(turn, actualIndex) {
    setTurnScore(String(turn.score));
    setEditingTurnIndex(actualIndex);
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    setErrorMessage('');
    setSuccessMessage(
      matchup.status === 'completed'
        ? `Editing turn ${actualIndex + 1} from a completed matchup`
        : `Editing turn ${actualIndex + 1}`
    );
  }

  async function handleSubmitTurn(event) {
    event.preventDefault();

    const result =
      editingTurnIndex === null
        ? await submitCaptainMatchupTurn({
            fixtureId,
            captainPlayerId: currentUser.playerId,
            matchupId,
            score: turnScore
          })
        : await updateCaptainMatchupTurn({
            fixtureId,
            captainPlayerId: currentUser.playerId,
            matchupId,
            turnIndex: editingTurnIndex,
            score: turnScore
          });

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      setShowFinishDarts(false);
      setFinishDartOptions([]);
      return;
    }

    if (editingTurnIndex === null && result.requiresFinishDarts) {
      setErrorMessage('');
      setSuccessMessage(result.message);
      setShowFinishDarts(true);
      setFinishDartOptions(result.possibleDartsUsed || [3]);
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    setTurnScore('');
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    setEditingTurnIndex(null);

    await loadScoringData();
  }

  async function handleFinishWithDarts(dartsUsed) {
    const result = await submitCaptainMatchupTurn({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      matchupId,
      score: turnScore,
      dartsUsed
    });

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    setTurnScore('');
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    setEditingTurnIndex(null);

    await loadScoringData();
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  async function handleSubmitResultEntry() {
    const result = await submitCaptainMatchupResultEntry({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      matchupId,
      winnerSide: resultWinnerSide,
      homeScoreLeft,
      awayScoreLeft,
      homeDartsUsed,
      awayDartsUsed,
      homeTons,
      awayTons,
      homeOneEighties,
      awayOneEighties,
      homeHighCheckout,
      awayHighCheckout,
      notes: resultNotes
    });

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);

    await loadScoringData();
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Matchup Scoring"
        subtitle={`${buildMatchupDisplayLabel(matchup)} • Block ${matchup.blockNumber} • ${
          matchup.status === 'completed' ? 'Completed' : 'In Progress'
        }`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Live Matchup</h3>
          <Link to={`/captain/fixture/${fixtureId}/live`} className="text-link">
            Back to Live Hub
          </Link>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Fixture</div>
            <div className="muted-text">{fixture.fixtureName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Board</div>
            <div className="muted-text">{matchup.boardNumber ?? '-'}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Format</div>
            <div className="muted-text">{matchup.formatLabel}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Current Throw</div>
            <div className="muted-text">
              {matchup.status === 'completed' ? 'Completed matchup' : currentTurnPlayerName}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Throws First</div>
            <div className="muted-text">
              {(matchup.liveState?.startingSide ?? 'home') === 'home'
                ? homePlayerNames[0] ?? homePlayerName
                : awayPlayerNames[0] ?? awayPlayerName}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Status</div>
            <div className="muted-text">
              {matchup.status === 'completed' ? 'Completed but still editable' : 'In Progress'}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Scoring Mode</h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
  type="button"
  className={lockedScoringMode === 'turn_by_turn' ? 'primary-btn' : 'secondary-btn'}
  disabled={hasExistingTurns || matchup.status === 'completed'}
  onClick={() => handleSetScoringMode('turn_by_turn')}
>
  Turn-by-Turn
</button>

<button
  type="button"
  className={lockedScoringMode === 'result_entry' ? 'primary-btn' : 'secondary-btn'}
  disabled={hasExistingTurns || matchup.status === 'completed'}
  onClick={() => handleSetScoringMode('result_entry')}
>
  Result Entry
</button>
        </div>

        <div className="muted-text" style={{ marginTop: '1rem' }}>
          {hasExistingTurns
            ? 'Scoring mode is locked because turns have already been entered.'
            : matchup.status === 'completed'
              ? 'Scoring mode is locked because this matchup is completed.'
              : 'Choose how this matchup will be scored.'}
        </div>
      </section>

      {lockedScoringMode === 'turn_by_turn' ? (
        <>
          <section className="panel">
            <h3 className="panel-title">Starting Turn Control</h3>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-title">Current Starter</div>
                <div className="muted-text">
                  {(matchup.liveState?.startingSide ?? 'home') === 'home'
                    ? `${homePlayerNames[0] ?? homePlayerName} (Home)`
                    : `${awayPlayerNames[0] ?? awayPlayerName} (Away)`}
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-title">Change Rule</div>
                <div className="muted-text">
                  Starting side can only be changed before the first turn is entered.
                </div>
              </div>
            </div>

            {matchup.liveState?.turns?.length === 0 && matchup.status !== 'completed' ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleSetStartingSide('home')}
                >
                  Home Throws First
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleSetStartingSide('away')}
                >
                  Away Throws First
                </button>
              </div>
            ) : (
              <div className="muted-text" style={{ marginTop: '1rem' }}>
                {matchup.status === 'completed'
                  ? 'Starter is locked because the matchup has already been played.'
                  : 'Starter is locked because scoring has already begun.'}
              </div>
            )}
          </section>

          <section className="panel">
            <h3 className="panel-title">Current Scores</h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                  {buildSideDisplayLabel(matchup.homePlayers, 'Home Player')}
                </div>
                <div className="muted-text">Score Left</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                  {matchup.liveState.homeScoreLeft}
                </div>
              </div>

              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                  {buildSideDisplayLabel(matchup.awayPlayers, 'Away Player')}
                </div>
                <div className="muted-text">Score Left</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                  {matchup.liveState.awayScoreLeft}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3 className="panel-title">
              {matchup.status === 'completed' ? 'Edit Match History' : 'Enter Turn Score'}
            </h3>

            {matchup.status === 'completed' && editingTurnIndex === null ? (
              <div className="muted-text" style={{ marginBottom: '1rem' }}>
                This matchup is completed, but you may still edit any previous turn. If the correction
                changes the finish, the matchup will automatically reopen.
              </div>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmitTurn}>
              <div className="form-row">
                <label className="form-label" htmlFor="turnScore">
                  Turn Score
                </label>
                <input
                  id="turnScore"
                  className="form-input"
                  type="number"
                  min="0"
                  max="180"
                  placeholder={
                    matchup.status === 'completed' && editingTurnIndex === null
                      ? 'Choose a turn below to edit'
                      : 'Enter a score from 0 to 180'
                  }
                  value={turnScore}
                  onChange={(event) => setTurnScore(event.target.value)}
                  disabled={matchup.status === 'completed' && editingTurnIndex === null}
                />
              </div>

              {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
              {successMessage ? <div className="form-success">{successMessage}</div> : null}

              <button
                type="submit"
                className="primary-btn auth-submit-btn"
                disabled={matchup.status === 'completed' && editingTurnIndex === null}
              >
                {editingTurnIndex === null ? 'Submit Turn' : 'Save Edited Turn'}
              </button>

              {showFinishDarts ? (
                <div style={{ marginTop: '1rem' }}>
                  <div className="muted-text" style={{ marginBottom: '0.5rem' }}>
                    This score finishes the leg. Select valid darts used:
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {finishDartOptions.map((dartsUsed) => (
                      <button
                        key={dartsUsed}
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleFinishWithDarts(dartsUsed)}
                      >
                        {dartsUsed} Dart{dartsUsed > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </form>
          </section>

          <section className="panel">
            <h3 className="panel-title">Turn History</h3>

            {!matchup.liveState.turns.length ? (
              <div className="muted-text">No turns have been recorded yet.</div>
            ) : (
              <div className="feature-list">
                {matchup.liveState.turns.map((turn, index) => (
                  <div key={`${turn.createdAt}-${index}`} className="feature-item">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <div className="feature-title">
                          Turn {index + 1} •{' '}
                          {getTurnPlayerLabel(turn, matchup, homePlayerName, awayPlayerName)}
                        </div>
                        <div className="muted-text">
                          Scored {turn.score}
                          {turn.bust ? ' • Bust' : ''}
                          {turn.dartsUsed ? ` • ${turn.dartsUsed} dart finish/use` : ''}
                          {' • '}
                          Left {turn.resultingScore}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleEditTurn(turn, index)}
                      >
                        Edit Turn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      {lockedScoringMode === 'result_entry' ? (
        <section className="panel">
          <h3 className="panel-title">Result Entry Mode</h3>

          <div className="muted-text" style={{ marginBottom: '1rem' }}>
            Use this if the leg was scored manually and you only need to capture the final result and stats.
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <label className="form-label">Winner</label>
              <select
                className="form-input"
                value={resultWinnerSide}
                onChange={(event) => setResultWinnerSide(event.target.value)}
              >
                <option value="">Select winner</option>
                <option value="home">{buildSideDisplayLabel(matchup.homePlayers, 'Home')}</option>
                <option value="away">{buildSideDisplayLabel(matchup.awayPlayers, 'Away')}</option>
              </select>
            </div>

            <div className="feature-item">
  <label className="form-label">Home Score Left</label>
  <input
    className="form-input"
    type="number"
    min="0"
    max="501"
    value={homeScoreLeft}
    onChange={(event) => setHomeScoreLeft(event.target.value)}
    placeholder="Winner must be 0"
  />
</div>

<div className="feature-item">
  <label className="form-label">Away Score Left</label>
  <input
    className="form-input"
    type="number"
    min="0"
    max="501"
    value={awayScoreLeft}
    onChange={(event) => setAwayScoreLeft(event.target.value)}
    placeholder="Loser score remaining"
  />
</div>

            <div className="feature-item">
              <label className="form-label">Home Darts Used</label>
              <input
                className="form-input"
                type="number"
                value={homeDartsUsed}
                onChange={(event) => setHomeDartsUsed(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Away Darts Used</label>
              <input
                className="form-input"
                type="number"
                value={awayDartsUsed}
                onChange={(event) => setAwayDartsUsed(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Home Tons</label>
              <input
                className="form-input"
                type="number"
                value={homeTons}
                onChange={(event) => setHomeTons(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Away Tons</label>
              <input
                className="form-input"
                type="number"
                value={awayTons}
                onChange={(event) => setAwayTons(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Home 180s</label>
              <input
                className="form-input"
                type="number"
                value={homeOneEighties}
                onChange={(event) => setHomeOneEighties(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Away 180s</label>
              <input
                className="form-input"
                type="number"
                value={awayOneEighties}
                onChange={(event) => setAwayOneEighties(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Home High Checkout</label>
              <input
                className="form-input"
                type="number"
                value={homeHighCheckout}
                onChange={(event) => setHomeHighCheckout(event.target.value)}
              />
            </div>

            <div className="feature-item">
              <label className="form-label">Away High Checkout</label>
              <input
                className="form-input"
                type="number"
                value={awayHighCheckout}
                onChange={(event) => setAwayHighCheckout(event.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              rows={3}
              value={resultNotes}
              onChange={(event) => setResultNotes(event.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {errorMessage ? (
            <div className="form-error" style={{ marginTop: '1rem' }}>
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="form-success" style={{ marginTop: '1rem' }}>
              {successMessage}
            </div>
          ) : null}

          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleSubmitResultEntry}
              disabled={!resultWinnerSide || matchup.status === 'completed'}
            >
              Save Result Entry
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <h3 className="panel-title">Scoring Rules in this milestone</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Supported Match Types</div>
            <div className="muted-text">
              This scorer currently supports 501 singles and result-entry fallback.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Bust Logic</div>
            <div className="muted-text">
              Overscoring or leaving 1 is treated as a bust and the score stays the same.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Finish Entry</div>
            <div className="muted-text">
              When a score reaches zero, only the valid darts-used finish options are shown.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function buildSideDisplayLabel(players, fallbackLabel) {
  if (!players || players.length === 0) {
    return fallbackLabel;
  }

  return players.map((player) => player.displayName).join(' + ');
}

function buildMatchupDisplayLabel(matchup) {
  return `${buildSideDisplayLabel(matchup.homePlayers, 'Home')} vs ${buildSideDisplayLabel(
    matchup.awayPlayers,
    'Away'
  )}`;
}

function getTurnPlayerLabel(turn, matchup, fallbackHome, fallbackAway) {
  const sidePlayers = turn.side === 'home' ? matchup.homePlayers : matchup.awayPlayers;
  const fallback = turn.side === 'home' ? fallbackHome : fallbackAway;

  if (!sidePlayers || sidePlayers.length === 0) {
    return fallback;
  }

  const index = turn.playerIndex ?? 0;
  return sidePlayers[index]?.displayName ?? fallback;
}
