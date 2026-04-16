# PROJECT CONTEXT

## Product Goal
A multi-competition darts management system for associations, leagues, singles competitions, memorial events, and team fixtures.

The system must support:
- admin-only registry data
- player self-service for allowed profile fields
- public-safe player views
- singles, doubles, and team formats
- lineups and substitutions
- match stats and summaries
- fixture generation from templates
- real match execution from fixture games

## Core Architecture

### Player Domain
- One player can belong to multiple active competitions at the same time.
- Private and public data are separated.

#### Player Master Record
Admin-controlled official registry record.
May contain:
- DSA number
- ID number
- DOB
- address
- phone
- email
- status
- association / province

#### Player Private Profile
Visible to the player themselves.
Can later support editable fields and edit requests.

#### Player Public Profile
Visible to public / other players.
Only safe fields should appear here.

### Competition Domain
- Competitions are separate entities.
- A player joins competitions through memberships.
- Team-based and non-team competitions are both supported.

### Team Domain
- Teams belong to competitions.
- Teams can later have captains, squads, and lineups.

## Match / Scoring Architecture

### Engine
`engine.js`
- single-leg state manager
- score updates
- stats storage
- no rule validation

### Rules
`rules.js`
- max 180
- bust behavior
- cannot leave 1
- double-out
- invalid checkout handling

### Match Summary
`matchSummary.js`
- exports finished leg summary
- includes winner and player stats

### Multi-Leg Match
`multiLegMatch.js`
- wraps multiple legs
- supports fixed and best-of modes
- supports draw-capable formats like 1-1

## Fixture Architecture

### Fixture Template
Reusable game format definition.
Examples:
- 2 doubles + 4 singles + team decider
- singles-only format
- memorial format

Templates are starting points, not hardcoded rules.
Admin must still be able to override generated fixtures later.

### Fixture Generator
`fixtureGenerator.js`
Creates real fixture instances from:
- competition
- template
- team A
- team B
- squads

Generated fixtures contain:
- team squads
- ordered games
- original assignments
- active assignments
- substitutions
- scores
- summaries

### Lineup Builder
`lineupBuilder.js`
Applies ordered lineups to a generated fixture.

Supports:
- singles assignment by order
- doubles pairing by order
- team games using full lineup

Also validates:
- no duplicate players
- all lineup players must exist in squad
- enough players must exist for the fixture format

### Substitution Model
Substitutions only affect future unplayed games.

Important rule:
- completed games never change
- original assignment is preserved
- active assignment can change for future games
- substitution events are logged

### Match Execution Layer
`matchExecutor.js`
Supports:
- starting a fixture game
- creating a live match
- playing turns through the rules engine
- finalizing the match
- building the summary
- writing winner + summary back into the fixture

Current V1 limitation:
- execution layer supports singles fixture games only

## Stats Model

### Match-Level Stats
Currently tracked per leg:
- dartsUsed
- throws
- totalScored
- 3-dart average
- 100+
- 140+
- 180s
- highest checkout

Important rule:
- bust / zero turn still counts as 3 darts and 1 throw

## Key Design Decisions
1. One player can be active in many competitions at once.
2. Private registry data must never be public.
3. Templates generate fixtures, but fixtures must remain manually editable.
4. Completed games never change after completion.
5. Substitutions only affect future unplayed assignments.
6. Database structure must stay separate from DSA export format.
7. Logic stays outside UI to avoid bloated code.
8. Fixture games should execute through the same scoring engine, not through duplicate logic.

## Current Working Modules
- `dataModel.js`
- `engine.js`
- `rules.js`
- `matchSummary.js`
- `multiLegMatch.js`
- `fixture.js`
- `fixtureGenerator.js`
- `lineupBuilder.js`
- `matchExecutor.js`