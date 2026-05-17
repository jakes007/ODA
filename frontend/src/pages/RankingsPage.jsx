import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { importedRankingsData } from '../data/importedRankingsData';

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

function getPlayerHighlights(rows) {
  if (!rows.length) return [];

  const highestAverage = [...rows].sort((a, b) => b.chuckAverage - a.chuckAverage)[0];
  const bestWinRate = [...rows].sort((a, b) => b.winPercentage - a.winPercentage)[0];
  const mostTons = [...rows].sort((a, b) => b.noTons - a.noTons)[0];
  const highClose = [...rows].sort((a, b) => b.highestClose - a.highestClose)[0];

  return [
    {
      label: 'Highest Average',
      value: highestAverage.playerName,
      meta: formatNumber(highestAverage.chuckAverage, 2)
    },
    {
      label: 'Best Win %',
      value: bestWinRate.playerName,
      meta: formatPercent(bestWinRate.winPercentage)
    },
    {
      label: 'Most Tons',
      value: mostTons.playerName,
      meta: `${mostTons.noTons} tons`
    },
    {
      label: 'Highest Close',
      value: highClose.playerName,
      meta: highClose.highestClose || 0
    }
  ];
}

function RankingsTable({ rows }) {
  if (!rows.length) {
    return <p className="muted-text">No rankings available.</p>;
  }

  return (
    <div className="rankings-table-wrap">
      <table className="rankings-table">
        <thead>
          <tr>
          <th className="ranking-movement-col">Move</th>
<th>#</th>
            <th>Player</th>
            <th>Club</th>
            <th>T/S</th>
            <th>D/U</th>
            <th>Ave</th>
            <th>Tons</th>
            <th>180</th>
            <th>171</th>
            <th>H/C</th>
            <th>P</th>
            <th>W</th>
            <th>Win %</th>
            <th>Ranking</th>
            <th>POTM</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={`${row.position}-${row.playerId}-${row.playerName}`}>
              <td className="ranking-movement-col">
  {Number(row.rankMovement || 0) > 0 ? (
    <span className="ranking-arrow-up">
      ▲ {Math.abs(Number(row.rankMovement))}
    </span>
  ) : Number(row.rankMovement || 0) < 0 ? (
    <span className="ranking-arrow-down">
      ▼ {Math.abs(Number(row.rankMovement))}
    </span>
  ) : (
    <span className="ranking-arrow-neutral">–</span>
  )}
</td>
<td>{row.position}</td>
              <td className="player-name-cell">
                <Link
                  to={`/player/${row.playerId}`}
                  state={{ from: 'rankings' }}
                  className="player-profile-link"
                >
                  {row.playerName}
                </Link>
              </td>
              <td>{row.clubName}</td>
              <td>{row.total}</td>
              <td>{row.dartsUsed}</td>
              <td>{formatNumber(row.chuckAverage, 2)}</td>
              <td>{row.noTons}</td>
              <td>{row.oneEighties}</td>
              <td>{row.oneSeventyOnes}</td>
              <td>{row.highestClose}</td>
              <td>{row.singlesPlayed}</td>
              <td>{row.singlesWon}</td>
              <td>{formatPercent(row.winPercentage)}</td>
              <td className="ranking-score-cell">{formatNumber(row.rankingWeighted, 3)}</td>
              <td>{row.playerOfMatch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RankingsPage() {
  const [division, setDivision] = useState('Upper');

  const divisionData = importedRankingsData.divisions[division] || {
    qualified: [],
    alsoPlayed: []
  };

  const highlights = getPlayerHighlights(divisionData.qualified);

  return (
    <div className="rankings-page">
      <PageHeader
        title="Player Rankings"
        subtitle={`${importedRankingsData.season} ${division} ${importedRankingsData.competitionName}`}
      />

      <section className="panel premium-panel rankings-panel">
        <div className="rankings-controls">
          <button
            type="button"
            className={`rankings-filter-btn ${division === 'Upper' ? 'active' : ''}`}
            onClick={() => setDivision('Upper')}
          >
            Upper Division
          </button>

          <button
            type="button"
            className={`rankings-filter-btn ${division === 'Lower' ? 'active' : ''}`}
            onClick={() => setDivision('Lower')}
          >
            Lower Division
          </button>
        </div>

        <div className="rankings-section-heading">
          <h3>{division} Rankings</h3>
          <p>Ranked using 70% average and 30% win percentage.</p>
        </div>

        <RankingsTable rows={divisionData.qualified} />

        <div className="insight-grid">
          {highlights.map((item) => (
            <div key={item.label} className="insight-card">
              <div className="insight-label">{item.label}</div>
              <div className="insight-value">{item.value}</div>
              <div className="insight-meta">{item.meta}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}