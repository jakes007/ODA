# PROJECT CONTEXT

## Product Goal
A complete darts management platform supporting:
- public competition viewing
- player profiles
- standings and rankings
- fixture management
- player registry aligned to DSA requirements
- captain workflows
- admin workflows
- live scoring preparation

## Platform Scope
The system is being piloted for a single association first, then intended to scale to district and broader structures later.

## Current Architecture

### Backend Core
Located in root `src/`

Includes:
- scoring engine
- rules validation
- match summaries
- multi-leg support
- fixture generation
- lineup builder
- substitution system
- match execution
- stats aggregation
- player registry
- player history
- competition tables
- player profiles
- head-to-head
- competition view models
- team role / captain assignment model

### Frontend App
Located in `frontend/src/`

Includes:
- public landing page
- competition overview page
- standings page
- rankings page
- fixtures page
- player profile page
- login page
- request access page
- player dashboard
- admin dashboard
- captain dashboard
- captain fixture setup page
- lineup validation and ready-to-play flow
- auth-aware navigation
- mobile navigation
- role-based routing
- scroll-to-top route behavior

## Roles

### Global App Roles
- public
- player
- captain
- admin

### Team-Scoped Role Logic
Captain is treated as a team-level permission concept, not just a public profile field.

Team role model supports:
- player
- captain

Planned later:
- vice-captain
- scorer

## Registry Model
The player registry must align with DSA-style membership data and should be treated as admin-controlled official data.

User registration should behave as an access request linked to an official player registry record, not direct uncontrolled player creation.

## Public Experience
The public entry point is the landing page, not a dashboard.

Public users can browse:
- competition overview
- standings
- rankings
- fixtures
- player profiles

## Auth Experience
Login and register/request access are route-based pages, not modals.

Logged-in users are redirected by role:
- player -> player dashboard
- captain -> captain dashboard
- admin -> admin dashboard

## Captain Workflow Direction
Captain flow currently supports:
- viewing own team fixtures
- opening fixture setup
- setting lineup order
- validating lineup
- blocking duplicate players
- enforcing lineup size
- moving fixture into ready-to-play state

Next captain workflow targets:
- launch live scoring
- fixture progress control
- substitutions
- game-by-game match flow

## Design Strategy
Current phase is structure and workflow, not full visual polish.

Priority order:
1. system logic
2. UI structure
3. auth and role routing
4. captain/admin/player workflows
5. live scoring
6. visual design pass

## Current Modules

### Backend
- dataModel.js
- playerRegistry.js
- playerHistory.js
- playerProfile.js
- headToHead.js
- competitionViews.js
- teamRoles.js
- engine.js
- rules.js
- matchSummary.js
- multiLegMatch.js
- fixtureGenerator.js
- lineupBuilder.js
- matchExecutor.js
- statsAggregator.js
- competitionTables.js

### Frontend
- context/AuthContext.jsx
- components/auth/ProtectedRoute.jsx
- components/auth/RoleRoute.jsx
- components/layout/*
- components/common/*
- components/tables/*
- services/competitionData.js
- services/playerData.js
- services/captainData.js
- pages/LandingPage.jsx
- pages/CompetitionOverviewPage.jsx
- pages/StandingsPage.jsx
- pages/RankingsPage.jsx
- pages/FixturesPage.jsx
- pages/PlayerProfilePage.jsx
- pages/LoginPage.jsx
- pages/RegisterPage.jsx
- pages/PlayerDashboardPage.jsx
- pages/AdminDashboardPage.jsx
- pages/CaptainDashboardPage.jsx
- pages/CaptainFixtureSetupPage.jsx

## Last Confirmed Stable Milestone
Last safe Git baseline:
`Built captain lineup validation and ready-to-play workflow`

This is the restart point for future work.