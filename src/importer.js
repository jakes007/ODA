import {
    createHistoricalStatRaw
  } from './dataModel.js';
  
  import {
    registerCanonicalPlayerFromRegistryRow,
    normalizeMatchedStatsRow
  } from './playerRegistry.js';
  
  // ============================================
  // IMPORT REGISTRY (DSA MEMBERSHIP FILE)
  // ============================================
  export function importRegistryRows(registry, rows = []) {
    let created = 0;
  
    rows.forEach((row) => {
      const result = registerCanonicalPlayerFromRegistryRow(registry, row);
  
      if (result.success) {
        created++;
      }
    });
  
    return {
      success: true,
      registry,
      createdCount: created
    };
  }
  
  // ============================================
  // IMPORT STATS INPUT (RAW + NORMALIZED)
  // ============================================
  export function importStatsRows(registry, rows = [], options = {}) {
    let rawCount = 0;
    let matchedCount = 0;
    let exceptionCount = 0;
  
    rows.forEach((row, index) => {
      // STEP 1 — create raw record
      const raw = createHistoricalStatRaw({
        sourceWorkbook: options.sourceWorkbook ?? 'Unknown Workbook',
        sourceSheet: options.sourceSheet ?? 'Stats Input',
        sourceRowNumber: index + 1,
        dsaNumber: readFirst(row, ['DSA Number', 'DSA']),
        rawPlayerName: readFirst(row, ['Player']),
        rawTeamName: readFirst(row, ['Team']),
        rawOpponentName: readFirst(row, ['Opponent']),
        rawDate: readFirst(row, ['Date']),
        rawFields: row
      });
  
      registry.historicalStatsRaw[raw.rawStatId] = raw;
      rawCount++;
  
      // STEP 2 — normalize + match
      const result = normalizeMatchedStatsRow(registry, row, {
        rawStatId: raw.rawStatId,
        competitionId: options.competitionId ?? null,
        season: options.season ?? ''
      });
  
      if (result.success) {
        matchedCount++;
      } else {
        exceptionCount++;
      }
    });
  
    return {
      success: true,
      registry,
      summary: {
        rawCount,
        matchedCount,
        exceptionCount
      }
    };
  }
  
  // ============================================
  // SIMPLE HELPER
  // ============================================
  function readFirst(row, keys) {
    for (const key of keys) {
      const val = row?.[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return '';
  }