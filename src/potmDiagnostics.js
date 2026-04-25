import path from 'path';
import XLSX from 'xlsx';

const statsWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'ODA Union Stats 2026 Updated (1).xlsx'
);

function readWorkbookSheetRows(workbookPath, sheetName) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const worksheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

const rows = readWorkbookSheetRows(statsWorkbookPath, 'Stats Input');

console.log('\n===== ALL HEADERS =====');
console.log(Object.keys(rows[0]));

console.log('\n===== HEADERS CONTAINING MATCH / PLAYER / POTM =====');
console.log(
  Object.keys(rows[0]).filter((key) =>
    key.toLowerCase().includes('match') ||
    key.toLowerCase().includes('potm') ||
    key.toLowerCase().includes('player')
  )
);

console.log('\n===== SAMPLE ROWS WITH POSSIBLE POTM VALUES =====');

rows.slice(0, 40).forEach((row, index) => {
  const possible = {};

  Object.keys(row).forEach((key) => {
    if (
      key.toLowerCase().includes('match') ||
      key.toLowerCase().includes('potm') ||
      key.toLowerCase().includes('player')
    ) {
      possible[key] = row[key];
    }
  });

  console.log(`Row ${index + 2}:`, possible);
});