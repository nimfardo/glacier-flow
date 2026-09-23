# Wiki Log

> Chronological, append-only record of what happened in the wiki.
> Format: `## [YYYY-MM-DD] <operation> | <title>` followed by a short note.
> Operations: `ingest`, `query`, `lint`, `decision`, `feat`, `fix`, `refactor`, `docs`, `housekeep`.
>
> **`decision` entries:** a plain approval that contradicted nothing stays a short note. A
> contradiction resolved under `.context/rules.md` (non-negotiable 6) uses this shape instead,
> still under one `## [YYYY-MM-DD] decision | <title>` heading:
> **Decided:** verbatim — the user's own words. **Contradicts:** `file:line` + the line quoted,
> or `nothing`. **Option:** spec-update | exception | withdrawn. **Propagated:** files touched,
> or `none`.
>
> Quick scan with: `grep "^## \[" log.md | tail -10`

<!-- new entries go below this line -->

## [2026-09-23] feat | the gate is now testable, budgeted and documented

ref-004, feat-006..009. The hook that enforces every write had no tests while the ledger runner that
only reports had 36. `gate-check.test.mjs` is now the executable form of the "Which Gate Covers What"
table — one assertion per row — and it asserts fail-open as a deliberate property rather than leaving
it indistinguishable from a bug.

`budget-check.mjs` replaces unenforceable token targets with byte limits for the four always-load
files; the numbers live in the script and `housekeeping.md` points at them. `.gitattributes` pins LF
and a zero-CR gate makes the standard-gates table non-vacuous for the first time. `SETUP.md` is
canonical for setup with the gate verification as step 1.

Three tasks were verified through ledgers — the first real use of feat-001..005.

```
feat-007  G1 met 2026-09-23T07:35:00Z exit=0 digest=3b5f807a out="11 run, 11 passed"
feat-007  G2 met 2026-09-23T07:35:00Z exit=0 digest=fc1a658b out="budget-check: ok (4 file(s))"
feat-007  G3 met 2026-09-23T07:35:00Z exit=0 digest=d6cc9fb7 out="registered"
feat-008  G1 met 2026-09-23T07:35:51Z exit=0 digest=3fa1853e out="scanned"
feat-008  G2 met 2026-09-23T07:35:51Z exit=0 digest=f27e1086 out="CLAUDE.md: eol: lf"
feat-009  G1 met 2026-09-23T07:36:41Z exit=0 digest=abc0b415 out="11 run, 11 passed"
feat-009  G2 met 2026-09-23T07:36:41Z exit=0 digest=cdad3227 out="pointer only"
feat-009  G3 owed — MANUAL: owner runs SETUP.md against a fresh clone
```

**Owed:** feat-009 G3. Only the owner can run the template against a fresh clone; until then the
board row carries `gate-owed? yes`.

**Record error, fixed at source:** two commit SHAs on the board (`feat-006`, `ref-004`) were written
from memory rather than read from `git log`, and both were wrong. Caught by resolving every SHA on the
board with `git cat-file -t`. That check belongs in a gate, not in a habit — it is on the backlog.

**Plan deviation:** feat-007's G2 was planned as "an over-budget fixture is refused". A CHECK must
exit 0 to be met, so proving a refusal needs a wrapper that inverts the exit code and is not portable
across shells. The refusal is asserted in the test suite instead, and G2 became "every budgeted file
is within its limit". Same coverage, one fewer unportable command.

## [2026-09-23] fix | the linter refused the pattern its own doc recommends

bug-001. `^(\d+) run, \1 passed$` is the self-consistent EXPECT `.context/gates-ledger.md` tells you to
write, and the pinned-count rule read `\1 passed` as a hard-coded count — every correct test-lane gate
would have failed lint. Found by running the tool against a real ledger rather than only its fixtures;
36 unit tests were green at the time. The rule was fixed, not the doc.

## [2026-09-23] decision | the gate now covers its own implementation

**Decided:** `.claude/`, `CLAUDE.md` and `CONTEXT.md` join `src/`, `reference/` and `.context/` behind
the XML task gate. `STATE.md`, `TaskList.md` and `wiki/log.md` stay exempt.
**Contradicts:** nothing — it closes a hole rather than reversing a rule. `.claude/` was never listed,
which is how `gates.mjs`, `gate-check.mjs` and `settings.json` were all written this session without a task.
**Option:** spec-update
**Propagated:** `.claude/hooks/gate-check.mjs`, `.context/task-workflow.md`

Also decided: an owed manual gate stays non-blocking by default and `--strict` flips it, rather than
choosing one reading for every project. And `.context/task-workflow.md`'s token budget was re-based
600 → 1,200 because it holds canonical content that the One-Place Rule forbids moving — the budget was
wrong, not the file.

## [2026-09-23] feat | gate ledger: verification becomes evidence

feat-001..005. Ported the gate-ledger idea from dragon-ice-flow (upstream `771492b`), rewritten in
Node rather than PowerShell so it runs identically on every platform — the same reason `gate-check.mjs`
is Node. `gates/<task-id>.md` holds CHECK/EXPECT/EVIDENCE per gate; an EVIDENCE line carries the digest
of the CHECK+EXPECT it ran against, so editing either half of a met gate flips it to unmet with no
re-run. Nine linter rules refuse gates that cannot fail. 33 tests, no dependencies.

Also closed a gap that predates the port: `<assumptions>` in the XML task had no consumer. The verifier
now resolves every line as holds / violated / not code-verifiable, and a violated assumption routes to
the user rather than being repaired in place.

## [2026-09-23] decision | ledger threshold and where evidence lives

**Decided:** a ledger is required at "2+ gates or any manual gate"; below that the one-line `<verify>`
command stands. At close, EVIDENCE lines are pasted into the task's `wiki/log.md` entry and the ledger
is deleted.
**Contradicts:** nothing — `<verify>` previously had no threshold and no record of having run.
**Option:** spec-update
**Propagated:** `.context/gates-ledger.md`, `.context/task-workflow.md`, `.context/task-workflow-appendix.md`, `CLAUDE.md`, `gates/README.md`

Rejected: ledger-always (ceremony on one-line tasks is what makes people skip gates) and
ledger-optional (an optional gate is skipped exactly when the task is risky).

## [2026-08-28] decision | push directly to main — one-off exception

**Decided:** "option 2, exception this time"
**Contradicts:** `.context/rules.md:9` — "Never push directly to `main` / `master`."
**Option:** exception
**Propagated:** none — `main` pushed as-is for this session's 3 commits; the rule stays in force, future work should use a branch + PR.
