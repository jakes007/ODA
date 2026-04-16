import { createCompetition } from './dataModel.js';
import { createMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import {
  createPlayerHistoryStore,
  recordMatchSummaryForPlayers,
  getPlayerHistory,
  getPlayerHistoryByCompetition,
  printPlayerHistory
} from './playerHistory.js';

// --------------------------------------------
// Competitions
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
// History store
// --------------------------------------------
const historyStore = createPlayerHistoryStore();

// simple player ID map for test
const playerIdMap = {
  Jason: 'player_jason',
  B1: 'player_b1',
  B2: 'player_b2',
  Mike: 'player_mike'
};

// --------------------------------------------
// Match 1: Jason beats B1 in ODA League
// --------------------------------------------
let match1 = createMatch('Jason', 'B1', 40);
processTurn(match1, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});
const summary1 = buildMatchSummary(match1);

recordMatchSummaryForPlayers(
  historyStore,
  {
    playerIdMap,
    competitionId: odaLeague.competitionId,
    competitionName: odaLeague.name,
    matchType: 'singles',
    fixtureId: 'fixture_001',
    fixtureName: 'Observatory A vs Observatory B'
  },
  summary1
);

// --------------------------------------------
// Match 2: Jason loses to B2 in ODA League
// --------------------------------------------
let match2 = createMatch('Jason', 'B2', 40);
processTurn(match2, { points: 0 });
processTurn(match2, {
  points: 40,
  dartsUsed: 2,
  finishedOnDouble: true
});
const summary2 = buildMatchSummary(match2);

recordMatchSummaryForPlayers(
  historyStore,
  {
    playerIdMap,
    competitionId: odaLeague.competitionId,
    competitionName: odaLeague.name,
    matchType: 'singles',
    fixtureId: 'fixture_002',
    fixtureName: 'Observatory A vs Observatory C'
  },
  summary2
);

// --------------------------------------------
// Match 3: Jason beats Mike in ODA Singles League
// --------------------------------------------
let match3 = createMatch('Jason', 'Mike', 81);
processTurn(match3, {
  points: 81,
  dartsUsed: 3,
  finishedOnDouble: true
});
const summary3 = buildMatchSummary(match3);

recordMatchSummaryForPlayers(
  historyStore,
  {
    playerIdMap,
    competitionId: odaSingles.competitionId,
    competitionName: odaSingles.name,
    matchType: 'singles',
    fixtureId: null,
    fixtureName: 'Singles Round 1'
  },
  summary3
);

// --------------------------------------------
// Query history
// --------------------------------------------
const jasonHistory = getPlayerHistory(historyStore, 'player_jason');
const jasonLeagueHistory = getPlayerHistoryByCompetition(
  historyStore,
  'player_jason',
  odaLeague.competitionId
);
const jasonSinglesHistory = getPlayerHistoryByCompetition(
  historyStore,
  'player_jason',
  odaSingles.competitionId
);

printPlayerHistory('JASON FULL HISTORY', jasonHistory);
printPlayerHistory('JASON ODA LEAGUE HISTORY', jasonLeagueHistory);
printPlayerHistory('JASON ODA SINGLES HISTORY', jasonSinglesHistory);

console.log('\n===== RAW HISTORY STORE =====');
console.log(JSON.stringify(historyStore, null, 2));