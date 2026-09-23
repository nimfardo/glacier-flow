#!/usr/bin/env node
// Tests for .claude/scripts/gates.mjs. Zero dependencies, hand-rolled harness so the last line is
// exactly `N run, N passed` -- the self-consistent shape a test-lane EXPECT pins.
//
//   node .claude/scripts/tests/gates.test.mjs

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseLedger, lintLedger, statusOf, summarize, digestOf, runLedger, loadLedger } from '../gates.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const FIX = join(here, 'fixtures', 'gates')
const GATES = join(here, '..', 'gates.mjs')

let run = 0
const failures = []
const pending = []
const test = (name, fn) => {
  run++
  pending.push(Promise.resolve().then(fn).catch((e) => { failures.push(`${name}: ${e.message}`) }))
}
const eq = (got, want, msg = '') => {
  if (got !== want) throw new Error(`${msg} expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`)
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg) }

const load = (dir, name) => {
  const file = join(FIX, dir, name)
  return { file, ledger: parseLedger(readFileSync(file, 'utf8')) }
}
const rules = (dir, name, opts) => {
  const { file, ledger } = load(dir, name)
  return lintLedger(ledger, file, opts).map((f) => `${f.rule}${f.warn ? ':warn' : ''}`)
}
const cli = (args) => {
  try {
    const out = execFileSync(process.execPath, [GATES, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { code: 0, out }
  } catch (e) {
    return { code: e.status, out: e.stdout ?? '' }
  }
}

// ---------------------------------------------------------------- parse

test('parses gates, titles and fields', () => {
  const { ledger } = load('good', 'feat-900.md')
  eq(ledger.gates.length, 2, 'gate count:')
  eq(ledger.gates[0].id, 'G1')
  eq(ledger.gates[0].title, 'parser reads a two-gate ledger')
  eq(ledger.gates[1].manual !== null, true, 'G2 manual:')
})

test('a heading with another prefix is not a gate; its lines attribute to the gate above', () => {
  const ledger = parseLedger([
    '# Gates — feat-999',
    '',
    '## G1 — export writes BOM-free UTF-8',
    'CHECK: node -e "console.log(1)"',
    '',
    '## O1 — an observation, not a gate',
    'EXPECT: ^1$',
  ].join('\n'))
  eq(ledger.gates.length, 1, 'gate count:')
  eq(ledger.gates[0].expect, '^1$', 'EXPECT below the non-gate heading:')
})

test('a fenced example block is not parsed as gates', () => {
  const ledger = parseLedger(['```', '## G1 — an example in a doc', 'CHECK: true', '```'].join('\n'))
  eq(ledger.gates.length, 0, 'gate count:')
})

test('digest changes when EXPECT is edited', () => {
  const a = { check: 'node -e "1"', expect: '^a$' }
  const b = { check: 'node -e "1"', expect: '^b$' }
  ok(digestOf(a) !== digestOf(b), 'editing EXPECT must change the digest')
})

// ---------------------------------------------------------------- lint

test('the good fixture lints clean', () => {
  eq(rules('good', 'feat-900.md').length, 0, 'findings:')
})

test('task-id name refuses a ledger not named for a task', () => {
  ok(rules('bad-name', 'not-a-task.md').includes('task-id name'), 'expected a task-id name finding')
})

test('activity title refuses a title that names an activity', () => {
  ok(rules('bad-title', 'feat-902.md').includes('activity title'), 'expected an activity title finding')
})

test('bare success refuses an EXPECT almost anything prints', () => {
  ok(rules('bad-expect', 'feat-901.md').includes('bare success'), 'expected a bare success finding')
})

test('pinned count refuses a literal count', () => {
  ok(rules('bad-count', 'feat-903.md').includes('pinned count'), 'expected a pinned count finding')
})

test('tautological refuses a CHECK that only prints its own EXPECT', () => {
  ok(rules('bad-tautology', 'feat-911.md').includes('tautological'), 'expected a tautological finding')
})

test('hand tick refuses a ticked box inside a gate', () => {
  ok(rules('hand-tick', 'feat-904.md').includes('hand tick'), 'expected a hand tick finding')
})

test('missing pair refuses CHECK without EXPECT and a gate with neither', () => {
  const found = rules('missing-pair', 'feat-914.md').filter((r) => r === 'missing pair')
  eq(found.length, 2, 'missing pair findings:')
})

test('mostly manual warns but does not fail; --strict fails it', () => {
  eq(rules('mostly-manual', 'feat-912.md').includes('mostly manual:warn'), true, 'default is a warning:')
  eq(rules('mostly-manual', 'feat-912.md', { strict: true }).includes('mostly manual'), true, '--strict is hard:')
})

test('abandon refuses an id that is not a gate in the ledger', () => {
  ok(rules('abandon-unknown', 'feat-909.md').includes('abandon'), 'expected an abandon finding')
})

test('a well-formed ABANDON on a real gate raises no abandon finding', () => {
  ok(!rules('abandon', 'feat-908.md').includes('abandon'), 'well-formed ABANDON must lint clean')
})

// ---------------------------------------------------------------- status

test('a manual gate is owed until the owner signs it', () => {
  const { ledger } = load('manual', 'feat-906.md')
  eq(statusOf(ledger, ledger.gates[0]).state, 'owed')
})

test('an abandoned gate is owed (abandoned) and the ledger is not clean', () => {
  const { ledger } = load('abandon', 'feat-908.md')
  const s = summarize(ledger)
  eq(s.rows.find((r) => r.gate.id === 'G2').state, 'owed (abandoned)')
  eq(s.clean, false, 'a ledger with an abandoned gate is a handoff, not a pass:')
})

test('evidence whose digest does not match the current CHECK+EXPECT is unmet', () => {
  const { ledger } = load('digest', 'feat-910.md')
  const s = statusOf(ledger, ledger.gates[0])
  eq(s.state, 'unmet')
  ok(/digest mismatch/.test(s.why), `expected a digest mismatch reason, got ${s.why}`)
})

test('a gate with no evidence line is unmet', () => {
  const { ledger } = load('digest', 'feat-910.md')
  eq(statusOf(ledger, ledger.gates[1]).state, 'unmet')
})

// ---------------------------------------------------------------- cli

test('--lint exits 0 on the good fixture and 1 on a finding', () => {
  eq(cli(['--lint', join(FIX, 'good', 'feat-900.md')]).code, 0, 'good:')
  eq(cli(['--lint', join(FIX, 'bad-expect', 'feat-901.md')]).code, 1, 'bad-expect:')
})

test('--lint exits 0 on a warning and 1 on the same file with --strict', () => {
  const f = join(FIX, 'mostly-manual', 'feat-912.md')
  eq(cli(['--lint', f]).code, 0, 'warning only:')
  eq(cli(['--lint', f, '--strict']).code, 1, 'strict:')
})

test('--status reports an owed manual gate but still exits 0 (it is tracked, not failed)', () => {
  const r = cli(['--status', join(FIX, 'manual', 'feat-906.md')])
  eq(r.code, 0, 'exit:')
  ok(/owed/.test(r.out), `expected owed in the status output, got ${r.out}`)
})

test('--status exits 1 on an abandoned gate', () => {
  eq(cli(['--status', join(FIX, 'abandon', 'feat-908.md')]).code, 1)
})

test('--status exits 1 on an unmet gate', () => {
  eq(cli(['--status', join(FIX, 'digest', 'feat-910.md')]).code, 1)
})

test('a missing ledger exits 2 rather than passing silently', () => {
  eq(cli(['--status', join(FIX, 'nope', 'feat-999.md')]).code, 2)
})


// ---------------------------------------------------------------- run

const NODE = JSON.stringify(process.execPath)
// A ledger written to a temp dir, so a run never mutates a fixture.
const scratch = (name, body) => {
  const dir = mkdtempSync(join(tmpdir(), 'gates-'))
  const file = join(dir, name)
  writeFileSync(file, body)
  return file
}
const gate = (id, title, check, expect) => `## ${id} — ${title}\nCHECK: ${check}\nEXPECT: ${expect}\n`
const PASSES = `${NODE} -e "console.log('gates parsed')"`
const FAILS = `${NODE} -e "console.log('nope'); process.exit(3)"`

test('--run writes a met EVIDENCE line and --status then reports met', async () => {
  const f = scratch('feat-920.md', `# Gates — feat-920\n\n${gate('G1', 'parser reads a one-gate ledger', PASSES, '^gates parsed$')}`)
  await runLedger(f)
  const text = readFileSync(f, 'utf8')
  ok(/^EVIDENCE: met \S+ exit=0 digest=[0-9a-f]{8} out="gates parsed"$/m.test(text), `evidence line not written: ${text}`)
  eq(summarize(loadLedger(f)).clean, true, 'status after a passing run:')
})

test('editing EXPECT on a met gate flips it to unmet without a re-run', async () => {
  const f = scratch('feat-921.md', `# Gates — feat-921\n\n${gate('G1', 'parser reads a one-gate ledger', PASSES, '^gates parsed$')}`)
  await runLedger(f)
  eq(summarize(loadLedger(f)).clean, true, 'met before the edit:')
  writeFileSync(f, readFileSync(f, 'utf8').replace('EXPECT: ^gates parsed$', 'EXPECT: ^.*$'))
  const s = statusOf(loadLedger(f), loadLedger(f).gates[0])
  eq(s.state, 'unmet', 'after editing EXPECT:')
  ok(/digest mismatch/.test(s.why), `expected a digest mismatch, got ${s.why}`)
})

test('a failing CHECK is recorded unmet, with no digest to reuse', async () => {
  const f = scratch('feat-922.md', `# Gates — feat-922\n\n${gate('G1', 'export writes BOM-free UTF-8', FAILS, '^gates parsed$')}`)
  await runLedger(f)
  const text = readFileSync(f, 'utf8')
  ok(/^EVIDENCE: unmet \S+ exit=3 out=/m.test(text), `expected an unmet evidence line, got: ${text}`)
  ok(!/digest=/.test(text), 'a failed gate must not carry a digest')
  eq(summarize(loadLedger(f)).clean, false)
})

test('a CHECK past the timeout is killed and recorded exit=timeout, never met', async () => {
  const slow = `${NODE} -e "setTimeout(() => {}, 20000)"`
  const f = scratch('feat-923.md', `# Gates — feat-923\n\n${gate('G1', 'export finishes inside its budget', slow, '^gates parsed$')}`)
  await runLedger(f, { timeoutSeconds: 1 })
  ok(/exit=timeout/.test(readFileSync(f, 'utf8')), 'expected exit=timeout in the evidence line')
  eq(summarize(loadLedger(f)).clean, false)
})

test('output over the cap is unmet as overflow, never truncated into a pass', async () => {
  const loud = `${NODE} -e "console.log('x'.repeat(1200 * 1024)); console.log('gates parsed')"`
  const f = scratch('feat-924.md', `# Gates — feat-924\n\n${gate('G1', 'export prints a summary line', loud, '^gates parsed$')}`)
  await runLedger(f, { timeoutSeconds: 30 })
  ok(/exit=overflow/.test(readFileSync(f, 'utf8')), 'expected exit=overflow in the evidence line')
  eq(summarize(loadLedger(f)).clean, false, 'a gate whose output overflowed must not read as met:')
})

test('--run never executes an abandoned gate and the ledger stays unclean', async () => {
  const f = scratch('feat-925.md', `# Gates — feat-925\n\n${gate('G1', 'parser reads a two-gate ledger', PASSES, '^gates parsed$')}\n## G2 — staging serves the new asset\nCHECK: ${FAILS}\nEXPECT: ^gates parsed$\nABANDON: G2 needs a staging deploy the owner controls\n`)
  await runLedger(f)
  const text = readFileSync(f, 'utf8')
  eq((text.match(/EVIDENCE:/g) ?? []).length, 1, 'only the runnable gate gets evidence:')
  eq(summarize(loadLedger(f)).clean, false, 'an abandoned gate is a handoff, not a pass:')
})

test('--run skips a gate already met; --reverify re-executes it and demotes a failure', async () => {
  const f = scratch('feat-926.md', `# Gates — feat-926\n\n${gate('G1', 'parser reads a one-gate ledger', PASSES, '^gates parsed$')}`)
  await runLedger(f)
  const stamp = /EVIDENCE: met (\S+)/.exec(readFileSync(f, 'utf8'))[1]

  eq(await runLedger(f), 0, '--run must skip a gate already met:')
  eq(/EVIDENCE: met (\S+)/.exec(readFileSync(f, 'utf8'))[1], stamp, 'the evidence line is untouched:')

  writeFileSync(f, readFileSync(f, 'utf8').replace(`CHECK: ${PASSES}`, `CHECK: ${FAILS}`))
  await runLedger(f, { all: true })
  eq(summarize(loadLedger(f)).clean, false, '--reverify must demote a gate whose command now fails:')
})

test('--run leaves a manual gate owed rather than executing it', async () => {
  const f = scratch('feat-927.md', '# Gates — feat-927\n\n## G1 — owner confirms the hover state\nMANUAL: hover every row and compare against the frame\nEVIDENCE: owed\n')
  eq(await runLedger(f), 0, 'nothing to execute:')
  eq(readFileSync(f, 'utf8').includes('EVIDENCE: owed'), true, 'the owed line is untouched:')
})

// ---------------------------------------------------------------- report

await Promise.all(pending)
console.log(`${run} run, ${run - failures.length} passed`)
if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`)
  process.exit(1)
}
