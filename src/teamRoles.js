function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }
  
  export function createTeamRoleStore() {
    return {
      memberships: [],
      captainAuditLog: []
    };
  }
  
  export function createTeamMembership({
    playerId,
    competitionId,
    teamId,
    teamRole = 'player',
    status = 'active',
    effectiveFrom = new Date().toISOString(),
    effectiveTo = null,
    isActive = true
  }) {
    return {
      membershipId: createId('membership'),
      playerId,
      competitionId,
      teamId,
      teamRole,
      status,
      effectiveFrom,
      effectiveTo,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  export function addTeamMembership(store, membership) {
    store.memberships.push(membership);
  
    return {
      success: true,
      store,
      membership
    };
  }
  
  export function getTeamMemberships(store, teamId, competitionId) {
    return store.memberships.filter(
      (membership) =>
        membership.teamId === teamId &&
        membership.competitionId === competitionId &&
        membership.isActive
    );
  }
  
  export function getActiveCaptain(store, teamId, competitionId) {
    return (
      store.memberships.find(
        (membership) =>
          membership.teamId === teamId &&
          membership.competitionId === competitionId &&
          membership.isActive &&
          membership.teamRole === 'captain'
      ) ?? null
    );
  }
  
  export function isPlayerCaptain(store, playerId, teamId, competitionId) {
    return store.memberships.some(
      (membership) =>
        membership.playerId === playerId &&
        membership.teamId === teamId &&
        membership.competitionId === competitionId &&
        membership.isActive &&
        membership.teamRole === 'captain'
    );
  }
  
  export function assignCaptain({
    store,
    playerId,
    teamId,
    competitionId,
    changedBy = 'admin',
    reason = 'Captain assignment update'
  }) {
    const targetMembership = store.memberships.find(
      (membership) =>
        membership.playerId === playerId &&
        membership.teamId === teamId &&
        membership.competitionId === competitionId &&
        membership.isActive
    );
  
    if (!targetMembership) {
      return {
        success: false,
        store,
        reason: 'Target player does not have an active membership for this team'
      };
    }
  
    const previousCaptain = getActiveCaptain(store, teamId, competitionId);
  
    if (previousCaptain && previousCaptain.playerId === playerId) {
      return {
        success: true,
        store,
        membership: targetMembership,
        auditEntry: null,
        reason: 'Player is already the active captain'
      };
    }
  
    if (previousCaptain) {
      previousCaptain.teamRole = 'player';
      previousCaptain.updatedAt = new Date().toISOString();
    }
  
    targetMembership.teamRole = 'captain';
    targetMembership.updatedAt = new Date().toISOString();
  
    const auditEntry = {
      auditId: createId('captainaudit'),
      teamId,
      competitionId,
      previousCaptainPlayerId: previousCaptain ? previousCaptain.playerId : null,
      newCaptainPlayerId: playerId,
      changedBy,
      changedAt: new Date().toISOString(),
      reason
    };
  
    store.captainAuditLog.push(auditEntry);
  
    return {
      success: true,
      store,
      membership: targetMembership,
      auditEntry
    };
  }
  
  export function removeCaptain({
    store,
    teamId,
    competitionId,
    changedBy = 'admin',
    reason = 'Captain removed'
  }) {
    const currentCaptain = getActiveCaptain(store, teamId, competitionId);
  
    if (!currentCaptain) {
      return {
        success: false,
        store,
        reason: 'No active captain found for this team'
      };
    }
  
    currentCaptain.teamRole = 'player';
    currentCaptain.updatedAt = new Date().toISOString();
  
    const auditEntry = {
      auditId: createId('captainaudit'),
      teamId,
      competitionId,
      previousCaptainPlayerId: currentCaptain.playerId,
      newCaptainPlayerId: null,
      changedBy,
      changedAt: new Date().toISOString(),
      reason
    };
  
    store.captainAuditLog.push(auditEntry);
  
    return {
      success: true,
      store,
      removedCaptain: currentCaptain,
      auditEntry
    };
  }
  
  export function printTeamRoleState(title, data) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(data, null, 2));
  }