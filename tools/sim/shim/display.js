export const calls = []
export function setPageBrightTime(o) { calls.push(['setPageBrightTime', o]); return 0 }
export function resetPageBrightTime() { calls.push(['resetPageBrightTime']); return 0 }
export function pauseDropWristScreenOff(o) { calls.push(['pauseDropWristScreenOff', o]); return 0 }
export function resetDropWristScreenOff() { calls.push(['resetDropWristScreenOff']); return 0 }
export function setBrightness() { return 0 }
