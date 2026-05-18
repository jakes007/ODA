import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { getPublicLiveFixtureData } from '../services/captainFixtureService';

export default function PublicLiveFixturePage() {
  const { fixtureId } = useParams();

  const [fixture, setFixture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixture();

    const intervalId = setInterval(() => {
      loadFixture();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [fixtureId]);

  async function loadFixture() {
    const liveFixture = await getPublicLiveFixtureData(fixtureId);

    setFixture(liveFixture);
    setLoading(false);
  }

  const matchups = useMemo(
    () => fixture?.liveSession?.games ?? [],
    [fixture]
  );

  const activeMatchups = matchups.filter(
    (game) => game.status === 'in_progress'
  );

  const waitingMatchups = matchups.filter(
    (game) => game.status === 'waiting'
  );

  const completedMatchups = matchups.filter(
    (game) => game.status === 'completed'
  );

  const groupedBlocks = groupMatchupsByBlock(matchups);

  if (loading) {
    return <EmptyState message="Loading live fixture..." />;
  }

  if (!fixture) {
    return <EmptyState message="Public live fixture not found." />;
  }

  return (
    <div className="public-live-fixture-page">
      <div className="public-live-page-header-row">
  <PageHeader
    title="Live Match Centre"
    subtitle={`${fixture.fixtureName} • ${fixture.competition?.name ?? 'Competition'} ${fixture.competition?.season ?? ''}`}
  />

  <Link
    to="/live"
    className="public-live-back-btn"
  >
    ← Back To Hub
  </Link>
</div>

      <section className="public-live-hero">
        

      <div className="public-live-score-layout">
  <div className="public-live-team-side">
    <div className="public-live-team-logo">
      {getTeamInitials(fixture.homeTeam?.teamName)}
    </div>

    <div className="public-live-team-name">
      {fixture.homeTeam?.teamName}
    </div>
  </div>

  <div className="public-live-centre-section">
    <div className="public-live-badge">
      LIVE
    </div>

    <div className="public-live-main-score">
  <span>{getScoreParts(fixture.scoreText).home}</span>

  <div className="public-live-score-divider">
    -
  </div>

  <span>{getScoreParts(fixture.scoreText).away}</span>
</div>

    <div className="public-live-meta-row">
      <div className="public-live-meta-pill live">
        ● In Progress
      </div>

      <div className="public-live-meta-pill">
        {fixture.liveSession?.activeBoardCount ?? 0} Active Boards
      </div>

      <div className="public-live-meta-pill">
        {matchups.length} Matchups
      </div>

      <div className="public-live-meta-pill">
        {fixture.format?.name ?? 'Fixture Format'}
      </div>
    </div>
  </div>

  <div className="public-live-team-side public-live-team-side-away">
    <div className="public-live-team-logo purple">
      {getTeamInitials(fixture.awayTeam?.teamName)}
    </div>

    <div className="public-live-team-name">
      {fixture.awayTeam?.teamName}
    </div>
  </div>
</div>
      </section>

      <section className="public-live-stats-grid">
        <StatCard
          icon="◎"
          value={activeMatchups.length}
          label="LIVE MATCHUPS"
        />

        <StatCard
          icon="✓"
          value={completedMatchups.length}
          label="COMPLETED"
        />

        <StatCard
          icon="◌"
          value={waitingMatchups.length}
          label="WAITING"
        />

        <StatCard
          icon="⚔"
          value={fixture.liveSession?.activeBoardCount ?? 0}
          label="ACTIVE BOARDS"
        />
      </section>

      <section className="public-live-panel">
        <div className="public-live-panel-header">
          <h3>Progress Board</h3>

          <div className="public-live-panel-subtitle">
            Click any active matchup to watch live scoring
          </div>
        </div>

        <div className="public-live-block-grid">
          {groupedBlocks.map((block) => (
            <div
              key={block.blockNumber}
              className="public-live-block-card"
            >
              <div className="public-live-block-title">
                Block {block.blockNumber}
              </div>

              <div className="public-live-matchup-list">
                {block.matchups.map((matchup) => (
                  <button
                    key={matchup.matchupId}
                    className={`public-live-matchup-card ${matchup.status}`}
                  >
                    <div className="public-live-matchup-top">
                      <div className="public-live-matchup-title">
                        {matchup.label}
                      </div>

                      
                      </div>

<div className="public-live-matchup-meta">
  {getMatchupStatusLabel(matchup.status)}

  {matchup.boardNumber
    ? ` • Board ${matchup.boardNumber}`
    : ''}
</div>

{matchup.status === 'in_progress' && (
  <div className="public-live-watch-row live">
    ▶ WATCH LIVE
  </div>
)}
</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="public-live-panel">
        <div className="public-live-panel-header">
          <h3>Live Boards</h3>
        </div>

        {activeMatchups.length === 0 ? (
          <div className="muted-text">
            No active boards currently live.
          </div>
        ) : (
          <div className="public-live-active-grid">
            {activeMatchups.map((matchup) => (
              <div
                key={matchup.matchupId}
                className="public-live-active-card"
              >
                <div className="public-live-board-header">
  <div>
    <div className="public-live-active-title">
      {matchup.label}
    </div>

    <div className="public-live-active-meta">
      Board {matchup.boardNumber ?? '-'}
    </div>
  </div>

  <div className="public-live-board-live-text">
    LIVE
  </div>
</div>

<div className="public-live-board-layout">
<div
  className={`public-live-board-side ${
    matchup.liveState?.currentTurnSide === 'home'
      ? 'active'
      : ''
  }`}
>
  <div className="public-live-board-player-name">
    {matchup.homePlayerName || 'Home Player'}
  </div>

  <div className="public-live-board-side-label">
    HOME LEFT
  </div>

  <div className="public-live-board-score">
    {matchup.liveState?.homeScoreLeft ?? 501}
  </div>
</div>

  <div className="public-live-board-centre">
    <div className="public-live-board-vs">
      VS
    </div>
    

  </div>

  <div
  className={`public-live-board-side ${
    matchup.liveState?.currentTurnSide === 'away'
      ? 'active'
      : ''
  }`}
>
  <div className="public-live-board-player-name">
    {matchup.awayPlayerName || 'Away Player'}
  </div>

  <div className="public-live-board-side-label">
    AWAY LEFT
  </div>

  <div className="public-live-board-score">
    {matchup.liveState?.awayScoreLeft ?? 501}
  </div>
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

function StatCard({ icon, value, label }) {
  return (
    <div className="public-live-stat-card">
      <div className="public-live-stat-icon">
        {icon}
      </div>

      <div>
        <div className="public-live-stat-value">
          {value}
        </div>

        <div className="public-live-stat-label">
          {label}
        </div>
      </div>
    </div>
  );
}

function groupMatchupsByBlock(matchups) {
  const map = new Map();

  matchups.forEach((matchup) => {
    if (!map.has(matchup.blockNumber)) {
      map.set(matchup.blockNumber, []);
    }

    map.get(matchup.blockNumber).push(matchup);
  });

  return Array.from(map.entries()).map(([blockNumber, blockMatchups]) => ({
    blockNumber,
    matchups: blockMatchups.sort(
      (a, b) => a.blockOrder - b.blockOrder
    )
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

function getCurrentThrowLabel(matchup) {
  const side = matchup.liveState?.currentTurnSide ?? 'home';

  const index = matchup.liveState?.currentPlayerIndex ?? 0;

  const players =
    side === 'home'
      ? matchup.homePlayers
      : matchup.awayPlayers;

  if (!players?.length) {
    return side === 'home' ? 'Home Player' : 'Away Player';
  }

  return (
    players[index]?.displayName ??
    players[0]?.displayName
  );
}

function getTeamInitials(teamName = '') {
  return teamName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getScoreParts(scoreText) {
  const parts = String(scoreText || '0 - 0')
    .split('-')
    .map((part) => part.trim());

  return {
    home: parts[0] || '0',
    away: parts[1] || '0'
  };
}