function cleanString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  
  function normalizeName(value) {
    return cleanString(value)
      .toLowerCase()
      .replace(/\./g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function buildPlayerNameIndex(registry) {
    const index = {};
  
    Object.values(registry.players).forEach((player) => {
      const candidateNames = new Set([
        player.fullName,
        player.callingName,
        ...((player.aliases || []).filter(Boolean))
      ]);
  
      candidateNames.forEach((name) => {
        const normalized = normalizeName(name);
        if (!normalized) return;
  
        if (!index[normalized]) {
          index[normalized] = [];
        }
  
        index[normalized].push(player);
      });
    });
  
    return index;
  }
  
  function scoreCandidateMatch(exception, player) {
    let score = 0;
  
    const rawName = normalizeName(exception.rawPlayerName);
    const fullName = normalizeName(player.fullName);
    const callingName = normalizeName(player.callingName);
    const aliases = (player.aliases || []).map(normalizeName);
  
    if (rawName && rawName === fullName) score += 100;
    if (rawName && rawName === callingName) score += 95;
    if (rawName && aliases.includes(rawName)) score += 90;
  
    if (rawName && fullName.includes(rawName)) score += 40;
    if (rawName && rawName.includes(fullName)) score += 35;
  
    const rawParts = rawName.split(' ').filter(Boolean);
    const fullParts = fullName.split(' ').filter(Boolean);
  
    if (rawParts.length && fullParts.length) {
      const overlapCount = rawParts.filter((part) => fullParts.includes(part)).length;
      score += overlapCount * 15;
    }
  
    return score;
  }
  
  function getLikelyMatchesForException(registry, exception, limit = 5) {
    const rawName = normalizeName(exception.rawPlayerName);
    if (!rawName) {
      return [];
    }
  
    const playerNameIndex = buildPlayerNameIndex(registry);
  
    const directCandidates = playerNameIndex[rawName] || [];
    const allPlayers = Object.values(registry.players);
  
    const scored = allPlayers
      .map((player) => ({
        playerId: player.playerId,
        fullName: player.fullName,
        dsaNumber: player.dsaNumber,
        clubName: player.clubName,
        score: scoreCandidateMatch(exception, player)
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score);
  
    const deduped = [];
    const seen = new Set();
  
    [...directCandidates.map((player) => ({
      playerId: player.playerId,
      fullName: player.fullName,
      dsaNumber: player.dsaNumber,
      clubName: player.clubName,
      score: 999
    })), ...scored].forEach((candidate) => {
      if (seen.has(candidate.playerId)) return;
      seen.add(candidate.playerId);
      deduped.push(candidate);
    });
  
    return deduped.slice(0, limit);
  }
  
  export function buildExceptionReviewQueue(registry) {
    const exceptions = Object.values(registry.importExceptions);
  
    const grouped = {};
  
    exceptions.forEach((exception) => {
      const key = [
        cleanString(exception.dsaNumber),
        normalizeName(exception.rawPlayerName),
        cleanString(exception.reason)
      ].join('::');
  
      if (!grouped[key]) {
        grouped[key] = {
          groupKey: key,
          dsaNumber: cleanString(exception.dsaNumber),
          rawPlayerName: cleanString(exception.rawPlayerName),
          reason: cleanString(exception.reason),
          count: 0,
          exceptionIds: [],
          suggestedMatches: []
        };
      }
  
      grouped[key].count += 1;
      grouped[key].exceptionIds.push(exception.exceptionId);
    });
  
    Object.values(grouped).forEach((group) => {
      const sampleException = {
        dsaNumber: group.dsaNumber,
        rawPlayerName: group.rawPlayerName,
        reason: group.reason
      };
  
      group.suggestedMatches = getLikelyMatchesForException(registry, sampleException, 5);
    });
  
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }
  
  export function autoResolveNameOnlyExceptions(registry) {
    const queue = buildExceptionReviewQueue(registry);
    const resolutions = [];
  
    queue.forEach((group) => {
      if (group.reason !== 'Missing DSA number') {
        return;
      }
  
      const bestMatch = group.suggestedMatches[0];
      if (!bestMatch || bestMatch.score < 90) {
        return;
      }
  
      group.exceptionIds.forEach((exceptionId) => {
        const exception = registry.importExceptions[exceptionId];
        if (!exception) return;
  
        exception.status = 'auto_suggested';
        exception.suggestedPlayerId = bestMatch.playerId;
      });
  
      resolutions.push({
        rawPlayerName: group.rawPlayerName,
        suggestedPlayerId: bestMatch.playerId,
        suggestedPlayerName: bestMatch.fullName,
        score: bestMatch.score,
        count: group.count
      });
    });
  
    return {
      success: true,
      resolutions
    };
  }
  
  export function resolveExceptionToPlayer(registry, exceptionId, playerId) {
    const exception = registry.importExceptions[exceptionId];
    if (!exception) {
      return {
        success: false,
        reason: 'Exception not found'
      };
    }
  
    const player = registry.players[playerId];
    if (!player) {
      return {
        success: false,
        reason: 'Player not found'
      };
    }
  
    exception.status = 'resolved';
    exception.suggestedPlayerId = playerId;
    exception.resolvedAt = new Date().toISOString();
  
    return {
      success: true,
      exception,
      player
    };
  }
  
  export function summarizeImportExceptions(registry) {
    const exceptions = Object.values(registry.importExceptions);
  
    const summary = {
      total: exceptions.length,
      missingDsa: 0,
      dsaNotFound: 0,
      other: 0
    };
  
    exceptions.forEach((exception) => {
      if (exception.reason === 'Missing DSA number') {
        summary.missingDsa += 1;
      } else if (exception.reason === 'DSA number not found in registry') {
        summary.dsaNotFound += 1;
      } else {
        summary.other += 1;
      }
    });
  
    return summary;
  }