# ROADMAP

## ✅ COMPLETED

### Core Engine
- Scoring system
- Rules validation
- Match summaries

### Multi-Leg Matches
- Fixed legs
- Best-of format
- Draw support

### Fixture System
- Template-based generation
- Game structure
- Score tracking
- Summary linking

### Lineup System
- Automatic assignment
- Doubles + singles + team
- Validation rules

### Substitution System
- Future-game substitution logic
- Immutable completed games

### Match Execution
- Start match from fixture
- Live scoring
- Finalize match
- Write back into fixture
- Supports:
  - singles
  - doubles
  - team
  - multi-leg

### Stats Aggregation
- Player aggregates
- Competition aggregates
- Leaderboards
- Multi-competition support

---

## 🔥 NEXT

### 1. Player Registry System
Build full DSA-aligned player system:
- Master record (admin)
- Private profile (player)
- Public profile
- Edit request workflow

---

### 2. Player Match History
- Store all match summaries per player
- View match-by-match history
- Connect to aggregates

---

### 3. Competition Stats Views
- Standings tables
- Player rankings
- Team rankings

---

## 🔜 LATER

### Admin System
- Player management
- Competition creation
- Template management
- Fixture control

---

### Firebase / Backend
- Data persistence
- Authentication
- Roles (admin/player)
- Real-time updates

---

### UI (React)
- Admin dashboard
- Match scoring interface
- Player profiles
- Public competition pages

---

## 🧠 STRATEGY

- Build backend first
- Keep logic modular
- Avoid UI logic duplication
- Ensure data integrity before UI

---

## 📍 CURRENT POSITION

Core Engine ✅
Fixtures ✅
Lineups ✅
Validation ✅
Substitutions ✅
Execution ✅
Stats Aggregation ✅
⬇
NEXT → Player Registry