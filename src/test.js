import { createCompetition, createTeam } from './dataModel.js';
import {
  createCompetitionTableStore,
  recordFixtureResultForStandings,
  recordPlayerAggregateForRanking,
  getSortedTeamStandings,
  getSortedPlayerRankings
} from './competitionTables.js';
import { createPlayerAggregate } from './statsAggregator.js';
import {
  buildCompetitionStandingsPage,
  buildCompetitionRankingsPage,
  buildCompetitionFixturesPage,
  buildCompetitionOverviewPage,
  printCompetitionView
} from './competitionViews.js';

// --------------------------------------------
// Competition
// --------------------------------------------
const odaLeague = createCompetition({
  name: 'ODA League',
  type: 'league',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

// --------------------------------------------
// Teams
// --------------------------------------------
const observatoryA = createTeam({
  name: 'Observatory A',
  associationName: 'Observatory Darts Association',
  competitionId: odaLeague.competitionId
});

const observatoryB = createTeam({
  name: 'Observatory B',
  associationName: 'Observatory Darts Association',
  competitionId: odaLeague.competitionId
});

const observatoryC = createTeam({
  name: 'Observatory C',
  associationName: 'Observatory Darts Association',
  competitionId: odaLeague.competitionId
});

// --------------------------------------------
// Table store + standings
// --------------------------------------------
const tableStore = createCompetitionTableStore();

recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryA.teamId, name: observatoryA.name },
  teamB: { teamId: observatoryB.teamId, name: observatoryB.name },
  score: { teamA: 4, teamB: 3 }
});

recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryC.teamId, name: observatoryC.name },
  teamB: { teamId: observatoryA.teamId, name: observatoryA.name },
  score: { teamA: 3, teamB: 3 }
});

recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryB.teamId, name: observatoryB.name },
  teamB: { teamId: observatoryC.teamId, name: observatoryC.name },
  score: { teamA: 5, teamB: 2 }
});

const standings = getSortedTeamStandings(tableStore);

// --------------------------------------------
// Player rankings
// --------------------------------------------
const jasonAggregate = createPlayerAggregate('player_jason', 'Jason');
jasonAggregate.competitions[odaLeague.competitionId] = {
  competitionId: odaLeague.competitionId,
  competitionName: odaLeague.name,
  stats: {
    matchesPlayed: 3,
    matchesWon: 2,
    matchesLost: 1,
    matchesDrawn: 0,
    dartsUsed: 7,
    throws: 3,
    totalScored: 121,
    count100Plus: 0,
    count140Plus: 0,
    count180s: 0,
    highestCheckout: 81,
    threeDartAverage: 51.86
  }
};

const mikeAggregate = createPlayerAggregate('player_mike', 'Mike');
mikeAggregate.competitions[odaLeague.competitionId] = {
  competitionId: odaLeague.competitionId,
  competitionName: odaLeague.name,
  stats: {
    matchesPlayed: 3,
    matchesWon: 1,
    matchesLost: 2,
    matchesDrawn: 0,
    dartsUsed: 9,
    throws: 3,
    totalScored: 100,
    count100Plus: 1,
    count140Plus: 0,
    count180s: 0,
    highestCheckout: 40,
    threeDartAverage: 33.33
  }
};

const peterAggregate = createPlayerAggregate('player_peter', 'Peter');
peterAggregate.competitions[odaLeague.competitionId] = {
  competitionId: odaLeague.competitionId,
  competitionName: odaLeague.name,
  stats: {
    matchesPlayed: 2,
    matchesWon: 2,
    matchesLost: 0,
    matchesDrawn: 0,
    dartsUsed: 4,
    throws: 2,
    totalScored: 80,
    count100Plus: 0,
    count140Plus: 0,
    count180s: 0,
    highestCheckout: 40,
    threeDartAverage: 60
  }
};

recordPlayerAggregateForRanking(tableStore, jasonAggregate, odaLeague.competitionId);
recordPlayerAggregateForRanking(tableStore, mikeAggregate, odaLeague.competitionId);
recordPlayerAggregateForRanking(tableStore, peterAggregate, odaLeague.competitionId);

const rankings = getSortedPlayerRankings(tableStore);

// --------------------------------------------
// Fixture list
// --------------------------------------------
const fixtures = [
  {
    fixtureId: 'fixture_001',
    fixtureName: 'Observatory A vs Observatory B',
    teamA: { teamId: observatoryA.teamId, name: observatoryA.name },
    teamB: { teamId: observatoryB.teamId, name: observatoryB.name },
    score: { teamA: 4, teamB: 3 },
    complete: true,
    games: [
      { order: 1, label: 'Singles 1', type: 'singles', status: 'completed', winner: 'teamA' },
      { order: 2, label: 'Singles 2', type: 'singles', status: 'completed', winner: 'teamB' }
    ]
  },
  {
    fixtureId: 'fixture_002',
    fixtureName: 'Observatory C vs Observatory A',
    teamA: { teamId: observatoryC.teamId, name: observatoryC.name },
    teamB: { teamId: observatoryA.teamId, name: observatoryA.name },
    score: { teamA: 3, teamB: 3 },
    complete: true,
    games: [
      { order: 1, label: 'Singles 1', type: 'singles', status: 'completed', winner: 'teamA' },
      { order: 2, label: 'Singles 2', type: 'singles', status: 'completed', winner: 'teamB' }
    ]
  },
  {
    fixtureId: 'fixture_003',
    fixtureName: 'Observatory B vs Observatory C',
    teamA: { teamId: observatoryB.teamId, name: observatoryB.name },
    teamB: { teamId: observatoryC.teamId, name: observatoryC.name },
    score: { teamA: 5, teamB: 2 },
    complete: true,
    games: [
      { order: 1, label: 'Singles 1', type: 'singles', status: 'completed', winner: 'teamA' },
      { order: 2, label: 'Singles 2', type: 'singles', status: 'completed', winner: 'teamA' }
    ]
  }
];

// --------------------------------------------
// Build view models
// --------------------------------------------
const standingsPage = buildCompetitionStandingsPage({
  competition: odaLeague,
  standings
});

const rankingsPage = buildCompetitionRankingsPage({
  competition: odaLeague,
  rankings
});

const fixturesPage = buildCompetitionFixturesPage({
  competition: odaLeague,
  fixtures
});

const overviewPage = buildCompetitionOverviewPage({
  competition: odaLeague,
  standings,
  rankings,
  fixtures
});

printCompetitionView('STANDINGS PAGE', standingsPage);
printCompetitionView('RANKINGS PAGE', rankingsPage);
printCompetitionView('FIXTURES PAGE', fixturesPage);
printCompetitionView('OVERVIEW PAGE', overviewPage);