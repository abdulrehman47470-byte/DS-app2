export type ReactionKey = 'cheers' | 'wellSaid' | 'smokeRing' | 'fire' | 'salute'

export const REACTIONS: { key: ReactionKey; label: string; emoji: string }[] = [
  { key: 'cheers', label: 'Cheers', emoji: '🥃' },
  { key: 'wellSaid', label: 'Well Said', emoji: '👏' },
  { key: 'smokeRing', label: 'Smoke Ring', emoji: '💨' },
  { key: 'fire', label: 'Fire', emoji: '🔥' },
  { key: 'salute', label: 'Salute', emoji: '🫡' },
]

export const TOPICS = ['Tasting', 'Pairing', 'Humidor', 'Events', 'Gear', 'Lounges', 'Newbie Questions', 'Off-Topic']

export type PostType = 'update' | 'question' | 'poll' | 'smoke' | 'event'

export interface SmokeReport {
  brand: string
  line: string
  vitola: string
  ringGauge: string
  length: string
  wrapper: string
  origin: string
  strength: number
  flavors: string[]
  pairing: string
  smokeTime: string
  construction: number
  rating: number
  notes: string
}

export interface Comment {
  id: string
  authorId: string
  text: string
  at: string
  reactions: Partial<Record<ReactionKey, number>>
  replies: Comment[]
}

export interface Post {
  id: string
  authorId: string // 'me' or a member id
  type: PostType
  text: string
  topic?: string
  loungeId?: string
  /** Generated still-life tones (mock) or data URLs of uploaded photos. */
  photos: { tone?: number; src?: string }[]
  video?: { kind: 'link' | 'upload'; url: string }
  music?: string
  poll?: { options: string[]; votes: number[]; days: number }
  smoke?: SmokeReport
  eventId?: string
  at: string
  metro: string
  reactions: Partial<Record<ReactionKey, number>>
  reactors: string[] // member ids, for the "who reacted" sheet
  comments: Comment[]
  pendingReview?: boolean
}

export interface CigarEvent {
  id: string
  title: string
  description: string
  loungeId?: string
  venue?: string
  date: string // ISO
  capacity: number
  visibility: 'Everyone' | 'My matches' | 'Mentors'
  hostId: string
  going: string[]
  maybe: string[]
}

export interface JournalEntry extends SmokeReport {
  id: string
  date: string
  status: 'Smoked' | 'In my humidor'
  purchaseDate?: string
  humidor?: string
  agingStart?: string
  readyDate?: string
}

export interface AppNotification {
  id: string
  type: NotificationType
  text: string
  at: string
  link: string
  actorId?: string
}

export type NotificationType =
  | 'match'
  | 'message'
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'event'
  | 'moderation'

export const NOTIFICATION_TYPES: { key: NotificationType; label: string }[] = [
  { key: 'match', label: 'New matches' },
  { key: 'message', label: 'New messages' },
  { key: 'reaction', label: 'Reactions' },
  { key: 'comment', label: 'Comments' },
  { key: 'reply', label: 'Replies' },
  { key: 'mention', label: 'Mentions' },
  { key: 'event', label: 'Event RSVPs & reminders' },
  { key: 'moderation', label: 'Moderation updates' },
]

/** Stogie Blog article. authorId 'staff' = Daily Stogie editorial. */
export interface Article {
  id: string
  slug: string
  authorId: string
  title: string
  cover: { tone?: number; src?: string }
  category: string
  body: string // light markdown: paragraphs, ## headings, - lists, **bold**
  at: string
  readMins: number
  pendingReview?: boolean
  reactions: Partial<Record<ReactionKey, number>>
  reactors: string[]
}

export const BLOG_CATEGORIES = ['News', 'Tips', 'Reviews', 'Pairing', 'Humidor', 'Brands', 'Lifestyle', 'Travel']

/** Member-submitted Stogie Session video. */
export interface MemberVideo {
  id: string
  authorId: string
  title: string
  description: string
  category: string
  video: { kind: 'link' | 'upload'; url: string }
  tone: number
  at: string
  pendingReview?: boolean
  reactions: Partial<Record<ReactionKey, number>>
  reactors: string[]
}

export interface CommunityPairing {
  id: string
  authorId: string
  cigar: string
  strength: string
  drink: string
  note: string
  at: string
  reactions: Partial<Record<ReactionKey, number>>
  reactors: string[]
}

export interface LoungeReview {
  id: string
  loungeId: string
  authorId: string
  rating: number
  tags: string[]
  pairingMenu: number
  tips: string
  photo?: string
  at: string
  reactions: Partial<Record<ReactionKey, number>>
  reactors: string[]
}
