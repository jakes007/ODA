# PROJECT CONTEXT

## Product Goal
A full darts management platform supporting:
- leagues
- singles competitions
- tournaments
- player registry (DSA aligned)
- match execution
- stats tracking
- fixture management

---

## Core Systems

### Player Registry System
Supports:
- Admin master records
- Private player profiles
- Public player views
- Edit request workflow
- Approval / rejection system
- Audit tracking

---

### Competition System
- Players participate in multiple competitions
- Supports league, singles, and tournament formats

---

### Team System
- Teams belong to competitions
- Teams have squads
- Teams produce lineups per fixture

---

### Fixture System
- Template-based generation
- Lineup assignment
- Substitutions
- Game tracking
- Score tracking

---

### Match System
- Single-leg engine
- Multi-leg support
- Doubles and team formats
- Real-time execution from fixtures

---

### Stats System
- Match-level stats
- Player aggregates
- Competition aggregates
- Leaderboards

---

## Data Flow

Player → Competition → Fixture → Match → Summary → Stats

---

## Key Rules

1. One player can belong to multiple competitions simultaneously
2. Private player data must never be exposed publicly
3. Completed matches are immutable
4. Substitutions only affect future games
5. Stats must aggregate correctly across competitions
6. All business logic must stay outside UI components
7. Fixture execution must use a single source of truth (match engine)

---

## Current Modules

- dataModel.js
- playerRegistry.js
- engine.js
- rules.js
- matchSummary.js
- multiLegMatch.js
- fixtureGenerator.js
- lineupBuilder.js
- matchExecutor.js
- statsAggregator.js