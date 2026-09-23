# Subagent Delegation

> How approved work is split across roles and models. Load when executing an approved `<task>` or `<plan>`.

## The Principle

The main agent orchestrates and plans; it does not execute gated work itself. Every approved task runs in a subagent chosen by **work type**. The main agent stays lean: it briefs, reviews results, and manages the gate sentinel.

Routing is by **role**, not by model name. Roles are stable; model names go stale. The "Default today" column is a suggestion, not part of the contract — override it per project in `.context/rules.md` if this project's economics differ.

## Role Routing

| Work | Role | Default today |
|---|---|---|
| Planning — authoring `<task>` / `<plan>` XML, stories, specs | Main agent (never delegated) | session model |
| Code execution — implementing an approved task on `src/`, `reference/`, `.context/` | Implementer subagent | Opus |
| Visual QA — checking an implementation against a Figma frame or mock (`design-to-code`) | Implementer subagent | Opus |
| Verify + commit + docs — running `<verify>`, committing, board moves, `STATE.md`, `wiki/log.md`, index updates | Verifier subagent | Sonnet |
| Housekeeping — after the last task of a `<plan>` | Verifier subagent | Sonnet |

Planning is never delegated away from the main context: the approval gate faces the user directly, and the user is approving what the *main* agent proposed.

**Implementer** receives the full XML task verbatim, touches only files listed in `<write>`, and returns a diff summary.
**Verifier** follows the after-task checklist in `task-workflow.md` → Core Rules. One task = one commit.
Where the task carries a ledger, it runs `node .claude/scripts/gates.mjs --reverify gates/<id>.md` — the
task's single re-execution. Nobody runs the lanes after it, and a pass that did not re-verify has not
verified. It returns the assumption checklist below as a required output.
**Housekeeper** runs the sequence in `.context/housekeeping.md`. Still proposal-only: findings come back for user approval, never autonomous cleanup.

## Blinding

Each role has a **Never open** list. The reason is narrow and worth stating plainly: two roles that
both read everything are one reviewer running twice, not two reviewers. A verifier that has read the
implementer's reasoning ends up checking that the reasoning was followed — the one thing already
guaranteed to be true.

| Role | Reads | Never opens |
|---|---|---|
| Implementer | The XML task verbatim, the files in `<read>` / `<write>`, the ledger | The verifier's report from an earlier round |
| Verifier | The XML task, the diff, the ledger, the `<assumptions>` list | The implementer's reasoning or working notes — the diff is the claim, not the story behind it |

Blinding is by *file*, not by instruction. A role that has to be told not to think about something it
has already read was blinded too late.

## Assumption Checklist

`<assumptions>` in the XML task is not decoration — it is the verifier's checklist, and a verify
result without it is not a verify result.

Every line comes back resolved as exactly one of:

- `✓` holds — with `file:line` evidence opened this round
- `✗` violated — with the evidence that shows it
- `n/a` not code-verifiable (design intent, future scope) — one line of reasoning, and no invented citation

An output missing a row is rejected and the verify re-run. A `✗` is **not** a code defect the verifier
quietly repairs: a violated assumption means the task was planned against a codebase that turned out
not to exist, so it stops and goes back to the user.

Where the evidence shows the *record* is stale rather than the code wrong — an outdated comment, a
superseded line in `reference/`, a spec that no longer matches — mark it `✗ record-error suspected`.
Same routing, but pre-triaged: that fix belongs in the record, at its source, in the same closeout.
This is the contradiction discipline of `.context/rules.md` non-negotiable 6 reaching verification;
that rule governs, this is only where it surfaces.

## Cost Gate

Delegation spends money. The same "ask first" discipline that governs code writes governs model spend.

- **Ask before routing work to an expensive tier.** Anything above the defaults in the table — Fable in particular — needs an explicit yes first. Say what you want to escalate, why the default tier isn't enough, and wait.
- **Never silently upgrade mid-plan.** If task 3 of a plan seems to warrant a bigger model than tasks 1–2 ran on, stop and ask. A tier change is a decision, not an implementation detail.
- **Ask before wide fan-out.** More than ~3 subagents in flight for one task is a spend decision too, even at cheap tiers.
- **Downgrading is always free.** Dropping to a cheaper tier, or doing small work inline instead of spawning at all, never needs approval. When a task is trivial, not delegating is the correct answer.

Default posture: cheapest tier that can do the job, escalate on request. Not: best tier available, economize on complaint.

## Sequence per Approved Task

1. User approves the XML task → main agent opens the gate sentinel (`.claude/gate-open`).
2. Main agent spawns the **implementer** with the full XML task; it implements and reports back.
3. Main agent spawns the **verifier** to run `<verify>`, commit (one task = one commit), and do the bookkeeping (TaskList move, `STATE.md`, `wiki/log.md`).
4. Main agent closes the sentinel and reviews the result before starting the next task.

A failed `<verify>` goes back to step 2 — fix before the next task, per Core Rules.

**Two implement attempts, then stop and ask.** A third round on the same task means the task is wrong,
not the implementation. Every loop needs a floor, and where no retry budget covers a situation, the
floor is the user.

## End of Plan

After the last task in a `<plan>` reaches Done, spawn the **housekeeper** before declaring the plan complete. It follows the housekeep sequence in `.context/housekeeping.md` and reports proposals; the user approves any trims or archives.
