import { createMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import {
  createFixture,
  assignPlayersToGame,
  recordGameResult,
  printFixture,
  buildFixtureSummary
} from './fixture.js';

// ----------------------
// Build a real leg summary
// ----------------------
let leg = createMatch('A1', 'B1', 40);

processTurn(leg, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});

const realLegSummary = buildMatchSummary(leg);

// ----------------------
// Build fixture
// ----------------------
const fixture = createFixture({
  fixtureName: 'ODA League Night 1',
  teamAName: 'Observatory A',
  teamBName: 'Observatory B',
  pointsSystem: 3,
  games: [
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
    }
  ]
});

console.log('\n===== FIXTURE GAME SUMMARY LINK TEST =====');
printFixture(fixture);

// assignments
assignPlayersToGame(fixture, 1, ['A1'], ['B1']);
assignPlayersToGame(fixture, 2, ['A2'], ['B2']);
assignPlayersToGame(fixture, 3, ['A3'], ['B3']);

console.log('\n===== AFTER ASSIGNMENTS =====');
printFixture(fixture);

// record results
recordGameResult(fixture, 1, {
  winner: 'teamA',
  summary: realLegSummary
});

recordGameResult(fixture, 2, {
  winner: 'teamB',
  summary: {
    matchComplete: true,
    winner: 'B2',
    players: [
      {
        name: 'A2',
        result: 'loss',
        finalScore: 20,
        dartsUsed: 15,
        throws: 5,
        totalScored: 481,
        threeDartAverage: 96.2,
        count100Plus: 2,
        count140Plus: 1,
        count180s: 0,
        highestCheckout: 0
      },
      {
        name: 'B2',
        result: 'win',
        finalScore: 0,
        dartsUsed: 14,
        throws: 5,
        totalScored: 501,
        threeDartAverage: 107.36,
        count100Plus: 3,
        count140Plus: 1,
        count180s: 1,
        highestCheckout: 40
      }
    ],
    createdAt: new Date().toISOString()
  }
});

recordGameResult(fixture, 3, {
  winner: 'teamA',
  summary: {
    matchComplete: true,
    winner: 'A3',
    players: [
      {
        name: 'A3',
        result: 'win',
        finalScore: 0,
        dartsUsed: 18,
        throws: 6,
        totalScored: 501,
        threeDartAverage: 83.5,
        count100Plus: 2,
        count140Plus: 0,
        count180s: 0,
        highestCheckout: 32
      },
      {
        name: 'B3',
        result: 'loss',
        finalScore: 40,
        dartsUsed: 18,
        throws: 6,
        totalScored: 461,
        threeDartAverage: 76.83,
        count100Plus: 1,
        count140Plus: 0,
        count180s: 0,
        highestCheckout: 0
      }
    ],
    createdAt: new Date().toISOString()
  }
});

console.log('\n===== AFTER RESULTS WITH LINKED SUMMARIES =====');
printFixture(fixture);

const summary = buildFixtureSummary(fixture);

console.log('RAW FIXTURE SUMMARY:');
console.log(JSON.stringify(summary, null, 2));