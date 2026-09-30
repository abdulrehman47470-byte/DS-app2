// Smoothness check on a simulated mid-range phone (4x slower CPU).
// Measures dropped frames while scrolling/animating and how fast taps respond.
// Button positions are looked up BEFORE each measured window and the measured interaction uses
// raw taps/keys only, so the test tool's own work doesn't land in the frames being counted.
// Usage: npm run build && npm run preview, then: npm run test:smooth [baseUrl]
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4180'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)

await page.addInitScript(() => {
  window.__frames = []
  let last = 0
  const tick = (t) => {
    if (window.__rec) window.__frames.push(t - last)
    last = t
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const rows = []
const taps = []
const center = async (loc) => {
  const b = await loc.boundingBox()
  return [b.x + b.width / 2, b.y + b.height / 2]
}
async function measure(label, fn) {
  await page.evaluate(() => {
    window.__frames = []
    window.__rec = true
  })
  await fn()
  const f = await page.evaluate(() => {
    window.__rec = false
    return window.__frames.slice(1)
  })
  const n = f.length || 1
  rows.push({
    test: label,
    fps: Math.round(1000 / (f.reduce((a, b) => a + b, 0) / n)),
    'dropped frames %': Math.round((f.filter((d) => d > 20).length / n) * 100),
    'worst frame ms': Math.round(Math.max(0, ...f)),
  })
}
// Tap at a precomputed point; time (inside the page) until an element matching `selector` exists.
async function tapUntil(label, [x, y], selector) {
  const t = await page.evaluate(
    ([x, y, selector]) =>
      new Promise((resolve) => {
        const t0 = performance.now()
        document.elementFromPoint(x, y)?.closest('a,button')?.click()
        const give = setTimeout(() => resolve(-1), 5000)
        const check = () => (document.querySelector(selector) ? (clearTimeout(give), resolve(performance.now() - t0)) : requestAnimationFrame(check))
        requestAnimationFrame(check)
      }),
    [x, y, selector],
  )
  taps.push({ tap: label, 'ms until shown': Math.round(t) })
}

await page.goto(BASE + '/discover')
await page.getByText('Share something with the lounge').waitFor()
await page.waitForTimeout(4000)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

await measure('Scroll the Lounge Feed', async () => {
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 260)
    await page.waitForTimeout(90)
  }
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, -260)
    await page.waitForTimeout(90)
  }
})
await page.waitForTimeout(500)

const tabPts = {}
for (const t of ['Nearby', 'Mentors', 'For You']) tabPts[t] = await center(page.getByRole('tab', { name: t }))
await measure('Switch feed tabs (For You / Nearby / Mentors)', async () => {
  for (const t of ['Nearby', 'Mentors', 'For You']) {
    await page.mouse.click(...tabPts[t])
    await page.waitForTimeout(400)
  }
})

await tapUntil('Open People tab', await center(page.getByRole('tab', { name: 'People' })), '[aria-label$="% match"]')
await page.waitForTimeout(800)
await measure('Swipe 3 Discover cards', async () => {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(700)
  }
})

const nav = (href) => center(page.locator(`nav[aria-label=Main] a[href="${href}"]`).last())
const msgPt = await nav('/messages')
const profPt = await nav('/profile')
await tapUntil('Messages tab', msgPt, 'input[aria-label="Search conversations"]')
await page.waitForTimeout(600)
await tapUntil('Profile tab', profPt, '[aria-label="Profile completeness"]')
await page.waitForTimeout(600)
await measure('Scroll My Profile', async () => {
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(90)
  }
})

await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
await page.goto(BASE + '/onboarding/2')
await page.getByText('Lounge & Atmosphere').first().waitFor()
await page.waitForTimeout(1500)
const chipPts = []
for (const name of ['Quiet', 'Relaxed', 'Social', 'Casual', 'Lively', 'Upscale']) chipPts.push(await center(page.getByRole('button', { name, exact: true }).first()))
const secPt = await center(page.getByRole('button', { name: /Favorite Brands/ }).first())
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await measure('Tap preference chips', async () => {
  for (const pt of chipPts) {
    await page.mouse.click(...pt)
    await page.waitForTimeout(150)
  }
})
await measure('Open a preference section', async () => {
  await page.mouse.click(...secPt)
  await page.waitForTimeout(500)
})

console.log(`\n${BASE}  (simulated phone: 4x slower CPU)  target: 60 fps, 0% dropped`)
console.table(rows)
console.table(taps)
await browser.close()
