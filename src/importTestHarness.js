import { createEmptyRegistry } from './playerRegistry.js';
import { importRegistryRows, importStatsRows } from './importer.js';
import {
  buildCompetitionStandings,
  buildCompetitionPlayerRankings,
  buildPlayerCompetitionHistory
} from './competitionStats.js';

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function summarizeRegistry(registry) {
  return {
    players: Object.keys(registry.players).length,
    clubs: Object.keys(registry.clubs).length,
    competitions: Object.keys(registry.competitions).length,
    teams: Object.keys(registry.teams).length,
    competitionMemberships: Object.keys(registry.competitionMemberships).length,
    historicalStatsRaw: Object.keys(registry.historicalStatsRaw).length,
    historicalStatsNormalized: Object.keys(registry.historicalStatsNormalized).length,
    importExceptions: Object.keys(registry.importExceptions).length,
    editRequests: Object.keys(registry.editRequests).length
  };
}

function getFirstCompetitionId(registry) {
  return Object.keys(registry.competitions)[0] ?? null;
}

function getFirstPlayerId(registry) {
  return Object.keys(registry.players)[0] ?? null;
}

export function runImportSmokeTest({
  registryRows = [],
  statsRows = [],
  competitionName = 'ODA League',
  competitionType = 'league',
  season = '2026',
  competitionStatus = 'active',
  associationName = 'Observatory',
  provinceName = 'Western Cape',
  sourceWorkbook = 'ODA Union Stats',
  sourceSheet = 'Stats Input'
} = {}) {
  const registry = createEmptyRegistry();

  const registryImportResult = importRegistryRows(registry, registryRows, {
    source: 'registry_import'
  });

  const statsImportResult = importStatsRows(registry, statsRows, {
    competitionName,
    competitionType,
    season,
    competitionStatus,
    associationName,
    provinceName,
    sourceWorkbook,
    sourceSheet,
    defaultRole: 'player'
  });

  const competitionId = getFirstCompetitionId(registry);

  const standingsResult = competitionId
    ? buildCompetitionStandings(registry, competitionId)
    : {
        success: false,
        reason: 'No competition found after import'
      };

  const rankingsResult = competitionId
    ? buildCompetitionPlayerRankings(registry, competitionId)
    : {
        success: false,
        reason: 'No competition found after import'
      };

  const firstPlayerId = getFirstPlayerId(registry);

  const playerHistoryResult =
    competitionId && firstPlayerId
      ? buildPlayerCompetitionHistory(registry, firstPlayerId, competitionId)
      : {
          success: false,
          reason: 'No player or competition found for history check'
        };

  const summary = {
    registryImport: {
      success: registryImportResult.success,
      createdPlayers: registryImportResult.createdPlayers ?? 0,
      createdClubs: registryImportResult.createdClubs ?? 0
    },
    statsImport: statsImportResult.summary ?? {
      rawCount: 0,
      matchedCount: 0,
      exceptionCount: 0,
      createdClubs: 0,
      createdCompetitions: 0,
      createdTeams: 0,
      createdMemberships: 0
    },
    registryTotals: summarizeRegistry(registry),
    standings: standingsResult.success
      ? {
          success: true,
          competitionName: standingsResult.competition.name,
          rowCount: standingsResult.standings.length,
          top3: standingsResult.standings.slice(0, 3).map((row) => ({
            position: row.position,
            teamName: row.teamName,
            leaguePoints: row.leaguePoints,
            played: row.played,
            scoreDifference: row.scoreDifference
          }))
        }
      : standingsResult,
    rankings: rankingsResult.success
      ? {
          success: true,
          competitionName: rankingsResult.competition.name,
          rowCount: rankingsResult.rankings.length,
          top5: rankingsResult.rankings.slice(0, 5).map((row) => ({
            position: row.position,
            displayName: row.displayName,
            average: row.average,
            points: row.points,
            legsWon: row.legsWon
          }))
        }
      : rankingsResult,
    samplePlayerHistory: playerHistoryResult.success
      ? {
          success: true,
          playerName: playerHistoryResult.player.fullName,
          competitionName: playerHistoryResult.competition.name,
          summary: {
            matchesPlayed: playerHistoryResult.summary.matchesPlayed,
            average: playerHistoryResult.summary.average,
            points: playerHistoryResult.summary.points,
            legsWon: playerHistoryResult.summary.legsWon
          },
          first3Rows: playerHistoryResult.rows.slice(0, 3)
        }
      : playerHistoryResult,
    sampleExceptions: Object.values(registry.importExceptions)
      .slice(0, 10)
      .map((exception) => ({
        dsaNumber: cleanString(exception.dsaNumber),
        rawPlayerName: cleanString(exception.rawPlayerName),
        reason: cleanString(exception.reason),
        status: cleanString(exception.status)
      }))
  };

  return {
    success: true,
    registry,
    summary
  };
}

export function printImportSmokeTestResult(result) {
  console.log('\n===== IMPORT SMOKE TEST RESULT =====');
  console.log(JSON.stringify(result.summary, null, 2));
}