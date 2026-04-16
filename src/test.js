import {
  createCompetition,
  createTeam,
  createFixtureTemplate
} from './dataModel.js';

import {
  createFixtureFromTemplate,
  printGeneratedFixture
} from './fixtureGenerator.js';

import {
  applyLineupToFixture
} from './lineupBuilder.js';

import {
  startFixtureGameMatch,
  playTurnInFixtureGame,
  finalizeFixtureGameMatch,
  printLiveFixtureMatch
} from './matchExecutor.js';

// --------------------------------------------
// Setup base data
// --------------------------------------------
const competition = createCompetition({
  name: 'ODA League',
  type: 'league',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

const teamA = createTeam({
  name: 'Observatory A',
  associationName: 'Observatory Darts Association',
  competitionId: competition.competitionId
});

const teamB = createTeam({
  name: 'Observatory B',
  associationName: 'Observatory Darts Association',
  competitionId: competition.competitionId
});

const template = createFixtureTemplate({
  name: 'ODA League Standard Format',
  competitionType: 'league',
  associationName: 'Observatory Darts Association',
  games: [
    { label: 'Singles 1', type: 'singles', startingScore: 40, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 }
  ]
});

// --------------------------------------------
// Generate fixture
// --------------------------------------------
const fixture = createFixtureFromTemplate({
  template,
  competition,
  teamA,
  teamB,
  teamASquad: ['Jason', 'A2'],
  teamBSquad: ['B1', 'B2'],
  fixtureName: 'Observatory A vs Observatory B - Execution Test'
});

// --------------------------------------------
// Apply lineups
// --------------------------------------------
applyLineupToFixture(fixture, {
  teamALineup: ['Jason', 'A2'],
  teamBLineup: ['B1', 'B2']
});

console.log('\n===== FIXTURE BEFORE EXECUTION =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Start first fixture game
// --------------------------------------------
console.log('\n===== START GAME 1 =====');
const startResult = startFixtureGameMatch(fixture, 1);

if (!startResult.success) {
  console.log(`❌ ${startResult.reason}`);
} else {
  console.log('✅ Game 1 started');
}

printLiveFixtureMatch(fixture, 1);

// --------------------------------------------
// Play the live match
// Jason vs B1 on 40
// Jason finishes on double with 1 dart
// --------------------------------------------
console.log('\n===== PLAY GAME 1 =====');

let turnResult = playTurnInFixtureGame(fixture, 1, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});

if (!turnResult.success && turnResult.reason) {
  console.log(`❌ ${turnResult.reason}`);
} else {
  console.log('✅ Turn processed');
}

printLiveFixtureMatch(fixture, 1);

// --------------------------------------------
// Finalize and write back into fixture
// --------------------------------------------
console.log('\n===== FINALIZE GAME 1 =====');
const finalizeResult = finalizeFixtureGameMatch(fixture, 1);

if (!finalizeResult.success) {
  console.log(`❌ ${finalizeResult.reason}`);
} else {
  console.log('✅ Game 1 finalized and linked back to fixture');
}

console.log('\n===== FIXTURE AFTER GAME 1 =====');
printGeneratedFixture(fixture);

console.log('\nRAW GAME 1 SUMMARY:');
console.log(JSON.stringify(finalizeResult.summary, null, 2));