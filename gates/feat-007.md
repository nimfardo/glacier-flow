# Gates — feat-007

## G1 — every test suite passes on this box
CHECK: node .claude/scripts/tests/run-all.mjs
EXPECT: ^(\d+) run, \1 passed$
EVIDENCE: met 2026-09-23T07:35:00Z exit=0 digest=3b5f807a out="11 run, 11 passed"

## G2 — every budgeted always-load file is within its limit
CHECK: node .claude/hooks/budget-check.mjs --all
EXPECT: ^budget-check: ok
EVIDENCE: met 2026-09-23T07:35:00Z exit=0 digest=fc1a658b out="budget-check: ok (4 file(s))"

## G3 — the budget hook is registered as a PostToolUse hook
CHECK: node -e "console.log(require('fs').readFileSync('.claude/settings.json','utf8').includes('budget-check')?'registered':'missing')"
EXPECT: ^registered$
EVIDENCE: met 2026-09-23T07:35:00Z exit=0 digest=d6cc9fb7 out="registered"
