# gates/

One verification ledger per task in flight, at `gates/<task-id>.md`. Nothing else lives here.

A ledger is authored as part of the task it verifies — the task's `<verify>` names it and its gate
ids — run before the commit, and deleted at close once its EVIDENCE lines are pasted into the task's
`wiki/log.md` entry. An empty folder means no task is in flight, which is the normal resting state.

Format, threshold, lifecycle and linter rules: `.context/gates-ledger.md`. Runner:
`.claude/scripts/gates.mjs`.
