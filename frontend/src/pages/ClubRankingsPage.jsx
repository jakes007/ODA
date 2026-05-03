import { useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import { importedRankingsData } from '../data/importedRankingsData';
import './ClubRankings.css';
import { Link } from 'react-router-dom';

function getAllRankingPlayers() {
  const divisions = importedRankingsData.divisions || {};

  return Object.values(divisions).flatMap((division) => [
    ...(division.qualified || []),
    ...(division.alsoPlayed || [])
  ]);
}

function formatNumber(value) {
  return Number(value || 0).toFixed(2);
}

export default function ClubRankingsPage() {
  const clubData = useMemo(() => {
    const clubMap = new Map();

    getAllRankingPlayers().forEach((player) => {
      const clubName = player.clubName || 'Unknown Club';

      if (!clubMap.has(clubName)) {
        clubMap.set(clubName, []);
      }

      clubMap.get(clubName).push(player);
    });

    return Array.from(clubMap.entries())
      .sort(([clubA], [clubB]) => clubA.localeCompare(clubB))
      .map(([clubName, players]) => ({
        clubName,
        players: players
          .slice()
          .sort((a, b) => Number(b.rankingWeighted || 0) - Number(a.rankingWeighted || 0))
      }));
  }, []);

  return (
    <div className="page-stack club-rankings-page">
      <PageHeader
        title="Club Rankings"
        subtitle={`${importedRankingsData.competitionName} • ${importedRankingsData.season} • All divisions`}
      />

      <div className="club-rankings-list">
        {clubData.map((club) => (
          <section key={club.clubName} className="panel premium-panel club-ranking-card">
            <div className="club-ranking-header">
              <div>
                <h3>{club.clubName}</h3>
                <p>{club.players.length} ranked players</p>
              </div>
            </div>

            <div className="club-table-scroll">
              <table className="club-ranking-table">
                <thead>
                  <tr>
                    <th className="sticky-col sticky-pos">#</th>
                    <th className="sticky-col sticky-player">Player</th>
                    <th>Avg</th>
                    <th>Weighted</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Win %</th>
                    <th>Tons</th>
                    <th>180s</th>
                    <th>171s</th>
                    <th>H/C</th>
                  </tr>
                </thead>

                <tbody>
                  {club.players.map((player, index) => (
                    <tr key={`${club.clubName}-${player.playerId}`}>
                      <td className="sticky-col sticky-pos">{index + 1}</td>
                      <td className="sticky-col sticky-player">
  <Link
    to={`/player/${player.playerId}`}
    state={{
      from: 'club-rankings',
      returnTo: '/competition/club-rankings'
    }}
    className="club-ranking-player-link"
  >
    {player.playerName}
  </Link>
</td>
                      <td className="orange-stat">{formatNumber(player.chuckAverage)}</td>
                      <td>{formatNumber(player.rankingWeighted)}</td>
                      <td>{player.singlesPlayed}</td>
                      <td>{player.singlesWon}</td>
                      <td>{formatNumber(player.winPercentage)}%</td>
                      <td>{player.noTons}</td>
                      <td>{player.oneEighties}</td>
                      <td>{player.oneSeventyOnes}</td>
                      <td>{player.highestClose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}