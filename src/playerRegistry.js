import {
  createPlayerMasterRecord,
  buildPlayerPrivateProfile,
  buildPlayerPublicProfile,
  createPlayerEditRequest,
  createImportException,
  createHistoricalStatNormalized
} from './dataModel.js';

export function registerPlayer(registry, playerData) {
  const player = createPlayerMasterRecord(playerData);

  registry.players[player.playerId] = player;

  if (player.dsaNumber) {
    registry.playerIdsByDsaNumber[player.dsaNumber] = player.playerId;
  }

  return {
    success: true,
    registry,
    player
  };
}

export function getAdminPlayerView(registry, playerId) {
  const player = registry.players[playerId];

  if (!player) {
    return {
      success: false,
      reason: 'Player not found'
    };
  }

  return {
    success: true,
    player
  };
}

export function getPrivatePlayerView(registry, playerId) {
  const player = registry.players[playerId];

  if (!player) {
    return {
      success: false,
      reason: 'Player not found'
    };
  }

  return {
    success: true,
    player: buildPlayerPrivateProfile(player)
  };
}

export function getPublicPlayerView(registry, playerId, options = {}) {
  const player = registry.players[playerId];

  if (!player) {
    return {
      success: false,
      reason: 'Player not found'
    };
  }

  return {
    success: true,
    player: buildPlayerPublicProfile(player, options)
  };
}

export function submitPlayerEditRequest(registry, playerId, requestedChanges) {
  const player = registry.players[playerId];

  if (!player) {
    return {
      success: false,
      registry,
      reason: 'Player not found'
    };
  }

  const request = createPlayerEditRequest({
    playerId,
    requestedChanges
  });

  registry.editRequests[request.requestId] = request;

  return {
    success: true,
    registry,
    request
  };
}

export function approvePlayerEditRequest(registry, requestId, reviewedBy = 'admin') {
  const request = registry.editRequests[requestId];

  if (!request) {
    return {
      success: false,
      registry,
      reason: 'Edit request not found'
    };
  }

  if (request.status !== 'pending') {
    return {
      success: false,
      registry,
      reason: 'Edit request is not pending'
    };
  }

  const player = registry.players[request.playerId];

  if (!player) {
    return {
      success: false,
      registry,
      reason: 'Player not found for edit request'
    };
  }

  applyAllowedChanges(player, request.requestedChanges);

  player.updatedAt = new Date().toISOString();

  request.status = 'approved';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = reviewedBy;

  return {
    success: true,
    registry,
    player,
    request
  };
}

export function rejectPlayerEditRequest(registry, requestId, reviewedBy = 'admin') {
  const request = registry.editRequests[requestId];

  if (!request) {
    return {
      success: false,
      registry,
      reason: 'Edit request not found'
    };
  }

  if (request.status !== 'pending') {
    return {
      success: false,
      registry,
      reason: 'Edit request is not pending'
    };
  }

  request.status = 'rejected';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = reviewedBy;

  return {
    success: true,
    registry,
    request
  };
}

// ============================================
// REGISTRY IMPORT HELPERS
// ============================================

export function buildCanonicalPlayerFromRegistryRow(row) {
  const dsaNumber = readFirstNonEmpty(row, [
    'DSA Number',
    'DSA No',
    'DSA',
    'DSA_NUMBER'
  ]);

  const surname = readFirstNonEmpty(row, [
    'Surname',
    'SURNAME'
  ]);

  const initials = readFirstNonEmpty(row, [
    'Initials',
    'INITIALS'
  ]);

  const firstNames = readFirstNonEmpty(row, [
    'First Names',
    'Firstname',
    'FirstName',
    'FIRST NAMES'
  ]);

  const callingName = readFirstNonEmpty(row, [
    'Calling Name',
    'CALLING NAME'
  ]);

  const clubName = readFirstNonEmpty(row, [
    'Club',
    'Club Name',
    'CLUB'
  ]);

  const associationName = readFirstNonEmpty(row, [
    'Association',
    'Association Name',
    'ASSOCIATION'
  ]);

  const provinceName = readFirstNonEmpty(row, [
    'Province',
    'Province Name',
    'PROVINCE'
  ]);

  const gender = readFirstNonEmpty(row, [
    'Gender',
    'GENDER'
  ]);

  const race = readFirstNonEmpty(row, [
    'Race',
    'RACE'
  ]);

  const idNumber = readFirstNonEmpty(row, [
    'ID Number',
    'ID No',
    'ID NUMBER'
  ]);

  const dateOfBirth = readFirstNonEmpty(row, [
    'Date Of Birth',
    'Date of Birth',
    'DOB'
  ]);

  const fullName = [firstNames, surname].filter(Boolean).join(' ').trim();

  const aliases = [
    fullName,
    [initials, surname].filter(Boolean).join(' ').trim(),
    [initials, surname].filter(Boolean).join('.').trim(),
    callingName ? [callingName, surname].filter(Boolean).join(' ').trim() : ''
  ].filter(Boolean);

  return createPlayerMasterRecord({
    fullName,
    firstNames,
    surname,
    initials,
    callingName,
    dsaNumber,
    idNumber,
    dateOfBirth,
    race,
    gender,
    registrationStatus: 'active',
    associationName,
    provinceName,
    clubName,
    aliases,
    source: 'registry_import',
    sourceImportedAt: new Date().toISOString()
  });
}

