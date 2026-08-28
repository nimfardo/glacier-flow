# Design-Authoring Workspace

> Loaded when the deliverable lives *in Figma* — the reverse direction of `design-to-code`. Building or editing designs, components, variables/tokens, or whole screens in a Figma file, whether the source is code, a spec, or a description.
> A Figma file is a production surface: mutations are outward-facing, shared with the whole team, and often hard to undo. This workspace applies the same task gate as code, plus the Plugin API discipline that keeps scripted edits from failing silently.

## Gate

Before any Figma mutation: follow `.context/task-workflow.md`. Same `<task>`/`<plan>` wrapper as `feature-development` — see the "Which Gate Covers What" table.

**The hook can't enforce this one.** `gate-check.mjs` intercepts `Edit`/`Write` file calls; Figma mutations happen through MCP tool calls it never sees. The gate here is convention, which makes it *more* important to honor, not less — there is no mechanical backstop. Reads (screenshots, metadata, design context, variable dumps) are free, same as file reads.

## When to Use This Workspace

- "Push this to Figma" / "build this screen in Figma" / "create this component" / "update the Figma file to match the code"
- Building or extending a design system in Figma: variables, tokens, component libraries, variant sets
- Batch edits across a Figma file: renames, rebinds, restructures, content sweeps

## When NOT to Use This Workspace

- Reading a Figma design to produce code → `design-to-code`
- The design itself isn't decided yet → `planning` or the `brainstorm` skill first
- One-off manual tweak the user will do by hand — this workspace is for *scripted/agent* authoring

## Tooling

Prefer the official Figma MCP server if it's connected: `use_figma` executes Plugin API JavaScript in the open file. **Load the `figma-use` skill before every `use_figma` call** — it is a mandatory prerequisite. For building full screens or design systems, also load `figma-generate-design` or `figma-generate-library` respectively.

If no Figma MCP is available, a lightweight alternative is a local WebSocket bridge to a development plugin — see [figmosha2](https://github.com/denysosadchyi/figmosha2) (~500 lines of Python, one dependency, 5–30ms round-trips). Caveats: it binds to the currently open file, dies on file switch, and executes arbitrary JS via eval — a local dev tool, not team infrastructure.

Either way, the rules below are Plugin API rules — they apply regardless of transport.

## Plugin API Rules

Hard-won; each one is a silent failure if ignored.

1. **Async everything.** Under `dynamic-page` document access, node lookups, component imports, and variable resolution are all `await`-only. Sync accessors on non-current pages throw — `await figma.loadAllPagesAsync()` first if you must sweep the file.
2. **Auto-layout property order.** Append to tree → set `layoutMode` → resize → sizing modes → spacing/padding. Properties set before `layoutMode` are silently discarded.
3. **Fonts before text.** Before editing any text node, collect the unique fonts in the target subtree (dedupe by family+style), load them in parallel with `Promise.all(loadFontAsync…)`, then edit. Guard for mixed-font nodes: `typeof node.fontName === "symbol"` means per-range fonts — handle or skip explicitly.
4. **Frozen arrays.** `fills`, `strokes`, `effects` are frozen. Clone (`JSON.parse(JSON.stringify(node.fills))` or spread), mutate the clone, reassign.
5. **Stage complex builds.** For component sets with many variants and variable bindings: build the structure with hardcoded values first, then bind variables in a second pass by traversing named nodes. Verify each stage before starting the next — a monolithic script that dies mid-way leaves the file half-mutated.
6. **Batch mutations per script.** Each round-trip has fixed overhead; per-node calls in a loop from outside are 10–100× slower than one script that loops inside.

## Verify With Data, Not Screenshots

After a mutation, prove it with property reads — `(await figma.getNodeByIdAsync(id)).width`, a variable's `resolvedType`, a child count — not by exporting an image and eyeballing it. Screenshots are for the *final* visual QA pass on user-visible work, not per-step confirmation. API reads are faster, unambiguous, and catch the silent failures above.

## Known Failure Patterns

Recognized symptom → likely cause. **Append to this list whenever the same failure bites twice** — this section is the designated home for accumulated Figma gotchas, so they stop living in one person's (or one agent's) memory.

| Symptom | Likely cause / fix |
|---|---|
| Text edit silently no-ops | Font not loaded, or mixed-font node — see rule 3 |
| Auto-layout properties "didn't take" | Set before `layoutMode` — see rule 2 |
| "Cannot add property" / assignment throws on fills | Frozen array — see rule 4 |
| Sync error touching another page | `dynamic-page` access — `loadAllPagesAsync()` or async lookups |
| Script timed out, but the file changed anyway | Mutations before the timeout **persisted**. Read current state before re-running; a blind retry duplicates work |
| Long text (e.g. component descriptions) corrupts on write-back | Escaping mangles on round-trip — re-read after write and compare before trusting it |
| Bulk instance edits crawl | Per-instance writes cost ~0.1s+ each — batch inside one script (rule 6) |

## Process

1. **Load the prerequisite skill** (`figma-use`, plus `figma-generate-design`/`figma-generate-library` if applicable).
2. **Discover before creating.** Read the file's existing components, variables, and naming first. The one-place rule applies to design files too: reuse the existing token/component; never create a parallel one.
3. **Write the XML task** per `.context/task-workflow.md`. In `<action>`, name the target file/page/node IDs and the mutations; in `<verify>`, name the property reads that prove each stage.
4. **Get approval, then execute in stages** — structure, then bindings, then content — verifying each stage with reads before the next.
5. **Final visual QA** with a screenshot for anything user-visible.
6. **Update `reference/design-system.md`** (if it exists) when new tokens or components were introduced — same rule as `design-to-code`, opposite direction.

## Definition of Done

- [ ] Every mutation verified by a property read, not assumed from "the script didn't error"
- [ ] No duplicate of a component, style, or variable that already existed in the file or its libraries
- [ ] New nodes follow the file's existing naming conventions
- [ ] Variable bindings used where the file has tokens — no hardcoded value that exists as a variable
- [ ] Screenshot QA done for user-visible results
- [ ] `reference/design-system.md` updated if the token/component inventory changed

## Files to Load

| Working on... | Load |
|---|---|
| Any design-authoring task | This file + the `figma-use` skill |
| Full screens / flows | + `figma-generate-design` skill |
| Design system / component library | + `figma-generate-library` skill + `reference/design-system.md` (if it exists) |

## Anti-Patterns

- ❌ Mutating a Figma file without an approved task because "the hook didn't block it"
- ❌ Verifying with screenshot exports at every step instead of property reads
- ❌ One giant script for a multi-stage build, with no per-stage verification
- ❌ Re-running a timed-out script without first reading what already persisted
- ❌ Creating a new style/variable/component when the file or its library already has one
- ❌ Setting auto-layout properties before `layoutMode` and trusting the silence
