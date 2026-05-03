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
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const seasonsCollection = collection(db, 'seasons');

export async function createSeason({ seasonName }) {
  const cleanSeasonName = String(seasonName || '').trim();

  if (!cleanSeasonName) {
    throw new Error('Season name is required.');
  }

  const existingSeasons = await getSeasons();
  const duplicateSeason = existingSeasons.find(
    (season) => String(season.name).toLowerCase() === cleanSeasonName.toLowerCase()
  );

  if (duplicateSeason) {
    throw new Error('That season already exists.');
  }

  const docRef = await addDoc(seasonsCollection, {
    name: cleanSeasonName,
    status: 'inactive',
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    name: cleanSeasonName,
    status: 'inactive'
  };
}

export async function getSeasons() {
  const seasonsQuery = query(seasonsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(seasonsQuery);

  return snapshot.docs.map((seasonDoc) => ({
    id: seasonDoc.id,
    ...seasonDoc.data()
  }));
}

export async function updateSeasonName({ seasonId, seasonName }) {
  const cleanSeasonName = String(seasonName || '').trim();

  if (!cleanSeasonName) {
    throw new Error('Season name is required.');
  }

  await updateDoc(doc(db, 'seasons', seasonId), {
    name: cleanSeasonName
  });

  return {
    id: seasonId,
    name: cleanSeasonName
  };
}

export async function setActiveSeason(seasonId) {
  const snapshot = await getDocs(seasonsCollection);
  const batch = writeBatch(db);

  snapshot.docs.forEach((seasonDoc) => {
    batch.update(doc(db, 'seasons', seasonDoc.id), {
      status: seasonDoc.id === seasonId ? 'active' : 'inactive'
    });
  });

  await batch.commit();
}

export async function deleteSeason(seasonId) {
  await deleteDoc(doc(db, 'seasons', seasonId));
}