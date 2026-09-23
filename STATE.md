# STATE.md

> **Current state**, not history. If it's an event (something that happened), it goes in `wiki/log.md`, not here. If it's the situation right now, it goes here.
>
> Updated by Claude after task completion. Should always reflect the project as it is *today*.

## Current Focus

Porting the useful parts of dragon-ice-flow's 2026-09 rewrite (upstream `771492b`) into glacier-flow,
in three plans. Plan #1 (verification: the gate ledger) shipped 2026-09-23. Plans #2 (records: ADRs,
log archive) and #3 (enforcement: budget hook, SETUP.md) are in the backlog, not started. The branch
`feat-gate-ledger` is complete and unpushed.

*For the active task board (In Progress / Ready / Backlog / Done), see `TaskList.md` — don't duplicate it here.*

## Recently Shipped

*Last 5 completed tasks. Older ones live in `wiki/log.md`.*

- ref-003 — trim CLAUDE.md, re-base the task-workflow token budget (2026-09-23)
- ref-002 — `.claude/` + always-load root files behind the gate (2026-09-23)
- ref-001 — `--strict` makes an owed gate blocking (2026-09-23)
- bug-001 — pinned-count rule read a backreference as a count (2026-09-23)
- feat-005 — assumption checklist + blinding lists (2026-09-23)

## Known Issues

*Bugs, debts, and gotchas that are not yet tracked as tasks but should be remembered.*

- The always-load set sits at roughly its re-based 5,500-token limit (21.4 KB across six files). Byte
  counts are exact; the token figure is an estimate — there is no tokenizer in the repo, so a real
  measurement is owed before the next re-base.
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
