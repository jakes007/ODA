const captainProfiles = {
  player_mike: {
    playerId: 'player_mike',
    displayName: 'Mike Captain',
    teamId: 'team_a',
    teamName: 'Observatory A'
  },
  player_brian: {
    playerId: 'player_brian',
    displayName: 'Brian Opponent',
    teamId: 'team_b',
    teamName: 'Observatory B'
  },
  player_captain_c: {
    playerId: 'player_captain_c',
    displayName: 'Carl Home',
    teamId: 'team_c',
    teamName: 'Observatory C'
  },
  player_captain_d: {
    playerId: 'player_captain_d',
    displayName: 'Dylan Away',
    teamId: 'team_d',
    teamName: 'Observatory D'
  }
};

const sharedFixtureStore = {
  fixture_001: {
    fixtureId: 'fixture_001',
    fixtureName: 'Observatory A vs Observatory B',
    competition: {
      competitionId: 'competition_oda_league',
      name: 'ODA League',
      season: '2026'
    },
    homeTeam: {
      teamId: 'team_a',
      teamName: 'Observatory A',
      captainPlayerId: 'player_mike'
    },
    awayTeam: {
      teamId: 'team_b',
      teamName: 'Observatory B',
      captainPlayerId: 'player_brian'
    },
    status: 'ready_for_lineups',
    requiredLineupSize: 4,
    scoreText: '-',
    notes:
      'Each captain submits their lineup privately. Both lineups are only revealed once both sides have submitted.',
    format: {
      formatId: 'oda_16_point_singles',
      name: 'ODA 16 Point Singles',
      type: 'singles_16_point'
    },
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
    homeTeam: {
      teamId: 'team_c',
      teamName: 'Observatory C',
      captainPlayerId: 'player_captain_c'
    },
    awayTeam: {
      teamId: 'team_a',
      teamName: 'Observatory A',
      captainPlayerId: 'player_mike'
    },
    status: 'ready_for_lineups',
    requiredLineupSize: 4,
    scoreText: '-',
    notes:
      'Each captain submits their lineup privately. Both lineups are only revealed once both sides have submitted.',
    format: {
      formatId: 'oda_16_point_singles',
      name: 'ODA 16 Point Singles',
      type: 'singles_16_point'
    },
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
        submittedLineup: null,
        submitted: false,
        submittedAt: null
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
        submittedLineup: null,
        submitted: false,
        submittedAt: null
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
    homeTeam: {
      teamId: 'team_a',
      teamName: 'Observatory A',
      captainPlayerId: 'player_mike'
    },
    awayTeam: {
      teamId: 'team_d',
      teamName: 'Observatory D',
      captainPlayerId: 'player_captain_d'
    },
    status: 'completed',
    requiredLineupSize: 4,
    scoreText: '4 - 3',
    notes: 'This fixture has already been completed.',
    format: {
      formatId: 'oda_16_point_singles',
      name: 'ODA 16 Point Singles',
      type: 'singles_16_point'
    },
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
};

const sixteenPointSinglesBlocks = [
  [
    { homeSlot: 1, awaySlot: 2 },
    { homeSlot: 2, awaySlot: 1 },
    { homeSlot: 3, awaySlot: 4 },
    { homeSlot: 4, awaySlot: 3 }
  ],
  [
    { homeSlot: 2, awaySlot: 2 },
    { homeSlot: 1, awaySlot: 4 },
    { homeSlot: 4, awaySlot: 1 },
    { homeSlot: 3, awaySlot: 3 }
  ],
  [
    { homeSlot: 4, awaySlot: 4 },
    { homeSlot: 1, awaySlot: 1 },
    { homeSlot: 2, awaySlot: 3 },
    { homeSlot: 3, awaySlot: 2 }
  ],
  [
    { homeSlot: 1, awaySlot: 3 },
    { homeSlot: 2, awaySlot: 4 },
    { homeSlot: 3, awaySlot: 1 },
    { homeSlot: 4, awaySlot: 2 }
  ]
];

const IMPOSSIBLE_THREE_DART_SCORES = new Set([
  163,
  166,
  169,
  172,
  173,
  175,
  176,
  178,
  179
]);

function isImpossibleThreeDartScore(score) {
  return IMPOSSIBLE_THREE_DART_SCORES.has(score);
}

function getCaptainProfile(playerId) {
  return captainProfiles[playerId] ?? null;
}

function getCaptainFixtureIds(playerId) {
  return Object.values(sharedFixtureStore)
    .filter((fixture) => {
      return (
        fixture.homeTeam.captainPlayerId === playerId ||
        fixture.awayTeam.captainPlayerId === playerId
      );
    })
    .map((fixture) => fixture.fixtureId);
}

function getRawFixtureById(fixtureId) {
  return sharedFixtureStore[fixtureId] ?? null;
}

function getCaptainSide(playerId, fixture) {
  if (!fixture) return null;

  if (fixture.homeTeam.captainPlayerId === playerId) {
    return 'home';
  }

  if (fixture.awayTeam.captainPlayerId === playerId) {
    return 'away';
  }

  return null;
}

function getOpponentSide(side) {
  return side === 'home' ? 'away' : 'home';
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

function buildTeamAndOpponentForViewer(playerId, fixture) {
  const side = getCaptainSide(playerId, fixture);

  if (!side) {
    return {
      team: null,
      opponent: null
    };
  }

  if (side === 'home') {
    return {
      team: {
        teamId: fixture.homeTeam.teamId,
        teamName: fixture.homeTeam.teamName
      },
      opponent: {
        teamId: fixture.awayTeam.teamId,
        teamName: fixture.awayTeam.teamName
      }
    };
  }

  return {
    team: {
      teamId: fixture.awayTeam.teamId,
      teamName: fixture.awayTeam.teamName
    },
    opponent: {
      teamId: fixture.homeTeam.teamId,
      teamName: fixture.homeTeam.teamName
    }
  };
}

function getPlayerFromSubmittedLineup(sideData, slotNumber) {
  const playerId = sideData.submittedLineup?.[slotNumber - 1];
  if (!playerId) return null;

  return sideData.squad.find((player) => player.playerId === playerId) ?? null;
}

function buildSinglesLabel(homePlayer, awayPlayer) {
  return `${homePlayer?.displayName ?? 'Home ?'} vs ${awayPlayer?.displayName ?? 'Away ?'}`;
}

function buildSixteenPointSinglesMatchups(fixture) {
  const matchups = [];
  let matchupCounter = 1;

  sixteenPointSinglesBlocks.forEach((block, blockIndex) => {
    block.forEach((pairing, pairingIndex) => {
      const homePlayer = getPlayerFromSubmittedLineup(fixture.sides.home, pairing.homeSlot);
      const awayPlayer = getPlayerFromSubmittedLineup(fixture.sides.away, pairing.awaySlot);

      matchups.push({
        matchupId: `matchup_${matchupCounter}`,
        order: matchupCounter,
        blockNumber: blockIndex + 1,
        blockOrder: pairingIndex + 1,
        type: 'singles',
        formatLabel: '501 Singles',
        homeSlots: [pairing.homeSlot],
        awaySlots: [pairing.awaySlot],
        homePlayers: homePlayer ? [homePlayer] : [],
        awayPlayers: awayPlayer ? [awayPlayer] : [],
        label: buildSinglesLabel(homePlayer, awayPlayer),
        status: 'waiting',
        boardNumber: null,
        result: null,
        liveState: null
      });

      matchupCounter += 1;
    });
  });

  return matchups;
}

function buildLiveMatchupsForFixture(fixture) {
  if (fixture.format?.type === 'singles_16_point') {
    return buildSixteenPointSinglesMatchups(fixture);
  }

  return [];
}

function recalculateFixtureScoreText(fixture) {
  if (!fixture.liveSession?.games) {
    fixture.scoreText = '-';
    return;
  }

  let homeWins = 0;
  let awayWins = 0;

  fixture.liveSession.games.forEach((game) => {
    if (game.result?.winnerSide === 'home') {
      homeWins += 1;
    }

    if (game.result?.winnerSide === 'away') {
      awayWins += 1;
    }
  });

  fixture.scoreText = `${homeWins} - ${awayWins}`;
}

function getNextAvailableBoardNumber(fixture) {
  if (!fixture.liveSession?.games) return 1;

  const activeBoardNumbers = fixture.liveSession.games
    .filter((game) => game.status === 'in_progress' && game.boardNumber)
    .map((game) => game.boardNumber)
    .sort((a, b) => a - b);

  let boardNumber = 1;

  while (activeBoardNumbers.includes(boardNumber)) {
    boardNumber += 1;
  }

  return boardNumber;
}

function buildInitialSinglesLiveState() {
  return {
    startingScore: 501,
    homeScoreLeft: 501,
    awayScoreLeft: 501,
    currentTurnSide: 'home',
    turns: [],
    pendingFinish: null,
    winnerSide: null
  };
}

function cloneLiveState(liveState) {
  if (!liveState) return null;

  return {
    ...liveState,
    pendingFinish: liveState.pendingFinish ? { ...liveState.pendingFinish } : null,
    turns: liveState.turns.map((turn) => ({ ...turn }))
  };
}

function cloneFixtureForViewer(playerId, fixture) {
  const captainSide = getCaptainSide(playerId, fixture);
  const viewerSide = fixture.sides[captainSide];
  const opponentSideKey = getOpponentSide(captainSide);
  const opponentSide = fixture.sides[opponentSideKey];
  const reveal = canRevealLineups(fixture);
  const viewerTeams = buildTeamAndOpponentForViewer(playerId, fixture);

  return {
    fixtureId: fixture.fixtureId,
    fixtureName: fixture.fixtureName,
    competition: fixture.competition,
    team: viewerTeams.team,
    opponent: viewerTeams.opponent,
    status: deriveFixtureStatus(fixture),
    requiredLineupSize: fixture.requiredLineupSize,
    scoreText: fixture.scoreText,
    notes: fixture.notes,
    format: fixture.format,
    liveSession: fixture.liveSession
      ? {
          ...fixture.liveSession,
          games: fixture.liveSession.games.map((game) => ({
            ...game,
            homePlayers: [...game.homePlayers],
            awayPlayers: [...game.awayPlayers],
            homeSlots: [...game.homeSlots],
            awaySlots: [...game.awaySlots],
            result: game.result ? { ...game.result } : null,
            liveState: cloneLiveState(game.liveState)
          }))
        }
      : null,
    lineupsRevealed: reveal,
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
      squad: reveal ? opponentSide.squad : [],
      currentLineup: reveal ? [...opponentSide.currentLineup] : [],
      submittedLineup:
        reveal && opponentSide.submittedLineup ? [...opponentSide.submittedLineup] : null,
      submitted: opponentSide.submitted,
      submittedAt: opponentSide.submittedAt
    }
  };
}

function getMatchupFromFixture(fixture, matchupId) {
  return fixture.liveSession?.games?.find((game) => game.matchupId === matchupId) ?? null;
}

function finalizeMatchupWin(fixture, matchup, winnerSide) {
  matchup.status = 'completed';
  matchup.result = {
    winnerSide,
    winnerTeamName:
      winnerSide === 'home' ? fixture.homeTeam.teamName : fixture.awayTeam.teamName
  };
  matchup.boardNumber = null;

  if (matchup.liveState) {
    matchup.liveState.winnerSide = winnerSide;
  }

  fixture.liveSession.activeBoardCount = fixture.liveSession.games.filter(
    (game) => game.status === 'in_progress'
  ).length;

  recalculateFixtureScoreText(fixture);

  const allCompleted = fixture.liveSession.games.every((game) => game.status === 'completed');

  if (allCompleted) {
    fixture.status = 'completed';
    fixture.liveSession.status = 'completed';
  }
}

export function getCaptainDashboardData(playerId) {
  const captain = getCaptainProfile(playerId);
  if (!captain) return null;

  const fixtureIds = getCaptainFixtureIds(playerId);

  const fixtures = fixtureIds.map((fixtureId) => {
    const fixture = getRawFixtureById(fixtureId);
    syncFixtureStatus(fixture);

    const side = getCaptainSide(playerId, fixture);
    const opponentSide = getOpponentSide(side);
    const opponentTeamName =
      opponentSide === 'home' ? fixture.homeTeam.teamName : fixture.awayTeam.teamName;

    return {
      fixtureId: fixture.fixtureId,
      fixtureName: fixture.fixtureName,
      opponentName: opponentTeamName,
      status: deriveFixtureStatus(fixture),
      scoreText: fixture.scoreText,
      captainAction: getCaptainActionLabel(deriveFixtureStatus(fixture)),
      lineupsRevealed: canRevealLineups(fixture)
    };
  });

  return {
    captain: {
      playerId: captain.playerId,
      displayName: captain.displayName
    },
    team: {
      teamId: captain.teamId,
      teamName: captain.teamName
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
  const fixture = getRawFixtureById(fixtureId);
  if (!fixture) return null;

  const side = getCaptainSide(playerId, fixture);
  if (!side) return null;

  syncFixtureStatus(fixture);
  return cloneFixtureForViewer(playerId, fixture);
}

export function getCaptainLiveScoringData(playerId, fixtureId) {
  const fixture = getRawFixtureById(fixtureId);
  if (!fixture) return null;

  const side = getCaptainSide(playerId, fixture);
  if (!side) return null;

  syncFixtureStatus(fixture);
  return cloneFixtureForViewer(playerId, fixture);
}

export function getCaptainMatchupScoringData(playerId, fixtureId, matchupId) {
  const fixture = getRawFixtureById(fixtureId);
  if (!fixture) return null;

  const side = getCaptainSide(playerId, fixture);
  if (!side) return null;

  syncFixtureStatus(fixture);

  if (!fixture.liveSession) {
    return null;
  }

  const matchup = getMatchupFromFixture(fixture, matchupId);
  if (!matchup) return null;

  return {
    fixture: cloneFixtureForViewer(playerId, fixture),
    matchup: {
      ...matchup,
      homePlayers: [...matchup.homePlayers],
      awayPlayers: [...matchup.awayPlayers],
      homeSlots: [...matchup.homeSlots],
      awaySlots: [...matchup.awaySlots],
      result: matchup.result ? { ...matchup.result } : null,
      liveState: cloneLiveState(matchup.liveState)
    }
  };
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
  const rawFixture = getRawFixtureById(fixtureId);
  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
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

  const sideStore = rawFixture.sides[captainSide];
  const opponentSideKey = getOpponentSide(captainSide);
  const wasRevealed = canRevealLineups(rawFixture);

  sideStore.currentLineup = [...lineup];
  sideStore.submittedLineup = [...lineup];
  sideStore.submitted = true;
  sideStore.submittedAt = new Date().toISOString();

  if (wasRevealed) {
    const opponentSide = rawFixture.sides[opponentSideKey];
    opponentSide.submitted = false;
    opponentSide.submittedAt = null;
  }

  rawFixture.liveSession = null;
  rawFixture.scoreText = '-';

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
  const rawFixture = getRawFixtureById(fixtureId);
  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status === 'completed' || rawFixture.status === 'active') {
    return {
      success: false,
      message: 'Lineup submission cannot be withdrawn for this fixture'
    };
  }

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

  rawFixture.liveSession = null;
  rawFixture.scoreText = '-';

  syncFixtureStatus(rawFixture);

  return {
    success: true,
    message: 'Your lineup submission has been withdrawn',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function startCaptainFixtureLiveScoring(playerId, fixtureId) {
  const rawFixture = getRawFixtureById(fixtureId);

  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
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
    games: buildLiveMatchupsForFixture(rawFixture)
  };

  recalculateFixtureScoreText(rawFixture);

  return {
    success: true,
    message: 'Fixture is now active and live scoring has started',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function startCaptainFixtureMatchup(playerId, fixtureId, matchupId) {
  const rawFixture = getRawFixtureById(fixtureId);

  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status !== 'active' || !rawFixture.liveSession) {
    return {
      success: false,
      message: 'Fixture live session has not been started yet'
    };
  }

  const matchup = rawFixture.liveSession.games.find((game) => game.matchupId === matchupId);

  if (!matchup) {
    return {
      success: false,
      message: 'Matchup not found'
    };
  }

  if (matchup.status === 'completed') {
    return {
      success: false,
      message: 'Completed matchups cannot be restarted'
    };
  }

  if (matchup.status === 'in_progress') {
    return {
      success: true,
      message: 'Matchup is already in progress',
      fixture: cloneFixtureForViewer(playerId, rawFixture)
    };
  }

  matchup.status = 'in_progress';
  matchup.boardNumber = getNextAvailableBoardNumber(rawFixture);
  matchup.liveState = buildInitialSinglesLiveState();

  rawFixture.liveSession.activeBoardCount = rawFixture.liveSession.games.filter(
    (game) => game.status === 'in_progress'
  ).length;

  return {
    success: true,
    message: `${matchup.label} is now active on Board ${matchup.boardNumber}`,
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function submitCaptainMatchupTurn(
  playerId,
  fixtureId,
  matchupId,
  score,
  options = {}
) {
  const rawFixture = getRawFixtureById(fixtureId);

  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status !== 'active' || !rawFixture.liveSession) {
    return {
      success: false,
      message: 'Fixture live session has not been started yet'
    };
  }

  const matchup = getMatchupFromFixture(rawFixture, matchupId);

  if (!matchup) {
    return {
      success: false,
      message: 'Matchup not found'
    };
  }

  if (matchup.type !== 'singles') {
    return {
      success: false,
      message: 'This scorer currently supports singles only'
    };
  }

  if (matchup.status !== 'in_progress' || !matchup.liveState) {
    return {
      success: false,
      message: 'This matchup is not currently in progress'
    };
  }

  const numericScore = Number(score);

  if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 180) {
    return {
      success: false,
      message: 'Turn score must be a whole number between 0 and 180'
    };
  }

  if (isImpossibleThreeDartScore(numericScore)) {
    return {
      success: false,
      message: `${numericScore} is not a possible score with 3 darts`
    };
  }

  const currentTurnSide = matchup.liveState.currentTurnSide;
  const scoreKey = currentTurnSide === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';
  const currentScoreLeft = matchup.liveState[scoreKey];
  const proposedScoreLeft = currentScoreLeft - numericScore;
  const winningDartsUsed = options.dartsUsed ? Number(options.dartsUsed) : null;

  let bust = false;
  let message = 'Turn recorded';

  if (proposedScoreLeft < 0 || proposedScoreLeft === 1) {
    bust = true;
    message = 'Bust recorded';
  } else if (proposedScoreLeft === 0) {
    if (![1, 2, 3].includes(winningDartsUsed)) {
      matchup.liveState.pendingFinish = {
        side: currentTurnSide,
        score: numericScore
      };

      return {
        success: true,
        requiresFinishDarts: true,
        message: 'Select darts used to finish the leg',
        fixture: cloneFixtureForViewer(playerId, rawFixture),
        matchup: {
          ...matchup,
          result: matchup.result ? { ...matchup.result } : null,
          liveState: cloneLiveState(matchup.liveState)
        }
      };
    }

    matchup.liveState.pendingFinish = null;
    matchup.liveState[scoreKey] = 0;
    matchup.liveState.turns.push({
      side: currentTurnSide,
      score: numericScore,
      bust: false,
      dartsUsed: winningDartsUsed,
      resultingScore: 0,
      createdAt: new Date().toISOString()
    });

    finalizeMatchupWin(rawFixture, matchup, currentTurnSide);

    return {
      success: true,
      message: `${matchup.label} has been completed`,
      fixture: cloneFixtureForViewer(playerId, rawFixture),
      matchup: {
        ...matchup,
        result: matchup.result ? { ...matchup.result } : null,
        liveState: cloneLiveState(matchup.liveState)
      }
    };
  } else {
    matchup.liveState.pendingFinish = null;
    matchup.liveState[scoreKey] = proposedScoreLeft;
  }

  matchup.liveState.turns.push({
    side: currentTurnSide,
    score: numericScore,
    bust,
    dartsUsed: 3,
    resultingScore: bust ? currentScoreLeft : matchup.liveState[scoreKey],
    createdAt: new Date().toISOString()
  });

  matchup.liveState.currentTurnSide = currentTurnSide === 'home' ? 'away' : 'home';

  return {
    success: true,
    message,
    fixture: cloneFixtureForViewer(playerId, rawFixture),
    matchup: {
      ...matchup,
      result: matchup.result ? { ...matchup.result } : null,
      liveState: cloneLiveState(matchup.liveState)
    }
  };
}

export function completeCaptainFixtureMatchupDemo(playerId, fixtureId, matchupId, winnerSide) {
  const rawFixture = getRawFixtureById(fixtureId);

  if (!rawFixture) {
    return {
      success: false,
      message: 'Fixture setup data not found'
    };
  }

  const captainSide = getCaptainSide(playerId, rawFixture);
  if (!captainSide) {
    return {
      success: false,
      message: 'You are not assigned to this fixture'
    };
  }

  syncFixtureStatus(rawFixture);

  if (rawFixture.status !== 'active' || !rawFixture.liveSession) {
    return {
      success: false,
      message: 'Fixture live session has not been started yet'
    };
  }

  const matchup = rawFixture.liveSession.games.find((game) => game.matchupId === matchupId);

  if (!matchup) {
    return {
      success: false,
      message: 'Matchup not found'
    };
  }

  if (matchup.status !== 'in_progress') {
    return {
      success: false,
      message: 'Only in-progress matchups can be completed'
    };
  }

  if (!['home', 'away'].includes(winnerSide)) {
    return {
      success: false,
      message: 'Winner side is invalid'
    };
  }

  finalizeMatchupWin(rawFixture, matchup, winnerSide);

  return {
    success: true,
    message: `${matchup.label} has been marked complete`,
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