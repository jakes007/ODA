const captainFixtureStore = {
  player_mike: {
    fixtures: {
      fixture_001: {
        fixtureId: 'fixture_001',
        fixtureName: 'Observatory A vs Observatory B',
        competition: {
          competitionId: 'competition_oda_league',
          name: 'ODA League',
          season: '2026'
        },
        team: {
          teamId: 'team_a',
          teamName: 'Observatory A'
        },
        opponent: {
          teamId: 'team_b',
          teamName: 'Observatory B'
        },
        status: 'ready_for_lineup',
        squad: [
          { playerId: 'player_jason', displayName: 'Jason Isaacs' },
          { playerId: 'player_mike', displayName: 'Mike Captain' },
          { playerId: 'player_peter', displayName: 'Peter Player' },
          { playerId: 'player_adam', displayName: 'Adam Thrower' },
          { playerId: 'player_sub1', displayName: 'Ben Substitute' }
        ],
        requiredLineupSize: 4,
        currentLineup: [
          'player_jason',
          'player_mike',
          'player_peter',
          'player_adam'
        ],
        submittedLineup: null,
        liveSession: null,
        notes:
          'Captain sets the playing order here before the fixture is marked ready to play.',
        scoreText: '-'
      },
      fixture_002: {
        fixtureId: 'fixture_002',
        fixtureName: 'Observatory C vs Observatory A',
        competition: {
          competitionId: 'competition_oda_league',
          name: 'ODA League',
          season: '2026'
        },
        team: {
          teamId: 'team_a',
          teamName: 'Observatory A'
        },
        opponent: {
          teamId: 'team_c',
          teamName: 'Observatory C'
        },
        status: 'ready_to_play',
        squad: [
          { playerId: 'player_jason', displayName: 'Jason Isaacs' },
          { playerId: 'player_mike', displayName: 'Mike Captain' },
          { playerId: 'player_peter', displayName: 'Peter Player' },
          { playerId: 'player_adam', displayName: 'Adam Thrower' },
          { playerId: 'player_sub1', displayName: 'Ben Substitute' }
        ],
        requiredLineupSize: 4,
        currentLineup: [
          'player_mike',
          'player_jason',
          'player_peter',
          'player_adam'
        ],
        submittedLineup: [
          'player_mike',
          'player_jason',
          'player_peter',
          'player_adam'
        ],
        liveSession: null,
        notes: 'This fixture is already ready to play.',
        scoreText: '-'
      },
      fixture_003: {
        fixtureId: 'fixture_003',
        fixtureName: 'Observatory A vs Observatory D',
        competition: {
          competitionId: 'competition_oda_league',
          name: 'ODA League',
          season: '2026'
        },
        team: {
          teamId: 'team_a',
          teamName: 'Observatory A'
        },
        opponent: {
          teamId: 'team_d',
          teamName: 'Observatory D'
        },
        status: 'completed',
        squad: [
          { playerId: 'player_jason', displayName: 'Jason Isaacs' },
          { playerId: 'player_mike', displayName: 'Mike Captain' },
          { playerId: 'player_peter', displayName: 'Peter Player' },
          { playerId: 'player_adam', displayName: 'Adam Thrower' },
          { playerId: 'player_sub1', displayName: 'Ben Substitute' }
        ],
        requiredLineupSize: 4,
        currentLineup: [
          'player_jason',
          'player_mike',
          'player_peter',
          'player_adam'
        ],
        submittedLineup: [
          'player_jason',
          'player_mike',
          'player_peter',
          'player_adam'
        ],
        liveSession: null,
        notes: 'This fixture has already been completed.',
        scoreText: '4 - 3'
      }
    }
  }
};

