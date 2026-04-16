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
- player history

---

## Core Systems

### Player Registry System
- Admin master records
- Private player profiles
- Public player views
- Edit request workflow
- Approval / rejection system
- Audit tracking

---

### Competition System
- Players can participate in multiple competitions simultaneously

---

### Fixture System
- Template-based generation
- Lineups
- Substitutions
- Game tracking

---

### Match System
- Single-leg engine
- Multi-leg support
- Doubles and team formats
- Real-time execution

---

### Stats System
- Match-level stats
- Aggregated player stats
- Competition stats
- Leaderboards

---

### Player History System
- Stores all matches per player
- Supports competition filtering
- Tracks opponents, results, stats
- Links directly to match summaries

---

## Data Flow

Player → Match → Summary → History → Aggregates → Leaderboards

---

## Key Rules

1. One player → multiple competitions
2. Private data never public
3. Completed matches immutable
4. Substitutions only affect future games
5. Stats must aggregate correctly
6. History must record all participants
7. Logic stays outside UI

---

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