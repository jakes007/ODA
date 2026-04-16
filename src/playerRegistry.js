import {
    createPlayerMasterRecord,
    buildPlayerPrivateProfile,
    buildPlayerPublicProfile,
    createPlayerEditRequest
  } from './dataModel.js';
  
  export function registerPlayer(registry, playerData) {
    const player = createPlayerMasterRecord(playerData);
  
    registry.players[player.playerId] = player;
  
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
  
  function applyAllowedChanges(player, requestedChanges) {
    // Safe editable fields only for now
    if (requestedChanges.contact) {
      player.contact = {
        ...player.contact,
        ...requestedChanges.contact
      };
    }
  
    // Optional future allowed fields
    if (typeof requestedChanges.registrationStatus === 'string') {
      player.registrationStatus = requestedChanges.registrationStatus;
    }
  }
  
  export function createEmptyRegistry() {
    return {
      players: {},
      editRequests: {}
    };
  }
  
  export function printRegistryState(title, data) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(data, null, 2));
  }