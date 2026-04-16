import { registerPlayer, createEmptyRegistry } from './playerRegistry.js';
import { createCompetition } from './dataModel.js';
import { createMatch } from './engine.js';
import { processTurn } from './rules.js';
import { buildMatchSummary } from './matchSummary.js';
import {
  createPlayerHistoryStore,
  recordMatchSummaryForPlayers
} from './playerHistory.js';
import {
  createPlayerAggregate,
  addMatchSummaryToPlayerAggregate
} from './statsAggregator.js';
import {
  buildAdminPlayerProfile,
  buildPrivatePlayerProfile,
  buildPublicPlayerProfile,
  buildCompetitionSpecificProfile,
  printPlayerProfile
} from './playerProfile.js';

// --------------------------------------------
// Setup registry + player
// --------------------------------------------
const registry = createEmptyRegistry();

const registerResult = registerPlayer(registry, {
  fullName: 'Jason Isaacs',
  dsaNumber: 'DSA12345',
  idNumber: '9001015009087',
  dateOfBirth: '1990-01-01',
  race: 'ExampleRace',
  gender: 'Male',
  registrationStatus: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape',
  phone: '0820000000',
  email: 'jason@example.com',
  addressLine1: '1 Main Road',
  addressLine2: 'Observatory',
  city: 'Cape Town',
  postalCode: '7925'
});

const playerId = registerResult.player.playerId;

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
// History + aggregates
// --------------------------------------------
const historyStore = createPlayerHistoryStore();
const jasonAggregate = createPlayerAggregate(playerId, 'Jason');

const playerIdMap = {
  Jason: playerId,
  B1: 'player_b1',
  Mike: 'player_mike'
};

// Match 1
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

addMatchSummaryToPlayerAggregate(
  jasonAggregate,
  odaLeague.competitionId,
  odaLeague.name,
  summary1
);

// Match 2
let match2 = createMatch('Jason', 'Mike', 81);
processTurn(match2, {
  points: 81,
  dartsUsed: 3,
  finishedOnDouble: true
});
const summary2 = buildMatchSummary(match2);

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
  summary2
);

addMatchSummaryToPlayerAggregate(
  jasonAggregate,
  odaSingles.competitionId,
  odaSingles.name,
  summary2
);

// --------------------------------------------
// Build profiles
// --------------------------------------------
const adminProfile = buildAdminPlayerProfile({
  registry,
  historyStore,
  aggregate: jasonAggregate,
  playerId
});

const privateProfile = buildPrivatePlayerProfile({
  registry,
  historyStore,
  aggregate: jasonAggregate,
  playerId
});

const publicProfile = buildPublicPlayerProfile({
  registry,
  historyStore,
  aggregate: jasonAggregate,
  playerId,
  displayName: 'Jason Isaacs'
});

const leagueProfile = buildCompetitionSpecificProfile({
  registry,
  historyStore,
  aggregate: jasonAggregate,
  playerId,
  competitionId: odaLeague.competitionId,
  displayName: 'Jason Isaacs',
  visibility: 'public'
});

printPlayerProfile('ADMIN PROFILE', adminProfile.profile);
printPlayerProfile('PRIVATE PROFILE', privateProfile.profile);
printPlayerProfile('PUBLIC PROFILE', publicProfile.profile);
printPlayerProfile('PUBLIC LEAGUE PROFILE', leagueProfile.profile);