export function registerCanonicalPlayerFromRegistryRow(registry, row) {
  const player = buildCanonicalPlayerFromRegistryRow(row);

  registry.players[player.playerId] = player;

  if (player.dsaNumber) {
    registry.playerIdsByDsaNumber[player.dsaNumber] = player.playerId;
  }

  return {
    success: true,
    registry,
    player
  };
}

// ============================================
// STATS IMPORT MATCHING
// ============================================

export function matchStatsRowToRegistryPlayerByDsaNumber(registry, statsRow) {
  const dsaNumber = readFirstNonEmpty(statsRow, [
    'DSA Number',
    'DSA No',
    'DSA',
    'DSA_NUMBER'
  ]);

  const rawPlayerName = readFirstNonEmpty(statsRow, [
    'Player',
    'PLAYER'
  ]);

  if (!dsaNumber) {
    return {
      success: false,
      reason: 'Missing DSA number',
      dsaNumber: '',
      rawPlayerName
    };
  }

  const playerId = registry.playerIdsByDsaNumber[dsaNumber];
  if (!playerId) {
    return {
      success: false,
      reason: 'DSA number not found in registry',
      dsaNumber,
      rawPlayerName
    };
  }

  const player = registry.players[playerId];
  if (!player) {
    return {
      success: false,
      reason: 'Player record missing for matched DSA number',
      dsaNumber,
      rawPlayerName
    };
  }

  return {
    success: true,
    dsaNumber,
    rawPlayerName,
    player
  };
}

export function normalizeMatchedStatsRow(registry, statsRow, options = {}) {
  const matchResult = matchStatsRowToRegistryPlayerByDsaNumber(registry, statsRow);

  if (!matchResult.success) {
    const exception = createImportException({
      rawStatId: options.rawStatId ?? null,
      dsaNumber: matchResult.dsaNumber,
      rawPlayerName: matchResult.rawPlayerName,
      reason: matchResult.reason
    });

    registry.importExceptions[exception.exceptionId] = exception;

    return {
      success: false,
      registry,
      exception,
      reason: matchResult.reason
    };
  }

  const player = matchResult.player;

  const normalizedStat = createHistoricalStatNormalized({
    rawStatId: options.rawStatId ?? null,
    competitionId: options.competitionId ?? null,
    season: options.season ?? '',
    division: readFirstNonEmpty(statsRow, ['Division', 'DIVISION']),
    playerId: player.playerId,
    dsaNumber: player.dsaNumber,
    displayName: player.fullName,
    teamId: options.teamId ?? null,
    teamName: readFirstNonEmpty(statsRow, ['Team', 'TEAM']),
    clubId: player.clubId ?? null,
    clubName: player.clubName ?? '',
    opponentTeamName: readFirstNonEmpty(statsRow, ['Opponent', 'Opponent Team', 'OPPONENT']),
    matchDate: readFirstNonEmpty(statsRow, ['Date', 'DATE']),
    metrics: {
      average: readFirstNonEmpty(statsRow, ['Average', 'AVG', '3DA']),
      dartsUsed: readFirstNonEmpty(statsRow, ['Darts Used', 'Darts', 'DARTS USED']),
      tons: readFirstNonEmpty(statsRow, ['Tons', 'TONS']),
      oneEighties: readFirstNonEmpty(statsRow, ['180s', '1x80s', 'OneEighties']),
      legsPlayed: readFirstNonEmpty(statsRow, ['Legs Played', 'Legs', 'LEGS PLAYED']),
      legsWon: readFirstNonEmpty(statsRow, ['Legs Won', 'WON']),
      points: readFirstNonEmpty(statsRow, ['Points', 'PTS'])
    },
    importStatus: 'matched',
    importedAt: new Date().toISOString()
  });

  registry.historicalStatsNormalized[normalizedStat.statId] = normalizedStat;

  return {
    success: true,
    registry,
    stat: normalizedStat,
    player
  };
}

function applyAllowedChanges(player, requestedChanges) {
  if (requestedChanges.contact) {
    player.contact = {
      ...player.contact,
      ...requestedChanges.contact
    };
  }

  if (typeof requestedChanges.registrationStatus === 'string') {
    player.registrationStatus = requestedChanges.registrationStatus;
  }
}

function readFirstNonEmpty(row, possibleKeys) {
  for (const key of possibleKeys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

export function createEmptyRegistry() {
  return {
    players: {},
    playerIdsByDsaNumber: {},
    editRequests: {},
    historicalStatsNormalized: {},
    importExceptions: {}
  };
}

export function printRegistryState(title, data) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(data, null, 2));
}