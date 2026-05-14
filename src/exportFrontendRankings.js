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

const PLAYER_NAME_CORRECTIONS = {
  'J.P Smith': 'Jean-Pierre Smith',
  'M. Alexander': 'Magmoed Alexander',
  'Elwil Van Der Westhuizen': 'Herman V/D Westhuizen',
  'Jade Talmarks': 'Jade Talmarkes',
  'EBRAHIEM ISAACS': 'Ebrahiem Isaacs',
  'EUGENE TALMARKES': 'Eugene Talmarkes'
};

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
  const cleaned = String(value ?? '')
    .replace('%', '')
    .replace(',', '')
    .trim();

  const numericValue = parseFloat(cleaned);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeDsa(value) {
  return String(value || '')
    .replace(/^DSA-?/i, '')
    .replace(/\s+/g, '')
    .trim();
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function readField(row, possibleKeys) {
  const rowKeys = Object.keys(row || {});

  for (const wantedKey of possibleKeys) {
    const wanted = normalizeName(wantedKey);

    const matchingKey = rowKeys.find((rowKey) => {
      const actual = normalizeName(rowKey);
      return actual === wanted || actual.includes(wanted) || wanted.includes(actual);
    });

    if (matchingKey) {
      const value = row[matchingKey];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return value;
      }
    }
  }

  return '';
}

function formatPlayerName(name) {
  const cleanName = String(name || '').trim();
  return PLAYER_NAME_CORRECTIONS[cleanName] || cleanName;
}

function buildRegistryLookups(registry) {
  const byDsa = new Map();
  const byName = new Map();

  Object.values(registry.players).forEach((player) => {
    const dsaNumber = normalizeDsa(player.dsaNumber);

    if (dsaNumber) {
      byDsa.set(dsaNumber, player);
    }

    const namesToCheck = [
      player.fullName,
      player.displayName,
      player.callingName && player.surname
        ? `${player.callingName} ${player.surname}`
        : '',
      player.firstNames && player.surname
        ? `${player.firstNames} ${player.surname}`
        : '',
      ...(player.aliases || [])
    ];

    namesToCheck.forEach((name) => {
      const normalized = normalizeName(name);

      if (normalized) {
        byName.set(normalized, player);
      }
    });
  });

  return {
    byDsa,
    byName
  };
}

function resolvePlayerFromOfficialRow(row, registryLookups) {
  const rawDsaNumber = normalizeDsa(
    readField(row, [
      'DSA Number',
      'DSA No',
      'DSA',
      'Player No',
      'Player Number'
    ])
  );

  if (rawDsaNumber && registryLookups.byDsa.has(rawDsaNumber)) {
    return registryLookups.byDsa.get(rawDsaNumber);
  }

  const rawPlayerName = formatPlayerName(
    readField(row, ['Player', 'Player Name', 'Name'])
  );

  const normalizedPlayerName = normalizeName(rawPlayerName);

  if (normalizedPlayerName && registryLookups.byName.has(normalizedPlayerName)) {
    return registryLookups.byName.get(normalizedPlayerName);
  }

  return null;
}

function shouldSkipRow(row) {
  const playerName = String(
    readField(row, ['Player', 'Player Name', 'Name'])
  ).trim();

  if (!playerName) return true;

  const lowerName = playerName.toLowerCase();

  if (lowerName.includes('grand total')) return true;
  if (lowerName.includes('also played')) return true;
  if (lowerName.includes('players with less')) return true;

  return false;
}

function buildRowsFromOfficialSheet(sheetRows, division, registryLookups) {
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

    const playerNameFromSheet = formatPlayerName(
      readField(row, ['Player', 'Player Name', 'Name'])
    );

    const registryPlayer = resolvePlayerFromOfficialRow(row, registryLookups);

    const officialDsaNumber = normalizeDsa(
      readField(row, [
        'DSA Number',
        'DSA No',
        'DSA',
        'Player No',
        'Player Number'
      ])
    );

    const playerName =
      registryPlayer?.fullName ||
      (registryPlayer?.firstNames && registryPlayer?.surname
        ? `${registryPlayer.firstNames} ${registryPlayer.surname}`
        : playerNameFromSheet);

    const playerRow = {
      position:
        currentSection === 'qualified'
          ? qualified.length + 1
          : alsoPlayed.length + 1,

      playerId:
        registryPlayer?.playerId ||
        `unmatched_${division}_${normalizeName(playerNameFromSheet)}`,

      dsaNumber:
        normalizeDsa(registryPlayer?.dsaNumber || officialDsaNumber || ''),

      playerName,

      clubName: String(readField(row, ['Club'])).trim(),

      ageGroup: String(readField(row, ['Age Group'])).trim(),

      total: toNumber(readField(row, ['Total', 'T/S'])),

      dartsUsed: toNumber(readField(row, ['Darts Used', 'D/U'])),

      tonAverage: toNumber(readField(row, ['Ton Ave', 'Ton Average'])),

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

      winPercentage: toNumber(
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

function applyMovement(currentRows, previousRows) {
  const previousMap = new Map();

  [...previousRows.qualified, ...previousRows.alsoPlayed].forEach((row) => {
    const key = row.dsaNumber || normalizeName(row.playerName);
    previousMap.set(key, row.position);
  });

  [...currentRows.qualified, ...currentRows.alsoPlayed].forEach((row) => {
    const key = row.dsaNumber || normalizeName(row.playerName);
    const previousPosition = previousMap.get(key);

    row.previousPosition = previousPosition ?? null;
    row.rankMovement =
      previousPosition == null ? 0 : previousPosition - row.position;
  });
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

  const upperRows = readWorkbookSheetRows(
    statsWorkbookPath,
    'Upper Ranking'
  );
  
  const lowerRows = readWorkbookSheetRows(
    statsWorkbookPath,
    'Lower Ranking'
  );

  const upper = buildRowsFromOfficialSheet(
    upperRows,
    'Upper',
    registryLookups
  );

  const lower = buildRowsFromOfficialSheet(
    lowerRows,
    'Lower',
    registryLookups
  );

  applyMovement(upper, upper);
  applyMovement(lower, lower);

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

  console.log('\n===== OFFICIAL FRONTEND RANKINGS EXPORTED =====');
  console.log(`Upper qualified: ${upper.qualified.length}`);
  console.log(`Upper also played: ${upper.alsoPlayed.length}`);
  console.log(`Lower qualified: ${lower.qualified.length}`);
  console.log(`Lower also played: ${lower.alsoPlayed.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();