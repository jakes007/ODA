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
import { importedFixturesData } from '../data/importedFixturesData';
  
  const fixturesCollection = collection(db, 'fixtures');

  function normalizeTeamName(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function findImportedFixtureMatch(fixture, homeTeamName, awayTeamName) {
    const allImportedFixtures = [
      ...(importedFixturesData?.divisions?.Upper || []),
      ...(importedFixturesData?.divisions?.Lower || [])
    ];
  
    return allImportedFixtures.find((importedFixture) => {
      const importedHome =
        importedFixture.homeTeamDisplay ||
        importedFixture.homeTeamName ||
        importedFixture.homeTeam;
  
      const importedAway =
        importedFixture.awayTeamDisplay ||
        importedFixture.awayTeamName ||
        importedFixture.awayTeam;
  
      const sameTeams =
        normalizeTeamName(importedHome) === normalizeTeamName(homeTeamName) &&
        normalizeTeamName(importedAway) === normalizeTeamName(awayTeamName);
  
      return sameTeams;
    });
  }
  
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
  
        const importedFixture = findImportedFixtureMatch(
          fixture,
          homeTeam.name,
          awayTeam.name
        );
        
        return {
          ...fixture,
          homeTeamName: homeTeam.name,
          awayTeamName: awayTeam.name,
        
          scoreText:
  fixture.scoreText ||
  importedFixture?.scoreText ||
  `${importedFixture?.homeScore ?? fixture.score?.home ?? 0} - ${importedFixture?.awayScore ?? fixture.score?.away ?? 0}`,
        
          importedScoreText: importedFixture?.scoreText || null,
          importedHomeScore: importedFixture?.homeScore ?? null,
          importedAwayScore: importedFixture?.awayScore ?? null
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
        squad: fixture.lineupsRevealed
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
      
        submittedLineup: fixture.lineupsRevealed
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
        lineupsRevealed: false
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
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
        status: fixture.status
      },
      matchup
    };
  }

  function getNextTurnSide(currentSide) {
    return currentSide === 'home' ? 'away' : 'home';
  }

  const SINGLE_DART_DOUBLES = new Set([
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
    22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50
  ]);
  
  function canFinishInOneDart(scoreLeft) {
    return SINGLE_DART_DOUBLES.has(scoreLeft);
  }
  
  function canFinishInTwoDarts(scoreLeft) {
    for (let firstDart = 0; firstDart <= 60; firstDart += 1) {
      const remaining = scoreLeft - firstDart;
  
      if (remaining > 0 && canFinishInOneDart(remaining)) {
        return true;
      }
    }
  
    return false;
  }
  
  function getPossibleFinishDarts(scoreLeft) {
    const options = [];
  
    if (canFinishInOneDart(scoreLeft)) {
      options.push(1);
    }
  
    if (canFinishInTwoDarts(scoreLeft)) {
      options.push(2);
    }
  
    options.push(3);
  
    return options;
  }
  
  export async function submitCaptainMatchupTurn({
    fixtureId,
    captainPlayerId,
    matchupId,
    score,
    dartsUsed
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

    const homeTeam = await getTeamById(fixture.homeTeamId);
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can submit turns.'
      };
    }
  
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
      if (!dartsUsed) {
        return {
          success: true,
          requiresFinishDarts: true,
          possibleDartsUsed: getPossibleFinishDarts(currentScoreLeft),
          message: 'Select darts used to finish the leg.'
        };
      }
    
      resultingScore = 0;
      winnerSide = currentSide;
    } else {
      resultingScore = nextScoreLeft;
    }
  
    const existingTurns = matchup.liveState.turns || [];

const nextTurn = {
  side: currentSide,
  playerIndex: matchup.liveState.currentPlayerIndex || 0,
  score: numericScore,
  bust,
  resultingScore,
  dartsUsed: Number(dartsUsed || 3),
  createdAt: new Date().toISOString()
};

