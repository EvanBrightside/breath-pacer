let catalog = {}
export function setCatalog(c) { catalog = c }
export function getText(key) { return key in catalog ? catalog[key] : '{' + key + '}' }
