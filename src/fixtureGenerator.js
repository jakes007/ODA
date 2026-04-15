function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }
  
  export function createFixtureFromTemplate(data) {
    const {
      template,
      competition,
      teamA,
      teamB,
      teamASquad = [],
      teamBSquad = [],
      fixtureName = null
    } = data;
  
    return {
      fixtureId: createId('fixture'),
      fixtureName: fixtureName ?? `${teamA.name} vs ${teamB.name}`,
      competitionId: competition.competitionId,
      competitionName: competition.name,
      templateId: template.templateId,
      templateName: template.name,
  
      teamA: {
        teamId: teamA.teamId,
        name: teamA.name,
        squad: [...teamASquad]
      },
  
      teamB: {
        teamId: teamB.teamId,
        name: teamB.name,
        squad: [...teamBSquad]
      },
  
      score: {
        teamA: 0,
        teamB: 0
      },
  
      games: template.games.map((game, index) => ({
        gameId: createId('game'),
        order: index + 1,
        label: game.label,
        type: game.type,
        startingScore: game.startingScore,
        legsMode: game.legsMode,
        totalLegs: game.totalLegs,
        status: 'pending',
  
        // original planned players
        originalTeamAPlayers: [],
        originalTeamBPlayers: [],
  
        // current active players
        activeTeamAPlayers: [],
        activeTeamBPlayers: [],
  
        // completed result
        winner: null,
        summary: null
      })),
  
      substitutions: [],
  
      complete: false,
      createdAt: new Date().toISOString()
    };
  }
  
  export function assignPlayersToFixtureGame(fixture, gameOrder, teamAPlayers, teamBPlayers) {
    const game = fixture.games.find((g) => g.order === gameOrder);
  
    if (!game) {
      return { success: false, fixture, reason: 'Game not found' };
    }
  
    if (game.status === 'completed') {
      return { success: false, fixture, reason: 'Game already completed' };
    }
  
    game.originalTeamAPlayers = [...teamAPlayers];
    game.originalTeamBPlayers = [...teamBPlayers];
    game.activeTeamAPlayers = [...teamAPlayers];
    game.activeTeamBPlayers = [...teamBPlayers];
    game.status = 'assigned';
  
    return { success: true, fixture };
  }
  
  export function substitutePlayer(fixture, teamSide, playerOut, playerIn) {
    if (!['teamA', 'teamB'].includes(teamSide)) {
      return { success: false, fixture, reason: 'Invalid team side' };
    }
  
    const squad = fixture[teamSide].squad;
  
    if (!squad.includes(playerIn)) {
      return { success: false, fixture, reason: 'Substitute player is not in squad' };
    }
  
    const affectedGames = [];
  
    fixture.games.forEach((game) => {
      if (game.status === 'completed') return;
  
      const activeKey = teamSide === 'teamA' ? 'activeTeamAPlayers' : 'activeTeamBPlayers';
  
      if (game[activeKey].includes(playerOut)) {
        game[activeKey] = game[activeKey].map((p) => (p === playerOut ? playerIn : p));
        affectedGames.push(game.order);
      }
    });
  
    fixture.substitutions.push({
      substitutionId: createId('sub'),
      teamSide,
      playerOut,
      playerIn,
      affectedGames,
      createdAt: new Date().toISOString()
    });
  
    return { success: true, fixture };
  }
  
  export function recordFixtureGameResult(fixture, gameOrder, winner, summary = null) {
    const game = fixture.games.find((g) => g.order === gameOrder);
  
    if (!game) {
      return { success: false, fixture, reason: 'Game not found' };
    }
  
    if (game.status === 'completed') {
      return { success: false, fixture, reason: 'Game already completed' };
    }
  
    if (!['teamA', 'teamB', 'draw'].includes(winner)) {
      return { success: false, fixture, reason: 'Invalid winner' };
    }
  
    game.winner = winner;
    game.summary = summary;
    game.status = 'completed';
  
    if (winner === 'teamA') fixture.score.teamA += 1;
    if (winner === 'teamB') fixture.score.teamB += 1;
  
    if (fixture.games.every((g) => g.status === 'completed')) {
      fixture.complete = true;
    }
  
    return { success: true, fixture };
  }
  
  export function printGeneratedFixture(fixture) {
    console.log('\n======================');
    console.log('GENERATED FIXTURE');
    console.log('======================');
    console.log(`Fixture: ${fixture.fixtureName}`);
    console.log(`Competition: ${fixture.competitionName}`);
    console.log(`Template: ${fixture.templateName}`);
    console.log(`Score: ${fixture.score.teamA} - ${fixture.score.teamB}`);
    console.log(`Complete: ${fixture.complete ? 'Yes' : 'No'}`);
  
    console.log(`\n${fixture.teamA.name} squad: ${fixture.teamA.squad.join(', ') || '-'}`);
    console.log(`${fixture.teamB.name} squad: ${fixture.teamB.squad.join(', ') || '-'}`);
  
    console.log('\nGames:');
    fixture.games.forEach((game) => {
      console.log(
        `  ${game.order}. ${game.label} | ${game.type} | ${game.startingScore} | ${game.status}`
      );
      console.log(`     Original A: ${game.originalTeamAPlayers.join(', ') || '-'}`);
      console.log(`     Original B: ${game.originalTeamBPlayers.join(', ') || '-'}`);
      console.log(`     Active A: ${game.activeTeamAPlayers.join(', ') || '-'}`);
      console.log(`     Active B: ${game.activeTeamBPlayers.join(', ') || '-'}`);
      console.log(`     Winner: ${game.winner ?? '-'}`);
      console.log(`     Summary Linked: ${game.summary ? 'Yes' : 'No'}`);
    });
  
    console.log('\nSubstitutions:');
    if (fixture.substitutions.length === 0) {
      console.log('  None');
    } else {
      fixture.substitutions.forEach((sub, index) => {
        console.log(
          `  ${index + 1}. ${sub.teamSide}: ${sub.playerOut} OUT, ${sub.playerIn} IN | Games affected: ${sub.affectedGames.join(', ') || '-'}`
        );
      });
    }
  
    console.log('\n======================\n');
  }
  
  export function buildGeneratedFixtureSummary(fixture) {
    return {
      fixtureId: fixture.fixtureId,
      fixtureName: fixture.fixtureName,
      competitionId: fixture.competitionId,
      competitionName: fixture.competitionName,
      templateId: fixture.templateId,
      templateName: fixture.templateName,
      teamA: fixture.teamA,
      teamB: fixture.teamB,
      score: fixture.score,
      complete: fixture.complete,
      substitutions: fixture.substitutions,
      games: fixture.games.map((game) => ({
        gameId: game.gameId,
        order: game.order,
        label: game.label,
        type: game.type,
        startingScore: game.startingScore,
        legsMode: game.legsMode,
        totalLegs: game.totalLegs,
        status: game.status,
        originalTeamAPlayers: game.originalTeamAPlayers,
        originalTeamBPlayers: game.originalTeamBPlayers,
        activeTeamAPlayers: game.activeTeamAPlayers,
        activeTeamBPlayers: game.activeTeamBPlayers,
        winner: game.winner,
        summary: game.summary
      }))
    };
  }