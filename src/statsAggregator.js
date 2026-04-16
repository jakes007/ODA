function createEmptyStatBlock() {
    return {
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      matchesDrawn: 0,
      dartsUsed: 0,
      throws: 0,
      totalScored: 0,
      count100Plus: 0,
      count140Plus: 0,
      count180s: 0,
      highestCheckout: 0,
      threeDartAverage: 0
    };
  }
  
  function recalculateAverage(stats) {
    if (stats.dartsUsed === 0) {
      stats.threeDartAverage = 0;
      return;
    }
  
    stats.threeDartAverage = Number(
      ((stats.totalScored / stats.dartsUsed) * 3).toFixed(2)
    );
  }
  
  function applyPlayerSummaryToStats(stats, playerSummary) {
    stats.matchesPlayed += 1;
  
    if (playerSummary.result === 'win') stats.matchesWon += 1;
    if (playerSummary.result === 'loss') stats.matchesLost += 1;
    if (playerSummary.result === 'draw') stats.matchesDrawn += 1;
  
    stats.dartsUsed += playerSummary.dartsUsed ?? 0;
    stats.throws += playerSummary.throws ?? 0;
    stats.totalScored += playerSummary.totalScored ?? 0;
    stats.count100Plus += playerSummary.count100Plus ?? 0;
    stats.count140Plus += playerSummary.count140Plus ?? 0;
    stats.count180s += playerSummary.count180s ?? 0;
  
    if ((playerSummary.highestCheckout ?? 0) > stats.highestCheckout) {
      stats.highestCheckout = playerSummary.highestCheckout;
    }
  
    recalculateAverage(stats);
  }
  
  export function createPlayerAggregate(playerId, displayName) {
    return {
      playerId,
      displayName,
      overall: createEmptyStatBlock(),
      competitions: {}
    };
  }
  
  export function addMatchSummaryToPlayerAggregate(aggregate, competitionId, competitionName, matchSummary) {
    if (!matchSummary || !matchSummary.players) {
      return {
        success: false,
        aggregate,
        reason: 'Invalid match summary'
      };
    }
  
    const playerSummary = matchSummary.players.find(
      (p) => p.name === aggregate.displayName
    );
  
    if (!playerSummary) {
      return {
        success: false,
        aggregate,
        reason: 'Player not found in match summary'
      };
    }
  
    applyPlayerSummaryToStats(aggregate.overall, playerSummary);
  
    if (!aggregate.competitions[competitionId]) {
      aggregate.competitions[competitionId] = {
        competitionId,
        competitionName,
        stats: createEmptyStatBlock()
      };
    }
  
    applyPlayerSummaryToStats(
      aggregate.competitions[competitionId].stats,
      playerSummary
    );
  
    return {
      success: true,
      aggregate
    };
  }
  
  export function buildLeaderboardRows(playerAggregates, competitionId = null) {
    return playerAggregates.map((aggregate) => {
      const source = competitionId
        ? aggregate.competitions[competitionId]?.stats ?? createEmptyStatBlock()
        : aggregate.overall;
  
      return {
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
    });
  }
  
  export function sortLeaderboardByAverage(rows) {
    return [...rows].sort((a, b) => b.threeDartAverage - a.threeDartAverage);
  }
  
  export function printAggregate(title, aggregate) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(aggregate, null, 2));
  }
  
  export function printLeaderboard(title, rows) {
    console.log(`\n===== ${title} =====`);
    rows.forEach((row, index) => {
      console.log(
        `${index + 1}. ${row.displayName} | Avg: ${row.threeDartAverage} | MP: ${row.matchesPlayed} | W: ${row.matchesWon} | L: ${row.matchesLost} | 180s: ${row.count180s} | High CO: ${row.highestCheckout}`
      );
    });
  }