import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getCaptainLiveScoringData,
  startCaptainFixtureMatchup,
  applyCaptainSubstitution
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
        <h3 className="panel-title">Substitution Control</h3>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Rule</div>
            <div className="muted-text">
              Substitutions update future waiting matchups only. Completed and in-progress matchups
              stay unchanged.
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
                      cursor: matchup.status === 'in_progress' ? 'pointer' : 'default'
                    }}
                    onClick={
                      matchup.status === 'in_progress'
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

      <section className="panel">
        <h3 className="panel-title">Active Matchups</h3>

        {activeMatchups.length === 0 ? (
          <div className="muted-text">No matchups are currently active.</div>
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
                  <button
                    type="button"
                    className="secondary-btn captain-action-btn"
                    onClick={() => openMatchupScorer(matchup.matchupId)}
                  >
                    Open Scorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3 className="panel-title">Waiting Matchups</h3>

        {waitingMatchups.length === 0 ? (
          <div className="muted-text">No waiting matchups.</div>
        ) : (
          <div className="captain-fixture-list">
            {waitingMatchups.map((matchup) => (
              <div key={matchup.matchupId} className="captain-fixture-card">
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
                  <button
                    type="button"
                    className="secondary-btn captain-action-btn"
                    onClick={() => handleStartMatchup(matchup.matchupId)}
                  >
                    Start Matchup
                  </button>
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
              <div key={matchup.matchupId} className="captain-fixture-card">
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

      <section className="panel">
        <h3 className="panel-title">What this milestone does</h3>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Dedicated Scorer Route</div>
            <div className="muted-text">
              Active matchups now open into a dedicated scoring page instead of using demo winner
              buttons.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Live Match Control</div>
            <div className="muted-text">
              The live hub still shows the whole fixture while the scorer handles one matchup at a
              time.
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Next Step</div>
            <div className="muted-text">
              After the singles scorer is stable, the next phase is substitutions and one-player-short
              handling.
            </div>
          </div>
        </div>
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