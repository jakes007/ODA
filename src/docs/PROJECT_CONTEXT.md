# Darts App - Core Architecture

## Engine
- Handles ONE leg only
- No UI, no Firebase
- Tracks:
  - score
  - dartsUsed
  - throws
  - totalScored
  - 100+, 140+, 180s
  - highestCheckout

## Rules
- Max 180 per turn
- Bust = 0 turn (score unchanged, turn switches)
- Cannot leave 1
- Double-out required
- Impossible checkouts blocked

## Match Summary
- Built after each leg
- Includes:
  - winner
  - stats
  - averages
  - result (win/loss)

## Multi-Leg Match
- Supports:
  - bestOf
  - fixed (draw possible)
- Tracks:
  - legWins
  - overallWinner
  - overallResult
  - completedLegs (array of summaries)

## Scoring Model (IMPORTANT)
- Scorekeeper enters:
  - real score OR
  - 0 for bust/invalid
- Engine NEVER calculates bust reason

## Stats Model
- Based on turns (not dart-by-dart tracking)
- Bust counts as 3 darts
- Average = (totalScored / dartsUsed) * 3