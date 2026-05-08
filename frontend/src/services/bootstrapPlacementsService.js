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

function normalizeTeamName(name = '') {
  return String(name)
    .replace(/^boo\b/i, 'Best Of Order')
    .replace(/\s+/g, ' ')
    .trim();
}

function getClubNameFromTeamName(teamName = '') {
  return normalizeTeamName(teamName).replace(/\s+\d+$/, '').trim();
}

async function findExisting(collectionRef, filters = []) {
  const snapshot = await getDocs(
    query(
      collectionRef,
      ...filters.map((filter) => where(filter.field, '==', filter.value))
    )
  );

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };
}

async function ensureSeason() {
  const existingSeason = await findExisting(seasonsCollection, [
    { field: 'name', value: '2026' }
  ]);

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
  const existingCompetition = await findExisting(competitionsCollection, [
    { field: 'name', value: 'Placements' },
    { field: 'seasonId', value: season.id }
  ]);

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
    name: 'Placements',
    seasonId: season.id,
    seasonName: season.name,
    status: 'active'
  };
}

async function ensureDivision({ season, competition, divisionName }) {
  const existingDivision = await findExisting(divisionsCollection, [
    { field: 'name', value: divisionName },
    { field: 'seasonId', value: season.id },
    { field: 'competitionId', value: competition.id }
  ]);

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
    name: divisionName,
    seasonId: season.id,
    seasonName: season.name,
    competitionId: competition.id,
    competitionName: competition.name,
    status: 'active'
  };
}

async function ensureTeam({ season, competition, division, teamName }) {
  const cleanTeamName = normalizeTeamName(teamName);
  const cleanClubName = getClubNameFromTeamName(cleanTeamName);

  const existingTeam = await findExisting(teamsCollection, [
    { field: 'name', value: cleanTeamName },
    { field: 'seasonId', value: season.id },
    { field: 'competitionId', value: competition.id },
    { field: 'divisionId', value: division.id }
  ]);

  if (existingTeam) {
    return existingTeam;
  }

  const teamRef = await addDoc(teamsCollection, {
    name: cleanTeamName,
    clubName: cleanClubName,
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
    name: cleanTeamName,
    clubName: cleanClubName,
    seasonId: season.id,
    seasonName: season.name,
    competitionId: competition.id,
    competitionName: competition.name,
    divisionId: division.id,
    divisionName: division.name,
    status: 'active'
  };
}

function extractDivisionTeams(divisionFixtures = []) {
  const teams = new Set();

  divisionFixtures.forEach((fixture) => {
    if (fixture.homeTeam) {
      teams.add(normalizeTeamName(fixture.homeTeam));
    }

    if (fixture.awayTeam) {
      teams.add(normalizeTeamName(fixture.awayTeam));
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

  const upperFixtures = importedFixturesData?.divisions?.Upper || [];
  const lowerFixtures = importedFixturesData?.divisions?.Lower || [];

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