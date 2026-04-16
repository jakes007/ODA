const captainFixtureStore = {
  player_mike: {
    captainSide: 'home',
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
        status: 'ready_for_lineups',
        requiredLineupSize: 4,
        scoreText: '-',
        notes:
          'Each captain submits their lineup privately. Both lineups are only revealed once both sides have submitted.',
        liveSession: null,
        lineupsRevealed: false,
        sides: {
          home: {
            teamName: 'Observatory A',
            squad: [
              { playerId: 'player_jason', displayName: 'Jason Isaacs' },
              { playerId: 'player_mike', displayName: 'Mike Captain' },
              { playerId: 'player_peter', displayName: 'Peter Player' },
              { playerId: 'player_adam', displayName: 'Adam Thrower' },
              { playerId: 'player_sub1', displayName: 'Ben Substitute' }
            ],
            currentLineup: [
              'player_jason',
              'player_mike',
              'player_peter',
              'player_adam'
            ],
            submittedLineup: null,
            submitted: false,
            submittedAt: null
          },
          away: {
            teamName: 'Observatory B',
            squad: [
              { playerId: 'player_brian', displayName: 'Brian Opponent' },
              { playerId: 'player_chris', displayName: 'Chris Rival' },
              { playerId: 'player_dean', displayName: 'Dean Shooter' },
              { playerId: 'player_eli', displayName: 'Eli Opponent' },
              { playerId: 'player_sub2', displayName: 'Sam Reserve' }
            ],
            currentLineup: [
              'player_brian',
              'player_chris',
              'player_dean',
              'player_eli'
            ],
            submittedLineup: null,
            submitted: false,
            submittedAt: null
          }
        }
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
        status: 'waiting_for_opponent',
        requiredLineupSize: 4,
        scoreText: '-',
        notes:
          'Home captain has already submitted. This side is waiting for the opposing captain to submit.',
        liveSession: null,
        lineupsRevealed: false,
        sides: {
          home: {
            teamName: 'Observatory C',
            squad: [
              { playerId: 'player_c1', displayName: 'Carl Home' },
              { playerId: 'player_c2', displayName: 'Clive Home' },
              { playerId: 'player_c3', displayName: 'Connor Home' },
              { playerId: 'player_c4', displayName: 'Calvin Home' },
              { playerId: 'player_c5', displayName: 'Colin Reserve' }
            ],
            currentLineup: [
              'player_c1',
              'player_c2',
              'player_c3',
              'player_c4'
            ],
            submittedLineup: [
              'player_c1',
              'player_c2',
              'player_c3',
              'player_c4'
            ],
            submitted: true,
            submittedAt: '2026-04-17T12:00:00.000Z'
          },
          away: {
            teamName: 'Observatory A',
            squad: [
              { playerId: 'player_jason', displayName: 'Jason Isaacs' },
              { playerId: 'player_mike', displayName: 'Mike Captain' },
              { playerId: 'player_peter', displayName: 'Peter Player' },
              { playerId: 'player_adam', displayName: 'Adam Thrower' },
              { playerId: 'player_sub1', displayName: 'Ben Substitute' }
            ],
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
            submitted: true,
            submittedAt: '2026-04-17T12:05:00.000Z'
          }
        }
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
        requiredLineupSize: 4,
        scoreText: '4 - 3',
        notes: 'This fixture has already been completed.',
        liveSession: null,
        lineupsRevealed: true,
        sides: {
          home: {
            teamName: 'Observatory A',
            squad: [
              { playerId: 'player_jason', displayName: 'Jason Isaacs' },
              { playerId: 'player_mike', displayName: 'Mike Captain' },
              { playerId: 'player_peter', displayName: 'Peter Player' },
              { playerId: 'player_adam', displayName: 'Adam Thrower' },
              { playerId: 'player_sub1', displayName: 'Ben Substitute' }
            ],
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
            submitted: true,
            submittedAt: '2026-04-10T18:00:00.000Z'
          },
          away: {
            teamName: 'Observatory D',
            squad: [
              { playerId: 'player_d1', displayName: 'Dylan Away' },
              { playerId: 'player_d2', displayName: 'Darren Away' },
              { playerId: 'player_d3', displayName: 'Devon Away' },
              { playerId: 'player_d4', displayName: 'Duke Away' },
              { playerId: 'player_d5', displayName: 'Damon Reserve' }
            ],
            currentLineup: [
              'player_d1',
              'player_d2',
              'player_d3',
              'player_d4'
            ],
            submittedLineup: [
              'player_d1',
              'player_d2',
              'player_d3',
              'player_d4'
            ],
            submitted: true,
            submittedAt: '2026-04-10T18:03:00.000Z'
          }
        }
      }
    }
  },

  player_brian: {
    captainSide: 'away',
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
          teamId: 'team_b',
          teamName: 'Observatory B'
        },
        opponent: {
          teamId: 'team_a',
          teamName: 'Observatory A'
        },
        status: 'ready_for_lineups',
        requiredLineupSize: 4,
        scoreText: '-',
        notes:
          'Each captain submits their lineup privately. Both lineups are only revealed once both sides have submitted.',
        liveSession: null,
        lineupsRevealed: false,
        sides: {
          home: {
            teamName: 'Observatory A',
            squad: [
              { playerId: 'player_jason', displayName: 'Jason Isaacs' },
              { playerId: 'player_mike', displayName: 'Mike Captain' },
              { playerId: 'player_peter', displayName: 'Peter Player' },
              { playerId: 'player_adam', displayName: 'Adam Thrower' },
              { playerId: 'player_sub1', displayName: 'Ben Substitute' }
            ],
            currentLineup: [
              'player_jason',
              'player_mike',
              'player_peter',
              'player_adam'
            ],
            submittedLineup: null,
            submitted: false,
            submittedAt: null
          },
          away: {
            teamName: 'Observatory B',
            squad: [
              { playerId: 'player_brian', displayName: 'Brian Opponent' },
              { playerId: 'player_chris', displayName: 'Chris Rival' },
              { playerId: 'player_dean', displayName: 'Dean Shooter' },
              { playerId: 'player_eli', displayName: 'Eli Opponent' },
              { playerId: 'player_sub2', displayName: 'Sam Reserve' }
            ],
            currentLineup: [
              'player_brian',
              'player_chris',
              'player_dean',
              'player_eli'
            ],
            submittedLineup: null,
            submitted: false,
            submittedAt: null
          }
        }
      }
    }
  }
};

