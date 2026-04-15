import {
  createPlayerMasterRecord,
  buildPlayerPrivateProfile,
  buildPlayerPublicProfile,
  createCompetition,
  createCompetitionMembership,
  createTeam,
  createFixtureTemplate,
  createPlayerEditRequest,
  printObject
} from './dataModel.js';

// --------------------------------------------
// PLAYER MASTER RECORD
// --------------------------------------------
const jason = createPlayerMasterRecord({
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

printObject('PLAYER MASTER RECORD', jason);

// --------------------------------------------
// PRIVATE + PUBLIC PROFILES
// --------------------------------------------
const jasonPrivate = buildPlayerPrivateProfile(jason);
const jasonPublic = buildPlayerPublicProfile(jason, {
  displayName: 'Jason Isaacs'
});

printObject('PLAYER PRIVATE PROFILE', jasonPrivate);
printObject('PLAYER PUBLIC PROFILE', jasonPublic);

// --------------------------------------------
// COMPETITIONS
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

const odaMemorial = createCompetition({
  name: 'ODA Memorial',
  type: 'memorial',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

printObject('COMPETITION 1', odaLeague);
printObject('COMPETITION 2', odaSingles);
printObject('COMPETITION 3', odaMemorial);

// --------------------------------------------
// TEAM
// --------------------------------------------
const observatoryA = createTeam({
  name: 'Observatory A',
  associationName: 'Observatory Darts Association',
  competitionId: odaLeague.competitionId,
  captainPlayerId: jason.playerId
});

printObject('TEAM', observatoryA);

// --------------------------------------------
// MEMBERSHIPS
// Jason in multiple active competitions
// --------------------------------------------
const membership1 = createCompetitionMembership({
  playerId: jason.playerId,
  competitionId: odaLeague.competitionId,
  teamId: observatoryA.teamId,
  role: 'player',
  status: 'active'
});

const membership2 = createCompetitionMembership({
  playerId: jason.playerId,
  competitionId: odaSingles.competitionId,
  role: 'player',
  status: 'active'
});

const membership3 = createCompetitionMembership({
  playerId: jason.playerId,
  competitionId: odaMemorial.competitionId,
  role: 'player',
  status: 'active'
});

printObject('MEMBERSHIP 1', membership1);
printObject('MEMBERSHIP 2', membership2);
printObject('MEMBERSHIP 3', membership3);

// --------------------------------------------
// FIXTURE TEMPLATE
// Template + manual override later
// --------------------------------------------
const odaLeagueTemplate = createFixtureTemplate({
  name: 'ODA League Standard Format',
  competitionType: 'league',
  associationName: 'Observatory Darts Association',
  games: [
    { label: 'Doubles 1', type: 'doubles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Doubles 2', type: 'doubles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 1', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 2', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 3', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Singles 4', type: 'singles', startingScore: 501, legsMode: 'fixed', totalLegs: 1 },
    { label: 'Team Decider', type: 'team', startingScore: 701, legsMode: 'fixed', totalLegs: 1 }
  ]
});

printObject('FIXTURE TEMPLATE', odaLeagueTemplate);

// --------------------------------------------
// PLAYER EDIT REQUEST
// Example of self-service changes
// --------------------------------------------
const editRequest = createPlayerEditRequest({
  playerId: jason.playerId,
  requestedChanges: {
    contact: {
      phone: '0831111111',
      email: 'newjason@example.com'
    }
  }
});

printObject('PLAYER EDIT REQUEST', editRequest);