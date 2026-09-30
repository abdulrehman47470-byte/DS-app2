import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { load, save } from './storage'

export type ThemePref = 'light' | 'dark' | 'system'
export type VerifyStatus = 'Not Started' | 'Pending' | 'Verified' | 'Failed'

export interface Demographics {
  name: string
  age: number
  gender: string
  pronouns: string
  ethnicity: string
  ethnicityHidden: boolean
  country: string
  state: string
  city: string
  zip: string
  userType: string
  bio: string
  website: string
  instagram: string
  facebook: string
  linkedin: string
}

export interface AppState {
  theme: ThemePref
  signedIn: boolean
  dob: string | null
  verifyStatus: VerifyStatus
  ethicsAgreed: boolean
  photo: string | null
  photoStatus: 'pending' | 'approved' | 'rejected'
  plan: 'monthly' | 'yearly' | null
  wizardStep: number
  demographics: Demographics
  prefs: Record<string, string | string[]>
  priceRange: [number, number]
  strengthScale: number
  wishlist: string[]
  about: Record<string, string | string[]>
  hidden: Record<string, boolean>
  /** Profile banner: a preset key or an uploaded image. */
  banner: { preset?: string; src?: string }
  headline: string
  highlights: string[]
  liked: string[]
  passed: string[]
  matched: string[]
  blocked: string[]
}

const DEFAULT_STATE: AppState = {
  theme: 'light',
  signedIn: false,
  dob: null,
  verifyStatus: 'Not Started',
  ethicsAgreed: false,
  photo: null,
  photoStatus: 'pending',
  plan: null,
  wizardStep: 1,
  demographics: {
    name: 'Jordan Hale',
    age: 34,
    gender: '',
    pronouns: 'He / Him',
    ethnicity: '',
    ethnicityHidden: true,
    country: 'United States',
    state: 'Florida',
    city: 'Miami',
    zip: '33130',
    userType: 'Aficionado',
    bio: 'Weekend lounge regular who loves a slow maduro, a good bourbon and even better conversation.',
    website: '',
    instagram: '',
    facebook: '',
    linkedin: '',
  },
  prefs: {
    loungeType: ['Traditional Cigar Lounge', 'Whiskey/Cigar Lounge'],
    frequency: 'Several times a week',
    brands: ['Padrón', 'Oliva', 'My Father', 'Tatuaje'],
    vitola: ['Robusto', 'Toro'],
    strength: 'Medium-Full',
    wrapper: ['Maduro', 'Habano'],
    origin: ['Nicaragua', 'Dominican Republic'],
    flavors: ['Cocoa', 'Leather', 'Cedar', 'Espresso', 'Black Pepper'],
    pairings: ['Bourbon', 'Espresso', 'Scotch'],
    venue: ['Cigar Lounge', 'Patio'],
    pace: 'Slow & Contemplative',
    collectionSize: 'Under 25',
    aging: 'Rest a Few Weeks',
    socialStyle: ['Small Groups', 'Cigar Events'],
    meetup: 'Open to Local Meetups',
    mentorship: 'Both',
    mentorTopics: ['Pairing', 'Tasting'],
  },
  priceRange: [10, 40],
  strengthScale: 4,
  wishlist: ['Padrón 1926 No. 9'],
  about: {
    industry: 'Technology',
    hobbies: ['Travel', 'Photography', 'Whiskey Tasting'],
    sports: ['Golf'],
    languages: ['English', 'Urdu'],
    music: ['Jazz'],
  },
  hidden: { religion: true, political: true },
  banner: { preset: 'leather' },
  headline: '',
  highlights: ['Hosted 12 lounge nights in Miami', 'Box-dating Padróns since 2022', 'Happy to mentor new smokers on pairing'],
  liked: [],
  passed: [],
  matched: ['m1', 'm3', 'm4', 'm7', 'm6', 'm9'],
  blocked: [],
}

interface Toast {
  id: number
  text: string
}

interface Ctx {
  state: AppState
  set: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
  reset: () => void
  resolvedTheme: 'light' | 'dark'
  toast: (text: string) => void
  toasts: Toast[]
}

const AppCtx = createContext<Ctx | null>(null)
const KEY = 'daily-stogie:v2'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load(KEY, DEFAULT_STATE))
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    save(KEY, state)
  }, [state])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = state.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.theme

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#0D0A08' : '#F8F3EA')
  }, [resolvedTheme])

  const set = useCallback<Ctx['set']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const reset = useCallback(() => setState((s) => ({ ...DEFAULT_STATE, theme: s.theme })), [])

  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), text.length > 60 ? 5000 : 2600)
  }, [])

  useEffect(() => {
    const onToast = (e: Event) => toast(String((e as CustomEvent).detail))
    window.addEventListener('ds-toast', onToast)
    return () => window.removeEventListener('ds-toast', onToast)
  }, [toast])

  const value = useMemo(
    () => ({ state, set, reset, resolvedTheme, toast, toasts }),
    [state, set, reset, resolvedTheme, toast, toasts],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

/** Share of profile fields filled in, 0-100. */
export function completeness(s: AppState) {
  const d = s.demographics
  const checks = [
    d.name, d.gender, d.pronouns, d.country, d.state, d.city, d.zip, d.userType, d.bio,
    s.photo, s.prefs.brands?.length, s.prefs.flavors?.length, s.prefs.strength,
    s.prefs.wrapper?.length, s.prefs.pairings?.length, s.prefs.meetup, s.prefs.mentorship,
    s.about.industry, (s.about.hobbies as string[] | undefined)?.length,
    (s.about.languages as string[] | undefined)?.length,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
