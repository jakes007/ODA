import { useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { importedRankingsData } from '../data/importedRankingsData';
import { importedRegistryData } from '../data/importedRegistryData';
import { importedFixturesData } from '../data/importedFixturesData';
import { resolvePlayerDisplayName } from '../utils/playerNameResolver';

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

function normalizeDsa(value) {
  return String(value || '').replace(/^DSA-?/i, '').trim();
}

function getAllStatContexts() {
  const contexts = [];

  Object.entries(importedRankingsData.divisions || {}).forEach(([divisionName, division]) => {
    [...(division.qualified || []), ...(division.alsoPlayed || [])].forEach((player) => {
      contexts.push({
        ...player,
        competitionName: importedRankingsData.competitionName,
        season: importedRankingsData.season,
        division: divisionName,
        contextKey: `${importedRankingsData.season}-${importedRankingsData.competitionName}-${divisionName}`
      });
    });
  });

  return contexts;
}

function findStatContextsForRegistryPlayer(registryPlayer) {
  const registryDsa = normalizeDsa(registryPlayer.dsaNumber);

  return getAllStatContexts().filter((context) => {
    const contextDsa = normalizeDsa(context.dsaNumber);
    return (
      context.playerId === registryPlayer.playerId ||
      (registryDsa && contextDsa && registryDsa === contextDsa) ||
      context.playerName === registryPlayer.fullName
    );
  });
}

function getDirectoryPlayers() {
  return (importedRegistryData.players || [])
    .map((player) => {
      const contexts = findStatContextsForRegistryPlayer(player);
      const divisions = [...new Set(contexts.map((context) => context.division))];

      return {
        ...player,
        contexts,
        divisionLabel: divisions.length ? divisions.join(' / ') : 'No stats yet'
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function findRegistryPlayer(playerId) {
  const statContext = getAllStatContexts().find(
    (context) => context.playerId === playerId
  );

  return (
    (importedRegistryData.players || []).find((player) => {
      const registryDsa = normalizeDsa(player.dsaNumber);
      const statDsa = normalizeDsa(statContext?.dsaNumber);

      return (
        player.playerId === playerId ||
        (registryDsa && statDsa && registryDsa === statDsa) ||
        player.fullName === statContext?.playerName
      );
    }) || null
  );
}

function getRecentMatchesForPlayer(player) {
  const allFixtures = [
    ...(importedFixturesData.divisions?.Upper || []),
    ...(importedFixturesData.divisions?.Lower || [])
  ];

  const playerName = player?.playerName || player?.fullName || '';
  const playerId = player?.playerId || '';

  return allFixtures
    .flatMap((fixture) =>
      (fixture.playerRows || [])
        .filter((row) => {
          return (
            row.playerId === playerId ||
            row.playerName === playerName
          );
        })
        .map((row) => ({
          fixtureId: fixture.id,
          date: fixture.date,
          competitionName: importedFixturesData.competitionName,
          season: importedFixturesData.season,
          division: fixture.division,
          fixtureName: fixture.fixtureName,
          opponentName: row.opponentName,
          average: row.average,
          tons: row.tons,
          oneEighties: row.oneEighties,
          highestClose: row.highestClose,
          result: row.singlesWon ? 'Won' : 'Lost'
        }))
    )
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
}

function getHeadToHeadForPlayer(player) {
  const matches = getRecentMatchesForPlayer(player);

  const opponentMap = new Map();

  matches.forEach((match) => {
    const opponentName = match.opponentName || 'Unknown Opponent';

    if (!opponentMap.has(opponentName)) {
      opponentMap.set(opponentName, {
        opponentName,
        played: 0,
        won: 0,
        lost: 0,
        totalAverage: 0
      });
    }

    const opponent = opponentMap.get(opponentName);

    opponent.played += 1;
    opponent.totalAverage += Number(match.average || 0);

    if (match.result === 'Won') {
      opponent.won += 1;
    } else {
      opponent.lost += 1;
    }
  });

  return Array.from(opponentMap.values())
    .map((opponent) => ({
      ...opponent,
      winPercentage: opponent.played
        ? (opponent.won / opponent.played) * 100
        : 0,
      averageVsOpponent: opponent.played
        ? opponent.totalAverage / opponent.played
        : 0
    }))
    .sort((a, b) => b.played - a.played || b.winPercentage - a.winPercentage)
    .slice(0, 5);
}

function groupPlayersByClub(players) {
  return players.reduce((groups, player) => {
    const club = player.clubName || 'No Club';

    if (!groups[club]) {
      groups[club] = [];
    }

    groups[club].push(player);
    return groups;
  }, {});
}

function PlayerDirectory({ returnPath }) {
  const players = getDirectoryPlayers();
  const clubs = groupPlayersByClub(players);
  const [openClubs, setOpenClubs] = useState({});

  function toggleClub(clubName) {
    setOpenClubs((current) => ({
      ...current,
      [clubName]: !current[clubName]
    }));
  }

  return (
    <div className="page-stack player-profile-page">
      <PageHeader
        title="Player Profiles"
        subtitle="Browse all registered players by club."
      />

      <div className="club-directory-grid">
      {Object.entries(clubs)
  .sort(([clubA], [clubB]) => clubA.localeCompare(clubB))
  .map(([clubName, clubPlayers]) => (
    <section key={clubName} className="panel premium-panel club-directory-card">
    <button
      type="button"
      className="club-directory-toggle"
      onClick={() => toggleClub(clubName)}
    >
      <span className="panel-title club-directory-title">
        {clubName}
        <span className="club-member-count">({clubPlayers.length})</span>
      </span>
  
      <span className="club-toggle-text">
        {openClubs[clubName] ? 'Hide players' : 'View players'}
      </span>
    </button>
  
    {openClubs[clubName] && (
      <div className="club-player-list">
        {clubPlayers.map((player) => (
                <Link
                  key={player.playerId}
                  to={`/player/${player.playerId}`}
                  state={{
                    from: 'profiles',
                    returnTo: returnPath
                  }}
                  className="club-player-link"
                >
                  <span>{player.fullName}</span>
                  <span>{player.contexts.length ? 'View Stats' : 'No Stats'}</span>
                </Link>
                            ))}
                            </div>
                          )}
                        </section>
        ))}
      </div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  const location = useLocation();

  const from = location.state?.from;

const backLink =
  from === 'rankings'
    ? '/competition/rankings'
    : from === 'club-rankings'
      ? '/competition/club-rankings'
      : location.state?.returnTo || '/player/player_jason';

const backLabel =
  from === 'rankings'
    ? 'Rankings'
    : from === 'club-rankings'
      ? 'Club Rankings'
      : 'Player Profiles';

  if (!playerId) {
    return <PlayerDirectory returnPath={location.pathname} />;
  }

  const registryPlayer = findRegistryPlayer(playerId);

  if (!registryPlayer) {
    return <PlayerDirectory returnPath="/player/player_jason" />;
  }

  const playerContexts = useMemo(
    () => findStatContextsForRegistryPlayer(registryPlayer),
    [registryPlayer]
  );

  const [selectedContextKey, setSelectedContextKey] = useState(
    playerContexts[0]?.contextKey || ''
  );

  const player =
    playerContexts.find((context) => context.contextKey === selectedContextKey) ||
    playerContexts[0];

    const recentMatches = getRecentMatchesForPlayer(player || registryPlayer);

    const headToHead = getHeadToHeadForPlayer(player || registryPlayer);

  return (
    <div className="page-stack player-profile-page">
      <PageHeader
        title={registryPlayer.fullName}
        subtitle={`${registryPlayer.clubName || 'No club'} • ${registryPlayer.status || 'Registered'} • DSA ${registryPlayer.dsaNumber || 'Pending'}`}
      />

      {!player && (
        <section className="panel premium-panel">
          <div className="panel-header">
            <h3 className="panel-title">Player Stats</h3>

            <Link to={backLink} className="panel-link">
              {backLabel}
            </Link>
          </div>

          <p className="muted-text">
            This player is registered, but has no Placements stats recorded yet.
          </p>
        </section>
      )}

      {player && (
        <>
          {playerContexts.length > 1 && (
            <section className="panel premium-panel profile-context-panel">
              <div className="panel-header">
                <h3 className="panel-title">Select Competition / Division</h3>
              </div>

              <div className="profile-context-buttons">
                {playerContexts.map((context) => (
                  <button
                    key={context.contextKey}
                    type="button"
                    className={`profile-context-btn ${
                      selectedContextKey === context.contextKey ? 'active' : ''
                    }`}
                    onClick={() => setSelectedContextKey(context.contextKey)}
                  >
                    {context.competitionName} • {context.division}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="stats-grid">
            <StatCard label="Average" value={formatNumber(player.chuckAverage, 2)} />
            <StatCard label="Win %" value={formatPercent(player.winPercentage)} />
            <StatCard label="Played" value={player.singlesPlayed} />
            <StatCard label="Won" value={player.singlesWon} />
          </div>

          <section className="panel premium-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                {player.competitionName} • {player.division} Stats
              </h3>

              <Link to={backLink} className="panel-link">
                {backLabel}
              </Link>
            </div>

            <div className="profile-stat-grid">
              <div className="profile-stat-row">
                <span>Total Score</span>
                <strong>{player.total}</strong>
              </div>

              <div className="profile-stat-row">
                <span>Darts Used</span>
                <strong>{player.dartsUsed}</strong>
              </div>

              <div className="profile-stat-row">
                <span>Tons</span>
                <strong>{player.noTons}</strong>
              </div>

              <div className="profile-stat-row">
                <span>180s</span>
                <strong>{player.oneEighties}</strong>
              </div>

              <div className="profile-stat-row">
                <span>171s</span>
                <strong>{player.oneSeventyOnes}</strong>
              </div>

              <div className="profile-stat-row">
                <span>Highest Close</span>
                <strong>{player.highestClose}</strong>
              </div>

              <div className="profile-stat-row">
                <span>Ranking Score</span>
                <strong>{formatNumber(player.rankingWeighted, 3)}</strong>
              </div>

              <div className="profile-stat-row">
                <span>Player of the Match</span>
                <strong>{player.playerOfMatch}</strong>
              </div>
            </div>
            </section>

<section className="panel premium-panel">
  <div className="panel-header">
    <h3 className="panel-title">Recent Matches</h3>
  </div>

  {!recentMatches.length ? (
    <p className="muted-text">No recent match data found for this player.</p>
  ) : (
    <div className="recent-matches-list">
      {recentMatches.map((match, index) => (
        <Link
          key={`${match.fixtureId}-${match.opponentName}-${index}`}
          to={`/competition/fixtures/${match.fixtureId}`}
          className="recent-match-row"
        >
          <div>
            <div className="recent-match-title">
            vs {resolvePlayerDisplayName(match.opponentName) || 'Unknown Opponent'}
            </div>
            <div className="muted-text">
              {match.date} • {match.competitionName} • {match.division}
            </div>
          </div>

          <div className="recent-match-stats">
            <span className={match.result === 'Won' ? 'result-win' : 'result-loss'}>
              {match.result}
            </span>
            <span>Avg {formatNumber(match.average, 2)}</span>
            <span>Tons {match.tons}</span>
            <span>180s {match.oneEighties}</span>
            <span>H/C {match.highestClose}</span>
          </div>
        </Link>
      ))}
    </div>
  )}
          </section>

          <section className="panel premium-panel">
            <div className="panel-header">
              <h3 className="panel-title">Head-to-Head</h3>
            </div>

            {!headToHead.length ? (
              <p className="muted-text">No head-to-head data found for this player.</p>
            ) : (
              <div className="head-to-head-list">
                {headToHead.map((opponent) => (
                  <div key={opponent.opponentName} className="head-to-head-row">
                    <div>
                      <div className="head-to-head-title">
                      vs {resolvePlayerDisplayName(opponent.opponentName)}
                      </div>
                      <div className="muted-text">
                        {opponent.played} matches played
                      </div>
                    </div>

                    <div className="head-to-head-stats">
                      <span className="result-win">W {opponent.won}</span>
                      <span className="result-loss">L {opponent.lost}</span>
                      <span>{formatPercent(opponent.winPercentage)}</span>
                      <span>Avg {formatNumber(opponent.averageVsOpponent, 2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}