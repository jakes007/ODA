import {
  createPlayerMasterRecord,
  buildPlayerPrivateProfile,
  buildPlayerPublicProfile,
  createPlayerEditRequest,
  createImportException,
  createHistoricalStatNormalized
} from './dataModel.js';

export function registerPlayer(registry, playerData) {
  const player = createPlayerMasterRecord({
    ...playerData,
    dsaNumber: normalizeDsaNumber(playerData.dsaNumber)
  });

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
    return { success: false, reason: 'Player not found' };
  }

  return { success: true, player };
}

export function getPrivatePlayerView(registry, playerId) {
  const player = registry.players[playerId];

  if (!player) {
    return { success: false, reason: 'Player not found' };
  }

  return {
    success: true,
    player: buildPlayerPrivateProfile(player)
  };
}

export function getPublicPlayerView(registry, playerId, options = {}) {
  const player = registry.players[playerId];

  if (!player) {
    return { success: false, reason: 'Player not found' };
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
    return { success: false, registry, reason: 'Edit request not found' };
  }

  if (request.status !== 'pending') {
    return { success: false, registry, reason: 'Edit request is not pending' };
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
    return { success: false, registry, reason: 'Edit request not found' };
  }

  if (request.status !== 'pending') {
    return { success: false, registry, reason: 'Edit request is not pending' };
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

export function buildCanonicalPlayerFromRegistryRow(row) {
  const dsaNumber = normalizeDsaNumber(
    readFirstNonEmpty(row, [
      'Membership No.',
      'Membership No',
      'Membership Number',
      'DSA Number',
      'DSA No',
      'DSA',
      'DSA_NUMBER',
      'Dsa Number',
      'Dsa No'
    ])
  );

  const surname = readFirstNonEmpty(row, [
    'Surname',
    'SURNAME',
    'Last Name',
    'Lastname',
    'LastName'
  ]);

  const initials = readFirstNonEmpty(row, [
    'Initials',
    'INITIALS',
    'Inits',
    'INITS'
  ]);

  const firstNames = readFirstNonEmpty(row, [
    'First Names (as per ID)',
    'First Names',
    'FIRST NAMES',
    'First Name',
    'FirstName',
    'Firstname',
    'Names',
    'NAMES',
    'Christian Names'
  ]);

  const callingName = readFirstNonEmpty(row, [
    'Calling  Name',
    'Calling Name',
    'CALLING NAME',
    'Nickname',
    'Known As'
  ]);

  const clubName = readFirstNonEmpty(row, [
    'Club',
    'Club Name',
    'CLUB',
    'ClubName'
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

  const gender = readFirstNonEmpty(row, ['Sex', 'Gender', 'GENDER']);
  const race = readFirstNonEmpty(row, ['Race', 'RACE']);
  const registrationStatus = readFirstNonEmpty(row, ['Status', 'STATUS']);
  const idNumber = readFirstNonEmpty(row, ['ID Number', 'ID No', 'ID NUMBER', 'Id Number']);
  const dateOfBirth = readFirstNonEmpty(row, [
    'Date of Birth\r\n(yyyy-mm-dd)',
    'Date Of Birth',
    'Date of Birth',
    'DOB',
    'Birth Date'
  ]);
  const email = readFirstNonEmpty(row, [
    'eMail address',
    'Email address',
    'Email',
    'eMail Address'
  ]);
  const phone = readFirstNonEmpty(row, ['Cell No', 'Cell', 'Phone', 'Cell No.']);

  const fullName = buildFullName({
    firstNames,
    surname,
    initials,
    callingName
  });

  const aliases = buildAliases({
    fullName,
    firstNames,
    surname,
    initials,
    callingName
  });

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
    registrationStatus: registrationStatus || 'active',
    associationName,
    provinceName,
    clubName,
    phone,
    email,
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

export function matchStatsRowToRegistryPlayerByDsaNumber(registry, statsRow) {
  const dsaNumber = normalizeDsaNumber(
    readFirstNonEmpty(statsRow, [
      'DSA Number',
      'DSA No',
      'DSA',
      'DSA_NUMBER',
      'Dsa Number',
      'Dsa No'
    ])
  );

  const rawPlayerName = readFirstNonEmpty(statsRow, ['Player', 'PLAYER']);

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
    teamName: options.teamName ?? readFirstNonEmpty(statsRow, ['Team', 'TEAM']),
    clubId: options.clubId ?? player.clubId ?? null,
    clubName: options.clubName ?? player.clubName ?? '',
    opponentPlayerName: readFirstNonEmpty(statsRow, ['Opponent', 'OPPONENT']),
    opponentTeamName: options.opponentTeamName ?? '',
    matchDate: readFirstNonEmpty(statsRow, ['Date', 'DATE']),
    tournament: readFirstNonEmpty(statsRow, ['Tournament']),
    league: readFirstNonEmpty(statsRow, ['League']),
    ageGroup: readFirstNonEmpty(statsRow, [' Age Group ', 'Age Group']),
    metrics: {
      average: readFirstNonEmpty(statsRow, [' Average ', 'Average', 'AVG']),
      ranking: readFirstNonEmpty(statsRow, ['Ranking']),
      dartsUsed: readFirstNonEmpty(statsRow, ['Darts Used', 'Darts']),
      tons: readFirstNonEmpty(statsRow, ['Total Tons', 'No Tons']),
      oneEighties: readFirstNonEmpty(statsRow, ["180's", '180s']),
      oneSeventyOnes: readFirstNonEmpty(statsRow, ["171's", '171s']),
      highestClose: readFirstNonEmpty(statsRow, ['Highest Close']),
      fastestClose: readFirstNonEmpty(statsRow, ['Fastest Close']),
      singlesPlayed: readFirstNonEmpty(statsRow, ['Singles Played']),
      singlesWon: readFirstNonEmpty(statsRow, ['Singles Won']),
      legsWon: readFirstNonEmpty(statsRow, ['Legs Won']),
      legsLost: readFirstNonEmpty(statsRow, ['Legs Lost']),
      gp: readFirstNonEmpty(statsRow, ['GP']),
      wins: readFirstNonEmpty(statsRow, ['Win ']),
      draws: readFirstNonEmpty(statsRow, ['Draw']),
      losses: readFirstNonEmpty(statsRow, ['Lost']),
      points: readFirstNonEmpty(statsRow, ['Points'])
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

export function normalizeDsaNumber(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  return raw
    .toUpperCase()
    .replace(/^DSA[\s\-:]*/i, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9A-Z]/g, '');
}

function buildFullName({ firstNames, surname, initials, callingName }) {
  const preferredFirstPart = firstNames || callingName || initials;
  return [preferredFirstPart, surname].filter(Boolean).join(' ').trim();
}

function buildAliases({ fullName, firstNames, surname, initials, callingName }) {
  const aliasSet = new Set();

  [
    fullName,
    [firstNames, surname].filter(Boolean).join(' ').trim(),
    [callingName, surname].filter(Boolean).join(' ').trim(),
    [initials, surname].filter(Boolean).join(' ').trim(),
    initials && surname ? `${initials}.${surname}` : '',
    initials && surname ? `${initials} ${surname}` : ''
  ]
    .map((value) => cleanString(value))
    .filter(Boolean)
    .forEach((value) => aliasSet.add(value));

  return Array.from(aliasSet);
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

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function createEmptyRegistry() {
  return {
    players: {},
    playerIdsByDsaNumber: {},

    clubs: {},
    clubIdsByLookupKey: {},

    competitions: {},
    competitionIdsByLookupKey: {},

    teams: {},
    teamIdsByLookupKey: {},

    competitionMemberships: {},
    membershipIdsByLookupKey: {},

    historicalStatsRaw: {},
    historicalStatsNormalized: {},
    historicalTeamResultsRaw: {},
    historicalTeamResultsNormalized: {},
    importExceptions: {},

    editRequests: {}
  };
}

export function printRegistryState(title, data) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(data, null, 2));
}