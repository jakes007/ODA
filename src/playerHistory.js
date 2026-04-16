function createHistoryEntry(data) {
    return {
      historyId: `history_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      playerId: data.playerId,
      playerName: data.playerName,
      competitionId: data.competitionId,
      competitionName: data.competitionName,
      matchType: data.matchType ?? 'singles',
      fixtureId: data.fixtureId ?? null,
      fixtureName: data.fixtureName ?? null,
      summary: data.summary,
      playedAt: data.playedAt ?? new Date().toISOString()
    };
  }
  
  export function createPlayerHistoryStore() {
    return {
      entries: []
    };
  }
  
  export function recordMatchSummaryForPlayers(historyStore, context, summary) {
    if (!summary || !summary.players || !Array.isArray(summary.players)) {
      return {
        success: false,
        historyStore,
        reason: 'Invalid match summary'
      };
    }
  
    const createdEntries = summary.players.map((player) =>
      createHistoryEntry({
        playerId: context.playerIdMap?.[player.name] ?? player.name,
        playerName: player.name,
        competitionId: context.competitionId,
        competitionName: context.competitionName,
        matchType: context.matchType ?? 'singles',
        fixtureId: context.fixtureId ?? null,
        fixtureName: context.fixtureName ?? null,
        summary
      })
    );
  
    historyStore.entries.push(...createdEntries);
  
    return {
      success: true,
      historyStore,
      createdEntries
    };
  }
  
  export function getPlayerHistory(historyStore, playerId) {
    return historyStore.entries.filter((entry) => entry.playerId === playerId);
  }
  
  export function getPlayerHistoryByCompetition(historyStore, playerId, competitionId) {
    return historyStore.entries.filter(
      (entry) => entry.playerId === playerId && entry.competitionId === competitionId
    );
  }
  
  export function printPlayerHistory(title, entries) {
    console.log(`\n===== ${title} =====`);
  
    if (!entries.length) {
      console.log('No history found');
      return;
    }
  
    entries.forEach((entry, index) => {
      const playerSummary = entry.summary.players.find(
        (p) => p.name === entry.playerName
      );
  
      console.log(`${index + 1}. ${entry.playerName} | ${entry.competitionName} | ${entry.matchType}`);
      console.log(`   Played At: ${entry.playedAt}`);
      console.log(`   Fixture: ${entry.fixtureName ?? '-'}`);
      console.log(`   Result: ${playerSummary?.result ?? '-'}`);
      console.log(`   Avg: ${playerSummary?.threeDartAverage ?? 0}`);
      console.log(`   Darts: ${playerSummary?.dartsUsed ?? 0}`);
      console.log(`   High CO: ${playerSummary?.highestCheckout ?? 0}`);
    });
  }