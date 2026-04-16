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
- Validation against squad
- Duplicate prevention
- Invalid lineup prevention

### Match Execution
- Start singles fixture game from generated fixture
- Create live match
- Process turns
- Finalize game
- Write summary + result back into fixture

## Next

### 1. Expand Match Execution Beyond Singles
Add support for:
- doubles fixture games
- team fixture games
- multi-leg fixture games

### 2. Captain / Admin Override Rules
Support:
- manual reordering
- manual reassignment
- controlled overrides
- lineup edits before game start

### 3. Player / Competition Stats Aggregation
Build:
- player history per competition
- overall player history
- leaderboards
- team stats

## Later

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