export function createFixture(config) {
    const {
      fixtureName,
      teamAName,
      teamBName,
      pointsSystem,
      games
    } = config;
  
    return {
      fixtureName,
      teamAName,
      teamBName,
      pointsSystem,
      games: games.map((game, index) => ({
        id: index + 1,
        order: index + 1,
        type: game.type,              // singles | doubles | team
        startingScore: game.startingScore ?? 501,
        legsMode: game.legsMode ?? 'fixed',
        totalLegs: game.totalLegs ?? 1,
        label: game.label ?? `Game ${index + 1}`,
        status: 'pending'
      })),
      complete: false
    };
  }
  
  export function printFixture(fixture) {
    console.log('\n======================');
    console.log('FIXTURE');
    console.log('======================');
    console.log(`Fixture: ${fixture.fixtureName}`);
    console.log(`Teams: ${fixture.teamAName} vs ${fixture.teamBName}`);
    console.log(`Points System: ${fixture.pointsSystem}`);
    console.log(`Complete: ${fixture.complete ? 'Yes' : 'No'}`);
    console.log('\nGames:');
  
    fixture.games.forEach((game) => {
      console.log(
        `  ${game.order}. ${game.label} | ${game.type} | ${game.startingScore} | ${game.legsMode} | legs: ${game.totalLegs} | ${game.status}`
      );
    });
  
    console.log('\n======================\n');
  }
  
  export function buildFixtureSummary(fixture) {
    return {
      fixtureName: fixture.fixtureName,
      teamAName: fixture.teamAName,
      teamBName: fixture.teamBName,
      pointsSystem: fixture.pointsSystem,
      complete: fixture.complete,
      games: fixture.games.map((game) => ({
        id: game.id,
        order: game.order,
        label: game.label,
        type: game.type,
        startingScore: game.startingScore,
        legsMode: game.legsMode,
        totalLegs: game.totalLegs,
        status: game.status
      }))
    };
  }