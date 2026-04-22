function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeObject(value) {
  return value && typeof value === 'object' ? value : {};
}

// ============================================
// PLAYER MASTER RECORD
// Admin-controlled official registry record
// ============================================
export function createPlayerMasterRecord(data) {
  const firstNames = cleanString(data.firstNames);
  const surname = cleanString(data.surname);
  const fullName =
    cleanString(data.fullName) ||
    [firstNames, surname].filter(Boolean).join(' ').trim();

  return {
    playerId: data.playerId ?? createId('player'),

    // official identity
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

    // admin registry status
    registrationStatus: cleanString(data.registrationStatus) || 'active', // active | inactive | non-active
    associationName: cleanString(data.associationName),
    provinceName: cleanString(data.provinceName),

    // club and competition identity
    clubId: cleanString(data.clubId),
    clubName: cleanString(data.clubName),

    // helpful import aliases
    aliases: Array.isArray(data.aliases)
      ? data.aliases
          .map((alias) => cleanString(alias))
          .filter(Boolean)
      : [],

    // private contact details
    contact: {
      phone: cleanString(data.phone),
      email: cleanString(data.email),
      addressLine1: cleanString(data.addressLine1),
      addressLine2: cleanString(data.addressLine2),
      city: cleanString(data.city),
      postalCode: cleanString(data.postalCode)
    },

    // source metadata
    source: cleanString(data.source) || 'manual',
    sourceImportedAt: data.sourceImportedAt ?? null,

    // system metadata
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString()
  };
}

// ============================================
// CLUB
// Registry / branding source for teams and logos later
// ============================================
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

// ============================================
// PLAYER PRIVATE PROFILE
// What the player themselves can see/edit
// ============================================
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

// ============================================
// PLAYER PUBLIC PROFILE
// What public / other players may see
// ============================================
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

// ============================================
// COMPETITION
// Example: ODA League, ODA Singles League, ODA Memorial
// ============================================
export function createCompetition(data) {
  return {
    competitionId: data.competitionId ?? createId('competition'),
    name: data.name,
    type: data.type, // league | singles | memorial | tournament
    season: cleanString(data.season),
    status: cleanString(data.status) || 'active', // active | completed | archived
    associationName: cleanString(data.associationName),
    provinceName: cleanString(data.provinceName),
    createdAt: data.createdAt ?? new Date().toISOString()
  };
}

// ============================================
// COMPETITION MEMBERSHIP
// Links ONE player to MANY competitions
// ============================================
export function createCompetitionMembership(data) {
  return {
    membershipId: data.membershipId ?? createId('membership'),
    playerId: data.playerId,
    competitionId: data.competitionId,
    teamId: data.teamId ?? null,
    role: cleanString(data.role) || 'player', // player | captain | reserve
    status: cleanString(data.status) || 'active', // active | inactive
    joinedAt: data.joinedAt ?? new Date().toISOString()
  };
}

// ============================================
// TEAM
// Used in leagues and team fixtures
// ============================================
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

// ============================================
// HISTORICAL RAW STAT ROW
// Exact imported row from spreadsheet for audit / traceability
// ============================================
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

// ============================================
// NORMALIZED HISTORICAL STAT ROW
// Clean app-facing stat record linked to official player/team
// ============================================
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

    opponentTeamName: cleanString(data.opponentTeamName),
    matchDate: cleanString(data.matchDate),

    metrics: {
      average: toNullableNumber(data.metrics?.average),
      dartsUsed: toNullableNumber(data.metrics?.dartsUsed),
      tons: toNullableNumber(data.metrics?.tons),
      oneEighties: toNullableNumber(data.metrics?.oneEighties),
      legsPlayed: toNullableNumber(data.metrics?.legsPlayed),
      legsWon: toNullableNumber(data.metrics?.legsWon),
      points: toNullableNumber(data.metrics?.points)
    },

    importStatus: cleanString(data.importStatus) || 'matched',
    importedAt: data.importedAt ?? new Date().toISOString()
  };
}

// ============================================
// IMPORT EXCEPTION
// Stores unmatched or ambiguous spreadsheet rows
// ============================================
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

// ============================================
// FIXTURE TEMPLATE
// Reusable format definition, admin can still override later
// ============================================
export function createFixtureTemplate(data) {
  return {
    templateId: data.templateId ?? createId('template'),
    name: data.name,
    competitionType: data.competitionType, // league | singles | memorial | tournament
    associationName: cleanString(data.associationName),
    games: data.games.map((game, index) => ({
      order: index + 1,
      label: game.label ?? `Game ${index + 1}`,
      type: game.type, // singles | doubles | team
      startingScore: game.startingScore ?? 501,
      legsMode: game.legsMode ?? 'fixed',
      totalLegs: game.totalLegs ?? 1
    })),
    createdAt: data.createdAt ?? new Date().toISOString()
  };
}

// ============================================
// EDIT REQUEST
// For player self-service with admin approval flow
// ============================================
export function createPlayerEditRequest(data) {
  return {
    requestId: data.requestId ?? createId('editreq'),
    playerId: data.playerId,
    requestedChanges: data.requestedChanges,
    status: data.status ?? 'pending', // pending | approved | rejected
    submittedAt: data.submittedAt ?? new Date().toISOString(),
    reviewedAt: data.reviewedAt ?? null,
    reviewedBy: data.reviewedBy ?? null
  };
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

// ============================================
// SIMPLE PRINTERS FOR TESTING
// ============================================
export function printObject(title, obj) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(obj, null, 2));
}