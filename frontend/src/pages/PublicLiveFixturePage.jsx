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
  const scoreParts = getScoreParts(fixture?.scoreText);

  if (loading) {
    return <EmptyState message="Loading live fixture..." />;
  }

  if (!fixture) {
    return <EmptyState message="Public live fixture not found." />;
  }

  return (
    <div className="plf-page">
      <div className="plf-header-row">
        <PageHeader
          title="Live Match Centre"
          subtitle={`${fixture.fixtureName} • ${fixture.competition?.name ?? 'Competition'} ${fixture.competition?.season ?? ''}`}
        />

        <Link to="/live" className="plf-back-link">
          ← Back To Hub
        </Link>
      </div>

      <section className="plf-hero-card">
        <div className="plf-division-label">
          {getFixtureDivisionLabel(fixture)} • {fixture.competition?.season ?? '2026'}
        </div>

        

        <div className="plf-score-row">
          <div className="plf-team-side plf-home-side">
            <div className="plf-team-badge">
              {getTeamInitials(fixture.homeTeam?.teamName)}
            </div>

            <div className="plf-team-name">
              {fixture.homeTeam?.teamName}
            </div>
          </div>

          <div className="plf-centre-score">
            <div className="plf-live-pill">
              LIVE
            </div>

            <div className="plf-score-line">
  <span className="plf-mobile-home-name">
    {fixture.homeTeam?.teamName}
  </span>

  <span>{scoreParts.home}</span>

  <span className="plf-score-divider">
    -
  </span>

  <span>{scoreParts.away}</span>

  <span className="plf-mobile-away-name">
    {fixture.awayTeam?.teamName}
  </span>
</div>
          </div>

          <div className="plf-team-side plf-away-side">
            <div className="plf-team-name">
              {fixture.awayTeam?.teamName}
            </div>

            <div className="plf-team-badge plf-away-badge">
              {getTeamInitials(fixture.awayTeam?.teamName)}
            </div>
          </div>
        </div>

        <div className="plf-meta-row">
          <div className="plf-meta-pill plf-live-status">
            <span className="plf-dot" />
            {formatStatus(fixture.status)}
          </div>

          <div className="plf-meta-pill">
            {fixture.liveSession?.activeBoardCount ?? 0} Active Boards
          </div>

          <div className="plf-meta-pill">
            {matchups.length} Matchups
          </div>

          <div className="plf-meta-pill">
            {fixture.format?.name ?? 'Fixture Format'}
          </div>
        </div>
      </section>

      <section className="plf-stat-grid">
        <StatCard icon="◎" value={activeMatchups.length} label="Live Matchups" />
        <StatCard icon="✓" value={completedMatchups.length} label="Completed" />
        <StatCard icon="◌" value={waitingMatchups.length} label="Waiting" />
        <StatCard icon="⚔" value={fixture.liveSession?.activeBoardCount ?? 0} label="Active Boards" />
      </section>

      <section className="plf-panel">
        <div className="plf-panel-header">
          <div>
            <h3>Progress Board</h3>
            <p>Click any active matchup to watch live scoring once the dedicated board viewer is connected.</p>
          </div>
        </div>

        <div className="plf-block-grid">
          {groupedBlocks.map((block) => (
            <div key={block.blockNumber} className="plf-block-card">
              <div className="plf-block-title">
                Block {block.blockNumber}
              </div>

              <div className="plf-matchup-list">
                {block.matchups.map((matchup) => (
                  <button
                    key={matchup.matchupId}
                    type="button"
                    className={`plf-matchup-card ${matchup.status}`}
                  >
                    <div className="plf-matchup-title">
                      {matchup.label}
                    </div>

                    <div className="plf-matchup-meta">
                      {getMatchupStatusLabel(matchup.status)}
                      {matchup.boardNumber ? ` • Board ${matchup.boardNumber}` : ''}
                    </div>

                    {matchup.status === 'in_progress' && (
                      <div className="plf-watch-live-text">
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


       







    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="plf-stat-card">
      <div className="plf-stat-icon">
        {icon}
      </div>

      <div>
        <div className="plf-stat-value">
          {value}
        </div>

        <div className="plf-stat-label">
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

  return Array.from(map.entries())
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

function formatStatus(status) {
  const labels = {
    active: 'In Progress',
    completed: 'Completed',
    ready_for_lineups: 'Ready For Lineups',
    waiting_for_opponent: 'Waiting For Opponent',
    ready_to_play: 'Ready To Play'
  };

  return labels[status] ?? status;
}

function getTeamInitials(teamName = '') {
  return teamName
    .split(' ')
    .filter(Boolean)
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

function getMatchupPlayerNames(matchup) {
  const label = String(matchup.label || '');
  const parts = label.split(' vs ');

  return {
    home: parts[0]?.trim() || 'Home Player',
    away: parts[1]?.trim() || 'Away Player'
  };
}

function getFixtureDivisionLabel(fixture) {
  const searchableText = [
    fixture?.division,
    fixture?.divisionName,
    fixture?.competition?.division,
    fixture?.competition?.divisionName,
    fixture?.competition?.name,
    fixture?.fixtureName,
    fixture?.format?.name,
    fixture?.homeTeam?.teamName,
    fixture?.awayTeam?.teamName
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const competitionName = fixture?.competition?.name || 'Placements';

  if (searchableText.includes('upper')) {
    return `Upper ${competitionName}`;
  }

  if (searchableText.includes('lower')) {
    return `Lower ${competitionName}`;
  }

  if (/\b1\b/.test(searchableText)) {
    return `Upper ${competitionName}`;
  }

  if (/\b2\b/.test(searchableText) || /\b3\b/.test(searchableText)) {
    return `Lower ${competitionName}`;
  }

  return competitionName;
}