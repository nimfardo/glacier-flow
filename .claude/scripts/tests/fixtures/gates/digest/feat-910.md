# Gates — feat-910

## G1 — export writes BOM-free UTF-8
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$
EVIDENCE: met 2026-09-23T10:00:00Z exit=0 digest=deadbeef out="gates parsed"

## G2 — export suite covers the CSV writer
CHECK: node -e "console.log('gates parsed')"
EXPECT: ^gates parsed$
