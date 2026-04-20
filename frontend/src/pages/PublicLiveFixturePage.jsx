import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { getPublicLiveFixtureData } from '../services/captainData';

export default function PublicLiveFixturePage() {
  const { fixtureId } = useParams();

  const fixture = useMemo(() => {
    return getPublicLiveFixtureData(fixtureId);
  }, [fixtureId]);

  if (!fixture) {
    return <EmptyState message="Public live fixture not found." />;
  }

  const matchups = fixture.liveSession?.games ?? [];
  const activeMatchups = matchups.filter((game) => game.status === 'in_progress');
  const waitingMatchups = matchups.filter((game) => game.status === 'waiting');
  const completedMatchups = matchups.filter((game) => game.status === 'completed');
  const matchupsByBlock = groupMatchupsByBlock(matchups);

  return (
    <div className="page-stack">
      <PageHeader
        title="Live Fixture Viewer"
        subtitle={`${fixture.fixtureName} • ${fixture.competition.name} ${fixture.competition.season}`}
      />

      <section className="panel">
        <div className="section-heading-row">
          <h3 className="panel-title">Live Match Overview</h3>
          <Link to="/" className="text-link">
            Back to Home
          </Link>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-title">Home Team</div>
            <div className="muted-text">{fixture.homeTeam.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Away Team</div>
            <div className="muted-text">{fixture.awayTeam.teamName}</div>
          </div>

          <div className="feature-item">
            <div className="feature-title">Status</div>
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
              {fixture.lineupsRevealed ? 'Revealed' : 'Hidden until both captains submit'}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Progress Board</h3>

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
              <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
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
                      opacity: matchup.status === 'completed' ? 0.85 : 1
                    }}
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
          <div className="muted-text">
            {fixture.status === 'completed'
              ? 'All matchups completed'
              : 'No matchups are currently active.'}
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
                  <div className="muted-text">
                    Current Throw:{' '}
                    {getCurrentThrowLabel(matchup)}
                  </div>
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
            {fixture.status === 'completed'
              ? 'All matchups completed'
              : 'No waiting matchups.'}
          </div>
        ) : (
          <div className="captain-fixture-list">
            {waitingMatchups.map((matchup) => (
              <div key={matchup.matchupId} className="captain-fixture-card">
                <div className="captain-fixture-main">
                  <div className="history-title">{matchup.label}</div>
                  <div className="muted-text">Block {matchup.blockNumber}</div>
                  <div className="muted-text">{matchup.formatLabel}</div>
                  <div className="muted-text">Status: Waiting</div>
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
                style={{ opacity: 0.85 }}
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

                <div className="captain-fixture-side" style={{ minWidth: '120px' }}>
                  <div className="fixture-score">
                    {matchup.result?.winnerSide === 'home' ? 'H' : 'A'}
                  </div>
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

function getCurrentThrowLabel(matchup) {
  const side = matchup.liveState?.currentTurnSide ?? 'home';
  const index = matchup.liveState?.currentPlayerIndex ?? 0;
  const players = side === 'home' ? matchup.homePlayers : matchup.awayPlayers;

  if (!players || players.length === 0) {
    return side === 'home' ? 'Home' : 'Away';
  }

  return players[index]?.displayName ?? players[0]?.displayName ?? (side === 'home' ? 'Home' : 'Away');
}