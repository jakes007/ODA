export function createFixture(config) {
  const {
    fixtureName,
    teamAName,
    teamBName,
    pointsSystem,
    games
  } = config;

  return {
    fixtureName,
    teamAName,
    teamBName,
    pointsSystem,
    score: {
      teamA: 0,
      teamB: 0
    },
    games: games.map((game, index) => ({
      id: index + 1,
      order: index + 1,
      type: game.type, // singles | doubles | team
      startingScore: game.startingScore ?? 501,
      legsMode: game.legsMode ?? 'fixed',
      totalLegs: game.totalLegs ?? 1,
      label: game.label ?? `Game ${index + 1}`,
      status: 'pending',

      // assignments
      teamAPlayers: [],
      teamBPlayers: [],

      // result
      winner: null, // 'teamA' | 'teamB' | 'draw' | null
      summary: null
    })),
    complete: false
  };
}

export function assignPlayersToGame(fixture, gameId, teamAPlayers, teamBPlayers) {
  const game = fixture.games.find((g) => g.id === gameId);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status !== 'pending') {
    return { success: false, fixture, reason: 'Game already started or completed' };
  }

  game.teamAPlayers = [...teamAPlayers];
  game.teamBPlayers = [...teamBPlayers];
  game.status = 'assigned';

  return { success: true, fixture };
}

export function recordGameResult(fixture, gameId, result) {
  const game = fixture.games.find((g) => g.id === gameId);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status === 'completed') {
    return { success: false, fixture, reason: 'Game already completed' };
  }

  const winner = result.winner; // 'teamA' | 'teamB' | 'draw'
  if (!['teamA', 'teamB', 'draw'].includes(winner)) {
    return { success: false, fixture, reason: 'Invalid winner value' };
  }

  game.winner = winner;
  game.summary = result.summary ?? null;
  game.status = 'completed';

  if (winner === 'teamA') {
    fixture.score.teamA += 1;
  } else if (winner === 'teamB') {
    fixture.score.teamB += 1;
  }

  updateFixtureCompletion(fixture);

  return { success: true, fixture };
}

function updateFixtureCompletion(fixture) {
  const completedCount = fixture.games.filter((g) => g.status === 'completed').length;

  if (completedCount === fixture.games.length) {
    fixture.complete = true;
  }
}

export function printFixture(fixture) {
  console.log('\n======================');
  console.log('FIXTURE');
  console.log('======================');
  console.log(`Fixture: ${fixture.fixtureName}`);
  console.log(`Teams: ${fixture.teamAName} vs ${fixture.teamBName}`);
  console.log(`Points System: ${fixture.pointsSystem}`);
  console.log(`Score: ${fixture.score.teamA} - ${fixture.score.teamB}`);
  console.log(`Complete: ${fixture.complete ? 'Yes' : 'No'}`);
  console.log('\nGames:');

  fixture.games.forEach((game) => {
    const aPlayers = game.teamAPlayers.length ? game.teamAPlayers.join(', ') : '-';
    const bPlayers = game.teamBPlayers.length ? game.teamBPlayers.join(', ') : '-';

    console.log(
      `  ${game.order}. ${game.label} | ${game.type} | ${game.startingScore} | ${game.legsMode} | legs: ${game.totalLegs} | ${game.status}`
    );
    console.log(`     ${fixture.teamAName}: ${aPlayers}`);
    console.log(`     ${fixture.teamBName}: ${bPlayers}`);
    console.log(`     Winner: ${game.winner ?? '-'}`);
  });

  console.log('\n======================\n');
}

export function buildFixtureSummary(fixture) {
  return {
    fixtureName: fixture.fixtureName,
    teamAName: fixture.teamAName,
    teamBName: fixture.teamBName,
    pointsSystem: fixture.pointsSystem,
    score: fixture.score,
    complete: fixture.complete,
    games: fixture.games.map((game) => ({
      id: game.id,
      order: game.order,
      label: game.label,
      type: game.type,
      startingScore: game.startingScore,
      legsMode: game.legsMode,
      totalLegs: game.totalLegs,
      status: game.status,
      teamAPlayers: game.teamAPlayers,
      teamBPlayers: game.teamBPlayers,
      winner: game.winner
    }))
  };
}