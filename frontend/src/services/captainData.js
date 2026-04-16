export function getCaptainDashboardData(playerId) {
    const dashboardData = {
      player_mike: {
        captain: {
          playerId: 'player_mike',
          displayName: 'Mike Captain'
        },
        team: {
          teamId: 'team_a',
          teamName: 'Observatory A'
        },
        competition: {
          competitionId: 'competition_oda_league',
          name: 'ODA League',
          season: '2026',
          status: 'active'
        },
        fixtures: [
          {
            fixtureId: 'fixture_001',
            fixtureName: 'Observatory A vs Observatory B',
            opponentName: 'Observatory B',
            status: 'ready_for_lineup',
            scoreText: '-',
            captainAction: 'Set Lineup'
          },
          {
            fixtureId: 'fixture_002',
            fixtureName: 'Observatory C vs Observatory A',
            opponentName: 'Observatory C',
            status: 'ready_to_play',
            scoreText: '-',
            captainAction: 'Start Match'
          },
          {
            fixtureId: 'fixture_003',
            fixtureName: 'Observatory A vs Observatory D',
            opponentName: 'Observatory D',
            status: 'completed',
            scoreText: '4 - 3',
            captainAction: 'View Result'
          }
        ]
      }
    };
  
    return dashboardData[playerId] ?? null;
  }