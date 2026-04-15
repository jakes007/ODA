export function buildMatchSummary(match) {
    const p1 = match.p1;
    const p2 = match.p2;
  
    return {
      matchComplete: match.over,
      winner: match.winner,
      players: [
        buildPlayerSummary(p1, p1.name === match.winner),
        buildPlayerSummary(p2, p2.name === match.winner)
      ],
      createdAt: new Date().toISOString()
    };
  }
  
  function buildPlayerSummary(player, won) {
    return {
      name: player.name,
      finalScore: player.score,
      result: won ? "win" : "loss",
      dartsUsed: player.stats.dartsUsed,
      throws: player.stats.throws,
      totalScored: player.stats.totalScored,
      threeDartAverage: calculateThreeDartAverage(player),
      count100Plus: player.stats.count100Plus,
      count140Plus: player.stats.count140Plus,
      count180s: player.stats.count180s,
      highestCheckout: player.stats.highestCheckout
    };
  }
  
  function calculateThreeDartAverage(player) {
    if (player.stats.dartsUsed === 0) return 0;
    return Number(((player.stats.totalScored / player.stats.dartsUsed) * 3).toFixed(2));
  }
  
  export function printMatchSummary(summary) {
    console.log("\n======================");
    console.log("MATCH SUMMARY");
    console.log("======================");
    console.log(`Complete: ${summary.matchComplete ? "Yes" : "No"}`);
    console.log(`Winner: ${summary.winner ?? "None"}`);
  
    summary.players.forEach((player) => {
      console.log(`\n${player.name}`);
      console.log(`  Result: ${player.result}`);
      console.log(`  Final Score: ${player.finalScore}`);
      console.log(`  Darts Used: ${player.dartsUsed}`);
      console.log(`  Throws: ${player.throws}`);
      console.log(`  Total Scored: ${player.totalScored}`);
      console.log(`  3-Dart Avg: ${player.threeDartAverage}`);
      console.log(`  100+: ${player.count100Plus}`);
      console.log(`  140+: ${player.count140Plus}`);
      console.log(`  180s: ${player.count180s}`);
      console.log(`  Highest Checkout: ${player.highestCheckout}`);
    });
  
    console.log("\n======================\n");
  }