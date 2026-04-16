import { createCompetition, createTeam } from './dataModel.js';
import { createPlayerAggregate } from './statsAggregator.js';
import {
  createCompetitionTableStore,
  recordFixtureResultForStandings,
  recordPlayerAggregateForRanking,
  getSortedTeamStandings,
  getSortedPlayerRankings,
  printTeamStandings,
  printPlayerRankings
} from './competitionTables.js';

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
// Team standings store
// --------------------------------------------
const tableStore = createCompetitionTableStore();

// Fixture 1: A beats B 4-3
recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryA.teamId, name: observatoryA.name },
  teamB: { teamId: observatoryB.teamId, name: observatoryB.name },
  score: { teamA: 4, teamB: 3 }
});

// Fixture 2: C draws with A 3-3
recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryC.teamId, name: observatoryC.name },
  teamB: { teamId: observatoryA.teamId, name: observatoryA.name },
  score: { teamA: 3, teamB: 3 }
});

// Fixture 3: B beats C 5-2
recordFixtureResultForStandings(tableStore, {
  teamA: { teamId: observatoryB.teamId, name: observatoryB.name },
  teamB: { teamId: observatoryC.teamId, name: observatoryC.name },
  score: { teamA: 5, teamB: 2 }
});

const standings = getSortedTeamStandings(tableStore);
printTeamStandings('ODA LEAGUE TABLE', standings);

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
printPlayerRankings('ODA LEAGUE PLAYER RANKINGS', rankings);

console.log('\n===== RAW TABLE STORE =====');
console.log(JSON.stringify(tableStore, null, 2));