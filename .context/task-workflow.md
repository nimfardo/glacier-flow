# XML Task Workflow

> The gate before any file write. Produces `<task>` (single) or `<plan>` (multi-task).

## The Gate

No `Edit`/`Write` on a gated surface before user approval of the matching gate (table below). Reads are free.

The gate fires whether the conversation has been plain or structured. If the conversation has been plain prose, the XML task still appears — Claude doesn't suppress the wrapper to keep the conversation "light." A brief plain intro before the XML is fine; the XML itself is non-negotiable.

## Which Gate Covers What

**This table is canonical.** Other files point here; they never restate scope.

| Surface | Gate | Defined in |
|---|---|---|
| `src/`, `reference/`, `.context/`, `.claude/` | `<task>` / `<plan>` | this file |
| `CLAUDE.md`, `CONTEXT.md` | `<task>` / `<plan>` | this file |
| Figma files (mutations via MCP/plugin tools) | `<task>` / `<plan>` | this file + `workspaces/design-authoring/CONTEXT.md` |
| `planning/` | `<planning-task>` | `workspaces/planning/CONTEXT.md` |
| `wiki/` (multi-page: ingest, lint fixes) | `<ingest>` | `workspaces/research/CONTEXT.md` |
| `wiki/` (single-page query filing) | One-line confirmation | `workspaces/research/CONTEXT.md` |
| `gates/` | **Covered** by the task whose verification it records — no gate of its own | `.context/gates-ledger.md` |
| `STATE.md`, `TaskList.md`, `wiki/log.md`, index files | **Exempt** — bookkeeping required by an already-approved task | — |

The exemption covers only the bookkeeping an approved task's checklist demands (board moves, state updates, log appends, index entries). It is not a side door for content changes.

`design-to-code` and `feature-development` both write to `src/` — same gate, same table row. `design-to-code` just starts from a Figma frame instead of a written spec; see `workspaces/design-to-code/CONTEXT.md`.

Figma mutations go through tool calls, not `Edit`/`Write`, so the hook (below) cannot intercept them — that row is enforced by convention only. Same wrapper, same approval; see `workspaces/design-authoring/CONTEXT.md`.

The `<brainstorm>` wrapper in `skills/brainstorm/SKILL.md` is a declaration, not a gate.

## Sequence

1. Restate the task if ambiguous. Surface gotchas *before* the XML.
2. Write the XML below.
3. Wait for approval ("yes" / "do it" / "approve"). Silence ≠ approval.
4. Execute one task. Verify. Commit. Move on.

## Format

```xml
<task>
  <goal>One sentence.</goal>
  <assumptions>What you're inferring. "none" if empty.</assumptions>
  <files>
    <read>...</read>
    <write>...</write>
  </files>
  <action>Exact instructions, baked-in decisions, what to avoid.</action>
  <verify>Runnable command that proves the goal, or: ledger gates/<id>.md — G1, G2</verify>
  <done>Definition of complete.</done>
</task>
```

`<verify>` takes either form. A single runnable command stands on its own; once a task has **two or
more gates, or any manual gate**, it becomes a ledger instead — format, lifecycle and linter rules in
`.context/gates-ledger.md`.

Multi-task:
```xml
<plan>
  <phase>name</phase>
  <task id="1">...</task>
  <task id="2" depends="1">...</task>
</plan>
```

## Core Rules

- One task at a time. Only touch files in `<write>`.
- No opportunistic refactoring.
- Failed task → fix before next.
- After: run `<verify>` — the inline command, or `--run` on the ledger. Commit (one task = one commit). If the task carried a ledger, paste its EVIDENCE lines into the task's `wiki/log.md` entry, name any owed or abandoned gate there, and delete `gates/<id>.md`. Then move to `TaskList.md ## Done` and update `STATE.md` if state changed.

## Enforcement (hook)

The code gate is enforced mechanically by a PreToolUse hook (`.claude/hooks/gate-check.mjs`, registered in `.claude/settings.json`): `Edit`/`Write` to a gated surface is blocked unless the sentinel file `.claude/gate-open` exists. The hook runs on Node so it behaves identically on macOS, Linux, and Windows.

Sentinel lifecycle:
1. User approves the XML task → create the sentinel: `echo approved > .claude/gate-open`
2. Execute the task, verify, commit.
3. Delete the sentinel: `rm .claude/gate-open` (`Remove-Item` on PowerShell). Never leave it open between tasks.

`.claude/` is gated because the hook, the ledger runner and the settings that register them *are* the
enforcement — a gate that cannot protect its own implementation is a convention, not a gate. The
sentinel is created with a shell redirect rather than `Edit`/`Write`, so opening the gate is never
blocked by the gate.

The sentinel is gitignored. If the hook blocks a write you believe is exempt, check the "Which Gate Covers What" table — bookkeeping files are outside the gated paths by design.

## More

Red flags, state-vs-log boundaries, when this doesn't apply, after-task checklist details → `.context/task-workflow-appendix.md` (load when needed).

Which role/model executes an approved task, and when to ask before spending on a bigger one → `.context/subagent-delegation.md` (load when executing).

Verification as a ledger of evidence — gate format, the 2-gate threshold, linter rules → `.context/gates-ledger.md` (load when a task crosses the threshold).
