import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/400-italic.css'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorReporter } from './components/ErrorReporter'
import { setupPwa } from './lib/pwa'
import { AppProvider } from './lib/store'
import { CommunityProvider } from './features/community/store'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <CommunityProvider>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
            <App />
            <ErrorReporter />
          </MotionConfig>
        </BrowserRouter>
        </CommunityProvider>
      </AppProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Offline cache: registered once every screen has been prefetched, so its background downloads
// never compete with screens the member is about to open (fallback: 8 s after load).
if (import.meta.env.PROD) {
  let started = false
  const start = () => {
    if (started) return
    started = true
    setupPwa()
  }
  window.addEventListener('ds:prefetched', start, { once: true })
  window.addEventListener('load', () => setTimeout(start, 8000), { once: true })
}
