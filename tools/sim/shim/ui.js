/** Browser stand-in for @zos/ui. Renders widgets as absolutely positioned DOM. */
export const widget = {
  TEXT: 'TEXT', FILL_RECT: 'FILL_RECT', STROKE_RECT: 'STROKE_RECT',
  CIRCLE: 'CIRCLE', ARC: 'ARC', BUTTON: 'BUTTON', IMG: 'IMG', GROUP: 'GROUP',
}
export const prop = { MORE: 'MORE' }
export const align = { LEFT: 'LEFT', RIGHT: 'RIGHT', CENTER_H: 'CENTER_H', TOP: 'TOP', BOTTOM: 'BOTTOM', CENTER_V: 'CENTER_V' }
export const text_style = { NONE: 0, WRAP: 1, ELLIPSIS: 2 }
export const event = { CLICK_UP: 'CLICK_UP', CLICK_DOWN: 'CLICK_DOWN' }

const SVG_NS = 'http://www.w3.org/2000/svg'
let root = null
let svg = null
export const registry = []

export function mount(el) {
  el.innerHTML = ''
  // Widgets live on an inner stage so the frame can clip while the stage scrolls.
  const stage = document.createElement('div')
  stage.id = 'stage'
  stage.style.cssText = 'position:absolute;left:0;top:0;width:390px'
  el.appendChild(stage)
  root = stage
  svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', 390)
  svg.setAttribute('height', 900)
  svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'
  root.appendChild(svg)
  registry.length = 0
}

const hex = (c) => '#' + (c >>> 0).toString(16).padStart(6, '0').slice(-6)
const H = { LEFT: 'flex-start', RIGHT: 'flex-end', CENTER_H: 'center' }
const V = { TOP: 'flex-start', BOTTOM: 'flex-end', CENTER_V: 'center' }

function box(o) {
  const d = document.createElement('div')
  d.style.cssText = 'position:absolute;box-sizing:border-box;overflow:hidden;white-space:nowrap'
  d.style.left = (o.x || 0) + 'px'
  d.style.top = (o.y || 0) + 'px'
  d.style.width = (o.w || 0) + 'px'
  d.style.height = (o.h || 0) + 'px'
  return d
}

function applyText(el, o, centerByDefault) {
  el.style.display = 'flex'
  el.style.justifyContent = H[o.align_h] || (centerByDefault ? 'center' : 'flex-start')
  el.style.alignItems = V[o.align_v] || 'center'
  if (o.text !== undefined) el.textContent = String(o.text)
  if (o.text_size !== undefined) el.style.fontSize = o.text_size + 'px'
  if (o.color !== undefined) el.style.color = hex(o.color)
}

export function createWidget(type, o) {
  const state = Object.assign({}, o)
  let el = null
  let node = null

  if (type === widget.ARC) {
    node = document.createElementNS(SVG_NS, 'path')
    node.setAttribute('fill', 'none')
    svg.appendChild(node)
  } else {
    el = box(state)
    root.appendChild(el)
  }

  const paint = () => {
    const o = state
    if (type === widget.ARC) {
      const cx = (o.x || 0) + (o.w || 0) / 2
      const cy = (o.y || 0) + (o.h || 0) / 2
      const r = Math.min(o.w || 0, o.h || 0) / 2
      const a0 = ((o.start_angle || 0) * Math.PI) / 180
      const a1 = ((o.end_angle || 0) * Math.PI) / 180
      const sweep = (o.end_angle || 0) - (o.start_angle || 0)
      const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
      const [x1, y1] = p(a0)
      const [x2, y2] = p(a1)
      if (Math.abs(sweep) >= 359.9) {
        node.setAttribute('d', `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`)
      } else {
        node.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 ${Math.abs(sweep) > 180 ? 1 : 0} 1 ${x2} ${y2}`)
      }
      node.setAttribute('stroke', hex(o.color || 0))
      node.setAttribute('stroke-width', o.line_width || 1)
      return
    }
    if (type === widget.CIRCLE) {
      const r = o.radius || 0
      el.style.left = (o.center_x - r) + 'px'
      el.style.top = (o.center_y - r) + 'px'
      el.style.width = el.style.height = 2 * r + 'px'
      el.style.borderRadius = '50%'
      el.style.background = hex(o.color || 0)
      el.style.opacity = o.alpha === undefined ? 1 : o.alpha / 255
      return
    }
    el.style.left = (o.x || 0) + 'px'
    el.style.top = (o.y || 0) + 'px'
    el.style.width = (o.w || 0) + 'px'
    el.style.height = (o.h || 0) + 'px'
    if (type === widget.FILL_RECT || type === widget.BUTTON) {
      el.style.background = hex(type === widget.BUTTON ? (o.normal_color || 0) : (o.color || 0))
      if (o.radius) el.style.borderRadius = o.radius + 'px'
    }
    if (type === widget.TEXT || type === widget.BUTTON) applyText(el, o, type === widget.BUTTON)
  }

  paint()

  const api = {
    __type: type,
    __state: state,
    __el: el,
    setProperty(_p, patch) { Object.assign(state, patch); paint(); return true },
    getProperty(key) { return state[key] },
    addEventListener(type_, fn) {
      if (el) el.addEventListener('click', fn)
      return true
    },
    removeEventListener() { return true },
  }
  if (state.click_func && el) el.addEventListener('click', state.click_func)
  registry.push(api)
  return api
}

export function deleteWidget() { return true }
export function redraw() {}
/** Mirrors the device: square screens show a system status bar unless hidden. */
export const statusBar = { visible: true }
export function setStatusBarVisible(visible) { statusBar.visible = !!visible }
export function updateStatusBarTitle() {}
export function createDialog() { return { show() {} } }
