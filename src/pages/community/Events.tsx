import { CalendarDays, CalendarPlus, MapPin, MessageCircle, Plus, Share2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, SafetyBanner } from '@/components/brand'
import { LoungeMap } from '@/components/Map'
import { Badge, Button, Checkbox, EmptyState, ErrorState, Field, Input, Segmented, Select, Sheet, Textarea, TopBar } from '@/components/ui'
import { LOUNGES } from '@/data/mock/content'
import { EngagementBar, ItemThread, ThreadPreview, useAuthor } from '@/features/community/PostCard'
import { useCommunity } from '@/features/community/store'
import type { CigarEvent } from '@/features/community/types'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function ics(e: CigarEvent) {
  const lounge = LOUNGES.find((l) => l.id === e.loungeId)
  const start = new Date(e.date)
  const end = new Date(start.getTime() + 2 * 3600_000)
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const esc = (s: string) => s.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, '\\n')
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Daily Stogie//Events//EN', 'BEGIN:VEVENT',
    `UID:${e.id}@dailystogie.app`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(lounge ? `${lounge.name}, ${lounge.street}, ${lounge.city}, ${lounge.state}` : e.venue ?? '')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  a.download = `${e.title.replace(/\W+/g, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function EventCard({ e }: { e: CigarEvent }) {
  const { c } = useCommunity()
  const author = useAuthor()
  const lounge = LOUNGES.find((l) => l.id === e.loungeId)
  const d = new Date(e.date)
  const rsvp = c.rsvp[e.id]
  const going = e.going.length + (rsvp === 'Going' ? 1 : 0)
  return (
    <Link to={`/events/${e.id}`} className="card block overflow-hidden transition hover:border-gold">
      <div className="flex gap-3 p-4">
        <div className="grid h-16 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-gold-light to-gold-deep text-white">
          <div className="text-center leading-none">
            <p className="text-[10px] font-bold uppercase tracking-wider">{d.toLocaleString([], { month: 'short' })}</p>
            <p className="font-serif text-2xl">{d.getDate()}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg leading-tight">{e.title}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted"><MapPin size={12} /> {lounge ? `${lounge.name}, ${lounge.city}` : e.venue}</p>
          <p className="text-xs text-ink-muted">{fmt(e.date)} · Hosted by {author(e.hostId).first}</p>
        </div>
        {rsvp && <Badge tone={rsvp === 'Going' ? 'success' : 'muted'}>{rsvp}</Badge>}
      </div>
      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
        <div className="flex -space-x-2">
          {e.going.slice(0, 4).map((id) => <Avatar key={id} tone={author(id).tone} name={author(id).name} size={26} className="rounded-full ring-2 ring-bg" />)}
        </div>
        <span className="text-xs text-ink-muted">{going} going · {Math.max(0, e.capacity - going)} spots left</span>
        {e.visibility !== 'Everyone' && <Badge tone="muted" className="ml-auto">{e.visibility}</Badge>}
      </div>
    </Link>
  )
}

export function Events() {
  const { state } = useApp()
  const { c } = useCommunity()
  const [tab, setTab] = useState<'upcoming' | 'mine'>('upcoming')
  const [create, setCreate] = useState(false)
  const noMeetups = ['Online Only', 'Prefer Not To Meet'].includes(String(state.prefs.meetup))
  const isMentor = ['Willing to Guide Beginners', 'Both'].includes(String(state.prefs.mentorship))
  const list = c.events
    .filter((e) => e.visibility === 'Everyone' || (e.visibility === 'My matches' && state.matched.includes(e.hostId)) || (e.visibility === 'Mentors' && isMentor) || e.hostId === 'me')
    .filter((e) => tab === 'upcoming' || e.hostId === 'me' || c.rsvp[e.id] === 'Going' || c.rsvp[e.id] === 'Maybe')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back title="Events & Meetups" right={<Button size="sm" icon={Plus} onClick={() => setCreate(true)}>Create</Button>} />
      <div className="space-y-3 px-4">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'mine', label: 'My events' }]} />
        <SafetyBanner />
        {noMeetups && tab === 'upcoming' && (
          <p className="rounded-2xl bg-surface-2 p-3 text-xs text-ink-muted">Your meetup preference is “{String(state.prefs.meetup)}”, so we won’t suggest events to you. You can still browse.</p>
        )}
        {list.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" body="Create one at a licensed lounge near you." action={<Button icon={Plus} onClick={() => setCreate(true)}>Create event</Button>} />
        ) : (
          list.map((e) => <EventCard key={e.id} e={e} />)
        )}
      </div>
      <CreateEventSheet open={create} onClose={() => setCreate(false)} />
    </div>
  )
}

export function EventDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, toast } = useApp()
  const { c, setC } = useCommunity()
  const author = useAuthor()
  const [thread, setThread] = useState(false)
  const e = c.events.find((x) => x.id === id)
  if (!e) return <ErrorState />
  const lounge = LOUNGES.find((l) => l.id === e.loungeId)
  const rsvp = c.rsvp[e.id]
  const attendees = [...e.going, ...(rsvp === 'Going' ? ['me'] : [])]
  const host = author(e.hostId)
  const full = attendees.length >= e.capacity && rsvp !== 'Going'

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar back="/events" title="Event" />
      {lounge && <div className="px-4"><LoungeMap className="h-44" points={[{ id: lounge.id, lat: lounge.lat, lng: lounge.lng, label: lounge.name }]} cluster={false} interactive={false} /></div>}
      <div className="px-5 pt-4">
        <p className="micro-label">{fmt(e.date)}</p>
        <h1 className="mt-1 font-serif text-[30px] leading-tight">{e.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted"><MapPin size={15} /> {lounge ? `${lounge.name} · ${lounge.street}, ${lounge.city}` : e.venue}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted"><Users size={15} /> {attendees.length} going · {e.capacity} capacity · {e.visibility}</p>

        <div role="radiogroup" aria-label="RSVP" className="mt-5 grid grid-cols-3 gap-2">
          {(['Going', 'Maybe', "Can't go"] as const).map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={rsvp === r}
              disabled={r === 'Going' && full}
              onClick={() => { setC((s) => ({ rsvp: { ...s.rsvp, [e.id]: r } })); toast(r === 'Going' ? 'See you there!' : `RSVP: ${r}`) }}
              className={cn('min-h-12 rounded-[14px] border text-sm font-semibold transition disabled:opacity-40', rsvp === r ? 'border-gold bg-gold/15 text-ink' : 'border-line bg-surface text-ink-muted')}
            >
              {r}
            </button>
          ))}
        </div>
        {full && <p className="mt-2 text-xs text-warning">This event is full.</p>}
        {e.hostId === 'me' && (
          <Button variant="danger" size="sm" className="mt-3" onClick={() => {
            setC((s) => ({ events: s.events.filter((x) => x.id !== e.id) }))
            toast('Event cancelled. Attendees will be notified.')
            nav('/events')
          }}>Cancel this event</Button>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button size="sm" variant="secondary" icon={CalendarPlus} onClick={() => ics(e)}>Calendar</Button>
          <Button size="sm" variant="secondary" icon={MessageCircle} disabled={e.hostId === 'me'} onClick={() => (state.matched.includes(e.hostId) ? nav(`/messages/${e.hostId}`) : toast(`Match with ${host.first} to message them`))}>Host</Button>
          <Button size="sm" variant="secondary" icon={Share2} onClick={() => { navigator.clipboard?.writeText(location.href).catch(() => {}); toast('Link copied') }}>Share</Button>
        </div>

        <section className="card mt-5 p-4">
          <h2 className="font-serif text-lg">About</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed">{e.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar tone={host.tone} name={host.name} src={host.src} size={40} />
            <div><p className="text-sm font-semibold">Hosted by {host.name}</p><p className="text-xs text-ink-muted">{host.userType} · {host.place}</p></div>
          </div>
        </section>

        <section className="mt-5">
          <h2 className="micro-label mb-2">Attendees</h2>
          <div className="flex flex-wrap gap-3">
            {attendees.map((a) => (
              <div key={a} className="flex w-14 flex-col items-center gap-1 text-center">
                <Avatar tone={author(a).tone} name={author(a).name} src={author(a).src} size={44} />
                <span className="w-full truncate text-[11px]">{a === 'me' ? 'You' : author(a).first}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-6">
          <EngagementBar itemId={e.id} reactions={{ cheers: e.going.length * 2 + 3 }} reactors={e.going} shareLink={`${location.origin}/events/${e.id}`} onComments={() => setThread(true)} />
        </div>
        <ThreadPreview itemId={e.id} onOpen={() => setThread(true)} />
        <SafetyBanner className="mt-5" />
        <p className="mt-3 text-center text-xs text-ink-muted">No ticketing or payments. Venue purchase policies apply.</p>
        <ItemThread itemId={e.id} open={thread} onClose={() => setThread(false)} title="Event discussion" />
      </div>
    </div>
  )
}

function CreateEventSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp()
  const { setC } = useCommunity()
  const nav = useNavigate()
  const [f, setF] = useState({ title: '', description: '', loungeId: '', custom: false, venue: '', date: '', time: '19:00', capacity: 10, visibility: 'Everyone' as CigarEvent['visibility'] })
  const [ack, setAck] = useState(false)
  const valid = f.title.trim() && f.date && (f.custom ? f.venue.trim() && ack : f.loungeId)
  const submit = () => {
    const ev: CigarEvent = {
      id: `e${Date.now()}`,
      title: f.title.trim(),
      description: f.description.trim(),
      loungeId: f.custom ? undefined : f.loungeId,
      venue: f.custom ? f.venue.trim() : undefined,
      date: new Date(`${f.date}T${f.time}`).toISOString(),
      capacity: f.capacity,
      visibility: f.visibility,
      hostId: 'me',
      going: [],
      maybe: [],
    }
    setC((s) => ({ events: [ev, ...s.events], rsvp: { ...s.rsvp, [ev.id]: 'Going' } }))
    toast('Event created')
    onClose()
    nav(`/events/${ev.id}`)
  }
  return (
    <Sheet open={open} onClose={onClose} title="Create event" footer={<Button block size="lg" disabled={!valid} onClick={submit}>Create event</Button>}>
      <div className="space-y-4 pb-2">
        <Field label="Title" htmlFor="ev-title"><Input id="ev-title" value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Maduro Night on the Patio" /></Field>
        <Field label="Description" htmlFor="ev-desc"><Textarea id="ev-desc" value={f.description} maxLength={1000} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        {!f.custom ? (
          <Field label="Lounge" htmlFor="ev-lounge" hint="Licensed lounges are suggested first for everyone’s safety.">
            <Select id="ev-lounge" value={f.loungeId} onChange={(e) => setF({ ...f, loungeId: e.target.value })} placeholder="Choose a lounge">
              {LOUNGES.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}, {l.state}</option>)}
            </Select>
          </Field>
        ) : (
          <>
            <Field label="Custom venue" htmlFor="ev-venue"><Input id="ev-venue" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} placeholder="Public venue name and address" /></Field>
            <Checkbox checked={ack} onChange={setAck}>This is a public venue where smoking is permitted. I won’t host at a private home.</Checkbox>
          </>
        )}
        <button type="button" className="text-sm font-semibold text-gold-ink" onClick={() => setF({ ...f, custom: !f.custom })}>{f.custom ? 'Pick a lounge instead' : 'Use a custom venue'}</button>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" htmlFor="ev-date"><Input id="ev-date" type="date" value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Time" htmlFor="ev-time"><Input id="ev-time" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
        </div>
        <Field label={`Capacity: ${f.capacity}`} htmlFor="ev-cap"><input id="ev-cap" type="range" min={2} max={100} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} className="w-full accent-[var(--gold)]" /></Field>
        <div>
          <p className="mb-2 text-[13px] font-medium">Who can see it</p>
          <Segmented value={f.visibility} onChange={(visibility) => setF({ ...f, visibility })} options={[{ value: 'Everyone', label: 'Everyone' }, { value: 'My matches', label: 'Matches' }, { value: 'Mentors', label: 'Mentors' }]} />
        </div>
      </div>
    </Sheet>
  )
}

