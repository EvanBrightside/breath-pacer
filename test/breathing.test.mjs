import { buildSteps, cycleDuration, stepAt } from '../utils/breathing.js'
import { validMinutes, formatClock, techniqueById, TECHNIQUES } from '../utils/constants.js'

let fail = 0
const eq = (n, a, e) => {
  const ok = JSON.stringify(a) === JSON.stringify(e)
  if (!ok) { fail++; console.log('FAIL', n, '->', JSON.stringify(a), 'want', JSON.stringify(e)) }
  else console.log('ok  ', n)
}
const noThrow = (n, fn) => {
  try { fn(); console.log('ok  ', n) } catch (e) { fail++; console.log('FAIL', n, '->', e.message) }
}

console.log('--- regression: original behaviour ---')
const relax = buildSteps([4,7,8,0])
eq('4-7-8 collapses to 3 steps', relax.length, 3)
eq('4-7-8 cycle ms', cycleDuration(relax), 19000)
const box = buildSteps([4,4,4,4]); const bc = cycleDuration(box)
eq('box cycle ms', bc, 16000)
eq('t=0 inhale, 4s left', [stepAt(box,bc,0).index, stepAt(box,bc,0).secondsLeft], [0,4])
eq('t=4000 flips to hold', stepAt(box,bc,4000).index, 1)
eq('t=15999 last step', stepAt(box,bc,15999).index, 3)
eq('t=16000 wraps', stepAt(box,bc,16000).index, 0)
eq('progress mid-inhale', stepAt(box,bc,2000).progress, 0.5)

console.log('--- new: empty / hostile patterns (pentest F3) ---')
eq('buildSteps([])', buildSteps([]), [])
eq('buildSteps all-zero', buildSteps([0,0,0,0]), [])
eq('buildSteps negatives', buildSteps([-4,-4,-4,-4]), [])
eq('buildSteps NaN', buildSteps([NaN,NaN]), [])
eq('buildSteps junk types', buildSteps([{},[],null]), [])
noThrow('buildSteps(null)', () => buildSteps(null))
noThrow('buildSteps(undefined)', () => buildSteps(undefined))
noThrow('buildSteps(42)', () => buildSteps(42))
noThrow('buildSteps({length:1e9}) terminates', () => buildSteps({length: 1e9}))
noThrow('stepAt on empty steps', () => stepAt([], 0, 0))
eq('stepAt empty is neutral', stepAt([],0,0).secondsLeft, 1)
eq('stepAt empty progress', stepAt([],0,0).progress, 0)

console.log('--- new: NaN / Infinity elapsed (pentest F4) ---')
for (const bad of [NaN, Infinity, -Infinity, -1, -3599760]) {
  const r = stepAt(box, bc, bad)
  eq(`elapsed=${bad} -> finite secondsLeft`, isFinite(r.secondsLeft), true)
  eq(`elapsed=${bad} -> progress in [0,1]`, r.progress >= 0 && r.progress <= 1, true)
}

console.log('--- new: progress always drives a legal radius ---')
const CIRCLE_MIN = 46, CIRCLE_MAX = 136
let worst = null
for (const t of TECHNIQUES) {
  const steps = buildSteps(t.pattern), cyc = cycleDuration(steps)
  for (const bad of [NaN, Infinity, -Infinity, -1e9, 1e21]) {
    const p = stepAt(steps, cyc, bad).progress
    const r = CIRCLE_MIN + (CIRCLE_MAX - CIRCLE_MIN) * p
    if (r < CIRCLE_MIN || r > CIRCLE_MAX || !isFinite(r)) worst = [t.id, bad, r]
  }
}
eq('no technique/elapsed pair escapes radius range', worst, null)

console.log('--- new: validMinutes (appsec F7 / pentest F2) ---')
eq('accepts 1', validMinutes(1), 1)
eq('accepts 10', validMinutes(10), 10)
eq('accepts numeric string', validMinutes('5'), 5)
eq('rejects -5', validMinutes(-5), 3)
eq('rejects Infinity', validMinutes(Infinity), 3)
eq('rejects 400-digit', validMinutes(parseInt('9'.repeat(400), 10)), 3)
eq('rejects 2147483648', validMinutes(2147483648), 3)
eq('rejects unlisted 7', validMinutes(7), 3)
eq('rejects "abc"', validMinutes('abc'), 3)
eq('rejects object', validMinutes({}), 3)
eq('rejects null', validMinutes(null), 3)

console.log('--- new: formatClock never renders NaN ---')
eq('formatClock(NaN)', formatClock(NaN), '0:00')
eq('formatClock(Infinity)', formatClock(Infinity), '0:00')
eq('formatClock(-5)', formatClock(-5), '0:00')
eq('formatClock(104)', formatClock(104), '1:44')

console.log('--- new: techniqueById fallback ---')
eq('unknown id', techniqueById('__proto__').id, 'box')
eq('null id', techniqueById(null).id, 'box')

console.log('--- new: clock-jump clamp (pentest F1) ---')
const TICK_MS = 60, MAX_DELTA_MS = TICK_MS * 4
const clamp = raw => (isFinite(raw) ? Math.min(Math.max(raw, 0), MAX_DELTA_MS) : TICK_MS)
eq('normal tick passes through', clamp(60), 60)
eq('1h forward jump clamped', clamp(3600000), 240)
eq('1h backward jump clamped', clamp(-3600000), 0)
eq('NaN delta falls back', clamp(NaN), 60)
// A 3 min session must still take ~3 min of real ticks, not fewer.
let elapsed = 0, ticks = 0
while (elapsed < 180000 && ticks < 100000) { elapsed += clamp(60); ticks++ }
eq('3 min session needs 3000 ticks', ticks, 3000)

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILURE(S)`)
process.exit(fail ? 1 : 0)
