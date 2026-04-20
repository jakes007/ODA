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
        formatId: 'oda_mixed_match_template',
        name: 'ODA Mixed Match Template',
        type: 'oda_mixed_match_template'
      },
      liveSession: null,
      lineupsRevealed: false,
      postMatch: {
        home: {
          selectedOpponentPotmPlayerId: '',
          selectedOpponentPotmPlayerName: '',
          notes: '',
          confirmedAt: null
        },
        away: {
          selectedOpponentPotmPlayerId: '',
          selectedOpponentPotmPlayerName: '',
          notes: '',
          confirmedAt: null
        }
      },
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
        submittedAt: null,
        substitutions: []
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
        submittedAt: null,
        substitutions: []
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
      postMatch: {
        home: {
          selectedOpponentPotmPlayerId: '',
          selectedOpponentPotmPlayerName: '',
          notes: '',
          confirmedAt: null
        },
        away: {
          selectedOpponentPotmPlayerId: '',
          selectedOpponentPotmPlayerName: '',
          notes: '',
          confirmedAt: null
        }
      },
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
        submittedAt: null,
        substitutions: []
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
        submittedAt: null,
        substitutions: []
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
    postMatch: {
      home: {
        selectedOpponentPotmPlayerId: '',
        selectedOpponentPotmPlayerName: '',
        notes: '',
        confirmedAt: null
      },
      away: {
        selectedOpponentPotmPlayerId: '',
        selectedOpponentPotmPlayerName: '',
        notes: '',
        confirmedAt: null
      }
    },
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
        submittedAt: '2026-04-10T18:00:00.000Z',
        substitutions: []
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
        submittedAt: '2026-04-10T18:03:00.000Z',
        substitutions: []
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

const SINGLE_DART_DOUBLES = new Set([
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
  22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50
]);

function canFinishInOneDart(scoreLeft) {
  return SINGLE_DART_DOUBLES.has(scoreLeft);
}

function canFinishInTwoDarts(scoreLeft) {
  for (let firstDart = 0; firstDart <= 60; firstDart += 1) {
    if (firstDart > 0 && isImpossibleThreeDartScore(firstDart)) {
      continue;
    }

    const remaining = scoreLeft - firstDart;
    if (remaining > 0 && canFinishInOneDart(remaining)) {
      return true;
    }
  }

  return false;
}

function getPossibleFinishDarts(scoreLeft) {
  const options = [];

  if (canFinishInOneDart(scoreLeft)) {
    options.push(1);
  }

  if (canFinishInTwoDarts(scoreLeft)) {
    options.push(2);
  }

  options.push(3);

  return options;
}

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

function getPlayerFromSquad(sideData, playerId) {
  if (!playerId) return null;
  return sideData.squad.find((player) => player.playerId === playerId) ?? null;
}

function getBenchPlayersForSide(sideData) {
  const currentLineupIds = new Set(sideData.currentLineup.filter(Boolean));
  return sideData.squad.filter((player) => !currentLineupIds.has(player.playerId));
}

function getOpponentSquadForCaptain(fixture, captainSide) {
  const opponentSide = getOpponentSide(captainSide);
  return fixture.sides[opponentSide]?.squad ?? [];
}

function buildSinglesLabel(homePlayer, awayPlayer) {
  return `${homePlayer?.displayName ?? 'Missing Player'} vs ${awayPlayer?.displayName ?? 'Missing Player'}`;
}

function buildDoublesLabel(homePlayers, awayPlayers) {
  const homeLabel =
    homePlayers && homePlayers.length > 0
      ? homePlayers.map((player) => player.displayName).join(' + ')
      : 'Missing Pair';

  const awayLabel =
    awayPlayers && awayPlayers.length > 0
      ? awayPlayers.map((player) => player.displayName).join(' + ')
      : 'Missing Pair';

  return `${homeLabel} vs ${awayLabel}`;
}

function buildTeamLegLabel(homePlayers, awayPlayers) {
  const homeLabel =
    homePlayers && homePlayers.length > 0
      ? homePlayers.map((player) => player.displayName).join(' + ')
      : 'Missing Team';

  const awayLabel =
    awayPlayers && awayPlayers.length > 0
      ? awayPlayers.map((player) => player.displayName).join(' + ')
      : 'Missing Team';

  return `${homeLabel} vs ${awayLabel}`;
}

