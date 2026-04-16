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
  name: 'Execution Expansion Test',
  competitionType: 'league',
  associationName: 'Observatory Darts Association',
  games: [
    { label: 'Singles 1', type: 'singles', startingScore: 40, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Doubles 1', type: 'doubles', startingScore: 40, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Team Best of 3', type: 'team', startingScore: 40, legsMode: 'bestOf', totalLegs: 3 }
  ]
});

const fixture = createFixtureFromTemplate({
  template,
  competition,
  teamA,
  teamB,
  teamASquad: ['Jason', 'A2', 'A3', 'A4'],
  teamBSquad: ['B1', 'B2', 'B3', 'B4'],
  fixtureName: 'Execution Expansion Fixture'
});

applyLineupToFixture(fixture, {
  teamALineup: ['Jason', 'A2', 'A3', 'A4'],
  teamBLineup: ['B1', 'B2', 'B3', 'B4']
});

console.log('\n===== FIXTURE BEFORE EXECUTION =====');
printGeneratedFixture(fixture);

// ----------------------
// GAME 1 - singles
// ----------------------
console.log('\n===== START SINGLES =====');
startFixtureGameMatch(fixture, 1);
printLiveFixtureMatch(fixture, 1);

playTurnInFixtureGame(fixture, 1, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});

console.log('\n===== AFTER SINGLES TURN =====');
printLiveFixtureMatch(fixture, 1);

const singlesFinalize = finalizeFixtureGameMatch(fixture, 1);
console.log('\n===== SINGLES FINALIZED =====');
console.log(JSON.stringify(singlesFinalize.summary, null, 2));

// ----------------------
// GAME 2 - doubles
// ----------------------
console.log('\n===== START DOUBLES =====');
startFixtureGameMatch(fixture, 2);
printLiveFixtureMatch(fixture, 2);

playTurnInFixtureGame(fixture, 2, {
  points: 40,
  dartsUsed: 2,
  finishedOnDouble: true
});

console.log('\n===== AFTER DOUBLES TURN =====');
printLiveFixtureMatch(fixture, 2);

const doublesFinalize = finalizeFixtureGameMatch(fixture, 2);
console.log('\n===== DOUBLES FINALIZED =====');
console.log(JSON.stringify(doublesFinalize.summary, null, 2));

// ----------------------
// GAME 3 - team best of 3
// Team A wins 2-0
// ----------------------
console.log('\n===== START TEAM BEST OF 3 =====');
startFixtureGameMatch(fixture, 3);
printLiveFixtureMatch(fixture, 3);

// Leg 1
playTurnInFixtureGame(fixture, 3, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});

console.log('\n===== AFTER TEAM LEG 1 =====');
printLiveFixtureMatch(fixture, 3);

// Leg 2
playTurnInFixtureGame(fixture, 3, {
  points: 40,
  dartsUsed: 2,
  finishedOnDouble: true
});

console.log('\n===== AFTER TEAM LEG 2 =====');
printLiveFixtureMatch(fixture, 3);

const teamFinalize = finalizeFixtureGameMatch(fixture, 3);
console.log('\n===== TEAM MATCH FINALIZED =====');
console.log(JSON.stringify(teamFinalize.summary, null, 2));

console.log('\n===== FINAL FIXTURE =====');
printGeneratedFixture(fixture);