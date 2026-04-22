function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function createPlayerMasterRecord(data) {
  const firstNames = cleanString(data.firstNames);
  const surname = cleanString(data.surname);
  const fullName =
    cleanString(data.fullName) ||
    [firstNames, surname].filter(Boolean).join(' ').trim();

  return {
    playerId: data.playerId ?? createId('player'),
    fullName,
    firstNames,
    surname,
    initials: cleanString(data.initials),
    callingName: cleanString(data.callingName),
    dsaNumber: cleanString(data.dsaNumber),
    idNumber: cleanString(data.idNumber),
    dateOfBirth: cleanString(data.dateOfBirth),
    race: cleanString(data.race),
    gender: cleanString(data.gender),
    registrationStatus: cleanString(data.registrationStatus) || 'active',
    associationName: cleanString(data.associationName),
    provinceName: cleanString(data.provinceName),
    clubId: cleanString(data.clubId),
    clubName: cleanString(data.clubName),
    aliases: Array.isArray(data.aliases)
      ? data.aliases.map((alias) => cleanString(alias)).filter(Boolean)
      : [],
    contact: {
      phone: cleanString(data.phone),
      email: cleanString(data.email),
      addressLine1: cleanString(data.addressLine1),
      addressLine2: cleanString(data.addressLine2),
      city: cleanString(data.city),
      postalCode: cleanString(data.postalCode)
    },
    source: cleanString(data.source) || 'manual',
    sourceImportedAt: data.sourceImportedAt ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString()
  };
}

export function createClub(data) {
  return {
    clubId: data.clubId ?? createId('club'),
    name: cleanString(data.name),
    shortName: cleanString(data.shortName),
    associationName: cleanString(data.associationName),
    provinceName: cleanString(data.provinceName),
    logoUrl: cleanString(data.logoUrl),
    colors: {
      primary: cleanString(data.colors?.primary),
      secondary: cleanString(data.colors?.secondary)
    },
    source: cleanString(data.source) || 'manual',
    sourceImportedAt: data.sourceImportedAt ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString()
  };
}

export function buildPlayerPrivateProfile(masterRecord) {
  return {
    playerId: masterRecord.playerId,
    fullName: masterRecord.fullName,
    firstNames: masterRecord.firstNames,
    surname: masterRecord.surname,
    callingName: masterRecord.callingName,
    dsaNumber: masterRecord.dsaNumber,
    dateOfBirth: masterRecord.dateOfBirth,
    registrationStatus: masterRecord.registrationStatus,
    associationName: masterRecord.associationName,
    provinceName: masterRecord.provinceName,
    clubId: masterRecord.clubId,
    clubName: masterRecord.clubName,
    contact: {
      phone: masterRecord.contact.phone,
      email: masterRecord.contact.email,
      addressLine1: masterRecord.contact.addressLine1,
      addressLine2: masterRecord.contact.addressLine2,
      city: masterRecord.contact.city,
      postalCode: masterRecord.contact.postalCode
    }
  };
}

export function buildPlayerPublicProfile(masterRecord, options = {}) {
  return {
    playerId: masterRecord.playerId,
    displayName: options.displayName ?? masterRecord.callingName ?? masterRecord.fullName,
    associationName: masterRecord.associationName,
    provinceName: masterRecord.provinceName,
    clubId: masterRecord.clubId,
    clubName: masterRecord.clubName,
    publicStatus: masterRecord.registrationStatus
  };
}

export function createCompetition(data) {
  return {
    competitionId: data.competitionId ?? createId('competition'),
    name: data.name,
    type: data.type,
    season: cleanString(data.season),
    status: cleanString(data.status) || 'active',
    associationName: cleanString(data.associationName),
    provinceName: cleanString(data.provinceName),
    createdAt: data.createdAt ?? new Date().toISOString()
  };
}

export function createCompetitionMembership(data) {
  return {
    membershipId: data.membershipId ?? createId('membership'),
    playerId: data.playerId,
    competitionId: data.competitionId,
    teamId: data.teamId ?? null,
    role: cleanString(data.role) || 'player',
    status: cleanString(data.status) || 'active',
    joinedAt: data.joinedAt ?? new Date().toISOString()
  };
}

