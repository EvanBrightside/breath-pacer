import { createWidget, widget, align, text_style, setStatusBarVisible } from '@zos/ui'
import { back, replace } from '@zos/router'
import { getText } from '@zos/i18n'
import { COLORS, SCREEN_W, techniqueById } from '../utils/constants'
import { getStats } from '../utils/store'

const PAD = 20
const CARD_W = SCREEN_W - PAD * 2

function label(x, y, w, h, text, size, color, alignH) {
  return createWidget(widget.TEXT, {
    x,
    y,
    w,
    h,
    text,
    text_size: size,
    color,
    align_h: alignH || align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
  })
}

Page({
  onInit(params) {
    let parsed = {}
    try {
      parsed = JSON.parse(params) || {}
    } catch (error) {
      parsed = {}
    }
    this.techniqueId = parsed.techniqueId || 'box'
    this.minutes = parsed.minutes || 0
    this.cycles = parsed.cycles || 0
    this.hrBefore = parsed.hrBefore || 0
    this.hrAfter = parsed.hrAfter || 0
  },

  build() {
    setStatusBarVisible(false)

    const technique = techniqueById(this.techniqueId)

    label(0, 24, SCREEN_W, 30, getText('done_title'), 24, COLORS.dim)
    label(0, 58, SCREEN_W, 64, this.minutes + ' ' + getText('min'), 56, technique.color)
    label(
      0,
      126,
      SCREEN_W,
      26,
      this.cycles + ' ' + getText('cycles') + ' · ' + getText('tech_' + technique.id),
      21,
      COLORS.dim,
    )

    const nextTop = this.buildHeartRate(160)
    this.buildTotals(nextTop)
    this.buildButtons(nextTop + 34)
  },

  /** Returns the y coordinate the next block should start at. */
  buildHeartRate(top) {
    if (this.hrBefore <= 0 || this.hrAfter <= 0) return top

    createWidget(widget.FILL_RECT, {
      x: PAD,
      y: top,
      w: CARD_W,
      h: 72,
      radius: 20,
      color: COLORS.card,
    })

    label(PAD + 18, top + 8, CARD_W - 36, 24, getText('heart_rate'), 19, COLORS.dim, align.LEFT)

    const delta = this.hrAfter - this.hrBefore
    const deltaText = delta > 0 ? '+' + delta : String(delta)
    const deltaColor = delta < 0 ? COLORS.exhale : COLORS.dim

    label(PAD + 18, top + 34, 180, 30, this.hrBefore + ' → ' + this.hrAfter, 26, COLORS.text, align.LEFT)
    label(PAD + CARD_W - 118, top + 34, 100, 30, deltaText, 26, deltaColor, align.RIGHT)

    return top + 88
  },

  buildTotals(top) {
    const stats = getStats()
    label(
      0,
      top,
      SCREEN_W,
      28,
      getText('total') + ': ' + stats.sessions + ' ' + getText('sessions') + ' · ' + stats.minutes + ' ' + getText('min'),
      20,
      COLORS.dim,
    )
  },

  buildButtons(top) {
    createWidget(widget.BUTTON, {
      x: PAD,
      y: top,
      w: CARD_W,
      h: 58,
      radius: 29,
      text: getText('again'),
      text_size: 26,
      color: COLORS.text,
      normal_color: COLORS.accent,
      press_color: COLORS.accentPress,
      click_func: () => {
        replace({
          url: 'page/session',
          params: JSON.stringify({
            techniqueId: this.techniqueId,
            minutes: this.minutes,
          }),
        })
      },
    })

    createWidget(widget.BUTTON, {
      x: PAD,
      y: top + 68,
      w: CARD_W,
      h: 58,
      radius: 29,
      text: getText('finish'),
      text_size: 26,
      color: COLORS.text,
      normal_color: COLORS.card,
      press_color: COLORS.cardActive,
      click_func: () => back(),
    })
  },
})
