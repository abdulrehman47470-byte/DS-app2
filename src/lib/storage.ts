/** localStorage wrapped in try/catch: private windows and blocked storage must not break the app. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

let warned = false

/** Returns false when storage is full or blocked; state still works for this session. */
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    if (!warned) {
      warned = true
      window.dispatchEvent(new CustomEvent('ds-toast', { detail: 'This device’s demo storage is full. New photos may not survive a reload until the real backend is connected.' }))
    }
    return false
  }
}
