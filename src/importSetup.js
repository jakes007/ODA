import {
    createClub,
    createCompetition,
    createTeam,
    createCompetitionMembership
  } from './dataModel.js';
  
  function cleanString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  
  function makeLookupKey(...parts) {
    return parts.map((part) => cleanString(String(part)).toLowerCase()).join('::');
  }
  
  // ============================================
  // CLUBS
  // ============================================
  
  export function ensureClubExists(registry, data) {
    const clubName = cleanString(data.name);
    const associationName = cleanString(data.associationName);
    const provinceName = cleanString(data.provinceName);
  
    if (!clubName) {
      return {
        success: false,
        registry,
        reason: 'Club name is required'
      };
    }
  
    const clubLookupKey = makeLookupKey(clubName, associationName, provinceName);
    const existingClubId = registry.clubIdsByLookupKey[clubLookupKey];
  
    if (existingClubId && registry.clubs[existingClubId]) {
      return {
        success: true,
        registry,
        club: registry.clubs[existingClubId],
        created: false
      };
    }
  
    const club = createClub({
      name: clubName,
      shortName: data.shortName,
      associationName,
      provinceName,
      logoUrl: data.logoUrl,
      colors: data.colors,
      source: data.source ?? 'import',
      sourceImportedAt: data.sourceImportedAt ?? new Date().toISOString()
    });
  
    registry.clubs[club.clubId] = club;
    registry.clubIdsByLookupKey[clubLookupKey] = club.clubId;
  
    return {
      success: true,
      registry,
      club,
      created: true
    };
  }
  
  // ============================================
  // COMPETITIONS
  // ============================================
  
  export function ensureCompetitionExists(registry, data) {
    const name = cleanString(data.name);
    const type = cleanString(data.type);
    const season = cleanString(data.season);
    const associationName = cleanString(data.associationName);
    const provinceName = cleanString(data.provinceName);
  
    if (!name) {
      return {
        success: false,
        registry,
        reason: 'Competition name is required'
      };
    }
  
    const competitionLookupKey = makeLookupKey(
      name,
      type,
      season,
      associationName,
      provinceName
    );
  
    const existingCompetitionId =
      registry.competitionIdsByLookupKey[competitionLookupKey];
  
    if (existingCompetitionId && registry.competitions[existingCompetitionId]) {
      return {
        success: true,
        registry,
        competition: registry.competitions[existingCompetitionId],
        created: false
      };
    }
  
    const competition = createCompetition({
      name,
      type: type || 'league',
      season,
      status: data.status ?? 'active',
      associationName,
      provinceName
    });
  
    registry.competitions[competition.competitionId] = competition;
    registry.competitionIdsByLookupKey[competitionLookupKey] =
      competition.competitionId;
  
    return {
      success: true,
      registry,
      competition,
      created: true
    };
  }
  
  // ============================================
  // TEAMS
  // A club can have many teams across competitions/seasons
  // ============================================
  
  export function ensureTeamExists(registry, data) {
    const teamName = cleanString(data.name);
    const competitionId = data.competitionId ?? null;
    const season = cleanString(data.season);
    const associationName = cleanString(data.associationName);
  
    if (!teamName) {
      return {
        success: false,
        registry,
        reason: 'Team name is required'
      };
    }
  
    const teamLookupKey = makeLookupKey(
      teamName,
      competitionId ?? '',
      season,
      associationName
    );
  
    const existingTeamId = registry.teamIdsByLookupKey[teamLookupKey];
  
    if (existingTeamId && registry.teams[existingTeamId]) {
      return {
        success: true,
        registry,
        team: registry.teams[existingTeamId],
        created: false
      };
    }
  
    const team = createTeam({
      name: teamName,
      clubId: data.clubId ?? '',
      clubName: data.clubName ?? '',
      associationName,
      competitionId,
      season,
      captainPlayerId: data.captainPlayerId ?? null,
      status: data.status ?? 'active',
      source: data.source ?? 'import',
      sourceImportedAt: data.sourceImportedAt ?? new Date().toISOString()
    });
  
    registry.teams[team.teamId] = team;
    registry.teamIdsByLookupKey[teamLookupKey] = team.teamId;
  
    return {
      success: true,
      registry,
      team,
      created: true
    };
  }
  
  // ============================================
  // COMPETITION MEMBERSHIPS
  // Links player -> competition -> team
  // ============================================
  
  export function ensureCompetitionMembershipExists(registry, data) {
    const playerId = data.playerId ?? null;
    const competitionId = data.competitionId ?? null;
    const teamId = data.teamId ?? null;
    const role = cleanString(data.role) || 'player';
  
    if (!playerId) {
      return {
        success: false,
        registry,
        reason: 'playerId is required'
      };
    }
  
    if (!competitionId) {
      return {
        success: false,
        registry,
        reason: 'competitionId is required'
      };
    }
  
    const membershipLookupKey = makeLookupKey(
      playerId,
      competitionId,
      teamId ?? '',
      role
    );
  
    const existingMembershipId =
      registry.membershipIdsByLookupKey[membershipLookupKey];
  
    if (existingMembershipId && registry.competitionMemberships[existingMembershipId]) {
      return {
        success: true,
        registry,
        membership: registry.competitionMemberships[existingMembershipId],
        created: false
      };
    }
  
    const membership = createCompetitionMembership({
      playerId,
      competitionId,
      teamId,
      role,
      status: data.status ?? 'active'
    });
  
    registry.competitionMemberships[membership.membershipId] = membership;
    registry.membershipIdsByLookupKey[membershipLookupKey] = membership.membershipId;
  
    return {
      success: true,
      registry,
      membership,
      created: true
    };
  }
  
  // ============================================
  // HIGHER-LEVEL IMPORT HELPERS
  // Useful when processing registry rows / stats rows
  // ============================================
  
  export function ensureClubCompetitionAndTeam(registry, data) {
    const clubResult = ensureClubExists(registry, {
      name: data.clubName,
      associationName: data.associationName,
      provinceName: data.provinceName,
      source: data.source ?? 'import',
      sourceImportedAt: data.sourceImportedAt
    });
  
    if (!clubResult.success) {
      return clubResult;
    }
  
    const competitionResult = ensureCompetitionExists(registry, {
      name: data.competitionName,
      type: data.competitionType ?? 'league',
      season: data.season,
      status: data.competitionStatus ?? 'active',
      associationName: data.associationName,
      provinceName: data.provinceName
    });
  
    if (!competitionResult.success) {
      return competitionResult;
    }
  
    const teamResult = ensureTeamExists(registry, {
      name: data.teamName,
      clubId: clubResult.club.clubId,
      clubName: clubResult.club.name,
      associationName: data.associationName,
      competitionId: competitionResult.competition.competitionId,
      season: data.season,
      source: data.source ?? 'import',
      sourceImportedAt: data.sourceImportedAt
    });
  
    if (!teamResult.success) {
      return teamResult;
    }
  
    return {
      success: true,
      registry,
      club: clubResult.club,
      competition: competitionResult.competition,
      team: teamResult.team
    };
  }
  
  export function ensurePlayerCompetitionMembership(registry, data) {
    const setupResult = ensureClubCompetitionAndTeam(registry, data);
  
    if (!setupResult.success) {
      return setupResult;
    }
  
    const membershipResult = ensureCompetitionMembershipExists(registry, {
      playerId: data.playerId,
      competitionId: setupResult.competition.competitionId,
      teamId: setupResult.team.teamId,
      role: data.role ?? 'player',
      status: data.status ?? 'active'
    });
  
    if (!membershipResult.success) {
      return membershipResult;
    }
  
    return {
      success: true,
      registry,
      club: setupResult.club,
      competition: setupResult.competition,
      team: setupResult.team,
      membership: membershipResult.membership
    };
  }