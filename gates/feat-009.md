# Gates — feat-009

## G1 — every command SETUP.md quotes exits as documented
CHECK: node .claude/scripts/tests/run-all.mjs && node .claude/hooks/budget-check.mjs --all
EXPECT: ^budget-check: ok
EVIDENCE: met 2026-09-23T07:36:41Z exit=0 digest=abc0b415 out="11 run, 11 passed"

## G2 — README.md carries a pointer to SETUP.md, not a second copy of the steps
CHECK: node -e "const s=require('fs').readFileSync('README.md','utf8');const steps=(s.match(/^### Step /gm)||[]).length;console.log(s.includes('SETUP.md')&&steps===0?'pointer only':'duplicated: '+steps+' steps')"
EXPECT: ^pointer only$
EVIDENCE: met 2026-09-23T07:36:41Z exit=0 digest=cdad3227 out="pointer only"

## G3 — the owner runs SETUP.md against a fresh clone and the gate blocks as written
MANUAL: clone the repo to a new directory, open it in Claude Code, ask for an edit under src/ without approving a task, and confirm the write is blocked with "Gate closed"
EVIDENCE: owed
