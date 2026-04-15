import { applyScore } from './engine.js';

const MAX_PER_TURN = 180;
const DOUBLE_OUT = true;

const IMPOSSIBLE = [169, 168, 165, 163, 162, 159];

function validCheckout(score) {
  if (score > 170) return false;
  return !IMPOSSIBLE.includes(score);
}

function switchTurnOnly(match, dartsUsed = 3) {
  const player = match[match.current];

  player.stats.dartsUsed += dartsUsed;
  player.stats.throws += 1;

  match.current = match.current === 'p1' ? 'p2' : 'p1';
  return match;
}

export function processTurn(match, input) {
  const points = input.points ?? 0;
  const dartsUsed = input.dartsUsed ?? 3;
  const finishedOnDouble = input.finishedOnDouble ?? false;

  const player = match[match.current];
  const remaining = player.score;
  const newScore = remaining - points;

  // manual zero turn
  if (points === 0) {
    switchTurnOnly(match, 3);
    return { success: true, match };
  }

  // max 180
  if (points > MAX_PER_TURN) {
    switchTurnOnly(match, 3);
    return { success: false, match, reason: 'Max 180 per turn' };
  }

  // bust
  if (newScore < 0) {
    switchTurnOnly(match, 3);
    return { success: false, match, reason: 'Bust' };
  }

  // cannot leave 1
  if (newScore === 1) {
    switchTurnOnly(match, 3);
    return { success: false, match, reason: 'Cannot leave 1' };
  }

  // checkout
  if (newScore === 0) {
    if (DOUBLE_OUT && !finishedOnDouble) {
      switchTurnOnly(match, 3);
      return { success: false, match, reason: 'Must finish on double' };
    }

    if (!validCheckout(remaining)) {
      switchTurnOnly(match, 3);
      return { success: false, match, reason: 'Invalid checkout' };
    }

    return applyScore(match, points, {
      dartsUsed,
      isCheckout: true
    });
  }

  return applyScore(match, points, {
    dartsUsed,
    isCheckout: false
  });
}