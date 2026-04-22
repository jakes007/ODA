import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import {
  runImportSmokeTest,
  printImportSmokeTestResult
} from './importTestHarness.js';

const CONFIG = {
  registryWorkbookPath: path.resolve(process.cwd(), 'import-files', 'WC-CTN-O(1).xlsx'),
  statsWorkbookPath: path.resolve(process.cwd(), 'import-files', 'ODA Union Stats 2026 Updated (1).xlsx'),

  registrySheetName: 'Membership',
  statsSheetName: 'Stats Input',

  competitionName: 'ODA League',
  competitionType: 'league',
  season: '2026',
  competitionStatus: 'active',
  associationName: 'Observatory',
  provinceName: 'Western Cape',

  outputSummaryPath: path.resolve(process.cwd(), 'import-files', 'import-summary.json')
};

function readWorkbookSheetRows(workbookPath, sheetName) {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath, {
    cellDates: false
  });

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    const availableSheets = workbook.SheetNames.join(', ');
    throw new Error(
      `Sheet "${sheetName}" not found in ${path.basename(workbookPath)}. Available sheets: ${availableSheets}`
    );
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });

  return rows.filter((row) => !isCompletelyEmptyRow(row));
}

function isCompletelyEmptyRow(row) {
  return Object.values(row).every((value) => {
    if (value === null || value === undefined) {
      return true;
    }

    return String(value).trim() === '';
  });
}

function ensureImportFolderExists(filePath) {
  const folder = path.dirname(filePath);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

function main() {
  console.log('\n===== EXCEL IMPORT TEST STARTED =====');

  console.log(`\nReading registry workbook:
${CONFIG.registryWorkbookPath}
Sheet: ${CONFIG.registrySheetName}`);

  const registryRows = readWorkbookSheetRows(
    CONFIG.registryWorkbookPath,
    CONFIG.registrySheetName
  );

  console.log(`Registry rows loaded: ${registryRows.length}`);

  console.log(`\nReading stats workbook:
${CONFIG.statsWorkbookPath}
Sheet: ${CONFIG.statsSheetName}`);

  const statsRows = readWorkbookSheetRows(
    CONFIG.statsWorkbookPath,
    CONFIG.statsSheetName
  );

  console.log(`Stats rows loaded: ${statsRows.length}`);

  const result = runImportSmokeTest({
    registryRows,
    statsRows,
    competitionName: CONFIG.competitionName,
    competitionType: CONFIG.competitionType,
    season: CONFIG.season,
    competitionStatus: CONFIG.competitionStatus,
    associationName: CONFIG.associationName,
    provinceName: CONFIG.provinceName,
    sourceWorkbook: path.basename(CONFIG.statsWorkbookPath),
    sourceSheet: CONFIG.statsSheetName
  });

  printImportSmokeTestResult(result);

  ensureImportFolderExists(CONFIG.outputSummaryPath);
  fs.writeFileSync(
    CONFIG.outputSummaryPath,
    JSON.stringify(result.summary, null, 2),
    'utf8'
  );

  console.log(`\nSummary written to:
${CONFIG.outputSummaryPath}`);

  console.log('\n===== EXCEL IMPORT TEST COMPLETED =====');
}

main();