function buildMatchupLabelByType(type, homePlayers, awayPlayers) {
  if (type === 'doubles') {
    return buildDoublesLabel(homePlayers, awayPlayers);
  }

  if (type === 'team_leg') {
    return buildTeamLegLabel(homePlayers, awayPlayers);
  }

  return buildSinglesLabel(homePlayers?.[0] ?? null, awayPlayers?.[0] ?? null);
}

function buildTemplateMatchup(fixture, templateItem, matchupId, order) {
  const homePlayers = templateItem.homeSlots
    .map((slotNumber) => getPlayerFromSubmittedLineup(fixture.sides.home, slotNumber))
    .filter(Boolean);

  const awayPlayers = templateItem.awaySlots
    .map((slotNumber) => getPlayerFromSubmittedLineup(fixture.sides.away, slotNumber))
    .filter(Boolean);

  let isAutoAward = false;
  let autoAwardWinnerSide = null;
  let result = null;
  let status = 'waiting';

  const requiredHomePlayers = templateItem.homeSlots.length;
  const requiredAwayPlayers = templateItem.awaySlots.length;

  if (homePlayers.length < requiredHomePlayers && awayPlayers.length === requiredAwayPlayers) {
    isAutoAward = true;
    autoAwardWinnerSide = 'away';
    status = 'completed';
    result = {
      winnerSide: 'away',
      winnerTeamName: fixture.awayTeam.teamName,
      autoAward: true
    };
  } else if (awayPlayers.length < requiredAwayPlayers && homePlayers.length === requiredHomePlayers) {
    isAutoAward = true;
    autoAwardWinnerSide = 'home';
    status = 'completed';
    result = {
      winnerSide: 'home',
      winnerTeamName: fixture.homeTeam.teamName,
      autoAward: true
    };
  }

  return {
    matchupId,
    order,
    blockNumber: templateItem.blockNumber,
    blockOrder: templateItem.blockOrder,
    type: templateItem.type,
    format: templateItem.type,
    formatLabel: templateItem.formatLabel,
    startingScore: templateItem.startingScore,
    homeSlots: [...templateItem.homeSlots],
    awaySlots: [...templateItem.awaySlots],
    homePlayers,
    awayPlayers,
    label: buildMatchupLabelByType(templateItem.type, homePlayers, awayPlayers),
    status,
    boardNumber: null,
    isAutoAward,
    autoAwardWinnerSide,
    result,
    liveState: null
  };
}

function updateWaitingMatchupsForSubstitution(
  fixture,
  captainSide,
  outgoingPlayerId,
  incomingPlayer
) {
  const playerKey = captainSide === 'home' ? 'homePlayers' : 'awayPlayers';
  let updatedMatchups = 0;

  fixture.liveSession.games.forEach((game) => {
    if (game.status !== 'waiting') {
      return;
    }

    const sidePlayers = game[playerKey] ?? [];
    const hasOutgoingPlayer = sidePlayers.some(
      (player) => player.playerId === outgoingPlayerId
    );

    if (!hasOutgoingPlayer) {
      return;
    }

    game[playerKey] = sidePlayers.map((player) =>
      player.playerId === outgoingPlayerId
        ? {
            ...incomingPlayer,
            displayName: `${incomingPlayer.displayName} (SUB)`,
            isSubstitute: true,
            substituteForPlayerId: outgoingPlayerId
          }
        : player
    );

    game.label =
      game.type === 'doubles'
        ? buildDoublesLabel(game.homePlayers ?? [], game.awayPlayers ?? [])
        : buildSinglesLabel(game.homePlayers?.[0] ?? null, game.awayPlayers?.[0] ?? null);

    updatedMatchups += 1;
  });

  return updatedMatchups;
}

