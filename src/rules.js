import { applyScore } from './engine.js';

const MAX_PER_TURN = 180;
const DOUBLE_OUT = true;
const IMPOSSIBLE = [169, 168, 165, 163, 162, 159];

function validCheckout(score) {
  if (score > 170) return false;
  return !IMPOSSIBLE.includes(score);
}

function switchTurnOnly(match) {
  match.current = match.current === 'p1' ? 'p2' : 'p1';
  return match;
}

export function processTurn(match, input) {
  const points = input.points ?? 0;
  const finishedOnDouble = input.finishedOnDouble ?? false;

  const player = match[match.current];
  const remaining = player.score;
  const newScore = remaining - points;

  if (points === 0) {
    switchTurnOnly(match);
    return { success: true, match, reason: null };
  }

  if (points > MAX_PER_TURN) {
    switchTurnOnly(match);
    return { success: false, match, reason: 'Max 180 per turn' };
  }

  if (newScore < 0) {
    switchTurnOnly(match);
    return { success: false, match, reason: 'Bust' };
  }

  if (newScore === 1) {
    switchTurnOnly(match);
    return { success: false, match, reason: 'Cannot leave 1' };
  }

  if (newScore === 0) {
    if (DOUBLE_OUT && !finishedOnDouble) {
      switchTurnOnly(match);
      return { success: false, match, reason: 'Must finish on double' };
    }

    if (!validCheckout(remaining)) {
      switchTurnOnly(match);
      return { success: false, match, reason: 'Invalid checkout' };
    }
  }

  return applyScore(match, points);
}