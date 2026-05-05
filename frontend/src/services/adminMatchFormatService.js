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
  
  const matchFormatsCollection = collection(db, 'matchFormats');
  
  export async function createMatchFormat({ name, pointsSystem, games }) {
    const cleanName = String(name || '').trim();
  
    if (!cleanName) throw new Error('Format name is required.');
    if (!pointsSystem) throw new Error('Points system is required.');
    if (!games.length) throw new Error('Add at least one game.');
  
    const docRef = await addDoc(matchFormatsCollection, {
      name: cleanName,
      pointsSystem: String(pointsSystem).trim(),
      games,
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: docRef.id,
      name: cleanName,
      pointsSystem,
      games,
      status: 'active'
    };
  }
  
  export async function getMatchFormats() {
    const formatsQuery = query(matchFormatsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(formatsQuery);
  
    return snapshot.docs.map((formatDoc) => ({
      id: formatDoc.id,
      ...formatDoc.data()
    }));
  }
  
  export async function updateMatchFormat({ formatId, name, pointsSystem, games }) {
    const cleanName = String(name || '').trim();
  
    if (!cleanName) throw new Error('Format name is required.');
    if (!pointsSystem) throw new Error('Points system is required.');
    if (!games.length) throw new Error('Add at least one game.');
  
    await updateDoc(doc(db, 'matchFormats', formatId), {
      name: cleanName,
      pointsSystem: String(pointsSystem).trim(),
      games
    });
  }
  
  export async function deleteMatchFormat(formatId) {
    await deleteDoc(doc(db, 'matchFormats', formatId));
  }