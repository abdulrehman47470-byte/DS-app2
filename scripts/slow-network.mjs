// Slow-network check: every screen file arrives 2.5 s late (like a weak phone signal).
// Walks the whole sign-up flow on Android + iPhone and fails if any screen is blank/white.
// Usage: npm run build && npm run preview, then: npm run test:slow
const BASE = process.env.BASE_URL ?? 'http://localhost:4180'
import { chromium, webkit, devices } from 'playwright'
let failures = 0
for (const [name, bt, dev] of [['Android', chromium, devices['Pixel 7']], ['iPhone', webkit, devices['iPhone 13']]]) {
  const b = await bt.launch()
  const ctx = await b.newContext({ ...dev, serviceWorkers: 'block' })
  const p = await ctx.newPage()
  await p.route(/\/assets\/[A-Z][A-Za-z]+-[\w-]+\.js$/, async (r) => { await new Promise((s) => setTimeout(s, 2500)); await r.continue() })
  const blank = async (label) => {
    await p.waitForTimeout(3500)
    const hidden = await p.evaluate(() => [...document.querySelectorAll('#root *')].some((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().height > 300))
    const txt = (await p.locator('#root').innerText()).replace(/\s+/g, ' ').slice(0, 40)
    const bad = hidden || !txt
    if (bad) failures++
    console.log(bad ? 'FAIL' : 'PASS', name.padEnd(8), label.padEnd(14), '|', txt)
  }
  await p.goto(BASE + '/'); await p.getByRole('button', { name: 'Sign Up' }).click(); await blank('signup')
  await p.getByRole('button', { name: /Continue with Google/ }).click(); await blank('age')
  await p.getByLabel('Month').selectOption('3'); await p.getByLabel('Day').selectOption('15'); await p.getByLabel('Year').selectOption('1990')
  await p.getByRole('button', { name: 'Continue' }).click(); await blank('identity')
  await p.getByRole('checkbox').check(); await p.getByRole('button', { name: /Simulate capture/ }).click(); await p.waitForTimeout(2200)
  await p.getByRole('button', { name: 'Continue' }).click(); await blank('ethics')
  await p.getByRole('checkbox').check(); await p.getByRole('button', { name: 'Continue' }).click(); await blank('photo')
  await p.locator('input[type=file]').first().setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: await p.screenshot() }); await p.waitForTimeout(800)
  await p.getByRole('button', { name: 'Continue' }).click(); await blank('subscribe')
  await p.getByRole('button', { name: /Continue to Payment/ }).click(); await blank('profile 1')
  await p.getByRole('button', { name: 'Next' }).click(); await blank('profile 2')
  await p.getByRole('button', { name: 'Next' }).click(); await blank('profile 3')
  await p.getByRole('button', { name: /Finish/ }).click(); await blank('discover')
  await b.close()
}
if (failures) { console.log(failures + ' blank screen(s)'); process.exit(1) }
