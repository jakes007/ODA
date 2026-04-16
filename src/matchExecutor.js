import { createMatch, printMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';

export function startFixtureGameMatch(fixture, gameOrder) {
  const game = fixture.games.find((g) => g.order === gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status !== 'assigned') {
    return { success: false, fixture, reason: 'Game is not assigned and ready to start' };
  }

  if (game.type !== 'singles') {
    return { success: false, fixture, reason: 'V1 execution layer currently supports singles only' };
  }

  if (game.activeTeamAPlayers.length !== 1 || game.activeTeamBPlayers.length !== 1) {
    return { success: false, fixture, reason: 'Singles match requires exactly one player per side' };
  }

  const playerA = game.activeTeamAPlayers[0];
  const playerB = game.activeTeamBPlayers[0];

  const liveMatch = createMatch(playerA, playerB, game.startingScore);

  game.status = 'in_progress';
  game.liveMatch = liveMatch;

  return {
    success: true,
    fixture,
    liveMatch
  };
}

export function playTurnInFixtureGame(fixture, gameOrder, input) {
  const game = fixture.games.find((g) => g.order === gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status !== 'in_progress') {
    return { success: false, fixture, reason: 'Game is not in progress' };
  }

  if (!game.liveMatch) {
    return { success: false, fixture, reason: 'No live match found for this game' };
  }

  const result = processTurn(game.liveMatch, input);

  game.liveMatch = result.match;

  return {
    success: result.success,
    fixture,
    reason: result.reason ?? null,
    matchComplete: game.liveMatch.over
  };
}

export function finalizeFixtureGameMatch(fixture, gameOrder) {
  const game = fixture.games.find((g) => g.order === gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (!game.liveMatch) {
    return { success: false, fixture, reason: 'No live match to finalize' };
  }

  if (!game.liveMatch.over) {
    return { success: false, fixture, reason: 'Live match is not complete yet' };
  }

  const summary = buildMatchSummary(game.liveMatch);

  const winnerName = game.liveMatch.winner;
  const teamAWinnerNames = game.activeTeamAPlayers;
  const teamBWinnerNames = game.activeTeamBPlayers;

  let winner = null;

  if (teamAWinnerNames.includes(winnerName)) {
    winner = 'teamA';
  } else if (teamBWinnerNames.includes(winnerName)) {
    winner = 'teamB';
  } else {
    return { success: false, fixture, reason: 'Could not map winner back to fixture teams' };
  }

  // write result directly back into fixture
  game.winner = winner;
  game.summary = summary;
  game.status = 'completed';

  if (winner === 'teamA') fixture.score.teamA += 1;
  if (winner === 'teamB') fixture.score.teamB += 1;

  if (fixture.games.every((g) => g.status === 'completed')) {
    fixture.complete = true;
  }

  delete game.liveMatch;

  return {
    success: true,
    fixture,
    summary
  };
}

export function printLiveFixtureMatch(fixture, gameOrder) {
  const game = fixture.games.find((g) => g.order === gameOrder);

  if (!game) {
    console.log('\nGame not found\n');
    return;
  }

  console.log('\n======================');
  console.log(`LIVE FIXTURE GAME: ${game.label}`);
  console.log(`Status: ${game.status}`);
  console.log('======================');

  if (game.liveMatch) {
    printMatch(game.liveMatch);
  } else {
    console.log('No live match active.\n');
  }
}