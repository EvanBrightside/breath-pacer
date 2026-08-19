import { localStorage } from '@zos/storage'
import { validMinutes } from './constants'

const KEY_TECHNIQUE = 'technique'
const KEY_MINUTES = 'minutes'
const KEY_SESSIONS = 'total_sessions'
const KEY_TOTAL_MINUTES = 'total_minutes'

/** localStorage round-trips through strings on device, so normalise on read. */
function readNumber(key, fallback) {
  const raw = localStorage.getItem(key, fallback)
  const n = parseInt(raw, 10)
  // isNaN alone lets +/-Infinity through: parseInt of a 400 digit string is Infinity.
  return isFinite(n) ? n : fallback
}

export function getPrefs() {
  return {
    techniqueId: localStorage.getItem(KEY_TECHNIQUE, 'box') || 'box',
    minutes: validMinutes(readNumber(KEY_MINUTES, 3)),
  }
}

export function setPrefs(techniqueId, minutes) {
  localStorage.setItem(KEY_TECHNIQUE, techniqueId)
  localStorage.setItem(KEY_MINUTES, String(validMinutes(minutes)))
}

export function getStats() {
  return {
    sessions: readNumber(KEY_SESSIONS, 0),
    minutes: readNumber(KEY_TOTAL_MINUTES, 0),
  }
}

export function recordSession(minutes) {
  const stats = getStats()
  const next = {
    sessions: Math.max(0, stats.sessions) + 1,
    // Never let a bad value walk the lifetime total backwards.
    minutes: Math.max(0, stats.minutes) + validMinutes(minutes),
  }
  localStorage.setItem(KEY_SESSIONS, String(next.sessions))
  localStorage.setItem(KEY_TOTAL_MINUTES, String(next.minutes))
  return next
}
