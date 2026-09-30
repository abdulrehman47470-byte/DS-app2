import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { EVENTS, JOURNAL, NOTIFICATIONS, POSTS } from '@/data/mock/community'
import { ARTICLES, LOUNGE_REVIEWS, MEMBER_VIDEOS, PAIRINGS, THREADS } from '@/data/mock/memberContent'
import { load, saveSoon } from '@/lib/storage'
import { DEFAULT_FLAGS, type FlagKey } from './flags'
import type { AppNotification, Article, CigarEvent, Comment, CommunityPairing, JournalEntry, LoungeReview, MemberVideo, NotificationType, Post, ReactionKey } from './types'

export interface CommunityState {
  flags: Record<FlagKey, boolean>
  posts: Post[]
  events: CigarEvent[]
  journal: JournalEntry[]
  notifications: AppNotification[]
  readNotifications: string[]
  notificationSettings: Record<NotificationType, boolean>
  webPush: boolean
  /** itemId (post or comment) -> my reaction */
  myReactions: Record<string, ReactionKey>
  votes: Record<string, number>
  saved: string[]
  hidden: string[]
  rsvp: Record<string, 'Going' | 'Maybe' | "Can't go">
  travel: { city: string; from: string; to: string } | null
  nowSmoking: { text: string; music: string; until: number } | null
  soundtrack: string
  checkins: { loungeId: string; at: number; visibleTo: 'Matches' | 'Mentors' | 'Matches & mentors'; verified: boolean }[]
  reviews: Record<string, { rating: number; tags: string[]; pairingMenu: number; tips: string }>
  favorites: string[]
  postsToday: number
  /** New members' first posts go to review (config value). */
  reviewFirstPosts: number
  articles: Article[]
  videos: MemberVideo[]
  pairings: CommunityPairing[]
  loungeReviews: LoungeReview[]
  /** Comments on articles, videos, events, pairings and reviews, keyed by item id. */
  threads: Record<string, Comment[]>
}

const DEFAULT: CommunityState = {
  flags: DEFAULT_FLAGS,
  posts: POSTS,
  events: EVENTS,
  journal: JOURNAL,
  notifications: NOTIFICATIONS,
  readNotifications: [],
  notificationSettings: { match: true, message: true, reaction: true, comment: true, reply: true, mention: true, event: true, moderation: true },
  webPush: false,
  myReactions: {},
  votes: {},
  saved: [],
  hidden: [],
  rsvp: {},
  travel: null,
  nowSmoking: null,
  soundtrack: '',
  checkins: [],
  reviews: {},
  favorites: [],
  postsToday: 0,
  reviewFirstPosts: 3,
  articles: ARTICLES,
  videos: MEMBER_VIDEOS,
  pairings: PAIRINGS,
  loungeReviews: LOUNGE_REVIEWS,
  threads: THREADS,
}

export const LIMITS = { postsPerDay: 10, commentsPerDay: 60, reactionsPerDay: 300, postChars: 1500, commentChars: 500 }

interface Ctx {
  c: CommunityState
  setC: (patch: Partial<CommunityState> | ((s: CommunityState) => Partial<CommunityState>)) => void
  on: (flag: FlagKey) => boolean
  resetCommunity: () => void
}

const CommunityCtx = createContext<Ctx | null>(null)
const KEY = 'daily-stogie:community:v3'

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [c, setState] = useState<CommunityState>(() => load(KEY, DEFAULT))
  useEffect(() => {
    saveSoon(KEY, c)
  }, [c])
  const setC = useCallback<Ctx['setC']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])
  const on = useCallback((flag: FlagKey) => !!c.flags[flag], [c.flags])
  const resetCommunity = useCallback(() => setState({ ...DEFAULT, flags: c.flags }), [c.flags])
  const value = useMemo(() => ({ c, setC, on, resetCommunity }), [c, setC, on, resetCommunity])
  return <CommunityCtx.Provider value={value}>{children}</CommunityCtx.Provider>
}

export function useCommunity() {
  const ctx = useContext(CommunityCtx)
  if (!ctx) throw new Error('useCommunity must be used inside CommunityProvider')
  return ctx
}
