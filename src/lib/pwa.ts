import { registerSW } from 'virtual:pwa-register'

/**
 * Service worker registration. When a new version is deployed, the new worker takes over and
 * the page reloads once, so phones never keep running an old cached build.
 * Also checks for a new version every time the app comes back to the foreground.
 */
export function setupPwa() {
  if (!('serviceWorker' in navigator)) return
  const update = registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      if (!reg) return
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) reg.update().catch(() => {})
      }
      document.addEventListener('visibilitychange', check)
      setInterval(check, 30 * 60 * 1000)
    },
  })
  // autoUpdate: registerSW reloads the page when the new worker is in control.
  void update
}
