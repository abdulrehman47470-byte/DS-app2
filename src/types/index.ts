export type UserType = 'Beginner' | 'Intermediate' | 'Advanced' | 'Aficionado' | 'Collector'

export type MentorRole = 'Willing to Guide Beginners' | 'Looking for a Mentor' | 'Both' | 'Neither'

export interface Member {
  id: string
  firstName: string
  lastName: string
  age: number
  pronouns: string
  city: string
  state: string
  userType: UserType
  verified: boolean
  bio: string
  yearsSmoking: number
  mentorship: MentorRole
  mentorTopics: string[]
  meetup: string
  /** Hue seed for the generated portrait placeholder. */
  tone: number
  likesYou: boolean
  lastActive: string
  prefs: {
    strength: string
    flavors: string[]
    wrappers: string[]
    origins: string[]
    vitolas: string[]
    brands: string[]
    pairings: string[]
    venues: string[]
    pace: string
    socialStyle: string[]
    lounge: string[]
    collectionSize: string
    aging: string
  }
  about: {
    industry: string
    languages: string[]
    hobbies: string[]
    sports: string[]
    music: string[]
  }
}

export interface ScoredMember extends Member {
  match: number
  shared: string[]
}

export interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  at: string
  status?: 'sent' | 'delivered' | 'read'
  /** Safe Meet Spot suggestion card. */
  loungeId?: string
  accepted?: boolean
}

export interface Conversation {
  id: string
  memberId: string
  matchedAt: string
  unread: number
  messages: Message[]
}

export interface Lounge {
  id: string
  name: string
  venueType: 'Lounge' | 'Lounge + Shop' | 'Shop + Lounge' | 'Members club'
  street: string
  city: string
  state: string
  zip: string
  phone: string
  metro: string
  verificationNote: string
  lat: number
  lng: number
}

export interface VideoSession {
  id: string
  title: string
  duration: string
  category: string
  description: string
  vimeoId: string
  tone: number
  tags: string[]
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  body: string[]
  tone: number
}