export function getCaptainDashboardData(playerId) {
  const playerStore = captainFixtureStore[playerId];
  if (!playerStore) return null;

  const fixtures = Object.values(playerStore.fixtures).map((fixture) => ({
    fixtureId: fixture.fixtureId,
    fixtureName: fixture.fixtureName,
    opponentName: fixture.opponent.teamName,
    status: fixture.status,
    scoreText: fixture.scoreText,
    captainAction: getCaptainActionLabel(fixture.status)
  }));

  return {
    captain: {
      playerId,
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
    fixtures
  };
}

export function getCaptainFixtureSetupData(playerId, fixtureId) {
  return captainFixtureStore[playerId]?.fixtures?.[fixtureId] ?? null;
}

export function getCaptainLiveScoringData(playerId, fixtureId) {
  return captainFixtureStore[playerId]?.fixtures?.[fixtureId] ?? null;
}

export function validateCaptainLineup(fixture, lineup) {
  if (!fixture) {
    return {
      valid: false,
      errors: ['Fixture not found']
    };
  }

  const errors = [];

  if (!Array.isArray(lineup)) {
    return {
      valid: false,
      errors: ['Lineup format is invalid']
    };
  }

  if (lineup.length !== fixture.requiredLineupSize) {
    errors.push(`Lineup must contain exactly ${fixture.requiredLineupSize} players`);
  }

  const squadIds = new Set(fixture.squad.map((player) => player.playerId));

  for (const playerId of lineup) {
    if (!playerId) {
      errors.push('Every lineup slot must have a selected player');
      continue;
    }

    if (!squadIds.has(playerId)) {
      errors.push(`Selected player ${playerId} is not in the squad`);
    }
  }

  const uniquePlayerIds = new Set(lineup.filter(Boolean));
  if (uniquePlayerIds.size !== lineup.filter(Boolean).length) {
    errors.push('A player cannot appear more than once in the lineup');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function submitCaptainLineup(playerId, fixtureId, lineup) {
  const fixture = getCaptainFixtureSetupData(playerId, fixtureId);

  if (!fixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  if (fixture.status === 'completed') {
    return {
      success: false,
      message: 'Completed fixtures cannot be changed'
    };
  }

  if (fixture.status === 'active') {
    return {
      success: false,
      message: 'An active fixture lineup cannot be changed'
    };
  }

  const validation = validateCaptainLineup(fixture, lineup);

  if (!validation.valid) {
    return {
      success: false,
      message: 'Lineup validation failed',
      errors: validation.errors
    };
  }

  fixture.currentLineup = [...lineup];
  fixture.submittedLineup = [...lineup];
  fixture.status = 'ready_to_play';
  fixture.liveSession = null;

  return {
    success: true,
    message: 'Lineup submitted and fixture marked ready to play',
    fixture
  };
}

export function startCaptainFixtureLiveScoring(playerId, fixtureId) {
  const fixture = getCaptainFixtureSetupData(playerId, fixtureId);

  if (!fixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  if (fixture.status === 'completed') {
    return {
      success: false,
      message: 'Completed fixtures cannot be started again'
    };
  }

  if (fixture.status === 'active') {
    return {
      success: true,
      message: 'Fixture is already active',
      fixture
    };
  }

  if (fixture.status !== 'ready_to_play') {
    return {
      success: false,
      message: 'Fixture must be ready to play before live scoring can start'
    };
  }

  const validation = validateCaptainLineup(
    fixture,
    fixture.submittedLineup ?? fixture.currentLineup ?? []
  );

  if (!validation.valid) {
    return {
      success: false,
      message: 'Cannot start match because lineup is not valid',
      errors: validation.errors
    };
  }

  fixture.status = 'active';
  fixture.liveSession = {
    startedAt: new Date().toISOString(),
    startedByCaptainId: playerId,
    currentGameIndex: 0,
    status: 'active',
    games: []
  };

  return {
    success: true,
    message: 'Fixture is now active and live scoring has started',
    fixture
  };
}

function getCaptainActionLabel(status) {
  const labels = {
    ready_for_lineup: 'Set Lineup',
    ready_to_play: 'Start Match',
    active: 'Resume Live Match',
    completed: 'View Result'
  };

  return labels[status] ?? 'Open';
}