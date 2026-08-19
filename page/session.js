import { createWidget, widget, align, text_style, prop, event, setStatusBarVisible } from '@zos/ui'
import { replace, back } from '@zos/router'
import { getText } from '@zos/i18n'
import {
  HeartRate,
  Vibrator,
  VIBRATOR_SCENE_DURATION,
  VIBRATOR_SCENE_SHORT_LIGHT,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_SHORT_STRONG,
} from '@zos/sensor'
import {
  pauseDropWristScreenOff,
  resetDropWristScreenOff,
  resetPageBrightTime,
  setPageBrightTime,
} from '@zos/display'
import {
  COLORS,
  EXHALE,
  HOLD_IN,
  HOLD_OUT,
  INHALE,
  PHASE_COLOR,
  PHASE_LABEL,
  SCREEN_W,
  formatClock,
  techniqueById,
  validMinutes,
} from '../utils/constants'
import { buildSteps, cycleDuration, stepAt } from '../utils/breathing'
import { recordSession } from '../utils/store'

const CENTER_X = SCREEN_W / 2
const CENTER_Y = 200
const RING_RADIUS = 155
const RING_WIDTH = 6

const CIRCLE_MIN = 46
const CIRCLE_MAX = 136

const TICK_MS = 60
// A wall-clock jump (DST, timezone, NTP) must not be credited as session time.
const MAX_DELTA_MS = TICK_MS * 4

const VIBRATION = {
  [INHALE]: VIBRATOR_SCENE_SHORT_MIDDLE,
  [HOLD_IN]: VIBRATOR_SCENE_SHORT_LIGHT,
  [EXHALE]: VIBRATOR_SCENE_SHORT_STRONG,
  [HOLD_OUT]: VIBRATOR_SCENE_SHORT_LIGHT,
}

