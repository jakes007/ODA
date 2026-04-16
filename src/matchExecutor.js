import { createMatch, printMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import { createMultiLegMatch, recordCompletedLeg, buildSeriesSummary } from './multiLegMatch.js';

function getGameByOrder(fixture, gameOrder) {
  return fixture.games.find((g) => g.order === gameOrder);
}

function getDisplayName(players) {
  if (!players || players.length === 0) return 'Unknown';
  return players.join(' / ');
}

function createLiveGameForFixtureGame(game) {
  const teamAName = getDisplayName(game.activeTeamAPlayers);
  const teamBName = getDisplayName(game.activeTeamBPlayers);

  // 1 leg = normal single-leg engine
  if (game.totalLegs === 1) {
    return {
      mode: 'single_leg',
      match: createMatch(teamAName, teamBName, game.startingScore)
    };
  }

  // multi-leg = wrapper
  return {
    mode: 'multi_leg',
    series: createMultiLegMatch({
      player1Name: teamAName,
      player2Name: teamBName,
      startingScore: game.startingScore,
      legsMode: game.legsMode,
      totalLegs: game.totalLegs
    })
  };
}

export function startFixtureGameMatch(fixture, gameOrder) {
  const game = getGameByOrder(fixture, gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status !== 'assigned') {
    return { success: false, fixture, reason: 'Game is not assigned and ready to start' };
  }

  if (game.activeTeamAPlayers.length === 0 || game.activeTeamBPlayers.length === 0) {
    return { success: false, fixture, reason: 'Game does not have active players assigned' };
  }

  game.status = 'in_progress';
  game.live = createLiveGameForFixtureGame(game);

  return {
    success: true,
    fixture
  };
}

export function playTurnInFixtureGame(fixture, gameOrder, input) {
  const game = getGameByOrder(fixture, gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (game.status !== 'in_progress') {
    return { success: false, fixture, reason: 'Game is not in progress' };
  }

  if (!game.live) {
    return { success: false, fixture, reason: 'No live game found for this fixture game' };
  }

  // Single-leg execution
  if (game.live.mode === 'single_leg') {
    const result = processTurn(game.live.match, input);
    game.live.match = result.match;

    return {
      success: result.success,
      fixture,
      reason: result.reason ?? null,
      matchComplete: game.live.match.over
    };
  }

  // Multi-leg execution
  if (game.live.mode === 'multi_leg') {
    const currentLeg = game.live.series.currentLeg;
    const result = processTurn(currentLeg, input);

    game.live.series.currentLeg = result.match;

    // If current leg finished, record it automatically
    if (game.live.series.currentLeg.over) {
      recordCompletedLeg(game.live.series);
    }

    return {
      success: result.success,
      fixture,
      reason: result.reason ?? null,
      matchComplete: game.live.series.over
    };
  }

  return {
    success: false,
    fixture,
    reason: 'Unknown live game mode'
  };
}

export function finalizeFixtureGameMatch(fixture, gameOrder) {
  const game = getGameByOrder(fixture, gameOrder);

  if (!game) {
    return { success: false, fixture, reason: 'Game not found' };
  }

  if (!game.live) {
    return { success: false, fixture, reason: 'No live game to finalize' };
  }

  let summary;
  let winnerName;

  if (game.live.mode === 'single_leg') {
    if (!game.live.match.over) {
      return { success: false, fixture, reason: 'Live match is not complete yet' };
    }

    summary = buildMatchSummary(game.live.match);
    winnerName = game.live.match.winner;
  }

  if (game.live.mode === 'multi_leg') {
    if (!game.live.series.over) {
      return { success: false, fixture, reason: 'Live match series is not complete yet' };
    }

    summary = buildSeriesSummary(game.live.series);
    winnerName = game.live.series.overallWinner;
  }

  let winner = 'draw';

  const teamAWinnerNames = [getDisplayName(game.activeTeamAPlayers), ...game.activeTeamAPlayers];
  const teamBWinnerNames = [getDisplayName(game.activeTeamBPlayers), ...game.activeTeamBPlayers];

  if (winnerName && teamAWinnerNames.includes(winnerName)) {
    winner = 'teamA';
  } else if (winnerName && teamBWinnerNames.includes(winnerName)) {
    winner = 'teamB';
  }

  game.winner = winner;
  game.summary = summary;
  game.status = 'completed';

  if (winner === 'teamA') fixture.score.teamA += 1;
  if (winner === 'teamB') fixture.score.teamB += 1;

  if (fixture.games.every((g) => g.status === 'completed')) {
    fixture.complete = true;
  }

  delete game.live;

  return {
    success: true,
    fixture,
    summary
  };
}

export function printLiveFixtureMatch(fixture, gameOrder) {
  const game = getGameByOrder(fixture, gameOrder);

  if (!game) {
    console.log('\nGame not found\n');
    return;
  }

  console.log('\n======================');
  console.log(`LIVE FIXTURE GAME: ${game.label}`);
  console.log(`Type: ${game.type}`);
  console.log(`Status: ${game.status}`);
  console.log('======================');

  if (!game.live) {
    console.log('No live game active.\n');
    return;
  }

  if (game.live.mode === 'single_leg') {
    printMatch(game.live.match);
    return;
  }

  if (game.live.mode === 'multi_leg') {
    console.log(`Mode: multi_leg`);
    console.log(`Current Leg: ${game.live.series.currentLegNumber}`);
    console.log(`Leg Score: ${game.live.series.legWins.p1} - ${game.live.series.legWins.p2}`);
    printMatch(game.live.series.currentLeg);
  }
}