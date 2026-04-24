import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { importedStandingsData } from '../data/importedStandingsData';

export default function StandingsPage() {
  const [division, setDivision] = useState('Upper');

  const rows = importedStandingsData.divisions[division] || [];

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
                  <td className="team-name-cell">
  {row.teamName.replace(/^BOO\b/i, 'Best Of Order')}
</td>
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
      </section>
    </div>
  );
}