import {
  createCompetition,
  createTeam,
  createFixtureTemplate,
  printObject
} from './dataModel.js';

import {
  createFixtureFromTemplate,
  assignPlayersToFixtureGame,
  substitutePlayer,
  recordFixtureGameResult,
  printGeneratedFixture,
  buildGeneratedFixtureSummary
} from './fixtureGenerator.js';

// --------------------------------------------
// Base data
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
    { label: 'Singles 1', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 3', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 4', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 }
  ]
});

// --------------------------------------------
// Generate fixture from template
// --------------------------------------------
const fixture = createFixtureFromTemplate({
  template,
  competition,
  teamA,
  teamB,
  teamASquad: ['Jason', 'A2', 'A3', 'SubA1'],
  teamBSquad: ['B1', 'B2', 'B3', 'SubB1'],
  fixtureName: 'Observatory A vs Observatory B - Round 1'
});

console.log('\n===== GENERATED FROM TEMPLATE =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Planned assignments
// Jason initially has games 1 and 3
// --------------------------------------------
assignPlayersToFixtureGame(fixture, 1, ['Jason'], ['B1']);
assignPlayersToFixtureGame(fixture, 2, ['A2'], ['B2']);
assignPlayersToFixtureGame(fixture, 3, ['Jason'], ['B3']);
assignPlayersToFixtureGame(fixture, 4, ['A3'], ['SubB1']);

console.log('\n===== AFTER PLANNED ASSIGNMENTS =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Record game 1 completed (Jason already played)
// --------------------------------------------
recordFixtureGameResult(fixture, 1, 'teamA', {
  matchComplete: true,
  winner: 'Jason'
});

console.log('\n===== AFTER GAME 1 RESULT =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Now Jason is subbed OUT, SubA1 comes IN
// Only future unplayed Jason games should change
// --------------------------------------------
substitutePlayer(fixture, 'teamA', 'Jason', 'SubA1');

console.log('\n===== AFTER SUBSTITUTION =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Record remaining results
// --------------------------------------------
recordFixtureGameResult(fixture, 2, 'teamB', {
  matchComplete: true,
  winner: 'B2'
});

recordFixtureGameResult(fixture, 3, 'teamA', {
  matchComplete: true,
  winner: 'SubA1'
});

recordFixtureGameResult(fixture, 4, 'teamB', {
  matchComplete: true,
  winner: 'SubB1'
});

console.log('\n===== AFTER ALL RESULTS =====');
printGeneratedFixture(fixture);

const summary = buildGeneratedFixtureSummary(fixture);

printObject('RAW GENERATED FIXTURE SUMMARY', summary);