function cloneFixtureForViewer(playerId, fixture) {
  const captainSide = getCaptainSide(playerId);
  const viewerSide = fixture.sides[captainSide];
  const opponentSideKey = getOpponentSide(captainSide);
  const opponentSide = fixture.sides[opponentSideKey];
  const canReveal = canRevealLineups(fixture);

  return {
    fixtureId: fixture.fixtureId,
    fixtureName: fixture.fixtureName,
    competition: fixture.competition,
    team: fixture.team,
    opponent: fixture.opponent,
    status: deriveFixtureStatus(fixture),
    requiredLineupSize: fixture.requiredLineupSize,
    scoreText: fixture.scoreText,
    notes: fixture.notes,
    liveSession: fixture.liveSession,
    lineupsRevealed: canReveal,
    captainSide,
    opponentSide: opponentSideKey,
    myTeam: {
      teamName: viewerSide.teamName,
      squad: viewerSide.squad,
      currentLineup: [...viewerSide.currentLineup],
      submittedLineup: viewerSide.submittedLineup ? [...viewerSide.submittedLineup] : null,
      submitted: viewerSide.submitted,
      submittedAt: viewerSide.submittedAt
    },
    opponentTeam: {
      teamName: opponentSide.teamName,
      squad: canReveal ? opponentSide.squad : [],
      currentLineup: canReveal ? [...opponentSide.currentLineup] : [],
      submittedLineup:
        canReveal && opponentSide.submittedLineup ? [...opponentSide.submittedLineup] : null,
      submitted: opponentSide.submitted,
      submittedAt: opponentSide.submittedAt
    }
  };
}

function getCaptainSide(playerId) {
  return captainFixtureStore[playerId]?.captainSide ?? 'home';
}

function getOpponentSide(side) {
  return side === 'home' ? 'away' : 'home';
}

function getRawFixture(playerId, fixtureId) {
  return captainFixtureStore[playerId]?.fixtures?.[fixtureId] ?? null;
}

function canRevealLineups(fixture) {
  return Boolean(fixture.sides.home.submitted && fixture.sides.away.submitted);
}

function deriveFixtureStatus(fixture) {
  if (fixture.status === 'active' || fixture.status === 'completed') {
    return fixture.status;
  }

  const homeSubmitted = fixture.sides.home.submitted;
  const awaySubmitted = fixture.sides.away.submitted;

  if (homeSubmitted && awaySubmitted) {
    return 'ready_to_play';
  }

  if (homeSubmitted || awaySubmitted) {
    return 'waiting_for_opponent';
  }

  return 'ready_for_lineups';
}

function syncFixtureStatus(fixture) {
  fixture.lineupsRevealed = canRevealLineups(fixture);
  fixture.status = deriveFixtureStatus(fixture);
}