Page({
  onInit(params) {
    let parsed = {}
    try {
      parsed = JSON.parse(params) || {}
    } catch (error) {
      parsed = {}
    }
    this.technique = techniqueById(parsed.techniqueId)
    this.minutes = validMinutes(parsed.minutes)
    this.steps = buildSteps(this.technique.pattern)
    this.cycleMs = cycleDuration(this.steps)
    this.totalMs = this.minutes * 60 * 1000

    this.elapsedMs = 0
    this.paused = false
    this.lastTickAt = 0
    this.stepIndex = -1
    this.timer = null
    this.finished = false

    this.hrBefore = 0
    this.hrAfter = 0

    this.lastWritten = {}
  },

  build() {
    // Square-screen devices draw a system status bar over the page. The layout
    // here is centred on the full 390x450 canvas, so it has to go.
    setStatusBarVisible(false)
    this.keepScreenAwake()
    this.startHeartRate()

    this.vibrator = new Vibrator()

    this.buildRing()
    this.buildCircle()
    this.buildLabels()
    this.buildStopButton()

    this.render(0)
    this.lastTickAt = Date.now()
    this.timer = setInterval(() => this.tick(), TICK_MS)
  },

  keepScreenAwake() {
    // Session length plus a margin, so the screen never dims mid-breath.
    // Bounded on purpose: duration 0 would suspend drop-wrist screen-off
    // system-wide until an explicit reset, which a crashed page never sends.
    const awakeMs = Math.min(Math.max(this.totalMs + 60000, 1000), 2147483000)
    try {
      setPageBrightTime({ brightTime: awakeMs })
    } catch (error) {
      // Screen dimming is a comfort issue, not a reason to fail the session.
    }
    try {
      pauseDropWristScreenOff({ duration: awakeMs })
    } catch (error) {
      // Added in API 2.1; older devices simply keep their default behaviour.
    }
  },

  startHeartRate() {
    try {
      this.heartRate = new HeartRate()
      this.hrCallback = () => {
        try {
          const value = this.heartRate.getCurrent()
          if (!(value > 0)) return
          // Both endpoints come from continuous measurement. getLast() would
          // be a different mode entirely - possibly hours stale - and
          // subtracting the two would not mean anything.
          if (this.hrBefore === 0) this.hrBefore = value
          this.hrAfter = value
        } catch (error) {
          // A reading can fail transiently; the session does not depend on it.
        }
      }
      this.heartRate.onCurrentChange(this.hrCallback)
    } catch (error) {
      // Continuous measurement needs API 2.1; without it the session simply
      // runs without heart rate and the result screen omits that card.
      this.heartRate = null
    }
  },

  buildRing() {
    const box = {
      x: CENTER_X - RING_RADIUS,
      y: CENTER_Y - RING_RADIUS,
      w: RING_RADIUS * 2,
      h: RING_RADIUS * 2,
    }

    createWidget(widget.ARC, {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      start_angle: -90,
      end_angle: 270,
      color: COLORS.ring,
      line_width: RING_WIDTH,
    })

    this.progressArc = createWidget(widget.ARC, {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      start_angle: -90,
      end_angle: -89,
      color: this.technique.color,
      line_width: RING_WIDTH,
    })
  },

  buildCircle() {
    this.circle = createWidget(widget.CIRCLE, {
      center_x: CENTER_X,
      center_y: CENTER_Y,
      radius: CIRCLE_MIN,
      color: COLORS.inhale,
      alpha: 110,
    })
    this.circle.addEventListener(event.CLICK_UP, () => this.togglePause())
  },

  buildLabels() {
    this.phaseText = createWidget(widget.TEXT, {
      x: 45,
      y: 124,
      w: SCREEN_W - 90,
      h: 32,
      text: '',
      text_size: 26,
      color: COLORS.text,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    this.countText = createWidget(widget.TEXT, {
      x: 45,
      y: 162,
      w: SCREEN_W - 90,
      h: 76,
      text: '',
      text_size: 68,
      color: COLORS.text,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    this.cycleText = createWidget(widget.TEXT, {
      x: 45,
      y: 244,
      w: SCREEN_W - 90,
      h: 28,
      text: '',
      text_size: 22,
      color: COLORS.dim,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    this.remainingText = createWidget(widget.TEXT, {
      x: 45,
      y: 358,
      w: SCREEN_W - 90,
      h: 30,
      text: '',
      text_size: 24,
      color: COLORS.dim,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })
  },

  buildStopButton() {
    createWidget(widget.BUTTON, {
      x: CENTER_X - 75,
      y: 392,
      w: 150,
      h: 52,
      radius: 26,
      text: getText('stop'),
      text_size: 24,
      color: COLORS.text,
      normal_color: COLORS.card,
      press_color: COLORS.cardActive,
      click_func: () => this.abort(),
    })
  },

  togglePause() {
    this.paused = !this.paused

    if (this.paused) {
      this.phaseText.setProperty(prop.MORE, {
        text: getText('paused'),
        color: COLORS.dim,
      })
      return
    }

    // Resume: restore the label straight away instead of waiting for the
    // next phase change, which can be up to eight seconds out.
    this.lastTickAt = Date.now()
    const { step } = stepAt(this.steps, this.cycleMs, this.elapsedMs)
    this.phaseText.setProperty(prop.MORE, {
      text: getText(PHASE_LABEL[step.phase]),
      color: COLORS.text,
    })
  },

  tick() {
    const now = Date.now()
    const raw = now - this.lastTickAt
    // Clamp both ways: negative means the clock moved back, huge means it
    // jumped forward or the timer was starved. Neither is elapsed breathing.
    const delta = isFinite(raw) ? Math.min(Math.max(raw, 0), MAX_DELTA_MS) : TICK_MS
    this.lastTickAt = now

    if (this.paused || this.finished) return

    this.elapsedMs += delta
    if (this.elapsedMs >= this.totalMs) {
      this.complete()
      return
    }
    this.render(this.elapsedMs)
  },

  /**
   * Paint one frame. Every widget write goes through `writeIfChanged`: at 16 Hz
   * for up to ten minutes, with the screen pinned bright and the heart rate
   * sensor running, redundant redraws are pure battery cost. Only the radius
   * actually changes on most ticks.
   */
  render(elapsedMs) {
    const { index, step, progress, secondsLeft } = stepAt(this.steps, this.cycleMs, elapsedMs)

    if (index !== this.stepIndex) {
      this.stepIndex = index
      this.onStepChanged(step)
    }

    this.writeIfChanged(this.circle, 'radius', 'radius', Math.round(this.radiusFor(step.phase, progress)))
    this.writeIfChanged(this.countText, 'count', 'text', String(secondsLeft))

    const cycleTotal = Math.max(1, Math.ceil(this.totalMs / this.cycleMs))
    const cycleNumber = Math.min(Math.floor(elapsedMs / this.cycleMs) + 1, cycleTotal)
    this.writeIfChanged(
      this.cycleText,
      'cycle',
      'text',
      getText('cycle') + ' ' + cycleNumber + ' / ' + cycleTotal,
    )

    this.writeIfChanged(
      this.remainingText,
      'remaining',
      'text',
      formatClock((this.totalMs - elapsedMs) / 1000),
    )

    // Sweep is clamped to [1, 360]: never a zero-width arc, never past a full
    // circle, and never NaN - Math.max(1, NaN) would still be NaN.
    const sweep = Math.round((elapsedMs / this.totalMs) * 360)
    const safeSweep = isFinite(sweep) ? Math.min(Math.max(sweep, 1), 360) : 1
    this.writeIfChanged(this.progressArc, 'sweep', 'end_angle', -90 + safeSweep)
  },

  writeIfChanged(widgetRef, cacheKey, property, value) {
    if (this.lastWritten[cacheKey] === value) return
    this.lastWritten[cacheKey] = value
    const patch = {}
    patch[property] = value
    widgetRef.setProperty(prop.MORE, patch)
  },

  radiusFor(phase, progress) {
    const span = CIRCLE_MAX - CIRCLE_MIN
    if (phase === INHALE) return CIRCLE_MIN + span * progress
    if (phase === EXHALE) return CIRCLE_MAX - span * progress
    if (phase === HOLD_IN) return CIRCLE_MAX
    return CIRCLE_MIN
  },

  onStepChanged(step) {
    if (!this.paused) {
      this.phaseText.setProperty(prop.MORE, {
        text: getText(PHASE_LABEL[step.phase]),
        color: COLORS.text,
      })
    }
    this.circle.setProperty(prop.MORE, { color: PHASE_COLOR[step.phase] })
    this.vibrate(VIBRATION[step.phase])
  },

  vibrate(mode) {
    try {
      this.vibrator.stop()
      this.vibrator.start({ mode })
    } catch (error) {
      // Vibration is a nicety, never a reason to interrupt a session.
    }
  },

  complete() {
    if (this.finished) return
    this.finished = true
    this.stopTimer()
    this.vibrate(VIBRATOR_SCENE_DURATION)

    const cycles = Math.max(1, Math.floor(this.totalMs / this.cycleMs))
    recordSession(this.minutes)

    replace({
      url: 'page/result',
      params: JSON.stringify({
        techniqueId: this.technique.id,
        minutes: this.minutes,
        cycles,
        hrBefore: this.hrBefore,
        hrAfter: this.hrAfter,
      }),
    })
  },

  abort() {
    if (this.finished) return
    this.finished = true
    this.stopTimer()
    back()
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  onDestroy() {
    this.stopTimer()

    // Detaching the sensor comes first and each step is isolated: this is the
    // one cleanup with privacy and battery consequence, and it must not be
    // skipped because an earlier display call threw.
    try {
      if (this.heartRate && this.hrCallback) {
        this.heartRate.offCurrentChange(this.hrCallback)
      }
    } catch (error) {
      // Already detached.
    }
    try {
      if (this.vibrator) this.vibrator.stop()
    } catch (error) {
      // Motor already idle.
    }
    try {
      resetPageBrightTime()
    } catch (error) {
      // Page teardown resets it anyway.
    }
    try {
      resetDropWristScreenOff()
    } catch (error) {
      // Bounded duration above expires on its own.
    }
  },
})
