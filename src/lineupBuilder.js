export function applyLineupToFixture(fixture, lineupConfig) {
    const {
      teamALineup = [],
      teamBLineup = []
    } = lineupConfig;
  
    const validation = validateLineups(teamALineup, teamBLineup);
  
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
  
  function validateLineups(teamALineup, teamBLineup) {
    if (hasDuplicates(teamALineup)) {
      return {
        success: false,
        reason: 'Team A lineup contains duplicate players'
      };
    }
  
    if (hasDuplicates(teamBLineup)) {
      return {
        success: false,
        reason: 'Team B lineup contains duplicate players'
      };
    }
  
    return { success: true };
  }
  
  function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
  }
  
  export function printLineup(lineupName, players) {
    console.log(`\n${lineupName}`);
    players.forEach((player, index) => {
      console.log(`  ${index + 1}. ${player}`);
    });
  }