const nextTurns = [
  ...existingTurns,
  nextTurn
];

const homeTurns = nextTurns.filter(
  (turn) => turn.side === 'home'
);

const awayTurns = nextTurns.filter(
  (turn) => turn.side === 'away'
);

const homeTotalScored = homeTurns.reduce(
  (total, turn) => total + Number(turn.score || 0),
  0
);

const awayTotalScored = awayTurns.reduce(
  (total, turn) => total + Number(turn.score || 0),
  0
);

const homeDartsUsed = homeTurns.reduce(
  (total, turn) => total + Number(turn.dartsUsed || 3),
  0
);

const awayDartsUsed = awayTurns.reduce(
  (total, turn) => total + Number(turn.dartsUsed || 3),
  0
);

const homeAverage =
  homeDartsUsed > 0
    ? ((homeTotalScored / homeDartsUsed) * 3).toFixed(2)
    : '0.00';

const awayAverage =
  awayDartsUsed > 0
    ? ((awayTotalScored / awayDartsUsed) * 3).toFixed(2)
    : '0.00';

const home180s = homeTurns.filter(
  (turn) => Number(turn.score) === 180
).length;

const away180s = awayTurns.filter(
  (turn) => Number(turn.score) === 180
).length;

const homeTons = homeTurns.filter(
  (turn) => Number(turn.score) >= 100
).length;

const awayTons = awayTurns.filter(
  (turn) => Number(turn.score) >= 100
).length;

