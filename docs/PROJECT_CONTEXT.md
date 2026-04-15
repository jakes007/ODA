🧠 UPDATED PROJECT CONTEXT
🎯 What you are building

A multi-competition darts management system that supports:

Player registry (DSA-aligned)
Team leagues + singles + tournaments
Real-world match formats (singles, doubles, team)
Lineups + substitutions
Match scoring + stats
Fixture management
Admin + player + public views
🧱 Current Architecture (NOW COMPLETE)
🔹 Core Domains
Player Master Record (admin)
Player Private Profile (self-service)
Player Public Profile (safe)
Competition
Competition Membership
Team
🔹 Match System
Engine (scoring logic)
Rules (validation)
Match Summary (stats output)
Multi-leg support
🔹 Fixture System
Fixture Templates
Fixture Generation
Squad support
Lineup Builder
Substitution System
Game Results + Summary Linking
🧠 Key Design Principles (LOCK THESE IN)
One Player → Many Competitions
Private ≠ Public Data
Template → Instance → Override
Completed Games Never Change
Substitutions Only Affect Future Games
Database ≠ Export Format (DSA mapping later)