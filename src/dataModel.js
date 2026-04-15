function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }
  
  // ============================================
  // PLAYER MASTER RECORD
  // Admin-controlled official registry record
  // ============================================
  export function createPlayerMasterRecord(data) {
    return {
      playerId: createId('player'),
  
      // official identity
      fullName: data.fullName,
      dsaNumber: data.dsaNumber ?? '',
      idNumber: data.idNumber ?? '',
      dateOfBirth: data.dateOfBirth ?? '',
      race: data.race ?? '',
      gender: data.gender ?? '',
  
      // admin registry status
      registrationStatus: data.registrationStatus ?? 'active', // active | inactive | non-active
      associationName: data.associationName ?? '',
      provinceName: data.provinceName ?? '',
  
      // private contact details
      contact: {
        phone: data.phone ?? '',
        email: data.email ?? '',
        addressLine1: data.addressLine1 ?? '',
        addressLine2: data.addressLine2 ?? '',
        city: data.city ?? '',
        postalCode: data.postalCode ?? ''
      },
  
      // system metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      dsaNumber: masterRecord.dsaNumber,
      dateOfBirth: masterRecord.dateOfBirth,
      registrationStatus: masterRecord.registrationStatus,
      associationName: masterRecord.associationName,
      provinceName: masterRecord.provinceName,
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
      displayName: options.displayName ?? masterRecord.fullName,
      associationName: masterRecord.associationName,
      provinceName: masterRecord.provinceName,
      publicStatus: masterRecord.registrationStatus
    };
  }
  
  // ============================================
  // COMPETITION
  // Example: ODA League, ODA Singles League, ODA Memorial
  // ============================================
  export function createCompetition(data) {
    return {
      competitionId: createId('competition'),
      name: data.name,
      type: data.type, // league | singles | memorial | tournament
      season: data.season ?? '',
      status: data.status ?? 'active', // active | completed | archived
      associationName: data.associationName ?? '',
      provinceName: data.provinceName ?? '',
      createdAt: new Date().toISOString()
    };
  }
  
  // ============================================
  // COMPETITION MEMBERSHIP
  // Links ONE player to MANY competitions
  // ============================================
  export function createCompetitionMembership(data) {
    return {
      membershipId: createId('membership'),
      playerId: data.playerId,
      competitionId: data.competitionId,
      teamId: data.teamId ?? null,
      role: data.role ?? 'player', // player | captain | reserve
      status: data.status ?? 'active', // active | inactive
      joinedAt: new Date().toISOString()
    };
  }
  
  // ============================================
  // TEAM
  // Used in leagues and team fixtures
  // ============================================
  export function createTeam(data) {
    return {
      teamId: createId('team'),
      name: data.name,
      associationName: data.associationName ?? '',
      competitionId: data.competitionId ?? null,
      captainPlayerId: data.captainPlayerId ?? null,
      createdAt: new Date().toISOString()
    };
  }
  
  // ============================================
  // FIXTURE TEMPLATE
  // Reusable format definition, admin can still override later
  // ============================================
  export function createFixtureTemplate(data) {
    return {
      templateId: createId('template'),
      name: data.name,
      competitionType: data.competitionType, // league | singles | memorial | tournament
      associationName: data.associationName ?? '',
      games: data.games.map((game, index) => ({
        order: index + 1,
        label: game.label ?? `Game ${index + 1}`,
        type: game.type, // singles | doubles | team
        startingScore: game.startingScore ?? 501,
        legsMode: game.legsMode ?? 'fixed',
        totalLegs: game.totalLegs ?? 1
      })),
      createdAt: new Date().toISOString()
    };
  }
  
  // ============================================
  // EDIT REQUEST
  // For player self-service with admin approval flow
  // ============================================
  export function createPlayerEditRequest(data) {
    return {
      requestId: createId('editreq'),
      playerId: data.playerId,
      requestedChanges: data.requestedChanges, // object of changed fields
      status: data.status ?? 'pending', // pending | approved | rejected
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };
  }
  
  // ============================================
  // SIMPLE PRINTERS FOR TESTING
  // ============================================
  export function printObject(title, obj) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(obj, null, 2));
  }