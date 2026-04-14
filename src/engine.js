export function createMatch(p1, p2, startingScore = 501) {
    return {
      p1: { name: p1, score: startingScore },
      p2: { name: p2, score: startingScore },
      current: "p1",
      over: false,
      winner: null
    };
  }
  
  export function applyScore(match, points) {
    if (match.over) {
      return { success: false, match, reason: "Game over" };
    }
  
    const player = match.current;
    const currentScore = match[player].score;
    const newScore = currentScore - points;
  
    if (newScore < 0) {
      return { success: false, match, reason: "Bust" };
    }
  
    match[player].score = newScore;
  
    if (newScore === 0) {
      match.over = true;
      match.winner = match[player].name;
    }
  
    match.current = match.current === "p1" ? "p2" : "p1";
  
    return { success: true, match };
  }
  
  export function getCurrentPlayer(match) {
    return match[match.current];
  }
  
  export function printMatch(match) {
    console.log("\n----------------------");
    console.log(`${match.p1.name}: ${match.p1.score}`);
    console.log(`${match.p2.name}: ${match.p2.score}`);
    console.log(`Turn: ${getCurrentPlayer(match).name}`);
  
    if (match.over) {
      console.log(`🏆 WINNER: ${match.winner}`);
    }
  
    console.log("----------------------\n");
  }