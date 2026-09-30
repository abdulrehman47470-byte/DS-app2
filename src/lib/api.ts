/**
 * Typed data-access layer. Components only call these functions (through TanStack Query),
 * so Phases 1-8 can swap the mock bodies for Supabase queries without touching the UI.
 */
import { BLOG_POSTS, CONVERSATIONS, LOUNGES, SESSIONS } from '@/data/mock/content'
import { MEMBERS } from '@/data/mock/members'
import type { AppState } from './store'
import type { Conversation, Member, ScoredMember } from '@/types'

// Sample data is on the device, so it resolves immediately. Set VITE_MOCK_LATENCY (ms) to preview loading states.
const LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? 0)
const delay = (ms = LATENCY) => (ms > 0 ? new Promise((r) => setTimeout(r, Math.min(ms, LATENCY))) : Promise.resolve())

type MeLike = Pick<AppState, 'prefs' | 'about'>

const asArr = (v: unknown): string[] => (Array.isArray(v) ? v : v ? [String(v)] : [])

/**
 * Mock of the Postgres scoring function (Phase 4). Weighted overlap of cigar
 * preferences, interests and proximity. Sensitive fields are never used.
 */
export function scoreMember(me: MeLike, m: Member): ScoredMember {
  const pairs: [string[], string[], number][] = [
    [asArr(me.prefs.flavors), m.prefs.flavors, 3],
    [asArr(me.prefs.wrapper), m.prefs.wrappers, 2],
    [asArr(me.prefs.origin), m.prefs.origins, 2],
    [asArr(me.prefs.vitola), m.prefs.vitolas, 1.5],
    [asArr(me.prefs.brands), m.prefs.brands, 3],
    [asArr(me.prefs.pairings), m.prefs.pairings, 2],
    [asArr(me.prefs.venue), m.prefs.venues, 1],
    [asArr(me.prefs.socialStyle), m.prefs.socialStyle, 1],
    [asArr(me.about.hobbies), m.about.hobbies, 1.5],
    [asArr(me.about.sports), m.about.sports, 1],
    [asArr(me.about.music), m.about.music, 1],
    [asArr(me.about.languages), m.about.languages, 1],
  ]
  let got = 0
  let total = 0
  const shared: string[] = []
  for (const [a, b, w] of pairs) {
    const inter = a.filter((x) => b.includes(x))
    shared.push(...inter)
    total += w
    got += w * Math.min(1, inter.length / Math.max(1, Math.min(a.length, b.length)))
  }
  if (me.prefs.strength === m.prefs.strength) {
    got += 2
    shared.unshift(m.prefs.strength)
  }
  if (me.prefs.pace === m.prefs.pace) got += 1
  total += 3
  const match = Math.round(45 + (got / total) * 55)
  return { ...m, match: Math.min(98, match), shared: [...new Set(shared)] }
}

export async function getDeck(me: MeLike, exclude: string[]) {
  await delay()
  return MEMBERS.filter((m) => !exclude.includes(m.id)).map((m) => scoreMember(me, m))
}

export async function getMember(me: MeLike, id: string) {
  await delay(250)
  const m = MEMBERS.find((x) => x.id === id)
  if (!m) throw new Error('Member not found')
  return scoreMember(me, m)
}

export function memberById(id: string) {
  return MEMBERS.find((m) => m.id === id)
}

export async function getMentors(me: MeLike, mode: 'find' | 'guide', exclude: string[]) {
  await delay()
  const want =
    mode === 'find'
      ? ['Willing to Guide Beginners', 'Both']
      : ['Looking for a Mentor', 'Both']
  return MEMBERS.filter((m) => want.includes(m.mentorship) && !exclude.includes(m.id)).map((m) =>
    scoreMember(me, m),
  )
}

export async function getMatches(me: MeLike, ids: string[]) {
  await delay()
  return ids
    .map((id) => MEMBERS.find((m) => m.id === id))
    .filter((m): m is Member => !!m)
    .map((m) => {
      const convo = CONVERSATIONS.find((c) => c.memberId === m.id)
      return { ...scoreMember(me, m), conversation: convo }
    })
}

export async function getConversations(ids: string[]) {
  await delay()
  return CONVERSATIONS.filter((c) => ids.includes(c.memberId) && c.messages.length > 0)
}

export async function getConversation(id: string): Promise<Conversation> {
  await delay(250)
  const c = CONVERSATIONS.find((x) => x.id === id || x.memberId === id)
  if (c) return c
  return { id: `new-${id}`, memberId: id, matchedAt: 'Today', unread: 0, messages: [] }
}

export async function getLounges() {
  await delay()
  return LOUNGES
}

export async function getSessions() {
  await delay()
  return SESSIONS
}

export async function getBlogPosts() {
  await delay()
  return BLOG_POSTS
}
