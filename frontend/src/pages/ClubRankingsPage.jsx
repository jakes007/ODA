import { useMemo, useState } from 'react';
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
  const [openClubs, setOpenClubs] = useState({});

  const clubData = useMemo(() => {
    const clubMap = new Map();
  
    getAllRankingPlayers().forEach((player) => {
      const clubName = player.clubName || 'Unknown Club';
  
      if (!clubMap.has(clubName)) {
        clubMap.set(clubName, new Map());
      }
  
      const playerMap = clubMap.get(clubName);
      const playerKey = player.playerId || player.playerName;
  
      if (!playerMap.has(playerKey)) {
        playerMap.set(playerKey, {
          ...player,
          divisionsPlayed: 1
        });
      } else {
        const existing = playerMap.get(playerKey);
  
        playerMap.set(playerKey, {
          ...existing,
          total: Number(existing.total || 0) + Number(player.total || 0),
          dartsUsed: Number(existing.dartsUsed || 0) + Number(player.dartsUsed || 0),
          noTons: Number(existing.noTons || 0) + Number(player.noTons || 0),
          oneEighties: Number(existing.oneEighties || 0) + Number(player.oneEighties || 0),
          oneSeventyOnes:
            Number(existing.oneSeventyOnes || 0) + Number(player.oneSeventyOnes || 0),
          singlesPlayed:
            Number(existing.singlesPlayed || 0) + Number(player.singlesPlayed || 0),
          singlesWon: Number(existing.singlesWon || 0) + Number(player.singlesWon || 0),
          playerOfMatch:
            Number(existing.playerOfMatch || 0) + Number(player.playerOfMatch || 0),
          highestClose: Math.max(
            Number(existing.highestClose || 0),
            Number(player.highestClose || 0)
          ),
          divisionsPlayed: Number(existing.divisionsPlayed || 1) + 1
        });
      }
    });
  
    return Array.from(clubMap.entries())
      .sort(([clubA], [clubB]) => clubA.localeCompare(clubB))
      .map(([clubName, playerMap]) => ({
        clubName,
        players: Array.from(playerMap.values())
          .map((player) => {
            const chuckAverage =
              Number(player.dartsUsed || 0) > 0
                ? (Number(player.total || 0) / Number(player.dartsUsed || 0)) * 3
                : 0;
  
            const winPercentage =
              Number(player.singlesPlayed || 0) > 0
                ? (Number(player.singlesWon || 0) / Number(player.singlesPlayed || 0)) * 100
                : 0;
  
            const rankingWeighted = chuckAverage * 0.7 + winPercentage * 0.3;
  
            return {
              ...player,
              chuckAverage,
              winPercentage,
              rankingWeighted
            };
          })
          .sort((a, b) => Number(b.rankingWeighted || 0) - Number(a.rankingWeighted || 0))
      }));
  }, []);

  const combinedClubStats = useMemo(() => {
    return clubData
      .map((club) => {
        const oneEighties = club.players.reduce(
          (total, player) => total + Number(player.oneEighties || 0),
          0
        );
  
        const oneSeventyOnes = club.players.reduce(
          (total, player) => total + Number(player.oneSeventyOnes || 0),
          0
        );
  
        const uniquePowerScorers = club.players.filter(
          (player) =>
            Number(player.oneEighties || 0) > 0 ||
            Number(player.oneSeventyOnes || 0) > 0
        ).length;
  
        const totalClubPlayers = club.players.length;
  
        const powerScorerPercentage =
          totalClubPlayers > 0
            ? (uniquePowerScorers / totalClubPlayers) * 100
            : 0;
  
        return {
          clubName: club.clubName,
          oneEighties,
          oneSeventyOnes,
          uniquePowerScorers,
          totalClubPlayers,
          powerScorerPercentage
        };
      })
      .sort((a, b) => {
        if (b.oneEighties !== a.oneEighties) {
          return b.oneEighties - a.oneEighties;
        }
  
        if (b.oneSeventyOnes !== a.oneSeventyOnes) {
          return b.oneSeventyOnes - a.oneSeventyOnes;
        }
  
        return a.clubName.localeCompare(b.clubName);
      });
  }, [clubData]);

  function toggleClub(clubName) {
    setOpenClubs((current) => ({
      ...current,
      [clubName]: !current[clubName]
    }));
  }

  return (
    <div className="page-stack club-rankings-page">
      <PageHeader
        title="Club Rankings"
        subtitle={`${importedRankingsData.competitionName} • ${importedRankingsData.season} • All divisions`}
      />

      <div className="club-rankings-list">
        {clubData.map((club) => {
          const isOpen = Boolean(openClubs[club.clubName]);

          return (
            <section key={club.clubName} className="panel premium-panel club-ranking-card">
              <button
                type="button"
                className="club-ranking-header club-ranking-toggle"
                onClick={() => toggleClub(club.clubName)}
              >
                <div className="club-ranking-header-left">
  <div>
    <h3>{club.clubName}</h3>
    <p>{club.players.length} ranked players</p>
  </div>
</div>

<span className={`club-ranking-chevron ${isOpen ? 'open' : ''}`}>
  ⌄
</span>
              </button>

              {isOpen ? (
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
              ) : null}
            </section>
          );
        })}
      </div>

      <section className="panel premium-panel club-ranking-card">
        <div className="club-ranking-header">
          <div>
            <h3>More Stats</h3>
            <p>Upper & Lower Division - MOST 180's | 171's</p>
          </div>
        </div>

        <div className="club-table-scroll">
          <table className="club-ranking-table">
          <thead>
  <tr>
    <th className="sticky-col sticky-pos">#</th>
    <th className="sticky-col sticky-player">Club</th>
    <th>180s</th>
    <th>171s</th>
    <th>Unique Players</th>
    <th>%</th>
  </tr>
</thead>

<tbody>
  {combinedClubStats.map((club, index) => (
    <tr key={club.clubName}>
      <td className="sticky-col sticky-pos">{index + 1}</td>
      <td className="sticky-col sticky-player">{club.clubName}</td>
      <td className="orange-stat">{club.oneEighties}</td>
      <td>{club.oneSeventyOnes}</td>
      <td>
        {club.uniquePowerScorers} / {club.totalClubPlayers}
      </td>
      <td>{formatNumber(club.powerScorerPercentage)}%</td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}