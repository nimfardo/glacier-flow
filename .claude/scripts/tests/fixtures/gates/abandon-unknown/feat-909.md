# Gates — feat-909

## G1 — parser reads a one-gate ledger
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$
ABANDON: G9 this gate is not in the ledger at all
