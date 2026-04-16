import { createCompetition } from './dataModel.js';
import { createMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import {
  createPlayerHistoryStore,
  recordMatchSummaryForPlayers
} from './playerHistory.js';
import {
  buildHeadToHead,
  printHeadToHead
} from './headToHead.js';

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

const playerIdMap = {
  Jason: 'player_jason',
  Mike: 'player_mike',
  B1: 'player_b1'
};

// --------------------------------------------
// Match 1: Jason beats Mike in league
// --------------------------------------------
let match1 = createMatch('Jason', 'Mike', 40);
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
// Match 2: Mike beats Jason in league
// --------------------------------------------
let match2 = createMatch('Jason', 'Mike', 40);
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
// Match 3: Jason beats Mike in singles comp
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
// Unrelated match: Jason vs B1
// --------------------------------------------
let match4 = createMatch('Jason', 'B1', 40);
processTurn(match4, {
  points: 40,
  dartsUsed: 1,
  finishedOnDouble: true
});
const summary4 = buildMatchSummary(match4);

recordMatchSummaryForPlayers(
  historyStore,
  {
    playerIdMap,
    competitionId: odaLeague.competitionId,
    competitionName: odaLeague.name,
    matchType: 'singles',
    fixtureId: 'fixture_003',
    fixtureName: 'Observatory A vs Observatory D'
  },
  summary4
);

// --------------------------------------------
// Build head-to-head
// --------------------------------------------
const jasonVsMike = buildHeadToHead(
  historyStore,
  'player_jason',
  'player_mike'
);

printHeadToHead('JASON VS MIKE', jasonVsMike);

console.log('\n===== RAW HEAD TO HEAD =====');
console.log(JSON.stringify(jasonVsMike, null, 2));