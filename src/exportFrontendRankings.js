import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { createEmptyRegistry } from './playerRegistry.js';
import { importRegistryRows } from './importer.js';

const registryWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'WC-CTN-O(1).xlsx'
);

const upperRankingsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'App Upper Rankings.xlsx'
);

const lowerRankingsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'App Lower Rankings.xlsx'
);

const outputPath = path.resolve(
  process.cwd(),
  'frontend',
  'src',
  'data',
  'importedRankingsData.js'
);

const PLAYER_NAME_OVERRIDES = new Map([
  ['jpsmith', 'jeanpierresmith']
]);

const MANUAL_PLAYER_OVERRIDES = new Map([
  [
    'nkannemeyer',
    {
      playerId: 'manual_DSA-210521',
      dsaNumber: '210521',
      fullName: 'Neil Kannemeyer',
      clubName: 'Cathkin'
    }
  ],
  [
    'madams',
    {
      playerId: 'manual_DSA-180519',
      dsaNumber: '180519',
      fullName: 'Melvyn Adams',
      clubName: 'Cathkin'
    }
  ]
]);

function readWorkbookSheetRows(workbookPath, sheetName = null) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const finalSheetName = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[finalSheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${finalSheetName}" not found in ${workbookPath}`);
  }

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

function toNumber(value) {
  const cleaned = String(value ?? '')
    .replace('%', '')
    .replace(',', '')
    .trim();

  const numericValue = parseFloat(cleaned);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizePercent(value) {
  const number = toNumber(value);

  if (number > 0 && number <= 1) {
    return Number((number * 100).toFixed(1));
  }

  return number;
}

function normalizeDsa(value) {
  return String(value || '')
    .replace(/^DSA-?/i, '')
    .replace(/\s+/g, '')
    .trim();
}

function normalizeName(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  return PLAYER_NAME_OVERRIDES.get(normalized) || normalized;
}

function readField(row, possibleKeys) {
  const rowKeys = Object.keys(row || {});

  for (const wantedKey of possibleKeys) {
    const wanted = normalizeName(wantedKey);

    const matchingKey = rowKeys.find((rowKey) => {
      const actual = normalizeName(rowKey);
      return actual === wanted;
    });

    if (matchingKey) {
      const value = row[matchingKey];

      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
  }

  return '';
}

function getRegistryDisplayName(player) {
  if (!player) return '';

  if (player.fullName) {
    return String(player.fullName).trim();
  }

  if (player.firstNames && player.surname) {
    return `${player.firstNames} ${player.surname}`.trim();
  }

  if (player.callingName && player.surname) {
    return `${player.callingName} ${player.surname}`.trim();
  }

  return '';
}

function getInitialSurnameKey(name) {
  const clean = String(name || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return '';

  const parts = clean.split(' ');
  if (parts.length < 2) return normalizeName(clean);

  const first = parts[0];
  const surname = parts[parts.length - 1];

  return normalizeName(`${first.charAt(0)} ${surname}`);
}

function buildRegistryLookups(registry) {
  const byFullName = new Map();
  const byInitialSurname = new Map();

  Object.values(registry.players).forEach((player) => {
    const displayName = getRegistryDisplayName(player);
    const fullNameKey = normalizeName(displayName);

    if (fullNameKey) {
      byFullName.set(fullNameKey, player);
    }

    const initialSurnameKey = getInitialSurnameKey(displayName);

    if (initialSurnameKey) {
      if (!byInitialSurname.has(initialSurnameKey)) {
        byInitialSurname.set(initialSurnameKey, []);
      }

      byInitialSurname.get(initialSurnameKey).push(player);
    }
  });

  return {
    byFullName,
    byInitialSurname
  };
}

function resolvePlayerFromRegistry(playerNameFromSheet, division, registryLookups) {
  const fullNameKey = normalizeName(playerNameFromSheet);

  if (MANUAL_PLAYER_OVERRIDES.has(fullNameKey)) {
    return MANUAL_PLAYER_OVERRIDES.get(fullNameKey);
  }

  // 1. Try exact/full-name match first.
  if (fullNameKey && registryLookups.byFullName.has(fullNameKey)) {
    return registryLookups.byFullName.get(fullNameKey);
  }

  // 2. Try initial + surname fallback.
  const initialSurnameKey = getInitialSurnameKey(playerNameFromSheet);
  const initialMatches = registryLookups.byInitialSurname.get(initialSurnameKey) || [];

  if (initialMatches.length === 1) {
    return initialMatches[0];
  }

  if (initialMatches.length > 1) {
    console.warn(
      `[AMBIGUOUS ${division}] "${playerNameFromSheet}" matches multiple registry players. Use full first name in Player Name column.`
    );
    return null;
  }

  console.warn(`[UNMATCHED ${division}] "${playerNameFromSheet}" not found in registry.`);
  return null;
}

function getPlayerNameFromRankingRow(row) {
  const playerName = String(
    readField(row, ['Player Name', 'Player', 'Name'])
  ).trim();

  const playerSurname = String(
    readField(row, ['Player Surname', 'Surname'])
  ).trim();

  if (playerName && playerSurname) {
    return `${playerName} ${playerSurname}`.trim();
  }

  return playerName;
}

function shouldSkipRow(row) {
  const playerName = getPlayerNameFromRankingRow(row);

  if (!playerName) return true;

  const lowerName = playerName.toLowerCase();

  if (lowerName.includes('grand total')) return true;
  if (lowerName.includes('also played')) return true;
  if (lowerName.includes('players with less')) return true;

  return false;
}

function buildRowsFromRankingFile(sheetRows, division, registryLookups) {
  const qualified = [];
  const alsoPlayed = [];
  let currentSection = 'qualified';

  sheetRows.forEach((row) => {
    const rowText = Object.values(row)
      .map((value) => String(value || '').toLowerCase())
      .join(' ');

    if (rowText.includes('also played')) {
      currentSection = 'alsoPlayed';
      return;
    }

    if (shouldSkipRow(row)) {
      return;
    }

    const playerNameFromSheet = getPlayerNameFromRankingRow(row);

    const registryPlayer = resolvePlayerFromRegistry(
      playerNameFromSheet,
      division,
      registryLookups
    );

    const finalPlayerName =
      getRegistryDisplayName(registryPlayer) || playerNameFromSheet;

    const playerRow = {
      position:
        currentSection === 'qualified'
          ? qualified.length + 1
          : alsoPlayed.length + 1,

      playerId:
        registryPlayer?.playerId ||
        `unmatched_${division}_${normalizeName(playerNameFromSheet)}`,

      dsaNumber: normalizeDsa(registryPlayer?.dsaNumber || ''),

      playerName: finalPlayerName,

      clubName:
  registryPlayer?.clubName ||
  String(readField(row, ['Club', 'Team'])).trim(),

      ageGroup: String(readField(row, ['Age Group'])).trim(),

      total: toNumber(readField(row, ['Total', 'T/S'])),

      dartsUsed: toNumber(readField(row, ['Darts Used', 'D/U'])),

      chuckAverage: toNumber(readField(row, ['Chuck Ave', 'Average', 'Ave'])),

      noTons: toNumber(readField(row, ['No Tons', 'Tons'])),

      oneEighties: toNumber(readField(row, ["180's", '180s', '180'])),

      oneSeventyOnes: toNumber(readField(row, ["171's", '171s', '171'])),

      highestClose: toNumber(
        readField(row, ['Highest Close', 'High Close', 'H/C', 'HC'])
      ),

      singlesPlayed: toNumber(
        readField(row, ['Singles Played', 'Played', 'P'])
      ),

      singlesWon: toNumber(
        readField(row, ['Singles Won', 'Won', 'W'])
      ),

      winPercentage: normalizePercent(
        readField(row, ['Win %', 'Win Percentage'])
      ),

      rankingWeighted: toNumber(
        readField(row, [
          'Ranking Weighted 70/30 Ave and Win',
          'Ranking Weighted',
          'Weighted',
          'Ranking'
        ])
      ),

      playerOfMatch: toNumber(
        readField(row, ['Player Of Match', 'Player of Match', 'POTM'])
      ),

      previousPosition: null,
      rankMovement: 0
    };

    if (currentSection === 'qualified') {
      qualified.push(playerRow);
    } else {
      alsoPlayed.push(playerRow);
    }
  });

  return {
    qualified,
    alsoPlayed,
    minimumQualifyingGames: null
  };
}

function main() {
  const registryRows = readWorkbookSheetRows(
    registryWorkbookPath,
    'Membership'
  );

  const registry = createEmptyRegistry();

  importRegistryRows(registry, registryRows, {
    source: 'registry_import'
  });

  const registryLookups = buildRegistryLookups(registry);

  const upperRows = readWorkbookSheetRows(upperRankingsWorkbookPath);
  const lowerRows = readWorkbookSheetRows(lowerRankingsWorkbookPath);

  const upper = buildRowsFromRankingFile(
    upperRows,
    'Upper',
    registryLookups
  );

  const lower = buildRowsFromRankingFile(
    lowerRows,
    'Lower',
    registryLookups
  );

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

  console.log('\n===== FRONTEND RANKINGS EXPORTED FROM APP FILES =====');
  console.log(`Upper qualified: ${upper.qualified.length}`);
  console.log(`Upper also played: ${upper.alsoPlayed.length}`);
  console.log(`Lower qualified: ${lower.qualified.length}`);
  console.log(`Lower also played: ${lower.alsoPlayed.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();