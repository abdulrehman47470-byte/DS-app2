import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { execSync } from 'node:child_process'

// Build id shown in the app: Vercel's commit sha, else local git, else a timestamp.
function buildId() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  if (sha) return sha.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return new Date().toISOString().slice(0, 16)
  }
}

export default defineConfig({
  define: { __BUILD_ID__: JSON.stringify(buildId()) },
  plugins: [
    react(),
    tailwindcss(),
    // Installable PWA + service worker: after the first visit the app shell and every screen
    // open from the device cache, so repeat launches don't wait on the network.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered in src/lib/pwa.ts so updates reload the page
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Daily Stogie',
        short_name: 'Daily Stogie',
        description: 'A members-only 21+ network for cigar enthusiasts.',
        theme_color: '#F6F0E7',
        background_color: '#F6F0E7',
        display: 'standalone',
        start_url: '/discover',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the Latin woff2 fonts the app uses; other alphabets load on demand if ever needed.
        globPatterns: ['**/*.{js,css,html,svg,png}', '**/*-latin-[0-9]*.woff2'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/assets\//],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Map tiles: reuse ones already seen, keep the cache bounded.
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles', expiration: { maxEntries: 400, maxAgeSeconds: 7 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  server: { port: 5180, strictPort: true, host: true },
  preview: { port: 4180, strictPort: true, host: true },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        // Stable vendor files: they change rarely, so browsers keep them cached across deploys.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'router-query', test: /node_modules[\\/](react-router|react-router-dom|@tanstack)[\\/]/, priority: 20 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
            { name: 'leaflet', test: /node_modules[\\/](leaflet|leaflet\.markercluster)[\\/]/, priority: 20 },
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 20 },
            // Shared app code (components, data, stores) in one file instead of many tiny ones:
            // fewer round trips on a phone network.
            // (The Leaflet map component stays out, so the map library only loads on map screens.)
            {
              name: 'app',
              test: (id: string) => /[\\/]src[\\/](components|lib|data|features|types)[\\/]/.test(id) && !/LoungeMap/.test(id),
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
