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

const divisionsCollection = collection(db, 'divisions');

export async function createDivision({
  divisionName,
  seasonId,
  competitionId
}) {
  const cleanDivisionName = String(divisionName || '').trim();

  if (!cleanDivisionName) {
    throw new Error('Division name is required.');
  }

  if (!seasonId) {
    throw new Error('Please select a season.');
  }

  if (!competitionId) {
    throw new Error('Please select a competition.');
  }

  const docRef = await addDoc(divisionsCollection, {
    name: cleanDivisionName,
    seasonId,
    competitionId,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    name: cleanDivisionName,
    seasonId,
    competitionId
  };
}

export async function getDivisions() {
  const divisionsQuery = query(divisionsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(divisionsQuery);

  return snapshot.docs.map((divisionDoc) => ({
    id: divisionDoc.id,
    ...divisionDoc.data()
  }));
}

export async function updateDivision({
  divisionId,
  divisionName,
  seasonId,
  competitionId
}) {
  const cleanDivisionName = String(divisionName || '').trim();

  if (!cleanDivisionName) {
    throw new Error('Division name is required.');
  }

  if (!seasonId) {
    throw new Error('Please select a season.');
  }

  if (!competitionId) {
    throw new Error('Please select a competition.');
  }

  await updateDoc(doc(db, 'divisions', divisionId), {
    name: cleanDivisionName,
    seasonId,
    competitionId
  });
}

export async function deleteDivision(divisionId) {
  await deleteDoc(doc(db, 'divisions', divisionId));
}