export function createTeam(data) {
  return {
    teamId: data.teamId ?? createId('team'),
    name: cleanString(data.name),
    clubId: cleanString(data.clubId),
    clubName: cleanString(data.clubName),
    associationName: cleanString(data.associationName),
    competitionId: data.competitionId ?? null,
    season: cleanString(data.season),
    captainPlayerId: data.captainPlayerId ?? null,
    status: cleanString(data.status) || 'active',
    source: cleanString(data.source) || 'manual',
    sourceImportedAt: data.sourceImportedAt ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString()
  };
}

export function createHistoricalStatRaw(data) {
  return {
    rawStatId: data.rawStatId ?? createId('rawstat'),
    sourceWorkbook: cleanString(data.sourceWorkbook),
    sourceSheet: cleanString(data.sourceSheet),
    sourceRowNumber: Number.isFinite(Number(data.sourceRowNumber))
      ? Number(data.sourceRowNumber)
      : null,
    dsaNumber: cleanString(data.dsaNumber),
    rawPlayerName: cleanString(data.rawPlayerName),
    rawTeamName: cleanString(data.rawTeamName),
    rawOpponentName: cleanString(data.rawOpponentName),
    rawDate: cleanString(data.rawDate),
    rawFields: safeObject(data.rawFields),
    importedAt: data.importedAt ?? new Date().toISOString()
  };
}

export function createHistoricalStatNormalized(data) {
  return {
    statId: data.statId ?? createId('stat'),
    rawStatId: data.rawStatId ?? null,
    competitionId: data.competitionId ?? null,
    season: cleanString(data.season),
    division: cleanString(data.division),
    playerId: data.playerId ?? null,
    dsaNumber: cleanString(data.dsaNumber),
    displayName: cleanString(data.displayName),
    teamId: data.teamId ?? null,
    teamName: cleanString(data.teamName),
    clubId: data.clubId ?? null,
    clubName: cleanString(data.clubName),
    opponentPlayerName: cleanString(data.opponentPlayerName),
    opponentTeamName: cleanString(data.opponentTeamName),
    matchDate: cleanString(data.matchDate),
    tournament: cleanString(data.tournament),
    league: cleanString(data.league),
    ageGroup: cleanString(data.ageGroup),
    metrics: {
      average: toNullableNumber(data.metrics?.average),
      ranking: toNullableNumber(data.metrics?.ranking),
      dartsUsed: toNullableNumber(data.metrics?.dartsUsed),
      tons: toNullableNumber(data.metrics?.tons),
      oneEighties: toNullableNumber(data.metrics?.oneEighties),
      oneSeventyOnes: toNullableNumber(data.metrics?.oneSeventyOnes),
      highestClose: toNullableNumber(data.metrics?.highestClose),
      fastestClose: toNullableNumber(data.metrics?.fastestClose),
      singlesPlayed: toNullableNumber(data.metrics?.singlesPlayed),
      singlesWon: toNullableNumber(data.metrics?.singlesWon),
      legsWon: toNullableNumber(data.metrics?.legsWon),
      legsLost: toNullableNumber(data.metrics?.legsLost),
      gp: toNullableNumber(data.metrics?.gp),
      wins: toNullableNumber(data.metrics?.wins),
      draws: toNullableNumber(data.metrics?.draws),
      losses: toNullableNumber(data.metrics?.losses),
      points: toNullableNumber(data.metrics?.points)
    },
    importStatus: cleanString(data.importStatus) || 'matched',
    importedAt: data.importedAt ?? new Date().toISOString()
  };
}

export function createHistoricalTeamResultRaw(data) {
  return {
    rawTeamResultId: data.rawTeamResultId ?? createId('rawteamresult'),
    sourceWorkbook: cleanString(data.sourceWorkbook),
    sourceSheet: cleanString(data.sourceSheet),
    sourceRowNumber: Number.isFinite(Number(data.sourceRowNumber))
      ? Number(data.sourceRowNumber)
      : null,
    rawTeamName: cleanString(data.rawTeamName),
    rawOpponentTeamName: cleanString(data.rawOpponentTeamName),
    rawDate: cleanString(data.rawDate),
    rawFields: safeObject(data.rawFields),
    importedAt: data.importedAt ?? new Date().toISOString()
  };
}

