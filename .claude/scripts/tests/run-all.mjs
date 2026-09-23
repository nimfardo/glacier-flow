#!/usr/bin/env node
// Runs every *.test.mjs beside this file, each in its own process, and prints one `N run, N passed`
// line for the lot -- so a project's unit-lane gate is a single command with a single EXPECT.
//
//   node .claude/scripts/tests/run-all.mjs

import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const suites = readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort()

let run = 0
let passed = 0
let broken = 0

for (const suite of suites) {
  const r = spawnSync(process.execPath, [join(here, suite)], { encoding: 'utf8' })
  process.stdout.write(r.stdout ?? '')
  if (r.stderr) process.stderr.write(r.stderr)

  const counts = /^(\d+) run, (\d+) passed$/m.exec(r.stdout ?? '')
  if (!counts) {
    // A suite that crashed before reporting must not vanish from the total.
    console.error(`FAIL ${suite}: printed no count line (exit ${r.status})`)
    broken++
    continue
  }
  run += Number(counts[1])
  passed += Number(counts[2])
}

if (broken) run += broken
console.log(`${run} run, ${passed} passed`)
process.exit(run === passed ? 0 : 1)
