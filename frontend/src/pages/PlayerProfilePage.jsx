import { useParams, Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { importedRankingsData } from '../data/importedRankingsData';

function getAllPlayers() {
  const players = [];

  Object.entries(importedRankingsData.divisions || {}).forEach(([divisionName, division]) => {
    [...(division.qualified || []), ...(division.alsoPlayed || [])].forEach((player) => {
      players.push({
        ...player,
        division: divisionName
      });
    });
  });

  return players;
}

function findPlayer(playerId) {
  return getAllPlayers().find((player) => player.playerId === playerId) || null;
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

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

function PlayerDirectory({ returnPath }) {
  const players = getAllPlayers();
  const clubs = groupPlayersByClub(players);

  return (
    <div className="page-stack player-profile-page">
      <PageHeader
        title="Player Profiles"
        subtitle="Browse players by club and open their individual profile."
      />

      <div className="club-directory-grid">
        {Object.entries(clubs).map(([clubName, clubPlayers]) => (
          <section key={clubName} className="panel premium-panel club-directory-card">
            <h3 className="panel-title club-directory-title">
  {clubName}
  <span className="club-member-count">
    ({clubPlayers.length})
  </span>
</h3>

            <div className="club-player-list">
              {clubPlayers
                .sort((a, b) => a.playerName.localeCompare(b.playerName))
                .map((player) => (
                  <Link
  key={player.playerId}
  to={`/player/${player.playerId}`}
  state={{ from: 'profiles', returnTo: returnPath }}
  className="club-player-link"
>
                    <span>{player.playerName}</span>
                    <span>{player.division}</span>
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

const backLabel = cameFromRankings
  ? 'Back to rankings'
  : 'Back to player profiles';

  if (!playerId) {
    return <PlayerDirectory returnPath={location.pathname} />;
  }

  const player = findPlayer(playerId);

  if (!player) {
    return <PlayerDirectory />;
  }

  return (
    <div className="page-stack player-profile-page">
      <PageHeader
        title={player.playerName}
        subtitle={`${player.clubName || 'No club'} • ${player.division} Division • ${importedRankingsData.season}`}
      />

      <div className="stats-grid">
        <StatCard label="Average" value={formatNumber(player.chuckAverage, 2)} />
        <StatCard label="Win %" value={formatPercent(player.winPercentage)} />
        <StatCard label="Played" value={player.singlesPlayed} />
        <StatCard label="Won" value={player.singlesWon} />
      </div>

      <section className="panel premium-panel">
        <div className="panel-header">
          <h3 className="panel-title">Player Stats</h3>
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
    </div>
  );
}