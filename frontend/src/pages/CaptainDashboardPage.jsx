import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTeams } from '../services/adminTeamService';
import { getCaptainFixtures } from '../services/captainFixtureService';

export default function CaptainDashboardPage() {
  const { currentUser } = useAuth();

  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [currentUser?.playerId]);

  async function loadDashboard() {
    if (!currentUser?.playerId) {
      setLoading(false);
      return;
    }

    try {
      const loadedTeams = await getTeams();

if (import.meta.env.DEV) {
  const allTeamFixtureGroups = await Promise.all(
    loadedTeams.map((team) => getCaptainFixtures(team.id))
  );

  const allFixturesMap = new Map();

  allTeamFixtureGroups.flat().forEach((fixture) => {
    allFixturesMap.set(fixture.id, fixture);
  });

  const allFixtures = Array.from(allFixturesMap.values());

  console.table(
    loadedTeams.map((team) => {
      const summary = getTeamResultSummary(allFixtures, team);

      return {
        team: team.name,
        fixtures: summary.fixtures,
        completed: summary.completed,
        wins: summary.wins,
        losses: summary.losses,
        draws: summary.draws,
        winRate: summary.winRate,
        goalsFor: summary.pointsFor,
        goalsAgainst: summary.pointsAgainst,
        difference: summary.pointsDifference
      };
    })
  );
}

const captainTeams = loadedTeams.filter(
  (team) => team.captainPlayerId === currentUser.playerId
);

      setTeams(captainTeams);

      if (!captainTeams.length) {
        setFixtures([]);
        return;
      }

      const captainFixtures = await Promise.all(
        captainTeams.map((team) => getCaptainFixtures(team.id))
      );

      setFixtures(captainFixtures.flat());
    } catch (error) {
      console.error('Captain dashboard load failed:', error);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }

  const mainTeam = teams[0];

  const uniqueFixtures = useMemo(() => {
    const map = new Map();

    fixtures.forEach((fixture) => {
      map.set(fixture.id, fixture);
    });

    const statusPriority = {
      active: 1,
      ready_to_play: 2,
      ready_for_lineups: 3,
      waiting_for_opponent: 4,
      upcoming: 5,
      completed: 6
    };

    return Array.from(map.values()).sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 999;
      const priorityB = statusPriority[b.status] ?? 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = `${a.fixtureDate || ''} ${a.fixtureTime || ''}`;
      const dateB = `${b.fixtureDate || ''} ${b.fixtureTime || ''}`;

      return dateA.localeCompare(dateB);
    });
  }, [fixtures]);

  if (loading) {
    return (
      <div className="captain-command-page">
        <div className="captain-command-loading">
          Loading captain command centre...
        </div>
      </div>
    );
  }

  if (!mainTeam) {
    return (
      <div className="captain-command-page">
        <section className="captain-command-card">
          <div className="captain-command-kicker">Captain Dashboard</div>
          <h1>No captain assignment found</h1>
          <p className="captain-command-muted">
            This account is not currently linked to a team captain record.
          </p>
        </section>
      </div>
    );
  }

  const stats = getDashboardStats(uniqueFixtures);
  const liveFixture = uniqueFixtures.find((fixture) => fixture.status === 'active');
  const nextActionFixture = getNextActionFixture(uniqueFixtures);
  const nextFixture = getNextFixture(uniqueFixtures);
  const completedFixtures = uniqueFixtures
  .filter((fixture) => fixture.status === 'completed' || fixture.complete)
  .sort((a, b) => {
    const dateA = new Date(`${a.fixtureDate || ''} ${a.fixtureTime || '00:00'}`);
    const dateB = new Date(`${b.fixtureDate || ''} ${b.fixtureTime || '00:00'}`);

    return dateB - dateA;
  });

  return (
    <div className="captain-command-page">
      <header className="captain-command-header">
        <div>
          <div className="captain-command-kicker">Captain Dashboard</div>
          <h1>Welcome back, {currentUser?.displayName || currentUser?.name || 'Captain'}</h1>
          <p>Match control centre for {mainTeam.name}</p>
        </div>

        <div className="captain-command-role-pill">
          Captain
        </div>
      </header>

      <section className="captain-command-top-grid">
        <TeamCard
          team={mainTeam}
          fixtures={uniqueFixtures}
          stats={stats}
        />

        <NextFixtureCard
          fixture={nextFixture}
          team={mainTeam}
        />
      </section>

      {liveFixture && (
  <section className="captain-command-live-wide">
    <LiveCard fixture={liveFixture} />
  </section>
)}

<section className="captain-command-tools-card">
  <div className="captain-command-section-head">
    <h2>Captain Command Centre</h2>
    <span>Useful captain tools</span>
  </div>

  <div className="captain-command-tools-grid premium-command-tools">
    <QuickTool
      icon="calendar"
      label="Fixture History"
      description="View completed fixtures by month"
      onClick={() => setActiveModal('history')}
    />

    <QuickTool
      icon="stats"
      label="Team Statistics"
      description="Review team performance summary"
      onClick={() => setActiveModal('stats')}
    />

    <QuickTool
      icon="target"
      label={liveFixture ? 'Open Live Match' : 'No Live Match'}
      description={liveFixture ? 'Continue the current live fixture' : 'No active fixture right now'}
      to={liveFixture ? getCaptainFixtureRoute(liveFixture) : null}
      disabled={!liveFixture}
    />
  </div>
</section>

      <section className="captain-command-fixtures-card">
        <div className="captain-command-section-head">
          <h2>My Fixtures</h2>
          <span>{uniqueFixtures.length} fixtures</span>
        </div>

        <div className="captain-command-fixture-list">
          {!uniqueFixtures.length && (
            <p className="captain-command-muted">
              No fixtures found for this team yet.
            </p>
          )}

          {uniqueFixtures.map((fixture) => (
            <FixtureRow
              key={fixture.id}
              fixture={fixture}
              team={mainTeam}
            />
          ))}
        </div>
      </section>

      {activeModal === 'history' ? (
  <FixtureHistoryModal
    fixtures={completedFixtures}
    team={mainTeam}
    onClose={() => setActiveModal(null)}
  />
) : null}

{activeModal === 'stats' ? (
  <TeamStatsModal
    fixtures={uniqueFixtures}
    stats={stats}
    team={mainTeam}
    onClose={() => setActiveModal(null)}
  />
) : null}
    </div>
  );
}

