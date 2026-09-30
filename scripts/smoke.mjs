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

await step('Discover: tab order is Lounge Feed then People', async () => {
  await page.goto(BASE + '/discover')
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
  if (!bg.includes('data:image')) throw new Error('banner image not applied')
})

await step('Profile: banner survives reload', async () => {
  await page.reload()
  await page.waitForTimeout(600)
  const bg = await page.locator('[aria-label="Change banner"]').evaluate((b) => getComputedStyle(b.parentElement).backgroundImage)
  if (!bg.includes('data:image')) throw new Error('banner lost after reload')
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
  await page.getByRole('button', { name: 'Submit video' }).click()
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

console.log(results.join('\n'))
await browser.close()
