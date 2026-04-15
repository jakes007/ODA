import {
  createFixture,
  assignPlayersToGame,
  recordGameResult,
  printFixture,
  buildFixtureSummary
} from './fixture.js';

const fixture = createFixture({
  fixtureName: 'ODA League Night 1',
  teamAName: 'Observatory A',
  teamBName: 'Observatory B',
  pointsSystem: 7,
  games: [
    {
      label: 'Doubles 1',
      type: 'doubles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Doubles 2',
      type: 'doubles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Singles 1',
      type: 'singles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Singles 2',
      type: 'singles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Singles 3',
      type: 'singles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Singles 4',
      type: 'singles',
      startingScore: 501,
      legsMode: 'fixed',
      totalLegs: 1
    },
    {
      label: 'Team Decider',
      type: 'team',
      startingScore: 701,
      legsMode: 'fixed',
      totalLegs: 1
    }
  ]
});

console.log('\n===== FIXTURE ASSIGNMENT + SCORING TEST =====');
printFixture(fixture);

// Assign players
assignPlayersToGame(fixture, 1, ['A1', 'A2'], ['B1', 'B2']);
assignPlayersToGame(fixture, 2, ['A3', 'A4'], ['B3', 'B4']);
assignPlayersToGame(fixture, 3, ['A1'], ['B1']);
assignPlayersToGame(fixture, 4, ['A2'], ['B2']);
assignPlayersToGame(fixture, 5, ['A3'], ['B3']);
assignPlayersToGame(fixture, 6, ['A4'], ['B4']);
assignPlayersToGame(fixture, 7, ['A1', 'A2', 'A3', 'A4'], ['B1', 'B2', 'B3', 'B4']);

console.log('\n===== AFTER ASSIGNMENTS =====');
printFixture(fixture);

// Record some results
recordGameResult(fixture, 1, { winner: 'teamA' });
recordGameResult(fixture, 2, { winner: 'teamB' });
recordGameResult(fixture, 3, { winner: 'teamA' });
recordGameResult(fixture, 4, { winner: 'teamB' });
recordGameResult(fixture, 5, { winner: 'teamA' });
recordGameResult(fixture, 6, { winner: 'teamB' });
recordGameResult(fixture, 7, { winner: 'teamA' });

console.log('\n===== AFTER RESULTS =====');
printFixture(fixture);

const summary = buildFixtureSummary(fixture);

console.log('RAW FIXTURE SUMMARY:');
console.log(JSON.stringify(summary, null, 2));