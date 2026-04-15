import { createFixture, printFixture, buildFixtureSummary } from './fixture.js';

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

printFixture(fixture);

const summary = buildFixtureSummary(fixture);

console.log('RAW FIXTURE SUMMARY:');
console.log(JSON.stringify(summary, null, 2));