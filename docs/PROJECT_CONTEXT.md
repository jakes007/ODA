# PROJECT CONTEXT

## Product Goal
A multi-competition darts management system supporting:
- Leagues
- Singles competitions
- Memorial tournaments
- Team fixtures

The system must support:
- Player registry (DSA aligned)
- Player self-service profiles
- Public-safe player views
- Match scoring and stats
- Fixture management
- Lineups and substitutions
- Multi-competition participation
- Stats aggregation and leaderboards

---

## Core Architecture

### Player Domain
- One player can belong to multiple competitions simultaneously.

#### Player Master Record (Admin Only)
- DSA Number
- ID Number
- Full Name
- Date of Birth
- Address
- Phone
- Email
- Status (Active / Inactive)
- Association / Province

#### Player Private Profile
- Visible to the player themselves
- Editable fields (future: approval flow)

#### Player Public Profile
- Visible to other users
- Only safe, non-sensitive data

---

### Competition Domain
- Competitions are independent entities
- Types: league, singles, tournament
- Players join via membership

---

### Team Domain
- Teams belong to competitions
- Teams have squads
- Teams produce lineups per fixture

---

## Match / Scoring System

### Engine (`engine.js`)
- Handles scoring state
- Tracks darts, throws, score
- No validation logic

### Rules (`rules.js`)
- Max 180
- Bust logic
- Double-out enforcement
- Invalid checkout handling

### Match Summary (`matchSummary.js`)
- Outputs final match data
- Includes player stats

### Multi-Leg System (`multiLegMatch.js`)
- Supports:
  - fixed legs
  - best-of format
  - draw scenarios

---

## Fixture System

### Fixture Templates
Reusable definitions of match formats.

Examples:
- 2 doubles + 4 singles + team decider
- singles-only competitions

Templates are flexible:
- Admin can override generated fixtures later

---

### Fixture Generator (`fixtureGenerator.js`)
Creates fixtures with:
- teams
- squads
- ordered games
- assignments
- scores
- summaries

---

### Lineup Builder (`lineupBuilder.js`)
Applies lineups to fixtures.

Supports:
- singles assignment
- doubles pairing
- team games

Validation:
- no duplicates
- must exist in squad
- sufficient players

---

### Substitution System
- Only affects future games
- Completed games are immutable
- Tracks original vs active players

---

## Match Execution Layer (`matchExecutor.js`)

Supports:
- Starting fixture games
- Live match tracking
- Turn processing
- Multi-leg execution
- Finalizing matches
- Writing results into fixture

Supports:
- singles
- doubles
- team games
- multi-leg formats

---

## Stats System

### Match-Level Stats
Tracked per match:
- dartsUsed
- throws
- totalScored
- 3-dart average
- 100+
- 140+
- 180s
- highest checkout

Rule:
- bust = still counts as 3 darts

---

### Aggregation System (`statsAggregator.js`)

Supports:
- player overall stats
- per-competition stats
- leaderboard generation

Pipeline:

Match → Summary → Aggregate → Leaderboard


---

## Key Design Principles

1. One player → many competitions
2. Private data never exposed publicly
3. Templates generate fixtures but are editable
4. Completed games never change
5. Substitutions only affect future games
6. Stats must aggregate across competitions correctly
7. Logic must stay outside UI (prevent bloat)
8. Single source of truth for match results

---

## Current Modules

- dataModel.js
- engine.js
- rules.js
- matchSummary.js
- multiLegMatch.js
- fixture.js
- fixtureGenerator.js
- lineupBuilder.js
- matchExecutor.js
- statsAggregator.js