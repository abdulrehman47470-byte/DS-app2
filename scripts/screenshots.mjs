// Visual QA: screenshots every screen in both themes at phone and desktop sizes.
// Usage: npm run dev (in another terminal), then: node scripts/screenshots.mjs [filter]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5180'
const ROUTES = [
  '/', '/signup', '/login', '/verify/age', '/verify/not-eligible', '/verify/identity', '/ethics', '/photo',
  '/subscribe', '/onboarding/1', '/onboarding/2', '/onboarding/3', '/discover', '/member/m1', '/mentors',
  '/matches', '/messages', '/messages/m1', '/profile', '/settings', '/settings/search', '/settings/sessions',
  '/settings/sessions/s1', '/settings/blog', '/settings/blog/perfect-cigar-pairing', '/legal/terms',
  '/settings/refer', '/settings/delete', '/admin', '/states', '/screens',
  '/discover?view=feed', '/events', '/events/e1', '/journal', '/notifications', '/pairing', '/nearby', '/passport', '/travel', '/messages/m9',
]
const filter = process.argv[2]
const sizes = [['phone', 390, 844], ['desktop', 1280, 800]]
mkdirSync('docs/screens', { recursive: true })
const browser = await chromium.launch()
for (const theme of ['light', 'dark']) {
  for (const [label, width, height] of sizes) {
    const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, deviceScaleFactor: 1 })
    // The app defaults to Light; force the saved theme for the dark pass.
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('daily-stogie:v2', JSON.stringify({ theme: t }))
      } catch {}
    }, theme)
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    for (const r of ROUTES.filter((x) => !filter || x.includes(filter))) {
      await page.goto(BASE + r)
      await page.waitForTimeout(/search|nearby|events\/|travel/.test(r) ? 2500 : 900)
      const name = (r === '/' ? 'welcome' : r.slice(1).replaceAll('/', '_').replace('?view=', '-')) + `.${theme}.${label}.png`
      await page.screenshot({ path: `docs/screens/${name}` })
    }
    if (errors.length) console.log(theme, label, 'errors:', errors)
    await ctx.close()
  }
}
await browser.close()
console.log('done')
