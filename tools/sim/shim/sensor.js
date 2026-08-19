export const VIBRATOR_SCENE_SHORT_LIGHT = 1
export const VIBRATOR_SCENE_SHORT_MIDDLE = 2
export const VIBRATOR_SCENE_SHORT_STRONG = 3
export const VIBRATOR_SCENE_DURATION = 4
export const VIBRATOR_SCENE_DURATION_LONG = 5
export const VIBRATOR_SCENE_NOTIFICATION = 6

export const vibrations = []
export class Vibrator {
  start(o) { vibrations.push(o ? o.mode : 'default') }
  stop() {}
  setMode() {}
  getConfig() { return { mode: 2 } }
}

/** Fake continuous heart rate: drifts down over the session, like the real thing would. */
export class HeartRate {
  constructor() { this.cb = null; this.n = 0 }
  getLast() { return 74 }
  getCurrent() { return Math.max(58, 76 - this.n) }
  onCurrentChange(cb) {
    this.cb = cb
    this.timer = setInterval(() => { this.n += 1; cb() }, 800)
  }
  offCurrentChange() { clearInterval(this.timer); this.cb = null }
}
