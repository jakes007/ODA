import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
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
    template
  }) {
    if (!seasonId) throw new Error('Please select a season.');
    if (!competitionId) throw new Error('Please select a competition.');
    if (!divisionId) throw new Error('Please select a division.');
    if (!homeTeamId) throw new Error('Please select a home team.');
    if (!awayTeamId) throw new Error('Please select an away team.');
    if (homeTeamId === awayTeamId) throw new Error('Home and away teams cannot be the same.');
    if (!fixtureDate) throw new Error('Please select a fixture date.');
    if (!template?.templateId) throw new Error('Please select a fixture template.');
  
    const fixtureRef = await addDoc(fixturesCollection, {
      seasonId,
      competitionId,
      divisionId,
      homeTeamId,
      awayTeamId,
      fixtureDate,
      fixtureTime: fixtureTime || '19:30',
      templateId: template.templateId,
      status: 'upcoming',
      score: {
        home: 0,
        away: 0
      },
      complete: false,
      createdAt: serverTimestamp()
    });
  
    const batch = writeBatch(db);
  
    template.games.forEach((game, index) => {
      const gameRef = doc(collection(db, 'fixtureGames'));
  
      batch.set(gameRef, {
        fixtureId: fixtureRef.id,
        order: index + 1,
        label: game.label,
        type: game.type,
        startingScore: game.startingScore,
        legsMode: game.legsMode,
        totalLegs: game.totalLegs,
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
      templateId: template.templateId,
      status: 'upcoming',
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
  
  export async function deleteAdminFixture(fixtureId) {
    await deleteDoc(doc(db, 'fixtures', fixtureId));
  }