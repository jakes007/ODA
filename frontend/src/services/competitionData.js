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
  
  export function getCompetitionStandings() {
    return {
      competition: {
        name: 'ODA League',
        season: '2026',
        status: 'active'
      },
      standings: [
        {
          teamId: 'team_a',
          teamName: 'Observatory A',
          played: 2,
          won: 1,
          drawn: 1,
          lost: 0,
          pointsFor: 7,
          pointsAgainst: 6,
          difference: 1,
          leaguePoints: 3
        },
        {
          teamId: 'team_b',
          teamName: 'Observatory B',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          pointsFor: 8,
          pointsAgainst: 6,
          difference: 2,
          leaguePoints: 2
        },
        {
          teamId: 'team_c',
          teamName: 'Observatory C',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          pointsFor: 5,
          pointsAgainst: 8,
          difference: -3,
          leaguePoints: 1
        }
      ]
    };
  }
  
  export function getCompetitionRankings() {
    return {
      competition: {
        name: 'ODA League',
        season: '2026',
        status: 'active'
      },
      rankings: [
        {
          playerId: 'player_peter',
          displayName: 'Peter',
          matchesPlayed: 2,
          matchesWon: 2,
          threeDartAverage: 60,
          highestCheckout: 40
        },
        {
          playerId: 'player_jason',
          displayName: 'Jason',
          matchesPlayed: 3,
          matchesWon: 2,
          threeDartAverage: 51.86,
          highestCheckout: 81
        },
        {
          playerId: 'player_mike',
          displayName: 'Mike',
          matchesPlayed: 3,
          matchesWon: 1,
          threeDartAverage: 33.33,
          highestCheckout: 40
        }
      ]
    };
  }
  
  export function getCompetitionFixtures() {
    return {
      competition: {
        name: 'ODA League',
        season: '2026',
        status: 'active'
      },
      fixtures: [
        {
          id: 'fixture_001',
          fixtureName: 'Observatory A vs Observatory B',
          scoreText: '4 - 3',
          complete: true
        },
        {
          id: 'fixture_002',
          fixtureName: 'Observatory C vs Observatory A',
          scoreText: '3 - 3',
          complete: true
        },
        {
          id: 'fixture_003',
          fixtureName: 'Observatory B vs Observatory C',
          scoreText: '5 - 2',
          complete: true
        }
      ]
    };
  }