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
- Revision 2026-10-15: GitHub research (figma/mcp-server-guide, GLips/Figma-Context-MCP,
  awdr74100/figwright, obra/superpowers, pedrohcgs/claude-code-my-workflow, github/spec-kit,
  bmad-code-org/BMAD-METHOD), each idea checked against Glacier's constraints before inclusion.
  Added feat-016…020; widened feat-013 and feat-014.

## Constraints every new task respects

- **Node 18, zero dependencies** (`SETUP.md`). No npm packages, no Python. Borrowed scripts are
  rewritten in Node, not copied.
- **`CLAUDE.md` has ~400 bytes of headroom** (4201 / 4608). Nothing in this plan adds to it.
- **Hooks are gated (`.claude/`) and tested.** Every new hook ships with a failing-first test in the
  zero-dependency harness.
- **Delegation rules win over imports.** Two implement attempts then ask; never a silent tier upgrade;
  blinding is by file. Anything borrowed that contradicts these is left out
  (`.context/rules.md` non-negotiable 6).
- **Scratch goes in `tmp/`** (gitignored, ungated). Never in `gates/` (ledgers only) or `reference/`
  (would become a second, stale source of truth).
- **Optional tools are rows in `reference/toolbox.md` with a fallback**, never a hard dependency:
  template adopters may not have Figma-Context-MCP or the Figma plugin skills.

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
      <write>workspaces/design-to-code/CONTEXT.md (new section "Reading Figma Cheaply"), workspaces/design-authoring/CONTEXT.md (one pointer line), reference/toolbox.md (rows: Figma-Context-MCP, Figma plugin skills — status [?], with fallback)</write>
    </files>
    <action>Rules: one read-only file inventory per session (pages, variable collections + modes, component sets, styles), cached in tmp/ and valid for that session only; then one node per task at limited depth, never the whole file; metadata before full design context; values already in reference/design-system.md are reused, not re-pulled; screenshots only for final visual QA. Defined once in design-to-code; design-authoring links to it. Source: figma/mcp-server-guide inspectFileStructure.js, Figma-Context-MCP depth + globalVars.</action>
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
  <task id="feat-016" depends="feat-014">
    <goal>The Next Action survives compaction and new sessions without the user re-explaining.</goal>
    <files>
      <read>.claude/settings.json, .claude/hooks/*.mjs, .claude/scripts/tests/harness.mjs, STATE.md</read>
      <write>.claude/hooks/handoff.mjs, .claude/settings.json (PreCompact + SessionStart compact|resume), .claude/scripts/tests/handoff.test.mjs</write>
    </files>
    <action>Node port of the idea in pedrohcgs/claude-code-my-workflow (pre-compact / post-compact-restore). PreCompact records the in-progress task id + STATE Next Action into tmp/; SessionStart (compact|resume only) injects at most ~5 lines. PRECONDITION, checked first and recorded in the ledger: SessionStart does not fire inside subagents; if it does, the hook must no-op there, or blinding breaks. Hook failure never blocks a session (exit 0 on error).</action>
    <verify>ledger gates/feat-016.md — G1 restore output ≤5 lines, G2 no-op without a checkpoint, G3 subagent precondition evidenced, G4 failing-first test, R1–R4</verify>
  </task>
  <task id="feat-017">
    <goal>Subagents get their task as a file, so the orchestrator stops paying to paste it and a compaction cannot lose progress.</goal>
    <files>
      <read>.context/subagent-delegation.md</read>
      <write>.context/subagent-delegation.md (Sequence per Approved Task)</write>
    </files>
    <action>From obra/superpowers subagent-driven-development: brief = the XML task verbatim written to tmp/briefs/<id>.md; progress = tmp/progress.md with "<id>: complete" lines read before dispatching. Briefs never carry implementer notes (blinding). NOT imported: its 5 fix rounds and round-4 model upgrade — Glacier keeps two attempts then ask, and the cost gate.</action>
    <verify>ledger gates/feat-017.md — G1 brief + progress rule present, G2 two-attempt rule and cost gate text unchanged, R1–R4</verify>
  </task>

  <phase>D · design depth</phase>
  <task id="feat-018">
    <goal>A multi-step Figma build can be resumed or undone without touching the user's own nodes.</goal>
    <files>
      <read>workspaces/design-authoring/CONTEXT.md</read>
      <write>workspaces/design-authoring/CONTEXT.md (Plugin API rules + Known Failure Patterns)</write>
    </files>
    <action>From figma/mcp-server-guide error-recovery.md: keep a created-IDs list per build (in tmp/, named for the task); check it before creating; rerun is idempotent; rollback deletes by exact ID only, never by name prefix, and only after an explicit yes (a Figma deletion is treated like a file deletion, non-negotiable 3). Route to the figma plugin skills via reference/toolbox.md, not as a hard dependency. Text only; no Figma call in this task.</action>
    <verify>ledger gates/feat-018.md — G1 ledger + exact-ID rollback rule present, G2 rollback requires confirmation, G3 no name-prefix cleanup advised, R1–R4</verify>
  </task>
  <task id="feat-019" depends="feat-011">
    <goal>Figma → code reads a confirmed mapping first and treats guesses as guesses.</goal>
    <files>
      <read>reference/_presets/design-system.md, workspaces/design-to-code/CONTEXT.md</read>
      <write>reference/_presets/design-system.md, workspaces/design-to-code/CONTEXT.md (Process step 2, one line)</write>
    </files>
    <action>From awdr74100/figwright figma-codegen: add a status column (confirmed / likely / guess / unmapped) and "ambiguous with" to the token and component tables; rule: a value-only match is a guess, and a semantically wrong token is worse than a raw value. Rules only — no figwright server or plugin.</action>
    <verify>ledger gates/feat-019.md — G1 status column in both tables, G2 guess rule present in one place only, R1–R4</verify>
  </task>
  <task id="feat-020">
    <goal>Missing design states are caught in planning, before any Figma or code work.</goal>
    <files>
      <read>workspaces/planning/CONTEXT.md, planning/stories/_template-full.md</read>
      <write>workspaces/planning/CONTEXT.md, planning/stories/_template-full.md</write>
    </files>
    <action>From github/spec-kit checklist.md and BMAD bmad-ux: an optional requirements checklist for multi-screen work ("are hover/empty/error/loading specified for every interactive element?") and a surface-closure check (every need has a screen; every screen has a journey that reaches it). Lightweight stories stay the default; no separate EXPERIENCE.md.</action>
    <verify>ledger gates/feat-020.md — G1 checklist present and marked optional, G2 closure check in the full template only, G3 lightweight template unchanged, R1–R4</verify>
  </task>

  <phase>E · prove it</phase>
  <task id="feat-015" depends="feat-010,feat-011,feat-012,feat-013,feat-014,feat-016,feat-017,feat-018,feat-019,feat-020">
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
  `src/` in a fresh template clone? And which stack? Blocks feat-015 only; A–D proceed.
- **feat-016 precondition.** Does SessionStart fire inside subagents? Answered and evidenced before the
  hook is written; if unknown, the hook no-ops whenever it cannot prove it runs in the main session.

## Risks

- **Doc edits drift into duplication.** Mitigation: each task's G-gate checks "points to, does not
  restate" (one-place rule).
- **STATE.md over budget after feat-014.** Mitigation: R2 runs on every task; trim content, never the
  budget.
- **Figma accidentally mutated.** Mitigation: no task in this plan calls a Figma write tool; C1 is
  design-to-code (reads only). The Figma gate is convention-only, so this line is the guard.
- **A hook breaks blinding or sessions (feat-016).** Mitigation: subagent precondition gate; hook
  exits 0 on any error; restore output capped.
- **Imported practice contradicts a rule (feat-017).** Mitigation: G2 proves the two-attempt rule and
  cost gate are byte-for-byte unchanged.
- **Figma rollback deletes user work (feat-018).** Mitigation: exact-ID only, explicit yes required.
- **Verifier and visual reviewer overlap.** Mitigation: verifier checks gates and diff; visual
  reviewer checks pixels and states. Different inputs, written in the blinding table.

## Out of Scope

- ECC's skill library, multi-harness adapters, and auto-learning memory.
- A "failed-before" baseline mode in `gates.mjs` (stays in Backlog; code-oriented).
- Context-full warning to the agent (get-shit-done): needs a statusline, and a project statusline
  would override adopters' own. Backlog, opt-in via `settings.local.json` only.
- Numeric visual diff (pixelmatch/SSIM, imugi): needs npm packages. Backlog, as an optional
  `toolbox.md` row at most; the visual reviewer stays the gate.
- Design diff per node (figwright), DESIGN.md token format (google-labs-code), delta specs
  (OpenSpec): later, or duplicates `design-system.md`.
- The log-archive half of plan #2 (still deferred until `wiki/log.md` has volume).

## Status

in-progress — A done (feat-010…012, plus bug-002); B–D revised 2026-10-15, awaiting approval
