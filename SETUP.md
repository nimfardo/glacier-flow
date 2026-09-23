# Setup Guide

> One-time setup for a new project built on this template. 15–30 minutes.
>
> **Canonical for setup.** `README.md` points here and does not repeat these steps.

## Step 0 — Get the template

Copy the repository as the root of your new project, then start your own git history:

```
git init
git add -A
git commit -m "Bootstrap from Glacier Flow"
```

Keep the hidden files. `.claude/` holds the hooks; `.gitignore` excludes the gate sentinel
(`.claude/gate-open`); `.gitattributes` pins LF so a file committed from Windows doesn't arrive with
CRLF for everyone else.

**Prerequisite:** Node 18 or newer, and nothing else. The hooks and scripts have no dependencies.

## Step 1 — Verify the gate blocks (3 min)

**Do not skip this.** `gate-check.mjs` fails open by design — on a malformed payload or a resolution
error it allows the write, because a broken hook should never be the reason a legitimate change is
stuck. The cost of that choice is that a broken hook is *invisible*. It never announces itself; writes
simply stop being gated, and you carry on believing they aren't.

Three checks, in order:

```
node .claude/scripts/tests/run-all.mjs
```

Every suite passes: `N run, N passed`, exit 0. This covers the gate hook, the budget hook and the
ledger runner.

```
node .claude/hooks/budget-check.mjs --all
```

Prints `budget-check: ok (4 file(s))`. This is the same refusal Claude sees when an always-load file
grows past its limit.

Then the real thing. Open the project in Claude Code, approve the hooks when prompted, and ask Claude
to make a trivial edit to a file under `src/` **without** approving an XML task. The write must be
**blocked** with a `Gate closed` message. If it isn't:

- confirm `.claude/settings.json` exists and hasn't been renamed
- confirm the hooks were approved in Claude Code
- check for a stale `.claude/gate-open` — a leftover sentinel means the gate is silently open

**Sentinel lifecycle** (Claude manages this, but recognize it): you approve an XML task →
`.claude/gate-open` is created → the task runs and commits → the sentinel is deleted. A sentinel left
behind between tasks is the one failure mode that leaves no trace.

## Step 2 — Project identity (5 min)

Open `CLAUDE.md` and fill the four lines under **Project Identity**: Name, one-line purpose, Stage,
Primary stack.

## Step 3 — Fill `STATE.md` (10 min)

Current Focus, Architecture Snapshot, Stack & Versions, Environments. Skip Recently Shipped and Known
Issues while they're empty. `STATE.md` is overwrite-freely — don't polish it.

## Step 4 — Non-negotiables in `.context/rules.md` (5 min)

The numbered rules at the top are universal — keep them. Below that, fill in or **delete** the sections
that don't apply. Bracketed placeholders are prompts for you, not instructions for Claude; an empty
bracket left behind reads as an instruction to invent something.

## Step 5 — `.context/identity.md`, if user-facing (5 min)

Voice, tone, target user. Skip entirely for internal tooling.

## Step 6 — Fill the standard gates, once you have a stack

`.context/gates-ledger.md` ships with its test, lint and format slots empty, because a gate pointing at
a command that doesn't exist passes vacuously. Fill them the first time you have a real lane, and
record the choice in `STATE.md` → Stack & Versions.

## Step 7 — Decide the architecture, once it matters

The first time a task needs to know *where does this file go?*, answer it once in
`reference/architecture/[pattern-name].md` — Feature-Sliced Design, Atomic Design, framework defaults,
whatever fits. An inert FSD preset sits in `reference/architecture/_presets/`. Don't pre-decide before
you have a real file to place.

## Step 8 — Decide your starting point

- Pre-code, fuzzy idea → **planning** workspace
- Concrete first feature → **feature-development**
- A Figma file or mock to implement → **design-to-code**
- Existing codebase → **research** first, to ingest key docs

## Step 9 — First session

Start with:

> "Read CLAUDE.md, CONTEXT.md, and STATE.md. Then tell me which workspace applies to: [my task]"

Sanity checks on the first real task: the XML `<task>` wrapper appears before any write to a gated
surface, and after your approval and the commit the task lands in `TaskList.md ## Done`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Hook never fires | `.claude/settings.json` missing or renamed, or hooks not approved in Claude Code |
| Writes succeed with no approved task | Stale `.claude/gate-open` — delete it |
| Gate blocks a file you believe is exempt | Check the "Which Gate Covers What" table in `.context/task-workflow.md`; only `STATE.md`, `TaskList.md`, `wiki/log.md` and index files are exempt, and only for bookkeeping |
| A write is refused as over budget | Trim the row, not the rule. Limits live in `.claude/hooks/budget-check.mjs` |
| A gate won't go green | `node .claude/scripts/gates.mjs --status gates/<id>.md` says why. "digest mismatch" means the CHECK or EXPECT was edited after the run |
| Claude loads whole folders | Re-point it at the Routing Rule in `CLAUDE.md`; loading is per-file, per-section by design |
