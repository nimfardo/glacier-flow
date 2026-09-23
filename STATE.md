# STATE.md

> **Current state**, not history. If it's an event (something that happened), it goes in `wiki/log.md`, not here. If it's the situation right now, it goes here.
>
> Updated by Claude after task completion. Should always reflect the project as it is *today*.

## Current Focus

Porting the useful parts of dragon-ice-flow's 2026-09 rewrite (upstream `771492b`) into glacier-flow,
in three plans. Plan #1 (verification: the gate ledger) shipped 2026-09-23. Plans #2 (records: ADRs,
log archive) and #3 (enforcement: budget hook, SETUP.md) are in the backlog, not started.

*For the active task board (In Progress / Ready / Backlog / Done), see `TaskList.md` — don't duplicate it here.*

## Recently Shipped

*Last 5 completed tasks. Older ones live in `wiki/log.md`.*

- feat-005 — assumption checklist + blinding lists in subagent-delegation.md (2026-09-23)
- feat-004 — wire the ledger into the gate (2026-09-23)
- feat-003 — gates.mjs --run / --reverify (2026-09-23)
- feat-002 — gates.mjs parser, --lint, --status (2026-09-23)
- feat-001 — gate ledger format doc (2026-09-23)

## Known Issues

*Bugs, debts, and gotchas that are not yet tracked as tasks but should be remembered.*

- `CLAUDE.md` (4,929 b) and `.context/task-workflow.md` (4,840 b) are both over the hard limits in
  `.context/housekeeping.md`, and were before feat-004 touched them. Every session pays for it. Fix is
  either a trim or a re-base of the budgets — it is a decision, so it is in the backlog, not silently applied.
- The template's own board and log now carry glacier's development history, which a project copying the
  template would inherit. Upstream solved this by moving the product into a `starter/` folder.

## Open Decisions

*Choices that need to be made before relevant work can proceed. Move to `wiki/log.md` as `decision` once resolved.*

- `gates.mjs --status` exits 0 while a manual gate is owed (tracked, not failed), matching
  `.context/gates-ledger.md`. For a design-heavy template the stricter reading — owed blocks a clean
  status — may be the right one. Blocks nothing today; decide before the first design task uses a ledger.

## Architecture Snapshot

*One-paragraph current shape of the system. Update when something structural changes.*

[Current architecture in plain prose. E.g.: "Next.js app router on Vercel. Postgres via Neon. Auth through Clerk. Background jobs on Inngest. No queue yet — added if/when needed."]

## Stack & Versions

*Pinned versions that matter. Update on dependency changes.*

- [language/runtime]: [version]
- [framework]: [version]
- [key library]: [version]

## Environments

- **Dev:** [where, who has access]
- **Staging:** [or "none"]
- **Prod:** [or "none yet"]

---

*Last updated: [YYYY-MM-DD] by [task-id or "manual"]*
