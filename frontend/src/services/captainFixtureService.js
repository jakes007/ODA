import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
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