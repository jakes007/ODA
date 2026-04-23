export function getPositionBadgeClass(position) {
    if (position === 1) return 'position-badge gold';
    if (position === 2) return 'position-badge silver';
    if (position === 3) return 'position-badge bronze';
    return 'position-badge';
  }
  
  export function formatStandingRow(row) {
    return {
      ...row,
      played: Number(row.played || 0),
      won: Number(row.won || 0),
      drawn: Number(row.drawn || 0),
      lost: Number(row.lost || 0),
      leaguePoints: Number(row.leaguePoints || 0),
      scoreDifference: Number(row.scoreDifference || 0)
    };
  }