import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainMatchupScoringData,
  submitCaptainMatchupTurn
} from '../services/captainData';

export default function CaptainMatchupScoringPage() {
  const { fixtureId, matchupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [turnScore, setTurnScore] = useState('');
  const [showFinishDarts, setShowFinishDarts] = useState(false);
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

  if (matchup.type !== 'singles') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Matchup Scoring"
          subtitle="This scorer currently supports singles only."
        />

        <section className="panel">
          <div className="muted-text">
            Doubles and team-game scoring will be added in a later milestone.
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

  if (matchup.status === 'completed') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Matchup Scoring"
          subtitle={`${matchup.label} • Completed`}
        />

        <section className="panel">
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-title">Winner</div>
              <div className="muted-text">{matchup.result?.winnerTeamName ?? 'Recorded'}</div>
            </div>

            <div className="feature-item">
              <div className="feature-title">Result</div>
              <div className="muted-text">
                {matchup.result?.winnerSide === 'home' ? 'Home win' : 'Away win'}
              </div>
            </div>
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

  if (matchup.status !== 'in_progress' || !matchup.liveState) {
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

  const homePlayerName = matchup.homePlayers[0]?.displayName ?? 'Home Player';
  const awayPlayerName = matchup.awayPlayers[0]?.displayName ?? 'Away Player';
  const currentTurnLabel =
    matchup.liveState.currentTurnSide === 'home' ? homePlayerName : awayPlayerName;

  function refreshPage() {
    setRefreshKey((value) => value + 1);
  }

  function handleSubmitTurn(event) {
    event.preventDefault();

    const result = submitCaptainMatchupTurn(
      currentUser.playerId,
      fixtureId,
      matchupId,
      turnScore
    );

    if (!result.success) {
      setErrorMessage(result.message);
      setSuccessMessage('');
      setShowFinishDarts(false);
      return;
    }

    if (result.requiresFinishDarts) {
      setErrorMessage('');
      setSuccessMessage(result.message);
      setShowFinishDarts(true);
      return;
    }

    setErrorMessage('');
    setSuccessMessage(result.message);
    setTurnScore('');
    setShowFinishDarts(false);

    if (result.matchup?.status === 'completed' || result.fixture?.status === 'completed') {
      navigate(`/captain/fixture/${fixtureId}/live`);
      return;
    }

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
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Matchup Scoring"
        subtitle={`${matchup.label} • Block ${matchup.blockNumber}`}
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
            <div className="feature-title">Turn</div>
            <div className="muted-text">{currentTurnLabel}</div>
          </div>
        </div>
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
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{homePlayerName}</div>
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
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{awayPlayerName}</div>
            <div className="muted-text">Score Left</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
              {matchup.liveState.awayScoreLeft}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Enter Turn Score</h3>

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
              placeholder="Enter a score from 0 to 180"
              value={turnScore}
              onChange={(event) => setTurnScore(event.target.value)}
            />
          </div>

          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
          {successMessage ? <div className="form-success">{successMessage}</div> : null}

          <button type="submit" className="primary-btn auth-submit-btn">
            Submit Turn
          </button>

          {showFinishDarts ? (
            <div style={{ marginTop: '1rem' }}>
              <div className="muted-text" style={{ marginBottom: '0.5rem' }}>
                This score finishes the leg. Select darts used:
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleFinishWithDarts(1)}
                >
                  1 Dart
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleFinishWithDarts(2)}
                >
                  2 Darts
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleFinishWithDarts(3)}
                >
                  3 Darts
                </button>
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
            {[...matchup.liveState.turns].reverse().map((turn, index) => (
              <div key={`${turn.createdAt}-${index}`} className="feature-item">
                <div className="feature-title">
                  {turn.side === 'home' ? homePlayerName : awayPlayerName}
                </div>
                <div className="muted-text">
                  Scored {turn.score}
                  {turn.bust ? ' • Bust' : ''}
                  {turn.dartsUsed ? ` • ${turn.dartsUsed} dart finish/use` : ''}
                  {' • '}
                  Left {turn.resultingScore}
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
            <div className="feature-title">Singles Only</div>
            <div className="muted-text">
              This first scorer handles 501 singles only so the live flow stays stable.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Bust Logic</div>
            <div className="muted-text">
              Overscoring or leaving 1 is treated as a bust and the score stays the same.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Double Out</div>
            <div className="muted-text">
              Checking out to zero requires confirming that the finish was on a double.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}