import { createHistoricalStatRaw } from './dataModel.js';
import {
  registerCanonicalPlayerFromRegistryRow,
  normalizeMatchedStatsRow
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

// ============================================
// IMPORT REGISTRY (DSA MEMBERSHIP FILE)
// Creates official player records and clubs
// ============================================

export function importRegistryRows(registry, rows = [], options = {}) {
  let createdPlayers = 0;
  let createdClubs = 0;

  rows.forEach((row) => {
    const playerResult = registerCanonicalPlayerFromRegistryRow(registry, row);

    if (playerResult.success) {
      createdPlayers++;
    }

    const clubName = readFirst(row, ['Club', 'Club Name', 'CLUB']);
    const associationName = readFirst(row, [
      'Association',
      'Association Name',
      'ASSOCIATION'
    ]);
    const provinceName = readFirst(row, [
      'Province',
      'Province Name',
      'PROVINCE'
    ]);

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

// ============================================
// IMPORT STATS INPUT
// Creates raw rows, ensures club/competition/team/membership,
// then creates normalized historical stat rows
// ============================================

export function importStatsRows(registry, rows = [], options = {}) {
  let rawCount = 0;
  let matchedCount = 0;
  let exceptionCount = 0;
  let createdCompetitions = 0;
  let createdTeams = 0;
  let createdMemberships = 0;
  let createdClubs = 0;

  rows.forEach((row, index) => {
    const raw = createHistoricalStatRaw({
      sourceWorkbook: options.sourceWorkbook ?? 'Unknown Workbook',
      sourceSheet: options.sourceSheet ?? 'Stats Input',
      sourceRowNumber: index + 1,
      dsaNumber: readFirst(row, ['DSA Number', 'DSA No', 'DSA']),
      rawPlayerName: readFirst(row, ['Player']),
      rawTeamName: readFirst(row, ['Team']),
      rawOpponentName: readFirst(row, ['Opponent', 'Opponent Team']),
      rawDate: readFirst(row, ['Date']),
      rawFields: row
    });

    registry.historicalStatsRaw[raw.rawStatId] = raw;
    rawCount++;

    const dsaNumber = readFirst(row, ['DSA Number', 'DSA No', 'DSA']);
    const playerId = registry.playerIdsByDsaNumber[dsaNumber];
    const player = playerId ? registry.players[playerId] : null;

    const associationName =
      options.associationName ??
      player?.associationName ??
      readFirst(row, ['Association', 'Association Name']) ??
      '';

    const provinceName =
      options.provinceName ??
      player?.provinceName ??
      readFirst(row, ['Province', 'Province Name']) ??
      '';

    const clubName =
      options.clubNameField
        ? readFirst(row, [options.clubNameField])
        : player?.clubName || readFirst(row, ['Club', 'Club Name']);

    let club = null;
    if (clubName) {
      const clubResult = ensureClubExists(registry, {
        name: clubName,
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
    let team = null;

    if (competitionResult.success && teamName) {
      const teamResult = ensureTeamExists(registry, {
        name: teamName,
        clubId: club?.clubId ?? player?.clubId ?? '',
        clubName: club?.name ?? player?.clubName ?? '',
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

    const normalizedResult = normalizeMatchedStatsRow(registry, row, {
      rawStatId: raw.rawStatId,
      competitionId: competitionResult.success
        ? competitionResult.competition.competitionId
        : null,
      season: options.season ?? '',
      teamId: team?.teamId ?? null,
      teamName: team?.name ?? teamName,
      clubId: club?.clubId ?? player?.clubId ?? null,
      clubName: club?.name ?? player?.clubName ?? ''
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
      createdClubs,
      createdCompetitions,
      createdTeams,
      createdMemberships
    }
  };
}