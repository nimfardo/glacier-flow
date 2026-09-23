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
