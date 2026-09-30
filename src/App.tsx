import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell, AuthLayout, Column, Toasts } from '@/components/layout'
import { Skeleton } from '@/components/ui'
import Welcome from '@/pages/auth/Welcome'

/**
 * Every screen except Welcome is its own chunk, so the first paint only ships what it needs.
 * After the first screen is up, all other screens are prefetched in the background (idle time),
 * so tapping around afterwards is instant.
 */
const loaders = {
  SignIn: () => import('@/pages/auth/SignIn'),
  Verify: () => import('@/pages/auth/Verify'),
  Gates: () => import('@/pages/auth/Gates'),
  ProfileWizard: () => import('@/pages/auth/ProfileWizard'),
  Discover: () => import('@/pages/app/Discover'),
  MemberProfile: () => import('@/pages/app/MemberProfile'),
  MyProfile: () => import('@/pages/app/MyProfile'),
  Social: () => import('@/pages/app/Social'),
  Chat: () => import('@/pages/app/Chat'),
  Settings: () => import('@/pages/settings/Settings'),
  StogieSearch: () => import('@/pages/settings/StogieSearch'),
  Sessions: () => import('@/pages/settings/Sessions'),
  Blog: () => import('@/pages/settings/Blog'),
  Legal: () => import('@/pages/settings/Legal'),
  Events: () => import('@/pages/community/Events'),
  Extras: () => import('@/pages/community/Extras'),
  Journal: () => import('@/pages/community/Journal'),
  Screens: () => import('@/pages/Screens'),
  Admin: () => import('@/pages/admin/Admin'),
}

type Loader = keyof typeof loaders

// Start downloading the screen for the current URL right away, in parallel with the app core,
// instead of waiting for React to render and discover it.
const FIRST: [RegExp, Loader][] = [
  [/^\/discover/, 'Discover'], [/^\/(login|signup)/, 'SignIn'], [/^\/verify/, 'Verify'], [/^\/(ethics|photo|subscribe)/, 'Gates'],
  [/^\/onboarding|^\/profile\/edit/, 'ProfileWizard'], [/^\/member\//, 'MemberProfile'], [/^\/profile/, 'MyProfile'],
  [/^\/messages\//, 'Chat'], [/^\/(mentors|matches|messages)/, 'Social'], [/^\/settings\/search/, 'StogieSearch'],
  [/^\/settings\/sessions/, 'Sessions'], [/^\/settings\/blog/, 'Blog'], [/^\/settings/, 'Settings'], [/^\/legal/, 'Legal'],
  [/^\/events/, 'Events'], [/^\/journal/, 'Journal'], [/^\/(notifications|pairing|nearby|passport|travel)/, 'Extras'], [/^\/admin/, 'Admin'],
]
type Mod = Record<string, ComponentType<Record<string, unknown>>>

// Screens whose code is already on the device. These render straight away with no Suspense pause.
const ready = new Map<Loader, Mod>()
function load(key: Loader) {
  return loaders[key]().then((m) => {
    ready.set(key, m as unknown as Mod)
    return m as unknown as Mod
  })
}

const firstLoader = FIRST.find(([re]) => re.test(location.pathname))?.[1]
if (firstLoader) load(firstLoader).catch(() => {})

function page(key: Loader, name: string = 'default') {
  const Lazy = lazy(async () => ({ default: (await load(key))[name] }))
  function Page(props: Record<string, unknown>) {
    const Loaded = ready.get(key)?.[name]
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />
  }
  return Page
}

const SignIn = page('SignIn')
const AgeVerification = page('Verify', 'AgeVerification')
const NotEligible = page('Verify', 'NotEligible')
const IdentityVerification = page('Verify', 'IdentityVerification')
const Ethics = page('Gates', 'Ethics')
const PhotoUpload = page('Gates', 'PhotoUpload')
const Subscribe = page('Gates', 'Subscribe')
const ProfileWizard = page('ProfileWizard')
const Discover = page('Discover')
const MemberProfile = page('MemberProfile')
const MyProfile = page('MyProfile')
const Mentors = page('Social', 'Mentors')
const Matches = page('Social', 'Matches')
const Messages = page('Social', 'Messages')
const Chat = page('Chat')
const Settings = page('Settings')
const Refer = page('Settings', 'Refer')
const DeleteAccount = page('Settings', 'DeleteAccount')
const StogieSearch = page('StogieSearch')
const Sessions = page('Sessions', 'Sessions')
const SessionDetail = page('Sessions', 'SessionDetail')
const Blog = page('Blog', 'Blog')
const BlogPost = page('Blog', 'BlogPost')
const BlogEditor = page('Blog', 'BlogEditor')
const Legal = page('Legal')
const Events = page('Events', 'Events')
const EventDetail = page('Events', 'EventDetail')
const Notifications = page('Extras', 'Notifications')
const PairingFinder = page('Extras', 'PairingFinder')
const NearbyMap = page('Extras', 'NearbyMap')
const Passport = page('Extras', 'Passport')
const TravelMode = page('Extras', 'TravelMode')
const Journal = page('Journal')
const Screens = page('Screens')
const States = page('Screens', 'States')
const Admin = page('Admin')

/** Skeleton shown for the split second a screen's code is loading. */
export function ScreenFallback() {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-40" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  )
}

function usePrefetchScreens() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return // respect data saver
    const run = () => {
      const order: Loader[] = ['Discover', 'SignIn', 'Verify', 'Gates', 'MyProfile', 'Social', 'Chat', 'MemberProfile', 'Settings', 'Blog', 'ProfileWizard', 'StogieSearch', 'Sessions', 'Events', 'Extras', 'Journal', 'Legal', 'Screens', 'Admin']
      // Three at a time: quick to finish, still gentle on the screen that is open.
      let i = 0
      const next = () => {
        if (i >= order.length) return
        load(order[i++])
          .catch(() => {})
          .finally(next)
      }
      next()
      next()
      next()
    }
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (idle) idle(run, { timeout: 1200 })
    else setTimeout(run, 600)
  }, [])
}

