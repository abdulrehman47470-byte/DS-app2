import { Award, Bell, BellOff, CheckCheck, Compass, Globe2, MapPin, Plane, Settings2, Stamp, Wine } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, UserTypeBadge } from '@/components/brand'
import { LoungeMap } from '@/components/LoungeMap'
import { Badge, Button, Chip, EmptyState, Field, Input, Select, Sheet, Toggle, TopBar } from '@/components/ui'
import { PAIRING_GUIDE } from '@/data/mock/community'
import { LOUNGES } from '@/data/mock/content'
import { MEMBERS } from '@/data/mock/members'
import { PREF_SECTIONS } from '@/data/options'
import { useCommunity } from '@/features/community/store'
import { NOTIFICATION_TYPES } from '@/features/community/types'
import { scoreMember } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

/* ---------------- Notifications ---------------- */
export function Notifications() {
  const nav = useNavigate()
  const { c, setC } = useCommunity()
  const [settings, setSettings] = useState(false)
  const list = c.notifications.filter((n) => c.notificationSettings[n.type])
  const unread = list.filter((n) => !c.readNotifications.includes(n.id))
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back title="Notifications" right={
        <div className="flex">
          <button aria-label="Mark all read" onClick={() => setC((s) => ({ readNotifications: s.notifications.map((n) => n.id) }))} className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><CheckCheck size={20} /></button>
          <button aria-label="Notification settings" onClick={() => setSettings(true)} className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><Settings2 size={20} /></button>
        </div>
      } />
      {list.length === 0 ? (
        <EmptyState icon={BellOff} title="You’re all caught up" body="Matches, messages and replies will show up here." />
      ) : (
        <ul className="divide-y divide-line px-4" aria-live="polite">
          {list.map((n) => {
            const m = MEMBERS.find((x) => x.id === n.actorId)
            const isUnread = unread.includes(n)
            return (
              <li key={n.id}>
                <button onClick={() => { setC((s) => ({ readNotifications: [...s.readNotifications, n.id] })); nav(n.link) }} className={cn('-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-surface-2', isUnread && 'bg-gold/8')}>
                  {m ? <Avatar tone={m.tone} name={m.firstName} size={44} /> : <span className="grid size-11 place-items-center rounded-full bg-gold/15 text-gold-deep"><Bell size={18} /></span>}
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', isUnread && 'font-semibold')}>{n.text}</p>
                    <p className="text-xs text-ink-muted">{n.at}</p>
                  </div>
                  {isUnread && <span className="size-2.5 rounded-full bg-gold" aria-label="Unread" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <Sheet open={settings} onClose={() => setSettings(false)} title="Notification settings">
        <ul className="divide-y divide-line pb-3">
          {NOTIFICATION_TYPES.map((t) => (
            <li key={t.key} className="flex min-h-14 items-center justify-between">
              <span className="text-[15px]">{t.label}</span>
              <Toggle label={t.label} checked={c.notificationSettings[t.key]} onChange={(v) => setC((s) => ({ notificationSettings: { ...s.notificationSettings, [t.key]: v } }))} />
            </li>
          ))}
          <li className="flex min-h-14 items-center justify-between">
            <span><span className="block text-[15px]">Push notifications</span><span className="text-xs text-ink-muted">When installed as an app, where supported</span></span>
            <Toggle label="Push notifications" checked={c.webPush} onChange={async (v) => {
              if (v && 'Notification' in window) {
                const p = await Notification.requestPermission()
                if (p !== 'granted') return
              }
              setC({ webPush: v })
            }} />
          </li>
        </ul>
      </Sheet>
    </div>
  )
}

/* ---------------- Pairing finder ---------------- */
const opts = (id: string) => PREF_SECTIONS.flatMap((s) => s.groups).find((g) => g.id === id)!.options

export function PairingFinder() {
  const [strength, setStrength] = useState('Medium')
  const [wrapper, setWrapper] = useState('')
  const [style, setStyle] = useState('Complementary')
  const guide = PAIRING_GUIDE[strength]
  const wrapperNote = /Maduro|Oscuro/.test(wrapper)
    ? 'Dark wrappers bring cocoa and coffee. Try an espresso or a sherried whisky.'
    : /Connecticut|Candela/.test(wrapper)
      ? 'Light wrappers are creamy and delicate. Avoid anything peated or cask-strength.'
      : /Habano|Corojo|Criollo/.test(wrapper)
        ? 'Spicy wrappers love rye, mezcal or a sweet aged rum for contrast.'
        : ''
  const spirits = style === 'Contrasting' ? [...guide.spirits].reverse() : guide.spirits
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back title="Pairing Finder" />
      <div className="space-y-4 px-5">
        <p className="text-sm text-ink-muted">Tell us about your cigar and we’ll suggest a pour.</p>
        <div>
          <p className="mb-2 text-sm font-semibold">Strength</p>
          <div className="flex flex-wrap gap-2">{Object.keys(PAIRING_GUIDE).map((s) => <Chip key={s} selected={strength === s} onClick={() => setStrength(s)}>{s}</Chip>)}</div>
        </div>
        <Field label="Wrapper" htmlFor="pf-wrapper"><Select id="pf-wrapper" value={wrapper} onChange={(e) => setWrapper(e.target.value)} placeholder="Any wrapper">{opts('wrapper').map((w) => <option key={w}>{w}</option>)}</Select></Field>
        <div>
          <p className="mb-2 text-sm font-semibold">Pairing style</p>
          <div className="flex flex-wrap gap-2">{opts('pairingStyle').map((s) => <Chip key={s} selected={style === s} onClick={() => setStyle(s)}>{s}</Chip>)}</div>
        </div>
        <section className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-gold/10 px-4 py-2.5"><Wine size={17} className="text-gold-deep" /><span className="micro-label !text-gold-ink">Suggested pours</span></div>
          <ol className="divide-y divide-line">
            {spirits.map((s, i) => (
              <li key={s} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-8 place-items-center rounded-full bg-gold/15 font-serif text-sm text-gold-ink">{i + 1}</span>
                <span className="font-serif text-lg">{s}</span>
              </li>
            ))}
          </ol>
          <p className="border-t border-line px-4 py-3 text-sm text-ink-muted">{guide.why} {wrapperNote}</p>
        </section>
        <p className="text-center text-xs text-ink-muted">Enjoy responsibly. 21+ only.</p>
      </div>
    </div>
  )
}

/* ---------------- Nearby map (approximate, city level) ---------------- */
const CITY: Record<string, [number, number]> = {
  Miami: [25.7617, -80.1918], Austin: [30.2672, -97.7431], Chicago: [41.8781, -87.6298], 'San Diego': [32.7157, -117.1611],
  Denver: [39.7392, -104.9903], Nashville: [36.1627, -86.7816], Houston: [29.7604, -95.3698], Atlanta: [33.749, -84.388],
}

export function NearbyMap() {
  const nav = useNavigate()
  const { state } = useApp()
  const [sel, setSel] = useState<string | null>(null)
  // Deterministic jitter keeps pins at city level: never an exact address.
  const points = useMemo(
    () =>
      MEMBERS.filter((m) => !state.blocked.includes(m.id) && CITY[m.city]).map((m, i) => ({
        id: m.id,
        lat: CITY[m.city][0] + Math.sin(i * 12.9) * 0.05,
        lng: CITY[m.city][1] + Math.cos(i * 7.3) * 0.05,
        label: m.firstName[0] + m.lastName[0],
        kind: 'person' as const,
      })),
    [state.blocked],
  )
  const m = MEMBERS.find((x) => x.id === sel)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back title="Nearby" />
      <div className="relative flex-1 px-4 pb-4">
        <LoungeMap className="h-[70dvh]" points={points} onSelect={setSel} />
        <p className="mt-2 text-center text-xs text-ink-muted">Locations are approximate (city level). Exact locations are never shown.</p>
        {m && (
          <div className="card absolute inset-x-7 bottom-12 z-[500] flex items-center gap-3 p-3">
            <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={48} verified={m.verified} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{m.firstName}, {m.age}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">{m.city}, {m.state} <UserTypeBadge type={m.userType} /></p>
            </div>
            <Button size="sm" onClick={() => nav(`/member/${m.id}`)}>View</Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Cigar Passport ---------------- */
export function usePassport() {
  const { c } = useCommunity()
  const verified = c.checkins.filter((x) => x.verified)
  const lounges = [...new Set(verified.map((x) => x.loungeId))]
  const states = [...new Set(lounges.map((id) => LOUNGES.find((l) => l.id === id)?.state).filter(Boolean))] as string[]
  const coasts = { east: ['FL', 'GA', 'NY', 'NJ', 'MA', 'NC', 'SC', 'VA'], west: ['CA', 'OR', 'WA'] }
  const badges = [
    { id: 'first', label: 'First Stamp', icon: Stamp, earned: lounges.length >= 1 },
    { id: 'ten', label: '10 Lounges', icon: Award, earned: lounges.length >= 10 },
    { id: 'five-states', label: '5 States', icon: Globe2, earned: states.length >= 5 },
    { id: 'coast', label: 'Coast to Coast', icon: Compass, earned: states.some((s) => coasts.east.includes(s)) && states.some((s) => coasts.west.includes(s)) },
  ]
  return { lounges, states, badges }
}

export function Passport() {
  const { lounges, states, badges } = usePassport()
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back title="Cigar Passport" />
      <div className="px-4">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,#4a2c16,#1e120a)] p-5 text-[#F6EBD7] shadow-deep">
          <div className="absolute inset-0 opacity-20 [background:repeating-linear-gradient(45deg,transparent_0_10px,rgba(235,196,117,.25)_10px_11px)]" />
          <p className="relative micro-label !text-[#EBC475]">Daily Stogie</p>
          <p className="relative font-serif text-3xl">Cigar Passport</p>
          <div className="relative mt-4 flex gap-6">
            <div><p className="font-serif text-3xl">{lounges.length}</p><p className="text-xs text-white/70">Lounges</p></div>
            <div><p className="font-serif text-3xl">{states.length}</p><p className="text-xs text-white/70">States</p></div>
            <div><p className="font-serif text-3xl">{badges.filter((b) => b.earned).length}</p><p className="text-xs text-white/70">Badges</p></div>
          </div>
        </div>
        <h2 className="micro-label mb-2 mt-6">Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div key={b.id} className={cn('card flex flex-col items-center p-4 text-center', !b.earned && 'opacity-50')}>
              <span className={cn('grid size-14 place-items-center rounded-full border-2 border-dashed', b.earned ? 'border-gold bg-gold/15 text-gold-deep' : 'border-line-strong text-ink-faint')}><b.icon size={24} /></span>
              <p className="mt-2 text-sm font-semibold">{b.label}</p>
              <p className="text-xs text-ink-muted">{b.earned ? 'Earned' : 'Locked'}</p>
            </div>
          ))}
        </div>
        <h2 className="micro-label mb-2 mt-6">Stamps</h2>
        {lounges.length === 0 ? (
          <EmptyState icon={Stamp} title="No stamps yet" body="Check in at a lounge from Stogie Search (verified with your location) to earn your first stamp." action={<Link to="/settings/search"><Button>Find a lounge</Button></Link>} />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {lounges.map((id, i) => {
              const l = LOUNGES.find((x) => x.id === id)!
              return (
                <div key={id} className="grid aspect-square place-items-center rounded-full border-2 border-gold/60 p-2 text-center" style={{ transform: `rotate(${(i % 3) * 6 - 6}deg)` }}>
                  <div><p className="font-serif text-[11px] leading-tight text-gold-ink">{l.name}</p><p className="text-[10px] text-ink-muted">{l.state}</p></div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Travel mode ---------------- */
export function TravelMode() {
  const { c, setC } = useCommunity()
  const { state, toast } = useApp()
  const [city, setCity] = useState(c.travel?.city ?? '')
  const [from, setFrom] = useState(c.travel?.from ?? '')
  const [to, setTo] = useState(c.travel?.to ?? '')
  const locals = MEMBERS.filter((m) => city && m.city.toLowerCase() === city.toLowerCase().trim())
  const lounges = LOUNGES.filter((l) => city && (l.city.toLowerCase() === city.toLowerCase().trim() || l.metro.toLowerCase() === city.toLowerCase().trim()))
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back title="Travel Mode" />
      <div className="space-y-4 px-5">
        <div className="flex gap-3 rounded-2xl border border-info/30 bg-info/10 p-3.5 text-sm"><Plane size={18} className="shrink-0 text-info" /> Heading somewhere? Meet locals and fellow travelers while you’re there. Your home city stays {state.demographics.city}.</div>
        <Field label="Visiting" htmlFor="tr-city"><Input id="tr-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, e.g. Chicago" list="tr-cities" /></Field>
        <datalist id="tr-cities">{Object.keys(CITY).map((x) => <option key={x} value={x} />)}</datalist>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" htmlFor="tr-from"><Input id="tr-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To" htmlFor="tr-to"><Input id="tr-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" disabled={!city || !from || !to} onClick={() => { setC({ travel: { city: city.trim(), from, to } }); toast(`Travel mode on: ${city}`) }}>{c.travel ? 'Update trip' : 'Turn on travel mode'}</Button>
          {c.travel && <Button variant="secondary" onClick={() => { setC({ travel: null }); toast('Travel mode off') }}>Turn off</Button>}
        </div>
        {city && (
          <>
            <h2 className="micro-label pt-2">Members in {city}</h2>
            {locals.length === 0 ? <p className="text-sm text-ink-muted">No members there yet.</p> : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {locals.map((m) => (
                  <Link key={m.id} to={`/member/${m.id}`} className="flex w-20 shrink-0 flex-col items-center gap-1 text-center">
                    <Avatar tone={m.tone} name={m.firstName} size={60} ring />
                    <span className="text-xs font-medium">{m.firstName}</span>
                    <Badge tone="muted">{scoreMember(state, m).match}%</Badge>
                  </Link>
                ))}
              </div>
            )}
            <h2 className="micro-label pt-2">Lounges in {city}</h2>
            {lounges.length === 0 ? <p className="text-sm text-ink-muted">More cities coming soon.</p> : lounges.map((l) => (
              <Link key={l.id} to={`/settings/search?lounge=${l.id}`} className="card flex items-center gap-3 p-3"><MapPin size={18} className="text-gold-deep" /><span className="flex-1 text-sm font-medium">{l.name}</span><span className="text-xs text-ink-muted">{l.venueType}</span></Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
