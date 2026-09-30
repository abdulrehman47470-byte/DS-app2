// End-to-end smoke test of the interactive flows (uploads, posting, editing).
// Usage: npm run dev (in another terminal), then: node scripts/smoke.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5180'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

// A real JPEG to upload: a screenshot of the welcome page.
await page.goto(BASE + '/')
await page.waitForTimeout(800)
const jpeg = await page.screenshot({ type: 'jpeg', quality: 70 })
const file = (name) => ({ name, mimeType: 'image/jpeg', buffer: jpeg })

const results = []
async function step(name, fn) {
  const before = errors.length
  try {
    await fn()
    const newErrs = errors.slice(before)
    results.push(`${newErrs.length ? 'WARN' : 'PASS'}  ${name}${newErrs.length ? `\n        ${newErrs.join('\n        ')}` : ''}`)
  } catch (e) {
    results.push(`FAIL  ${name}\n        ${String(e.message).split('\n')[0]}`)
  }
}

// A real short video to upload: recorded in the browser from a canvas (WebM).
async function makeVideo() {
  const b64 = await page.evaluate(async () => {
    const c = document.createElement('canvas')
    c.width = 320
    c.height = 180
    const g = c.getContext('2d')
    const rec = new MediaRecorder(c.captureStream(24), { mimeType: 'video/webm' })
    const chunks = []
    rec.ondataavailable = (e) => chunks.push(e.data)
    rec.start()
    for (let i = 0; i < 30; i++) {
      g.fillStyle = `hsl(${i * 8} 60% 40%)`
      g.fillRect(0, 0, 320, 180)
      await new Promise((r) => setTimeout(r, 40))
    }
    rec.stop()
    await new Promise((r) => (rec.onstop = r))
    const buf = await new Blob(chunks, { type: 'video/webm' }).arrayBuffer()
    let bin = ''
    new Uint8Array(buf).forEach((x) => (bin += String.fromCharCode(x)))
    return btoa(bin)
  })
  return { name: 'clip.webm', mimeType: 'video/webm', buffer: Buffer.from(b64, 'base64') }
}
const clip = await makeVideo()

await step('Welcome: Sign Up and Log In are centered on the page', async () => {
  await page.goto(BASE + '/')
  await page.waitForTimeout(700) // let the entrance animation finish
  const vp = page.viewportSize()
  const up = await page.getByRole('button', { name: 'Sign Up' }).boundingBox()
  const login = await page.getByRole('button', { name: 'Log In' }).boundingBox()
  const midY = (up.y + login.y + login.height) / 2
  const midX = up.x + up.width / 2
  if (Math.abs(midX - vp.width / 2) > 4) throw new Error(`not horizontally centered (${midX} vs ${vp.width / 2})`)
  if (Math.abs(midY - vp.height / 2) > vp.height * 0.12) throw new Error(`not vertically centered (${Math.round(midY)} vs ${vp.height / 2})`)
  if (!(await page.locator('img[src="/logo-256.webp"]').first().isVisible())) throw new Error('logo missing')
})

await step('Google sign-in (demo): choose account, consent, lands on age check', async () => {
  await page.goto(BASE + '/signup')
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  const dlg = page.getByRole('dialog', { name: /Sign in with Google/ })
  await dlg.getByText('Choose an account').waitFor({ timeout: 3000 })
  await dlg.getByRole('button', { name: /@gmail\.com/ }).click()
  await dlg.getByText('wants to access your Google Account').waitFor()
  await dlg.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/\/verify\/age/, { timeout: 5000 })
})

await step('Google sign-in (demo): use another account', async () => {
  await page.goto(BASE + '/login')
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  const dlg = page.getByRole('dialog', { name: /Sign in with Google/ })
  await dlg.getByRole('button', { name: 'Use another account' }).click()
  await dlg.getByLabel('Email or phone').fill('cigar.lover@example.com')
  await dlg.getByRole('button', { name: 'Next' }).click()
  await dlg.getByText('cigar.lover@example.com').waitFor()
  await dlg.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/\/discover/, { timeout: 5000 })
})

await step('Payment (demo): pay with NO details, get receipt, continue', async () => {
  await page.goto(BASE + '/subscribe')
  await page.getByRole('button', { name: /Continue to Payment/ }).click()
  const dlg = page.getByRole('dialog', { name: /Checkout/ })
  await dlg.getByRole('button', { name: /^Pay \$/ }).click()
  await dlg.getByText('Payment successful').waitFor({ timeout: 5000 })
  await dlg.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/\/onboarding\/1/, { timeout: 5000 })
})

await step('Payment (demo): card details show Visa •••• 4242 on receipt', async () => {
  await page.goto(BASE + '/subscribe')
  await page.getByRole('radio', { name: /Monthly/ }).click()
  await page.getByRole('button', { name: /Continue to Payment/ }).click()
  const dlg = page.getByRole('dialog', { name: /Checkout/ })
  await dlg.getByLabel('Card number').fill('4242424242424242')
  await dlg.getByLabel('Expiry date').fill('1230')
  await dlg.getByLabel('CVC').fill('123')
  await dlg.getByRole('button', { name: /^Pay \$1\.99/ }).click()
  await dlg.getByText('Visa •••• 4242').waitFor({ timeout: 5000 })
  await dlg.getByRole('button', { name: 'Continue' }).click()
})

