import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where
  } from 'firebase/firestore';
  
  import { db } from '../firebase';
  
  import { importedFixturesData } from '../data/importedFixturesData';
  
  const seasonsCollection = collection(db, 'seasons');
  const competitionsCollection = collection(db, 'competitions');
  const divisionsCollection = collection(db, 'divisions');
  const teamsCollection = collection(db, 'teams');
  
  async function findExisting(collectionRef, field, value) {
    const snapshot = await getDocs(
      query(collectionRef, where(field, '==', value))
    );
  
    if (snapshot.empty) return null;
  
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  }
  
  async function ensureSeason() {
    const existingSeason = await findExisting(
      seasonsCollection,
      'name',
      '2026'
    );
  
    if (existingSeason) {
      return existingSeason;
    }
  
    const seasonRef = await addDoc(seasonsCollection, {
      name: '2026',
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: seasonRef.id,
      name: '2026',
      status: 'active'
    };
  }
  
  async function ensureCompetition(season) {
    const existingCompetition = await findExisting(
      competitionsCollection,
      'name',
      'Placements'
    );
  
    if (existingCompetition) {
      return existingCompetition;
    }
  
    const competitionRef = await addDoc(competitionsCollection, {
      name: 'Placements',
      seasonId: season.id,
      seasonName: season.name,
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: competitionRef.id,
      name: 'Placements'
    };
  }
  
  async function ensureDivision({
    season,
    competition,
    divisionName
  }) {
    const existingDivision = await findExisting(
      divisionsCollection,
      'name',
      divisionName
    );
  
    if (existingDivision) {
      return existingDivision;
    }
  
    const divisionRef = await addDoc(divisionsCollection, {
      name: divisionName,
      seasonId: season.id,
      seasonName: season.name,
      competitionId: competition.id,
      competitionName: competition.name,
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: divisionRef.id,
      name: divisionName
    };
  }
  
  async function ensureTeam({
    season,
    competition,
    division,
    teamName
  }) {
    const existingTeam = await findExisting(
      teamsCollection,
      'name',
      teamName
    );
  
    if (existingTeam) {
      return existingTeam;
    }
  
    const teamRef = await addDoc(teamsCollection, {
      name: teamName,
      clubName: teamName,
      seasonId: season.id,
      seasonName: season.name,
      competitionId: competition.id,
      competitionName: competition.name,
      divisionId: division.id,
      divisionName: division.name,
      status: 'active',
      createdAt: serverTimestamp()
    });
  
    return {
      id: teamRef.id,
      name: teamName
    };
  }
  
  function extractDivisionTeams(divisionFixtures = []) {
    const teams = new Set();
  
    divisionFixtures.forEach((fixture) => {
      if (fixture.homeTeam) {
        teams.add(fixture.homeTeam);
      }
  
      if (fixture.awayTeam) {
        teams.add(fixture.awayTeam);
      }
    });
  
    return [...teams];
  }
  
  export async function bootstrapPlacementsCompetition() {
    const season = await ensureSeason();
  
    const competition = await ensureCompetition(season);
  
    const upperDivision = await ensureDivision({
      season,
      competition,
      divisionName: 'Upper'
    });
  
    const lowerDivision = await ensureDivision({
      season,
      competition,
      divisionName: 'Lower'
    });
  
    const upperFixtures =
      importedFixturesData?.divisions?.Upper || [];
  
    const lowerFixtures =
      importedFixturesData?.divisions?.Lower || [];
  
    const upperTeams = extractDivisionTeams(upperFixtures);
    const lowerTeams = extractDivisionTeams(lowerFixtures);
  
    for (const teamName of upperTeams) {
      await ensureTeam({
        season,
        competition,
        division: upperDivision,
        teamName
      });
    }
  
    for (const teamName of lowerTeams) {
      await ensureTeam({
        season,
        competition,
        division: lowerDivision,
        teamName
      });
    }
  
    return {
      success: true
    };
  }