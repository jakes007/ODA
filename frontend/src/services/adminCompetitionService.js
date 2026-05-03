import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  const competitionsCollection = collection(db, 'competitions');
  
  export async function createCompetition({
    competitionName,
    seasonId,
    seasonName,
    status
  }) {
    const cleanCompetitionName = String(competitionName || '').trim();
  
    if (!cleanCompetitionName) {
      throw new Error('Competition name is required.');
    }
  
    if (!seasonId) {
      throw new Error('Please select a season.');
    }
  
    const docRef = await addDoc(competitionsCollection, {
      name: cleanCompetitionName,
      seasonId,
      seasonName,
      status: status || 'upcoming',
      createdAt: serverTimestamp()
    });
  
    return {
      id: docRef.id,
      name: cleanCompetitionName,
      seasonId,
      seasonName,
      status: status || 'upcoming'
    };
  }
  
  export async function getCompetitions() {
    const competitionsQuery = query(
      competitionsCollection,
      orderBy('createdAt', 'desc')
    );
  
    const snapshot = await getDocs(competitionsQuery);
  
    return snapshot.docs.map((competitionDoc) => ({
      id: competitionDoc.id,
      ...competitionDoc.data()
    }));
  }
  
  export async function updateCompetitionStatus({ competitionId, status }) {
    await updateDoc(doc(db, 'competitions', competitionId), {
      status
    });
  }
  
  export async function deleteCompetition(competitionId) {
    await deleteDoc(doc(db, 'competitions', competitionId));
  }

  export async function updateCompetitionNameAndSeason({
    competitionId,
    name,
    seasonId,
    seasonName
  }) {
    await updateDoc(doc(db, 'competitions', competitionId), {
      name,
      seasonId,
      seasonName
    });
  }