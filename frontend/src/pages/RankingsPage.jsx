import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { importedRankingsData } from '../data/importedRankingsData';

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
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
            <th>Pos</th>
            <th>Player</th>
            <th>Club</th>
            <th>T/S</th>
            <th>D/U</th>
            <th>Ave</th>
            <th>Tons</th>
            <th>180</th>
            <th>170</th>
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
            <tr key={`${row.position}-${row.playerName}-${row.clubName}`}>
              <td>{row.position}</td>
              <td className="player-name-cell">{row.playerName}</td>
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

        <div className="rankings-section-heading also-played-heading">
          <h3>Also Played</h3>
          <p>Players with less than 50% legs played.</p>
        </div>

        <RankingsTable rows={divisionData.alsoPlayed} />
      </section>
    </div>
  );
}