#!/usr/bin/env node
// Tests for .claude/hooks/gate-check.mjs -- the hook that enforces the XML task gate.
//
// This file is the executable form of the "Which Gate Covers What" table in
// .context/task-workflow.md: one assertion per row. When that table changes, this file changes.
//
// Every case runs against a throwaway CLAUDE_PROJECT_DIR, so a test never reads or writes the real
// repo's sentinel -- a leaked .claude/gate-open would silently open the gate for the rest of the session.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { test, eq, report } from './harness.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const HOOK = join(here, '..', '..', 'hooks', 'gate-check.mjs')

const project = () => mkdtempSync(join(tmpdir(), 'gate-'))
const openSentinel = (dir) => {
  mkdirSync(join(dir, '.claude'), { recursive: true })
  writeFileSync(join(dir, '.claude', 'gate-open'), 'approved')
}

// exit 0 = allowed, 2 = blocked
const hook = (payload, { dir = project(), raw = null } = {}) => {
  const input = raw !== null ? raw : JSON.stringify(payload)
  const r = spawnSync(process.execPath, [HOOK], {
    input,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
  })
  return r.status
}
const onEdit = (file, opts) => hook({ tool_input: { file_path: file } }, opts)

// ---------------------------------------------------------------- gated surfaces

const GATED = ['src/app.ts', 'reference/api.md', '.context/rules.md', '.claude/hooks/gate-check.mjs', 'CLAUDE.md', 'CONTEXT.md']
for (const file of GATED) {
  test(`blocks a write to ${file}`, () => eq(onEdit(file), 2, `${file} must be gated:`))
}

test('blocks regardless of case in the path segment', () => {
  eq(onEdit('SRC/app.ts'), 2)
})

// ---------------------------------------------------------------- exempt surfaces

const EXEMPT = ['STATE.md', 'TaskList.md', 'wiki/log.md', 'wiki/index.md', 'planning/plans/x.md', 'raw/source.pdf', 'gates/feat-001.md', 'README.md']
for (const file of EXEMPT) {
  test(`allows a write to ${file}`, () => eq(onEdit(file), 0, `${file} must not be gated:`))
}

// ---------------------------------------------------------------- the sentinel

test('an open sentinel allows every gated surface', () => {
  const dir = project()
  openSentinel(dir)
  for (const file of GATED) eq(onEdit(file, { dir }), 0, `${file} with the sentinel open:`)
})

test('removing the sentinel closes the gate again', () => {
  const dir = project()
  openSentinel(dir)
  eq(onEdit('src/app.ts', { dir }), 0, 'open:')
  rmSync(join(dir, '.claude', 'gate-open'))
  eq(onEdit('src/app.ts', { dir }), 2, 'closed:')
})

// ---------------------------------------------------------------- other tools and paths

test('NotebookEdit carries notebook_path and is gated the same way', () => {
  eq(hook({ tool_input: { notebook_path: 'src/analysis.ipynb' } }), 2)
})

test('a path outside the project is not ours to gate', () => {
  eq(onEdit('/etc/hosts'), 0)
})

// ---------------------------------------------------------------- fail-open, asserted as deliberate

// The hook allows the write on any parse or resolution error. That is a choice -- a broken hook should
// never be the reason a legitimate write is stuck -- and it is also why the hook is dangerous when it
// breaks: failure is invisible. Asserting it here is what separates fail-open by design from fail-open
// by accident.
test('malformed JSON on stdin fails open', () => {
  eq(hook(null, { raw: 'not json at all' }), 0)
})

test('empty stdin fails open', () => {
  eq(hook(null, { raw: '' }), 0)
})

test('a payload with no path fails open', () => {
  eq(hook({ tool_input: { command: 'ls' } }), 0)
})

test('a payload with no tool_input fails open', () => {
  eq(hook({ session_id: 'abc' }), 0)
})

await report()
