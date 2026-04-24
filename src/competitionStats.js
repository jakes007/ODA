function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function matchesFilter(row, filters = {}) {
  const season = cleanString(filters.season);
  const league = cleanString(filters.league);
  const division = cleanString(filters.division);

  if (season && cleanString(row.season) !== season) return false;
  if (league && cleanString(row.league) !== league) return false;
  if (division && cleanString(row.division) !== division) return false;

  return true;
}

function buildTeamStatsRow(team) {
  return {
    teamId: team.teamId,
    teamName: team.name,
    clubId: team.clubId ?? '',
    clubName: team.clubName ?? '',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    leaguePoints: 0,
    matchPointsFor: 0,
    matchPointsAgainst: 0,
    legsWon: 0,
    legsLost: 0,
    scoreDifference: 0
  };
}

function buildPlayerRankingRow(player) {
  return {
    playerId: player.playerId,
    displayName: player.callingName || player.fullName,
    fullName: player.fullName,
    dsaNumber: player.dsaNumber,
    clubId: player.clubId ?? '',
    clubName: player.clubName ?? '',
    teamId: '',
    teamName: '',
    rowCount: 0,
    rankingTotal: 0,
    rankingCount: 0,
    rankingAverage: 0,
    dartsUsed: 0,
    tons: 0,
    oneEighties: 0,
    singlesPlayed: 0,
    singlesWon: 0,
    winRate: 0,
    leaderboardScore: 0
  };
}

function compareStandingsRows(a, b) {
  if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
  if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
  if (b.matchPointsFor !== a.matchPointsFor) return b.matchPointsFor - a.matchPointsFor;
  return a.teamName.localeCompare(b.teamName);
}

function compareRankingRows(a, b) {
  if (b.leaderboardScore !== a.leaderboardScore) {
    return b.leaderboardScore - a.leaderboardScore;
  }

  if (b.singlesWon !== a.singlesWon) {
    return b.singlesWon - a.singlesWon;
  }

  return a.displayName.localeCompare(b.displayName);
}

function getCompetitionTeamResults(registry, competitionId, filters = {}) {
  return Object.values(registry.historicalTeamResultsNormalized).filter(
    (result) => matchesFilter(result, filters)
  );
}

function getCompetitionStatsRows(registry, competitionId, filters = {}) {
  return Object.values(registry.historicalStatsNormalized).filter(
    (stat) =>
      stat.competitionId === competitionId &&
      matchesFilter(stat, filters)
  );
}

function getTeamsFromTeamResults(registry, competitionId, filters = {}) {
  const teamResults = getCompetitionTeamResults(registry, competitionId, filters);
  const teamsByName = {};

  teamResults.forEach((result) => {
    const teamName = cleanString(result.teamName);
    const opponentTeamName = cleanString(result.opponentTeamName);

    if (teamName && !teamsByName[teamName]) {
      teamsByName[teamName] =
        Object.values(registry.teams).find(
          (team) => cleanString(team.name) === teamName
        ) || {
          teamId: `virtual_${teamName}`,
          name: teamName,
          clubId: '',
          clubName: ''
        };
    }

    if (opponentTeamName && !teamsByName[opponentTeamName]) {
      teamsByName[opponentTeamName] =
        Object.values(registry.teams).find(
          (team) => cleanString(team.name) === opponentTeamName
        ) || {
          teamId: `virtual_${opponentTeamName}`,
          name: opponentTeamName,
          clubId: '',
          clubName: ''
        };
    }
  });

  return Object.values(teamsByName);
}

export function buildCompetitionStandings(registry, competitionId, filters = {}) {
  const competition = registry.competitions[competitionId];

  if (!competition) {
    return {
      success: false,
      reason: 'Competition not found'
    };
  }

  const teamResults = getCompetitionTeamResults(registry, competitionId, filters);
  const standingsMap = {};

  teamResults.forEach((result) => {
    const teamName = cleanString(result.teamName);

    if (!teamName) return;

    if (!standingsMap[teamName]) {
      standingsMap[teamName] = {
        teamId: result.teamId || `virtual_${teamName}`,
        teamName,
        clubId: result.clubId || '',
        clubName: result.clubName || '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        leaguePoints: 0,
        matchPointsFor: 0,
        matchPointsAgainst: 0,
        legsWon: 0,
        legsLost: 0,
        scoreDifference: 0
      };
    }

    const row = standingsMap[teamName];
    const metrics = result.metrics || {};

    const gp = toNumber(metrics.gp);
    const wins = toNumber(metrics.wins);
    const draws = toNumber(metrics.draws);
    const losses = toNumber(metrics.losses);
    const points = toNumber(metrics.points);

    const legsFor =
      toNumber(metrics.legsWon) ||
      toNumber(metrics.singlesWon);

    const legsAgainst =
      toNumber(metrics.legsLost) ||
      toNumber(metrics.legsAgainst);

    row.played += gp || 1;
    row.won += wins;
    row.drawn += draws;
    row.lost += losses;
    row.leaguePoints += points;

    row.matchPointsFor += legsFor;
    row.matchPointsAgainst += legsAgainst;

    row.legsWon += legsFor;
    row.legsLost += legsAgainst;
  });

  const standings = Object.values(standingsMap)
    .map((row) => ({
      ...row,
      scoreDifference: row.matchPointsFor - row.matchPointsAgainst
    }))
    .sort(compareStandingsRows)
    .map((row, index) => ({
      position: index + 1,
      ...row
    }));

  return {
    success: true,
    competition,
    filters,
    standings
  };
}

