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
  
  const teamsCollection = collection(db, 'teams');
  
  export async function createTeam({
    teamName,
    clubName,
    seasonId,
    seasonName,
    competitionId,
    competitionName,
    divisionId,
    divisionName
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
      seasonName,
      competitionId,
      competitionName,
      divisionId,
      divisionName,
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: docRef.id,
      name: cleanTeamName,
      clubName: cleanClubName,
      seasonId,
      seasonName,
      competitionId,
      competitionName,
      divisionId,
      divisionName,
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
    seasonName,
    competitionId,
    competitionName,
    divisionId,
    divisionName
  }) {
    await updateDoc(doc(db, 'teams', teamId), {
      name: String(teamName || '').trim(),
      clubName: String(clubName || '').trim(),
      seasonId,
      seasonName,
      competitionId,
      competitionName,
      divisionId,
      divisionName
    });
  }
  
  export async function deleteTeam(teamId) {
    await deleteDoc(doc(db, 'teams', teamId));
  }