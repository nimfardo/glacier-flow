#!/usr/bin/env node
// PreToolUse hook: enforces the XML task gate from .context/task-workflow.md.
// Blocks Edit/Write to gated paths (src/, reference/, .context/) unless the
// sentinel file .claude/gate-open exists. The sentinel is created when the user
// approves an XML task and deleted after the task's commit.
//
// Written in Node rather than bash or PowerShell so the same hook fires on
// macOS, Linux, and Windows. A gate that silently no-ops on one machine is
// worse than no gate, because you stop checking.
//
// Fails open (exit 0, allow the write) on any parse/resolution error --
// a broken hook should never be the reason a legitimate write gets stuck.

import { existsSync } from 'node:fs'
import path from 'node:path'

// Top-level folders behind the gate. `.claude` is here because the hook, the ledger runner and the
// settings that register them are the enforcement itself -- a gate that cannot protect its own
// implementation is a convention, not a gate.
const GATED_DIRS = ['src', 'reference', '.context', '.claude']

// Always-load root files. STATE.md, TaskList.md and wiki/log.md are deliberately absent: they are the
// bookkeeping an approved task is required to do, and gating them would block the closeout of the very
// task that opened the gate.
const GATED_FILES = ['claude.md', 'context.md']

const allow = () => process.exit(0)

const readStdin = () =>
  new Promise((resolve) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => { buf += chunk })
    process.stdin.on('end', () => resolve(buf))
    process.stdin.on('error', () => resolve(''))
  })

let payload
try {
  payload = JSON.parse(await readStdin())
} catch {
  allow()
}

// Edit/Write/MultiEdit carry file_path; NotebookEdit carries notebook_path.
const target = payload?.tool_input?.file_path ?? payload?.tool_input?.notebook_path
if (!target) allow()

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd())
const rel = path.relative(projectDir, path.resolve(projectDir, target))

// Outside the project entirely -- not ours to gate.
if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) allow()

const segments = rel.split(path.sep)
const gated = segments.length === 1
  ? GATED_FILES.includes(segments[0].toLowerCase())
  : GATED_DIRS.includes(segments[0].toLowerCase())
if (!gated) allow()

if (existsSync(path.join(projectDir, '.claude', 'gate-open'))) allow()

const shown = rel.split(path.sep).join('/')
process.stderr.write(
  `Gate closed: '${shown}' is under the XML task gate (src/, reference/, .context/, .claude/, CLAUDE.md, CONTEXT.md) ` +
  `and no approved task is open. Write the XML task per .context/task-workflow.md, ` +
  `get user approval, then create the sentinel: echo approved > .claude/gate-open. ` +
  `Delete the sentinel after the task's commit.\n`
)
process.exit(2)
