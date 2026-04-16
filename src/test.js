import { createCompetition } from './dataModel.js';
import { createMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import {
  createPlayerAggregate,
  addMatchSummaryToPlayerAggregate,
  buildLeaderboardRows,
  sortLeaderboardByAverage,
  printAggregate,
  printLeaderboard
} from './statsAggregator.js';

// --------------------------------------------
// Create competitions
// --------------------------------------------
const odaLeague = createCompetition({
  name: 'ODA League',
  type: 'league',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

const odaSingles = createCompetition({
  name: 'ODA Singles League',
  type: 'singles',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

// --------------------------------------------
// Build some real match summaries
// --------------------------------------------

// Match 1: Jason beats B1 in ODA League
let match1 = createMatch('Jason', 'B1', 40);
processTurn(match1, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});
const summary1 = buildMatchSummary(match1);

// Match 2: Jason loses to B2 in ODA League
let match2 = createMatch('Jason', 'B2', 40);
processTurn(match2, {
  points: 0
});
processTurn(match2, {
  points: 40,
  dartsUsed: 2,
  finishedOnDouble: true
});
const summary2 = buildMatchSummary(match2);

// Match 3: Jason beats Mike in ODA Singles League
let match3 = createMatch('Jason', 'Mike', 81);
processTurn(match3, {
  points: 81,
  dartsUsed: 3,
  finishedOnDouble: true
});
const summary3 = buildMatchSummary(match3);

// --------------------------------------------
// Create player aggregates
// --------------------------------------------
const jasonAggregate = createPlayerAggregate('player_jason', 'Jason');
const b1Aggregate = createPlayerAggregate('player_b1', 'B1');
const b2Aggregate = createPlayerAggregate('player_b2', 'B2');
const mikeAggregate = createPlayerAggregate('player_mike', 'Mike');

// --------------------------------------------
// Apply summaries to aggregates
// --------------------------------------------
addMatchSummaryToPlayerAggregate(jasonAggregate, odaLeague.competitionId, odaLeague.name, summary1);
addMatchSummaryToPlayerAggregate(b1Aggregate, odaLeague.competitionId, odaLeague.name, summary1);

addMatchSummaryToPlayerAggregate(jasonAggregate, odaLeague.competitionId, odaLeague.name, summary2);
addMatchSummaryToPlayerAggregate(b2Aggregate, odaLeague.competitionId, odaLeague.name, summary2);

addMatchSummaryToPlayerAggregate(jasonAggregate, odaSingles.competitionId, odaSingles.name, summary3);
addMatchSummaryToPlayerAggregate(mikeAggregate, odaSingles.competitionId, odaSingles.name, summary3);

// --------------------------------------------
// Print aggregates
// --------------------------------------------
printAggregate('JASON AGGREGATE', jasonAggregate);
printAggregate('B1 AGGREGATE', b1Aggregate);
printAggregate('B2 AGGREGATE', b2Aggregate);
printAggregate('MIKE AGGREGATE', mikeAggregate);

// --------------------------------------------
// Build leaderboards
// --------------------------------------------
const allAggregates = [jasonAggregate, b1Aggregate, b2Aggregate, mikeAggregate];

const overallLeaderboard = sortLeaderboardByAverage(
  buildLeaderboardRows(allAggregates)
);

const odaLeagueLeaderboard = sortLeaderboardByAverage(
  buildLeaderboardRows(allAggregates, odaLeague.competitionId)
);

const odaSinglesLeaderboard = sortLeaderboardByAverage(
  buildLeaderboardRows(allAggregates, odaSingles.competitionId)
);

printLeaderboard('OVERALL LEADERBOARD', overallLeaderboard);
printLeaderboard('ODA LEAGUE LEADERBOARD', odaLeagueLeaderboard);
printLeaderboard('ODA SINGLES LEADERBOARD', odaSinglesLeaderboard);

// --------------------------------------------
// Raw summaries
// --------------------------------------------
console.log('\n===== RAW MATCH SUMMARIES =====');
console.log(JSON.stringify([summary1, summary2, summary3], null, 2));