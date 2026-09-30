// Form responsiveness on a simulated phone (4x slower CPU): how long each keystroke/tap takes
// from input to the next painted frame, measured by the browser itself (Event Timing API).
// Good: under 50 ms per interaction. Also flags inputs with text under 16px (iPhone zooms on those).
// Usage: npm run build && npm run preview, then: npm run test:forms [baseUrl]
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4180'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await page.addInitScript(() => {
  window.__ev = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (['keydown', 'keypress', 'keyup', 'input', 'pointerdown', 'pointerup', 'click', 'change'].includes(e.name)) window.__ev.push({ name: e.name, d: e.duration, id: e.interactionId })
  }).observe({ type: 'event', durationThreshold: 16, buffered: true })
})

const rows = []
async function measure(label, fn) {
  await page.evaluate(() => (window.__ev = []))
  await fn()
  await page.waitForTimeout(300)
  const ev = await page.evaluate(() => window.__ev)
  // group by interaction, take the longest event of each
  const byId = new Map()
  for (const e of ev) if (e.id) byId.set(e.id, Math.max(byId.get(e.id) ?? 0, e.d))
  const d = [...byId.values()]
  rows.push({
    form: label,
    'slow interactions (>50ms)': d.filter((x) => x > 50).length,
    'worst ms': Math.round(Math.max(0, ...d)),
    'avg ms (of >16ms ones)': d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : 0,
  })
}
const slow = () => cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
const fast = () => cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })

// Profile step 1
await page.goto(BASE + '/onboarding/1')
await page.getByLabel('Full name').waitFor()
await page.waitForTimeout(1500)
const small = await page.evaluate(() =>
  [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea, select')]
    .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
    .map((el) => el.getAttribute('aria-label') || el.id || el.getAttribute('placeholder') || el.tagName),
)
await slow()
await measure('Profile: type name', async () => {
  await page.getByLabel('Full name').fill('')
  await page.getByLabel('Full name').pressSequentially('Alexander Hamilton', { delay: 60 })
})
await measure('Profile: type bio', async () => {
  await page.getByLabel('Biography').fill('')
  await page.getByLabel('Biography').pressSequentially('Weekend lounge regular who loves maduros.', { delay: 60 })
})
await measure('Profile: city + zip', async () => {
  await page.getByLabel('City', { exact: true }).fill('')
  await page.getByLabel('City', { exact: true }).pressSequentially('Fort Lauderdale', { delay: 60 })
  await page.getByLabel('ZIP code', { exact: true }).fill('')
  await page.getByLabel('ZIP code', { exact: true }).pressSequentially('33301', { delay: 60 })
})
await measure('Profile: pick dropdowns', async () => {
  await page.getByLabel('Pronouns', { exact: true }).selectOption('They / Them')
  await page.getByLabel('Gender preference').selectOption('Woman')
  await page.getByLabel('Country', { exact: true }).selectOption('Canada')
})
await fast()

// Sign-up email form
await page.goto(BASE + '/signup')
await page.getByLabel('Email address', { exact: true }).waitFor()
await page.waitForTimeout(800)
await slow()
await measure('Sign-up: type email + password', async () => {
  await page.getByLabel('Email address', { exact: true }).pressSequentially('member@example.com', { delay: 60 })
  await page.getByLabel('Password', { exact: true }).pressSequentially('supersecret1', { delay: 60 })
})
await fast()

// Checkout form
await page.goto(BASE + '/subscribe')
await page.getByRole('button', { name: /Continue to Payment/ }).click()
await page.getByLabel('Card number').waitFor()
await page.waitForTimeout(600)
small.push(
  ...(await page.evaluate(() =>
    [...document.querySelectorAll('[role=dialog] input:not([type=checkbox]), [role=dialog] select')]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => 'checkout: ' + (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.tagName)),
  )),
)
await slow()
await measure('Checkout: type card details', async () => {
  await page.getByLabel('Card number').pressSequentially('4242424242424242', { delay: 50 })
  await page.getByLabel('Expiry date').pressSequentially('1230', { delay: 50 })
  await page.getByLabel('CVC').pressSequentially('123', { delay: 50 })
})
await fast()

console.log(`\n${BASE}  (simulated phone: 4x slower CPU)  target: 0 slow interactions`)
console.table(rows)
console.log(small.length ? `Inputs under 16px (iPhone zooms in on these): ${small.length}\n  ${small.join(', ')}` : 'All inputs are 16px+ (no iPhone zoom on focus)')
await browser.close()
