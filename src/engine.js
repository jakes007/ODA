export function createMatch(p1, p2, startingScore = 501) {
  return {
    p1: {
      name: p1,
      score: startingScore,
      stats: createPlayerStats()
    },
    p2: {
      name: p2,
      score: startingScore,
      stats: createPlayerStats()
    },
    current: "p1",
    over: false,
    winner: null
  };
}

function createPlayerStats() {
  return {
    dartsUsed: 0,
    throws: 0,
    totalScored: 0,
    count100Plus: 0,
    count140Plus: 0,
    count180s: 0,
    highestCheckout: 0
  };
}

export function applyScore(match, points, options = {}) {
  if (match.over) {
    return { success: false, match, reason: "Game over" };
  }

  const key = match.current;
  const player = match[key];

  const currentScore = player.score;
  const newScore = currentScore - points;

  if (newScore < 0) {
    return { success: false, match, reason: "Bust" };
  }

  const dartsUsed = options.dartsUsed ?? 3;
  const isCheckout = options.isCheckout ?? false;

  // update score
  player.score = newScore;

  // stats
  player.stats.dartsUsed += dartsUsed;
  player.stats.throws += 1;
  player.stats.totalScored += points;

  if (points >= 100) player.stats.count100Plus++;
  if (points >= 140) player.stats.count140Plus++;
  if (points === 180) player.stats.count180s++;

  if (isCheckout && points > player.stats.highestCheckout) {
    player.stats.highestCheckout = points;
  }

  // win
  if (newScore === 0) {
    match.over = true;
    match.winner = player.name;
  }

  // switch turn
  match.current = match.current === "p1" ? "p2" : "p1";

  return { success: true, match };
}

export function getCurrentPlayer(match) {
  return match[match.current];
}

function getThreeDartAverage(player) {
  if (player.stats.dartsUsed === 0) return 0;
  return ((player.stats.totalScored / player.stats.dartsUsed) * 3).toFixed(2);
}

export function printMatch(match) {
  console.log("\n----------------------");
  console.log(`${match.p1.name}: ${match.p1.score}`);
  console.log(`${match.p2.name}: ${match.p2.score}`);
  console.log(`Turn: ${getCurrentPlayer(match).name}`);

  if (match.over) {
    console.log(`🏆 WINNER: ${match.winner}`);
  }

  console.log("----------------------");

  printStats(match.p1);
  printStats(match.p2);
}

function printStats(player) {
  console.log(`\n${player.name} stats`);
  console.log(`Avg: ${getThreeDartAverage(player)}`);
  console.log(`Darts: ${player.stats.dartsUsed}`);
  console.log(`Throws: ${player.stats.throws}`);
  console.log(`100+: ${player.stats.count100Plus}`);
  console.log(`140+: ${player.stats.count140Plus}`);
  console.log(`180s: ${player.stats.count180s}`);
  console.log(`High CO: ${player.stats.highestCheckout}`);
}