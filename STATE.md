# STATE.md

> **Current state**, not history. If it's an event (something that happened), it goes in `wiki/log.md`, not here. If it's the situation right now, it goes here.
>
> Updated by Claude after task completion. Should always reflect the project as it is *today*.

## Current Focus

Porting the useful parts of dragon-ice-flow's 2026-09 rewrite (upstream `771492b`) into glacier-flow,
in three plans. Plan #1 (verification: the gate ledger) shipped 2026-09-23. Plan #3 (enforcement) shipped
the same day, reordered around the untested hook. Plan #2 is reduced to ADRs and a STATE NEXT ACTION
line; its log-archive half is deferred until `wiki/log.md` has volume. The branch `feat-gate-ledger`
holds all of it and is unpushed.

*For the active task board (In Progress / Ready / Backlog / Done), see `TaskList.md` — don't duplicate it here.*

## Recently Shipped

*Last 5 completed tasks. Older ones live in `wiki/log.md`.*

- feat-009 — SETUP.md with gate verification as step 1 (2026-09-23)
- feat-008 — .gitattributes LF pin + zero-CR standard gate (2026-09-23)
- feat-007 — budget-check.mjs PostToolUse budget hook (2026-09-23)
- feat-006 — tests for gate-check.mjs (2026-09-23)
- ref-004 — shared test harness + run-all runner (2026-09-23)

## Known Issues

*Bugs, debts, and gotchas that are not yet tracked as tasks but should be remembered.*

- feat-009 G3 is owed: nobody has run this template against a fresh clone. Every gate built so far was
  verified against this repo, where `src/` is empty and there is no test lane — the ledger's most
  important job, pinning a real lane, has never run against one.
- The template's own board and log now carry glacier's development history, which a project copying the
  template would inherit. Upstream solved this by moving the product into a `starter/` folder.

## Open Decisions

*Choices that need to be made before relevant work can proceed. Move to `wiki/log.md` as `decision` once resolved.*

- Whether the design workspaces should default to `gates.mjs --strict` (owed gates blocking) rather
  than passing the flag per task. Decide once a real design task has run a ledger — not before.

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