function TeamCard({ team, fixtures, stats }) {
  return (
    <article className="captain-command-team-card">
      <div className="captain-command-team-top">
        <div className="captain-command-team-mark">
          {getTeamInitials(team.name)}
        </div>

        <div className="captain-command-team-body">
          <div className="captain-command-kicker captain-command-team-kicker">
            My Team
          </div>

          <h2>{team.name}</h2>

          <p>
            {team.divisionName || 'Division'} • {team.competitionName || 'Competition'}
          </p>
        </div>
      </div>

      <div className="captain-command-mini-stats">
        <MiniStat label="Fixtures" value={fixtures.length} />
        <MiniStat label="Ready" value={stats.readyToPlay} />
        <MiniStat label="Live" value={stats.active} />
        <MiniStat label="Done" value={stats.completed} />
      </div>
    </article>
  );
}

function NextFixtureCard({ fixture, team }) {
  if (!fixture) {
    return (
      <article className="captain-command-next-card">
        <div className="captain-command-next-top">
          <div className="captain-command-kicker purple">
            Next Fixture
          </div>

          <h2>No fixture scheduled</h2>

          <p className="captain-command-muted">
            No upcoming fixture is linked to this team.
          </p>
        </div>
      </article>
    );
  }

  const opponent = getOpponentName(fixture, team);
  const isLive = fixture.status === 'active';

  return (
    <article className="captain-command-next-card">
      <div className="captain-command-next-top">
        <div className="captain-command-kicker purple">
          {isLive ? 'Current Fixture' : 'Next Fixture'}
        </div>

        <h2>vs {opponent}</h2>

        <div className="captain-command-meta-row">
          <span>{fixture.fixtureDate || 'No date'}</span>
          <span>{fixture.fixtureTime || 'Time TBC'}</span>
        </div>
      </div>

      <div className="captain-command-next-stats">
        <div className="captain-command-stat-hover-tile">
          <strong>{formatStatus(fixture.status || 'upcoming')}</strong>
          <span>Status</span>
        </div>

        <div className="captain-command-stat-hover-tile">
  <strong>{fixture.scoreText || '0 - 0'}</strong>
  <span>Score</span>
</div>
      </div>
    </article>
  );
}

