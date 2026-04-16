export function buildCompetitionStandingsPage({
    competition,
    standings
  }) {
    return {
      pageType: 'competition_standings',
      competition: {
        competitionId: competition.competitionId,
        name: competition.name,
        type: competition.type,
        season: competition.season,
        status: competition.status,
        associationName: competition.associationName,
        provinceName: competition.provinceName
      },
      standings
    };
  }
  
  export function buildCompetitionRankingsPage({
    competition,
    rankings
  }) {
    return {
      pageType: 'competition_rankings',
      competition: {
        competitionId: competition.competitionId,
        name: competition.name,
        type: competition.type,
        season: competition.season,
        status: competition.status,
        associationName: competition.associationName,
        provinceName: competition.provinceName
      },
      rankings
    };
  }
  
  export function buildCompetitionFixturesPage({
    competition,
    fixtures
  }) {
    return {
      pageType: 'competition_fixtures',
      competition: {
        competitionId: competition.competitionId,
        name: competition.name,
        type: competition.type,
        season: competition.season,
        status: competition.status,
        associationName: competition.associationName,
        provinceName: competition.provinceName
      },
      fixtures: fixtures.map((fixture) => ({
        fixtureId: fixture.fixtureId ?? null,
        fixtureName: fixture.fixtureName,
        teamA: fixture.teamA,
        teamB: fixture.teamB,
        score: fixture.score,
        complete: fixture.complete,
        games: fixture.games.map((game) => ({
          order: game.order,
          label: game.label,
          type: game.type,
          status: game.status,
          winner: game.winner
        }))
      }))
    };
  }
  
  export function buildCompetitionOverviewPage({
    competition,
    standings,
    rankings,
    fixtures
  }) {
    return {
      pageType: 'competition_overview',
      competition: {
        competitionId: competition.competitionId,
        name: competition.name,
        type: competition.type,
        season: competition.season,
        status: competition.status,
        associationName: competition.associationName,
        provinceName: competition.provinceName
      },
      summary: {
        totalTeams: standings.length,
        totalRankedPlayers: rankings.length,
        totalFixtures: fixtures.length,
        completedFixtures: fixtures.filter((f) => f.complete).length
      },
      topTeams: standings.slice(0, 3),
      topPlayers: rankings.slice(0, 5),
      recentFixtures: fixtures.slice(0, 5).map((fixture) => ({
        fixtureId: fixture.fixtureId ?? null,
        fixtureName: fixture.fixtureName,
        teamA: fixture.teamA,
        teamB: fixture.teamB,
        score: fixture.score,
        complete: fixture.complete
      }))
    };
  }
  
  export function printCompetitionView(title, viewModel) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(viewModel, null, 2));
  }