// Phase 0: every screen is reachable. Route guards (auth, age, ethics, photo,
// subscription) are added in Phase 2 and enforced in the database, not only here.
export default function App() {
  usePrefetchScreens()
  return (
    <>
      <Suspense fallback={<Column><ScreenFallback /></Column>}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<SignIn mode="login" />} />
            <Route path="/signup" element={<SignIn mode="signup" />} />
            <Route path="/verify/age" element={<AgeVerification />} />
            <Route path="/verify/not-eligible" element={<NotEligible />} />
            <Route path="/verify/identity" element={<IdentityVerification />} />
            <Route path="/ethics" element={<Ethics />} />
            <Route path="/photo" element={<PhotoUpload />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/onboarding/:step" element={<ProfileWizard />} />
            <Route path="/legal/:doc" element={<Legal />} />
            <Route path="/screens" element={<Screens />} />
            <Route path="/states" element={<States />} />
          </Route>
          <Route element={<AppShell />}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/member/:id" element={<MemberProfile />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<Chat />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/profile/edit/:step" element={<ProfileWizard edit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/subscription" element={<Subscribe settings />} />
            <Route path="/settings/search" element={<StogieSearch />} />
            <Route path="/settings/sessions" element={<Sessions />} />
            <Route path="/settings/sessions/:id" element={<SessionDetail />} />
            <Route path="/settings/blog" element={<Blog />} />
            <Route path="/settings/blog/write" element={<BlogEditor />} />
            <Route path="/settings/blog/edit/:id" element={<BlogEditor />} />
            <Route path="/settings/blog/:slug" element={<BlogPost />} />
            <Route path="/settings/refer" element={<Refer />} />
            <Route path="/settings/delete" element={<DeleteAccount />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pairing" element={<PairingFinder />} />
            <Route path="/nearby" element={<NearbyMap />} />
            <Route path="/passport" element={<Passport />} />
            <Route path="/travel" element={<TravelMode />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Column><Screens /></Column>} />
        </Routes>
      </Suspense>
      <Toasts />
    </>
  )
}
