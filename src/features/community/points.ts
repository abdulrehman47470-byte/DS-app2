import { MEMBERS } from '@/data/mock/members'
import type { AppState } from '@/lib/store'
import type { CommunityState } from './store'
import type { Comment, ReactionKey } from './types'

/**
 * Stogie Points: reputation earned by contributing. Values are config (app_config in Phase 10)
 * and are computed server-side later so they can't be gamed from the client.
 */
export const POINT_RULES = [
  { key: 'posts', label: 'Post in the Lounge Feed', points: 10 },
  { key: 'articles', label: 'Publish a Stogie Blog article', points: 25 },
  { key: 'videos', label: 'Share a Stogie Session video', points: 20 },
  { key: 'reviews', label: 'Review a lounge', points: 15 },
  { key: 'pairings', label: 'Share a pairing', points: 10 },
  { key: 'events', label: 'Host an event', points: 20 },
  { key: 'checkins', label: 'Verified lounge check-in', points: 5 },
  { key: 'comments', label: 'Comment or reply', points: 2 },
  { key: 'reactions', label: 'Each reaction you receive', points: 1 },
] as const

export const LEVELS = [
  { name: 'Ember', min: 0 },
  { name: 'Leaf', min: 100 },
  { name: 'Band', min: 300 },
  { name: 'Box', min: 700 },
  { name: 'Humidor Master', min: 1500 },
]

const sum = (r: Partial<Record<ReactionKey, number>>) => Object.values(r).reduce((a, b) => a + (b ?? 0), 0)

function countComments(all: Comment[], who: string): number {
  return all.reduce((n, x) => n + (x.authorId === who ? 1 : 0) + countComments(x.replies, who), 0)
}

export function breakdown(c: CommunityState, who: string) {
  const posts = c.posts.filter((p) => p.authorId === who)
  const articles = c.articles.filter((a) => a.authorId === who)
  const videos = c.videos.filter((v) => v.authorId === who)
  const reviews = c.loungeReviews.filter((r) => r.authorId === who).length + (who === 'me' ? Object.keys(c.reviews).length : 0)
  const pairings = c.pairings.filter((p) => p.authorId === who)
  const events = c.events.filter((e) => e.hostId === who).length
  const checkins = who === 'me' ? c.checkins.filter((x) => x.verified).length : 0
  const comments =
    c.posts.reduce((n, p) => n + countComments(p.comments, who), 0) +
    Object.values(c.threads).reduce((n, t) => n + countComments(t, who), 0)
  const reactions = [...posts, ...articles, ...videos, ...pairings].reduce((n, x) => n + sum(x.reactions), 0)
  return { posts: posts.length, articles: articles.length, videos: videos.length, reviews, pairings: pairings.length, events, checkins, comments, reactions }
}

export function pointsFor(c: CommunityState, who: string, state?: AppState) {
  const b = breakdown(c, who)
  let total = POINT_RULES.reduce((n, r) => n + b[r.key] * r.points, 0)
  // Mock history for sample members so the leaderboard looks lived-in.
  const m = MEMBERS.find((x) => x.id === who)
  if (m) total += m.yearsSmoking * 35
  if (who === 'me' && state) total += 40 // profile completed bonus
  const level = [...LEVELS].reverse().find((l) => total >= l.min)!
  const next = LEVELS[LEVELS.indexOf(level) + 1]
  const progress = next ? ((total - level.min) / (next.min - level.min)) * 100 : 100
  return { total, level, next, progress, breakdown: b }
}

export function leaderboard(c: CommunityState, state: AppState) {
  return ['me', ...MEMBERS.map((m) => m.id)]
    .map((id) => ({ id, ...pointsFor(c, id, state) }))
    .sort((a, b) => b.total - a.total)
}
