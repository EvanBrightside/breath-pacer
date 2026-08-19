import { createWidget, widget, align, text_style, prop, event, setStatusBarVisible } from '@zos/ui'
import { push } from '@zos/router'
import { getText } from '@zos/i18n'
import {
  COLORS,
  DURATIONS,
  SCREEN_W,
  TECHNIQUES,
  patternLabel,
} from '../utils/constants'
import { getPrefs, getStats, setPrefs } from '../utils/store'

const PAD = 20
const CARD_W = SCREEN_W - PAD * 2
const CARD_H = 78
const CARD_GAP = 10
const CARDS_TOP = 134

const CHIP_GAP = 10
const CHIP_W = (CARD_W - CHIP_GAP * (DURATIONS.length - 1)) / DURATIONS.length
const CHIP_H = 64

function onTap(widgetRef, handler) {
  widgetRef.addEventListener(event.CLICK_UP, handler)
}

Page({
  state: {
    techniqueId: 'box',
    minutes: 3,
    cards: [],
    chips: [],
  },

  build() {
    setStatusBarVisible(false)

    // `state` lives on the object handed to Page(); if the platform reuses it
    // across navigations these arrays would otherwise accumulate handles to
    // widgets from destroyed pages.
    this.state.cards = []
    this.state.chips = []

    const prefs = getPrefs()
    this.state.techniqueId = prefs.techniqueId
    this.state.minutes = prefs.minutes

    this.buildHeader()
    this.buildTechniques()
    this.buildDurations()
    this.buildStartButton()

    this.syncTechniques()
    this.syncDurations()
  },

  buildHeader() {
    createWidget(widget.TEXT, {
      x: 0,
      y: 16,
      w: SCREEN_W,
      h: 44,
      text: getText('app_title'),
      text_size: 34,
      color: COLORS.text,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    const stats = getStats()
    const summary = stats.sessions === 0
      ? getText('no_sessions')
      : stats.sessions + ' ' + getText('sessions') + ' · ' + stats.minutes + ' ' + getText('min')

    createWidget(widget.TEXT, {
      x: 0,
      y: 62,
      w: SCREEN_W,
      h: 28,
      text: summary,
      text_size: 20,
      color: COLORS.dim,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })
  },

  buildTechniques() {
    createWidget(widget.TEXT, {
      x: PAD + 4,
      y: 100,
      w: CARD_W,
      h: 26,
      text: getText('technique'),
      text_size: 20,
      color: COLORS.dim,
      align_h: align.LEFT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    TECHNIQUES.forEach((technique, index) => {
      const top = CARDS_TOP + index * (CARD_H + CARD_GAP)

      const background = createWidget(widget.FILL_RECT, {
        x: PAD,
        y: top,
        w: CARD_W,
        h: CARD_H,
        radius: 20,
        color: COLORS.card,
      })

      createWidget(widget.CIRCLE, {
        center_x: PAD + 34,
        center_y: top + CARD_H / 2,
        radius: 10,
        color: technique.color,
      })

      const name = createWidget(widget.TEXT, {
        x: PAD + 58,
        y: top + 12,
        w: 160,
        h: 32,
        text: getText('tech_' + technique.id),
        text_size: 28,
        color: COLORS.text,
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      })

      const hint = createWidget(widget.TEXT, {
        x: PAD + 58,
        y: top + 42,
        w: 160,
        h: 26,
        text: getText('hint_' + technique.id),
        text_size: 20,
        color: COLORS.dim,
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      })

      const rhythm = createWidget(widget.TEXT, {
        x: PAD + CARD_W - 124,
        y: top + CARD_H / 2 - 16,
        w: 106,
        h: 32,
        text: patternLabel(technique.pattern),
        text_size: 24,
        color: COLORS.dim,
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      })

      const select = () => {
        this.state.techniqueId = technique.id
        this.syncTechniques()
      }

      // Touch can land on any of the stacked widgets, so all of them select.
      ;[background, name, hint, rhythm].forEach((w) => onTap(w, select))

      this.state.cards.push({ technique, background, name })
    })
  },

  buildDurations() {
    const top = CARDS_TOP + TECHNIQUES.length * (CARD_H + CARD_GAP) + 6

    createWidget(widget.TEXT, {
      x: PAD + 4,
      y: top,
      w: CARD_W,
      h: 26,
      text: getText('duration'),
      text_size: 20,
      color: COLORS.dim,
      align_h: align.LEFT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    })

    const chipsTop = top + 36

    DURATIONS.forEach((minutes, index) => {
      const left = PAD + index * (CHIP_W + CHIP_GAP)

      const background = createWidget(widget.FILL_RECT, {
        x: left,
        y: chipsTop,
        w: CHIP_W,
        h: CHIP_H,
        radius: 18,
        color: COLORS.card,
      })

      const label = createWidget(widget.TEXT, {
        x: left,
        y: chipsTop,
        w: CHIP_W,
        h: CHIP_H,
        text: String(minutes),
        text_size: 28,
        color: COLORS.dim,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
      })

      const select = () => {
        this.state.minutes = minutes
        this.syncDurations()
      }

      ;[background, label].forEach((w) => onTap(w, select))

      this.state.chips.push({ minutes, background, label })
    })

    this.state.startTop = chipsTop + CHIP_H + 22
  },

  buildStartButton() {
    createWidget(widget.BUTTON, {
      x: PAD,
      y: this.state.startTop,
      w: CARD_W,
      h: 72,
      radius: 36,
      text: getText('start'),
      text_size: 30,
      color: COLORS.text,
      normal_color: COLORS.accent,
      press_color: COLORS.accentPress,
      click_func: () => this.start(),
    })
  },

  syncTechniques() {
    this.state.cards.forEach(({ technique, background, name }) => {
      const selected = technique.id === this.state.techniqueId
      background.setProperty(prop.MORE, {
        color: selected ? COLORS.cardActive : COLORS.card,
      })
      name.setProperty(prop.MORE, {
        color: selected ? technique.color : COLORS.text,
      })
    })
  },

  syncDurations() {
    this.state.chips.forEach(({ minutes, background, label }) => {
      const selected = minutes === this.state.minutes
      background.setProperty(prop.MORE, {
        color: selected ? COLORS.cardActive : COLORS.card,
      })
      label.setProperty(prop.MORE, {
        color: selected ? COLORS.text : COLORS.dim,
      })
    })
  },

  start() {
    setPrefs(this.state.techniqueId, this.state.minutes)
    push({
      url: 'page/session',
      params: JSON.stringify({
        techniqueId: this.state.techniqueId,
        minutes: this.state.minutes,
      }),
    })
  },
})
