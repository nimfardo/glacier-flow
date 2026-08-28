# Architecture

> Empty by design. This template doesn't hardcode a frontend architecture — different projects warrant different patterns (or none at all for a small prototype).

## When to Fill This In

The first time a real task asks "where does this file go?" and the answer isn't obvious, stop and decide — don't guess silently and don't pre-decide before a project has enough files for it to matter.

## How to Fill This In

1. Ask the user which pattern fits: Feature-Sliced Design, Atomic Design, the framework's own convention (e.g. Next.js App Router colocation), a simple `components/`+`lib/` split, or "no strong opinion, use your judgement."
2. Write it up as `reference/architecture/[pattern-name].md` — layers/folders, import rules, where domain vocabulary specific to the pattern lives (e.g. Layer/Slice/Segment for FSD, Atom/Molecule/Organism for Atomic Design). If `_presets/` already has the chosen pattern, copy it up instead of rewriting it.
3. This is a `reference/` write — it goes through the code gate in `.context/task-workflow.md` like any other.
4. Once written, `CLAUDE.md`, `.context/rules.md`, and the relevant workspaces should carry a one-line pointer here — never copy the content (one-place rule).

## Presets

`_presets/` holds ready-made write-ups for common patterns. They are **inert** — a file sitting there governs nothing. Adopting one means copying it up to `reference/architecture/` and adding the one-line pointers listed in its header. Currently shipped: Feature-Sliced Design.

## If the Project Never Needs This

Fine — plenty of small tools, scripts, and single-page prototypes don't need a named architecture. Leave this folder empty rather than filling it with a pattern nobody asked for.
