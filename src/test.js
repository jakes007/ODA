import {
  createCompetition,
  createTeam,
  createFixtureTemplate,
  printObject
} from './dataModel.js';

import {
  createFixtureFromTemplate,
  printGeneratedFixture
} from './fixtureGenerator.js';

import {
  applyLineupToFixture,
  printLineup
} from './lineupBuilder.js';

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
    { label: 'Doubles 1', type: 'doubles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Doubles 2', type: 'doubles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 1', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 3', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 4', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Team Decider', type: 'team', startingScore: 701, legsMode: 'fixed', totalLegs: 1 }
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
  teamASquad: ['Jason', 'A2', 'A3', 'A4', 'SubA1'],
  teamBSquad: ['B1', 'B2', 'B3', 'B4', 'SubB1'],
  fixtureName: 'Observatory A vs Observatory B - Round 1'
});

console.log('\n===== GENERATED FIXTURE =====');
printGeneratedFixture(fixture);

// --------------------------------------------
// Build lineups
// --------------------------------------------
const teamALineup = ['Jason', 'A2', 'A3', 'A4'];
const teamBLineup = ['B1', 'B2', 'B3', 'B4'];

printLineup('TEAM A LINEUP', teamALineup);
printLineup('TEAM B LINEUP', teamBLineup);

// --------------------------------------------
// Apply lineup to fixture
// --------------------------------------------
const lineupResult = applyLineupToFixture(fixture, {
  teamALineup,
  teamBLineup
});

if (!lineupResult.success) {
  console.log(`\n❌ ${lineupResult.reason}`);
} else {
  console.log('\n✅ Lineup applied successfully');
}

console.log('\n===== AFTER LINEUP APPLIED =====');
printGeneratedFixture(fixture);

printObject('RAW FIXTURE AFTER LINEUP', fixture);