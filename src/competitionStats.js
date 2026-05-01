function cleanString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  
  function toNumber(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
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
      matchesPlayed: 0,
      statRowsCount: 0,
      totalAverage: 0,
      average: 0,
      dartsUsed: 0,
      tons: 0,
      oneEighties: 0,
      legsPlayed: 0,
      legsWon: 0,
      points: 0
    };
  }
  
  function getCompetitionTeams(registry, competitionId) {
    return Object.values(registry.teams).filter(
      (team) => team.competitionId === competitionId
    );
  }
  
  function getCompetitionStatsRows(registry, competitionId) {
    return Object.values(registry.historicalStatsNormalized).filter(
      (stat) => stat.competitionId === competitionId
    );
  }
  
  function groupStatsByMatchDateAndTeam(statsRows) {
    const grouped = {};
  
    statsRows.forEach((row) => {
      const matchDate = cleanString(row.matchDate) || 'unknown_date';
      const teamName = cleanString(row.teamName) || 'unknown_team';
      const opponentTeamName = cleanString(row.opponentTeamName) || 'unknown_opponent';
  
      const key = [matchDate, teamName, opponentTeamName].join('::');
  
      if (!grouped[key]) {
        grouped[key] = [];
      }
  
      grouped[key].push(row);
    });
  
    return grouped;
  }
  
  function ensureStandingsRow(standingsMap, team) {
    if (!standingsMap[team.teamId]) {
      standingsMap[team.teamId] = buildTeamStatsRow(team);
    }
  
    return standingsMap[team.teamId];
  }
  
  function compareStandingsRows(a, b) {
    if (b.leaguePoints !== a.leaguePoints) {
      return b.leaguePoints - a.leaguePoints;
    }
  
    if (b.scoreDifference !== a.scoreDifference) {
      return b.scoreDifference - a.scoreDifference;
    }
  
    if (b.matchPointsFor !== a.matchPointsFor) {
      return b.matchPointsFor - a.matchPointsFor;
    }
  
    return a.teamName.localeCompare(b.teamName);
  }
  
  function compareRankingRows(a, b) {
    if (b.average !== a.average) {
      return b.average - a.average;
    }
  
    if (b.points !== a.points) {
      return b.points - a.points;
    }
  
    if (b.legsWon !== a.legsWon) {
      return b.legsWon - a.legsWon;
    }
  
    return a.displayName.localeCompare(b.displayName);
  }
  
  // ============================================
  // COMPETITION STANDINGS
  // ============================================
  
  export function buildCompetitionStandings(registry, competitionId) {
    const competition = registry.competitions[competitionId];
  
    if (!competition) {
      return {
        success: false,
        reason: 'Competition not found'
      };
    }
  
    const teams = getCompetitionTeams(registry, competitionId);
    const statsRows = getCompetitionStatsRows(registry, competitionId);
  
    const standingsMap = {};
  
    teams.forEach((team) => {
      standingsMap[team.teamId] = buildTeamStatsRow(team);
    });
  
    const groupedMatches = groupStatsByMatchDateAndTeam(statsRows);
    const processedMatchKeys = new Set();
  
    Object.keys(groupedMatches).forEach((groupKey) => {
      if (processedMatchKeys.has(groupKey)) {
        return;
      }
  
      const rows = groupedMatches[groupKey];
      if (!rows.length) {
        return;
      }
  
      const firstRow = rows[0];
      const teamName = cleanString(firstRow.teamName);
      const opponentTeamName = cleanString(firstRow.opponentTeamName);
      const matchDate = cleanString(firstRow.matchDate) || 'unknown_date';
  
      const reverseKey = [matchDate, opponentTeamName, teamName].join('::');
  
      processedMatchKeys.add(groupKey);
      processedMatchKeys.add(reverseKey);
  
      const homeTeam = teams.find((team) => cleanString(team.name) === teamName);
      const awayTeam = teams.find(
        (team) => cleanString(team.name) === opponentTeamName
      );
  
      if (!homeTeam || !awayTeam) {
        return;
      }
  
      const homeRows = groupedMatches[groupKey] ?? [];
      const awayRows = groupedMatches[reverseKey] ?? [];
  
      const homePoints = homeRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.points),
        0
      );
      const awayPoints = awayRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.points),
        0
      );
  
      const homeLegsWon = homeRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.legsWon),
        0
      );
      const awayLegsWon = awayRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.legsWon),
        0
      );
  
      const homeLegsPlayed = homeRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.legsPlayed),
        0
      );
      const awayLegsPlayed = awayRows.reduce(
        (sum, row) => sum + toNumber(row.metrics?.legsPlayed),
        0
      );
  
      const homeLegsLost = Math.max(homeLegsPlayed - homeLegsWon, 0);
      const awayLegsLost = Math.max(awayLegsPlayed - awayLegsWon, 0);
  
      const homeStanding = ensureStandingsRow(standingsMap, homeTeam);
      const awayStanding = ensureStandingsRow(standingsMap, awayTeam);
  
      homeStanding.played += 1;
      awayStanding.played += 1;
  
      homeStanding.matchPointsFor += homePoints;
      homeStanding.matchPointsAgainst += awayPoints;
  
      awayStanding.matchPointsFor += awayPoints;
      awayStanding.matchPointsAgainst += homePoints;
  
      homeStanding.legsWon += homeLegsWon;
      homeStanding.legsLost += homeLegsLost;
  
      awayStanding.legsWon += awayLegsWon;
      awayStanding.legsLost += awayLegsLost;
  
      if (homePoints > awayPoints) {
        homeStanding.won += 1;
        awayStanding.lost += 1;
        homeStanding.leaguePoints += 2;
      } else if (awayPoints > homePoints) {
        awayStanding.won += 1;
        homeStanding.lost += 1;
        awayStanding.leaguePoints += 2;
      } else {
        homeStanding.drawn += 1;
        awayStanding.drawn += 1;
        homeStanding.leaguePoints += 1;
        awayStanding.leaguePoints += 1;
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
      standings
    };
  }
  
  // ============================================
  // PLAYER RANKINGS
  // ============================================
  
  export function buildCompetitionPlayerRankings(registry, competitionId) {
    const competition = registry.competitions[competitionId];
  
    if (!competition) {
      return {
        success: false,
        reason: 'Competition not found'
      };
    }
  
    const statsRows = getCompetitionStatsRows(registry, competitionId);
    const rankingsMap = {};
  
    statsRows.forEach((row) => {
      const player = registry.players[row.playerId];
      if (!player) {
        return;
      }
  
      if (!rankingsMap[player.playerId]) {
        rankingsMap[player.playerId] = buildPlayerRankingRow(player);
      }
  
      const rankingRow = rankingsMap[player.playerId];
  
      rankingRow.teamId = row.teamId ?? rankingRow.teamId;
      rankingRow.teamName = row.teamName || rankingRow.teamName;
  
      rankingRow.statRowsCount += 1;
      rankingRow.totalAverage += toNumber(row.metrics?.average);
      rankingRow.dartsUsed += toNumber(row.metrics?.dartsUsed);
      rankingRow.tons += toNumber(row.metrics?.tons);
      rankingRow.oneEighties += toNumber(row.metrics?.oneEighties);
      rankingRow.legsPlayed += toNumber(row.metrics?.legsPlayed);
      rankingRow.legsWon += toNumber(row.metrics?.legsWon);
      rankingRow.points += toNumber(row.metrics?.points);
    });
  
    const rankings = Object.values(rankingsMap)
      .map((row) => {
        const average =
          row.statRowsCount > 0 ? row.totalAverage / row.statRowsCount : 0;
  
        return {
          ...row,
          average: Number(average.toFixed(2)),
          matchesPlayed: row.statRowsCount
        };
      })
      .sort(compareRankingRows)
      .map((row, index) => ({
        position: index + 1,
        ...row
      }));
  
    return {
      success: true,
      competition,
      rankings
    };
  }
  
  // ============================================
  // PLAYER HISTORY
  // ============================================
  
  export function buildPlayerCompetitionHistory(registry, playerId, competitionId) {
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
        (row) => row.playerId === playerId && row.competitionId === competitionId
      )
      .sort((a, b) => {
        const dateA = cleanString(a.matchDate);
        const dateB = cleanString(b.matchDate);
        return dateA.localeCompare(dateB);
      });
  
    const summary = rows.reduce(
      (acc, row) => {
        acc.matchesPlayed += 1;
        acc.totalAverage += toNumber(row.metrics?.average);
        acc.dartsUsed += toNumber(row.metrics?.dartsUsed);
        acc.tons += toNumber(row.metrics?.tons);
        acc.oneEighties += toNumber(row.metrics?.oneEighties);
        acc.legsPlayed += toNumber(row.metrics?.legsPlayed);
        acc.legsWon += toNumber(row.metrics?.legsWon);
        acc.points += toNumber(row.metrics?.points);
        return acc;
      },
      {
        matchesPlayed: 0,
        totalAverage: 0,
        average: 0,
        dartsUsed: 0,
        tons: 0,
        oneEighties: 0,
        legsPlayed: 0,
        legsWon: 0,
        points: 0
      }
    );
  
    summary.average =
      summary.matchesPlayed > 0
        ? Number((summary.totalAverage / summary.matchesPlayed).toFixed(2))
        : 0;
  
    return {
      success: true,
      player,
      competition,
      summary,
      rows
    };
  }