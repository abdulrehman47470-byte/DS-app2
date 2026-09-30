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

const pending = new Map<string, unknown>()
let scheduled = false
const idle = (cb: () => void) => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  if (ric) ric(cb, { timeout: 1000 })
  else setTimeout(cb, 200)
}

/** Save when the device is idle (coalesces rapid changes). Flushed on page hide so nothing is lost. */
export function saveSoon(key: string, value: unknown) {
  pending.set(key, value)
  if (scheduled) return
  scheduled = true
  idle(flush)
}

function flush() {
  scheduled = false
  for (const [k, v] of pending) save(k, v)
  pending.clear()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush())
}

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
