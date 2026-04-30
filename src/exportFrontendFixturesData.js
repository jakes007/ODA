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

function toNumber(value) {
  const numericValue = Number(String(value ?? '').replace('%', '').replace(',', '').trim());
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getRawFields(registry, row) {
  const raw = registry.historicalStatsRaw?.[row.rawStatId];
  return raw?.rawFields || {};
}

function readRaw(rawFields, keys) {
  for (const key of keys) {
    const value = rawFields?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function buildFixtures(registry, division) {
  const teamRows = Object.values(registry.historicalTeamResultsNormalized || {})
    .filter((row) => row.season === '2026' && row.division === division);

  const statRows = Object.values(registry.historicalStatsNormalized || {})
    .filter((row) => row.season === '2026' && row.division === division);

  const fixtureMap = new Map();

  teamRows.forEach((row) => {
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
        homeTeamDisplay: formatTeamName(sortedTeams[0]),
        awayTeamDisplay: formatTeamName(sortedTeams[1]),
        homeScore: 0,
        awayScore: 0,
        complete: true,
        playerRows: []
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

  fixtureMap.forEach((fixture) => {
    const fixtureTeams = [fixture.homeTeam, fixture.awayTeam];

    const rowsForFixture = statRows.filter((row) => {
      const teamName = clean(row.teamName);
      const date = clean(row.matchDate);

      return date === fixture.date && fixtureTeams.includes(teamName);
    });

    fixture.playerRows = rowsForFixture.map((row) => {
      const rawFields = getRawFields(registry, row);

      return {
        playerId: row.playerId,
        playerName: row.displayName,
        teamName: formatTeamName(row.teamName),
        opponentName: row.opponentPlayerName,
        total: toNumber(readRaw(rawFields, ['Total'])),
        dartsUsed: toNumber(row.metrics?.dartsUsed),
        average: toNumber(row.metrics?.average),
        tons: toNumber(row.metrics?.tons),
        oneEighties: toNumber(readRaw(rawFields, ["180's", '180'])),
        highestClose: toNumber(readRaw(rawFields, ['Highest Close'])),
        singlesPlayed: toNumber(row.metrics?.singlesPlayed),
        singlesWon: toNumber(row.metrics?.singlesWon)
      };
    });
  });

  return Array.from(fixtureMap.values())
    .map((fixture) => ({
      ...fixture,
      fixtureName: `${fixture.homeTeamDisplay} vs ${fixture.awayTeamDisplay}`,
      scoreText: `${formatScore(fixture.homeScore)} - ${formatScore(fixture.awayScore)}`
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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
  console.log(`Upper player rows: ${output.divisions.Upper.reduce((sum, fixture) => sum + fixture.playerRows.length, 0)}`);
  console.log(`Lower player rows: ${output.divisions.Lower.reduce((sum, fixture) => sum + fixture.playerRows.length, 0)}`);
  console.log(`Written to: ${outputPath}`);
}

main();