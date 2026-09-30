import { Component, type ReactNode } from 'react'

const RELOAD_KEY = 'ds:chunk-reload'

/** True when a lazily loaded screen's file is missing (usually right after a new deploy). */
function isChunkError(e: unknown) {
  const msg = String((e as Error)?.message ?? e)
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i.test(msg)
}

/**
 * Never show a blank white screen. Screen-loading failures after a deploy reload once;
 * anything else shows a friendly message with a way back.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }

  static getDerivedStateFromError(error: unknown) {
    return { error }
  }

  componentDidCatch(error: unknown) {
    if (isChunkError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, '1')
          location.reload()
          return
        }
      } catch {
        // storage blocked: fall through to the message
      }
    }
    console.error(error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-8 text-center text-ink">
        <p className="font-serif text-3xl">Something went wrong</p>
        <p className="mt-2 max-w-72 text-sm text-ink-muted">Sorry about that. Reloading usually fixes it.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => location.reload()} className="btn-gold min-h-11 rounded-[14px] px-5 font-semibold">Reload</button>
          <button onClick={() => (location.href = '/')} className="min-h-11 rounded-[14px] border border-line-strong px-5 font-semibold">Home</button>
        </div>
      </div>
    )
  }
}

// A successful load clears the one-time reload guard.
window.addEventListener('load', () => {
  try {
    sessionStorage.removeItem(RELOAD_KEY)
  } catch {
    /* ignore */
  }
})
// Vite reports failed preloads here (e.g. old chunk hashes after a deploy).
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  try {
    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1')
      location.reload()
    }
  } catch {
    /* ignore */
  }
})
