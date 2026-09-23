#!/usr/bin/env node
// Gate ledger runner and linter. Format, threshold and lifecycle: .context/gates-ledger.md
//
// A gate is met only when its CHECK exited 0, its output matched EXPECT, and the EVIDENCE digest
// still equals the digest of the current CHECK+EXPECT. That last clause is the point of the whole
// file: without it, a red gate can be made green by editing the question instead of the answer.
//
// Node 18+, no dependencies. ASCII, LF. Runs the same on macOS, Linux and Windows -- a gate that
// no-ops on one machine is worse than no gate, because you stop checking.
//
//   node .claude/scripts/gates.mjs --lint    gates/<id>.md [--strict]
//   node .claude/scripts/gates.mjs --status  gates/<id>.md

import { readFileSync, existsSync } from 'node:fs'
import { basename } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const TASK_ID = /^(feat|design|bug|ref|res|story|spec|plan)-\d{3,}\.md$/
const GATE_HEAD = /^##\s+(\S+)\s*(?:—|-)\s*(.*)$/
const GATE_ID = /^G\d+$/
const KV = /^(CHECK|EXPECT|MANUAL|EVIDENCE):\s*(.*)$/
const ABANDON = /^ABANDON:\s*(\S+)\s+(.*)$/
const HAND_TICK = /^\s*[-*]\s*\[x\]/i
const EV_MET = /^met\s+(\S+)\s+exit=(\S+)\s+digest=([0-9a-f]+)/
const EV_OWNER = /^owner-confirmed\s+\S+\s+\S+/

// ---------------------------------------------------------------- parse

