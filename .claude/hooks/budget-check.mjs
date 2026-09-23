#!/usr/bin/env node
// PostToolUse hook: byte and row budgets for the always-load files.
//
// THIS FILE IS THE SINGLE HOME OF THE NUMBERS. The hook and the housekeeping `--all` run both execute
// it, so there is nothing to keep in sync; .context/housekeeping.md points here rather than restating
// them. Budgets are in BYTES because bytes are measurable in the repo -- the token targets beside them
// are estimates, and an unenforceable budget is a wish.
//
//   (no args)    hook mode: reads the tool payload on stdin, checks the edited file if it is budgeted,
//                exits 2 with the offending lines on stderr so the editing agent sees them
//   --all        checks every budgeted file under the project root; exit 1 on any failure
//   --path FILE  checks one file explicitly (tests, gate ledgers); exit 1 on failure
//
// Unlike gate-check.mjs this hook does not fail open: a refused write is recoverable, an always-load
// file that quietly doubled is not.

import { readFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const FILE_BUDGET_BYTES = {
  'TaskList.md': 8192,
  'STATE.md': 8192,
  'CLAUDE.md': 4608,
  'CONTEXT.md': 4096,
}
const ROW_BUDGET_CHARS = { 'TaskList.md': 240 }

// Budgets are keyed by the real filename; a payload path may arrive in any casing.
const budgetFor = (name) => Object.keys(FILE_BUDGET_BYTES).find((k) => k.toLowerCase() === name.toLowerCase())

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd())

function checkFile(file) {
  const problems = []
  if (!existsSync(file)) return problems
  const name = path.basename(file)
  const key = budgetFor(name)
  if (!key) return problems

  const budget = FILE_BUDGET_BYTES[key]
  const bytes = statSync(file).size
  if (bytes > budget) problems.push(`${name} is ${bytes} bytes; budget ${budget}`)

  const rowBudget = ROW_BUDGET_CHARS[key]
  if (rowBudget) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.length > rowBudget) problems.push(`${name}:${i + 1} is ${line.length} chars; budget ${rowBudget}`)
    })
  }
  return problems
}

const readStdin = () =>
  new Promise((resolve) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => { buf += c })
    process.stdin.on('end', () => resolve(buf))
    process.stdin.on('error', () => resolve(''))
  })

const argv = process.argv.slice(2)
const all = argv.includes('--all')
const pathIndex = argv.indexOf('--path')
const explicit = pathIndex === -1 ? null : argv[pathIndex + 1]

let targets = []
if (explicit) {
  targets = [path.resolve(explicit)]
} else if (all) {
  targets = Object.keys(FILE_BUDGET_BYTES).map((k) => path.join(projectDir, k))
} else {
  let payload
  try { payload = JSON.parse(await readStdin()) } catch { process.exit(0) }
  const target = payload?.tool_input?.file_path ?? payload?.tool_input?.notebook_path
  if (!target) process.exit(0)
  if (!budgetFor(path.basename(target))) process.exit(0)
  targets = [path.resolve(projectDir, target)]
}

const found = targets.flatMap(checkFile)

if (found.length === 0) {
  if (all || explicit) process.stdout.write(`budget-check: ok (${targets.length} file(s))\n`)
  process.exit(0)
}

process.stderr.write('Over budget - trim the row, not the rule (limits live in .claude/hooks/budget-check.mjs):\n')
for (const p of found) process.stderr.write(`  ${p}\n`)
process.exit(all || explicit ? 1 : 2)