function buildSixteenPointSinglesMatchups(fixture) {
  const matchups = [];
  let matchupCounter = 1;

  sixteenPointSinglesBlocks.forEach((block, blockIndex) => {
    block.forEach((pairing, pairingIndex) => {
      const homePlayer = getPlayerFromSubmittedLineup(fixture.sides.home, pairing.homeSlot);
      const awayPlayer = getPlayerFromSubmittedLineup(fixture.sides.away, pairing.awaySlot);

      let isAutoAward = false;
      let autoAwardWinnerSide = null;
      let result = null;
      let status = 'waiting';

      if (!homePlayer && awayPlayer) {
        isAutoAward = true;
        autoAwardWinnerSide = 'away';
        status = 'completed';
        result = {
          winnerSide: 'away',
          winnerTeamName: fixture.awayTeam.teamName,
          autoAward: true
        };
      } else if (!awayPlayer && homePlayer) {
        isAutoAward = true;
        autoAwardWinnerSide = 'home';
        status = 'completed';
        result = {
          winnerSide: 'home',
          winnerTeamName: fixture.homeTeam.teamName,
          autoAward: true
        };
      }

      matchups.push({
        matchupId: `matchup_${matchupCounter}`,
        order: matchupCounter,
        blockNumber: blockIndex + 1,
        blockOrder: pairingIndex + 1,
        type: 'singles',
        format: 'singles',
        formatLabel: '501 Singles',
        startingScore: 501,
        homeSlots: [pairing.homeSlot],
        awaySlots: [pairing.awaySlot],
        homePlayers: homePlayer ? [homePlayer] : [],
        awayPlayers: awayPlayer ? [awayPlayer] : [],
        label: buildSinglesLabel(homePlayer, awayPlayer),
        status,
        boardNumber: null,
        isAutoAward,
        autoAwardWinnerSide,
        result,
        liveState: null
      });

      matchupCounter += 1;
    });
  });

  return matchups;
}

function buildStandardDoublesMatchups(fixture) {
  const matchups = [];

  const homePlayer1 = getPlayerFromSubmittedLineup(fixture.sides.home, 1);
  const homePlayer2 = getPlayerFromSubmittedLineup(fixture.sides.home, 2);
  const awayPlayer1 = getPlayerFromSubmittedLineup(fixture.sides.away, 1);
  const awayPlayer2 = getPlayerFromSubmittedLineup(fixture.sides.away, 2);

  const homePlayers = [homePlayer1, homePlayer2].filter(Boolean);
  const awayPlayers = [awayPlayer1, awayPlayer2].filter(Boolean);

  let isAutoAward = false;
  let autoAwardWinnerSide = null;
  let result = null;
  let status = 'waiting';

  if (homePlayers.length < 2 && awayPlayers.length === 2) {
    isAutoAward = true;
    autoAwardWinnerSide = 'away';
    status = 'completed';
    result = {
      winnerSide: 'away',
      winnerTeamName: fixture.awayTeam.teamName,
      autoAward: true
    };
  } else if (awayPlayers.length < 2 && homePlayers.length === 2) {
    isAutoAward = true;
    autoAwardWinnerSide = 'home';
    status = 'completed';
    result = {
      winnerSide: 'home',
      winnerTeamName: fixture.homeTeam.teamName,
      autoAward: true
    };
  }

  matchups.push({
    matchupId: 'matchup_doubles_1',
    order: 1,
    blockNumber: 1,
    blockOrder: 1,
    type: 'doubles',
    format: 'doubles',
    formatLabel: '501 Doubles',
    startingScore: 501,
    homeSlots: [1, 2],
    awaySlots: [1, 2],
    homePlayers,
    awayPlayers,
    label: buildDoublesLabel(homePlayers, awayPlayers),
    status,
    boardNumber: null,
    isAutoAward,
    autoAwardWinnerSide,
    result,
    liveState: null
  });

  return matchups;
}

