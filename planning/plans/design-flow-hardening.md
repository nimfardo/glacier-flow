# Plan: design-flow-hardening

## Goal

Glacier's design workflow has QA that no agent grades on its own work, reads Figma cheaply, and has
proved itself once on a real Figma frame. Nothing that works today regresses.

## Source

- No story or spec: template-internal work. The decomposition came from comparing dragon-ice-flow,
  Glacier Flow and ECC (conversation of 2026-10-14; comparison page "Three Flows, Side by Side").
- Read against: `workspaces/design-to-code/CONTEXT.md`, `workspaces/design-authoring/CONTEXT.md`,
  `.context/subagent-delegation.md`, `.context/gates-ledger.md`, `STATE.md` Open Decisions,
  `TaskList.md` Backlog (plan #2 next-action half, dogfood item).

## What already exists (do not rebuild)

- The verifier is already blinded by file (`subagent-delegation.md` → Blinding). ECC's
  "fresh-context reviewer" is covered for verification. The gap is only visual QA, which the
  delegation table still routes to the **implementer**.
- design-authoring already has staged builds, fonts-before-text, verify-by-property-read and a
  Known Failure Patterns table.

## No-regression gates (every task carries these)

Baseline recorded 2026-10-14 on `42d77ac`: test lane `70 run, 70 passed`, `budget-check: ok (4 file(s))`.

| Gate | CHECK | EXPECT |
|---|---|---|
| R1 test lane | `node .claude/scripts/tests/run-all.mjs` (last line) | `(\d+) run, \1 passed` |
| R2 budgets | `node .claude/hooks/budget-check.mjs --all` | `^budget-check: ok` |
| R3 zero CR | standard gate in `.context/gates-ledger.md` | `^scanned$` |
| R4 ledger lint | `node .claude/scripts/gates.mjs --lint gates/<id>.md` | the clean line |

A task that turns R1–R3 red is not done, even if its own gates are green. Two failed implementation
attempts mean stop and ask (`subagent-delegation.md`).

## Figma boundary

File: CortiPix — `https://www.figma.com/design/fOVgrYGpoGPYXh0F4CGCpf/CortiPix?node-id=96-7550`.
**Read-only for this whole plan.** No task mutates Figma. design-authoring rules are edited as text
only (A3, B1 pointers); nothing is pushed to the file. C1 reads node `96:7550` and writes code.

## Task Sequence

```xml
<plan>
  <phase>A · design quality</phase>
  <task id="feat-010">
    <goal>Visual QA runs in a blinded visual-reviewer role, not by the implementer who built it.</goal>
    <files>
      <read>.context/subagent-delegation.md, workspaces/design-to-code/CONTEXT.md, workspaces/design-authoring/CONTEXT.md</read>
      <write>.context/subagent-delegation.md, workspaces/design-to-code/CONTEXT.md (Process step 5), workspaces/design-authoring/CONTEXT.md (Process step 5)</write>
    </files>
    <action>Role Routing: Visual QA row → "Visual reviewer subagent". Blinding table: new row — Reads: Figma frame/node, screenshots of the build per in-scope state, the states list from the task; Never opens: the implementer's notes or diff reasoning. Both workspaces' QA step points to this role (one place: the role is defined only in subagent-delegation.md). Default tier unchanged (cost gate applies).</action>
    <verify>ledger gates/feat-010.md — G1 role row present, G2 blinding row present, G3 both workspaces point to it and do not restate it, R1–R4</verify>
  </task>
  <task id="feat-011" depends="feat-010">
    <goal>A project can start reference/design-system.md from a ready skeleton instead of a blank file.</goal>
    <files>
      <read>reference/index.md, reference/architecture/_presets/ (convention), workspaces/design-to-code/CONTEXT.md</read>
      <write>reference/_presets/design-system.md, reference/index.md (one line)</write>
    </files>
    <action>Skeleton only, no invented values: Tokens (color, type, spacing, radius — each with Figma variable name ↔ code name), Components table (name · Figma node · code path · states built · states signed). Inert like _presets: workspaces still say "if reference/design-system.md exists".</action>
    <verify>ledger gates/feat-011.md — G1 skeleton has both sections, G2 index line resolves to the file, G3 no workspace treats the template as the live file, R1–R4</verify>
  </task>
  <task id="feat-012">
    <goal>design-to-code collects its recurring failures the way design-authoring already does.</goal>
    <files>
      <read>workspaces/design-authoring/CONTEXT.md (Known Failure Patterns)</read>
      <write>workspaces/design-to-code/CONTEXT.md</write>
    </files>
    <action>Add "Known Failure Patterns" (symptom → likely cause, append when it bites twice). Seed only with failures this workspace already names in its Anti-Patterns, nothing invented.</action>
    <verify>ledger gates/feat-012.md — G1 section exists with ≥1 seeded row traceable to an existing anti-pattern, R1–R4</verify>
  </task>

  <phase>B · tokens</phase>
  <task id="feat-013">
    <goal>Reading Figma costs the fewest tokens that still give real values.</goal>
    <files>
      <read>workspaces/design-to-code/CONTEXT.md, workspaces/design-authoring/CONTEXT.md, reference/toolbox.md</read>
      <write>workspaces/design-to-code/CONTEXT.md (new section "Reading Figma Cheaply"), workspaces/design-authoring/CONTEXT.md (one pointer line)</write>
    </files>
    <action>Rules: one node per task, never the whole file; metadata before full design context; values already in reference/design-system.md are reused, not re-pulled; screenshots only for final visual QA. Defined once in design-to-code; design-authoring links to it.</action>
    <verify>ledger gates/feat-013.md — G1 section present, G2 authoring links rather than copies, R1–R4 (R2 matters: workspace files are not budgeted, always-load files must stay green)</verify>
  </task>
  <task id="feat-014">
    <goal>A fresh session can resume from STATE.md alone, so unrelated tasks don't drag old context.</goal>
    <files>
      <read>STATE.md, .context/task-workflow-appendix.md, .claude/hooks/budget-check.mjs (STATE.md budget)</read>
      <write>STATE.md (add "Next Action" one-liner section), .context/task-workflow-appendix.md (after-task: unrelated next task → new session)</write>
    </files>
    <action>Absorbs the "STATE NEXT ACTION" half of backlogged plan #2; the board line is updated to say so. STATE.md must stay inside its byte budget — trim, never raise the budget.</action>
    <verify>ledger gates/feat-014.md — G1 Next Action section exists and is one line, G2 appendix rule present, R1–R4</verify>
  </task>

  <phase>C · prove it</phase>
  <task id="feat-015" depends="feat-010,feat-011,feat-012,feat-013,feat-014">
    <goal>One real Figma → code task runs end to end on CortiPix node 96:7550 under the new rules.</goal>
    <files>
      <read>Figma node 96:7550 (read-only), the five workspace/rule files above</read>
      <write>decided at task time — see Open Questions</write>
    </files>
    <action>Fresh clone of the template (also discharges feat-009 G3). Run design-to-code: cheap Figma read, tokens into design-system.md, build, blinded visual review, manual state gates signed by the owner, gates.mjs --strict. Afterwards: resolve STATE Open Decision on --strict for design workspaces, record token/agent cost observed.</action>
    <verify>ledger gates/feat-015.md — runnable gates per stack + manual state gates (owner: Max) + R1–R4 on the template repo</verify>
  </task>
</plan>
```

## Open Questions

- **feat-015 code target.** Where does the code for node 96:7550 live: an existing CortiPix repo, or
  `src/` in a fresh template clone? And which stack? Blocks feat-015 only; A and B proceed.

## Risks

- **Doc edits drift into duplication.** Mitigation: each task's G-gate checks "points to, does not
  restate" (one-place rule).
- **STATE.md over budget after feat-014.** Mitigation: R2 runs on every task; trim content, never the
  budget.
- **Figma accidentally mutated.** Mitigation: no task in this plan calls a Figma write tool; C1 is
  design-to-code (reads only). The Figma gate is convention-only, so this line is the guard.
- **Verifier and visual reviewer overlap.** Mitigation: verifier checks gates and diff; visual
  reviewer checks pixels and states. Different inputs, written in the blinding table.

## Out of Scope

- ECC's skill library, multi-harness adapters, and auto-learning memory.
- A "failed-before" baseline mode in `gates.mjs` (stays in Backlog; code-oriented).
- The log-archive half of plan #2 (still deferred until `wiki/log.md` has volume).

## Status

approved
