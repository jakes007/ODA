import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
  
  import { db } from '../firebase';
  import { getTeamById } from './adminTeamService';

import { importedRegistryData } from '../data/importedRegistryData';
  
  const fixturesCollection = collection(db, 'fixtures');
  
  export async function getCaptainFixtures(teamId) {
    if (!teamId) return [];
  
    const fixturesQuery = query(
      fixturesCollection,
      where('homeTeamId', '==', teamId)
    );
    
    const awayFixturesQuery = query(
      fixturesCollection,
      where('awayTeamId', '==', teamId)
    );
  
    const [homeSnapshot, awaySnapshot] = await Promise.all([
      getDocs(fixturesQuery),
      getDocs(awayFixturesQuery)
    ]);
  
    const fixtureMap = new Map();
  
    [...homeSnapshot.docs, ...awaySnapshot.docs].forEach((docItem) => {
      fixtureMap.set(docItem.id, {
        id: docItem.id,
        ...docItem.data()
      });
    });
  
    const fixtures = Array.from(fixtureMap.values());
  
    const enrichedFixtures = await Promise.all(
      fixtures.map(async (fixture) => {
        const homeTeam = await getTeamById(fixture.homeTeamId);
        const awayTeam = await getTeamById(fixture.awayTeamId);
  
        return {
          ...fixture,
          homeTeamName: homeTeam.name,
          awayTeamName: awayTeam.name
        };
      })
    );
  
    return enrichedFixtures.sort(
      (a, b) =>
        new Date(a.fixtureDate).getTime() -
        new Date(b.fixtureDate).getTime()
    );
  }

  function getRegistryPlayerById(playerId) {
    return importedRegistryData.players.find(
      (player) => player.playerId === playerId
    );
  }
  
  function buildSquadFromPlayerIds(playerIds = []) {
    return playerIds
      .map((playerId) => {
        const player = getRegistryPlayerById(playerId);
  
        if (!player) return null;
  
        return {
          playerId: player.playerId,
          displayName: player.fullName,
          dsaNumber: player.dsaNumber,
          clubName: player.clubName
        };
      })
      .filter(Boolean);
  }
  
  export async function getCaptainFixtureSetupData({ fixtureId, captainPlayerId }) {
    if (!fixtureId || !captainPlayerId) return null;
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return null;
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isHomeCaptain = homeTeam.captainPlayerId === captainPlayerId;
    const isAwayCaptain = awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isHomeCaptain && !isAwayCaptain) {
      return null;
    }
  
    const captainSide = isHomeCaptain ? 'home' : 'away';
  
    const myTeam = captainSide === 'home' ? homeTeam : awayTeam;
    const opponentTeam = captainSide === 'home' ? awayTeam : homeTeam;
  
    const myLoanPlayerIds =
      captainSide === 'home'
        ? fixture.homeLoanPlayerIds || []
        : fixture.awayLoanPlayerIds || [];
  
    const squadPlayers = buildSquadFromPlayerIds(myTeam.squadPlayerIds || []);
    const loanPlayers = buildSquadFromPlayerIds(myLoanPlayerIds).map((player) => ({
      ...player,
      isLoanPlayer: true
    }));
  
    const eligibleSquad = [
      ...squadPlayers,
      ...loanPlayers.filter(
        (loanPlayer) =>
          !squadPlayers.some(
            (player) => player.playerId === loanPlayer.playerId
          )
      )
    ];
  
    return {
      fixtureId: fixture.id,
      fixtureName: `${homeTeam.name} vs ${awayTeam.name}`,
      status: fixture.status || 'upcoming',
      fixtureDate: fixture.fixtureDate,
      fixtureTime: fixture.fixtureTime,
      requiredLineupSize: 4,
      lineupsRevealed: Boolean(fixture.lineupsRevealed),
      competition: {
        name: fixture.competitionName || 'Placements',
        season: fixture.seasonName || '2026'
      },
      team: {
        teamId: myTeam.id,
        teamName: myTeam.name
      },
      opponent: {
        teamId: opponentTeam.id,
        teamName: opponentTeam.name
      },
      myTeam: {
        teamName: myTeam.name,
        squad: eligibleSquad,
        currentLineup:
          captainSide === 'home'
            ? fixture.homeLineupPlayerIds || Array(4).fill('')
            : fixture.awayLineupPlayerIds || Array(4).fill(''),
      
        submitted:
          captainSide === 'home'
            ? Boolean(fixture.homeLineupSubmitted)
            : Boolean(fixture.awayLineupSubmitted),
      
        submittedAt:
          captainSide === 'home'
            ? fixture.homeLineupSubmittedAt || null
            : fixture.awayLineupSubmittedAt || null
      },
      opponentTeam: {
        teamName: opponentTeam.name,
        squad: Boolean(fixture.lineupsRevealed)
          ? buildSquadFromPlayerIds(opponentTeam.squadPlayerIds || [])
          : [],
      
        submitted:
          captainSide === 'home'
            ? Boolean(fixture.awayLineupSubmitted)
            : Boolean(fixture.homeLineupSubmitted),
      
        submittedAt:
          captainSide === 'home'
            ? fixture.awayLineupSubmittedAt || null
            : fixture.homeLineupSubmittedAt || null,
      
        submittedLineup: Boolean(fixture.lineupsRevealed)
          ? captainSide === 'home'
            ? fixture.awayLineupPlayerIds || []
            : fixture.homeLineupPlayerIds || []
          : null
      },
      notes:
        'Each captain submits their lineup privately. Loan players approved for this fixture are included in the available squad.'
    };
  }

  export async function submitCaptainFixtureLineup({
    fixtureId,
    captainPlayerId,
    lineup
  }) {
    if (!fixtureId || !captainPlayerId) {
      return {
        success: false,
        message: 'Fixture or captain details missing.'
      };
    }
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return {
        success: false,
        message: 'Fixture not found.'
      };
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isHomeCaptain = homeTeam.captainPlayerId === captainPlayerId;
    const isAwayCaptain = awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isHomeCaptain && !isAwayCaptain) {
      return {
        success: false,
        message: 'You are not assigned as captain for this fixture.'
      };
    }
  
    const captainSide = isHomeCaptain ? 'home' : 'away';
  
    const updatePayload =
      captainSide === 'home'
        ? {
            homeLineupPlayerIds: lineup,
            homeLineupSubmitted: true,
            homeLineupSubmittedAt: new Date().toISOString()
          }
        : {
            awayLineupPlayerIds: lineup,
            awayLineupSubmitted: true,
            awayLineupSubmittedAt: new Date().toISOString()
          };
  
    const nextHomeSubmitted =
      captainSide === 'home' ? true : Boolean(fixture.homeLineupSubmitted);
  
    const nextAwaySubmitted =
      captainSide === 'away' ? true : Boolean(fixture.awayLineupSubmitted);
  
    const nextStatus =
      nextHomeSubmitted && nextAwaySubmitted
        ? 'ready_to_play'
        : 'waiting_for_opponent';
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      ...updatePayload,
      status: nextStatus,
      lineupsRevealed: nextHomeSubmitted && nextAwaySubmitted
    });
  
    return {
      success: true,
      message:
        nextStatus === 'ready_to_play'
          ? 'Both lineups are submitted. Fixture is ready to play.'
          : 'Your lineup has been submitted. Waiting for the opposing captain.'
    };
  }

  export async function withdrawCaptainFixtureLineup({
    fixtureId,
    captainPlayerId
  }) {
    if (!fixtureId || !captainPlayerId) {
      return {
        success: false,
        message: 'Fixture or captain details missing.'
      };
    }
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return {
        success: false,
        message: 'Fixture not found.'
      };
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isHomeCaptain = homeTeam.captainPlayerId === captainPlayerId;
    const isAwayCaptain = awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isHomeCaptain && !isAwayCaptain) {
      return {
        success: false,
        message: 'You are not assigned as captain for this fixture.'
      };
    }
  
    const captainSide = isHomeCaptain ? 'home' : 'away';
  
    const updatePayload =
      captainSide === 'home'
        ? {
            homeLineupPlayerIds: Array(4).fill(''),
            homeLineupSubmitted: false,
            homeLineupSubmittedAt: null
          }
        : {
            awayLineupPlayerIds: Array(4).fill(''),
            awayLineupSubmitted: false,
            awayLineupSubmittedAt: null
          };
  
    const otherSideSubmitted =
      captainSide === 'home'
        ? Boolean(fixture.awayLineupSubmitted)
        : Boolean(fixture.homeLineupSubmitted);
  
    const nextStatus = otherSideSubmitted
      ? 'waiting_for_opponent'
      : 'upcoming';
  
      await updateDoc(doc(db, 'fixtures', fixtureId), {
        ...updatePayload,
        status: nextStatus,
        lineupsRevealed: nextHomeSubmitted && nextAwaySubmitted
      });
  
    return {
      success: true,
      message: 'Your lineup submission has been withdrawn.'
    };
  }

  const sixteenPointSinglesBlocks = [
    [
      [1, 2],
      [2, 1],
      [3, 4],
      [4, 3]
    ],
    [
      [2, 2],
      [1, 4],
      [4, 1],
      [3, 3]
    ],
    [
      [4, 4],
      [1, 1],
      [2, 3],
      [3, 2]
    ],
    [
      [1, 3],
      [2, 4],
      [3, 1],
      [4, 2]
    ]
  ];
  
  function getPlayerFromLineup(lineupIds = [], squad = [], slotNumber) {
    const playerId = lineupIds[slotNumber - 1];
    if (!playerId) return null;
  
    return squad.find((player) => player.playerId === playerId) || null;
  }
  
  function buildLiveMatchups({
    homeLineupIds,
    awayLineupIds,
    homeSquad,
    awaySquad
  }) {
    const games = [];
    let counter = 1;
  
    sixteenPointSinglesBlocks.forEach((block, blockIndex) => {
      block.forEach(([homeSlot, awaySlot], blockOrderIndex) => {
        const homePlayer = getPlayerFromLineup(homeLineupIds, homeSquad, homeSlot);
        const awayPlayer = getPlayerFromLineup(awayLineupIds, awaySquad, awaySlot);
  
        games.push({
          matchupId: `matchup_${counter}`,
          order: counter,
          blockNumber: blockIndex + 1,
          blockOrder: blockOrderIndex + 1,
          type: 'singles',
          format: 'singles',
          formatLabel: '501 Singles',
          startingScore: 501,
          homeSlots: [homeSlot],
          awaySlots: [awaySlot],
          homePlayers: homePlayer ? [homePlayer] : [],
          awayPlayers: awayPlayer ? [awayPlayer] : [],
          label: `${homePlayer?.displayName || 'Missing Player'} vs ${
            awayPlayer?.displayName || 'Missing Player'
          }`,
          status: 'waiting',
          boardNumber: null,
          result: null,
          liveState: null
        });
  
        counter += 1;
      });
    });
  
    return games;
  }

  export async function startCaptainFixtureLiveMatch({
    fixtureId,
    captainPlayerId
  }) {
    if (!fixtureId || !captainPlayerId) {
      return {
        success: false,
        message: 'Fixture or captain details missing.'
      };
    }
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return {
        success: false,
        message: 'Fixture not found.'
      };
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isAuthorizedCaptain =
      homeTeam.captainPlayerId === captainPlayerId ||
      awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isAuthorizedCaptain) {
      return {
        success: false,
        message: 'You are not authorized to start this fixture.'
      };
    }
  
    if (
      !fixture.homeLineupSubmitted ||
      !fixture.awayLineupSubmitted
    ) {
      return {
        success: false,
        message: 'Both lineups must be submitted before starting.'
      };
    }
  
    const homeSquad = buildSquadFromPlayerIds(homeTeam.squadPlayerIds || []);