const updatedLiveState = {
  ...matchup.liveState,

  [scoreKey]: bust
    ? currentScoreLeft
    : resultingScore,

  currentTurnSide: winnerSide
    ? currentSide
    : getNextTurnSide(currentSide),

  turns: nextTurns,

  winnerSide,

  homeStats: {
    average: homeAverage,
    oneEighties: home180s,
    tons: homeTons,
    dartsUsed: homeDartsUsed
  },

  awayStats: {
    average: awayAverage,
    oneEighties: away180s,
    tons: awayTons,
    dartsUsed: awayDartsUsed
  }
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

  boardNumber: winnerSide
    ? null
    : matchup.boardNumber
};
  
    const nextGames = games.map((game) =>
      game.matchupId === matchupId ? updatedMatchup : game
    );
  
    const homeWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'home'
    ).length;
    
    const awayWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'away'
    ).length;
    
    const allMatchupsCompleted = nextGames.every(
      (game) => game.status === 'completed'
    );
    
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames,
      'liveSession.activeBoardCount': nextGames.filter(
        (game) => game.status === 'in_progress'
      ).length,
      'liveSession.status': allMatchupsCompleted ? 'completed' : 'active',
      status: allMatchupsCompleted ? 'completed' : 'active',
      complete: allMatchupsCompleted,
      scoreText: `${homeWins} - ${awayWins}`
    });
  
    return {
      success: true,
      message: winnerSide ? 'Matchup completed.' : 'Turn saved.'
    };
  }

  export async function setCaptainMatchupStartingSide({
    fixtureId,
    captainPlayerId,
    matchupId,
    startingSide
  }) {
    if (!['home', 'away'].includes(startingSide)) {
      return {
        success: false,
        message: 'Starting side is invalid.'
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
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can change the starting side.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
  
    const matchup = games.find((game) => game.matchupId === matchupId);
  
    if (!matchup?.liveState) {
      return {
        success: false,
        message: 'Matchup live state not found.'
      };
    }
  
    if ((matchup.liveState.turns || []).length > 0) {
      return {
        success: false,
        message: 'Starting side can only be changed before the first turn.'
      };
    }
  
    const nextGames = games.map((game) => {
      if (game.matchupId !== matchupId) return game;
  
      return {
        ...game,
        liveState: {
          ...game.liveState,
          startingSide,
          currentTurnSide: startingSide
        }
      };
    });
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames
    });
  
    return {
      success: true,
      message: `${startingSide === 'home' ? 'Home' : 'Away'} will throw first.`
    };
  }

  function rebuildSinglesLiveStateFromTurns(turns = [], startingSide = 'home', startingScore = 501) {
    let homeScoreLeft = startingScore;
    let awayScoreLeft = startingScore;
    let currentTurnSide = startingSide;
    let winnerSide = null;
    const rebuiltTurns = [];
  
    for (const turn of turns) {
      if (winnerSide) break;
  
      const numericScore = Number(turn.score);
      const scoreKey = currentTurnSide === 'home' ? 'homeScoreLeft' : 'awayScoreLeft';
      const currentScoreLeft = currentTurnSide === 'home' ? homeScoreLeft : awayScoreLeft;
      const nextScoreLeft = currentScoreLeft - numericScore;
  
      let bust = false;
      let resultingScore = currentScoreLeft;
  
      if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 180) {
        bust = true;
      } else if (nextScoreLeft < 0 || nextScoreLeft === 1) {
        bust = true;
      } else if (nextScoreLeft === 0) {
        resultingScore = 0;
        winnerSide = currentTurnSide;
      } else {
        resultingScore = nextScoreLeft;
      }
  
      if (!bust) {
        if (scoreKey === 'homeScoreLeft') {
          homeScoreLeft = resultingScore;
        } else {
          awayScoreLeft = resultingScore;
        }
      }
  
      rebuiltTurns.push({
        ...turn,
        side: currentTurnSide,
        bust,
        resultingScore
      });
  
      if (!winnerSide) {
        currentTurnSide = getNextTurnSide(currentTurnSide);
      }
    }
  
    return {
      startingScore,
      homeScoreLeft,
      awayScoreLeft,
      startingSide,
      currentTurnSide,
      turns: rebuiltTurns,
      winnerSide
    };
  }
  
  export async function updateCaptainMatchupTurn({
    fixtureId,
    captainPlayerId,
    matchupId,
    turnIndex,
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
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can edit turns.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
    const matchup = games.find((game) => game.matchupId === matchupId);
  
    if (!matchup?.liveState) {
      return {
        success: false,
        message: 'Matchup live state not found.'
      };
    }
  
    const turns = matchup.liveState.turns || [];
  
    if (
      !Number.isInteger(turnIndex) ||
      turnIndex < 0 ||
      turnIndex >= turns.length
    ) {
      return {
        success: false,
        message: 'Turn index is invalid.'
      };
    }
  
    const updatedTurns = turns.map((turn, index) =>
      index === turnIndex
        ? {
            ...turn,
            score: numericScore
          }
        : turn
    );
  
    const rebuiltLiveState = rebuildSinglesLiveStateFromTurns(
      updatedTurns,
      matchup.liveState.startingSide || 'home',
      matchup.liveState.startingScore || matchup.startingScore || 501
    );
  
    const winnerSide = rebuiltLiveState.winnerSide;
  
    const updatedMatchup = {
      ...matchup,
      status: winnerSide ? 'completed' : 'in_progress',
      liveState: rebuiltLiveState,
      result: winnerSide
        ? {
            winnerSide,
            winnerTeamName:
              winnerSide === 'home'
                ? fixture.homeTeamName || 'Home'
                : fixture.awayTeamName || 'Away'
          }
        : null,
      boardNumber: winnerSide ? null : matchup.boardNumber || 1
    };
  
    const nextGames = games.map((game) =>
      game.matchupId === matchupId ? updatedMatchup : game
    );
  
    const homeWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'home'
    ).length;
    
    const awayWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'away'
    ).length;
    
    const allMatchupsCompleted = nextGames.every(
      (game) => game.status === 'completed'
    );
    
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames,
      'liveSession.activeBoardCount': nextGames.filter(
        (game) => game.status === 'in_progress'
      ).length,
      'liveSession.status': allMatchupsCompleted ? 'completed' : 'active',
      status: allMatchupsCompleted ? 'completed' : 'active',
      complete: allMatchupsCompleted,
      scoreText: `${homeWins} - ${awayWins}`
    });
  
    return {
      success: true,
      message: 'Turn updated successfully.'
    };
  }

  export async function applyCaptainSubstitution({
    fixtureId,
    captainPlayerId,
    outgoingPlayerId,
    incomingPlayerId
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
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const captainSide =
      homeTeam.captainPlayerId === captainPlayerId
        ? 'home'
        : awayTeam.captainPlayerId === captainPlayerId
          ? 'away'
          : null;
  
    if (!captainSide) {
      return {
        success: false,
        message: 'You are not assigned to this fixture.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
    const playerKey = captainSide === 'home' ? 'homePlayers' : 'awayPlayers';
  
    let updatedMatchupCount = 0;
  
    const incomingPlayer = getRegistryPlayerById(incomingPlayerId);
  
    if (!incomingPlayer) {
      return {
        success: false,
        message: 'Incoming player not found.'
      };
    }
  
    const incomingPlayerData = {
      playerId: incomingPlayer.playerId,
      displayName: `${incomingPlayer.fullName} (SUB)`,
      dsaNumber: incomingPlayer.dsaNumber,
      clubName: incomingPlayer.clubName,
      isSubstitute: true,
      substituteForPlayerId: outgoingPlayerId
    };
  
    const nextGames = games.map((game) => {
      if (game.status !== 'waiting') return game;
  
      const sidePlayers = game[playerKey] || [];
      const hasOutgoingPlayer = sidePlayers.some(
        (player) => player.playerId === outgoingPlayerId
      );
  
      if (!hasOutgoingPlayer) return game;
  
      updatedMatchupCount += 1;
  
      const updatedSidePlayers = sidePlayers.map((player) =>
        player.playerId === outgoingPlayerId ? incomingPlayerData : player
      );
  
      return {
        ...game,
        [playerKey]: updatedSidePlayers,
        label:
          captainSide === 'home'
            ? `${updatedSidePlayers.map((player) => player.displayName).join(' + ')} vs ${(game.awayPlayers || []).map((player) => player.displayName).join(' + ')}`
            : `${(game.homePlayers || []).map((player) => player.displayName).join(' + ')} vs ${updatedSidePlayers.map((player) => player.displayName).join(' + ')}`
      };
    });
  
    if (updatedMatchupCount === 0) {
      return {
        success: false,
        message: 'There are no future waiting matchups left for that player.'
      };
    }
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames
    });
  
    return {
      success: true,
      message: `Substitution applied to ${updatedMatchupCount} future matchup${updatedMatchupCount > 1 ? 's' : ''}.`
    };
  }

  export async function submitCaptainPostMatchWrapUp({
    fixtureId,
    captainPlayerId,
    selectedOpponentPotmPlayerId,
    notes,
    confirmScoresheet
  }) {
    if (!confirmScoresheet) {
      return {
        success: false,
        message: 'Please confirm the scoresheet before submitting.'
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
  
    if (fixture.status !== 'completed') {
      return {
        success: false,
        message: 'Post-match wrap-up is only available once the fixture is complete.'
      };
    }
  
    const homeTeam = await getTeamById(fixture.homeTeamId);
    const awayTeam = await getTeamById(fixture.awayTeamId);
  
    const captainSide =
      homeTeam.captainPlayerId === captainPlayerId
        ? 'home'
        : awayTeam.captainPlayerId === captainPlayerId
          ? 'away'
          : null;
  
    if (!captainSide) {
      return {
        success: false,
        message: 'You are not assigned to this fixture.'
      };
    }
  
    const opponentTeam = captainSide === 'home' ? awayTeam : homeTeam;
    const opponentSquad = buildSquadFromPlayerIds(opponentTeam.squadPlayerIds || []);
    const selectedPotmPlayer = opponentSquad.find(
      (player) => player.playerId === selectedOpponentPotmPlayerId
    );
  
    if (!selectedPotmPlayer) {
      return {
        success: false,
        message: 'Please choose a valid POTM from the opposing team.'
      };
    }
  
    const existingPostMatch = fixture.postMatch || {
      home: null,
      away: null
    };
  
    const nextPostMatch = {
      ...existingPostMatch,
      [captainSide]: {
        selectedOpponentPotmPlayerId: selectedPotmPlayer.playerId,
        selectedOpponentPotmPlayerName: selectedPotmPlayer.displayName,
        notes: notes?.trim() || '',
        confirmedAt: new Date().toISOString()
      }
    };
  
    const homeDone = Boolean(nextPostMatch.home?.confirmedAt);
    const awayDone = Boolean(nextPostMatch.away?.confirmedAt);
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      postMatch: nextPostMatch,
      postMatchComplete: homeDone && awayDone
    });
  
    return {
      success: true,
      message:
        homeDone && awayDone
          ? 'Both captains have completed the post-match wrap-up.'
          : 'Your post-match wrap-up has been submitted.'
    };
  }

  export async function getPublicLiveFixtureData(fixtureId) {
    if (!fixtureId) {
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
  
    return {
      fixtureId: fixture.id,
      fixtureName: `${homeTeam.name} vs ${awayTeam.name}`,
      status: fixture.status || 'active',
      lineupsRevealed: Boolean(fixture.lineupsRevealed),
  
      competition: {
        name: fixture.competitionName || 'Placements',
        season: fixture.seasonName || '2026'
      },
  
      homeTeam: {
        teamId: homeTeam.id,
        teamName: homeTeam.name
      },
  
      awayTeam: {
        teamId: awayTeam.id,
        teamName: awayTeam.name
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

  export async function getActivePublicLiveFixtures() {
    const fixturesQuery = query(
      fixturesCollection,
      where('status', '==', 'active')
    );
  
    const snapshot = await getDocs(fixturesQuery);
  
    const fixtures = await Promise.all(
      snapshot.docs.map(async (docItem) => {
        return getPublicLiveFixtureData(docItem.id);
      })
    );
  
    return fixtures.filter(Boolean);
  }

  export async function setCaptainMatchupScoringMode({
    fixtureId,
    captainPlayerId,
    matchupId,
    scoringMode
  }) {
    if (!['turn_by_turn', 'result_entry'].includes(scoringMode)) {
      return {
        success: false,
        message: 'Invalid scoring mode.'
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
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can change scoring mode.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
  
    const targetMatchup = games.find((game) => game.matchupId === matchupId);
  
    if (!targetMatchup) {
      return {
        success: false,
        message: 'Matchup not found.'
      };
    }
  
    if ((targetMatchup.liveState?.turns || []).length > 0) {
      return {
        success: false,
        message: 'Scoring mode cannot be changed after turns have been entered.'
      };
    }
  
    const nextGames = games.map((game) =>
      game.matchupId === matchupId
        ? {
            ...game,
            scoringMode
          }
        : game
    );
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames
    });
  
    return {
      success: true,
      message:
        scoringMode === 'result_entry'
          ? 'This matchup will be scored by result entry.'
          : 'This matchup will be scored turn by turn.'
    };
  }

  export async function submitCaptainMatchupResultEntry({
    fixtureId,
    captainPlayerId,
    matchupId,
    winnerSide,
    homeScoreLeft,
    awayScoreLeft,
    homeDartsUsed,
    awayDartsUsed,
    homeTons,
    awayTons,
    homeOneEighties,
    awayOneEighties,
    homeHighCheckout,
    awayHighCheckout,
    notes
  }) {
    if (!['home', 'away'].includes(winnerSide)) {
      return {
        success: false,
        message: 'Please select a valid winner.'
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
  
    if (homeTeam.captainPlayerId !== captainPlayerId) {
      return {
        success: false,
        message: 'Only the home captain can submit result entry.'
      };
    }
  
    const games = fixture.liveSession?.games || [];
    const matchup = games.find((game) => game.matchupId === matchupId);
  
    if (!matchup) {
      return {
        success: false,
        message: 'Matchup not found.'
      };
    }

    const numericHomeScoreLeft = Number(homeScoreLeft);
const numericAwayScoreLeft = Number(awayScoreLeft);

if (
  !Number.isInteger(numericHomeScoreLeft) ||
  !Number.isInteger(numericAwayScoreLeft) ||
  numericHomeScoreLeft < 0 ||
  numericHomeScoreLeft > 501 ||
  numericAwayScoreLeft < 0 ||
  numericAwayScoreLeft > 501
) {
  return {
    success: false,
    message: 'Score left must be a whole number between 0 and 501.'
  };
}

if (winnerSide === 'home' && numericHomeScoreLeft !== 0) {
  return {
    success: false,
    message: 'Home is selected as winner, so Home Score Left must be 0.'
  };
}

if (winnerSide === 'away' && numericAwayScoreLeft !== 0) {
  return {
    success: false,
    message: 'Away is selected as winner, so Away Score Left must be 0.'
  };
}

if (winnerSide === 'home' && numericAwayScoreLeft === 0) {
  return {
    success: false,
    message: 'Away cannot also have 0 remaining if Home won.'
  };
}

if (winnerSide === 'away' && numericHomeScoreLeft === 0) {
  return {
    success: false,
    message: 'Home cannot also have 0 remaining if Away won.'
  };
}
  
    const updatedMatchup = {
      ...matchup,
      scoringMode: 'result_entry',
      status: 'completed',
      boardNumber: null,
      result: {
        winnerSide,
        winnerTeamName:
          winnerSide === 'home'
            ? fixture.homeTeamName || 'Home'
            : fixture.awayTeamName || 'Away',
        resultEntry: true
      },
      liveState: {
        ...(matchup.liveState || {}),
        homeScoreLeft: numericHomeScoreLeft,
        awayScoreLeft: numericAwayScoreLeft,
        winnerSide
      },
      summaryResult: {
        homeScoreLeft: numericHomeScoreLeft,
        awayScoreLeft: numericAwayScoreLeft,
        homeDartsUsed: Number(homeDartsUsed || 0),
        awayDartsUsed: Number(awayDartsUsed || 0),
        homeTons: Number(homeTons || 0),
        awayTons: Number(awayTons || 0),
        homeOneEighties: Number(homeOneEighties || 0),
        awayOneEighties: Number(awayOneEighties || 0),
        homeHighCheckout: Number(homeHighCheckout || 0),
        awayHighCheckout: Number(awayHighCheckout || 0),
        notes: notes?.trim() || '',
        submittedAt: new Date().toISOString()
      }
    };
  
    const nextGames = games.map((game) =>
      game.matchupId === matchupId ? updatedMatchup : game
    );
  
    const homeWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'home'
    ).length;
  
    const awayWins = nextGames.filter(
      (game) => game.result?.winnerSide === 'away'
    ).length;
  
    const allMatchupsCompleted = nextGames.every(
      (game) => game.status === 'completed'
    );
  
    await updateDoc(doc(db, 'fixtures', fixtureId), {
      'liveSession.games': nextGames,
      'liveSession.activeBoardCount': nextGames.filter(
        (game) => game.status === 'in_progress'
      ).length,
      'liveSession.status': allMatchupsCompleted ? 'completed' : 'active',
      status: allMatchupsCompleted ? 'completed' : 'active',
      complete: allMatchupsCompleted,
      scoreText: `${homeWins} - ${awayWins}`
    });
  
    return {
      success: true,
      message: 'Result entry saved and matchup completed.'
    };
  }
