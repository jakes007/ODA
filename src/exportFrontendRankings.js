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
  'importedRankingsData.js'
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

function toNumber(value) {
  const cleaned = String(value ?? '').replace('%', '').replace(',', '').trim();
  const numericValue = Number(cleaned);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function round(value, decimals = 2) {
  return Number(toNumber(value).toFixed(decimals));
}

function getRawFields(registry, row) {
  const raw = registry.historicalStatsRaw?.[row.rawStatId];
  return raw?.rawFields || {};
}

function readRaw(rawFields, keys) {
  const rawKeys = Object.keys(rawFields || {});

  for (const wantedKey of keys) {
    const matchingKey = rawKeys.find(
      (rawKey) =>
        rawKey.trim().toLowerCase() === wantedKey.trim().toLowerCase()
    );

    if (matchingKey) {
      const value = rawFields[matchingKey];

      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }

  return '';
}

function buildPlayerRankingRows(registry, division) {
  const rows = Object.values(registry.historicalStatsNormalized).filter(
    (row) => row.season === '2026' && row.division === division
  );

  const players = {};

  rows.forEach((row) => {
    if (!row.playerId) return;

    const player = registry.players[row.playerId];
    const rawFields = getRawFields(registry, row);
    const key = row.playerId;

    if (!players[key]) {
      players[key] = {
        playerId: row.playerId,
        playerName:
  player?.fullName ||
  (player?.firstNames && player?.surname
    ? `${player.firstNames} ${player.surname}`
    : row.displayName || 'Unknown Player'),
        clubName: row.clubName || player?.clubName || '',
        total: 0,
        dartsUsed: 0,
        noTons: 0,
        oneEighties: 0,
        oneSeventyOnes: 0,
        highestClose: 0,
        singlesPlayed: 0,
        singlesWon: 0,
        playerOfMatch: 0
      };
    }

    const playerRow = players[key];

    playerRow.total += toNumber(readRaw(rawFields, ['Total']));
    playerRow.dartsUsed += toNumber(readRaw(rawFields, ['Darts Used']));
    playerRow.noTons += toNumber(readRaw(rawFields, ['No Tons']));
    playerRow.oneEighties += toNumber(readRaw(rawFields, ["180's"]));
    playerRow.oneSeventyOnes += toNumber(readRaw(rawFields, ["171's"]));
    playerRow.highestClose = Math.max(
      playerRow.highestClose,
      toNumber(readRaw(rawFields, ['Highest Close']))
    );
    playerRow.singlesPlayed += toNumber(readRaw(rawFields, ['Singles Played']));
    playerRow.singlesWon += toNumber(readRaw(rawFields, ['Singles Won']));
    playerRow.playerOfMatch += toNumber(
      readRaw(rawFields, [
        'Player Of Match',
        'Player of Match',
        'Player Of The Match',
        'Player of the Match',
        'POTM',
        'POM'
      ])
    );
  });

  const rankingRows = Object.values(players).map((player) => {
    const chuckAverage =
      player.dartsUsed > 0 ? round((player.total / player.dartsUsed) * 3, 2) : 0;

    const winPercentage =
      player.singlesPlayed > 0
        ? round((player.singlesWon / player.singlesPlayed) * 100, 1)
        : 0;

    const rankingWeighted = round(chuckAverage * 0.7 + winPercentage * 0.3, 3);

    return {
      ...player,
      chuckAverage,
      winPercentage,
      rankingWeighted
    };
  });

  const maxSinglesPlayed = Math.max(
    0,
    ...rankingRows.map((row) => row.singlesPlayed)
  );

  const minimumQualifyingGames = maxSinglesPlayed * 0.5;

  const qualified = rankingRows
    .filter((row) => row.singlesPlayed >= minimumQualifyingGames)
    .sort((a, b) => b.rankingWeighted - a.rankingWeighted)
    .map((row, index) => ({
      position: index + 1,
      ...row
    }));

  const alsoPlayed = rankingRows
    .filter((row) => row.singlesPlayed < minimumQualifyingGames)
    .sort((a, b) => b.rankingWeighted - a.rankingWeighted)
    .map((row, index) => ({
      position: index + 1,
      ...row
    }));

  return {
    qualified,
    alsoPlayed,
    minimumQualifyingGames
  };
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

  const upper = buildPlayerRankingRows(registry, 'Upper');
  const lower = buildPlayerRankingRows(registry, 'Lower');

  const fileContent = `export const importedRankingsData = {
  season: '2026',
  competitionName: 'Placements',
  divisions: {
    Upper: ${JSON.stringify(upper, null, 4)},
    Lower: ${JSON.stringify(lower, null, 4)}
  }
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND RANKINGS EXPORTED =====');
  console.log(`Upper qualified: ${upper.qualified.length}`);
  console.log(`Upper also played: ${upper.alsoPlayed.length}`);
  console.log(`Lower qualified: ${lower.qualified.length}`);
  console.log(`Lower also played: ${lower.alsoPlayed.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();