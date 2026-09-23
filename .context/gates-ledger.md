# Gate Ledger

> Verification as a ledger of evidence: run once, re-verified once. One ledger per task in flight, at
> `gates/<task-id>.md`. This file is canonical for the format, the threshold, the lifecycle and the
> linter rules. Runner: `.claude/scripts/gates.mjs`. Which surfaces need which gate at all → the scope
> table in `.context/task-workflow.md`.

## Format

```
# Gates — <task-id>

## G1 — <a property that holds, not an activity>
CHECK: <one command, run from the project root>
EXPECT: <regex the output must match; ^ and $ are per line>
EVIDENCE: met 2026-09-23T14:02:11Z exit=0 digest=3fa9c1e0 out="first line of output"

## G2 — <an outcome only the owner can observe>
MANUAL: <what the owner must see>
EVIDENCE: owed
```

- A gate is **met** only when CHECK exited 0, **and** the output matched EXPECT, **and** the EVIDENCE
  digest equals the digest of the current CHECK+EXPECT. Editing either line flips the gate to unmet
  without a re-run — you cannot move the goalposts and keep the evidence.
- EVIDENCE lines are written only by `--run` and `--reverify`. A hand-ticked box is not evidence: the
  linter rejects it and `--status` reports the gate unmet.
- MANUAL gates have no CHECK and stay **owed** until the owner writes
  `EVIDENCE: owner-confirmed <date> <who>`. Nobody else can sign one.
- Gate ids are `G<n>`, manual ones included. A heading with any other prefix is not a gate, and its
  lines attribute to the gate above it.
- EXPECT for a test lane pins self-consistency, never a count: `(\d+) run, \1 passed`, not `12 passed`.
  A pinned count goes stale the day someone adds a test, and a stale gate gets edited rather than met.
- The ledger is named for its task id (`feat|design|bug|ref|res|story|spec|plan-NNN`; the canonical
  list of prefixes is in `TaskList.md`). The linter refuses any other name.
- Keep CHECK and EXPECT ASCII, and keep the command portable — it runs through the platform shell on
  macOS, Linux and Windows.
- `ABANDON: <id> <reason>` at column 1, only when the outcome is genuinely impossible inside the
  authorized task (needs the owner, hardware, a deploy). The gate is reported **owed (abandoned)**,
  never run, and the ledger exits 1: a visible handoff, not a pass.

## Threshold

A ledger is required when a task has **two or more gates, or any manual gate**. Below that, the
one-line `<verify>` command in the task stands as it is — a ledger around a single command is
ceremony with no extra evidence behind it.

Two or more is the honest count for most real work: a change that compiles, passes its lane and
leaves the linter clean already has three. The rule is not "write more gates", it is "when there are
three, write them down instead of remembering them".

The design workspaces hit the manual clause constantly. A state only a person can see — hover, empty,
error, loading, or a frame matching its design — is a MANUAL gate, not a checkbox Claude ticks on its
own behalf. `design-authoring` is the other half of the same idea: a property read back after a
mutation is already a CHECK/EXPECT pair, just written informally.

## Commands

| Command | Does | Exit 0 when |
|---|---|---|
| `node .claude/scripts/gates.mjs --lint gates/<id>.md` | Refuses gates that cannot fail; `--strict` promotes warnings to failures | No finding |
| `node .claude/scripts/gates.mjs --run gates/<id>.md` | Runs the gates **not yet met**, writes EVIDENCE, prints status | Every runnable gate met and nothing abandoned |
| `node .claude/scripts/gates.mjs --reverify gates/<id>.md` | Runs **every** runnable gate, met or not, and demotes failures | same |
| `node .claude/scripts/gates.mjs --status gates/<id>.md` | Recomputes from the file alone, no execution | No gate unmet and nothing abandoned |

`--timeout N` (default 120) bounds each CHECK. A CHECK past it is killed and recorded `exit=timeout`,
unmet. Output over 1 MiB is unmet as overflow, never truncated into a pass — make the CHECK print
less (a summary line, a tail).

## Lifecycle

| Step | When | What happens |
|---|---|---|
| Authored | with the approved task | The ledger is written as part of the task it verifies; `<verify>` names it and its gate ids. Run `--lint` and `--status`. Never `--run` here — there is nothing to run against yet. |
| Run | before the commit | `--run` once the change is ready. It re-executes only what is still unmet, so iterate against the failing gate, not the whole ledger. |
| Re-verified | at verification | `--reverify` once. This is the task's single re-execution; nobody runs the lanes after it. |
| Closed | after the commit | Paste the EVIDENCE lines into the task's `wiki/log.md` entry, then delete `gates/<id>.md`. |

The ledger is working state; the log entry is the record. Owed and abandoned gates are named in that
entry too. An unmet gate that quietly disappears at close is the single failure mode this file exists
to prevent.

## Linter rules

Each rule refuses a gate that cannot fail, or a ledger that cannot be traced back to its task.

| Rule | Refuses |
|---|---|
| task-id name | A ledger not named `<prefix>-NNN.md` |
| bare success | `EXPECT: ok`, `true`, `passed`, `done`, `0`, `1` and the like |
| pinned count | An EXPECT with a literal `N passed` / `N run` / `N tests` |
| activity title | A title starting with run / check / test / verify / execute / ensure / make sure / try |
| missing pair | CHECK without EXPECT, or a gate with neither CHECK nor MANUAL |
| hand tick | Any `- [x]` line inside a gate |
| tautological | A CHECK that only prints a literal equal to its own EXPECT; it observes nothing |
| abandon | An `ABANDON:` naming a gate not in the ledger, or with a reason too short to be a handoff |
| mostly manual | *Warning:* more than half the gates have no CHECK. Fails only under `--strict` |

A title names a **property that holds**, not an activity: "export writes BOM-free UTF-8", not "run the
export test". The activity rule exists because an activity always succeeds at being performed, so a
gate written that way can only ever pass.

## Standard gates

A project fills these from its own stack, and a task's specific gates follow them.

| Gate | CHECK | EXPECT |
|---|---|---|
| unit lane | _project: test command_ | `(\d+) run, \1 passed`, or the lane's own self-consistent line |
| lint / typecheck | _project: lint command_ | the tool's clean line |
| format | _project: format check_ | the tool's clean line |

On this template all three are empty, because `src/` is empty and there is no lane to point at. That
is the honest state rather than an omission: a gate pointing at a command that does not exist passes
vacuously, which is worse than having no gate, because it looks like coverage. Fill them when the
project picks a stack and record the choice in `STATE.md` → Stack & Versions.
