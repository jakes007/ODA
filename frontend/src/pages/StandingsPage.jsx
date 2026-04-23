import React from 'react';
import PageHeader from '../components/common/PageHeader';
import { standingsData } from '../data/standingsData';
import { formatStandingRow, getPositionBadgeClass } from '../utils/standingsUtils';

export default function StandingsPage() {
  const rows = standingsData.map(formatStandingRow);

  return (
    <div className="standings-page">
      <PageHeader
        title="Standings"
        subtitle="Current 2026 league table"
      />

      <section className="panel premium-panel standings-panel">
        <div className="standings-table-wrap">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>Diff</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={`${row.position}-${row.teamName}`}>
                  <td>
                    <span className={getPositionBadgeClass(row.position)}>
                      {row.position}
                    </span>
                  </td>
                  <td className="team-name-cell">{row.teamName}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
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