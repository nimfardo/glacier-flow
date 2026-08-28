# Toolbox

> What optional tools/integrations this project has available, and the fallback to use when
> one doesn't. Consulted before any workspace assumes a tool exists — e.g. `design-to-code`
> checking whether Figma MCP tools are actually connected this session before relying on them.

Status values — three, no others:

| Status | Meaning |
|---|---|
| `active` | verified available this session — use it |
| `fallback` | not in use (declined, unavailable, or failed) — use the fallback column, and say so in whatever artifact you produce |
| `[?]` | not yet checked — treat as `fallback` until someone checks |

## Tools

| Purpose | Tool | Fallback | Status |
|---|---|---|---|
| Figma design source | Figma MCP | Hand-described screenshot, flagged as an estimate in the task's `<assumptions>` | `[?]` |

Add a row per optional tool/integration as the project adopts one. **Delete this file** if the
project has no optional tool dependency worth tracking — an unfilled table reads as an
instruction to invent one, not as a real record.
