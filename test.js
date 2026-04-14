import { createMatch, printMatch } from './engine.js';
import { processTurn } from './rules.js';

let match = createMatch('Alice', 'Bob', 501);

function turn(label, input) {
  console.log('\n➡️ ' + label);

  const result = processTurn(match, input);
  match = result.match;

  if (!result.success) {
    console.log('❌ ' + result.reason);
  } else {
    console.log('✅ OK');
  }

  printMatch(match);
}

console.log('\n===== SCENARIO 1 =====');

turn('Alice 140', { points: 140 });
turn('Bob 100', { points: 100 });

console.log('\n===== SCENARIO 2 =====');

turn('Alice bust', { points: 0 });

console.log('\n===== SCENARIO 3 =====');

match = createMatch('Alice', 'Bob', 40);

turn('Alice tries to finish without double', {
  points: 40,
  finishedOnDouble: false
});

console.log('\n===== SCENARIO 4 =====');

match = createMatch('Alice', 'Bob', 40);

turn('Alice wins', {
  points: 40,
  finishedOnDouble: true
});