import { createCompetition, createTeam } from './dataModel.js';
import {
  createTeamRoleStore,
  createTeamMembership,
  addTeamMembership,
  getTeamMemberships,
  getActiveCaptain,
  isPlayerCaptain,
  assignCaptain,
  removeCaptain,
  printTeamRoleState
} from './teamRoles.js';

// --------------------------------------------
// Setup competition + team
// --------------------------------------------
const competition = createCompetition({
  name: 'ODA League',
  type: 'league',
  season: '2026',
  status: 'active',
  associationName: 'Observatory Darts Association',
  provinceName: 'Western Cape'
});

const team = createTeam({
  name: 'Observatory A',
  associationName: 'Observatory Darts Association',
  competitionId: competition.competitionId
});

// --------------------------------------------
// Create team role store
// --------------------------------------------
const roleStore = createTeamRoleStore();

// --------------------------------------------
// Add team memberships
// --------------------------------------------
const jasonMembership = createTeamMembership({
  playerId: 'player_jason',
  competitionId: competition.competitionId,
  teamId: team.teamId
});

const mikeMembership = createTeamMembership({
  playerId: 'player_mike',
  competitionId: competition.competitionId,
  teamId: team.teamId
});

const peterMembership = createTeamMembership({
  playerId: 'player_peter',
  competitionId: competition.competitionId,
  teamId: team.teamId
});

addTeamMembership(roleStore, jasonMembership);
addTeamMembership(roleStore, mikeMembership);
addTeamMembership(roleStore, peterMembership);

printTeamRoleState(
  'ALL ACTIVE TEAM MEMBERSHIPS',
  getTeamMemberships(roleStore, team.teamId, competition.competitionId)
);

// --------------------------------------------
// Assign Jason as captain
// --------------------------------------------
const assignJason = assignCaptain({
  store: roleStore,
  playerId: 'player_jason',
  teamId: team.teamId,
  competitionId: competition.competitionId,
  changedBy: 'admin_jake',
  reason: 'Initial captain assignment'
});

printTeamRoleState('ASSIGN JASON AS CAPTAIN', assignJason);

// --------------------------------------------
// Check captain state
// --------------------------------------------
printTeamRoleState(
  'ACTIVE CAPTAIN AFTER JASON ASSIGNMENT',
  getActiveCaptain(roleStore, team.teamId, competition.competitionId)
);

printTeamRoleState(
  'IS JASON CAPTAIN?',
  isPlayerCaptain(roleStore, 'player_jason', team.teamId, competition.competitionId)
);

// --------------------------------------------
// Change captain from Jason to Mike
// --------------------------------------------
const assignMike = assignCaptain({
  store: roleStore,
  playerId: 'player_mike',
  teamId: team.teamId,
  competitionId: competition.competitionId,
  changedBy: 'admin_jake',
  reason: 'Captain changed mid-season'
});

printTeamRoleState('ASSIGN MIKE AS CAPTAIN', assignMike);

printTeamRoleState(
  'ACTIVE CAPTAIN AFTER MIKE ASSIGNMENT',
  getActiveCaptain(roleStore, team.teamId, competition.competitionId)
);

printTeamRoleState(
  'IS JASON STILL CAPTAIN?',
  isPlayerCaptain(roleStore, 'player_jason', team.teamId, competition.competitionId)
);

printTeamRoleState(
  'IS MIKE NOW CAPTAIN?',
  isPlayerCaptain(roleStore, 'player_mike', team.teamId, competition.competitionId)
);

// --------------------------------------------
// Remove captain entirely
// --------------------------------------------
const removeCurrentCaptain = removeCaptain({
  store: roleStore,
  teamId: team.teamId,
  competitionId: competition.competitionId,
  changedBy: 'admin_jake',
  reason: 'Captain stepped down'
});

printTeamRoleState('REMOVE CURRENT CAPTAIN', removeCurrentCaptain);

printTeamRoleState(
  'ACTIVE CAPTAIN AFTER REMOVAL',
  getActiveCaptain(roleStore, team.teamId, competition.competitionId)
);

// --------------------------------------------
// Final state
// --------------------------------------------
printTeamRoleState('FINAL TEAM ROLE STORE', roleStore);