export function getCaptainDashboardData(playerId) {
  const playerStore = captainFixtureStore[playerId];
  if (!playerStore) return null;

  const fixtures = Object.values(playerStore.fixtures).map((fixture) => {
    const status = deriveFixtureStatus(fixture);

    return {
      fixtureId: fixture.fixtureId,
      fixtureName: fixture.fixtureName,
      opponentName: fixture.opponent.teamName,
      status,
      scoreText: fixture.scoreText,
      captainAction: getCaptainActionLabel(status),
      lineupsRevealed: canRevealLineups(fixture)
    };
  });

  return {
    captain: {
      playerId,
      displayName: playerId === 'player_brian' ? 'Brian Opponent' : 'Mike Captain'
    },
    team: {
      teamId: playerId === 'player_brian' ? 'team_b' : 'team_a',
      teamName: playerId === 'player_brian' ? 'Observatory B' : 'Observatory A'
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
  const fixture = getRawFixture(playerId, fixtureId);
  if (!fixture) return null;

  syncFixtureStatus(fixture);
  return cloneFixtureForViewer(playerId, fixture);
}

export function getCaptainLiveScoringData(playerId, fixtureId) {
  const fixture = getRawFixture(playerId, fixtureId);
  if (!fixture) return null;

  syncFixtureStatus(fixture);
  return cloneFixtureForViewer(playerId, fixture);
}

export function validateCaptainLineup(fixture, lineup) {
  if (!fixture) {
    return {
      valid: false,
      errors: ['Fixture not found']
    };
  }

  const squadIds = new Set(fixture.myTeam.squad.map((player) => player.playerId));
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

  for (const playerId of lineup) {
    if (!playerId) {
      errors.push('Every lineup slot must have a selected player');
      continue;
    }

    if (!squadIds.has(playerId)) {
      errors.push(`Selected player ${playerId} is not in your squad`);
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
  const rawFixture = getRawFixture(playerId, fixtureId);
  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status === 'completed') {
    return {
      success: false,
      message: 'Completed fixtures cannot be changed'
    };
  }

  if (rawFixture.status === 'active') {
    return {
      success: false,
      message: 'An active fixture lineup cannot be changed'
    };
  }

  const fixtureForViewer = cloneFixtureForViewer(playerId, rawFixture);
  const validation = validateCaptainLineup(fixtureForViewer, lineup);

  if (!validation.valid) {
    return {
      success: false,
      message: 'Lineup validation failed',
      errors: validation.errors
    };
  }

  const captainSide = getCaptainSide(playerId);
  const sideStore = rawFixture.sides[captainSide];
  const wasRevealed = canRevealLineups(rawFixture);

  sideStore.currentLineup = [...lineup];
  sideStore.submittedLineup = [...lineup];
  sideStore.submitted = true;
  sideStore.submittedAt = new Date().toISOString();

  if (wasRevealed) {
    const opponentSide = rawFixture.sides[getOpponentSide(captainSide)];
    opponentSide.submitted = false;
    opponentSide.submittedAt = null;
  }

  syncFixtureStatus(rawFixture);

  return {
    success: true,
    message: canRevealLineups(rawFixture)
      ? 'Both lineups are submitted. Lineups are now revealed and the fixture is ready to play.'
      : 'Your lineup has been submitted. Waiting for the opposing captain to submit.',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function withdrawCaptainLineupSubmission(playerId, fixtureId) {
  const rawFixture = getRawFixture(playerId, fixtureId);
  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status === 'completed' || rawFixture.status === 'active') {
    return {
      success: false,
      message: 'Lineup submission cannot be withdrawn for this fixture'
    };
  }

  const captainSide = getCaptainSide(playerId);
  const sideStore = rawFixture.sides[captainSide];

  if (!sideStore.submitted) {
    return {
      success: false,
      message: 'Your lineup has not been submitted yet'
    };
  }

  sideStore.submitted = false;
  sideStore.submittedAt = null;
  sideStore.submittedLineup = null;

  syncFixtureStatus(rawFixture);

  return {
    success: true,
    message: 'Your lineup submission has been withdrawn',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function startCaptainFixtureLiveScoring(playerId, fixtureId) {
  const rawFixture = getRawFixture(playerId, fixtureId);

  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status === 'completed') {
    return {
      success: false,
      message: 'Completed fixtures cannot be started again'
    };
  }

  if (rawFixture.status === 'active') {
    return {
      success: true,
      message: 'Fixture is already active',
      fixture: cloneFixtureForViewer(playerId, rawFixture)
    };
  }

  if (!canRevealLineups(rawFixture)) {
    return {
      success: false,
      message: 'Both captains must submit their lineups before the match can start'
    };
  }

  rawFixture.status = 'active';
  rawFixture.lineupsRevealed = true;
  rawFixture.liveSession = {
    startedAt: new Date().toISOString(),
    startedByCaptainId: playerId,
    status: 'active',
    activeBoardCount: 0,
    games: []
  };

  return {
    success: true,
    message: 'Fixture is now active and live scoring has started',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

function getCaptainActionLabel(status) {
  const labels = {
    ready_for_lineups: 'Open Lineup',
    waiting_for_opponent: 'Open Lineup',
    ready_to_play: 'Start Match',
    active: 'Resume Live Match',
    completed: 'View Result'
  };

  return labels[status] ?? 'Open';
}