await step('Discover: tab order is Lounge Feed then People', async () => {
  await page.goto(BASE + '/discover')
  await page.getByRole('tab', { name: 'Lounge Feed' }).waitFor({ timeout: 5000 })
  const tabs = await page.getByRole('tab').allInnerTexts()
  if (tabs[0] !== 'Lounge Feed' || tabs[1] !== 'People') throw new Error(`tabs are ${JSON.stringify(tabs)}`)
})

await step('Discover: opens on Lounge Feed by default', async () => {
  await page.goto(BASE + '/discover')
  const selected = await page.getByRole('tab', { selected: true }).first().innerText()
  if (selected !== 'Lounge Feed') throw new Error(`default tab is ${selected}`)
  await page.getByText('Share something with the lounge').waitFor({ timeout: 3000 })
})

await step('Discover: People tab shows the swipe deck', async () => {
  await page.getByRole('tab', { name: 'People' }).click()
  await page.getByRole('button', { name: 'Like' }).waitFor({ timeout: 3000 })
  if (!page.url().includes('view=people')) throw new Error('People view not in URL')
})

await step('Profile: edit banner (upload)', async () => {
  await page.goto(BASE + '/profile')
  await page.getByRole('button', { name: 'Change banner' }).click({ timeout: 3000 })
  await page.getByRole('dialog', { name: 'Profile banner' }).waitFor({ timeout: 3000 })
  await page.locator('[role=dialog] input[type=file]').setInputFiles(file('banner.jpg'))
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Done' }).click()
  const bg = await page.locator('[aria-label="Change banner"]').evaluate((b) => getComputedStyle(b.parentElement).backgroundImage)
  if (!/url\("?(blob|data):/.test(bg)) throw new Error('banner image not applied')
})

await step('Profile: banner survives reload', async () => {
  await page.reload()
  await page.waitForTimeout(600)
  const bg = await page.locator('[aria-label="Change banner"]').evaluate((b) => getComputedStyle(b.parentElement).backgroundImage)
  if (!/url\("?(blob|data):/.test(bg)) throw new Error('banner lost after reload')
})

await step('Profile: change photo', async () => {
  await page.locator('input[type=file]').first().setInputFiles(file('me.jpg'))
  await page.waitForTimeout(800)
})

await step('Blog: write and submit article with cover', async () => {
  await page.goto(BASE + '/settings/blog/write')
  await page.locator('input[type=file]').setInputFiles(file('cover.jpg'))
  await page.waitForTimeout(800)
  await page.getByLabel('Title').fill('Best patio in Miami')
  await page.getByLabel('Article body').fill('I tried five lounges this month and this one stood out for its shade, staff and pour list. Here is why I keep coming back every weekend with friends.')
  await page.getByRole('button', { name: /Submit for review|Publish/ }).click()
  await page.waitForURL(/\/settings\/blog\/best-patio/, { timeout: 3000 })
  await page.getByText('Best patio in Miami').first().waitFor({ timeout: 2000 })
})

await step('Blog: comment on the article', async () => {
  await page.getByRole('button', { name: 'Add comment' }).click()
  await page.getByLabel('Comment', { exact: true }).fill('Testing a comment')
  await page.getByRole('button', { name: 'Post comment' }).click()
  await page.getByText('Testing a comment').first().waitFor({ timeout: 2000 })
  await page.keyboard.press('Escape')
})

await step('Blog: article persists after reload', async () => {
  await page.reload()
  await page.getByText('Best patio in Miami').first().waitFor({ timeout: 3000 })
})

await step('Feed: post with photo', async () => {
  await page.goto(BASE + '/discover?view=feed')
  await page.getByText('Share something with the lounge').click()
  await page.getByLabel('Post text').fill('Hello lounge, first post with a photo')
  await page.locator('[role=dialog] input[type=file][accept="image/*"]').setInputFiles(file('p.jpg'))
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Post', exact: true }).click()
  await page.getByText('Hello lounge, first post with a photo').first().waitFor({ timeout: 3000 })
})

await step('Sessions: share a video link', async () => {
  await page.goto(BASE + '/settings/sessions')
  await page.getByRole('button', { name: 'Share' }).click()
  await page.getByLabel('Video link').fill('https://vimeo.com/76979871')
  await page.getByLabel('Title').fill('My humidor tour')
  await page.getByRole('button', { name: 'Publish video' }).click()
  await page.waitForURL(/\/settings\/sessions\/v\d+/, { timeout: 3000 })
})

await step('Stogie Search: review with photo', async () => {
  await page.goto(BASE + '/settings/search?lounge=l1')
  await page.getByRole('button', { name: /Write a review|Edit your review/ }).click()
  await page.getByRole('radio', { name: '5 of 5' }).first().click()
  await page.locator('[role=dialog] input[type=file]').setInputFiles(file('r.jpg'))
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Submit review' }).click()
})

await step('Pairing: share a pairing', async () => {
  await page.goto(BASE + '/pairing')
  await page.getByRole('button', { name: 'Share yours' }).click()
  await page.getByLabel('Cigar').fill('Oliva Serie V')
  await page.getByLabel('Drink').fill('Rye')
  await page.getByRole('button', { name: 'Share pairing' }).click()
  await page.getByText('Oliva Serie V').first().waitFor({ timeout: 2000 })
})

await step('Events: create an event', async () => {
  await page.goto(BASE + '/events')
  await page.getByRole('button', { name: 'Create' }).first().click()
  await page.getByLabel('Title').fill('Test cigar night')
  await page.getByLabel('Lounge').selectOption('l1')
  const d = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)
  await page.getByLabel('Date').fill(d)
  await page.getByRole('button', { name: 'Create event' }).click()
  await page.waitForURL(/\/events\/e\d+/, { timeout: 3000 })
})

await step('Journal: add entry', async () => {
  await page.goto(BASE + '/journal')
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByLabel('Brand').selectOption('Padrón')
  await page.getByRole('button', { name: 'Save' }).click()
})

await step('Chat: send message + safe meet spot', async () => {
  await page.goto(BASE + '/messages/m1')
  await page.getByLabel('Message').fill('Hi there')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByRole('button', { name: 'Suggest a lounge to meet' }).click()
  await page.locator('[role=dialog] button:has-text("mi from you")').first().click()
  await page.getByRole('button', { name: 'Send suggestion' }).click()
})

await step('Feed: upload a video, it shows instantly and plays', async () => {
  await page.goto(BASE + '/discover')
  await page.getByText('Share something with the lounge').click()
  await page.getByRole('button', { name: 'Add video' }).click()
  await page.getByRole('dialog').getByText('Upload clip').click()
  await page.locator('[role=dialog] input[type=file][accept^="video"]').setInputFiles(clip)
  await page.locator('[role=dialog] video').waitFor({ timeout: 3000 })
  await page.getByLabel('Post text').fill('My first video post')
  await page.getByRole('button', { name: 'Post', exact: true }).click()
  const card = page.locator('article', { hasText: 'My first video post' }).first()
  await card.locator('video').waitFor({ timeout: 2000 })
  const src = await card.locator('video').getAttribute('src')
  if (!src?.startsWith('blob:')) throw new Error('video not attached: ' + src)
})

await step('Feed: uploaded video survives reload', async () => {
  await page.reload()
  const card = page.locator('article', { hasText: 'My first video post' }).first()
  await card.locator('video').waitFor({ timeout: 4000 })
  const ok = await card.locator('video').evaluate((v) => new Promise((r) => { if (v.readyState >= 1) r(true); v.onloadedmetadata = () => r(true); v.onerror = () => r(false); setTimeout(() => r(v.readyState >= 1), 4000) }))
  if (!ok) throw new Error('video does not load after reload')
})

await step('Feed: delete the video post', async () => {
  const card = page.locator('article', { hasText: 'My first video post' }).first()
  await card.getByRole('button', { name: 'Post options' }).click()
  await card.getByText('Delete').click()
  await page.waitForTimeout(300)
  if (await page.locator('article', { hasText: 'My first video post' }).count()) throw new Error('post still there')
})

await step('Sessions: upload a video file, it publishes instantly', async () => {
  await page.goto(BASE + '/settings/sessions')
  await page.getByRole('button', { name: 'Share' }).click()
  await page.getByRole('dialog').getByText('Upload', { exact: true }).click()
  await page.locator('[role=dialog] input[type=file]').setInputFiles(clip)
  await page.locator('[role=dialog] video').waitFor({ timeout: 3000 })
  await page.getByLabel('Title').fill('Uploaded humidor clip')
  await page.getByRole('button', { name: 'Publish video' }).click()
  await page.waitForURL(/\/settings\/sessions\/v\d+/, { timeout: 3000 })
  await page.locator('video').first().waitFor({ timeout: 3000 })
  if (await page.getByText('In review').count()) throw new Error('still marked In review')
})

await step('Sessions: delete my uploaded video', async () => {
  await page.getByRole('button', { name: 'Delete video' }).click()
  await page.waitForURL(/\/settings\/sessions$/, { timeout: 3000 })
  if (await page.getByText('Uploaded humidor clip').count()) throw new Error('video still listed')
})

await step('Pairing: delete my pairing', async () => {
  await page.goto(BASE + '/pairing')
  await page.getByText('Oliva Serie V').first().waitFor({ timeout: 2000 })
  await page.getByRole('button', { name: 'Delete pairing' }).first().click()
  await page.waitForTimeout(300)
  if (await page.getByText('Oliva Serie V').count()) throw new Error('pairing still there')
})

await step('Stogie Search: delete my review', async () => {
  await page.goto(BASE + '/settings/search?lounge=l1')
  await page.getByRole('button', { name: 'Edit your review' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('button', { name: 'Write a review' }).waitFor({ timeout: 2000 })
})

console.log(results.join('\n'))
await browser.close()
