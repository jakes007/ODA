# ROADMAP

## COMPLETED

### Backend
- scoring engine
- rules validation
- match summaries
- multi-leg matches
- fixture system
- lineup builder
- substitutions
- match execution
- stats aggregation
- player registry
- player history
- competition tables
- player profiles
- head-to-head
- competition view models
- team roles and captain assignment logic

### Frontend Foundation
- React app structure
- reusable layout
- public landing page
- competition pages
- player profile page
- login page
- request access page
- player dashboard
- admin dashboard
- captain dashboard
- captain fixture setup page
- lineup validation
- ready-to-play flow
- auth-aware navigation
- mobile navigation
- protected routes
- role-based redirects

## CURRENT STABLE BASELINE

Last committed safe point:
`Built captain lineup validation and ready-to-play workflow`

## NEXT

### 1. Launch Live Scoring Flow
- captain starts a ready fixture
- open a live scoring route/page
- connect captain workflow to scoring session state

### 2. Fixture-Driven Live Scoring
- progress through fixture games in order
- launch individual game scoring
- carry completed game result back into fixture state

### 3. Captain Workflow Expansion
- substitution controls
- fixture progress control
- ready / active / completed state transitions

### 4. Admin Workflow Expansion
- player registry management
- captain assignment management
- fixture generation tools
- request review tools

## AFTER THAT

### Player Workflow Expansion
- richer player dashboard
- personal match history
- competition participation views

### Public Experience Expansion
- richer home page interactions
- featured competitions
- better navigation to live fixtures and stats

## LATER

### Backend Integration
- persistent storage
- Firebase or alternative backend
- true authentication
- role persistence
- audit persistence

### Advanced Roles
- vice-captain
- scorer
- team manager

### Live Match Features
- true live scoring
- per-turn score entry
- real-time updates
- stat extraction directly from scoring flow

### Final UI / Design Pass
- branding
- polished visuals
- stronger responsive layout
- animations and micro-interactions
- visual consistency across all pages

## WORKING METHOD
Because the project is large, continue in small milestones:
1. implement one feature
2. test immediately
3. commit immediately
4. update docs if milestone changes architecture