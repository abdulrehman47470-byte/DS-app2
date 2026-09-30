import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Briefcase, GraduationCap, Heart, Languages, Leaf, MapPin, Sparkles, Wine, Archive, X, BarChart3 } from 'lucide-react'
import { ProgressBar } from '@/components/layout'
import { presetForTone, ProfileBanner } from '@/features/profile/Banner'
import { Activity, Highlights, LevelBadge } from '@/features/profile/ProfileExtras'
import { pointsFor } from '@/features/community/points'
import { useCommunity } from '@/features/community/store'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, BandDivider, MatchRing, UserTypeBadge } from '@/components/brand'
import { Badge, Button, Chip, ErrorState, Skeleton, TopBar } from '@/components/ui'
import { SafetyActions } from '@/features/safety'
import { getMember } from '@/lib/api'
import { useApp } from '@/lib/store'

export function ProfileSection({ icon: Icon, title, children }: { icon: typeof Leaf; title: string; children: ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-[17px]">
        <Icon size={18} strokeWidth={1.5} className="text-gold-deep" /> {title}
      </h2>
      {children}
    </section>
  )
}

export function ChipRow({ label, items, shared }: { label?: string; items: string[]; shared?: Set<string> }) {
  if (!items.length) return null
  return (
    <div className="mb-3 last:mb-0">
      {label && <p className="mb-1.5 text-xs text-ink-muted">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Chip key={i} size="sm" highlight={shared?.has(i)}>
            {i}
          </Chip>
        ))}
      </div>
    </div>
  )
}