const awaySquad = buildSquadFromPlayerIds(awayTeam.squadPlayerIds || []);

const games = buildLiveMatchups({
  homeLineupIds: fixture.homeLineupPlayerIds || [],
  awayLineupIds: fixture.awayLineupPlayerIds || [],
  homeSquad,
  awaySquad
});

const liveSession = {
  startedAt: new Date().toISOString(),
  startedBy: captainPlayerId,
  status: 'active',
  activeBoardCount: 0,
  games
};
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      status: 'active',
      liveStartedAt: serverTimestamp(),
      liveSession
    });
  
    return {
      success: true,
      message: 'Live match session started successfully.'
    };
  }

  export async function getCaptainLiveScoringData({
    fixtureId,
    captainPlayerId
  }) {
    if (!fixtureId || !captainPlayerId) {
      return null;
    }
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return null;
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isHomeCaptain =
      homeTeam.captainPlayerId === captainPlayerId;
  
    const isAwayCaptain =
      awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isHomeCaptain && !isAwayCaptain) {
      return null;
    }
  
    const captainSide = isHomeCaptain ? 'home' : 'away';
  
    const myTeam =
      captainSide === 'home' ? homeTeam : awayTeam;
  
    const opponentTeam =
      captainSide === 'home' ? awayTeam : homeTeam;
  
    const myLineupIds =
      captainSide === 'home'
        ? fixture.homeLineupPlayerIds || []
        : fixture.awayLineupPlayerIds || [];
  
    const opponentLineupIds =
      captainSide === 'home'
        ? fixture.awayLineupPlayerIds || []
        : fixture.homeLineupPlayerIds || [];
  
    const mySquad = buildSquadFromPlayerIds(
      myTeam.squadPlayerIds || []
    );
  
    const opponentSquad = buildSquadFromPlayerIds(
      opponentTeam.squadPlayerIds || []
    );
  
    return {
      fixtureId: fixture.id,
      fixtureName: `${homeTeam.name} vs ${awayTeam.name}`,
      status: fixture.status || 'active',
      lineupsRevealed: Boolean(fixture.lineupsRevealed),
  
      captainSide,
  
      competition: {
        name: fixture.competitionName || 'Placements',
        season: fixture.seasonName || '2026'
      },
  
      team: {
        teamId: myTeam.id,
        teamName: myTeam.name
      },
  
      opponent: {
        teamId: opponentTeam.id,
        teamName: opponentTeam.name
      },
  
      myTeam: {
        currentLineup: myLineupIds,
        squad: mySquad
      },
  
      opponentTeam: {
        currentLineup: opponentLineupIds,
        squad: opponentSquad
      },
  
      liveSession: fixture.liveSession || {
        games: [],
        activeBoardCount: 0
      },
  
      scoreText: fixture.scoreText || '0 - 0',
  
      format: {
        name: fixture.formatName || 'Fixture Format'
      }
    };
  }

  export async function startCaptainFixtureMatchup({
    fixtureId,
    captainPlayerId,
    matchupId
  }) {
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return {
        success: false,
        message: 'Fixture not found.'
      };
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can start matchups.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
  
    const nextGames = games.map((game) => {
      if (game.matchupId !== matchupId) return game;
  
      return {
        ...game,
        status: 'in_progress',
        boardNumber: getNextBoardNumber(games),
        liveState: {
          startingScore: game.startingScore || 501,
          homeScoreLeft: game.startingScore || 501,
          awayScoreLeft: game.startingScore || 501,
          startingSide: 'home',
          currentTurnSide: 'home',
          turns: [],
          winnerSide: null
        }
      };
    });
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames,
      'liveSession.activeBoardCount': nextGames.filter(
        (game) => game.status === 'in_progress'
      ).length
    });
  
    return {
      success: true,
      message: 'Matchup started.'
    };
  }
  
  function getNextBoardNumber(games = []) {
    const activeBoards = games
      .filter((game) => game.status === 'in_progress' && game.boardNumber)
      .map((game) => game.boardNumber);
  
    let board = 1;
  
    while (activeBoards.includes(board)) {
      board += 1;
    }
  
    return board;
  }

  export async function getCaptainMatchupScoringData({
    fixtureId,
    matchupId,
    captainPlayerId
  }) {
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return null;
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const isCaptain =
      homeTeam.captainPlayerId === captainPlayerId ||
      awayTeam.captainPlayerId === captainPlayerId;
  
    if (!isCaptain) {
      return null;
    }
  
    const matchup =
      fixture.liveSession?.games?.find(
        (game) => game.matchupId === matchupId
      ) || null;
  
    if (!matchup) {
      return null;
    }
  
    return {
      fixture: {
        fixtureId: fixture.id,
        fixtureName: `${homeTeam.name} vs ${awayTeam.name}`,
        status: fixture.status
      },
      matchup
    };
  }

  function getNextTurnSide(currentSide) {
    return currentSide === 'home' ? 'away' : 'home';
  }
  
  export async function submitCaptainMatchupTurn({
    fixtureId,
    captainPlayerId,
    matchupId,
    score
  }) {
    const numericScore = Number(score);
  
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 180) {
      return {
        success: false,
        message: 'Turn score must be between 0 and 180.'
      };
    }
  
    const fixtureSnapshot = await getDoc(doc(db, 'fixtures', fixtureId));
  
    if (!fixtureSnapshot.exists()) {
      return {
        success: false,
        message: 'Fixture not found.'
      };
    }
  
    const fixture = {
      id: fixtureSnapshot.id,
      ...fixtureSnapshot.data()
    };
  
    const games = fixture.liveSession?.games || [];
    const matchup = games.find((game) => game.matchupId === matchupId);
  
    if (!matchup || !matchup.liveState) {
      return {
        success: false,
        message: 'Active matchup not found.'
      };
    }
  
    const currentSide = matchup.liveState.currentTurnSide || 'home';
    const scoreKey = currentSide === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';
    const currentScoreLeft = matchup.liveState[scoreKey];
    const nextScoreLeft = currentScoreLeft - numericScore;
  
    let bust = false;
    let resultingScore = currentScoreLeft;
    let winnerSide = null;
  
    if (nextScoreLeft < 0 || nextScoreLeft === 1) {
      bust = true;
    } else if (nextScoreLeft === 0) {
      resultingScore = 0;
      winnerSide = currentSide;
    } else {
      resultingScore = nextScoreLeft;
    }
  
    const nextTurn = {
      side: currentSide,
      playerIndex: matchup.liveState.currentPlayerIndex || 0,
      score: numericScore,
      bust,
      resultingScore,
      dartsUsed: 3,
      createdAt: new Date().toISOString()
    };
  
    const updatedLiveState = {
      ...matchup.liveState,
      [scoreKey]: bust ? currentScoreLeft : resultingScore,
      currentTurnSide: winnerSide
        ? currentSide
        : getNextTurnSide(currentSide),
      turns: [...(matchup.liveState.turns || []), nextTurn],
      winnerSide
    };
  
    const updatedMatchup = {
      ...matchup,
      status: winnerSide ? 'completed' : 'in_progress',
      liveState: updatedLiveState,
      result: winnerSide
        ? {
            winnerSide,
            winnerTeamName:
              winnerSide === 'home'
                ? fixture.homeTeamName || 'Home'
                : fixture.awayTeamName || 'Away'
          }
        : matchup.result || null,
      boardNumber: winnerSide ? null : matchup.boardNumber
    };
  
    const nextGames = games.map((game) =>
      game.matchupId === matchupId ? updatedMatchup : game
    );
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames,
      'liveSession.activeBoardCount': nextGames.filter(
        (game) => game.status === 'in_progress'
      ).length
    });
  
    return {
      success: true,
      message: winnerSide ? 'Matchup completed.' : 'Turn saved.'
    };
  }