export function createHistoricalTeamResultNormalized(data) {
  return {
    teamResultId: data.teamResultId ?? createId('teamresult'),
    rawTeamResultId: data.rawTeamResultId ?? null,
    competitionId: data.competitionId ?? null,
    season: cleanString(data.season),
    division: cleanString(data.division),
    teamId: data.teamId ?? null,
    teamName: cleanString(data.teamName),
    clubId: data.clubId ?? null,
    clubName: cleanString(data.clubName),
    opponentTeamId: data.opponentTeamId ?? null,
    opponentTeamName: cleanString(data.opponentTeamName),
    matchDate: cleanString(data.matchDate),
    tournament: cleanString(data.tournament),
    league: cleanString(data.league),
    ageGroup: cleanString(data.ageGroup),
    metrics: {
      dartsUsed: toNullableNumber(data.metrics?.dartsUsed),
      verifyDartsUsed: toNullableNumber(data.metrics?.verifyDartsUsed),
      theoreticalDartsUsed: toNullableNumber(data.metrics?.theoreticalDartsUsed),
      singlesPlayed: toNullableNumber(data.metrics?.singlesPlayed),
      singlesWon: toNullableNumber(data.metrics?.singlesWon),
      average: toNullableNumber(data.metrics?.average),
      tons: toNullableNumber(data.metrics?.tons),
      oneEighties: toNullableNumber(data.metrics?.oneEighties),
      oneSeventyOnes: toNullableNumber(data.metrics?.oneSeventyOnes),
      totalTons: toNullableNumber(data.metrics?.totalTons),
      highestClose: toNullableNumber(data.metrics?.highestClose),
      playerOfMatch: cleanString(data.metrics?.playerOfMatch),
      fastestClose: toNullableNumber(data.metrics?.fastestClose),
      ranking: toNullableNumber(data.metrics?.ranking),
      legsWon: toNullableNumber(data.metrics?.legsWon),
      legsLost: toNullableNumber(data.metrics?.legsLost),
      gp: toNullableNumber(data.metrics?.gp),
      wins: toNullableNumber(data.metrics?.wins),
      draws: toNullableNumber(data.metrics?.draws),
      losses: toNullableNumber(data.metrics?.losses),
      points: toNullableNumber(data.metrics?.points)
    },
    importStatus: cleanString(data.importStatus) || 'matched',
    importedAt: data.importedAt ?? new Date().toISOString()
  };
}

export function createImportException(data) {
  return {
    exceptionId: data.exceptionId ?? createId('import_exception'),
    rawStatId: data.rawStatId ?? null,
    dsaNumber: cleanString(data.dsaNumber),
    rawPlayerName: cleanString(data.rawPlayerName),
    reason: cleanString(data.reason),
    suggestedPlayerId: data.suggestedPlayerId ?? null,
    status: cleanString(data.status) || 'pending_review',
    createdAt: data.createdAt ?? new Date().toISOString()
  };
}

export function createFixtureTemplate(data) {
  return {
    templateId: data.templateId ?? createId('template'),
    name: data.name,
    competitionType: data.competitionType,
    associationName: cleanString(data.associationName),
    games: data.games.map((game, index) => ({
      order: index + 1,
      label: game.label ?? `Game ${index + 1}`,
      type: game.type,
      startingScore: game.startingScore ?? 501,
      legsMode: game.legsMode ?? 'fixed',
      totalLegs: game.totalLegs ?? 1
    })),
    createdAt: data.createdAt ?? new Date().toISOString()
  };
}

export function createPlayerEditRequest(data) {
  return {
    requestId: data.requestId ?? createId('editreq'),
    playerId: data.playerId,
    requestedChanges: data.requestedChanges,
    status: data.status ?? 'pending',
    submittedAt: data.submittedAt ?? new Date().toISOString(),
    reviewedAt: data.reviewedAt ?? null,
    reviewedBy: data.reviewedBy ?? null
  };
}

export function printObject(title, obj) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(obj, null, 2));
}