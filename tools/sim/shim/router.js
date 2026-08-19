export const nav = { calls: [] }
export function push(o) { nav.calls.push(['push', o]); if (nav.onNavigate) nav.onNavigate(o, 'push') }
export function replace(o) { nav.calls.push(['replace', o]); if (nav.onNavigate) nav.onNavigate(o, 'replace') }
export function back() { nav.calls.push(['back']) }
export function home() { nav.calls.push(['home']) }
export function exit() { nav.calls.push(['exit']) }
export function launchApp() {}
