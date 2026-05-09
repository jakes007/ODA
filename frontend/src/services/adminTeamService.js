import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const teamsCollection = collection(db, 'teams');

export async function createTeam({
  teamName,
  clubName,
  seasonId,
  competitionId,
  divisionId
}) {
  const cleanTeamName = String(teamName || '').trim();
  const cleanClubName = String(clubName || '').trim();

  if (!cleanTeamName) throw new Error('Team name is required.');
  if (!cleanClubName) throw new Error('Club name is required.');
  if (!seasonId) throw new Error('Please select a season.');
  if (!competitionId) throw new Error('Please select a competition.');
  if (!divisionId) throw new Error('Please select a division.');

  const docRef = await addDoc(teamsCollection, {
    name: cleanTeamName,
    clubName: cleanClubName,
    seasonId,
    competitionId,
    divisionId,
    status: 'active',
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    name: cleanTeamName,
    clubName: cleanClubName,
    seasonId,
    competitionId,
    divisionId,
    status: 'active'
  };
}

export async function getTeams() {
  const teamsQuery = query(teamsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(teamsQuery);

  return snapshot.docs.map((teamDoc) => ({
    id: teamDoc.id,
    ...teamDoc.data()
  }));
}

export async function updateTeam({
  teamId,
  teamName,
  clubName,
  seasonId,
  competitionId,
  divisionId
}) {
  const cleanTeamName = String(teamName || '').trim();
  const cleanClubName = String(clubName || '').trim();

  if (!cleanTeamName) throw new Error('Team name is required.');
  if (!cleanClubName) throw new Error('Club name is required.');
  if (!seasonId) throw new Error('Please select a season.');
  if (!competitionId) throw new Error('Please select a competition.');
  if (!divisionId) throw new Error('Please select a division.');

  await updateDoc(doc(db, 'teams', teamId), {
    name: cleanTeamName,
    clubName: cleanClubName,
    seasonId,
    competitionId,
    divisionId
  });
}

export async function deleteTeam(teamId) {
  await deleteDoc(doc(db, 'teams', teamId));
}

export async function getTeamById(teamId) {
  const snapshot = await getDoc(doc(db, 'teams', teamId));

  if (!snapshot.exists()) {
    throw new Error('Team not found.');
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function updateTeamSquad({ teamId, squadPlayerIds }) {
  await updateDoc(doc(db, 'teams', teamId), {
    squadPlayerIds
  });
}