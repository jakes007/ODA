function createEmptyTeamRow(teamId, teamName) {
    return {
      teamId,
      teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      difference: 0,
      leaguePoints: 0
    };
  }
  
  export function createCompetitionTableStore() {
    return {
      teamStandings: {},
      playerRankings: {}
    };
  }
  
  export function recordFixtureResultForStandings(store, fixtureSummary) {
    const teamAId = fixtureSummary.teamA.teamId;
    const teamBId = fixtureSummary.teamB.teamId;
    const teamAName = fixtureSummary.teamA.name;
    const teamBName = fixtureSummary.teamB.name;
  
    if (!store.teamStandings[teamAId]) {
      store.teamStandings[teamAId] = createEmptyTeamRow(teamAId, teamAName);
    }
  
    if (!store.teamStandings[teamBId]) {
      store.teamStandings[teamBId] = createEmptyTeamRow(teamBId, teamBName);
    }
  
    const rowA = store.teamStandings[teamAId];
    const rowB = store.teamStandings[teamBId];
  
    const scoreA = fixtureSummary.score.teamA;
    const scoreB = fixtureSummary.score.teamB;
  
    rowA.played += 1;
    rowB.played += 1;
  
    rowA.pointsFor += scoreA;
    rowA.pointsAgainst += scoreB;
  
    rowB.pointsFor += scoreB;
    rowB.pointsAgainst += scoreA;
  
    rowA.difference = rowA.pointsFor - rowA.pointsAgainst;
    rowB.difference = rowB.pointsFor - rowB.pointsAgainst;
  
    if (scoreA > scoreB) {
      rowA.won += 1;
      rowB.lost += 1;
      rowA.leaguePoints += 2;
    } else if (scoreB > scoreA) {
      rowB.won += 1;
      rowA.lost += 1;
      rowB.leaguePoints += 2;
    } else {
      rowA.drawn += 1;
      rowB.drawn += 1;
      rowA.leaguePoints += 1;
      rowB.leaguePoints += 1;
    }
  
    return {
      success: true,
      store
    };
  }
  
  export function recordPlayerAggregateForRanking(store, aggregate, competitionId = null) {
    const source = competitionId
      ? aggregate.competitions[competitionId]?.stats
      : aggregate.overall;
  
    if (!source) {
      return {
        success: false,
        store,
        reason: 'No stats found for aggregate in this competition'
      };
    }
  
    store.playerRankings[aggregate.playerId] = {
      playerId: aggregate.playerId,
      displayName: aggregate.displayName,
      matchesPlayed: source.matchesPlayed,
      matchesWon: source.matchesWon,
      matchesLost: source.matchesLost,
      matchesDrawn: source.matchesDrawn,
      threeDartAverage: source.threeDartAverage,
      dartsUsed: source.dartsUsed,
      count100Plus: source.count100Plus,
      count140Plus: source.count140Plus,
      count180s: source.count180s,
      highestCheckout: source.highestCheckout
    };
  
    return {
      success: true,
      store
    };
  }
  
  export function getSortedTeamStandings(store) {
    return Object.values(store.teamStandings).sort((a, b) => {
      if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
      if (b.difference !== a.difference) return b.difference - a.difference;
      return b.pointsFor - a.pointsFor;
    });
  }
  
  export function getSortedPlayerRankings(store) {
    return Object.values(store.playerRankings).sort((a, b) => {
      if (b.threeDartAverage !== a.threeDartAverage) {
        return b.threeDartAverage - a.threeDartAverage;
      }
      if (b.matchesWon !== a.matchesWon) {
        return b.matchesWon - a.matchesWon;
      }
      return b.highestCheckout - a.highestCheckout;
    });
  }
  
  export function printTeamStandings(title, rows) {
    console.log(`\n===== ${title} =====`);
  
    if (!rows.length) {
      console.log('No standings available');
      return;
    }
  
    rows.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.teamName} | P: ${row.played} | W: ${row.won} | D: ${row.drawn} | L: ${row.lost} | PF: ${row.pointsFor} | PA: ${row.pointsAgainst} | Diff: ${row.difference} | Pts: ${row.leaguePoints}`
      );
    });
  }
  
  export function printPlayerRankings(title, rows) {
    console.log(`\n===== ${title} =====`);
  
    if (!rows.length) {
      console.log('No rankings available');
      return;
    }
  
    rows.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.displayName} | Avg: ${row.threeDartAverage} | MP: ${row.matchesPlayed} | W: ${row.matchesWon} | 180s: ${row.count180s} | High CO: ${row.highestCheckout}`
      );
    });
  }