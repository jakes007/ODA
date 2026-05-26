import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const upperStandingsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'Upper Placement Logs.xlsx'
);

const lowerStandingsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'Lower Placement Logs.xlsx'
);

const outputPath = path.resolve(
  process.cwd(),
  'frontend',
  'src',
  'data',
  'importedStandingsData.js'
);

function clean(value) {
  return String(value ?? '').trim();
}

function toNumber(value) {
  const cleaned = clean(value).replace('%', '').replace(',', '');
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function normalizePercent(value) {
  const number = toNumber(value);

  if (number > 0 && number <= 1) {
    return Number((number * 100).toFixed(1));
  }

  return number;
}

function readWorkbookFirstSheetRows(workbookPath) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`No sheet found in ${workbookPath}`);
  }

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

function readField(row, possibleKeys) {
  const rowKeys = Object.keys(row || {});

  for (const wantedKey of possibleKeys) {
    const matchingKey = rowKeys.find(
      (key) => clean(key).toLowerCase() === clean(wantedKey).toLowerCase()
    );

    if (matchingKey) {
      return row[matchingKey];
    }
  }

  return '';
}

function buildStandingsRows(rows) {
  return rows
    .filter((row) => clean(readField(row, ['Team'])))
    .map((row, index) => ({
      position: toNumber(readField(row, ['POS'])) || index + 1,
      teamName: clean(readField(row, ['Team'])),
      division: clean(readField(row, ['Division'])),
      played: toNumber(readField(row, ['GP'])),
      won: toNumber(readField(row, ['Win'])),
      drawn: toNumber(readField(row, ['Draw'])),
      lost: toNumber(readField(row, ['Lost'])),
      leaguePoints: toNumber(readField(row, ['Pts'])),
      legsFor: toNumber(readField(row, ['Legs for'])),
      legsAgainst: toNumber(readField(row, ['Legs Against'])),
      scoreDifference: toNumber(readField(row, ['LEG AGG.'])),
      winPercentage: normalizePercent(readField(row, ['Win %'])),
      total: toNumber(readField(row, ['Total'])),
      dartsUsed: toNumber(readField(row, ['Darts Used'])),
      chuckAverage: toNumber(readField(row, ['Chuck Ave'])),
      noTons: toNumber(readField(row, ['No Tons'])),
      oneEighties: toNumber(readField(row, ["180's"])),
      oneSeventyOnes: toNumber(readField(row, ["171's"])),
      legsPlayed: toNumber(readField(row, ['Legs Played']))
    }))
    .sort((a, b) => {
      if (b.leaguePoints !== a.leaguePoints) {
        return b.leaguePoints - a.leaguePoints;
      }

      if (b.scoreDifference !== a.scoreDifference) {
        return b.scoreDifference - a.scoreDifference;
      }

      return b.legsFor - a.legsFor;
    })
    .map((row, index) => ({
      ...row,
      position: index + 1
    }));
}

function main() {
  const upperRows = readWorkbookFirstSheetRows(upperStandingsWorkbookPath);
  const lowerRows = readWorkbookFirstSheetRows(lowerStandingsWorkbookPath);

  const upperStandings = buildStandingsRows(upperRows);
  const lowerStandings = buildStandingsRows(lowerRows);

  const fileContent = `export const importedStandingsData = {
  season: '2026',
  competitionName: 'Placements',
  divisions: {
    Upper: ${JSON.stringify(upperStandings, null, 4)},
    Lower: ${JSON.stringify(lowerStandings, null, 4)}
  },
  generatedAt: '${new Date().toISOString()}'
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND STANDINGS EXPORTED FROM PLACEMENT LOGS =====');
  console.log(`Upper teams: ${upperStandings.length}`);
  console.log(`Lower teams: ${lowerStandings.length}`);
  console.log(`Written to: ${outputPath}`);
}

main();