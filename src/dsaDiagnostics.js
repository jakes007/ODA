import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';

function normalizeDsa(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  return raw
    .toUpperCase()
    .replace(/^DSA[\s\-:]*/i, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9A-Z]/g, '');
}

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

function extractDsaSet(rows) {
  const set = new Set();

  rows.forEach((row) => {
    const raw =
      row['DSA Number'] ||
      row['DSA No'] ||
      row['DSA'] ||
      row['DSA_NUMBER'] ||
      '';

    const normalized = normalizeDsa(raw);

    if (normalized) {
      set.add(normalized);
    }
  });

  return set;
}

function extractSampleMap(rows) {
  const map = new Map();

  rows.forEach((row) => {
    const rawDsa =
      row['DSA Number'] ||
      row['DSA No'] ||
      row['DSA'] ||
      '';

    const dsa = normalizeDsa(rawDsa);

    if (!dsa) return;

    const name =
      row['Player'] ||
      row['Full Name'] ||
      row['First Names'] ||
      row['Firstname'] ||
      row['Surname'] ||
      '';

    if (!map.has(dsa)) {
      map.set(dsa, name);
    }
  });

  return map;
}

function main() {
  const registryPath = path.resolve(process.cwd(), 'import-files', 'WC-CTN-O(1).xlsx');
  const statsPath = path.resolve(process.cwd(), 'import-files', 'ODA Union Stats 2026 Updated (1).xlsx');

  console.log('\n===== DSA DIAGNOSTICS =====\n');

  const registryRows = readSheet(registryPath, 'Membership');
  console.log('\n=== REGISTRY COLUMN HEADERS ===');
if (registryRows.length > 0) {
  console.log(Object.keys(registryRows[0]));
}
  const statsRows = readSheet(statsPath, 'Stats Input');

  const registrySet = extractDsaSet(registryRows);
  const statsSet = extractDsaSet(statsRows);

  const registryMap = extractSampleMap(registryRows);
  const statsMap = extractSampleMap(statsRows);

  const onlyInStats = [...statsSet].filter((dsa) => !registrySet.has(dsa));
  const onlyInRegistry = [...registrySet].filter((dsa) => !statsSet.has(dsa));
  const overlap = [...statsSet].filter((dsa) => registrySet.has(dsa));

  console.log('--- COUNTS ---');
  console.log('Registry DSA count:', registrySet.size);
  console.log('Stats DSA count:', statsSet.size);
  console.log('Overlap count:', overlap.length);
  console.log('Only in stats:', onlyInStats.length);
  console.log('Only in registry:', onlyInRegistry.length);

  console.log('\n--- SAMPLE ONLY IN STATS ---');
  onlyInStats.slice(0, 10).forEach((dsa) => {
    console.log(dsa, '→', statsMap.get(dsa));
  });

  console.log('\n--- SAMPLE ONLY IN REGISTRY ---');
  onlyInRegistry.slice(0, 10).forEach((dsa) => {
    console.log(dsa, '→', registryMap.get(dsa));
  });

  console.log('\n--- SAMPLE OVERLAP ---');
  overlap.slice(0, 10).forEach((dsa) => {
    console.log(dsa, '→', statsMap.get(dsa));
  });

  const output = {
    registryCount: registrySet.size,
    statsCount: statsSet.size,
    overlapCount: overlap.length,
    onlyInStatsCount: onlyInStats.length,
    onlyInRegistryCount: onlyInRegistry.length,
    sampleOnlyInStats: onlyInStats.slice(0, 20),
    sampleOnlyInRegistry: onlyInRegistry.slice(0, 20),
    sampleOverlap: overlap.slice(0, 20)
  };

  const outputPath = path.resolve(process.cwd(), 'import-files', 'dsa-diagnostics.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('\nSaved diagnostics to:', outputPath);
  console.log('\n===== DONE =====\n');
}

main();