# ROADMAP

## Completed

### Core Scoring
- Single-leg scoring engine
- Rules validation layer
- Match stats tracking
- Match summary builder

### Multi-Leg Support
- Fixed multi-leg mode
- Best-of capable structure
- Draw-capable wrapper

### Fixture System
- Fixture creation
- Fixture summaries
- Player assignment to games
- Result recording
- Fixture score tracking
- Summary linking into fixture games

### Core Data Model
- Player master record
- Player private profile
- Player public profile
- Competition
- Competition membership
- Team
- Fixture template
- Player edit request

### Generated Fixtures
- Generate fixture from template
- Team squad support
- Original vs active assignments
- Substitution tracking

### Lineup Builder
- Automatic lineup assignment for:
  - singles
  - doubles
  - team games

## Next

### 1. Lineup Validation Rules
Add validation for:
- player must exist in squad
- no duplicate players
- enough players for each format
- invalid lineup prevention

### 2. Match Execution Integration
Connect:
- fixture game
- match engine
- summary output
- fixture result recording

Goal:
A fixture game should be playable from the generated fixture structure.

### 3. Captain / Admin Override Rules
Support:
- manual reordering
- manual reassignment
- controlled overrides
- lineup edits before game start

## Later

### Player Statistics
- aggregate per competition
- aggregate overall
- player history
- leaderboards

### Registry Workflow
- edit request approval flow
- admin review tools
- export to DSA spreadsheet format

### Firebase / Persistence
- store all entities
- auth
- role-based access
- real-time updates

### UI
- admin dashboard
- player self-service
- public competition pages
- match scoring screens

## Strategic Rule
Keep building backend logic first.
Do not move core business logic into UI.