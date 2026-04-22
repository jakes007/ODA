import {
  createHistoricalStatRaw,
  createHistoricalTeamResultRaw,
  createHistoricalTeamResultNormalized
} from './dataModel.js';
import {
  registerCanonicalPlayerFromRegistryRow,
  normalizeMatchedStatsRow,
  normalizeDsaNumber
} from './playerRegistry.js';
import {
  ensureClubExists,
  ensureCompetitionExists,
  ensureTeamExists,
  ensureCompetitionMembershipExists
} from './importSetup.js';

function readFirst(row, keys) {
  for (const key of keys) {
    const val = row?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function isTeamResultsRow(row) {
  return readFirst(row, ['Player']).toLowerCase() === 'team results';
}

function shouldSkipCompletely(row) {
  const playerName = readFirst(row, ['Player']);
  const teamName = readFirst(row, ['Team', 'TEAM']);
  const dsaNumber = normalizeDsaNumber(readFirst(row, ['DSA Number', 'DSA No', 'DSA']));

  if (!playerName && !teamName && !dsaNumber) {
    return true;
  }

  if (teamName === '0') {
    return true;
  }

  return false;
}

function buildMatchKey(date, teamA, teamB) {
  const pair = [teamA, teamB].map((v) => String(v || '').trim()).sort().join('::');
  return `${String(date || '').trim()}::${pair}`;
}

export function importRegistryRows(registry, rows = [], options = {}) {
  let createdPlayers = 0;
  let createdClubs = 0;

  rows.forEach((row) => {
    const playerResult = registerCanonicalPlayerFromRegistryRow(registry, row);

    if (playerResult.success) {
      createdPlayers++;
    }

    const clubName = readFirst(row, ['Club', 'Club Name', 'CLUB']);
    const associationName = readFirst(row, ['Association', 'Association Name', 'ASSOCIATION']);
    const provinceName = readFirst(row, ['Province', 'Province Name', 'PROVINCE']);

    if (clubName) {
      const clubResult = ensureClubExists(registry, {
        name: clubName,
        associationName,
        provinceName,
        source: options.source ?? 'registry_import',
        sourceImportedAt: new Date().toISOString()
      });

      if (clubResult.success && clubResult.created) {
        createdClubs++;
      }

      if (playerResult.success && clubResult.success) {
        const player = playerResult.player;
        player.clubId = clubResult.club.clubId;
        player.clubName = clubResult.club.name;
        player.updatedAt = new Date().toISOString();
      }
    }
  });

  return {
    success: true,
    registry,
    createdPlayers,
    createdClubs
  };
}

export function importStatsRows(registry, rows = [], options = {}) {
  let rawCount = 0;
  let matchedCount = 0;
  let exceptionCount = 0;
  let skippedCount = 0;
  let teamResultRawCount = 0;
  let teamResultMatchedCount = 0;
  let createdCompetitions = 0;
  let createdTeams = 0;
  let createdMemberships = 0;
  let createdClubs = 0;

  const teamResultLookup = {};

  rows.forEach((row, index) => {
    if (shouldSkipCompletely(row)) {
      skippedCount++;
      return;
    }

    const associationName =
      options.associationName || readFirst(row, ['Association', 'Association Name']) || '';
    const provinceName =
      options.provinceName || readFirst(row, ['Province', 'Province Name']) || '';

    const competitionResult = ensureCompetitionExists(registry, {
      name: options.competitionName ?? 'Unknown Competition',
      type: options.competitionType ?? 'league',
      season: options.season ?? '',
      status: options.competitionStatus ?? 'active',
      associationName,
      provinceName
    });

    if (competitionResult.success && competitionResult.created) {
      createdCompetitions++;
    }

    const teamName = readFirst(row, ['Team', 'TEAM']);
    const clubNameFromRow = readFirst(row, ['Club', 'Club Name']);
    let club = null;

    if (clubNameFromRow) {
      const clubResult = ensureClubExists(registry, {
        name: clubNameFromRow,
        associationName,
        provinceName,
        source: 'stats_import',
        sourceImportedAt: new Date().toISOString()
      });

      if (clubResult.success) {
        club = clubResult.club;
        if (clubResult.created) {
          createdClubs++;
        }
      }
    }

    let team = null;
    if (competitionResult.success && teamName && teamName !== '0') {
      const teamResult = ensureTeamExists(registry, {
        name: teamName,
        clubId: club?.clubId ?? '',
        clubName: club?.name ?? clubNameFromRow ?? '',
        associationName,
        competitionId: competitionResult.competition.competitionId,
        season: options.season ?? '',
        source: 'stats_import',
        sourceImportedAt: new Date().toISOString()
      });

      if (teamResult.success) {
        team = teamResult.team;
        if (teamResult.created) {
          createdTeams++;
        }
      }
    }

    if (isTeamResultsRow(row)) {
      const rawTeamResult = createHistoricalTeamResultRaw({
        sourceWorkbook: options.sourceWorkbook ?? 'Unknown Workbook',
        sourceSheet: options.sourceSheet ?? 'Stats Input',
        sourceRowNumber: index + 1,
        rawTeamName: teamName,
        rawOpponentTeamName: readFirst(row, ['Opponent_1', 'Opponent Team']),
        rawDate: readFirst(row, ['Date']),
        rawFields: row
      });

      registry.historicalTeamResultsRaw[rawTeamResult.rawTeamResultId] = rawTeamResult;
      teamResultRawCount++;

      const normalizedTeamResult = createHistoricalTeamResultNormalized({
        rawTeamResultId: rawTeamResult.rawTeamResultId,
        competitionId: competitionResult.success
          ? competitionResult.competition.competitionId
          : null,
        season: options.season ?? '',
        division: readFirst(row, ['Division']),
        teamId: team?.teamId ?? null,
        teamName: team?.name ?? teamName,
        clubId: club?.clubId ?? null,
        clubName: club?.name ?? clubNameFromRow ?? '',
        opponentTeamName: readFirst(row, ['Opponent_1', 'Opponent Team']),
        matchDate: readFirst(row, ['Date']),
        tournament: readFirst(row, ['Tournament']),
        league: readFirst(row, ['League']),
        ageGroup: readFirst(row, [' Age Group ', 'Age Group']),
        metrics: {
          dartsUsed: readFirst(row, ['Darts Used']),
          verifyDartsUsed: readFirst(row, ['Verify Darts Used']),
          theoreticalDartsUsed: readFirst(row, ['Theroretical Darts Used']),
          singlesPlayed: readFirst(row, ['Singles Played']),
          singlesWon: readFirst(row, ['Singles Won']),
          average: readFirst(row, [' Average ', 'Average']),
          tons: readFirst(row, ['No Tons']),
          oneEighties: readFirst(row, ["180's"]),
          oneSeventyOnes: readFirst(row, ["171's"]),
          totalTons: readFirst(row, ['Total Tons']),
          highestClose: readFirst(row, ['Highest Close']),
          playerOfMatch: readFirst(row, ['Player Of Match']),
          fastestClose: readFirst(row, ['Fastest Close']),
          ranking: readFirst(row, ['Ranking']),
          legsWon: readFirst(row, ['Legs Won']),
          legsLost: readFirst(row, ['Legs Lost']),
          gp: readFirst(row, ['GP']),
          wins: readFirst(row, ['Win ']),
          draws: readFirst(row, ['Draw']),
          losses: readFirst(row, ['Lost']),
          points: readFirst(row, ['Points'])
        },
        importStatus: 'matched',
        importedAt: new Date().toISOString()
      });

      const matchKey = buildMatchKey(
        normalizedTeamResult.matchDate,
        normalizedTeamResult.teamName,
        normalizedTeamResult.opponentTeamName
      );

      if (!teamResultLookup[matchKey]) {
        teamResultLookup[matchKey] = [];
      }
      teamResultLookup[matchKey].push(normalizedTeamResult);

      registry.historicalTeamResultsNormalized[normalizedTeamResult.teamResultId] =
        normalizedTeamResult;

      teamResultMatchedCount++;
      return;
    }

    const normalizedDsaNumber = normalizeDsaNumber(
      readFirst(row, ['DSA Number', 'DSA No', 'DSA', 'DSA_NUMBER'])
    );

    const raw = createHistoricalStatRaw({
      sourceWorkbook: options.sourceWorkbook ?? 'Unknown Workbook',
      sourceSheet: options.sourceSheet ?? 'Stats Input',
      sourceRowNumber: index + 1,
      dsaNumber: normalizedDsaNumber,
      rawPlayerName: readFirst(row, ['Player']),
      rawTeamName: teamName,
      rawOpponentName: readFirst(row, ['Opponent']),
      rawDate: readFirst(row, ['Date']),
      rawFields: row
    });

    registry.historicalStatsRaw[raw.rawStatId] = raw;
    rawCount++;

    const playerId = registry.playerIdsByDsaNumber[normalizedDsaNumber];
    const player = playerId ? registry.players[playerId] : null;

    if (player && competitionResult.success) {
      const membershipResult = ensureCompetitionMembershipExists(registry, {
        playerId: player.playerId,
        competitionId: competitionResult.competition.competitionId,
        teamId: team?.teamId ?? null,
        role: options.defaultRole ?? 'player',
        status: 'active'
      });

      if (membershipResult.success && membershipResult.created) {
        createdMemberships++;
      }
    }

    const rowMatchKey = buildMatchKey(
      readFirst(row, ['Date']),
      teamName,
      readFirst(row, ['Opponent_1', 'Opponent Team'])
    );

    const possibleTeamResults = teamResultLookup[rowMatchKey] ?? [];
    const matchingTeamResult = possibleTeamResults.find(
      (item) => String(item.teamName).trim() === String(teamName).trim()
    );

    const normalizedResult = normalizeMatchedStatsRow(registry, row, {
      rawStatId: raw.rawStatId,
      competitionId: competitionResult.success
        ? competitionResult.competition.competitionId
        : null,
      season: options.season ?? '',
      teamId: team?.teamId ?? null,
      teamName: team?.name ?? teamName,
      clubId: club?.clubId ?? player?.clubId ?? null,
      clubName: club?.name ?? player?.clubName ?? '',
      opponentTeamName: matchingTeamResult?.opponentTeamName ?? ''
    });

    if (normalizedResult.success) {
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
      exceptionCount,
      skippedCount,
      teamResultRawCount,
      teamResultMatchedCount,
      createdClubs,
      createdCompetitions,
      createdTeams,
      createdMemberships
    }
  };
}