import { useEffect, useState } from 'react'

/**
 * Shows uncaught errors on screen (message + build) instead of failing silently, so a problem
 * on a real phone can be screenshotted and reported. Demo-stage tool: Phase 9 sends these to
 * an error tracker instead.
 */
export function ErrorReporter() {
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      // Ignore cross-origin noise (e.g. embedded players) and benign resize-observer loops.
      if (!e.message || e.message === 'Script error.' || /ResizeObserver loop/.test(e.message)) return
      setErr(`${e.message}${e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''}`)
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { message?: string; name?: string } | undefined
      if (r?.name === 'AbortError' || r?.name === 'NotAllowedError') return // user cancelled share/camera
      setErr(`Unhandled: ${r?.message ?? String(e.reason)}`)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  if (!err) return null
  return (
    <div role="alert" className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[80] rounded-2xl border border-danger/40 bg-[#2A1B0E] p-3 text-[13px] text-[#F6EBD7] shadow-deep">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1 break-words font-mono text-[11px] opacity-80">{err}</p>
      <p className="mt-1 text-[11px] opacity-60">Build {__BUILD_ID__} · please screenshot this for support</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => location.reload()} className="min-h-9 rounded-full bg-[#d69a4c] px-3 text-xs font-semibold text-white">Reload</button>
        <button onClick={() => setErr(null)} className="min-h-9 rounded-full border border-white/30 px-3 text-xs font-semibold">Dismiss</button>
      </div>
    </div>
  )
}
