import { useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { importedRankingsData } from '../data/importedRankingsData';
import { importedRegistryData } from '../data/importedRegistryData';

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
  return (
    (importedRegistryData.players || []).find((player) => player.playerId === playerId) ||
    null
  );
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

  return (
    <div className="page-stack player-profile-page">
      <PageHeader
        title="Player Profiles"
        subtitle="Browse all registered players by club."
      />

      <div className="club-directory-grid">
        {Object.entries(clubs).map(([clubName, clubPlayers]) => (
          <section key={clubName} className="panel premium-panel club-directory-card">
            <h3 className="panel-title club-directory-title">
              {clubName}
              <span className="club-member-count">({clubPlayers.length})</span>
            </h3>

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
                  <span>{player.divisionLabel}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  const location = useLocation();

  const cameFromRankings = location.state?.from === 'rankings';

  const backLink = cameFromRankings
    ? '/competition/rankings'
    : location.state?.returnTo || '/player/player_jason';

  const backLabel = cameFromRankings ? 'Back to rankings' : 'Back to player profiles';

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
        </>
      )}
    </div>
  );
}