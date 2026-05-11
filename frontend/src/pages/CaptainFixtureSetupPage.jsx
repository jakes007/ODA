import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainFixtureSetupData,
  submitCaptainFixtureLineup,
  withdrawCaptainFixtureLineup,
  startCaptainFixtureLiveMatch
} from '../services/captainFixtureService';
import {
  submitCaptainLineup,
  validateCaptainLineup,
  startCaptainFixtureLiveScoring,
  withdrawCaptainLineupSubmission
} from '../services/captainData';

export default function CaptainFixtureSetupPage() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineup, setLineup] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadFixtureSetup();
  }, [fixtureId, currentUser?.playerId]);
  
  async function loadFixtureSetup() {
    if (!fixtureId || !currentUser?.playerId) {
      setLoading(false);
      return;
    }
  
    const setupData = await getCaptainFixtureSetupData({
      fixtureId,
      captainPlayerId: currentUser.playerId
    });
  
    setFixture(setupData);
    setLineup(setupData?.myTeam.currentLineup ?? []);
    setLoading(false);
  }

  const lineupPlayers = useMemo(() => {
    if (!fixture) return [];

    return lineup
      .map((playerId, index) => {
        if (!playerId) {
          return {
            empty: true,
            slotNumber: index + 1
          };
        }

        const player = fixture.myTeam.squad.find((squadPlayer) => squadPlayer.playerId === playerId);

        return player
          ? { ...player, slotNumber: index + 1 }
          : {
              empty: true,
              slotNumber: index + 1
            };
      });
  }, [fixture, lineup]);

  const benchPlayers = useMemo(() => {
    if (!fixture) return [];

    const lineupIds = new Set(lineup.filter(Boolean));
    return fixture.myTeam.squad.filter((player) => !lineupIds.has(player.playerId));
  }, [fixture, lineup]);

  if (loading) {
    return <EmptyState message="Loading fixture setup..." />;
  }
  
  if (!fixture) {
    return <EmptyState message="Fixture setup data not found." />;
  }

  const canEditLineup =
    fixture.status !== 'completed' &&
    fixture.status !== 'active';

  const canStartMatch = fixture.status === 'ready_to_play';
  const isWaitingForOpponent = fixture.status === 'waiting_for_opponent';
  const mySubmissionExists = fixture.myTeam.submitted;

  function handleLineupChange(index, nextPlayerId) {
    const nextLineup = [...lineup];
    nextLineup[index] = nextPlayerId;

    setLineup(nextLineup);
    setSuccessMessage('');

    const validation = validateCaptainLineup(fixture, nextLineup);
    setErrors(validation.valid ? [] : validation.errors);
  }

  async function handleSubmit(event) {
    event.preventDefault();
  
    const validation = validateCaptainLineup(fixture, lineup);
  
    if (!validation.valid) {
      setErrors(validation.errors);
      setSuccessMessage('');
      return;
    }
  
    const result = await submitCaptainFixtureLineup({
      fixtureId,
      captainPlayerId: currentUser.playerId,
      lineup
    });
  
    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }
  
    setErrors([]);
    setSuccessMessage(result.message);
    await loadFixtureSetup();
  }

  async function handleWithdrawSubmission() {
    const result = await withdrawCaptainFixtureLineup({
      fixtureId,
      captainPlayerId: currentUser.playerId
    });
  
    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }
  
    setErrors([]);
    setSuccessMessage(result.message);
    await loadFixtureSetup();
  }

  async function handleStartMatch() {
    const result = await startCaptainFixtureLiveMatch({
      fixtureId,
      captainPlayerId: currentUser.playerId
    });
  
    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }
  
    setErrors([]);
    setSuccessMessage(result.message);
  
    navigate(`/captain/fixture/${fixtureId}/live`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Fixture Setup"
        subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Fixture Details</h3>
          <Link to="/captain" className="text-link">
            Back to Captain Dashboard
          </Link>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">My Team</div>
            <div className="muted-text">{fixture.team.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Opponent</div>
            <div className="muted-text">{fixture.opponent.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Fixture Status</div>
            <div className="muted-text">{formatStatus(fixture.status)}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Lineups Visibility</div>
            <div className="muted-text">
              {fixture.lineupsRevealed
                ? 'Both lineups are revealed'
                : 'Lineups stay hidden until both captains submit'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Required Lineup Size</div>
            <div className="muted-text">{fixture.requiredLineupSize}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Notes</div>
            <div className="muted-text">{fixture.notes}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">My Team Lineup Order</h3>

        <form className="auth-form" onSubmit={handleSubmit}>
          {lineup.map((selectedPlayerId, index) => (
            <div key={`lineup-slot-${index}`} className="form-row">
              <label className="form-label" htmlFor={`lineup-slot-${index}`}>
                Player {index + 1}
              </label>

              <select
                id={`lineup-slot-${index}`}
                className="form-input"
                value={selectedPlayerId}
                onChange={(event) => handleLineupChange(index, event.target.value)}
                disabled={!canEditLineup}
              >
                <option value="">Select Player</option>

                {fixture.myTeam.squad.map((player) => (
  <option key={player.playerId} value={player.playerId}>
    {player.displayName}
    {player.isLoanPlayer ? ' [LOAN]' : ''}
  </option>
))}
              </select>
            </div>
          ))}

          {errors.length > 0 ? (
            <div className="form-error-list">
              {errors.map((error, index) => (
                <div key={`${error}-${index}`} className="form-error">
                  {error}
                </div>
              ))}
            </div>
          ) : null}

          {successMessage ? (
            <div className="form-success">{successMessage}</div>
          ) : null}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="primary-btn auth-submit-btn"
              disabled={!canEditLineup}
            >
              {fixture.lineupsRevealed ? 'Re-submit My Lineup' : 'Submit My Lineup'}
            </button>

            {mySubmissionExists && canEditLineup ? (
              <button
                type="button"
                className="secondary-btn"
                onClick={handleWithdrawSubmission}
              >
                Withdraw Submission
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <h3 className="panel-title">My Current Selected Order</h3>

        <div className="feature-list">
          {lineupPlayers.map((player, index) => (
            <div
              key={player.empty ? `empty-slot-${player.slotNumber}` : player.playerId}
              className="feature-item"
            >
              <div className="feature-title">
                {index + 1}. {player.empty ? 'Empty Slot' : player.displayName}
              </div>
              {player.empty ? (
  <div className="muted-text">
    No player selected for this position
  </div>
) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Available Bench Players</h3>

        {benchPlayers.length === 0 ? (
          <div className="muted-text">No bench players are currently available.</div>
        ) : (
          <div className="feature-list">
            {benchPlayers.map((player) => (
              <div key={player.playerId} className="feature-item">
                <div className="feature-title">
  {player.displayName}
  {player.isLoanPlayer ? ' [LOAN]' : ''}
</div>

{player.isLoanPlayer ? (
  <div className="muted-text">
    Approved loan player
  </div>
) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
  <h3 className="panel-title">Opponent Lineup</h3>

  {!fixture.lineupsRevealed ? (
    <div className="feature-list">
      <div className="feature-item">
        <div className="feature-title">Lineup Hidden</div>
        <div className="muted-text">
          The opposing lineup will only be shown after both captains have submitted.
        </div>
      </div>
    </div>
  ) : (
    <div className="feature-list">
      {(fixture.opponentTeam.submittedLineup ?? []).map((playerId, index) => {
        const player = fixture.opponentTeam.squad.find(
          (squadPlayer) => squadPlayer.playerId === playerId
        );

        if (!player) return null;

        return (
          <div key={player.playerId} className="feature-item">
            <div className="feature-title">
              {index + 1}. {player.displayName}
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

      <section className="panel">
        <h3 className="panel-title">Submission Status</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">My Team</div>
            <div className="muted-text">
              {fixture.myTeam.submitted
                ? `Submitted${fixture.myTeam.submittedAt ? ` at ${new Date(fixture.myTeam.submittedAt).toLocaleString()}` : ''}`
                : 'Not submitted yet'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Opponent Team</div>
            <div className="muted-text">
              {fixture.opponentTeam.submitted
                ? fixture.lineupsRevealed
                  ? `Submitted${fixture.opponentTeam.submittedAt ? ` at ${new Date(fixture.opponentTeam.submittedAt).toLocaleString()}` : ''}`
                  : 'Submitted'
                : 'Waiting for opponent submission'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Current Gate</div>
            <div className="muted-text">
              {fixture.status === 'ready_for_lineups'
                ? 'Captains can prepare and privately submit lineups.'
                : fixture.status === 'waiting_for_opponent'
                  ? 'One side has submitted. Waiting for the other side.'
                  : fixture.status === 'ready_to_play'
                    ? 'Both lineups are submitted and revealed. Match can be started.'
                    : fixture.status === 'active'
                      ? 'Fixture is already live.'
                      : 'Fixture is completed.'}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Launch Live Scoring</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Current State</div>
            <div className="muted-text">
              {canStartMatch
                ? 'Both lineups are confirmed. This fixture can now be started.'
                : fixture.status === 'active'
                  ? 'This fixture is already live.'
                  : fixture.status === 'completed'
                    ? 'This fixture is already completed.'
                    : isWaitingForOpponent
                      ? 'Waiting for the opposing captain to submit before the match can start.'
                      : 'Submit both private lineups before starting the match.'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Live Session</div>
            <div className="muted-text">
              {fixture.liveSession
                ? `Started at ${new Date(fixture.liveSession.startedAt).toLocaleString()}`
                : 'No live session has been created yet.'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canStartMatch ? (
            <button
              type="button"
              className="primary-btn"
              onClick={handleStartMatch}
            >
              Start Match
            </button>
          ) : null}

          {fixture.status === 'active' ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate(`/captain/fixture/${fixtureId}/live`)}
            >
              Resume Live Match
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
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