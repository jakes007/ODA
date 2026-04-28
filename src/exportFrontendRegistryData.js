import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const registryWorkbookPath = path.resolve(
  process.cwd(),
  'import-files',
  'WC-CTN-O(1).xlsx'
);

const outputPath = path.resolve(
  process.cwd(),
  'frontend',
  'src',
  'data',
  'importedRegistryData.js'
);

function clean(value) {
  return String(value || '').trim();
}

function readWorkbookSheetRows(workbookPath, sheetName) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: false });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });
}

function buildPlayerId(row, index) {
  const membershipNo = clean(row['Membership No.']);
  const idNumber = clean(row['ID Number']);
  const surname = clean(row['Surname']);
  const firstNames = clean(row['First Names (as per ID)']);

  if (membershipNo) return `registry_${membershipNo}`;
  if (idNumber) return `registry_id_${idNumber}`;

  return `registry_${surname}_${firstNames}_${index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
}

function buildFullName(row) {
  const surname = clean(row['Surname']);
  const firstNames = clean(row['First Names (as per ID)']);
  const initials = clean(row['Initials']);

  const preferredFirstName = firstNames || initials;

  return `${preferredFirstName} ${surname}`.trim();
}

function main() {
  const rows = readWorkbookSheetRows(registryWorkbookPath, 'Membership');

  const players = rows
    .map((row, index) => {
      const surname = clean(row['Surname']);
      const firstNames = clean(row['First Names (as per ID)']);
      const callingName = clean(row['Calling  Name']);
      const initials = clean(row['Initials']);
      const clubName = clean(row['Club']);
      const membershipNo = clean(row['Membership No.']);
      const dsaNumber = membershipNo.replace(/^DSA-?/i, '');

      if (!surname && !firstNames && !callingName && !membershipNo) {
        return null;
      }

      return {
        playerId: buildPlayerId(row, index),
        membershipNo,
        dsaNumber,
        fullName: buildFullName(row),
        firstNames,
        callingName,
        initials,
        surname,
        clubName,
        status: clean(row['Status']) || 'Active',
        category: clean(row['Category']),
        associationName: clean(row['Association']) || 'Observatory',
        provinceName: clean(row['Province']) || 'Western Cape'
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const clubs = [...new Set(players.map((player) => player.clubName).filter(Boolean))]
    .sort()
    .map((clubName) => ({
      clubName,
      playerCount: players.filter((player) => player.clubName === clubName).length
    }));

  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      players: players.length,
      clubs: clubs.length
    },
    clubs,
    players
  };

  const fileContent = `export const importedRegistryData = ${JSON.stringify(
    output,
    null,
    2
  )};`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('\n===== FRONTEND REGISTRY DATA EXPORTED =====');
  console.log(output.summary);
  console.log(`Written to: ${outputPath}`);
}

main();