import { useEffect, useMemo, useRef, useState } from 'react';
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
import { validateCaptainLineup } from '../services/captainData';

export default function CaptainFixtureSetupPage() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineup, setLineup] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
const [openSlotIndex, setOpenSlotIndex] = useState(null);
const lineupDirtyRef = useRef(false);

useEffect(() => {
  lineupDirtyRef.current = false;
  loadFixtureSetup({ forceLineupSync: true });

  const refreshTimer = setInterval(() => {
    loadFixtureSetup();
  }, 5000);

  return () => clearInterval(refreshTimer);
}, [fixtureId, currentUser?.playerId]);
  
async function loadFixtureSetup({ forceLineupSync = false } = {}) {
  if (!fixtureId || !currentUser?.playerId) {
    setLoading(false);
    return;
  }

  const setupData = await getCaptainFixtureSetupData({
    fixtureId,
    captainPlayerId: currentUser.playerId
  });

  setFixture(setupData);

  if (forceLineupSync || !lineupDirtyRef.current) {
    setLineup(setupData?.myTeam.currentLineup ?? []);
  }

  setLoading(false);
}

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
  const mySubmissionExists = fixture.myTeam.submitted;

  function handleLineupChange(index, nextPlayerId) {
    lineupDirtyRef.current = true;
  
    const nextLineup = [...lineup];
    nextLineup[index] = nextPlayerId;
  
    setLineup(nextLineup);
    setSuccessMessage('');
  
    const validation = validateCaptainLineup(fixture, nextLineup);
    setErrors(validation.valid ? [] : validation.errors);
  }

  function handleBenchAdd(playerId) {
    if (!canEditLineup) return;
  
    const firstEmptyIndex = lineup.findIndex((slot) => !slot);
  
    if (firstEmptyIndex === -1) return;
  
    handleLineupChange(firstEmptyIndex, playerId);
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
  
    lineupDirtyRef.current = false;
setErrors([]);
setSuccessMessage(result.message);
await loadFixtureSetup({ forceLineupSync: true });
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
  
    lineupDirtyRef.current = false;
setErrors([]);
setSuccessMessage(result.message);
await loadFixtureSetup({ forceLineupSync: true });
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
      <div className="captain-setup-top-row">
  <PageHeader
    title="Captain Fixture Setup"
    subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
  />

  <Link to="/captain" className="captain-setup-back-button">
    ← Back To Captain Dashboard
  </Link>
</div>

<section className="captain-setup-hero">

<div className="captain-setup-status">

  <div className="captain-setup-kicker">
    FIXTURE COMMAND CENTRE
  </div>

  <div className="captain-setup-title">
    {fixture.team.teamName}
    <span>vs</span>
    {fixture.opponent.teamName}
  </div>

  <div className="captain-setup-meta">
    <span>{fixture.fixtureName}</span>
    <span>{fixture.competition.name}</span>
    <span>{fixture.competition.season}</span>
  </div>

</div>

<div className="captain-setup-state">

  <div className={`fixture-state-pill ${fixture.status}`}>
    {formatStatus(fixture.status)}
  </div>

</div>

</section>

<section className="captain-fixture-workflow-card">
  <div className="captain-section-header">
    <div>
      <div className="captain-section-kicker">FIXTURE WORKFLOW</div>
      <h2>Match Readiness</h2>
    </div>

    <div className={`fixture-state-pill ${fixture.status}`}>
      {formatStatus(fixture.status)}
    </div>
  </div>

  <div className="captain-workflow-track">
    <div className={`captain-workflow-step ${lineup.filter(Boolean).length >= fixture.requiredLineupSize ? 'done' : 'active'}`}>
      <div className="captain-workflow-dot">1</div>
      <strong>Lineup Selected</strong>
      <span>{lineup.filter(Boolean).length} / {fixture.requiredLineupSize} players</span>
    </div>

    <div className={`captain-workflow-step ${fixture.myTeam.submitted ? 'done' : ''}`}>
      <div className="captain-workflow-dot">2</div>
      <strong>My Team Submitted</strong>
      <span>{fixture.myTeam.submitted ? 'Submitted' : 'Not submitted yet'}</span>
    </div>

    <div className={`captain-workflow-step ${fixture.opponentTeam.submitted ? 'done' : ''}`}>
      <div className="captain-workflow-dot">3</div>
      <strong>Opponent Submitted</strong>
      <span>{fixture.opponentTeam.submitted ? 'Submitted' : 'Waiting'}</span>
    </div>

    <div className={`captain-workflow-step ${fixture.lineupsRevealed ? 'done' : ''}`}>
      <div className="captain-workflow-dot">4</div>
      <strong>Lineups Revealed</strong>
      <span>{fixture.lineupsRevealed ? 'Visible to both teams' : 'Hidden'}</span>
    </div>

    <div className={`captain-workflow-step ${fixture.status === 'ready_to_play' || fixture.status === 'active' ? 'done' : ''}`}>
      <div className="captain-workflow-dot">5</div>
      <strong>Match Ready</strong>
      <span>{fixture.status === 'active' ? 'Live now' : fixture.status === 'ready_to_play' ? 'Ready to start' : 'Not ready yet'}</span>
    </div>
  </div>
</section>

<section className="panel captain-lineup-builder-panel">
  <div className="captain-section-header">
    <div>
      <div className="captain-section-kicker">LINEUP BUILDER</div>
      <h2>Match Order Selection</h2>
    </div>

    <div className="captain-lineup-count">
      {lineup.filter(Boolean).length} / {fixture.requiredLineupSize} selected
    </div>
  </div>

  <form className="captain-lineup-builder" onSubmit={handleSubmit}>
    <div className="captain-lineup-slots">
      {lineup.map((selectedPlayerId, index) => {
        const selectedPlayer = fixture.myTeam.squad.find(
          (player) => player.playerId === selectedPlayerId
        );

        return (
          <div key={`lineup-slot-${index}`} className="captain-lineup-slot-card">
            <div className="captain-lineup-slot-number">
              {index + 1}
            </div>

            <div className="captain-lineup-slot-main">
              <label htmlFor={`lineup-slot-${index}`}>
                Player {index + 1}
              </label>

              <div className="premium-lineup-dropdown">
  <button
    type="button"
    className={`premium-lineup-dropdown-btn ${openSlotIndex === index ? 'open' : ''}`}
    onClick={() =>
      canEditLineup
        ? setOpenSlotIndex(openSlotIndex === index ? null : index)
        : null
    }
    disabled={!canEditLineup}
  >
    <span>
      {selectedPlayer ? selectedPlayer.displayName : 'Select Player'}
    </span>
    <strong>⌄</strong>
  </button>

  {openSlotIndex === index ? (
    <div className="premium-lineup-dropdown-menu">
      <button
        type="button"
        className="premium-lineup-dropdown-option"
        onClick={() => {
          handleLineupChange(index, '');
          setOpenSlotIndex(null);
        }}
      >
        Select Player
      </button>

      {fixture.myTeam.squad.map((player) => (
        <button
          key={player.playerId}
          type="button"
          className="premium-lineup-dropdown-option"
          onClick={() => {
            handleLineupChange(index, player.playerId);
            setOpenSlotIndex(null);
          }}
        >
          <span>{player.displayName}</span>
          {player.isLoanPlayer ? <em>LOAN</em> : null}
        </button>
      ))}
    </div>
  ) : null}
</div>

              <div className="captain-lineup-player-meta">
                {selectedPlayer ? (
                  <>
                    <span>{selectedPlayer.dsaNumber || 'No DSA number'}</span>
                    <span>{selectedPlayer.clubName || fixture.team.teamName}</span>
                    {selectedPlayer.isLoanPlayer ? <strong>LOAN</strong> : null}
                  </>
                ) : (
                  <span>No player selected for this position</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <div className="captain-bench-panel">
      <div className="captain-section-kicker">AVAILABLE BENCH</div>

      {benchPlayers.length === 0 ? (
        <div className="captain-empty-bench">
          No bench players are currently available.
        </div>
      ) : (
        <div className="captain-bench-grid">
          {benchPlayers.map((player) => (
            <button
              key={player.playerId}
              type="button"
              className="captain-bench-card"
              onClick={() => handleBenchAdd(player.playerId)}
              disabled={!canEditLineup || !lineup.some((slot) => !slot)}
            >
              <div>
                <strong>{player.displayName}</strong>
                <span>{player.dsaNumber || 'Registered player'}</span>
              </div>

              {player.isLoanPlayer ? (
                <em>LOAN</em>
              ) : (
                <em>ADD</em>
              )}
            </button>
          ))}
        </div>
      )}
    </div>

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

    <div className="captain-lineup-actions">
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

<section className="captain-opponent-lineup-card">
  <div className="captain-section-header">
    <div>
      <div className="captain-section-kicker">OPPONENT LINEUP</div>
      <h2>{fixture.opponent.teamName}</h2>
    </div>

    <div className={`fixture-state-pill ${fixture.lineupsRevealed ? 'ready_to_play' : 'waiting_for_opponent'}`}>
      {fixture.lineupsRevealed ? 'Revealed' : 'Hidden'}
    </div>
  </div>

  {!fixture.lineupsRevealed ? (
    <div className="captain-opponent-hidden">
      <strong>Lineup Hidden</strong>
      <span>
        The opposing lineup will only be shown after both captains have submitted.
      </span>
    </div>
  ) : (
    <div className="captain-opponent-lineup-list">
      {(fixture.opponentTeam.submittedLineup ?? []).map((playerId, index) => {
        const player = fixture.opponentTeam.squad.find(
          (squadPlayer) => squadPlayer.playerId === playerId
        );

        if (!player) return null;

        return (
          <div key={player.playerId} className="captain-opponent-player-row">
            <span>{index + 1}</span>
            <strong>{player.displayName}</strong>
          </div>
        );
      })}
    </div>
  )}
</section>


<section className="captain-match-control">
  <div className="captain-section-header">
    <div>
      <div className="captain-section-kicker">MATCH CONTROL CENTRE</div>
      <h2>Fixture Readiness</h2>
    </div>

    <div className={`fixture-state-pill ${fixture.status}`}>
      {formatStatus(fixture.status)}
    </div>
  </div>

  <div className="captain-match-grid">
    <div className="captain-match-card">
      <span>My Team</span>
      <strong>{fixture.myTeam.submitted ? 'Submitted' : 'Pending'}</strong>
    </div>

    <div className="captain-match-card">
      <span>Opponent</span>
      <strong>{fixture.opponentTeam.submitted ? 'Submitted' : 'Waiting'}</strong>
    </div>

    <div className="captain-match-card">
      <span>Lineups Revealed</span>
      <strong>{fixture.lineupsRevealed ? 'Yes' : 'No'}</strong>
    </div>

    <div className="captain-match-card">
      <span>Match Status</span>
      <strong>{formatStatus(fixture.status)}</strong>
    </div>
  </div>

</section>

<section className="captain-match-control">
  <div className="captain-command-centre-header">
    <div>
      <div className="captain-section-kicker">LINEUP COMMAND CENTRE</div>
      <h2>Submission Control</h2>
    </div>

    <div className="captain-command-status">
      {lineup.filter(Boolean).length} / {fixture.requiredLineupSize}
    </div>
  </div>

  <div className="captain-command-grid">
    <div className="captain-command-stat">
      <span>Players Selected</span>
      <strong>{lineup.filter(Boolean).length}</strong>
    </div>

    <div className="captain-command-stat">
      <span>Required</span>
      <strong>{fixture.requiredLineupSize}</strong>
    </div>

    <div className="captain-command-stat">
      <span>My Status</span>
      <strong>{fixture.myTeam.submitted ? 'Submitted' : 'Pending'}</strong>
    </div>

    <div className="captain-command-stat">
      <span>Opponent</span>
      <strong>{fixture.opponentTeam.submitted ? 'Submitted' : 'Waiting'}</strong>
    </div>
  </div>

  <div className="captain-command-actions">
    {fixture.myTeam.submitted && canEditLineup ? (
      <button
        type="button"
        className="captain-command-secondary-btn"
        onClick={handleWithdrawSubmission}
      >
        Withdraw Submission
      </button>
    ) : null}

    {canStartMatch ? (
      <button
        type="button"
        className="captain-command-primary-btn"
        onClick={handleStartMatch}
      >
        Start Match
      </button>
    ) : null}

    {fixture.status === 'active' ? (
      <button
        type="button"
        className="captain-command-primary-btn"
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
