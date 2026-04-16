# ROADMAP

## COMPLETED

### Core Engine
- Scoring engine
- Rules validation
- Match summaries

### Multi-Leg Matches
- Fixed leg mode
- Best-of mode
- Draw support

### Fixture System
- Template-based fixture generation
- Game structures
- Score tracking
- Summary linking

### Lineup System
- Automatic lineup assignment
- Supports singles, doubles, team games
- Validation rules (duplicates, squad checks, minimum players)

### Substitution System
- Future-game substitutions
- Completed games remain unchanged

### Match Execution
- Start match from fixture
- Live scoring
- Finalize match
- Write results back into fixture
- Supports:
  - singles
  - doubles
  - team games
  - multi-leg formats

### Stats Aggregation
- Player aggregates
- Competition aggregates
- Leaderboards
- Multi-competition support

### Player Registry System
- Admin master records
- Private player profiles
- Public player views
- Edit request workflow
- Approval / rejection system
- Audit tracking

---

## NEXT

### 1. Player Match History
- Store all match summaries per player
- View match-by-match history
- Filter by competition

### 2. Competition Tables
- League standings
- Player rankings
- Team rankings

### 3. Stats UI Preparation
- Structure data for frontend use
- Optimize leaderboard queries

---

## LATER

### Admin System
- Player management UI
- Competition creation
- Fixture builder tools

### Backend (Firebase)
- Data persistence
- Authentication
- Role-based access
- Real-time updates

### Frontend (React)
- Admin dashboard
- Player profiles
- Match scoring UI
- Public competition pages

---

## CURRENT POSITION

Backend Core Complete

Next Step → Player Match History