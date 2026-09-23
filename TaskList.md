# TaskList.md

> The task board. Every XML task lives here from creation to completion.
>
> Status flow: `backlog` → `ready` → `in-progress` → `done`
> (Verification happens inside `in-progress`: run `<verify>` before moving to Done. Skip statuses freely — don't make work for yourself.)

## How to Use

- When the user approves an XML task, append it to `## Ready` with a generated ID.
- When you start work, move it to `## In Progress`.
- After running `<verify>` and committing, move it to `## Done` with the commit SHA.
- Notable outcomes (decisions, lessons) still get appended to `wiki/log.md`.

## ID Convention

`[prefix]-[number]` — incrementing per prefix. This is the canonical list for the whole template.

**Code work** (executed under code gate):
- `feat-001`, `feat-002`, ... feature-development
- `design-001`, `design-002`, ... design-to-code (Figma → implementation)
- `bug-001`, `bug-002`, ... debugging
- `ref-001`, `ref-002`, ... refactoring

**Research work** (executed under the ingest gate — no XML task; the ID just tracks the operation on this board):
- `res-001`, `res-002`, ... wiki ingests, lints, wiki structural changes. If a research operation also edits code (e.g. distilling into `reference/`), that edit gets its own code-gate task.

**Planning artifacts** (executed under planning gate):
- `story-001`, `story-002`, ... user stories in `planning/stories/`
- `spec-001`, `spec-002`, ... specs in `planning/specs/`
- `plan-001`, `plan-002`, ... plans in `planning/plans/`

When a story and its spec describe the same feature, reuse the slug (e.g. `dashboard-export`), not the number — numbers stay per-prefix.

---

## In Progress

*Active work. Should usually have exactly 1 item. More than 2 = drift.*


## Ready

*Approved XML tasks, not yet started. Pick from the top.*


## Backlog

*Ideas and unblocked work that hasn't been written as an XML task yet. Promote to Ready by writing the XML task and getting user approval.*

- [ ] plan #2 (records): reference/adr/, STATE NEXT ACTION, monthly wiki/log archive, grep-only history rule
- [ ] plan #3 (enforcement): budget-check.mjs, .gitattributes LF pin, SETUP.md with hook smoke tests

## Blocked

*Tasks that can't proceed. Note the blocker.*

- [ ] [task-id] — [one-line goal] — **blocked by:** [reason]

## Done

*Most recent at top. Trim to last ~20; older ones are findable via `wiki/log.md` + git history.*

- [x] ref-003 — trim CLAUDE.md, re-base the task-workflow token budget — `8a9ce99` *(2026-09-23)*
- [x] ref-002 — put `.claude/` + always-load root files behind the gate — `8587043` *(2026-09-23)*
- [x] ref-001 — `--strict` makes an owed gate blocking — `884dd2b` *(2026-09-23)*
- [x] bug-001 — pinned-count rule read a regex backreference as a count — `acd7da0` *(2026-09-23)*
- [x] feat-005 — assumption checklist + blinding lists in subagent-delegation.md — `32b8575` *(2026-09-23)*
- [x] feat-004 — wire the ledger into the gate (task format, scope table, closeout) — `005fb15` *(2026-09-23)*
- [x] feat-003 — gates.mjs: --run, --reverify, evidence, timeout, overflow — `eab5370` *(2026-09-23)*
- [x] feat-002 — gates.mjs: parser, --lint, --status + 25 tests — `cf2d66a` *(2026-09-23)*
- [x] feat-001 — gate ledger format doc (`.context/gates-ledger.md`) — `3740187` *(2026-09-23)*

---

*Last updated: 2026-09-23*
