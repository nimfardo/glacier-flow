#!/usr/bin/env node
// Tests for .claude/hooks/budget-check.mjs -- the PostToolUse budget hook.
//
// The numbers themselves live in the hook and are asserted only through its behaviour, so a re-base
// changes one file rather than two.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { test, eq, ok, report } from './harness.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const HOOK = join(here, '..', '..', 'hooks', 'budget-check.mjs')
const FIX = join(here, 'fixtures', 'budget')

const run = (args, { input = '', dir = process.cwd() } = {}) => {
  const r = spawnSync(process.execPath, [HOOK, ...args], {
    input, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
  })
  return { code: r.status, out: r.stdout ?? '', err: r.stderr ?? '' }
}

test('--path refuses a file over its byte budget and names the count', () => {
  const r = run(['--path', join(FIX, 'over-bytes', 'STATE.md')])
  eq(r.code, 1, 'exit:')
  ok(/STATE\.md is \d+ bytes; budget \d+/.test(r.err), `expected a byte finding, got: ${r.err}`)
})

test('--path refuses an over-long row and names its line number', () => {
  const r = run(['--path', join(FIX, 'over', 'TaskList.md')])
  eq(r.code, 1, 'exit:')
  ok(/TaskList\.md:5 is \d+ chars; budget \d+/.test(r.err), `expected a row finding with a line number, got: ${r.err}`)
})

test('a row budget applies only to the board, not to every budgeted file', () => {
  // STATE.md has a byte budget and no row budget: a long line in it is not a finding on its own.
  const r = run(['--path', join(FIX, 'clean', 'STATE.md')])
  eq(r.code, 0, `a long prose line in STATE.md must not be refused: ${r.err}`)
})

test('--path passes a clean file', () => {
  const r = run(['--path', join(FIX, 'clean', 'TaskList.md')])
  eq(r.code, 0, 'exit:')
  ok(/^budget-check: ok/m.test(r.out), `expected an ok line, got: ${r.out}`)
})

test('--path ignores a file that carries no budget', () => {
  const r = run(['--path', join(here, 'harness.mjs')])
  eq(r.code, 0)
})

test('--all checks every budgeted file under the project root', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-'))
  copyFileSync(join(FIX, 'clean', 'TaskList.md'), join(dir, 'TaskList.md'))
  writeFileSync(join(dir, 'STATE.md'), '# STATE\n')
  eq(run(['--all'], { dir }).code, 0, 'clean project:')

  copyFileSync(join(FIX, 'over', 'TaskList.md'), join(dir, 'TaskList.md'))
  eq(run(['--all'], { dir }).code, 1, 'over-budget project:')
})

test('--all tolerates a budgeted file that does not exist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-'))
  eq(run(['--all'], { dir }).code, 0, 'an empty project is within budget:')
})

test('hook mode exits 2 so the editing agent sees the refusal', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-'))
  copyFileSync(join(FIX, 'over', 'TaskList.md'), join(dir, 'TaskList.md'))
  const r = run([], { input: JSON.stringify({ tool_input: { file_path: 'TaskList.md' } }), dir })
  eq(r.code, 2, 'exit:')
  ok(/budget/.test(r.err), 'the refusal must say why')
})

test('hook mode ignores a write to a file with no budget', () => {
  eq(run([], { input: JSON.stringify({ tool_input: { file_path: 'src/app.ts' } }) }).code, 0)
})

test('hook mode on malformed input does not block the write', () => {
  eq(run([], { input: 'not json' }).code, 0)
})

test('the budgeted names are matched case-insensitively', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-'))
  copyFileSync(join(FIX, 'over', 'TaskList.md'), join(dir, 'TaskList.md'))
  eq(run([], { input: JSON.stringify({ tool_input: { file_path: 'tasklist.md' } }), dir }).code, 2)
})

await report()
