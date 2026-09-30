// Sign-up flow + key screens in iPhone (WebKit) and Android (Chrome) emulation.
// Usage: node scripts/mobile.mjs [baseUrl]   (default: production preview on 4180)
const BASE = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4180'
import { webkit, chromium, devices } from 'playwright'
for (const [name, bt, dev] of [['iPhone/WebKit', webkit, devices['iPhone 13']], ['Android/Chrome', chromium, devices['Pixel 7']]]) {
  const b = await bt.launch()
  const ctx = await b.newContext({ ...dev })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()))
  const snap = async (label) => console.log(name, label, '|', p.url().replace(BASE, ''), '|', ((await p.locator('#root').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 60)) || '<<BLANK>>')
  try {
    await p.goto(BASE + '/signup'); await p.waitForTimeout(800)
    await p.getByRole('button', { name: /Continue with Google/ }).click()
    await p.getByRole('dialog').getByRole('button', { name: /@gmail/ }).click()
    await p.getByRole('dialog').getByRole('button', { name: 'Continue' }).click(); await p.waitForTimeout(1500)
    await p.getByLabel('Month').selectOption('3'); await p.getByLabel('Day').selectOption('15'); await p.getByLabel('Year').selectOption('1990')
    await p.getByRole('button', { name: 'Continue' }).click(); await p.waitForTimeout(1200); await snap('identity')
    await p.getByRole('checkbox').check()
    await p.getByRole('button', { name: 'Open camera' }).click(); await p.waitForTimeout(1500); await snap('open camera')
    await p.getByRole('button', { name: /Simulate capture|Capture/ }).first().click(); await p.waitForTimeout(2500); await snap('captured')
    await p.getByRole('button', { name: 'Continue' }).click(); await p.waitForTimeout(900)
    await p.getByRole('checkbox').check(); await p.getByRole('button', { name: 'Continue' }).click(); await p.waitForTimeout(900); await snap('photo page')
    for (const r of ['/discover', '/discover?view=people', '/member/m1', '/profile', '/settings/search', '/settings/blog/write', '/messages/m1', '/onboarding/2']) {
      await p.goto(BASE + r); await p.waitForTimeout(1200); await snap(r)
    }
  } catch (e) { console.log(name, 'STEP FAILED:', e.message.split('\n')[0]) }
  console.log(name, 'errors:', errs.length ? '\n  ' + errs.join('\n  ') : 'none')
  await b.close()
}