function buildStandardTeamLegMatchups(fixture) {
  const matchups = [];

  const homePlayers = [1, 2, 3, 4]
    .map((slotNumber) => getPlayerFromSubmittedLineup(fixture.sides.home, slotNumber))
    .filter(Boolean);

  const awayPlayers = [1, 2, 3, 4]
    .map((slotNumber) => getPlayerFromSubmittedLineup(fixture.sides.away, slotNumber))
    .filter(Boolean);

  let isAutoAward = false;
  let autoAwardWinnerSide = null;
  let result = null;
  let status = 'waiting';

  if (homePlayers.length < 4 && awayPlayers.length === 4) {
    isAutoAward = true;
    autoAwardWinnerSide = 'away';
    status = 'completed';
    result = {
      winnerSide: 'away',
      winnerTeamName: fixture.awayTeam.teamName,
      autoAward: true
    };
  } else if (awayPlayers.length < 4 && homePlayers.length === 4) {
    isAutoAward = true;
    autoAwardWinnerSide = 'home';
    status = 'completed';
    result = {
      winnerSide: 'home',
      winnerTeamName: fixture.homeTeam.teamName,
      autoAward: true
    };
  }

  matchups.push({
    matchupId: 'matchup_team_leg_1',
    order: 1,
    blockNumber: 1,
    blockOrder: 1,
    type: 'team_leg',
    format: 'team_leg',
    formatLabel: '1001 Team Leg',
    startingScore: 1001,
    homeSlots: [1, 2, 3, 4],
    awaySlots: [1, 2, 3, 4],
    homePlayers,
    awayPlayers,
    label: buildTeamLegLabel(homePlayers, awayPlayers),
    status,
    boardNumber: null,
    isAutoAward,
    autoAwardWinnerSide,
    result,
    liveState: null
  });

  return matchups;
}

const odaMixedMatchTemplate = [
  {
    type: 'doubles',
    formatLabel: '701 Doubles',
    startingScore: 701,
    blockNumber: 1,
    blockOrder: 1,
    homeSlots: [1, 2],
    awaySlots: [1, 2]
  },
  {
    type: 'doubles',
    formatLabel: '701 Doubles',
    startingScore: 701,
    blockNumber: 1,
    blockOrder: 2,
    homeSlots: [3, 4],
    awaySlots: [3, 4]
  },

  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 2,
    blockOrder: 1,
    homeSlots: [1],
    awaySlots: [2]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 2,
    blockOrder: 2,
    homeSlots: [2],
    awaySlots: [1]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 2,
    blockOrder: 3,
    homeSlots: [3],
    awaySlots: [4]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 2,
    blockOrder: 4,
    homeSlots: [4],
    awaySlots: [3]
  },

  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 3,
    blockOrder: 1,
    homeSlots: [2],
    awaySlots: [2]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 3,
    blockOrder: 2,
    homeSlots: [1],
    awaySlots: [4]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 3,
    blockOrder: 3,
    homeSlots: [4],
    awaySlots: [1]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 3,
    blockOrder: 4,
    homeSlots: [3],
    awaySlots: [3]
  },

  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 4,
    blockOrder: 1,
    homeSlots: [4],
    awaySlots: [4]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 4,
    blockOrder: 2,
    homeSlots: [1],
    awaySlots: [1]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 4,
    blockOrder: 3,
    homeSlots: [2],
    awaySlots: [3]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 4,
    blockOrder: 4,
    homeSlots: [3],
    awaySlots: [2]
  },

  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 5,
    blockOrder: 1,
    homeSlots: [1],
    awaySlots: [3]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 5,
    blockOrder: 2,
    homeSlots: [2],
    awaySlots: [4]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 5,
    blockOrder: 3,
    homeSlots: [3],
    awaySlots: [1]
  },
  {
    type: 'singles',
    formatLabel: '501 Singles',
    startingScore: 501,
    blockNumber: 5,
    blockOrder: 4,
    homeSlots: [4],
    awaySlots: [2]
  },

  {
    type: 'team_leg',
    formatLabel: '1001 Team Leg',
    startingScore: 1001,
    blockNumber: 6,
    blockOrder: 1,
    homeSlots: [1, 2, 3, 4],
    awaySlots: [1, 2, 3, 4]
  }
];

function buildMixedTemplateMatchups(fixture, template) {
  return template.map((templateItem, index) => {
    const matchup = buildTemplateMatchup(
      fixture,
      templateItem,
      `matchup_${index + 1}`,
      index + 1
    );

    const isLastMatchup = index === template.length - 1;

    if (!isLastMatchup && matchup.status === 'waiting') {
      const winnerSide = index % 2 === 0 ? 'home' : 'away';

      matchup.status = 'completed';
      matchup.result = {
        winnerSide,
        winnerTeamName:
          winnerSide === 'home'
            ? fixture.homeTeam.teamName
            : fixture.awayTeam.teamName
      };
      matchup.boardNumber = null;
      matchup.liveState = null;
    }

    return matchup;
  });
}

