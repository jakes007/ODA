const ADMIN_FIXTURES_KEY = 'oda_admin_created_fixtures';

function getStoredAdminFixtures() {
  try {
    const stored = localStorage.getItem(ADMIN_FIXTURES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredAdminFixtures(fixtures) {
  localStorage.setItem(ADMIN_FIXTURES_KEY, JSON.stringify(fixtures));
}

export function createAdminFixture(fixtureData) {
  const existingFixtures = getStoredAdminFixtures();

  const newFixture = {
    id: `admin_fixture_${Date.now()}`,
    fixtureName: `${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`,
    date: fixtureData.date,
    division: fixtureData.division,
    homeTeam: fixtureData.homeTeam,
    awayTeam: fixtureData.awayTeam,
    homeTeamDisplay: fixtureData.homeTeam,
    awayTeamDisplay: fixtureData.awayTeam,
    scoreText: '0 - 0',
    complete: false,
    source: 'admin',
    playerRows: []
  };

  const updatedFixtures = [newFixture, ...existingFixtures];
  saveStoredAdminFixtures(updatedFixtures);

  return newFixture;
}

export function getAdminCreatedFixtures() {
  return getStoredAdminFixtures();
}

export function getCompetitionOverview() {
  const adminFixtures = getAdminCreatedFixtures();

  return {
    competition: {
      name: 'ODA League',
      season: '2026',
      status: 'active'
    },
    summary: {
      totalTeams: 3,
      totalRankedPlayers: 3,
      totalFixtures: 3 + adminFixtures.length,
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
    standings: []
  };
}

export function getCompetitionRankings() {
  return {
    competition: {
      name: 'ODA League',
      season: '2026',
      status: 'active'
    },
    rankings: []
  };
}

export function getCompetitionFixtures() {
  const adminFixtures = getAdminCreatedFixtures();

  return {
    competition: {
      name: 'ODA League',
      season: '2026',
      status: 'active'
    },
    fixtures: [
      ...adminFixtures,
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