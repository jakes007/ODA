function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function matchesFilter(row, filters = {}) {
  const season = cleanString(filters.season);
  const tournament = cleanString(filters.tournament);
  const division = cleanString(filters.division);

  if (season && cleanString(row.season) !== season) return false;
  if (tournament && cleanString(row.tournament) !== tournament) return false;
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
    (result) =>
      result.competitionId === competitionId &&
      matchesFilter(result, filters)
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
  const teamIds = new Set();

  teamResults.forEach((result) => {
    if (result.teamId) {
      teamIds.add(result.teamId);
    }
  });

  return Object.values(registry.teams).filter((team) => teamIds.has(team.teamId));
}

export function buildCompetitionStandings(registry, competitionId, filters = {}) {
  const competition = registry.competitions[competitionId];

  if (!competition) {
    return {
      success: false,
      reason: 'Competition not found'
    };
  }

  const teams = getTeamsFromTeamResults(registry, competitionId, filters);
  const teamResults = getCompetitionTeamResults(registry, competitionId, filters);

  const standingsMap = {};

  teams.forEach((team) => {
    standingsMap[team.teamId] = buildTeamStatsRow(team);
  });

  const processed = new Set();

  teamResults.forEach((result) => {
    const teamName = cleanString(result.teamName);
    const opponentTeamName = cleanString(result.opponentTeamName);
    const date = cleanString(result.matchDate);
    const tournament = cleanString(result.tournament);
    const division = cleanString(result.division);

    const pairKey = [
      date,
      tournament,
      division,
      teamName,
      opponentTeamName
    ]
      .sort()
      .join('::');

    if (!teamName || !opponentTeamName || processed.has(pairKey)) {
      return;
    }

    const reverse = teamResults.find(
      (item) =>
        cleanString(item.matchDate) === date &&
        cleanString(item.tournament) === tournament &&
        cleanString(item.division) === division &&
        cleanString(item.teamName) === opponentTeamName &&
        cleanString(item.opponentTeamName) === teamName
    );

    if (!reverse) return;

    processed.add(pairKey);

    const teamA = teams.find((team) => cleanString(team.name) === teamName);
    const teamB = teams.find((team) => cleanString(team.name) === opponentTeamName);

    if (!teamA || !teamB) return;

    const teamAStanding = standingsMap[teamA.teamId];
    const teamBStanding = standingsMap[teamB.teamId];

    const teamAPoints = toNumber(result.metrics?.points || result.metrics?.singlesWon);
    const teamBPoints = toNumber(reverse.metrics?.points || reverse.metrics?.singlesWon);

    const teamALegsWon = toNumber(result.metrics?.legsWon);
    const teamBLegsWon = toNumber(reverse.metrics?.legsWon);

    const teamALegsLost = toNumber(result.metrics?.legsLost);
    const teamBLegsLost = toNumber(reverse.metrics?.legsLost);

    teamAStanding.played += 1;
    teamBStanding.played += 1;

    teamAStanding.matchPointsFor += teamAPoints;
    teamAStanding.matchPointsAgainst += teamBPoints;

    teamBStanding.matchPointsFor += teamBPoints;
    teamBStanding.matchPointsAgainst += teamAPoints;

    teamAStanding.legsWon += teamALegsWon;
    teamAStanding.legsLost += teamALegsLost;

    teamBStanding.legsWon += teamBLegsWon;
    teamBStanding.legsLost += teamBLegsLost;

    if (teamAPoints > teamBPoints) {
      teamAStanding.won += 1;
      teamBStanding.lost += 1;
      teamAStanding.leaguePoints += 2;
    } else if (teamBPoints > teamAPoints) {
      teamBStanding.won += 1;
      teamAStanding.lost += 1;
      teamBStanding.leaguePoints += 2;
    } else {
      teamAStanding.drawn += 1;
      teamBStanding.drawn += 1;
      teamAStanding.leaguePoints += 1;
      teamBStanding.leaguePoints += 1;
    }
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