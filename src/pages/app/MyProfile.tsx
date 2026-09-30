import { Archive, BadgeCheck, BookMarked, Briefcase, CalendarDays, Clock, Flame, Heart, Leaf, Music2, Pencil, Settings, Sparkles, Stamp, Wine } from 'lucide-react'
import { useState } from 'react'
import { Field, Input, Sheet } from '@/components/ui'
import { isAllowedMusic, MusicCard } from '@/features/community/embeds'
import { useCommunity } from '@/features/community/store'
import { usePassport } from '@/pages/community/Extras'
import { Link } from 'react-router-dom'
import { Avatar, CompletenessRing, Portrait, UserTypeBadge } from '@/components/brand'
import { ProgressBar } from '@/components/layout'
import { Button } from '@/components/ui'
import { completeness, useApp } from '@/lib/store'
import { ChipRow, ProfileSection } from './MemberProfile'

const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v ? [String(v)] : [])

export default function MyProfile() {
  const { state, toast } = useApp()
  const { c, setC, on } = useCommunity()
  const passport = usePassport()
  const [statusOpen, setStatusOpen] = useState(false)
  const [nsText, setNsText] = useState('')
  const [nsMusic, setNsMusic] = useState('')
  const [trackOpen, setTrackOpen] = useState(false)
  const [track, setTrack] = useState(c.soundtrack)
  const nowSmoking = c.nowSmoking && c.nowSmoking.until > Date.now() ? c.nowSmoking : null
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

        {on('music_share') && (
          <button onClick={() => setStatusOpen(true)} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-gold/50 bg-gold/8 px-3.5 py-3 text-left">
            <Flame size={18} className="shrink-0 text-ember" />
            <span className="min-w-0 flex-1 text-sm">
              {nowSmoking ? (
                <><strong>Now smoking:</strong> {nowSmoking.text}{nowSmoking.music && <span className="block truncate text-xs text-ink-muted">Now playing · {nowSmoking.music}</span>}</>
              ) : (
                <span className="text-ink-muted">What are you smoking right now? (clears after 6 hours)</span>
              )}
            </span>
          </button>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/profile/edit/1"><Button block variant="secondary" icon={Pencil}>Edit Profile</Button></Link>
          <Link to="/settings"><Button block variant="secondary" icon={Settings}>Settings</Button></Link>
        </div>
      </div>

      {(on('cigar_journal') || on('passport') || on('events')) && (
        <div className="mt-4 grid grid-cols-3 gap-2 px-4">
          {on('cigar_journal') && <Link to="/journal" className="card flex flex-col items-center gap-1 p-3 text-center text-xs font-medium"><BookMarked size={20} className="text-gold-deep" /> Journal<span className="text-ink-muted">{c.journal.length} entries</span></Link>}
          {on('passport') && <Link to="/passport" className="card flex flex-col items-center gap-1 p-3 text-center text-xs font-medium"><Stamp size={20} className="text-gold-deep" /> Passport<span className="text-ink-muted">{passport.lounges.length} stamps</span></Link>}
          {on('events') && <Link to="/events" className="card flex flex-col items-center gap-1 p-3 text-center text-xs font-medium"><CalendarDays size={20} className="text-gold-deep" /> Events<span className="text-ink-muted">{Object.values(c.rsvp).filter((r) => r === 'Going').length} going</span></Link>}
        </div>
      )}

      <div className="mt-5 space-y-3 px-4">
        {on('music_share') && (
          <ProfileSection icon={Music2} title="Smoking soundtrack">
            {c.soundtrack ? <MusicCard url={c.soundtrack} /> : <p className="text-sm text-ink-muted">Pin a playlist or song to your profile.</p>}
            <button onClick={() => setTrackOpen(true)} className="mt-2 text-sm font-semibold text-gold-ink">{c.soundtrack ? 'Change' : 'Add soundtrack'}</button>
          </ProfileSection>
        )}
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

      <Sheet open={statusOpen} onClose={() => setStatusOpen(false)} title="Now smoking" footer={
        <div className="flex gap-2">
          {nowSmoking && <Button variant="secondary" onClick={() => { setC({ nowSmoking: null }); setStatusOpen(false) }}>Clear</Button>}
          <Button className="flex-1" disabled={!nsText.trim() || (!!nsMusic && !isAllowedMusic(nsMusic))} onClick={() => {
            setC({ nowSmoking: { text: nsText.trim(), music: nsMusic.trim(), until: Date.now() + 6 * 3600_000 } })
            toast('Status shared with your matches for 6 hours')
            setStatusOpen(false)
          }}>Share status</Button>
        </div>
      }>
        <div className="space-y-4 pb-2">
          <Field label="Now smoking" htmlFor="ns"><Input id="ns" value={nsText} maxLength={80} onChange={(e) => setNsText(e.target.value)} placeholder="Padrón 1964 Maduro on the patio" /></Field>
          <Field label="Now playing" htmlFor="np" optional hint="Spotify, Apple Music, YouTube or SoundCloud link"><Input id="np" value={nsMusic} onChange={(e) => setNsMusic(e.target.value)} placeholder="https://open.spotify.com/…" /></Field>
        </div>
      </Sheet>
      <Sheet open={trackOpen} onClose={() => setTrackOpen(false)} title="Smoking soundtrack" footer={
        <Button block disabled={!!track && !isAllowedMusic(track)} onClick={() => { setC({ soundtrack: track.trim() }); setTrackOpen(false) }}>Save</Button>
      }>
        <Field label="Music link" htmlFor="st" hint="Spotify, Apple Music, YouTube Music, YouTube or SoundCloud"><Input id="st" value={track} onChange={(e) => setTrack(e.target.value)} placeholder="https://open.spotify.com/playlist/…" /></Field>
        {track && isAllowedMusic(track) && <div className="mt-3 pb-2"><MusicCard url={track} /></div>}
      </Sheet>
    </div>
  )
}
