function findPlayerSummary(summary, playerName) {
    if (!summary || !summary.players) return null;
    return summary.players.find((p) => p.name === playerName) ?? null;
  }
  
  export function buildHeadToHead(historyStore, playerAId, playerBId) {
    const playerAEntries = historyStore.entries.filter((e) => e.playerId === playerAId);
    const playerBEntries = historyStore.entries.filter((e) => e.playerId === playerBId);
  
    const playerAKeySet = new Set(
      playerAEntries.map((e) => `${e.competitionId}|${e.fixtureId}|${e.playedAt}|${e.playerName}`)
    );
  
    const sharedMatches = playerBEntries.filter((entry) => {
      const summaryNames = entry.summary?.players?.map((p) => p.name) ?? [];
      return summaryNames.includes(entry.playerName);
    }).filter((entry) => {
      const summaryNames = entry.summary?.players?.map((p) => p.name) ?? [];
      const playerAEntry = playerAEntries.find(
        (a) =>
          a.competitionId === entry.competitionId &&
          a.fixtureId === entry.fixtureId &&
          a.playedAt === entry.playedAt &&
          summaryNames.includes(a.playerName)
      );
      return !!playerAEntry;
    });
  
    const matches = [];
  
    sharedMatches.forEach((entryB) => {
      const summaryNames = entryB.summary?.players?.map((p) => p.name) ?? [];
  
      const entryA = playerAEntries.find(
        (a) =>
          a.competitionId === entryB.competitionId &&
          a.fixtureId === entryB.fixtureId &&
          a.playedAt === entryB.playedAt &&
          summaryNames.includes(a.playerName)
      );
  
      if (!entryA) return;
  
      const playerASummary = findPlayerSummary(entryA.summary, entryA.playerName);
      const playerBSummary = findPlayerSummary(entryB.summary, entryB.playerName);
  
      if (!playerASummary || !playerBSummary) return;
  
      matches.push({
        competitionId: entryA.competitionId,
        competitionName: entryA.competitionName,
        fixtureId: entryA.fixtureId,
        fixtureName: entryA.fixtureName,
        playedAt: entryA.playedAt,
        playerA: {
          playerId: entryA.playerId,
          playerName: entryA.playerName,
          result: playerASummary.result,
          threeDartAverage: playerASummary.threeDartAverage,
          dartsUsed: playerASummary.dartsUsed,
          highestCheckout: playerASummary.highestCheckout
        },
        playerB: {
          playerId: entryB.playerId,
          playerName: entryB.playerName,
          result: playerBSummary.result,
          threeDartAverage: playerBSummary.threeDartAverage,
          dartsUsed: playerBSummary.dartsUsed,
          highestCheckout: playerBSummary.highestCheckout
        }
      });
    });
  
    matches.sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt));
  
    const summary = {
      playerAId,
      playerBId,
      playerAName: matches[0]?.playerA.playerName ?? null,
      playerBName: matches[0]?.playerB.playerName ?? null,
      matchesPlayed: matches.length,
      playerAWins: matches.filter((m) => m.playerA.result === 'win').length,
      playerBWins: matches.filter((m) => m.playerB.result === 'win').length,
      draws: matches.filter(
        (m) => m.playerA.result === 'draw' || m.playerB.result === 'draw'
      ).length,
      matches
    };
  
    return summary;
  }
  
  export function printHeadToHead(title, headToHead) {
    console.log(`\n===== ${title} =====`);
  
    if (!headToHead.matchesPlayed) {
      console.log('No head-to-head matches found');
      return;
    }
  
    console.log(
      `${headToHead.playerAName} vs ${headToHead.playerBName} | MP: ${headToHead.matchesPlayed} | ${headToHead.playerAName} Wins: ${headToHead.playerAWins} | ${headToHead.playerBName} Wins: ${headToHead.playerBWins} | Draws: ${headToHead.draws}`
    );
  
    headToHead.matches.forEach((match, index) => {
      console.log(
        `${index + 1}. ${match.competitionName} | ${match.fixtureName ?? '-'} | ${match.playedAt}`
      );
      console.log(
        `   ${match.playerA.playerName}: ${match.playerA.result} | Avg: ${match.playerA.threeDartAverage} | High CO: ${match.playerA.highestCheckout}`
      );
      console.log(
        `   ${match.playerB.playerName}: ${match.playerB.result} | Avg: ${match.playerB.threeDartAverage} | High CO: ${match.playerB.highestCheckout}`
      );
    });
  }