export function parseLedger(text) {
  const gates = []
  const abandons = []
  let cur = null
  let fenced = false

  text.split(/\r?\n/).forEach((line, i) => {
    const n = i + 1
    if (/^\s*```/.test(line)) { fenced = !fenced; return }
    if (fenced) return

    const head = GATE_HEAD.exec(line)
    if (head) {
      // A heading with another prefix (O1, L1) is not a gate; its lines keep
      // attributing to the gate above it, so `cur` is deliberately left alone.
      if (GATE_ID.test(head[1])) {
        cur = { id: head[1], title: head[2].trim(), line: n, check: null, expect: null, manual: null, evidence: null, handTick: false, lines: {} }
        gates.push(cur)
      }
      return
    }

    const ab = ABANDON.exec(line)
    if (ab) { abandons.push({ id: ab[1], reason: ab[2].trim(), line: n }); return }

    if (!cur) return

    const kv = KV.exec(line)
    if (kv) {
      const key = kv[1].toLowerCase()
      cur[key] = kv[2].trim()
      cur.lines[key] = n
      return
    }
    if (HAND_TICK.test(line)) { cur.handTick = true; cur.lines.handTick = n }
  })

  return { gates, abandons }
}

export const digestOf = (gate) =>
  createHash('sha256').update(`${gate.check ?? ''}\n${gate.expect ?? ''}`).digest('hex').slice(0, 8)

export const isManual = (gate) => gate.manual !== null && gate.check === null

// ---------------------------------------------------------------- status

export function statusOf(ledger, gate) {
  if (ledger.abandons.some((a) => a.id === gate.id)) return { state: 'owed (abandoned)' }
  if (isManual(gate)) {
    return gate.evidence && EV_OWNER.test(gate.evidence)
      ? { state: 'met' }
      : { state: 'owed', why: 'awaiting owner confirmation' }
  }
  if (!gate.evidence) return { state: 'unmet', why: 'no evidence line' }
  const m = EV_MET.exec(gate.evidence)
  if (!m) return { state: 'unmet', why: 'evidence is not a met line' }
  if (m[2] !== '0') return { state: 'unmet', why: `exit=${m[2]}` }
  if (m[3] !== digestOf(gate)) return { state: 'unmet', why: 'digest mismatch: CHECK or EXPECT edited since the run' }
  return { state: 'met' }
}

export function summarize(ledger) {
  const counts = { met: 0, unmet: 0, owed: 0, abandoned: 0 }
  const rows = ledger.gates.map((g) => {
    const s = statusOf(ledger, g)
    if (s.state === 'met') counts.met++
    else if (s.state === 'unmet') counts.unmet++
    else if (s.state === 'owed (abandoned)') counts.abandoned++
    else counts.owed++
    return { gate: g, ...s }
  })
  return { rows, counts, clean: counts.unmet === 0 && counts.abandoned === 0 }
}

// ---------------------------------------------------------------- lint

const BARE_SUCCESS = new Set(['ok', 'true', 'passed', 'pass', 'done', 'success', 'succeeded', 'yes', '0', '1'])
const PINNED_COUNT = /\b\d+\s+(passed|failed|run|tests?|failures?)\b/i
const ACTIVITY = /^(run|check|test|verify|execute|ensure|make sure|try)\b/i
const ECHO_ONLY = /^(?:echo|printf|Write-Output|Write-Host)\s+(.+)$/i

const unanchor = (s) => s.replace(/^\^/, '').replace(/\$$/, '').trim()
const unquote = (s) => s.trim().replace(/^(['"])(.*)\1$/s, '$2')

export function lintLedger(ledger, file, { strict = false } = {}) {
  const findings = []
  const add = (rule, line, msg, warn = false) => findings.push({ rule, line, msg, warn })

  const name = basename(file)
  if (!TASK_ID.test(name)) {
    add('task-id name', 1, `'${name}' is not a task id; name the ledger <prefix>-NNN.md (prefixes: TaskList.md)`)
  }

  if (ledger.gates.length === 0) add('missing pair', 1, 'no G<n> gates in the ledger')

  for (const g of ledger.gates) {
    const at = g.line
    if (g.check === null && g.manual === null) {
      add('missing pair', at, `${g.id} has neither CHECK nor MANUAL`)
    }
    if (g.check !== null && g.expect === null) {
      add('missing pair', g.lines.check ?? at, `${g.id} has CHECK without EXPECT`)
    }
    if (ACTIVITY.test(g.title)) {
      add('activity title', at, `${g.id} titles an activity, not a property that holds: '${g.title}'`)
    }
    if (g.handTick) {
      add('hand tick', g.lines.handTick ?? at, `${g.id} contains a ticked box; only --run writes evidence`)
    }
    if (g.expect !== null) {
      const e = unanchor(g.expect)
      if (BARE_SUCCESS.has(e.toLowerCase())) {
        add('bare success', g.lines.expect ?? at, `${g.id} expects '${g.expect}', which almost anything prints`)
      }
      if (PINNED_COUNT.test(g.expect)) {
        add('pinned count', g.lines.expect ?? at, `${g.id} pins a literal count; pin self-consistency instead, e.g. (\\d+) run, \\1 passed`)
      }
      if (g.check !== null) {
        const echoed = ECHO_ONLY.exec(g.check.trim())
        if (echoed && unquote(echoed[1]) === e) {
          add('tautological', g.lines.check ?? at, `${g.id} only prints its own EXPECT; it observes nothing`)
        }
      }
    }
  }

  const ids = new Set(ledger.gates.map((g) => g.id))
  for (const a of ledger.abandons) {
    if (!ids.has(a.id)) add('abandon', a.line, `ABANDON names ${a.id}, which is not a gate in this ledger`)
    else if (a.reason.split(/\s+/).filter(Boolean).length < 3) {
      add('abandon', a.line, `ABANDON ${a.id} needs a reason a reader can act on, not '${a.reason}'`)
    }
  }

  const runnable = ledger.gates.filter((g) => !isManual(g)).length
  if (ledger.gates.length > 0 && runnable * 2 < ledger.gates.length) {
    add('mostly manual', 1, `${ledger.gates.length - runnable} of ${ledger.gates.length} gates have no CHECK`, !strict)
  }

  return findings
}

// ---------------------------------------------------------------- cli

export function loadLedger(file) {
  if (!existsSync(file)) {
    process.stderr.write(`gates: no ledger at ${file}\n`)
    process.exit(2)
  }
  return parseLedger(readFileSync(file, 'utf8'))
}

function cmdLint(file, strict) {
  const findings = lintLedger(loadLedger(file), file, { strict })
  for (const f of findings) {
    process.stderr.write(`${file}:${f.line}  ${f.warn ? 'warn' : 'fail'}  ${f.rule}  ${f.msg}\n`)
  }
  const hard = findings.filter((f) => !f.warn).length
  process.stdout.write(hard === 0 ? `gates: lint clean (${findings.length} warning(s))\n` : `gates: ${hard} lint finding(s)\n`)
  process.exit(hard === 0 ? 0 : 1)
}

export function printStatus(file, ledger) {
  const { rows, counts, clean } = summarize(ledger)
  for (const r of rows) {
    process.stdout.write(`  ${r.gate.id.padEnd(4)} ${r.state}${r.why ? ` (${r.why})` : ''}  ${r.gate.title}\n`)
  }
  process.stdout.write(`gates: ${counts.met} met, ${counts.unmet} unmet, ${counts.owed} owed, ${counts.abandoned} abandoned\n`)
  return clean
}

function cmdStatus(file) {
  process.exit(printStatus(file, loadLedger(file)) ? 0 : 1)
}

const USAGE = `usage: gates.mjs --lint|--status <ledger.md> [--strict]\n`

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2)
  const flags = new Set(argv.filter((a) => a.startsWith('--')))
  const file = argv.find((a) => !a.startsWith('--'))
  if (!file) { process.stderr.write(USAGE); process.exit(2) }
  if (flags.has('--lint')) cmdLint(file, flags.has('--strict'))
  else if (flags.has('--status')) cmdStatus(file)
  else { process.stderr.write(USAGE); process.exit(2) }
}
