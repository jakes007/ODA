import path from 'path';
import XLSX from 'xlsx';

const STATS_FILE = path.resolve(
  process.cwd(),
  'import-files',
  'ODA Union Stats 2026 Updated (1).xlsx'
);

const STATS_SHEET = 'Stats Input';

function readSheet(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
  }

  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false
  });
}

function isFilled(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function countFilled(rows, key) {
  let count = 0;

  for (const row of rows) {
    if (isFilled(row[key])) {
      count++;
    }
  }

  return count;
}

function getSampleValues(rows, key, limit = 8) {
  const values = [];

  for (const row of rows) {
    const value = row[key];
    if (isFilled(value) && !values.includes(String(value).trim())) {
      values.push(String(value).trim());
    }

    if (values.length >= limit) {
      break;
    }
  }

  return values;
}

function printColumnBlock(rows, key) {
  const filled = countFilled(rows, key);
  const samples = getSampleValues(rows, key);

  console.log(`\nCOLUMN: ${key}`);
  console.log(`Filled rows: ${filled}`);
  console.log('Sample values:', samples);
}

function main() {
  console.log('\n===== STATS INPUT COLUMN DIAGNOSTICS =====\n');

  const rows = readSheet(STATS_FILE, STATS_SHEET);
  console.log(`Rows loaded: ${rows.length}`);

  if (!rows.length) {
    console.log('No rows found.');
    return;
  }

  const columns = Object.keys(rows[0]);

  console.log('\n===== ALL COLUMN HEADERS =====\n');
  console.log(columns);

  console.log('\n===== COLUMN FILL COUNTS =====\n');
  const sortedByFill = columns
    .map((key) => ({
      key,
      filled: countFilled(rows, key)
    }))
    .sort((a, b) => b.filled - a.filled);

  console.table(sortedByFill);

  console.log('\n===== IMPORTANT COLUMNS =====\n');

  const importantColumns = [
    'Date',
    'Tournament',
    'League',
    'Division',
    'Age Group',
    'DSA Number',
    'Player',
    'Team',
    'Opponent',
    'Opponent.1',
    'Ranking',
    'Average',
    'Darts Used',
    'Total Tons',
    'No Tons',
    "180's",
    "171's",
    'Highest Close',
    'Fastest Close',
    'Singles Played',
    'Singles Won',
    'Legs Won',
    'Legs Lost',
    'GP',
    'Win ',
    'Draw',
    'Lost',
    'Points'
  ];

  for (const key of importantColumns) {
    if (columns.includes(key)) {
      printColumnBlock(rows, key);
    }
  }

  console.log('\n===== SAMPLE MATCH-LIKE ROWS =====\n');

  const interestingRows = rows.filter((row) => {
    return (
      isFilled(row['Player']) &&
      String(row['Player']).trim().toLowerCase() !== 'team results'
    );
  });

  console.log(
    interestingRows.slice(0, 10).map((row) => ({
      date: row['Date'],
      tournament: row['Tournament'],
      league: row['League'],
      division: row['Division'],
      dsaNumber: row['DSA Number'],
      player: row['Player'],
      team: row['Team'],
      opponentPlayer: row['Opponent'],
      opponentTeam: row['Opponent.1'],
      ranking: row['Ranking'],
      average: row['Average'],
      dartsUsed: row['Darts Used'],
      singlesPlayed: row['Singles Played'],
      singlesWon: row['Singles Won'],
      legsWon: row['Legs Won'],
      legsLost: row['Legs Lost'],
      points: row['Points']
    }))
  );

  console.log('\n===== DONE =====\n');
}

main();