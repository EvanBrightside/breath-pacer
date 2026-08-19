/**
 * Pure timing engine for a breathing cycle. Kept free of @zos imports so it
 * can be exercised outside the watch.
 */

/** Drop zero-length holds so "4-7-8-0" runs as a three-step cycle. */
export function buildSteps(pattern) {
  const steps = []
  if (!pattern || typeof pattern.length !== 'number') return steps
  for (let phase = 0; phase < pattern.length; phase++) {
    const seconds = Number(pattern[phase])
    if (isFinite(seconds) && seconds > 0) {
      steps.push({ phase, durationMs: seconds * 1000 })
    }
  }
  return steps
}

/** Neutral step used when a pattern yields nothing runnable. */
const EMPTY_STEP = { phase: 0, durationMs: 0 }

export function cycleDuration(steps) {
  let total = 0
  for (let i = 0; i < steps.length; i++) total += steps[i].durationMs
  return total
}

/**
 * Locate the active step for a point in time.
 * `progress` is 0..1 within that step, used to drive the circle radius.
 */
export function stepAt(steps, cycleMs, elapsedMs) {
  if (!steps || steps.length === 0) {
    return { index: 0, step: EMPTY_STEP, stepElapsed: 0, progress: 0, secondsLeft: 1 }
  }

  const safeElapsed = isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0
  const inCycle = cycleMs > 0 && isFinite(cycleMs) ? safeElapsed % cycleMs : 0

  let index = 0
  let stepStart = 0
  let cursor = 0
  for (let i = 0; i < steps.length; i++) {
    const end = cursor + steps[i].durationMs
    // The last step absorbs any float drift so we never fall off the array.
    if (inCycle < end || i === steps.length - 1) {
      index = i
      stepStart = cursor
      break
    }
    cursor = end
  }

  const step = steps[index]
  const stepElapsed = inCycle - stepStart
  const progress = step.durationMs > 0 ? stepElapsed / step.durationMs : 0
  const left = Math.ceil((step.durationMs - stepElapsed) / 1000)

  return {
    index,
    step,
    stepElapsed,
    // Math.max(1, NaN) is NaN, so finiteness has to be checked, not just magnitude.
    progress: isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0,
    secondsLeft: isFinite(left) ? Math.max(1, left) : 1,
  }
}
