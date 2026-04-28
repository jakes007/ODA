import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { importedStandingsData } from '../data/importedStandingsData';

function formatTeamName(teamName) {
  return String(teamName || '').replace(/^BOO\b/i, 'Best Of Order');
}

function getDivisionInsights(rows) {
  if (!rows.length) return [];

  const bestAttack = [...rows].sort((a, b) => b.legsFor - a.legsFor)[0];
  const bestDefense = [...rows].sort((a, b) => a.legsAgainst - b.legsAgainst)[0];
  const biggestDiff = [...rows].sort((a, b) => b.scoreDifference - a.scoreDifference)[0];
  const leader = rows[0];

  return [
    {
      label: 'Division Leader',
      value: formatTeamName(leader.teamName),
      meta: `${leader.leaguePoints} pts`
    },
    {
      label: 'Best Attack',
      value: formatTeamName(bestAttack.teamName),
      meta: `${bestAttack.legsFor} legs for`
    },
    {
      label: 'Best Defense',
      value: formatTeamName(bestDefense.teamName),
      meta: `${bestDefense.legsAgainst} legs against`
    },
    {
      label: 'Best Difference',
      value: formatTeamName(biggestDiff.teamName),
      meta: `+${biggestDiff.scoreDifference}`
    }
  ];
}

export default function StandingsPage() {
  const [division, setDivision] = useState('Upper');

  const rows = importedStandingsData.divisions[division] || [];
  const insights = getDivisionInsights(rows);

  return (
    <div className="standings-page">
      <PageHeader
        title="Standings"
        subtitle={`${importedStandingsData.season} ${division} ${importedStandingsData.competitionName}`}
      />

      <section className="panel premium-panel standings-panel">
        <div className="standings-controls">
          <button
            type="button"
            className={`standings-filter-btn ${division === 'Upper' ? 'active' : ''}`}
            onClick={() => setDivision('Upper')}
          >
            Upper Division
          </button>

          <button
            type="button"
            className={`standings-filter-btn ${division === 'Lower' ? 'active' : ''}`}
            onClick={() => setDivision('Lower')}
          >
            Lower Division
          </button>
        </div>

        <div className="standings-table-wrap">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>GP</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>For</th>
                <th>Agst</th>
                <th>Diff</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={`${division}-${row.teamName}`}>
                  <td>{row.position}</td>
                  <td className="team-name-cell">{formatTeamName(row.teamName)}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.legsFor}</td>
                  <td>{row.legsAgainst}</td>
                  <td>{row.scoreDifference}</td>
                  <td className="points-cell">{row.leaguePoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="insight-grid">
          {insights.map((item) => (
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