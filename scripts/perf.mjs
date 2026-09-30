// Speed check on a simulated mid-range phone (4x CPU slowdown, 4G: 9 Mbps, 70 ms latency).
// Usage: npm run build && npm run preview, then: node scripts/perf.mjs [baseUrl]
// Measures: first open, tapping between screens, and re-opening the app (repeat visit).
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4180'
const RUNS = 3

async function phone(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 70, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (4 * 1024 * 1024) / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  let bytes = 0
  cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength))
  await page.addInitScript(() => {
    window.__lcp = 0
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp = e.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  return { ctx, page, bytes: () => bytes, reset: () => (bytes = 0) }
}

const vitals = (page) =>
  page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
    lcp: window.__lcp,
  }))

const browser = await chromium.launch()
const first = {}
const taps = {}
const repeat = []
const add = (o, k, v) => (o[k] ??= []).push(v)

for (let run = 0; run < RUNS; run++) {
  // First open of /discover on a fresh phone (nothing cached)
  const p = await phone(browser)
  await p.page.goto(BASE + '/discover', { waitUntil: 'load' })
  await p.page.waitForTimeout(1500)
  const v = await vitals(p.page)
  add(first, 'FCP ms', v.fcp)
  add(first, 'LCP ms', v.lcp)
  add(first, 'KB downloaded (first open)', p.bytes() / 1024)

  // Let background prefetch finish, then time taps between screens
  await p.page.waitForTimeout(3000)
  const targets = [
    ['Messages tab', () => p.page.locator('nav[aria-label=Main] a[href="/messages"]').last().click(), () => p.page.getByRole('heading', { name: 'Messages' }).waitFor()],
    ['Profile tab', () => p.page.locator('nav[aria-label=Main] a[href="/profile"]').last().click(), () => p.page.getByText('Profile Completeness').waitFor()],
    ['Settings', () => p.page.getByRole('link', { name: 'Settings' }).first().click(), () => p.page.getByText('Stogie Search').first().waitFor()],
    ['Stogie Blog', () => p.page.getByRole('link', { name: 'Stogie Blog' }).click(), () => p.page.getByText('Member writers').waitFor()],
    ['Discover tab', () => p.page.locator('nav[aria-label=Main] a[href="/discover"]').last().click(), () => p.page.getByText('Share something with the lounge').waitFor()],
  ]
  for (const [name, act, done] of targets) {
    const t0 = Date.now()
    await act()
    await done()
    add(taps, name, Date.now() - t0)
  }

  // Re-open the app (repeat visit): service worker + HTTP cache
  p.reset()
  const t0 = Date.now()
  await p.page.goto(BASE + '/discover', { waitUntil: 'load' })
  await p.page.getByText('Share something with the lounge').waitFor()
  repeat.push({ ms: Date.now() - t0, kb: p.bytes() / 1024 })
  await p.ctx.close()
}

const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length)
console.log(`\n${BASE}  (simulated phone: 4x slower CPU, 4G)`)
console.log('First open of Discover:')
for (const [k, a] of Object.entries(first)) console.log(`  ${k.padEnd(28)} ${avg(a)}`)
console.log('Tap to fully shown (ms):')
for (const [k, a] of Object.entries(taps)) console.log(`  ${k.padEnd(28)} ${avg(a)}   (runs: ${a.join(", ")})`)
console.log('Re-open app:')
console.log(`  ${'time to feed shown ms'.padEnd(28)} ${avg(repeat.map((r) => r.ms))}`)
console.log(`  ${'KB downloaded'.padEnd(28)} ${avg(repeat.map((r) => r.kb))}`)
await browser.close()
