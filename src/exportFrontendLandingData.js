import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import { createEmptyRegistry } from './playerRegistry.js';
import { importRegistryRows, importStatsRows } from './importer.js';
import { buildCompetitionStandings } from './competitionStats.js';

const registryWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'WC-CTN-O(1).xlsx'
);

const statsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'ODA Union Stats 2026 Updated (1).xlsx'
);

const outputPath = path.resolve(
  process.cwd(),
  'frontend',
  'src',
  'data',
  'importedLandingData.js'
);

function readWorkbookSheetRows(workbookPath, sheetName) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

function clean(value) {
  return String(value || '').trim();
}

function getClubNameFromTeam(teamName) {
  const cleaned = clean(teamName);

  if (/^BOO\b/i.test(cleaned)) return 'Best Of Order';

  return cleaned.replace(/\s+\d+$/, '').trim();
}

function formatTeamDisplayName(teamName) {
  return clean(teamName).replace(/^BOO\b/i, 'Best Of Order');
}

function parseDateValue(value) {
  const text = clean(value);

  if (!text) return 0;

  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findCompetitionId(registry, name, season) {
  const competition = Object.values(registry.competitions || {}).find(
    (item) => item.name === name && item.season === season
  );

  return competition?.competitionId ?? Object.keys(registry.competitions || {})[0] ?? null;
}

function buildLatestResultsForTopTeams(registry, topTeams) {
  const teamResults = Object.values(registry.historicalTeamResultsNormalized || {}).filter(
    (row) => row.season === '2026' && row.division === 'Upper'
  );

  const latestResults = [];

  topTeams.forEach((team) => {
    const teamName = clean(team.teamName);

    const latestTeamRow = teamResults
      .filter((row) => clean(row.teamName) === teamName)
      .sort((a, b) => parseDateValue(b.matchDate) - parseDateValue(a.matchDate))[0];

    if (!latestTeamRow) return;

    const opponentName = clean(latestTeamRow.opponentTeamName);

    const opponentRow = teamResults.find(
      (row) =>
        clean(row.teamName) === opponentName &&
        clean(row.opponentTeamName) === teamName &&
        clean(row.matchDate) === clean(latestTeamRow.matchDate)
    );

    const teamScore = Number(latestTeamRow.metrics?.singlesWon || 0);
    const opponentScore = Number(opponentRow?.metrics?.singlesWon || 0);

    latestResults.push({
      id: `latest_${teamName}_${opponentName}_${clean(latestTeamRow.matchDate)}`,
      fixtureName: `${formatTeamDisplayName(teamName)} vs ${formatTeamDisplayName(opponentName)}`,
      scoreText: `${teamScore === 0 ? '0' : String(teamScore).padStart(2, '0')} - ${opponentScore === 0 ? '0' : String(opponentScore).padStart(2, '0')}`,
      complete: true,
      division: latestTeamRow.division,
      date: latestTeamRow.matchDate
    });
  });

  return latestResults.slice(0, 5);
}

function main() {
  const registryRows = readWorkbookSheetRows(
    registryWorkbookPath,
    'Membership'
  );

  const statsRows = readWorkbookSheetRows(
    statsWorkbookPath,
    'Stats Input'
  );

  const registry = createEmptyRegistry();

  importRegistryRows(registry, registryRows, {
    source: 'registry_import'
  });

  importStatsRows(registry, statsRows, {
    competitionName: 'Placements',
    competitionType: 'league',
    season: '2026',
    competitionStatus: 'active',
    associationName: 'Observatory',
    provinceName: 'Western Cape',
    sourceWorkbook: path.basename(statsWorkbookPath),
    sourceSheet: 'Stats Input',
    defaultRole: 'player'
  });

  const teamResults = Object.values(
    registry.historicalTeamResultsNormalized || {}
  ).filter((row) => row.season === '2026');

  const activeTeams = new Set();
  const activeClubs = new Set();
  const uniqueFixtures = new Set();

  teamResults.forEach((row) => {
    const teamName = clean(row.teamName);
    const opponentTeamName = clean(row.opponentTeamName);
    const division = clean(row.division);
    const matchDate = clean(row.matchDate);

    if (teamName) {
      activeTeams.add(teamName);
      activeClubs.add(getClubNameFromTeam(teamName));
    }

    if (opponentTeamName) {
      activeTeams.add(opponentTeamName);
      activeClubs.add(getClubNameFromTeam(opponentTeamName));
    }

    if (teamName && opponentTeamName) {
      const sortedTeams = [teamName, opponentTeamName].sort();
      const fixtureKey = `${matchDate}_${division}_${sortedTeams[0]}_vs_${sortedTeams[1]}`;
      uniqueFixtures.add(fixtureKey);
    }
  });

  const registryPlayerCount = registryRows.filter((row) => {
    return (
      clean(row['Membership No.']) ||
      clean(row['DSA Number']) ||
      clean(row['Surname']) ||
      clean(row['First Names (as per ID)'])
    );
  }).length;

  const competitionId = findCompetitionId(registry, 'Placements', '2026');

  const upperStandingsResult = buildCompetitionStandings(registry, competitionId, {
    season: '2026',
    division: 'Upper'
  });

  const topPremierTeams = upperStandingsResult.success
    ? upperStandingsResult.standings.slice(0, 5)
    : [];

  const latestResults = buildLatestResultsForTopTeams(registry, topPremierTeams);

  const output = {
    summary: {
      clubs: activeClubs.size,
      teams: activeTeams.size,
      players: registryPlayerCount,
      fixtures: uniqueFixtures.size
    },

    featuredCompetitions: [
      {
        name: 'Placements',
        season: '2026',
        status: 'active'
      }
    ],

    latestResults,

    generatedAt: new Date().toISOString()
  };

  const fileContent = `export const importedLandingData = ${JSON.stringify(
    output,
    null,
    2
  )};`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND LANDING DATA EXPORTED =====');
  console.log(output.summary);
  console.log(`Latest results: ${latestResults.length}`);
  console.log(`Exact unique fixtures: ${uniqueFixtures.size}`);
  console.log(`Written to: ${outputPath}`);
}

main();