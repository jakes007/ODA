// TEMP bridge (simulates backend output)

export function getCompetitionOverview() {
    return {
      competition: {
        name: 'ODA League',
        season: '2026',
        status: 'active'
      },
      summary: {
        totalTeams: 3,
        totalRankedPlayers: 3,
        totalFixtures: 3,
        completedFixtures: 3
      },
      topTeams: [
        { teamName: 'Observatory A', leaguePoints: 3, difference: 1 },
        { teamName: 'Observatory B', leaguePoints: 2, difference: 2 },
        { teamName: 'Observatory C', leaguePoints: 1, difference: -3 }
      ],
      topPlayers: [
        { playerId: 'player_peter', displayName: 'Peter', threeDartAverage: 60 },
        { playerId: 'player_jason', displayName: 'Jason', threeDartAverage: 51.86 },
        { playerId: 'player_mike', displayName: 'Mike', threeDartAverage: 33.33 }
      ],
      recentFixtures: [
        {
          fixtureName: 'Observatory A vs Observatory B',
          score: { teamA: 4, teamB: 3 },
          complete: true
        },
        {
          fixtureName: 'Observatory C vs Observatory A',
          score: { teamA: 3, teamB: 3 },
          complete: true
        },
        {
          fixtureName: 'Observatory B vs Observatory C',
          score: { teamA: 5, teamB: 2 },
          complete: true
        }
      ]
    };
  }