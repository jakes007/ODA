import {
    getAdminPlayerView,
    getPrivatePlayerView,
    getPublicPlayerView
  } from './playerRegistry.js';
  
  import {
    getPlayerHistory,
    getPlayerHistoryByCompetition
  } from './playerHistory.js';
  
  export function buildAdminPlayerProfile({
    registry,
    historyStore,
    aggregate,
    playerId
  }) {
    const adminView = getAdminPlayerView(registry, playerId);
  
    if (!adminView.success) {
      return {
        success: false,
        reason: adminView.reason
      };
    }
  
    return {
      success: true,
      profile: {
        visibility: 'admin',
        player: adminView.player,
        history: getPlayerHistory(historyStore, playerId),
        aggregate: aggregate?.overall ?? null,
        competitions: aggregate?.competitions ?? {}
      }
    };
  }
  
  export function buildPrivatePlayerProfile({
    registry,
    historyStore,
    aggregate,
    playerId
  }) {
    const privateView = getPrivatePlayerView(registry, playerId);
  
    if (!privateView.success) {
      return {
        success: false,
        reason: privateView.reason
      };
    }
  
    return {
      success: true,
      profile: {
        visibility: 'private',
        player: privateView.player,
        history: getPlayerHistory(historyStore, playerId),
        aggregate: aggregate?.overall ?? null,
        competitions: aggregate?.competitions ?? {}
      }
    };
  }
  
  export function buildPublicPlayerProfile({
    registry,
    historyStore,
    aggregate,
    playerId,
    displayName
  }) {
    const publicView = getPublicPlayerView(registry, playerId, { displayName });
  
    if (!publicView.success) {
      return {
        success: false,
        reason: publicView.reason
      };
    }
  
    return {
      success: true,
      profile: {
        visibility: 'public',
        player: publicView.player,
        history: getPlayerHistory(historyStore, playerId).map((entry) => ({
          historyId: entry.historyId,
          competitionId: entry.competitionId,
          competitionName: entry.competitionName,
          matchType: entry.matchType,
          fixtureId: entry.fixtureId,
          fixtureName: entry.fixtureName,
          playedAt: entry.playedAt,
          summary: sanitizeSummaryForPublic(entry.summary, entry.playerName)
        })),
        aggregate: aggregate?.overall ?? null,
        competitions: aggregate?.competitions ?? {}
      }
    };
  }
  
  export function buildCompetitionSpecificProfile({
    registry,
    historyStore,
    aggregate,
    playerId,
    competitionId,
    displayName,
    visibility = 'public'
  }) {
    let baseView;
  
    if (visibility === 'admin') {
      baseView = getAdminPlayerView(registry, playerId);
    } else if (visibility === 'private') {
      baseView = getPrivatePlayerView(registry, playerId);
    } else {
      baseView = getPublicPlayerView(registry, playerId, { displayName });
    }
  
    if (!baseView.success) {
      return {
        success: false,
        reason: baseView.reason
      };
    }
  
    const history =
      visibility === 'public'
        ? getPlayerHistoryByCompetition(historyStore, playerId, competitionId).map((entry) => ({
            historyId: entry.historyId,
            competitionId: entry.competitionId,
            competitionName: entry.competitionName,
            matchType: entry.matchType,
            fixtureId: entry.fixtureId,
            fixtureName: entry.fixtureName,
            playedAt: entry.playedAt,
            summary: sanitizeSummaryForPublic(entry.summary, entry.playerName)
          }))
        : getPlayerHistoryByCompetition(historyStore, playerId, competitionId);
  
    return {
      success: true,
      profile: {
        visibility,
        player: baseView.player,
        competitionId,
        history,
        aggregate: aggregate?.competitions?.[competitionId]?.stats ?? null
      }
    };
  }
  
  function sanitizeSummaryForPublic(summary, playerName) {
    if (!summary || !summary.players) return summary;
  
    return {
      matchComplete: summary.matchComplete,
      winner: summary.winner,
      createdAt: summary.createdAt,
      players: summary.players.map((player) => ({
        name: player.name,
        result: player.result,
        finalScore: player.finalScore,
        dartsUsed: player.dartsUsed,
        throws: player.throws,
        totalScored: player.totalScored,
        threeDartAverage: player.threeDartAverage,
        count100Plus: player.count100Plus,
        count140Plus: player.count140Plus,
        count180s: player.count180s,
        highestCheckout: player.highestCheckout,
        isProfileOwner: player.name === playerName
      }))
    };
  }
  
  export function printPlayerProfile(title, profile) {
    console.log(`\n===== ${title} =====`);
    console.log(JSON.stringify(profile, null, 2));
  }