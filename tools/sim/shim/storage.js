const mem = {}
export const localStorage = {
  setItem(k, v) { mem[k] = String(v) },
  getItem(k, d) { return k in mem ? mem[k] : d },
  removeItem(k) { delete mem[k] },
  clear() { for (const k in mem) delete mem[k] },
}
export const sessionStorage = localStorage
