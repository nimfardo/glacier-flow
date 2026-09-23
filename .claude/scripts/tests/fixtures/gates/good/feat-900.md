# Gates — feat-900

## G1 — parser reads a two-gate ledger
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$

## G2 — owner sees the empty state render
MANUAL: open the dashboard with no rows and confirm the empty state
EVIDENCE: owed
