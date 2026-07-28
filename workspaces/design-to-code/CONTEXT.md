# Design-to-Code Workspace

> Loaded when the "what" is a design artifact — a Figma frame/link, a screenshot, or "make it look like X" — rather than a written spec.
> Same code gate as `feature-development`. This workspace adds the discipline specific to translating a visual source into working UI: tokens over hardcoded values, states beyond the happy path, and verifying in a real browser instead of trusting the diff.

## Gate

Before any file write: follow `.context/task-workflow.md`. Same `<task>`/`<plan>` wrapper as `feature-development` — this workspace doesn't invent a new gate, it changes what goes in `<action>` and `<done>`.

## When to Use This Workspace

- The user shares a Figma URL, a screenshot, or an exported design file
- "Implement this design" / "build this screen" / "match the mock" / "make it look like [reference]"
- A visual regression bug where the fix is about appearance, not logic (cross-reference from `debugging`)

## When NOT to Use This Workspace

- The UI change is described in words with no visual source → `feature-development`
- The "what" isn't decided yet, even visually → `planning` or the `brainstorm` skill first
- Pure layout/logic refactor with no visual source involved → `refactoring`

## Prerequisite: Reading the Design

If the source is a Figma file, this project has Figma MCP tools available. **Load the `figma-design-to-code` skill before calling `get_design_context`** — it is a mandatory prerequisite for that tool and covers how to pull design context correctly. Don't hand-translate a screenshot when the real Figma file and its variables are reachable — get the actual values (spacing, color, type) from Figma rather than eyeballing a screenshot.

If the source is a screenshot or informal reference with no Figma file behind it, say so explicitly in the task's `<assumptions>` — measurements and colors are estimates, not ground truth.

## Process

1. **Pull design context.** Figma variables/tokens, component structure, and any listed states (hover, disabled, error, empty) if the file defines them.
2. **Reconcile with `reference/design-system.md`** (if it exists). New color/spacing/type values that aren't already tokens are a decision, not a detail — surface them to the user before hardcoding: "this frame uses a spacing value that isn't in the token set — add it as a token, or one-off?"
3. **Write the XML task** per `.context/task-workflow.md`. In `<action>`, name the design source (Figma link/node ID, or screenshot description) and which states are in scope.
4. **Get approval, then build.** Same rules as `feature-development`: smallest shippable slice, no scope creep.
5. **Visual QA in a real browser** before calling it done — per the project-wide rule that UI changes get checked in a running app, not just inferred from the diff. Compare side-by-side against the design source.
6. **Update `reference/design-system.md`** if a new token was introduced (separate write, still under this task if it's the same `<files><write>` list — don't silently expand scope).

## Definition of Done

- [ ] Matches the design source for the states it actually defines (don't invent pixel precision the source doesn't have)
- [ ] Every state the component can be in is implemented, not just the default frame: hover, focus, active, disabled, loading, error, empty — whichever apply. If Figma only shows the happy path, ask which states matter before shipping only that one.
- [ ] No hardcoded value that exists as a token in `reference/design-system.md` (color, spacing, radius, type scale)
- [ ] Keyboard-navigable: visible focus order, no keyboard traps
- [ ] Semantic HTML first; ARIA only where semantic HTML can't express the interaction
- [ ] Verified in an actual browser at the breakpoints the design specifies (or, absent breakpoint frames, flagged as an open question rather than guessed)
- [ ] Tests pass, no TypeScript/lint errors (same bar as `feature-development`)

## Files to Load

| Working on... | Load |
|---|---|
| Any design-to-code task | This file + `reference/design-system.md` (if it exists) |
| Where the new file goes | `reference/architecture/` (if it exists — see `CONTEXT.md`) |
| A component reused across the app | `reference/ui-patterns.md` (if it exists) |

## Anti-Patterns

- ❌ Hardcoding a hex/px value that already exists as a design token
- ❌ Shipping only the default/happy-path state because that's the only frame Figma showed
- ❌ Treating the Figma frame as pixel-perfect gospel over accessibility (e.g. low-contrast text because "that's what the design says" — flag it instead of silently shipping it)
- ❌ Calling it done from the diff alone, without opening it in a browser
- ❌ Re-deriving design values from a screenshot when the real Figma file with variables is available
