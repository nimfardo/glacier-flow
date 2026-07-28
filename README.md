# Glacier Flow — A General-Purpose Template for Claude Code

A general-purpose template combining three complementary patterns:

- **Folder-based routing** (ICM, Van Clief) — *how* the AI does work
- **Markdown knowledge base** (LLM Wiki, Karpathy) — *what* the AI knows
- **XML task gates** — *what* gets approved before any change
- **Spec-driven development** (story → spec → plan → build) — *how intent survives contact with implementation*

## Lineage

This template started as a fork of [dragon-ice-flow](https://github.com/niellune/dragon-ice-flow), then diverged in three ways:

1. **Architecture is pluggable, not hardcoded.** The original bakes in Feature-Sliced Design as a non-negotiable rule. This version ships `reference/architecture/` empty — you (or Claude, with your approval) document whatever pattern fits *this* project the first time it matters, or skip it entirely for non-frontend work.
2. **A `design-to-code` workspace was added.** Built for going from a Figma frame (or a screenshot, or "make it look like X") to working code — visual QA against the design, design tokens as the source of truth for values, and a Definition of Done that covers states (hover/empty/error/loading), not just the happy path.
3. **The write-gate hook is bash, not PowerShell.** `.claude/hooks/gate-check.sh` works on macOS/Linux out of the box.

The spec-driven development phasing (What → How → Task → Build) described in [intent-driven.dev's vibe-coding-vs-spec-driven-development](https://intent-driven.dev/blog/2025/12/15/vibe-coding-vs-spec-driven-development/) is already the shape of the `planning/` workspace here — story (what) → spec (how) → plan (task breakdown) → `feature-development`/`design-to-code` (build). Its core warning — *"specs and plans are not the goal, they are scaffolding"* — is enforced structurally: lightweight-story-by-default, full spec only when complexity earns it.

## Core Idea

Most templates make you learn commands. This one doesn't.

**Default: plain conversation.** You ask questions. Claude answers like a thoughtful colleague — short sentences, no XML, minimal ceremony. The workspace that fits your request gets loaded silently in the background.

**Structure fires on intent.** When you ask Claude to actually change something — "add a button", "fix this bug", "create the spec" — the XML task wrapper appears. The gate is real, and mechanically enforced by a hook (not just a convention Claude might forget). You approve, Claude executes. Otherwise, structure stays out of the way.

**Depth is opt-in.** Want more? Say "tell me more", "why", "explain", "details". Without those signals, Claude gives you the short answer.

## Folder Map

```
your-project/
│
├── CLAUDE.md              ← always loaded
├── CONTEXT.md             ← routing table
├── STATE.md               ← current state (now)
├── TaskList.md             ← active kanban board
│
├── .context/
│   ├── identity.md
│   ├── rules.md
│   ├── glossary.md
│   ├── task-workflow.md   ← code gate
│   ├── task-workflow-appendix.md
│   └── housekeeping.md
│
├── workspaces/            ← feature-development, design-to-code, debugging, refactoring, planning, research
├── skills/                ← brainstorm (and future skills)
├── planning/              ← stories, specs, plans (each with index.md)
├── reference/              ← deep docs YOU wrote, incl. architecture/ (empty until you decide)
│
├── raw/                   ← immutable sources
├── wiki/                  ← LLM-maintained knowledge (index, log, entities, concepts, sources)
│
└── src/                   ← your actual code
```

## The Flow

```
brainstorm (ephemeral)
    ↓ "let's plan this"
planning workspace
    ↓ produces story → spec? → plan
plan approved
    ↓ tasks move to TaskList.md ## Ready
feature-development / design-to-code workspace
    ↓ XML task gate → user approves → write code
shipped → TaskList.md ## Done + wiki/log.md
```

## First-Time Bootstrap (15–30 min)

### Step 1 — Set project identity (5 min)

Open `CLAUDE.md`. Fill the four lines: Name, One-line purpose, Stage, Primary stack.

### Step 2 — Fill `STATE.md` (10 min)

Current Focus, Architecture Snapshot, Stack & Versions, Environments. Skip Recently Shipped / Known Issues if empty.

### Step 3 — Set non-negotiables in `.context/rules.md` (5 min)

Top 4 rules are universal — keep them. Below that, fill in or **delete** sections that don't apply. Bracketed placeholders are prompts for you, not instructions for Claude.

### Step 4 — Fill `.context/identity.md` if user-facing (5 min)

Voice, tone, target user. Skip for internal tooling.

### Step 5 — Decide the architecture, once it matters

The first time a task needs to know "where does this file go?", answer it once in `reference/architecture/[pattern-name].md` (Feature-Sliced Design, Atomic Design, framework-default conventions — whatever fits). Don't pre-decide before you have a real file to place.

### Step 6 — Decide starting point

- Pre-code, fuzzy idea → use the planning workspace
- Concrete first feature → use feature-development
- Have a Figma file / mock to implement → use design-to-code
- Existing codebase → use research first to ingest key docs

### Step 7 — Start your first session

> "Read CLAUDE.md, CONTEXT.md, and STATE.md. Then tell me which workspace applies to: [my task]"

That's it.

## Day-to-Day Usage

Just describe what you need. Claude will pick the workspace silently. Examples:

| You say | What happens |
|---|---|
| "I want to add export to dashboards" | feature-development workspace, XML task proposed |
| "Implement this Figma frame" (link or screenshot) | design-to-code workspace, visual QA in the DoD |
| "There's a weird bug with login" | debugging workspace, diagnostic questions |
| "Let's think through options for caching" | brainstorm skill, divergent mode |
| "Let me write a story for export" | planning workspace, story format |
| "Ingest the file at raw/karpathy-llm-wiki.md" | research workspace, ingest gate |
| "What does the wiki say about caching?" | research workspace, query mode |

The structure is there when you need it; otherwise it's out of the way.

## Production Housekeeping

Real projects accumulate files. Without rules, the always-load budget grows and the wiki becomes noise. Run a housekeep pass periodically:

- **Weekly:** trim `STATE.md` + completed-task windows (5 min)
- **Monthly:** full housekeep — wiki lint, planning archive review, reference cleanup
- **Quarterly:** archive done planning artifacts to `planning/_archive/[year-quarter]/`

The full ruleset lives in `.context/housekeeping.md`. It's a *proposal* workflow — Claude lists what should be trimmed; you approve before anything moves.

## Core Principles

### Structure
1. **One-Place Rule.** Every fact lives in exactly one file.
2. **One-Way References.** A → B only, never bidirectional.
3. **Selective Section Loading.** Load the named section, not whole files.
4. **Routing is not work.** `CONTEXT.md` directs traffic; it doesn't contain answers.

### Knowledge
5. **`raw/` is immutable.** Source of truth; never modified.
6. **Compile once, query forever.** Don't re-read raw sources every time.
7. **Good answers compound.** File comparisons and analyses back as wiki pages.
8. **The LLM does maintenance.** Humans curate sources; Claude handles bookkeeping.

### Discipline
9. **The gate.** No writes to a gated surface without approval — `src/`/`reference/`/`.context/` need an XML task; `planning/` and `wiki/` have their own gates; task bookkeeping (`STATE.md`, `TaskList.md`, `wiki/log.md`) is exempt. Canonical table: `.context/task-workflow.md`. Reads are free. Enforced mechanically — see `.claude/hooks/gate-check.sh`.
10. **State vs Log.** `STATE.md` = now (overwrite). `wiki/log.md` = past (append). `TaskList.md` = in-flight.
11. **One task, one commit.** No opportunistic refactoring; no combined tasks.
12. **Architecture is earned, not assumed.** Don't decide `src/` structure until a real file needs a home; then write it down once in `reference/architecture/` and don't re-litigate it.

## Anti-Patterns

- ❌ Editing files in `raw/`
- ❌ Letting `wiki/index.md` grow stale
- ❌ Treating `wiki/` as authoritative for project decisions
- ❌ Loading the whole wiki instead of starting at `index.md`
- ❌ Dumping all docs into one `CLAUDE.md`
- ❌ Bidirectional references between docs
- ❌ Letting `STATE.md` accumulate resolved decisions and fixed bugs
- ❌ Using `reference/` as a dumping ground for general knowledge (that's `wiki/concepts/`)
- ❌ Skipping housekeeping because nothing feels broken (it never feels broken until it does)
- ❌ Guessing an architecture pattern and hardcoding it before the project needs one

## Works At Any Stage

- **Planning:** Folders as thinking tools. Optional: ingest 2–3 foundational sources.
- **Early prototype:** Minimal fill-in. Skip wiki.
- **MVP:** Full workspaces. Wiki grows as you research adjacent topics.
- **Production:** Both fully active. Wiki becomes the team's compounding memory.

## Further Reading

- Karpathy's LLM Wiki gist: gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- ICM paper: arXiv 2603.16021 (Van Clief & McDermott)
- Reference ICM repo: github.com/RinDig/Content-Agent-Routing-Promptbase
- Spec-driven development vs vibe coding: intent-driven.dev/blog/2025/12/15/vibe-coding-vs-spec-driven-development
- Original template this forked from: github.com/niellune/dragon-ice-flow

## License

MIT — see [LICENSE](LICENSE).
