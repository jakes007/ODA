import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const fixturesCollection = collection(db, 'fixtures');

export async function createAdminFixture({
  seasonId,
  competitionId,
  divisionId,
  homeTeamId,
  awayTeamId,
  fixtureDate,
  fixtureTime,
  matchFormat,
status = 'upcoming'
}) {
  if (!seasonId) throw new Error('Please select a season.');
  if (!competitionId) throw new Error('Please select a competition.');
  if (!divisionId) throw new Error('Please select a division.');
  if (!homeTeamId) throw new Error('Please select a home team.');
  if (!awayTeamId) throw new Error('Please select an away team.');
  if (homeTeamId === awayTeamId) throw new Error('Home and away teams cannot be the same.');
  if (!fixtureDate) throw new Error('Please select a fixture date.');
  if (!matchFormat?.id) throw new Error('Please select a match format.');
  if (!Array.isArray(matchFormat.games) || matchFormat.games.length === 0) {
    throw new Error('Selected match format has no games.');
  }

  const fixtureRef = await addDoc(fixturesCollection, {
    seasonId,
    competitionId,
    divisionId,
    homeTeamId,
    awayTeamId,
    fixtureDate,
    fixtureTime: fixtureTime || '19:30',
    matchFormatId: matchFormat.id,
    status,
    score: { home: 0, away: 0 },
    complete: false,
    createdAt: serverTimestamp()
  });

  const batch = writeBatch(db);

  matchFormat.games.forEach((game, index) => {
    const gameRef = doc(collection(db, 'fixtureGames'));

    batch.set(gameRef, {
      fixtureId: fixtureRef.id,
      matchFormatId: matchFormat.id,
      order: index + 1,
      label: game.label || `Game ${index + 1}`,
      type: game.type,
      startingScore: Number(game.startingScore || 501),
      legsMode: game.legsMode || 'fixed',
      totalLegs: Number(game.totalLegs || 1),
      status: 'pending',
      homePlayers: [],
      awayPlayers: [],
      winner: null,
      summary: null,
      createdAt: serverTimestamp()
    });
  });

  await batch.commit();

  return {
    id: fixtureRef.id,
    seasonId,
    competitionId,
    divisionId,
    homeTeamId,
    awayTeamId,
    fixtureDate,
    fixtureTime: fixtureTime || '19:30',
    matchFormatId: matchFormat.id,
    status,
    complete: false
  };
}

export async function getAdminFixtures() {
  const fixturesQuery = query(fixturesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(fixturesQuery);

  return snapshot.docs.map((fixtureDoc) => ({
    id: fixtureDoc.id,
    ...fixtureDoc.data()
  }));
}

async function deleteFixtureGamesForFixture(fixtureId) {
  const gamesQuery = query(
    collection(db, 'fixtureGames'),
    where('fixtureId', '==', fixtureId)
  );

  const gamesSnapshot = await getDocs(gamesQuery);
  const batch = writeBatch(db);

  gamesSnapshot.docs.forEach((gameDoc) => {
    batch.delete(doc(db, 'fixtureGames', gameDoc.id));
  });

  await batch.commit();
}

async function recreateFixtureGames({ fixtureId, matchFormat }) {
  const batch = writeBatch(db);

  matchFormat.games.forEach((game, index) => {
    const gameRef = doc(collection(db, 'fixtureGames'));

    batch.set(gameRef, {
      fixtureId,
      matchFormatId: matchFormat.id,
      order: index + 1,
      label: game.label || `Game ${index + 1}`,
      type: game.type,
      startingScore: Number(game.startingScore || 501),
      legsMode: game.legsMode || 'fixed',
      totalLegs: Number(game.totalLegs || 1),
      status: 'pending',
      homePlayers: [],
      awayPlayers: [],
      winner: null,
      summary: null,
      createdAt: serverTimestamp()
    });
  });

  await batch.commit();
}

export async function updateAdminFixture({
  fixtureId,
  seasonId,
  competitionId,
  divisionId,
  homeTeamId,
  awayTeamId,
  fixtureDate,
  fixtureTime,
  currentMatchFormatId,
  matchFormat,
status = 'upcoming'
}) {
  if (!seasonId) throw new Error('Please select a season.');
  if (!competitionId) throw new Error('Please select a competition.');
  if (!divisionId) throw new Error('Please select a division.');
  if (!homeTeamId) throw new Error('Please select a home team.');
  if (!awayTeamId) throw new Error('Please select an away team.');
  if (homeTeamId === awayTeamId) throw new Error('Home and away teams cannot be the same.');
  if (!fixtureDate) throw new Error('Please select a fixture date.');
  if (!matchFormat?.id) throw new Error('Please select a match format.');

  await updateDoc(doc(db, 'fixtures', fixtureId), {
    seasonId,
    competitionId,
    divisionId,
    homeTeamId,
    awayTeamId,
    fixtureDate,
    fixtureTime: fixtureTime || '19:30',
    matchFormatId: matchFormat.id
  });

  if (currentMatchFormatId !== matchFormat.id) {
    await deleteFixtureGamesForFixture(fixtureId);
    await recreateFixtureGames({ fixtureId, matchFormat });
  }
}

export async function deleteAdminFixture(fixtureId) {
  await deleteFixtureGamesForFixture(fixtureId);
  await deleteDoc(doc(db, 'fixtures', fixtureId));
}