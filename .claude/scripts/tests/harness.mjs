// Shared test harness. Zero dependencies; the last line a suite prints is exactly `N run, N passed`,
// the self-consistent shape a test-lane EXPECT pins (.context/gates-ledger.md).
//
// Tests may be sync or async: each is started immediately and awaited by report().

const state = { run: 0, failures: [], pending: [] }

export const test = (name, fn) => {
  state.run++
  state.pending.push(Promise.resolve().then(fn).catch((e) => { state.failures.push(`${name}: ${e.message}`) }))
}

export const eq = (got, want, msg = '') => {
  if (got !== want) throw new Error(`${msg} expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`)
}

export const ok = (cond, msg) => { if (!cond) throw new Error(msg) }

export async function report() {
  await Promise.all(state.pending)
  console.log(`${state.run} run, ${state.run - state.failures.length} passed`)
  if (state.failures.length) {
    for (const f of state.failures) console.error(`FAIL ${f}`)
    process.exit(1)
  }
}