export function buildCompetitionPlayerRankings(registry, competitionId, filters = {}) {
  const competition = registry.competitions[competitionId];

  if (!competition) {
    return {
      success: false,
      reason: 'Competition not found'
    };
  }

  const statsRows = getCompetitionStatsRows(registry, competitionId, filters);
  const rankingsMap = {};

  statsRows.forEach((row) => {
    const player = registry.players[row.playerId];
    if (!player) return;

    if (!rankingsMap[player.playerId]) {
      rankingsMap[player.playerId] = buildPlayerRankingRow(player);
    }

    const rankingRow = rankingsMap[player.playerId];

    rankingRow.teamId = row.teamId ?? rankingRow.teamId;
    rankingRow.teamName = row.teamName || rankingRow.teamName;
    rankingRow.rowCount += 1;

    const rankingValue = Number(row.metrics?.ranking);
    if (Number.isFinite(rankingValue) && rankingValue > 0) {
      rankingRow.rankingTotal += rankingValue;
      rankingRow.rankingCount += 1;
    }

    rankingRow.dartsUsed += toNumber(row.metrics?.dartsUsed);
    rankingRow.tons += toNumber(row.metrics?.tons);
    rankingRow.oneEighties += toNumber(row.metrics?.oneEighties);
    rankingRow.singlesPlayed += toNumber(row.metrics?.singlesPlayed);
    rankingRow.singlesWon += toNumber(row.metrics?.singlesWon);
  });

  const rankings = Object.values(rankingsMap)
    .map((row) => {
      row.rankingAverage =
        row.rankingCount > 0
          ? Number((row.rankingTotal / row.rankingCount).toFixed(2))
          : 0;

      row.winRate =
        row.singlesPlayed > 0
          ? Number(((row.singlesWon / row.singlesPlayed) * 100).toFixed(2))
          : 0;

      row.leaderboardScore = Number(
        (
          row.rankingAverage * 0.5 +
          row.winRate * 0.3 +
          row.tons * 2 +
          row.oneEighties * 5
        ).toFixed(2)
      );

      return row;
    })
    .sort(compareRankingRows)
    .map((row, index) => ({
      position: index + 1,
      ...row
    }));

  return {
    success: true,
    competition,
    filters,
    rankings
  };
}

export function buildPlayerCompetitionHistory(registry, playerId, competitionId, filters = {}) {
  const player = registry.players[playerId];

  if (!player) {
    return {
      success: false,
      reason: 'Player not found'
    };
  }

  const competition = registry.competitions[competitionId];

  if (!competition) {
    return {
      success: false,
      reason: 'Competition not found'
    };
  }

  const rows = Object.values(registry.historicalStatsNormalized)
    .filter(
      (row) =>
        row.playerId === playerId &&
        row.competitionId === competitionId &&
        matchesFilter(row, filters)
    )
    .sort((a, b) => cleanString(a.matchDate).localeCompare(cleanString(b.matchDate)));

  const summary = rows.reduce(
    (acc, row) => {
      const rankingValue = Number(row.metrics?.ranking);

      if (Number.isFinite(rankingValue) && rankingValue > 0) {
        acc.rankingTotal += rankingValue;
        acc.rankingCount += 1;
      }

      acc.rowCount += 1;
      acc.dartsUsed += toNumber(row.metrics?.dartsUsed);
      acc.tons += toNumber(row.metrics?.tons);
      acc.oneEighties += toNumber(row.metrics?.oneEighties);
      acc.singlesPlayed += toNumber(row.metrics?.singlesPlayed);
      acc.singlesWon += toNumber(row.metrics?.singlesWon);

      return acc;
    },
    {
      rowCount: 0,
      rankingTotal: 0,
      rankingCount: 0,
      rankingAverage: 0,
      dartsUsed: 0,
      tons: 0,
      oneEighties: 0,
      singlesPlayed: 0,
      singlesWon: 0,
      winRate: 0
    }
  );

  summary.rankingAverage =
    summary.rankingCount > 0
      ? Number((summary.rankingTotal / summary.rankingCount).toFixed(2))
      : 0;

  summary.winRate =
    summary.singlesPlayed > 0
      ? Number(((summary.singlesWon / summary.singlesPlayed) * 100).toFixed(2))
      : 0;

  return {
    success: true,
    player,
    competition,
    filters,
    summary,
    rows
  };
}