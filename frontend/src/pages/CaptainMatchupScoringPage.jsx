import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainMatchupScoringData,
  submitCaptainMatchupTurn,
  updateCaptainMatchupTurn,
  setCaptainMatchupStartingSide
} from '../services/captainData';

export default function CaptainMatchupScoringPage() {
  const { fixtureId, matchupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [turnScore, setTurnScore] = useState('');
  const [showFinishDarts, setShowFinishDarts] = useState(false);
  const [finishDartOptions, setFinishDartOptions] = useState([]);
  const [editingTurnIndex, setEditingTurnIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const data = useMemo(() => {
    if (!currentUser?.playerId) return null;
    return getCaptainMatchupScoringData(currentUser.playerId, fixtureId, matchupId);
  }, [currentUser?.playerId, fixtureId, matchupId, refreshKey]);

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

  const homePlayerNames = matchup.homePlayers?.map((player) => player.displayName) ?? [];
  const awayPlayerNames = matchup.awayPlayers?.map((player) => player.displayName) ?? [];

  const homePlayerName = homePlayerNames[0] ?? 'Home Player';
  const awayPlayerName = awayPlayerNames[0] ?? 'Away Player';

  const currentTurnPlayerName =
    matchup.liveState?.currentTurnSide === 'home'
      ? homePlayerNames[matchup.liveState?.currentPlayerIndex ?? 0] ?? homePlayerName
      : awayPlayerNames[matchup.liveState?.currentPlayerIndex ?? 0] ?? awayPlayerName;

  const currentTurnLabel = currentTurnPlayerName;

  function refreshPage() {
    setRefreshKey((value) => value + 1);
  }

  function handleSetStartingSide(startingSide) {
    const result = setCaptainMatchupStartingSide(
      currentUser.playerId,
      fixtureId,
      matchupId,
      startingSide
    );

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    refreshPage();
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

  function handleSubmitTurn(event) {
    event.preventDefault();

    const result =
      editingTurnIndex === null
        ? submitCaptainMatchupTurn(
            currentUser.playerId,
            fixtureId,
            matchupId,
            turnScore
          )
        : updateCaptainMatchupTurn(
            currentUser.playerId,
            fixtureId,
            matchupId,
            editingTurnIndex,
            turnScore
          );

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
      setFinishDartOptions(result.possibleDartsUsed ?? []);
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    setTurnScore('');
    setShowFinishDarts(false);
    setFinishDartOptions([]);
    setEditingTurnIndex(null);

    refreshPage();
  }

  function handleFinishWithDarts(dartsUsed) {
    const result = submitCaptainMatchupTurn(
      currentUser.playerId,
      fixtureId,
      matchupId,
      turnScore,
      { dartsUsed }
    );

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
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Matchup Scoring"
        subtitle={`${buildMatchupDisplayLabel(matchup)} • Block ${matchup.blockNumber} • ${matchup.status === 'completed' ? 'Completed' : 'In Progress'}`}
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
              {matchup.status === 'completed' ? 'Completed matchup' : currentTurnLabel}
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

      <section className="panel">
        <h3 className="panel-title">Scoring Rules in this milestone</h3>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Supported Match Types</div>
            <div className="muted-text">
              This scorer now supports 501 singles and standard 501 doubles rotation.
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