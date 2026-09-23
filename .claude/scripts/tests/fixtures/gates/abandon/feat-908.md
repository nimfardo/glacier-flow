# Gates — feat-908

## G1 — parser reads a two-gate ledger
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$

## G2 — staging deploy serves the new asset
MANUAL: load the staging URL and confirm the asset is served
EVIDENCE: owed
ABANDON: G2 needs a staging deploy the owner controls
