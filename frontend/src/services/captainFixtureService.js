import {
    collection,
    getDocs,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  
  import { db } from '../firebase';
  import { getTeamById } from './adminTeamService';
  
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