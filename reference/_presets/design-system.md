# Design System — preset

> **A preset, not this project's design system.** Not in force until copied to reference/design-system.md.
> Adopting it means copying this file to `reference/design-system.md` (a `reference/` write — it
> goes through the code gate in `.context/task-workflow.md`) and filling the rows from the real
> Figma file and codebase. Until then, workspaces treat the design system as absent.
>
> Structure only. Every value comes from the project; nothing here is a default to keep.
> Once adopted, the copy is the single map between Figma names and code names.

## Tokens

One row per token. Figma variable is the name as it appears in Figma; code name is what `src/`
uses. A value used in a frame but missing here is a decision to surface, not a hardcode.

### Color

*How to fill: one row per color variable; note the mode (light/dark) if it differs.*

| Figma variable | code name | value | note |
|---|---|---|---|
| | | | |

### Type

*How to fill: one row per text style; value = family / size / line-height / weight.*

| Figma variable | code name | value | note |
|---|---|---|---|
| | | | |

### Spacing

*How to fill: one row per step of the spacing scale.*

| Figma variable | code name | value | note |
|---|---|---|---|
| | | | |

### Radius

*How to fill: one row per corner-radius step.*

| Figma variable | code name | value | note |
|---|---|---|---|
| | | | |

## Components

*How to fill: one row per component built from a Figma node. States built = what the code
implements (default, hover, empty, error, loading …). States signed = the owner's manual-gate
sign-offs for those states, per `.context/gates-ledger.md`; owner + date, nobody else signs.*

| name | Figma node | code path | states built | states signed (owner + date) |
|---|---|---|---|---|
| | | | | |
