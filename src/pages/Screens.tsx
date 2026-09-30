import { Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand'
import { EmptyState, ErrorState, ListSkeleton, TopBar } from '@/components/ui'

const GROUPS: [string, [string, string][]][] = [
  ['Sign-up flow', [
    ['Welcome', '/'], ['Sign up', '/signup'], ['Log in', '/login'], ['Age verification', '/verify/age'],
    ['Not eligible (under 21)', '/verify/not-eligible'], ['Identity verification', '/verify/identity'],
    ['Stogie Ethics', '/ethics'], ['Photo upload', '/photo'], ['Subscription paywall', '/subscribe'],
    ['Profile 1: Demographics', '/onboarding/1'], ['Profile 2: Stogie Preferences', '/onboarding/2'], ['Profile 3: About You', '/onboarding/3'],
  ]],
  ['Main tabs', [
    ['Discover', '/discover'], ['Member profile', '/member/m1'], ['Mentors', '/mentors'], ['Matches', '/matches'],
    ['Messages', '/messages'], ['Chat', '/messages/m1'], ['My profile', '/profile'], ['Edit profile', '/profile/edit/1'],
  ]],
  ['Settings', [
    ['Settings menu', '/settings'], ['Subscription', '/settings/subscription'], ['Stogie Search', '/settings/search'],
    ['Stogie Sessions', '/settings/sessions'], ['Session video', '/settings/sessions/s1'], ['Stogie Blog', '/settings/blog'],
    ['Blog article (editorial)', '/settings/blog/perfect-cigar-pairing'], ['Blog article (member)', '/settings/blog/three-years-in-the-cabinet'], ['Write an article', '/settings/blog/write'], ['Member video', '/settings/sessions/v1'], ['Privacy Policy', '/legal/privacy'], ['Terms', '/legal/terms'],
    ['Stogie Ethics (full)', '/legal/ethics'], ['Indemnification', '/legal/indemnification'], ['Refer a Friend', '/settings/refer'],
    ['Export / delete account', '/settings/delete'],
  ]],
  ['Community module (Phase 10, feature-flagged)', [
    ['Lounge Feed (posts, polls, Smoke Reports)', '/discover?view=feed'], ['Events & Meetups', '/events'], ['Event detail', '/events/e1'],
    ['Cigar Journal', '/journal'], ['Notifications', '/notifications'], ['Pairing Finder', '/pairing'], ['Nearby Map', '/nearby'],
    ['Cigar Passport', '/passport'], ['Travel Mode', '/travel'], ['Safe Meet Spot + Icebreakers (chat)', '/messages/m9'],
  ]],
  ['Other', [['Admin panel (incl. feature flags)', '/admin'], ['Empty, loading & error states', '/states']]],
]

export default function Screens() {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <div className="flex items-center gap-3 px-5 pt-8">
        <LogoMark size={40} />
        <div>
          <h1 className="font-serif text-2xl">All screens</h1>
          <p className="text-sm text-ink-muted">Phase 0 · mock data</p>
        </div>
      </div>
      {GROUPS.map(([title, links]) => (
        <section key={title} className="mt-6 px-4">
          <h2 className="micro-label mb-2 px-1">{title}</h2>
          <ul className="card divide-y divide-line overflow-hidden">
            {links.map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="flex min-h-12 items-center justify-between px-4 text-[15px] hover:bg-surface-2">
                  {label} <span className="font-mono text-xs text-ink-muted">{to}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function States() {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar back title="States" />
      <section className="card mx-4 p-4">
        <h2 className="micro-label mb-3">Loading</h2>
        <ListSkeleton rows={2} />
      </section>
      <section className="card mx-4 mt-3"><EmptyState icon={Heart} title="No matches yet" body="Keep swiping!" /></section>
      <section className="card mx-4 mt-3"><EmptyState icon={MessageCircle} title="No messages yet" body="When you match with someone, you’ll see your messages here." /></section>
      <section className="card mx-4 mt-3"><ErrorState onRetry={() => {}} /></section>
    </div>
  )
}
