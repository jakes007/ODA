# PROJECT CONTEXT

## Product Goal
A complete darts management platform supporting:
- competitions
- fixtures
- scoring
- player management
- stats and rankings
- player profiles

---

## Core Systems

### Player Registry
- admin master records
- private player profiles
- public player profiles
- edit request workflow

### Match System
- scoring engine
- rules validation
- match summaries
- multi-leg support
- singles / doubles / team formats

### Fixture System
- template-based fixtures
- lineups
- substitutions
- game execution

### Stats System
- match stats
- aggregated stats
- competition stats
- leaderboards

### Player History
- full match tracking per player
- competition filtering

### Competition Tables
- team standings
- player rankings

### Player Profiles
- combines:
  - registry
  - history
  - stats
  - competition views

---

## Data Flow

Player → Match → Summary → History → Aggregates → Tables → Profile

---

## Key Rules

1. One player can belong to multiple competitions
2. Private data must never be public
3. Completed matches are immutable
4. Substitutions affect only future games
5. Stats aggregate across competitions
6. History records all participants
7. Logic remains outside UI

---

## Current Modules

- dataModel.js
- playerRegistry.js
- playerHistory.js
- playerProfile.js
- engine.js
- rules.js
- matchSummary.js
- multiLegMatch.js
- fixtureGenerator.js
- lineupBuilder.js
- matchExecutor.js
- statsAggregator.js
- competitionTables.js