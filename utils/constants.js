/**
 * Layout is authored for the Amazfit GTS 4 canvas (390 x 450).
 * Everything else derives from these two numbers so a new target only
 * needs a new entry in app.json.
 */
export const SCREEN_W = 390
export const SCREEN_H = 450

export const COLORS = {
  bg: 0x000000,
  card: 0x1c1c1e,
  cardActive: 0x2f2f33,
  ring: 0x2c2c2e,
  text: 0xffffff,
  dim: 0x8e8e93,
  accent: 0x2c9c4f,
  accentPress: 0x1f7a3f,
  inhale: 0x4fc3f7,
  hold: 0x9575cd,
  exhale: 0x4db6ac,
}

// Index inside a technique pattern: [inhale, hold-in, exhale, hold-out]
export const INHALE = 0
export const HOLD_IN = 1
export const EXHALE = 2
export const HOLD_OUT = 3

export const PHASE_COLOR = {
  [INHALE]: COLORS.inhale,
  [HOLD_IN]: COLORS.hold,
  [EXHALE]: COLORS.exhale,
  [HOLD_OUT]: COLORS.hold,
}

export const PHASE_LABEL = {
  [INHALE]: 'inhale',
  [HOLD_IN]: 'hold',
  [EXHALE]: 'exhale',
  [HOLD_OUT]: 'hold',
}

export const TECHNIQUES = [
  { id: 'box', pattern: [4, 4, 4, 4], color: 0x4fc3f7 },
  { id: 'relax', pattern: [4, 7, 8, 0], color: 0x9575cd },
  { id: 'coherent', pattern: [5, 0, 5, 0], color: 0x4db6ac },
  { id: 'calm', pattern: [4, 0, 6, 0], color: 0xffb74d },
]

export const DURATIONS = [1, 3, 5, 10]
export const DEFAULT_MINUTES = 3

/**
 * Session length is read back from storage and from router params, neither of
 * which is trustworthy by type. Anything outside the offered set collapses to
 * the default rather than reaching totalMs, setPageBrightTime or the stats.
 */
export function validMinutes(value) {
  const minutes = Number(value)
  for (let i = 0; i < DURATIONS.length; i++) {
    if (DURATIONS[i] === minutes) return minutes
  }
  return DEFAULT_MINUTES
}

export function techniqueById(id) {
  for (let i = 0; i < TECHNIQUES.length; i++) {
    if (TECHNIQUES[i].id === id) return TECHNIQUES[i]
  }
  return TECHNIQUES[0]
}

/** "4-7-8-0" collapses to "4-7-8": trailing zero holds are not part of the rhythm. */
export function patternLabel(pattern) {
  const parts = []
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] > 0) parts.push(pattern[i])
  }
  return parts.join('-')
}

export function formatClock(totalSeconds) {
  if (!isFinite(totalSeconds)) return '0:00'
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const rest = s % 60
  return m + ':' + (rest < 10 ? '0' + rest : rest)
}
