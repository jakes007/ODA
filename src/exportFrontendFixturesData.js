import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import { createEmptyRegistry } from './playerRegistry.js';
import { importRegistryRows, importStatsRows } from './importer.js';

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
  'importedFixturesData.js'
);

function clean(value) {
  return String(value || '').trim();
}

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

function formatTeamName(teamName) {
  return clean(teamName).replace(/^BOO\b/i, 'Best Of Order');
}

function formatScore(value) {
  const num = Number(value || 0);
  if (num === 0) return '0';
  return String(num).padStart(2, '0');
}

function buildFixtures(registry, division) {
  const rows = Object.values(registry.historicalTeamResultsNormalized || {})
    .filter((row) => row.season === '2026' && row.division === division);

  const fixtureMap = new Map();

  rows.forEach((row) => {
    const teamName = clean(row.teamName);
    const opponentName = clean(row.opponentTeamName);
    const date = clean(row.matchDate);

    if (!teamName || !opponentName) return;

    const sortedTeams = [teamName, opponentName].sort();
    const key = `${division}_${date}_${sortedTeams[0]}_${sortedTeams[1]}`;

    if (!fixtureMap.has(key)) {
      fixtureMap.set(key, {
        id: key.replace(/[^a-z0-9]+/gi, '_').toLowerCase(),
        date,
        division,
        homeTeam: sortedTeams[0],
        awayTeam: sortedTeams[1],
        homeScore: 0,
        awayScore: 0,
        complete: true
      });
    }

    const fixture = fixtureMap.get(key);
    const score = Number(row.metrics?.singlesWon || 0);

    if (teamName === fixture.homeTeam) {
      fixture.homeScore = score;
    }

    if (teamName === fixture.awayTeam) {
      fixture.awayScore = score;
    }
  });

  return Array.from(fixtureMap.values()).map((fixture) => ({
    ...fixture,
    fixtureName: `${formatTeamName(fixture.homeTeam)} vs ${formatTeamName(fixture.awayTeam)}`,
    scoreText: `${formatScore(fixture.homeScore)} - ${formatScore(fixture.awayScore)}`
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

  const output = {
    season: '2026',
    competitionName: 'Placements',
    divisions: {
      Upper: buildFixtures(registry, 'Upper'),
      Lower: buildFixtures(registry, 'Lower')
    },
    generatedAt: new Date().toISOString()
  };

  const fileContent = `export const importedFixturesData = ${JSON.stringify(
    output,
    null,
    2
  )};`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND FIXTURES DATA EXPORTED =====');
  console.log(`Upper fixtures: ${output.divisions.Upper.length}`);
  console.log(`Lower fixtures: ${output.divisions.Lower.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();