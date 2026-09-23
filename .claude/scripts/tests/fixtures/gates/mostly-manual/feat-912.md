# Gates — feat-912

## G1 — parser reads a three-gate ledger
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$

## G2 — owner confirms the hover state
MANUAL: hover every row and compare against the frame
EVIDENCE: owed

## G3 — owner confirms the loading state
MANUAL: throttle the network and watch the skeleton
EVIDENCE: owed
