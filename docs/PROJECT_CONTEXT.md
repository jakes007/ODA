# PROJECT CONTEXT

## Product Goal
A full darts management platform supporting:
- leagues
- singles competitions
- tournaments
- player registry
- fixture generation
- match execution
- stats aggregation
- player history
- competition tables

## Core Systems

### Player Registry
- admin master records
- private player profiles
- public player profiles
- edit request workflow
- approval / rejection audit trail

### Competition System
- one player can belong to multiple competitions
- supports league, singles, and tournament structures

### Fixture System
- template-based fixture generation
- squads
- lineups
- substitutions
- game tracking
- score tracking

### Match System
- single-leg engine
- multi-leg support
- singles, doubles, and team execution
- live fixture game execution
- summary generation

### Stats System
- per-match stats
- aggregated player stats
- competition-specific aggregates
- leaderboards

### Player History System
- stores all player match summaries
- supports filtering by competition
- links match summaries to player records

### Competition Tables
- team standings
- player rankings
- reusable sorting logic for competition outputs

## Data Flow

Player → Competition → Fixture → Match → Summary → History → Aggregates → Tables

## Key Rules

1. One player can belong to multiple competitions at the same time
2. Private player data must never be public
3. Completed games and matches are immutable
4. Substitutions only affect future unplayed games
5. Stats must aggregate correctly across competitions
6. History must record every participant
7. All business logic stays outside UI

## Current Modules

- dataModel.js
- playerRegistry.js
- playerHistory.js
- engine.js
- rules.js
- matchSummary.js
- multiLegMatch.js
- fixtureGenerator.js
- lineupBuilder.js
- matchExecutor.js
- statsAggregator.js
- competitionTables.js