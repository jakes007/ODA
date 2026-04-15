import { createMatch } from './engine.js';
import { buildMatchSummary } from './matchSummary.js';

export function createMultiLegMatch(config) {
  const {
    player1Name,
    player2Name,
    startingScore = 501,
    legsMode = 'bestOf',
    totalLegs = 3
  } = config;

  return {
    config: {
      player1Name,
      player2Name,
      startingScore,
      legsMode,     // 'bestOf' or 'fixed'
      totalLegs
    },
    currentLegNumber: 1,
    currentLeg: createMatch(player1Name, player2Name, startingScore),
    completedLegs: [],
    legWins: {
      p1: 0,
      p2: 0
    },
    over: false,
    overallWinner: null,
    overallResult: null
  };
}

export function recordCompletedLeg(series) {
  const leg = series.currentLeg;

  if (!leg.over) {
    return {
      success: false,
      series,
      reason: 'Current leg is not complete yet'
    };
  }

  const summary = buildMatchSummary(leg);
  series.completedLegs.push(summary);

  const winnerName = leg.winner;

  if (winnerName === series.config.player1Name) {
    series.legWins.p1 += 1;
  } else if (winnerName === series.config.player2Name) {
    series.legWins.p2 += 1;
  }

  updateOverallStatus(series);

  if (!series.over) {
    series.currentLegNumber += 1;
    series.currentLeg = createMatch(
      series.config.player1Name,
      series.config.player2Name,
      series.config.startingScore
    );
  }

  return {
    success: true,
    series
  };
}

function updateOverallStatus(series) {
  const { legsMode, totalLegs } = series.config;
  const playedLegs = series.completedLegs.length;
  const p1Wins = series.legWins.p1;
  const p2Wins = series.legWins.p2;

  if (legsMode === 'bestOf') {
    const targetWins = Math.floor(totalLegs / 2) + 1;

    if (p1Wins >= targetWins) {
      series.over = true;
      series.overallWinner = series.config.player1Name;
      series.overallResult = `${p1Wins}-${p2Wins}`;
      return;
    }

    if (p2Wins >= targetWins) {
      series.over = true;
      series.overallWinner = series.config.player2Name;
      series.overallResult = `${p1Wins}-${p2Wins}`;
      return;
    }
  }

  if (legsMode === 'fixed') {
    if (playedLegs >= totalLegs) {
      series.over = true;

      if (p1Wins > p2Wins) {
        series.overallWinner = series.config.player1Name;
      } else if (p2Wins > p1Wins) {
        series.overallWinner = series.config.player2Name;
      } else {
        series.overallWinner = null; // draw
      }

      series.overallResult = `${p1Wins}-${p2Wins}`;
    }
  }
}

export function printSeries(series) {
  console.log('\n======================');
  console.log('MULTI-LEG MATCH');
  console.log('======================');
  console.log(`Players: ${series.config.player1Name} vs ${series.config.player2Name}`);
  console.log(`Mode: ${series.config.legsMode}`);
  console.log(`Total Legs: ${series.config.totalLegs}`);
  console.log(`Current Leg: ${series.currentLegNumber}`);
  console.log(`Leg Score: ${series.legWins.p1} - ${series.legWins.p2}`);

  if (series.over) {
    console.log(`Match Complete: Yes`);
    console.log(`Overall Winner: ${series.overallWinner ?? 'Draw'}`);
    console.log(`Overall Result: ${series.overallResult}`);
  } else {
    console.log(`Match Complete: No`);
  }

  console.log('======================\n');
}

export function buildSeriesSummary(series) {
  return {
    matchComplete: series.over,
    overallWinner: series.overallWinner,
    overallResult: series.overallResult,
    mode: series.config.legsMode,
    totalLegs: series.config.totalLegs,
    player1Name: series.config.player1Name,
    player2Name: series.config.player2Name,
    legWins: {
      player1: series.legWins.p1,
      player2: series.legWins.p2
    },
    legs: series.completedLegs
  };
}