import { printMatch } from './engine.js';
import { processTurn } from './rules.js';
import {
  createMultiLegMatch,
  recordCompletedLeg,
  printSeries,
  buildSeriesSummary
} from './multiLegMatch.js';

const series = createMultiLegMatch({
  player1Name: 'Alice',
  player2Name: 'Bob',
  startingScore: 40,
  legsMode: 'fixed',
  totalLegs: 2
});

function turn(label, input) {
  console.log('\n➡️ ' + label);

  const result = processTurn(series.currentLeg, input);

  if (!result.success) {
    console.log('❌ ' + result.reason);
  } else {
    console.log('✅ OK');
  }

  printMatch(series.currentLeg);
}

console.log('\n===== MULTI-LEG TEST =====');
printSeries(series);

// ----------------------
// LEG 1: Alice wins
// ----------------------
turn('Leg 1 - Alice wins on double', {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});

recordCompletedLeg(series);
printSeries(series);

// ----------------------
// LEG 2: Bob wins
// ----------------------
turn('Leg 2 - Alice busts', {
  points: 0
});

turn('Leg 2 - Bob wins on double', {
  points: 40,
  dartsUsed: 2,
  finishedOnDouble: true
});

recordCompletedLeg(series);
printSeries(series);

// Final summary
const summary = buildSeriesSummary(series);

console.log('\nRAW SERIES SUMMARY:');
console.log(JSON.stringify(summary, null, 2));