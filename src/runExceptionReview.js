import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { createEmptyRegistry } from './playerRegistry.js';
import { importRegistryRows, importStatsRows } from './importer.js';
import {
  buildExceptionReviewQueue,
  autoResolveNameOnlyExceptions,
  summarizeImportExceptions
} from './importExceptionResolver.js';

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
  outputPath: path.resolve(process.cwd(), 'import-files', 'exception-review.json')
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

function main() {
  console.log('\n===== EXCEPTION REVIEW RUNNER =====');

  const registryRows = readWorkbookSheetRows(
    CONFIG.registryWorkbookPath,
    CONFIG.registrySheetName
  );

  const statsRows = readWorkbookSheetRows(
    CONFIG.statsWorkbookPath,
    CONFIG.statsSheetName
  );

  const registry = createEmptyRegistry();

  importRegistryRows(registry, registryRows, {
    source: 'registry_import'
  });

  importStatsRows(registry, statsRows, {
    competitionName: CONFIG.competitionName,
    competitionType: CONFIG.competitionType,
    season: CONFIG.season,
    competitionStatus: CONFIG.competitionStatus,
    associationName: CONFIG.associationName,
    provinceName: CONFIG.provinceName,
    sourceWorkbook: path.basename(CONFIG.statsWorkbookPath),
    sourceSheet: CONFIG.statsSheetName,
    defaultRole: 'player'
  });

  const exceptionSummaryBefore = summarizeImportExceptions(registry);
  const reviewQueue = buildExceptionReviewQueue(registry);
  const autoResolveResult = autoResolveNameOnlyExceptions(registry);
  const exceptionSummaryAfter = summarizeImportExceptions(registry);

  const output = {
    exceptionSummaryBefore,
    exceptionSummaryAfter,
    autoResolvedCount: autoResolveResult.resolutions.length,
    autoResolvedExamples: autoResolveResult.resolutions.slice(0, 20),
    reviewQueueTop50: reviewQueue.slice(0, 50)
  };

  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log('\nException summary before:', exceptionSummaryBefore);
  console.log('Auto-resolved suggestions:', autoResolveResult.resolutions.length);
  console.log('Top grouped exceptions:', reviewQueue.length);
  console.log('\nSaved to:', CONFIG.outputPath);
  console.log('\n===== DONE =====\n');
}

main();