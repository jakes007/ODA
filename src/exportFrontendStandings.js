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
  'importedStandingsData.js'
);

function readWorkbookSheetRows(workbookPath, sheetName) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${workbookPath}`);
  }

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

function findCompetitionId(registry, name, season) {
  const competition = Object.values(registry.competitions).find(
    (item) => item.name === name && item.season === season
  );

  return competition?.competitionId ?? null;
}

function simplifyStandingsRows(rows) {
  return rows.map((row) => ({
    position: row.position,
    teamName: row.teamName,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    leaguePoints: row.leaguePoints,
    legsFor: row.matchPointsFor,
    legsAgainst: row.matchPointsAgainst,
    scoreDifference: row.scoreDifference
  }));
}

function main() {
  const registryRows = readWorkbookSheetRows(registryWorkbookPath, 'Membership');
  const statsRows = readWorkbookSheetRows(statsWorkbookPath, 'Stats Input');

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

  const competitionId = findCompetitionId(registry, 'Placements', '2026');

  if (!competitionId) {
    throw new Error('Could not find 2026 Placements competition');
  }

  const upper = buildCompetitionStandings(registry, competitionId, {
    season: '2026',
    division: 'Upper'
  });

  const lower = buildCompetitionStandings(registry, competitionId, {
    season: '2026',
    division: 'Lower'
  });

  const fileContent = `export const importedStandingsData = {
  season: '2026',
  competitionName: 'Placements',
  divisions: {
    Upper: ${JSON.stringify(simplifyStandingsRows(upper.standings), null, 4)},
    Lower: ${JSON.stringify(simplifyStandingsRows(lower.standings), null, 4)}
  }
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND STANDINGS EXPORTED =====');
  console.log(`Upper teams: ${upper.standings.length}`);
  console.log(`Lower teams: ${lower.standings.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();