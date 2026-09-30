import { Archive, BadgeCheck, Briefcase, Clock, Heart, Leaf, Pencil, Settings, Sparkles, Wine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, CompletenessRing, Portrait, UserTypeBadge } from '@/components/brand'
import { ProgressBar } from '@/components/layout'
import { Button } from '@/components/ui'
import { completeness, useApp } from '@/lib/store'
import { ChipRow, ProfileSection } from './MemberProfile'

const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v ? [String(v)] : [])

export default function MyProfile() {
  const { state } = useApp()
  const d = state.demographics
  const pct = completeness(state)
  const p = state.prefs
  const a = state.about
  const shortState = d.state

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="relative h-44">
        <Portrait tone={30} initials="" showInitials={false} className="absolute inset-0 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/55" />
        <Link to="/settings" aria-label="Settings" className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/45">
          <Settings size={20} strokeWidth={1.6} />
        </Link>
      </div>
      <div className="relative -mt-16 px-5">
        <CompletenessRing value={pct} size={124}>
          <Avatar tone={30} name={d.name} src={state.photo} size={110} />
        </CompletenessRing>
        <div className="mt-3 flex items-center gap-2">
          <h1 className="font-serif text-[30px] leading-none">{d.name}</h1>
          {state.verifyStatus === 'Verified' && <BadgeCheck size={22} className="fill-info text-white" aria-label="Photo verified" />}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <UserTypeBadge type={d.userType} /> {d.city}, {shortState} · {d.pronouns}
        </p>
        {state.photo && state.photoStatus === 'pending' && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
            <Clock size={13} /> Photo pending review
          </p>
        )}

        <div className="card mt-5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Profile Completeness</span>
            <span className="font-serif text-lg text-gold-ink">{pct}%</span>
          </div>
          <ProgressBar value={pct} label="Profile completeness" />
          {pct < 100 && <p className="mt-2 text-xs text-ink-muted">Complete profiles get better matches.</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/profile/edit/1"><Button block variant="secondary" icon={Pencil}>Edit Profile</Button></Link>
          <Link to="/settings"><Button block variant="secondary" icon={Settings}>Settings</Button></Link>
        </div>
      </div>

      <div className="mt-5 space-y-3 px-4">
        <ProfileSection icon={Sparkles} title="About">
          <p className="text-[15px] leading-relaxed">{d.bio || 'Add a short bio so members know you.'}</p>
        </ProfileSection>
        <ProfileSection icon={Leaf} title="Cigar Preferences">
          <ChipRow label="Strength" items={arr(p.strength)} />
          <ChipRow label="Wrappers" items={arr(p.wrapper)} />
          <ChipRow label="Origins" items={arr(p.origin)} />
          <ChipRow label="Flavor notes" items={arr(p.flavors)} />
          <ChipRow label="Favorite brands" items={arr(p.brands)} />
          <ChipRow label="Lounge type" items={arr(p.loungeType)} />
        </ProfileSection>
        <ProfileSection icon={Archive} title="Collection & Aging">
          <ChipRow items={[...arr(p.collectionSize), ...arr(p.aging)]} />
          <ChipRow label="Wishlist" items={state.wishlist} />
        </ProfileSection>
        <ProfileSection icon={Wine} title="Pairings">
          <ChipRow items={arr(p.pairings)} />
        </ProfileSection>
        <ProfileSection icon={Heart} title="Interests">
          <ChipRow label="Hobbies" items={arr(a.hobbies)} />
          <ChipRow label="Sports" items={arr(a.sports)} />
          <ChipRow label="Music" items={arr(a.music)} />
        </ProfileSection>
        <ProfileSection icon={Briefcase} title="Professional Industry">
          <p className="text-[15px]">{arr(a.industry)[0] ?? 'Not set'}</p>
        </ProfileSection>
      </div>
    </div>
  )
}
