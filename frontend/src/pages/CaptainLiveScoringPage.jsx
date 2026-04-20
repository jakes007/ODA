import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainLiveScoringData,
  startCaptainFixtureMatchup,
  applyCaptainSubstitution,
  submitCaptainPostMatchWrapUp
} from '../services/captainData';

export default function CaptainLiveScoringPage() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [outgoingPlayerId, setOutgoingPlayerId] = useState('');
  const [incomingPlayerId, setIncomingPlayerId] = useState('');
  const [selectedOpponentPotmPlayerId, setSelectedOpponentPotmPlayerId] = useState('');
  const [captainNotes, setCaptainNotes] = useState('');
  const [confirmScoresheet, setConfirmScoresheet] = useState(false);

  const fixture = useMemo(() => {
    if (!currentUser?.playerId) return null;
    return getCaptainLiveScoringData(currentUser.playerId, fixtureId);
  }, [currentUser?.playerId, fixtureId, refreshKey]);

  if (!fixture) {
    return <EmptyState message="Live scoring fixture not found." />;
  }

  if (fixture.status !== 'active' && fixture.status !== 'completed') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Captain Live Scoring"
          subtitle="This fixture has not been started yet."
        />

        <section className="panel">
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-title">Fixture</div>
              <div className="muted-text">{fixture.fixtureName}</div>
            </div>

            <div className="feature-item">
              <div className="feature-title">Current Status</div>
              <div className="muted-text">{formatStatus(fixture.status)}</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Link to={`/captain/fixture/${fixtureId}/setup`} className="text-link">
              Return to fixture setup
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const isFixtureCompleted = fixture.status === 'completed';
  const isHomeCaptain = fixture.captainSide === 'home';
  const canControlFixtureFlow = isHomeCaptain && !isFixtureCompleted;

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
      const sidePlayers =
        fixture.captainSide === 'home' ? matchup.homePlayers : matchup.awayPlayers;

      return (sidePlayers ?? []).map((player) => player.playerId).filter(Boolean);
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
  const opponentPostMatch = fixture.postMatch?.[opponentCaptainSide] ?? {
    selectedOpponentPotmPlayerId: '',
    selectedOpponentPotmPlayerName: '',
    notes: '',
    confirmedAt: null
  };

  const wrapUpOpponentSquad = fixture.opponentTeam?.squad ?? [];
  const matchupsByBlock = groupMatchupsByBlock(matchups);

  function refreshPage() {
    setRefreshKey((value) => value + 1);
  }

  function handleStartMatchup(matchupId) {
    const result = startCaptainFixtureMatchup(currentUser.playerId, fixtureId, matchupId);

    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }

    setErrors([]);
    setSuccessMessage(result.message);
    refreshPage();
  }

  function openMatchupScorer(matchupId) {
    navigate(`/captain/fixture/${fixtureId}/matchup/${matchupId}`);
  }

  function handleApplySubstitution() {
    const result = applyCaptainSubstitution(
      currentUser.playerId,
      fixtureId,
      outgoingPlayerId,
      incomingPlayerId
    );

    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }

    setErrors([]);
    setSuccessMessage(result.message);
    setOutgoingPlayerId('');
    setIncomingPlayerId('');
    refreshPage();
  }

  function handleSubmitPostMatchWrapUp() {
    const result = submitCaptainPostMatchWrapUp(currentUser.playerId, fixtureId, {
      selectedOpponentPotmPlayerId,
      notes: captainNotes,
      confirmScoresheet
    });

    if (!result.success) {
      setErrors([result.message]);
      setSuccessMessage('');
      return;
    }

    setErrors([]);
    setSuccessMessage(result.message);
    refreshPage();
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Captain Live Scoring"
        subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Fixture Live Hub</h3>
          <Link to={`/captain/fixture/${fixtureId}/setup`} className="text-link">
            Back to Fixture Setup
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
            <div className="feature-title">Overall Score</div>
            <div className="muted-text">{fixture.scoreText}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Format</div>
            <div className="muted-text">{fixture.format?.name ?? 'Fixture format'}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Active Boards</div>
            <div className="muted-text">{fixture.liveSession?.activeBoardCount ?? 0}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Total Matchups</div>
            <div className="muted-text">{matchups.length}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Lineups</div>
            <div className="muted-text">
              {fixture.lineupsRevealed ? 'Revealed and locked for live play' : 'Hidden'}
            </div>
          </div>
        </div>

        {errors.length > 0 ? (
          <div className="form-error-list" style={{ marginTop: '1rem' }}>
            {errors.map((error, index) => (
              <div key={`${error}-${index}`} className="form-error">
                {error}
              </div>
            ))}
          </div>
        ) : null}

        {successMessage ? (
          <div className="form-success" style={{ marginTop: '1rem' }}>
            {successMessage}
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h3 className="panel-title">Captain Responsibility</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Fixture Operator</div>
            <div className="muted-text">
              {isHomeCaptain
                ? 'You are the home captain and control live fixture flow.'
                : 'The home captain controls live fixture flow for this fixture.'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Your Access</div>
            <div className="muted-text">
              {isHomeCaptain
                ? 'You can start matchups, monitor progress, and manage the fixture flow.'
                : 'You can monitor live progress and manage your own side substitutions.'}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Substitution Control</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Rule</div>
            <div className="muted-text">
            You may manage substitutions for your own side only. Substitutions update future
              waiting matchups only. Completed and in-progress matchups stay unchanged.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Available Outgoing Players</div>
            <div className="muted-text">
              {eligibleOutgoingPlayers.length > 0
                ? `${eligibleOutgoingPlayers.length} player(s) still have waiting matchups`
                : 'No active lineup players have waiting matchups left'}
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Bench Players</div>
            <div className="muted-text">
              {myBenchPlayers.length > 0
                ? `${myBenchPlayers.length} bench player(s) available`
                : 'No bench players available'}
            </div>
          </div>
        </div>

        {fixture.status === 'active' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}
          >
            <div>
              <label className="form-label" htmlFor="outgoing-player">
                Outgoing Player
              </label>
              <select
                id="outgoing-player"
                className="form-input"
                value={outgoingPlayerId}
                onChange={(event) => setOutgoingPlayerId(event.target.value)}
              >
                <option value="">Select outgoing player</option>
                {eligibleOutgoingPlayers.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="incoming-player">
                Incoming Substitute
              </label>
              <select
                id="incoming-player"
                className="form-input"
                value={incomingPlayerId}
                onChange={(event) => setIncomingPlayerId(event.target.value)}
              >
                <option value="">Select bench player</option>
                {myBenchPlayers.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {fixture.status === 'active' ? (
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="secondary-btn captain-action-btn"
              onClick={handleApplySubstitution}
              disabled={!outgoingPlayerId || !incomingPlayerId}
            >
              Apply Substitution
            </button>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h3 className="panel-title">Fixture Progress Board</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {matchupsByBlock.map((block) => (
            <div
              key={`block-${block.blockNumber}`}
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '1rem'
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: '0.75rem'
                }}
              >
                Block {block.blockNumber}
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {block.matchups.map((matchup) => (
                  <div
                    key={matchup.matchupId}
                    style={{
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      background: getMatchupTileBackground(matchup.status),
                      cursor:
                      matchup.status === 'in_progress' && isHomeCaptain
                        ? 'pointer'
                        : 'default',
                    opacity: matchup.status === 'completed' ? 0.7 : 1
                  }}
                  onClick={
                    matchup.status === 'in_progress' && isHomeCaptain
                      ? () => openMatchupScorer(matchup.matchupId)
                      : undefined
                  }
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                      {matchup.label}
                    </div>

                    <div className="muted-text" style={{ fontSize: '0.9rem' }}>
                      {getMatchupStatusLabel(matchup.status)}
                      {matchup.status === 'in_progress' && matchup.boardNumber
                        ? ` • Board ${matchup.boardNumber}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isFixtureCompleted ? (
        <>
          <section className="panel">
            <h3 className="panel-title">Match Complete</h3>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-title">Final Result</div>
                <div className="muted-text">{fixture.scoreText}</div>
              </div>

              <div className="feature-item">
                <div className="feature-title">Status</div>
                <div className="muted-text">
                  All matchups have been completed. Captains can now move to post-match wrap-up.
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-title">Live Session</div>
                <div className="muted-text">
                  {fixture.liveSession?.startedAt
                    ? `Started: ${new Date(fixture.liveSession.startedAt).toLocaleString()}`
                    : '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3 className="panel-title">Post-Match Wrap-Up</h3>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-title">Your Wrap-Up Status</div>
                <div className="muted-text">
                  {myPostMatch.confirmedAt
                    ? `Submitted at ${new Date(myPostMatch.confirmedAt).toLocaleString()}`
                    : 'Not yet submitted'}
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-title">Opponent Captain Status</div>
                <div className="muted-text">
                  {opponentPostMatch.confirmedAt
                    ? `Submitted at ${new Date(opponentPostMatch.confirmedAt).toLocaleString()}`
                    : 'Still waiting on opponent captain'}
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-title">Your POTM Selection</div>
                <div className="muted-text">
                  {myPostMatch.selectedOpponentPotmPlayerName || 'No POTM selected yet'}
                </div>
              </div>
            </div>

            {!myPostMatch.confirmedAt ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}
                >
                  <div>
                    <label className="form-label" htmlFor="postmatch-potm">
                      Choose POTM from Opposing Team
                    </label>
                    <select
                      id="postmatch-potm"
                      className="form-input"
                      value={selectedOpponentPotmPlayerId}
                      onChange={(event) => setSelectedOpponentPotmPlayerId(event.target.value)}
                    >
                      <option value="">Select opponent POTM</option>
                      {wrapUpOpponentSquad.map((player) => (
                        <option key={player.playerId} value={player.playerId}>
                          {player.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="captain-notes">
                      Match Notes
                    </label>
                    <textarea
                      id="captain-notes"
                      className="form-input"
                      rows={4}
                      value={captainNotes}
                      onChange={(event) => setCaptainNotes(event.target.value)}
                      placeholder="Add any notes about the fixture, incidents, or comments"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={confirmScoresheet}
                      onChange={(event) => setConfirmScoresheet(event.target.checked)}
                    />
                    <span className="muted-text">
                      I confirm that the digital scoresheet is correct to the best of my knowledge
                    </span>
                  </label>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSubmitPostMatchWrapUp}
                    disabled={!selectedOpponentPotmPlayerId || !confirmScoresheet}
                  >
                    Submit Post-Match Wrap-Up
                  </button>
                </div>
              </>
            ) : (
              <div className="muted-text" style={{ marginTop: '1rem' }}>
                Your wrap-up has already been submitted for this fixture.
              </div>
            )}
          </section>
        </>
      ) : null}

      <section className="panel">
        <h3 className="panel-title">Active Matchups</h3>

        {activeMatchups.length === 0 ? (
          <div className="muted-text">
            {isFixtureCompleted ? 'All matchups completed' : 'No matchups are currently active.'}
          </div>
        ) : (
          <div className="captain-fixture-list">
            {activeMatchups.map((matchup) => (
              <div key={matchup.matchupId} className="captain-fixture-card">
                <div className="captain-fixture-main">
                  <div className="history-title">{matchup.label}</div>
                  <div className="muted-text">Block {matchup.blockNumber}</div>
                  <div className="muted-text">{matchup.formatLabel}</div>
                  <div className="muted-text">Board {matchup.boardNumber}</div>
                  <div className="muted-text">
                    Home Left: {matchup.liveState?.homeScoreLeft ?? '-'} • Away Left:{' '}
                    {matchup.liveState?.awayScoreLeft ?? '-'}
                  </div>
                  <div className="muted-text">Status: In Progress</div>
                </div>

                <div className="captain-fixture-side">
                  {canControlFixtureFlow ? (
                    <button
                      type="button"
                      className="secondary-btn captain-action-btn"
                      onClick={() => openMatchupScorer(matchup.matchupId)}
                    >
                      Open Scorer
                    </button>
                  ) : (
                    <div className="muted-text">
                      {isFixtureCompleted
                        ? 'Fixture complete'
                        : 'Home captain controls active scorer access'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3 className="panel-title">Waiting Matchups</h3>

        {waitingMatchups.length === 0 ? (
          <div className="muted-text">
            {isFixtureCompleted ? 'All matchups completed' : 'No waiting matchups.'}
          </div>
        ) : (
          <div className="captain-fixture-list">
            {waitingMatchups.map((matchup) => (
              <div
                key={matchup.matchupId}
                className="captain-fixture-card"
                style={matchup.status === 'completed' ? { opacity: 0.7 } : undefined}
              >
                <div className="captain-fixture-main">
                  <div className="history-title">{matchup.label}</div>
                  <div className="muted-text">Block {matchup.blockNumber}</div>
                  <div className="muted-text">{matchup.formatLabel}</div>
                  <div className="muted-text">
                    Slots: Home {matchup.homeSlots.join('+')} vs Away {matchup.awaySlots.join('+')}
                  </div>
                  <div className="muted-text">Status: Waiting</div>
                </div>

                <div className="captain-fixture-side">
                  {canControlFixtureFlow ? (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleStartMatchup(matchup.matchupId)}
                    >
                      Start Match
                    </button>
                  ) : (
                    <div className="muted-text">
                      {isFixtureCompleted
                        ? 'Fixture complete'
                        : 'Home captain starts matchups'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3 className="panel-title">Completed Matchups</h3>

        {completedMatchups.length === 0 ? (
          <div className="muted-text">No matchups have been completed yet.</div>
        ) : (
          <div className="captain-fixture-list">
            {completedMatchups.map((matchup) => (
              <div
                key={matchup.matchupId}
                className="captain-fixture-card"
                style={{ opacity: 0.7 }}
              >
                <div className="captain-fixture-main">
                  <div className="history-title">{matchup.label}</div>
                  <div className="muted-text">Block {matchup.blockNumber}</div>
                  <div className="muted-text">{matchup.formatLabel}</div>
                  <div className="muted-text">
                    Winner: {matchup.result?.winnerTeamName ?? 'Recorded'}
                  </div>
                  <div className="muted-text">Status: Completed</div>
                </div>

                <div className="captain-fixture-side" style={{ minWidth: '220px' }}>
                  <div className="fixture-score" style={{ marginBottom: '0.5rem' }}>
                    {matchup.result?.winnerSide === 'home' ? 'H' : 'A'}
                  </div>

                  <button
                    type="button"
                    className="secondary-btn captain-action-btn"
                    onClick={() => openMatchupScorer(matchup.matchupId)}
                  >
                    Edit Matchup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function groupMatchupsByBlock(matchups) {
  const blocksMap = new Map();

  matchups.forEach((matchup) => {
    if (!blocksMap.has(matchup.blockNumber)) {
      blocksMap.set(matchup.blockNumber, []);
    }

    blocksMap.get(matchup.blockNumber).push(matchup);
  });

  return Array.from(blocksMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([blockNumber, blockMatchups]) => ({
      blockNumber,
      matchups: blockMatchups.sort((a, b) => a.blockOrder - b.blockOrder)
    }));
}

function getMatchupStatusLabel(status) {
  const labels = {
    waiting: 'Waiting',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}

function getMatchupTileBackground(status) {
  if (status === 'in_progress') {
    return 'rgba(255, 165, 0, 0.16)';
  }

  if (status === 'completed') {
    return 'rgba(0, 200, 83, 0.16)';
  }

  return 'rgba(255,255,255,0.03)';
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