function ActionCard({ fixture }) {
  if (!fixture) {
    return (
      <article className="captain-command-action-card idle">
        <div className="captain-command-action-icon">
          <Icon name="check" />
        </div>

        <div className="captain-command-action-body">
          <div className="captain-command-kicker">All Clear</div>
          <h2>No action required</h2>
          <p>Your fixtures are up to date.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="captain-command-action-card">
      <div className="captain-command-action-icon">
        <Icon name={getActionIcon(fixture.status)} />
      </div>

      <div className="captain-command-action-body">
        <div className="captain-command-action-top">
          <div className="captain-command-kicker">Requires Action</div>
          <span>{formatStatus(fixture.status)}</span>
        </div>

        <h2>{getActionTitle(fixture)}</h2>
        <p>{fixture.homeTeamName || 'Home'} vs {fixture.awayTeamName || 'Away'}</p>

        <Link to={getCaptainFixtureRoute(fixture)} className="captain-command-primary-btn">
          {getActionButtonText(fixture)}
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

function LiveCard({ fixture }) {
  if (!fixture) {
    return (
      <article className="captain-command-live-card">
        <div className="captain-command-section-head">
          <h2>Live Match</h2>
          <span>No active fixture</span>
        </div>

        <div className="captain-command-live-empty">
          No match currently live.
        </div>
      </article>
    );
  }

  const score = getScoreParts(
    fixture.scoreText ||
    fixture.finalScore ||
    fixture.result ||
    `${fixture.score?.home ?? fixture.score?.homeScore ?? fixture.homeScore ?? fixture.homeTeamScore ?? 0} - ${fixture.score?.away ?? fixture.score?.awayScore ?? fixture.awayScore ?? fixture.awayTeamScore ?? 0}`
  );

  return (
    <article className="captain-command-live-card active">
      <div className="captain-command-section-head">
        <h2>Live Match</h2>
        <span className="captain-command-live-pill">● LIVE</span>
      </div>

      <div className="captain-command-live-title">
        {fixture.homeTeamName || 'Home'}
        <span>vs</span>
        {fixture.awayTeamName || 'Away'}
      </div>

      <div className="captain-command-live-score">
        <div>
          <strong>{score.home}</strong>
          <span>Legs</span>
        </div>

        <em>-</em>

        <div>
          <strong>{score.away}</strong>
          <span>Legs</span>
        </div>
      </div>

      <Link to={getCaptainFixtureRoute(fixture)} className="captain-command-live-btn">
        Open Live Control
      </Link>
    </article>
  );
}

function QuickTool({ icon, label, description, onClick, to, disabled = false }) {
  const content = (
    <>
      <div className="captain-command-tool-icon">
        <Icon name={icon} />
      </div>

      <div className="captain-command-tool-copy">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className="captain-command-tool-tile premium-tool-action">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="captain-command-tool-tile premium-tool-action"
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

function FixtureRow({ fixture, team }) {
  const opponent = getOpponentName(fixture, team);

  return (
    <div className="captain-command-fixture-row">
      <div className={`captain-command-status-badge ${fixture.status || 'upcoming'}`}>
        {formatShortStatus(fixture.status || 'upcoming')}
      </div>

      <div className="captain-command-fixture-main">
  <strong>{fixture.homeTeamName || 'Home'} vs {fixture.awayTeamName || 'Away'}</strong>
</div>

      <div className="captain-command-fixture-date">
        <strong>{fixture.fixtureDate || 'No date'}</strong>
        <span>{fixture.fixtureTime || ''}</span>
      </div>

      <div className={`captain-command-fixture-status ${fixture.status || 'upcoming'}`}>
  {formatStatus(fixture.status || 'upcoming')}
</div>

<Link
  to={getCaptainFixtureRoute(fixture)}
  className={`captain-command-row-btn ${fixture.status || 'upcoming'}`}
>
  {getActionButtonText(fixture)}
</Link>
    </div>
  );
}

function SnapshotCard({ stats }) {
  return (
    <article className="captain-command-panel">
      <div className="captain-command-section-head">
        <h2>Team Snapshot</h2>
        <span>Current season</span>
      </div>

      <div className="captain-command-snapshot-grid">
        <SnapshotTile label="Ready For Lineups" value={stats.readyForLineups} />
        <SnapshotTile label="Waiting" value={stats.waiting} />
        <SnapshotTile label="Ready To Play" value={stats.readyToPlay} />
        <SnapshotTile label="Completed" value={stats.completed} />
      </div>
    </article>
  );
}

function RecentResultsCard({ fixtures, team }) {
  

  return (
    <article className="captain-command-panel">
      <div className="captain-command-section-head">
        <h2>Recent Results</h2>
        <span>Latest completed</span>
      </div>

      <div className="captain-command-results-list">
        {!fixtures.length && (
          <p className="captain-command-muted">No completed fixtures yet.</p>
        )}

{fixtures.map((fixture) => {
  const score = getScoreParts(
    fixture.scoreText ||
    fixture.finalScore ||
    fixture.result ||
    `${fixture.score?.home ?? fixture.score?.homeScore ?? 0} - ${fixture.score?.away ?? fixture.score?.awayScore ?? 0}`
  );
  
  const homeScore = Number(score.home || 0);
  const awayScore = Number(score.away || 0);

  const myTeamId =
  team?.id ||
  fixture.myTeamId ||
  fixture.teamId;

const isMyTeamHome =
  fixture.homeTeamId === myTeamId;

const myTeamScore = isMyTeamHome
  ? homeScore
  : awayScore;

const opponentScore = isMyTeamHome
  ? awayScore
  : homeScore;

const resultType =
  myTeamScore === opponentScore
    ? 'draw'
    : myTeamScore > opponentScore
    ? 'win'
    : 'loss';

  return (
    <div
      key={fixture.id}
      className={`captain-command-result-row ${resultType}`}
    >
      <div className={`captain-command-result-pill ${resultType}`}>
        {resultType.toUpperCase()}
      </div>

      <div className="captain-command-result-content">
      <div className="captain-command-result-score">
  {homeScore} - {awayScore}
</div>

        <div className="captain-command-result-match">
          {fixture.homeTeamName || 'Home'} vs {fixture.awayTeamName || 'Away'}
        </div>

        <div className="captain-command-result-meta">
          Finished Match • Completed Fixture
        </div>
      </div>

      <div className="captain-command-result-side">
        FINAL
      </div>
    </div>
  );
})}
      </div>
    </article>
  );
}

function FixtureHistoryModal({ fixtures, team, onClose }) {
  const groupedFixtures = groupFixturesByMonth(fixtures);

  return (
    <div className="captain-modal-backdrop">
      <section className="captain-premium-modal">
        <div className="captain-premium-modal-head">
          <div>
            <div className="captain-command-kicker">Fixture History</div>
            <h2>Completed Fixtures</h2>
          </div>

          <button type="button" className="captain-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!fixtures.length ? (
          <p className="captain-command-muted">No completed fixtures yet.</p>
        ) : (
          <div className="captain-history-groups">
            {Object.entries(groupedFixtures).map(([monthLabel, monthFixtures]) => (
              <div key={monthLabel} className="captain-history-month">
                <h3>{monthLabel}</h3>

                <div className="captain-history-list">
                  {monthFixtures.map((fixture) => {
                    const score = getScoreParts(
                      fixture.scoreText ||
                      fixture.finalScore ||
                      fixture.result ||
                      `${fixture.score?.home ?? fixture.score?.homeScore ?? 0} - ${fixture.score?.away ?? fixture.score?.awayScore ?? 0}`
                    );

                    return (
                      <div key={fixture.id} className="captain-history-row">
                        <div>
                          <strong>{fixture.homeTeamName || 'Home'} vs {fixture.awayTeamName || 'Away'}</strong>
                          <span>{fixture.fixtureDate || 'No date'} • {fixture.fixtureTime || 'Time TBC'}</span>
                        </div>

                        <div className="captain-history-score">
                          {score.home} - {score.away}
                        </div>

                        <Link to={getCaptainFixtureRoute(fixture)} className="captain-history-btn">
                          Open Fixture
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TeamStatsModal({ fixtures, stats, team, onClose }) {
  const completed = fixtures.filter((fixture) => fixture.status === 'completed' || fixture.complete);
  const wins = completed.filter((fixture) => getFixtureResultType(fixture, team) === 'win').length;
  const losses = completed.filter((fixture) => getFixtureResultType(fixture, team) === 'loss').length;
  const draws = completed.filter((fixture) => getFixtureResultType(fixture, team) === 'draw').length;

  return (
    <div className="captain-modal-backdrop">
      <section className="captain-premium-modal">
        <div className="captain-premium-modal-head">
          <div>
            <div className="captain-command-kicker">Team Statistics</div>
            <h2>{team.name}</h2>
          </div>

          <button type="button" className="captain-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="captain-stats-modal-grid">
          <MiniStat label="Fixtures" value={fixtures.length} />
          <MiniStat label="Live" value={stats.active} />
          <MiniStat label="Completed" value={stats.completed} />
          <MiniStat label="Ready" value={stats.readyToPlay} />
          <MiniStat label="Wins" value={wins} />
          <MiniStat label="Losses" value={losses} />
          <MiniStat label="Draws" value={draws} />
          <MiniStat label="Win Rate" value={completed.length ? `${Math.round((wins / completed.length) * 100)}%` : '0%'} />
        </div>
      </section>
    </div>
  );
}

function groupFixturesByMonth(fixtures) {
  return fixtures.reduce((groups, fixture) => {
    const date = fixture.fixtureDate ? new Date(fixture.fixtureDate) : null;
    const label = date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
      : 'Unscheduled';

    return {
      ...groups,
      [label]: [...(groups[label] || []), fixture]
    };
  }, {});
}

function getFixtureResultType(fixture, team) {
  const score = getScoreParts(
    fixture.scoreText ||
    fixture.finalScore ||
    fixture.result ||
    `${fixture.score?.home ?? fixture.score?.homeScore ?? 0} - ${fixture.score?.away ?? fixture.score?.awayScore ?? 0}`
  );

  const homeScore = Number(score.home || 0);
  const awayScore = Number(score.away || 0);
  const isMyTeamHome = fixture.homeTeamId === team?.id;

  const myScore = isMyTeamHome ? homeScore : awayScore;
  const opponentScore = isMyTeamHome ? awayScore : homeScore;

  if (myScore === opponentScore) return 'draw';
  return myScore > opponentScore ? 'win' : 'loss';
}

function MiniStat({ label, value }) {
  return (
    <div className="captain-command-mini-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SnapshotTile({ label, value }) {
  return (
    <div className="captain-command-snapshot-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Icon({ name }) {
  const paths = {
    team: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    lineup: (
      <>
        <path d="M9 11h6" />
        <path d="M9 15h6" />
        <path d="M9 7h1" />
        <path d="M4 4h16v16H4z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    stats: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 2v4" />
        <path d="M17 2v4" />
        <path d="M3 9h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
      </>
    ),
    swap: (
      <>
        <path d="M16 3h5v5" />
        <path d="M4 20 21 3" />
        <path d="M21 16v5h-5" />
        <path d="M15 15 21 21" />
        <path d="M4 4l5 5" />
      </>
    ),
    play: (
      <path d="M8 5v14l11-7z" />
    ),
    check: (
      <path d="M20 6 9 17l-5-5" />
    ),
    wait: (
      <>
        <path d="M6 2h12" />
        <path d="M6 22h12" />
        <path d="M8 2c0 5 8 5 8 10s-8 5-8 10" />
        <path d="M16 2c0 5-8 5-8 10s8 5 8 10" />
      </>
    ),
    live: (
      <>
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
        <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
      </>
    )
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.target}
    </svg>
  );
}

function getTeamResultSummary(fixtures, team) {
  const teamFixtures = fixtures.filter(
    (fixture) =>
      fixture.homeTeamId === team?.id ||
      fixture.awayTeamId === team?.id
  );

  const completed = teamFixtures.filter(
    (fixture) => fixture.status === 'completed' || fixture.complete
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  completed.forEach((fixture) => {
    const score = getScoreParts(
      fixture.scoreText ||
      fixture.finalScore ||
      fixture.result ||
      `${fixture.score?.home ?? fixture.score?.homeScore ?? 0} - ${fixture.score?.away ?? fixture.score?.awayScore ?? 0}`
    );

    const homeScore = Number(score.home || 0);
    const awayScore = Number(score.away || 0);

    const isHome = fixture.homeTeamId === team?.id;

    const myScore = isHome ? homeScore : awayScore;
    const opponentScore = isHome ? awayScore : homeScore;

    pointsFor += myScore;
    pointsAgainst += opponentScore;

    if (myScore > opponentScore) wins += 1;
    else if (myScore < opponentScore) losses += 1;
    else draws += 1;
  });

  return {
    fixtures: teamFixtures.length,
    completed: completed.length,
    wins,
    losses,
    draws,
    pointsFor,
    pointsAgainst,
    pointsDifference: pointsFor - pointsAgainst,
    winRate: completed.length ? `${Math.round((wins / completed.length) * 100)}%` : '0%'
  };
}

function getDashboardStats(fixtures) {
  return {
    active: fixtures.filter((fixture) => fixture.status === 'active').length,
    readyForLineups: fixtures.filter((fixture) => fixture.status === 'ready_for_lineups').length,
    waiting: fixtures.filter((fixture) => fixture.status === 'waiting_for_opponent').length,
    readyToPlay: fixtures.filter((fixture) => fixture.status === 'ready_to_play').length,
    completed: fixtures.filter((fixture) => fixture.status === 'completed' || fixture.complete).length
  };
}

function getNextActionFixture(fixtures) {
  return fixtures.find((fixture) =>
    ['active', 'ready_to_play', 'ready_for_lineups', 'waiting_for_opponent'].includes(fixture.status)
  );
}

function getNextFixture(fixtures) {
  return fixtures.find((fixture) => fixture.status !== 'completed') || fixtures[0] || null;
}

function getOpponentName(fixture, team) {
  const isHome = fixture.homeTeamId === team.id;

  return isHome
    ? fixture.awayTeamName || 'Away Team'
    : fixture.homeTeamName || 'Home Team';
}

function getCaptainFixtureRoute(fixture) {
  if (fixture.status === 'active' || fixture.status === 'completed') {
    return `/captain/fixture/${fixture.id}/live`;
  }

  return `/captain/fixture/${fixture.id}/setup`;
}

function getActionTitle(fixture) {
  if (fixture.status === 'active') return 'Live Match Control';
  if (fixture.status === 'ready_to_play') return 'Start Match';
  if (fixture.status === 'ready_for_lineups') return 'Submit Lineup';
  if (fixture.status === 'waiting_for_opponent') return 'Waiting For Opponent';

  return 'Open Fixture';
}

function getActionButtonText(fixture) {
  if (fixture.status === 'active') return 'Open Live Control';
  if (fixture.status === 'ready_to_play') return 'Start Match';
  if (fixture.status === 'ready_for_lineups') return 'Submit Lineup';
  if (fixture.status === 'waiting_for_opponent') return 'View Lineup';

  return 'Open Fixture';
}

function getActionIcon(status) {
  if (status === 'active') return 'live';
  if (status === 'ready_to_play') return 'play';
  if (status === 'ready_for_lineups') return 'lineup';
  if (status === 'waiting_for_opponent') return 'wait';

  return 'target';
}

function formatShortStatus(status) {
  const labels = {
    active: 'LIVE',
    ready_to_play: 'READY',
    ready_for_lineups: 'ACTION',
    waiting_for_opponent: 'WAIT',
    completed: 'DONE',
    upcoming: 'NEXT'
  };

  return labels[status] ?? 'NEXT';
}

function formatStatus(status) {
  const labels = {
    upcoming: 'Upcoming',
    ready_for_lineups: 'Lineups Due',
    waiting_for_opponent: 'Waiting',
    ready_to_play: 'Ready To Play',
    active: 'Active',
    completed: 'Completed'
  };

  return labels[status] ?? status;
}

function getTeamInitials(teamName) {
  return String(teamName || 'T')
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