function buildLiveMatchupsForFixture(fixture) {
  if (fixture.format?.type === 'singles_16_point') {
    return buildSixteenPointSinglesMatchups(fixture);
  }

  if (fixture.format?.type === 'doubles_standard') {
    return buildStandardDoublesMatchups(fixture);
  }

  if (fixture.format?.type === 'team_leg_standard') {
    return buildStandardTeamLegMatchups(fixture);
  }

  if (fixture.format?.type === 'oda_mixed_match_template') {
    return buildMixedTemplateMatchups(fixture, odaMixedMatchTemplate);
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

function getNextTurnState(currentSide, currentPlayerIndex, format) {
  if (format === 'doubles') {
    const order = [
      { side: 'home', index: 0 },
      { side: 'away', index: 0 },
      { side: 'home', index: 1 },
      { side: 'away', index: 1 }
    ];

    const currentOrderIndex = order.findIndex(
      (entry) =>
        entry.side === currentSide &&
        entry.index === currentPlayerIndex
    );

    const nextOrderIndex =
      currentOrderIndex === -1 ? 0 : (currentOrderIndex + 1) % order.length;

    return order[nextOrderIndex];
  }

  if (format === 'team_leg') {
    const order = [
      { side: 'home', index: 0 },
      { side: 'away', index: 0 },
      { side: 'home', index: 1 },
      { side: 'away', index: 1 },
      { side: 'home', index: 2 },
      { side: 'away', index: 2 },
      { side: 'home', index: 3 },
      { side: 'away', index: 3 }
    ];

    const currentOrderIndex = order.findIndex(
      (entry) =>
        entry.side === currentSide &&
        entry.index === currentPlayerIndex
    );

    const nextOrderIndex =
      currentOrderIndex === -1 ? 0 : (currentOrderIndex + 1) % order.length;

    return order[nextOrderIndex];
  }

  return {
    side: currentSide === 'home' ? 'away' : 'home',
    index: 0
  };
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

function buildInitialSinglesLiveState(startingScore = 501) {
  return {
    startingScore,
    homeScoreLeft: startingScore,
    awayScoreLeft: startingScore,
    startingSide: 'home',
    currentTurnSide: 'home',
    currentPlayerIndex: 0,
    format: 'singles',
    turns: [],
    pendingFinish: null,
    winnerSide: null
  };
}

function buildInitialDoublesLiveState(startingScore = 501) {
  return {
    startingScore,
    homeScoreLeft: startingScore,
    awayScoreLeft: startingScore,
    startingSide: 'home',
    currentTurnSide: 'home',
    currentPlayerIndex: 0,
    format: 'doubles',
    turns: [],
    pendingFinish: null,
    winnerSide: null
  };
}

function buildInitialTeamLegLiveState(startingScore = 1001) {
  return {
    startingScore,
    homeScoreLeft: startingScore,
    awayScoreLeft: startingScore,
    startingSide: 'home',
    currentTurnSide: 'home',
    currentPlayerIndex: 0,
    format: 'team_leg',
    turns: [],
    pendingFinish: null,
    winnerSide: null
  };
}

function buildLiveStateFromTurns(
  turns,
  startingSide = 'home',
  format = 'singles',
  startingScore = 501
) {
  let homeScoreLeft = startingScore;
  let awayScoreLeft = startingScore;
  let currentTurnSide = startingSide;
  let currentPlayerIndex = 0;
  let winnerSide = null;
  let completed = false;

  const rebuiltTurns = [];

  for (const originalTurn of turns) {
    const side = originalTurn.side;
    const score = Number(originalTurn.score);
    const dartsUsed = originalTurn.dartsUsed ?? 3;
    const scoreKey = side === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';
    const currentScoreLeft = side === 'home' ? homeScoreLeft : awayScoreLeft;
    const proposedScoreLeft = currentScoreLeft - score;

    let bust = false;
    let resultingScore = currentScoreLeft;

    if (completed) {
      break;
    }

    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 180 ||
      isImpossibleThreeDartScore(score)
    ) {
      bust = true;
    } else if (proposedScoreLeft < 0 || proposedScoreLeft === 1) {
      bust = true;
    } else if (proposedScoreLeft === 0) {
      const possibleFinishDarts = getPossibleFinishDarts(currentScoreLeft);

      if (!possibleFinishDarts.includes(dartsUsed)) {
        bust = true;
      } else {
        resultingScore = 0;

        if (side === 'home') {
          homeScoreLeft = 0;
        } else {
          awayScoreLeft = 0;
        }

        winnerSide = side;
        completed = true;
      }
    } else {
      resultingScore = proposedScoreLeft;

      if (side === 'home') {
        homeScoreLeft = proposedScoreLeft;
      } else {
        awayScoreLeft = proposedScoreLeft;
      }
    }

    rebuiltTurns.push({
      ...originalTurn,
      playerIndex: originalTurn.playerIndex ?? currentPlayerIndex,
      bust,
      dartsUsed,
      resultingScore
    });

    const nextTurn = getNextTurnState(
      currentTurnSide,
      currentPlayerIndex,
      format
    );

    currentTurnSide = nextTurn.side;
    currentPlayerIndex = nextTurn.index;
  }

  return {
    startingScore,
    homeScoreLeft,
    awayScoreLeft,
    startingSide,
    currentTurnSide,
    currentPlayerIndex,
    format,
    turns: rebuiltTurns,
    pendingFinish: null,
    winnerSide
  };
}

function cloneLiveState(liveState) {
  if (!liveState) return null;

  return {
    ...liveState,
    startingSide: liveState.startingSide ?? 'home',
    currentPlayerIndex: liveState.currentPlayerIndex ?? 0,
    format: liveState.format ?? 'singles',
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
      postMatch: {
        home: { ...fixture.postMatch.home },
        away: { ...fixture.postMatch.away }
      },
      captainSide,
      opponentSide: opponentSideKey,
      myTeam: {
      teamName: viewerSide.teamName,
      squad: viewerSide.squad,
      currentLineup: [...viewerSide.currentLineup],
      submittedLineup: viewerSide.submittedLineup ? [...viewerSide.submittedLineup] : null,
      submitted: viewerSide.submitted,
      submittedAt: viewerSide.submittedAt,
      substitutions: [...(viewerSide.substitutions ?? [])]
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

  const allCompleted = fixture.liveSession.games.every(
    (game) => game.status === 'completed'
  );

  if (allCompleted) {
    fixture.status = 'completed';
    fixture.liveSession.status = 'completed';
  }
}

function reopenMatchupAfterEdit(fixture, matchup) {
  matchup.status = 'in_progress';
  matchup.result = null;

  if (!matchup.boardNumber) {
    matchup.boardNumber = getNextAvailableBoardNumber(fixture);
  }

  fixture.status = 'active';
  fixture.liveSession.status = 'active';
  fixture.liveSession.activeBoardCount = fixture.liveSession.games.filter(
    (game) => game.status === 'in_progress'
  ).length;

  recalculateFixtureScoreText(fixture);
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
    errors.push(`Lineup must contain exactly ${fixture.requiredLineupSize} lineup slots`);
  }

  const selectedPlayerIds = lineup.filter(Boolean);

  if (selectedPlayerIds.length < fixture.requiredLineupSize - 1) {
    errors.push(
      `Your team may only play one player short. Select at least ${fixture.requiredLineupSize - 1} players`
    );
  }

  if (selectedPlayerIds.length > fixture.requiredLineupSize) {
    errors.push('Too many players have been selected');
  }

  for (const playerId of selectedPlayerIds) {
    if (!squadIds.has(playerId)) {
      errors.push(`Selected player ${playerId} is not in your squad`);
    }
  }

  const uniquePlayerIds = new Set(selectedPlayerIds);
  if (uniquePlayerIds.size !== selectedPlayerIds.length) {
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
  sideStore.substitutions = [];

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

  if (matchup.type === 'doubles') {
    matchup.liveState = buildInitialDoublesLiveState(matchup.startingScore ?? 501);
  } else if (matchup.type === 'team_leg') {
    matchup.liveState = buildInitialTeamLegLiveState(matchup.startingScore ?? 1001);
  } else {
    matchup.liveState = buildInitialSinglesLiveState(matchup.startingScore ?? 501);
  }

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

  if (!['singles', 'doubles', 'team_leg'].includes(matchup.type)) {
    return {
      success: false,
      message: 'This scorer currently supports singles, doubles, and team legs only'
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

  let message = 'Turn recorded';

  if (proposedScoreLeft === 0) {
    const possibleFinishDarts = getPossibleFinishDarts(currentScoreLeft);

    if (!possibleFinishDarts.includes(winningDartsUsed)) {
      matchup.liveState.pendingFinish = {
        side: currentTurnSide,
        score: numericScore,
        possibleDartsUsed: possibleFinishDarts
      };

      return {
        success: true,
        requiresFinishDarts: true,
        possibleDartsUsed: possibleFinishDarts,
        message: 'Select darts used to finish the leg',
        fixture: cloneFixtureForViewer(playerId, rawFixture),
        matchup: {
          ...matchup,
          result: matchup.result ? { ...matchup.result } : null,
          liveState: cloneLiveState(matchup.liveState)
        }
      };
    }
  }

  const nextTurns = [
    ...matchup.liveState.turns,
    {
      side: currentTurnSide,
      playerIndex: matchup.liveState.currentPlayerIndex ?? 0,
      score: numericScore,
      dartsUsed: proposedScoreLeft === 0 ? winningDartsUsed : 3,
      createdAt: new Date().toISOString()
    }
  ];

  matchup.liveState = buildLiveStateFromTurns(
    nextTurns,
    matchup.liveState.startingSide ?? 'home',
    matchup.liveState.format ?? matchup.type ?? 'singles',
    matchup.liveState.startingScore ?? matchup.startingScore ?? 501
  );

  if (matchup.liveState.winnerSide) {
    finalizeMatchupWin(rawFixture, matchup, matchup.liveState.winnerSide);

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
  }

  matchup.liveState.pendingFinish = null;

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

export function updateCaptainMatchupTurn(
  playerId,
  fixtureId,
  matchupId,
  turnIndex,
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

  if (!rawFixture.liveSession) {
    return {
      success: false,
      message: 'Fixture live session has not been started yet'
    };
  }

  const matchup = getMatchupFromFixture(rawFixture, matchupId);

  if (!matchup || !matchup.liveState) {
    return {
      success: false,
      message: 'Matchup live state not found'
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

  if (
    !Number.isInteger(turnIndex) ||
    turnIndex < 0 ||
    turnIndex >= matchup.liveState.turns.length
  ) {
    return {
      success: false,
      message: 'Turn index is invalid'
    };
  }

  const existingTurn = matchup.liveState.turns[turnIndex];
  const updatedTurn = {
    ...existingTurn,
    playerIndex: existingTurn.playerIndex ?? 0,
    score: numericScore,
    dartsUsed: options.dartsUsed ?? existingTurn.dartsUsed ?? 3
  };

  const nextTurns = matchup.liveState.turns.map((turn, index) =>
    index === turnIndex ? updatedTurn : turn
  );

  matchup.liveState = buildLiveStateFromTurns(
    nextTurns,
    matchup.liveState.startingSide ?? 'home',
    matchup.liveState.format ?? matchup.type ?? 'singles',
    matchup.liveState.startingScore ?? matchup.startingScore ?? 501
  );

  if (matchup.liveState.winnerSide) {
    finalizeMatchupWin(rawFixture, matchup, matchup.liveState.winnerSide);
  } else {
    reopenMatchupAfterEdit(rawFixture, matchup);
  }

  return {
    success: true,
    message: 'Turn updated successfully',
    fixture: cloneFixtureForViewer(playerId, rawFixture),
    matchup: {
      ...matchup,
      result: matchup.result ? { ...matchup.result } : null,
      liveState: cloneLiveState(matchup.liveState)
    }
  };
}

export function applyCaptainSubstitution(
  playerId,
  fixtureId,
  outgoingPlayerId,
  incomingPlayerId
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
      message: 'Substitutions are only available once the fixture is live'
    };
  }

  const sideStore = rawFixture.sides[captainSide];
  const currentLineupIds = sideStore.currentLineup.filter(Boolean);
  const outgoingPlayer = getPlayerFromSquad(sideStore, outgoingPlayerId);
  const incomingPlayer = getPlayerFromSquad(sideStore, incomingPlayerId);

  if (!outgoingPlayer) {
    return {
      success: false,
      message: 'Outgoing player was not found in your squad'
    };
  }

  if (!incomingPlayer) {
    return {
      success: false,
      message: 'Incoming substitute was not found in your squad'
    };
  }

  if (!currentLineupIds.includes(outgoingPlayerId)) {
    return {
      success: false,
      message: 'Outgoing player is not currently in your active lineup'
    };
  }

  if (currentLineupIds.includes(incomingPlayerId)) {
    return {
      success: false,
      message: 'Incoming player is already in your active lineup'
    };
  }

  const updatedMatchupCount = updateWaitingMatchupsForSubstitution(
    rawFixture,
    captainSide,
    outgoingPlayerId,
    incomingPlayer
  );

  if (updatedMatchupCount === 0) {
    return {
      success: false,
      message: 'There are no future waiting matchups left for that player'
    };
  }

  sideStore.currentLineup = sideStore.currentLineup.map((playerId) =>
    playerId === outgoingPlayerId ? incomingPlayerId : playerId
  );

  if (!sideStore.substitutions) {
    sideStore.substitutions = [];
  }

  sideStore.substitutions.push({
    outgoingPlayerId,
    outgoingPlayerName: outgoingPlayer.displayName,
    incomingPlayerId,
    incomingPlayerName: incomingPlayer.displayName,
    appliedAt: new Date().toISOString(),
    updatedMatchupCount
  });

  return {
    success: true,
    message: `${incomingPlayer.displayName} has replaced ${outgoingPlayer.displayName} for ${updatedMatchupCount} future matchup${updatedMatchupCount > 1 ? 's' : ''}`,
    fixture: cloneFixtureForViewer(playerId, rawFixture)
  };
}

export function setCaptainMatchupStartingSide(
  playerId,
  fixtureId,
  matchupId,
  startingSide
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

  if (!rawFixture.liveSession) {
    return {
      success: false,
      message: 'Fixture live session has not been started yet'
    };
  }

  const matchup = getMatchupFromFixture(rawFixture, matchupId);

  if (!matchup || !matchup.liveState) {
    return {
      success: false,
      message: 'Matchup live state not found'
    };
  }

  if (!['home', 'away'].includes(startingSide)) {
    return {
      success: false,
      message: 'Starting side is invalid'
    };
  }

  if (matchup.liveState.turns.length > 0) {
    return {
      success: false,
      message: 'Starting side can only be changed before the first turn is entered'
    };
  }

  matchup.liveState.startingSide = startingSide;
  matchup.liveState.currentTurnSide = startingSide;
  matchup.liveState.currentPlayerIndex = 0;

  return {
    success: true,
    message: `${startingSide === 'home' ? 'Home' : 'Away'} will throw first`,
    fixture: cloneFixtureForViewer(playerId, rawFixture),
    matchup: {
      ...matchup,
      result: matchup.result ? { ...matchup.result } : null,
      liveState: cloneLiveState(matchup.liveState)
    }
  };
}

export function submitCaptainPostMatchWrapUp(
  playerId,
  fixtureId,
  { selectedOpponentPotmPlayerId, notes, confirmScoresheet }
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

  if (rawFixture.status !== 'completed' || !rawFixture.liveSession) {
    return {
      success: false,
      message: 'Post-match wrap-up is only available once the fixture is complete'
    };
  }

  const opponentSquad = getOpponentSquadForCaptain(rawFixture, captainSide);
  const selectedPotmPlayer =
    opponentSquad.find((player) => player.playerId === selectedOpponentPotmPlayerId) ?? null;

  if (!selectedPotmPlayer) {
    return {
      success: false,
      message: 'Please choose a valid POTM from the opposing team'
    };
  }

  if (!confirmScoresheet) {
    return {
      success: false,
      message: 'Please confirm the scoresheet before submitting'
    };
  }

  rawFixture.postMatch[captainSide] = {
    selectedOpponentPotmPlayerId: selectedPotmPlayer.playerId,
    selectedOpponentPotmPlayerName: selectedPotmPlayer.displayName,
    notes: notes?.trim() ?? '',
    confirmedAt: new Date().toISOString()
  };

  const homeDone = Boolean(rawFixture.postMatch.home.confirmedAt);
  const awayDone = Boolean(rawFixture.postMatch.away.confirmedAt);

  return {
    success: true,
    message:
      homeDone && awayDone
        ? 'Both captains have completed the post-match wrap-up'
        : 'Your post-match wrap-up has been submitted',
    fixture: cloneFixtureForViewer(playerId, rawFixture)
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