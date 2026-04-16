function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}

function allPlayersInSquad(players, squad) {
  return players.every((p) => squad.includes(p));
}

function countGamesByType(fixture, type) {
  return fixture.games.filter((g) => g.type === type).length;
}

function validateLineupsAgainstFixture(fixture, teamALineup, teamBLineup) {
  if (hasDuplicates(teamALineup)) {
    return { success: false, reason: 'Team A lineup contains duplicate players' };
  }

  if (hasDuplicates(teamBLineup)) {
    return { success: false, reason: 'Team B lineup contains duplicate players' };
  }

  if (!allPlayersInSquad(teamALineup, fixture.teamA.squad)) {
    return { success: false, reason: 'Team A lineup contains player(s) not in squad' };
  }

  if (!allPlayersInSquad(teamBLineup, fixture.teamB.squad)) {
    return { success: false, reason: 'Team B lineup contains player(s) not in squad' };
  }

  const singlesCount = countGamesByType(fixture, 'singles');
  const doublesCount = countGamesByType(fixture, 'doubles');
  const teamCount = countGamesByType(fixture, 'team');

  const minSinglesPlayers = singlesCount > 0 ? singlesCount : 0;
  const minDoublesPlayers = doublesCount > 0 ? doublesCount * 2 : 0;
  const minTeamPlayers = teamCount > 0 ? 1 : 0;

  const minimumPlayersNeeded = Math.max(
    minSinglesPlayers,
    minDoublesPlayers,
    minTeamPlayers
  );

  if (teamALineup.length < minimumPlayersNeeded) {
    return {
      success: false,
      reason: `Team A lineup does not have enough players for this fixture`
    };
  }

  if (teamBLineup.length < minimumPlayersNeeded) {
    return {
      success: false,
      reason: `Team B lineup does not have enough players for this fixture`
    };
  }

  return { success: true };
}

export function applyLineupToFixture(fixture, lineupConfig) {
  const {
    teamALineup = [],
    teamBLineup = []
  } = lineupConfig;

  const validation = validateLineupsAgainstFixture(fixture, teamALineup, teamBLineup);

  if (!validation.success) {
    return {
      success: false,
      fixture,
      reason: validation.reason
    };
  }

  let teamASinglesIndex = 0;
  let teamBSinglesIndex = 0;
  let teamADoublesIndex = 0;
  let teamBDoublesIndex = 0;

  fixture.games.forEach((game) => {
    if (game.status === 'completed') return;

    if (game.type === 'singles') {
      const aPlayer = teamALineup[teamASinglesIndex];
      const bPlayer = teamBLineup[teamBSinglesIndex];

      if (!aPlayer || !bPlayer) return;

      game.originalTeamAPlayers = [aPlayer];
      game.originalTeamBPlayers = [bPlayer];
      game.activeTeamAPlayers = [aPlayer];
      game.activeTeamBPlayers = [bPlayer];
      game.status = 'assigned';

      teamASinglesIndex += 1;
      teamBSinglesIndex += 1;
    }

    if (game.type === 'doubles') {
      const aPair = teamALineup.slice(teamADoublesIndex, teamADoublesIndex + 2);
      const bPair = teamBLineup.slice(teamBDoublesIndex, teamBDoublesIndex + 2);

      if (aPair.length < 2 || bPair.length < 2) return;

      game.originalTeamAPlayers = [...aPair];
      game.originalTeamBPlayers = [...bPair];
      game.activeTeamAPlayers = [...aPair];
      game.activeTeamBPlayers = [...bPair];
      game.status = 'assigned';

      teamADoublesIndex += 2;
      teamBDoublesIndex += 2;
    }

    if (game.type === 'team') {
      game.originalTeamAPlayers = [...teamALineup];
      game.originalTeamBPlayers = [...teamBLineup];
      game.activeTeamAPlayers = [...teamALineup];
      game.activeTeamBPlayers = [...teamBLineup];
      game.status = 'assigned';
    }
  });

  return {
    success: true,
    fixture
  };
}

export function printLineup(lineupName, players) {
  console.log(`\n${lineupName}`);
  players.forEach((player, index) => {
    console.log(`  ${index + 1}. ${player}`);
  });
}