export default function MemberProfile() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const q = useQuery({ queryKey: ['member', id], queryFn: () => getMember(state, id) })
  const { c, on } = useCommunity()

  if (q.isLoading)
    return (
      <div>
        <Skeleton className="h-56 rounded-none" />
        <div className="space-y-3 p-5">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-28" />
        </div>
      </div>
    )
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />

  const m = q.data
  const shared = new Set(m.shared)
  const matched = state.matched.includes(m.id)
  const name = `${m.firstName} ${m.lastName}`

  const like = () => {
    set((s) => ({ liked: [...s.liked, m.id], matched: m.likesYou && !s.matched.includes(m.id) ? [m.id, ...s.matched] : s.matched }))
    toast(m.likesYou ? `It’s a match with ${m.firstName}!` : `You liked ${m.firstName}`)
    nav(-1)
  }
  const pass = () => {
    set((s) => ({ passed: [...s.passed, m.id] }))
    nav(-1)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <ProfileBanner value={{ preset: presetForTone(m.tone) }} className="h-52">
        <TopBar back className="absolute inset-x-0 top-0 bg-transparent text-white [&_button]:text-white" />
        <div className="absolute right-4 top-16">
          <MatchRing value={m.match} onPhoto size={64} />
        </div>
      </ProfileBanner>

      <div className="relative -mt-14 px-5">
        <Avatar tone={m.tone} name={name} size={112} ring className="rounded-full shadow-deep" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-[30px] leading-none">{name}</h1>
          {m.verified && <BadgeCheck size={22} className="fill-info text-white" aria-label="Photo verified" />}
          {on('community_feed') && <LevelBadge level={pointsFor(c, m.id).level.name} />}
        </div>
        <p className="mt-1.5 text-[15px]">{m.userType} · {m.prefs.strength} smoker · {m.about.industry}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{m.pronouns}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
          <UserTypeBadge type={m.userType} />
          <span className="flex items-center gap-1 text-ink-muted">
            <MapPin size={14} /> {m.city}, {m.state}
          </span>
          {m.mentorship === 'Willing to Guide Beginners' || m.mentorship === 'Both' ? (
            <Badge><GraduationCap size={12} /> Mentor</Badge>
          ) : null}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {m.yearsSmoking} {m.yearsSmoking === 1 ? 'year' : 'years'} smoking · {m.lastActive}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" icon={X} onClick={pass}>Pass</Button>
          {matched ? (
            <Button size="lg" onClick={() => nav(`/messages/${m.id}`)}>Message</Button>
          ) : (
            <Button size="lg" icon={Heart} onClick={like}>Like</Button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3 px-4">
        <ProfileSection icon={Sparkles} title="About">
          <p className="text-[15px] leading-relaxed">{m.bio}</p>
          {m.shared.length > 0 && (
            <p className="mt-3 text-xs text-gold-ink">
              <Sparkles size={12} className="mr-1 inline" /> You share {m.shared.length} preferences, highlighted in gold.
            </p>
          )}
        </ProfileSection>
        <Highlights items={[
          `${m.yearsSmoking} ${m.yearsSmoking === 1 ? 'year' : 'years'} in the cigar world`,
          `Collection: ${m.prefs.collectionSize}`,
          m.mentorTopics.length ? `${m.mentorship === 'Looking for a Mentor' ? 'Learning' : 'Mentors on'}: ${m.mentorTopics.slice(0, 2).join(', ')}` : `Favorite pour: ${m.prefs.pairings[0]}`,
        ]} />
        {on('match_insights') && <MatchInsights shared={shared} m={m} />}
        <ProfileSection icon={Leaf} title="Cigar Preferences">
          <ChipRow label="Strength" items={[m.prefs.strength]} shared={shared} />
          <ChipRow label="Wrappers" items={m.prefs.wrappers} shared={shared} />
          <ChipRow label="Origins" items={m.prefs.origins} shared={shared} />
          <ChipRow label="Vitolas" items={m.prefs.vitolas} shared={shared} />
          <ChipRow label="Flavor notes" items={m.prefs.flavors} shared={shared} />
          <ChipRow label="Favorite brands" items={m.prefs.brands} shared={shared} />
          <ChipRow label="Lounge type" items={m.prefs.lounge} shared={shared} />
        </ProfileSection>
        <ProfileSection icon={Archive} title="Collection & Aging">
          <ChipRow items={[m.prefs.collectionSize, m.prefs.aging]} />
        </ProfileSection>
        <ProfileSection icon={Wine} title="Pairings">
          <ChipRow items={m.prefs.pairings} shared={shared} />
        </ProfileSection>
        <ProfileSection icon={Heart} title="Interests">
          <ChipRow label="Hobbies" items={m.about.hobbies} shared={shared} />
          <ChipRow label="Sports" items={m.about.sports} shared={shared} />
          <ChipRow label="Music" items={m.about.music} shared={shared} />
          <ChipRow label="Social style" items={m.prefs.socialStyle} shared={shared} />
        </ProfileSection>
        <ProfileSection icon={Briefcase} title="Professional Industry">
          <p className="text-[15px]">{m.about.industry}</p>
        </ProfileSection>
        <ProfileSection icon={Languages} title="Languages">
          <ChipRow items={m.about.languages} shared={shared} />
        </ProfileSection>
        <ProfileSection icon={GraduationCap} title="Mentorship">
          <p className="mb-2 text-[15px]">{m.mentorship}</p>
          <ChipRow items={m.mentorTopics} />
        </ProfileSection>

        <Activity who={m.id} name={name} />

        <BandDivider label="Safety" />
        <div className="flex flex-col items-center gap-3 pb-4">
          <SafetyActions
            name={m.firstName}
            onBlocked={() => {
              set((s) => ({ blocked: [...s.blocked, m.id], matched: s.matched.filter((x) => x !== m.id) }))
              toast(`${m.firstName} is blocked`)
              nav('/discover')
            }}
          />
          <p className="text-xs text-ink-muted">21+ members only · Meet in licensed lounges</p>
        </div>
      </div>
    </div>
  )
}

function MatchInsights({ shared, m }: { shared: Set<string>; m: import('@/types').ScoredMember }) {
  const cats: [string, string[]][] = [
    ['Flavor', m.prefs.flavors],
    ['Wrapper & origin', [...m.prefs.wrappers, ...m.prefs.origins]],
    ['Brands', m.prefs.brands],
    ['Pairings', m.prefs.pairings],
    ['Lifestyle', [...m.about.hobbies, ...m.about.sports, ...m.about.music]],
    ['Social', [...m.prefs.socialStyle, ...m.prefs.venues]],
  ]
  return (
    <ProfileSection icon={BarChart3} title="Why you match">
      <div className="space-y-3">
        {cats.map(([label, items]) => {
          const hit = items.filter((i) => shared.has(i))
          const pct = items.length ? Math.round((hit.length / items.length) * 100) : 0
          return (
            <div key={label}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="font-medium">{label}</span>
                <span className="text-ink-muted">{hit.length ? hit.slice(0, 3).join(', ') : 'Something new to explore'}</span>
              </div>
              <ProgressBar value={Math.max(4, pct)} label={`${label} overlap`} />
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-ink-muted">Based on your preferences and interests. Religion, politics and ethnicity are never used.</p>
    </ProfileSection>
  )
}
