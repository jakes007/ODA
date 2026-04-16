export function getPlayerProfile(playerId) {
    const profiles = {
      player_jason: {
        player: {
          playerId: 'player_jason',
          displayName: 'Jason Isaacs',
          associationName: 'Observatory Darts Association',
          provinceName: 'Western Cape',
          publicStatus: 'active'
        },
        aggregate: {
          matchesPlayed: 2,
          matchesWon: 2,
          matchesLost: 0,
          threeDartAverage: 90.75,
          highestCheckout: 81
        },
        history: [
          {
            historyId: 'history_001',
            competitionName: 'ODA League',
            fixtureName: 'Observatory A vs Observatory B',
            playedAt: '2026-04-16',
            summary: {
              players: [
                {
                  name: 'Jason',
                  result: 'win',
                  threeDartAverage: 120,
                  highestCheckout: 40,
                  isProfileOwner: true
                }
              ]
            }
          },
          {
            historyId: 'history_002',
            competitionName: 'ODA Singles League',
            fixtureName: 'Singles Round 1',
            playedAt: '2026-04-16',
            summary: {
              players: [
                {
                  name: 'Jason',
                  result: 'win',
                  threeDartAverage: 81,
                  highestCheckout: 81,
                  isProfileOwner: true
                }
              ]
            }
          }
        ]
      }
    };
  
    return profiles[playerId] ?? null;
  }