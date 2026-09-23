# CLAUDE.md

> Always loaded. The map of where things live in this project.

## Response Style

**Default: plain conversation.** Short sentences, no XML, minimal headers. Answer like a thoughtful colleague.

**Structure fires on intent.** A write action, or a decision being committed, switches to the XML task wrapper from `.context/task-workflow.md`. The gate is non-negotiable; the conversation around it stays light.

**Depth is opt-in.** "tell me more", "explain", "why", "walk me through it". Without those, give the short answer.

**Silent workspace loading.** Intent maps to a workspace (bug → debugging, feature → feature-development, Figma link → design-to-code, ingesting a doc → research). Load it silently; never announce it.

## Project Identity

- **Name:** [YOUR PROJECT NAME]
- **One-line purpose:** [What this project does in one sentence]
- **Stage:** [planning | prototype | MVP | production]
- **Primary stack:** [e.g., Next.js + TypeScript + Postgres]

## Folder Map

**Root files (always-load):** `CLAUDE.md` · `CONTEXT.md` · `STATE.md` · `TaskList.md`

**`.context/`** — canonical project rules: `identity.md` · `rules.md` · `glossary.md` · `task-workflow.md` (gate; always-load) · `task-workflow-appendix.md` · `subagent-delegation.md` (role routing + cost gate) · `gates-ledger.md` (verification format) · `housekeeping.md`

**`workspaces/`** — task-type contexts: `feature-development/`, `design-to-code/`, `design-authoring/`, `debugging/`, `refactoring/`, `planning/`, `research/`

**`skills/`** — on-demand thinking: `brainstorm/`

**`planning/`** — artifacts: `stories/`, `specs/`, `plans/` (each has `index.md`)

**`gates/`** — one verification ledger per task in flight; deleted at close

**`reference/`** — deep docs YOU wrote (loaded on demand)

**`raw/`** — immutable source documents (PDFs, transcripts, articles, Figma exports)

**`wiki/`** — LLM-maintained knowledge: `index.md`, `log.md`, `entities/`, `concepts/`, `sources/`

**`src/`** — your actual code. No architecture is hardcoded; layer/folder conventions are a per-project decision recorded in `reference/architecture/` (see `src/README.md`).

## Routing Rule

Read `CONTEXT.md` first; load only the workspace it names and the files that workspace points to.

**Never** load all of `reference/` or `wiki/` — start at `wiki/index.md` and drill in.

## Canonical Sources (the One-Place Rule)

Every fact lives in exactly one file. Other files point to it; they never copy it.

- Identity & voice → `.context/identity.md`
- Hard rules → `.context/rules.md`
- Domain terms → `.context/glossary.md`
- Project decisions, project-specific patterns → `reference/`
- Chosen architecture / folder conventions for `src/` (once decided) → `reference/architecture/`
- Design tokens, component inventory (once decided) → `reference/design-system.md`
- Verification format (gates, evidence, linter rules) → `.context/gates-ledger.md`
- Accumulated knowledge from external sources → `wiki/`

## Authority Boundary

Four content folders, in decreasing authority:

- **`.context/`** = absolute project rules. Highest.
- **`reference/`** = what YOU decided about THIS project.
- **`planning/`** = authoritative while `draft | approved | in-progress`; historical once `done`.
- **`wiki/`** = compiled from external sources. Informational only.

Reference beats wiki. Code beats a done planning artifact. Always surface the contradiction (`.context/rules.md`, non-negotiable 6).

## State vs Log Boundary

- `STATE.md` = how things ARE right now. No history. Overwrite freely.
- `TaskList.md` = work-in-flight. The kanban board.
- `wiki/log.md` = what HAPPENED, append-only, chronological.
- Never duplicate. A completed task moves from `TaskList.md` to `wiki/log.md`; it never lives in both.

## Naming Conventions

- Folders & markdown files: `kebab-case` · Task IDs: `TaskList.md` (canonical)
- Wiki pages: `wiki/{entities,concepts,sources}/[slug].md`
- Planning artifacts: one slug across story/spec/plan (`dashboard-export.md` in all three).

## When in Doubt

1. Re-read `CONTEXT.md`.
2. Ask the user before assuming.
3. Never duplicate information across files.
