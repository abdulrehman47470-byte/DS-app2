import { useQuery } from '@tanstack/react-query'
import {
  Bookmark, CheckCircle2, Info, List, LocateFixed, Map as MapIcon, MapPin, Navigation, Pencil, Phone,
  Search, Share2, Star,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type L from 'leaflet'
import { useSearchParams } from 'react-router-dom'
import { LoungeMap, milesBetween } from '@/components/LoungeMap'
import { Badge, Button, Chip, EmptyState, ErrorState, Field, Input, ListSkeleton, Segmented, Select, Sheet, Textarea, TopBar } from '@/components/ui'
import { PREF_SECTIONS } from '@/data/options'
import { Bands, EngagementBar, useAuthor } from '@/features/community/PostCard'
import { Avatar } from '@/components/brand'
import type { LoungeReview } from '@/features/community/types'
import { BandRating } from '@/features/community/SmokeReportForm'
import { useCommunity } from '@/features/community/store'
import { getLounges } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import type { Lounge } from '@/types'

const VENUE_TYPES: Lounge['venueType'][] = ['Lounge', 'Lounge + Shop', 'Shop + Lounge', 'Members club']
const ATMOSPHERE = PREF_SECTIONS[0].groups.find((g) => g.id === 'atmosphere')!.options

// Approximate city centers for "distance from my city" before geolocation. Phase 7 geocodes ZIPs.
const CITY_CENTERS: Record<string, [number, number]> = {
  Miami: [25.7617, -80.1918], Chicago: [41.8781, -87.6298], Austin: [30.2672, -97.7431], Houston: [29.7604, -95.3698],
  Denver: [39.7392, -104.9903], Nashville: [36.1627, -86.7816], Atlanta: [33.749, -84.388], 'San Diego': [32.7157, -117.1611],
  'New York': [40.7128, -74.006],
}

/** Stable mock rating per lounge until lounge_reviews is live. */
const mockRating = (id: string) => 3.6 + ((id.charCodeAt(id.length - 1) * 7) % 14) / 10

export default function StogieSearch() {
  const { state, toast } = useApp()
  const { c, setC, on } = useCommunity()
  const [params] = useSearchParams()
  const q = useQuery({ queryKey: ['lounges'], queryFn: getLounges })
  const [view, setView] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [stateF, setStateF] = useState('')
  const [cityF, setCityF] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [openId, setOpenId] = useState<string | null>(params.get('lounge'))
  const [sheet, setSheet] = useState<'none' | 'correct' | 'review' | 'checkin'>('none')
  const [askLocation, setAskLocation] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  const origin: [number, number] = userPos ?? CITY_CENTERS[state.demographics.city] ?? CITY_CENTERS.Miami
  const all = useMemo(() => q.data ?? [], [q.data])
  const states = [...new Set(all.map((l) => l.state))].sort()
  const cities = [...new Set(all.filter((l) => !stateF || l.state === stateF).map((l) => l.city))].sort()

  const list = useMemo(() => {
    const s = search.toLowerCase().trim()
    return all
      .filter(
        (x) =>
          (!s || `${x.name} ${x.city} ${x.state} ${x.zip} ${x.metro}`.toLowerCase().includes(s)) &&
          (!types.length || types.includes(x.venueType)) &&
          (!stateF || x.state === stateF) &&
          (!cityF || x.city === cityF) &&
          (!favOnly || c.favorites.includes(x.id)) &&
          (!bounds || bounds.contains([x.lat, x.lng])),
      )
      .map((x) => ({ ...x, miles: milesBetween(origin, [x.lat, x.lng]) }))
      .sort((a, b) => a.miles - b.miles)
  }, [all, search, types, stateF, cityF, favOnly, c.favorites, bounds, origin])

  const metros = useMemo(() => {
    const m: Record<string, number> = {}
    all.forEach((l) => (m[l.metro] = (m[l.metro] ?? 0) + 1))
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [all])

  const open = list.find((l) => l.id === openId) ?? (openId ? all.map((x) => ({ ...x, miles: milesBetween(origin, [x.lat, x.lng]) })).find((l) => l.id === openId) : undefined)

  useEffect(() => {
    if (view !== 'map' || !openId) return
    cardsRef.current?.querySelector(`[data-id="${openId}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [openId, view])

  const locate = () => {
    setAskLocation(false)
    if (!navigator.geolocation) return toast('Location isn’t available. Search by city or ZIP instead.')
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserPos([p.coords.latitude, p.coords.longitude]); setBounds(null); toast('Sorted by distance from you') },
      () => toast('No problem. Search by city or ZIP instead.'),
      { timeout: 8000 },
    )
  }

  const toggleFav = (id: string) => {
    const has = c.favorites.includes(id)
    setC((s) => ({ favorites: has ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }))
    toast(has ? 'Removed from favorites' : 'Saved to favorites')
  }

  const rating = (l: Lounge) => {
    const rs = c.loungeReviews.filter((r) => r.loungeId === l.id)
    const base = mockRating(l.id)
    return rs.length ? (base * 8 + rs.reduce((n, r) => n + r.rating, 0)) / (8 + rs.length) : base
  }
  const reviewCount = (id: string) => 8 + c.loungeReviews.filter((r) => r.loungeId === id).length

  const directions = (l: Lounge) => {
    const addr = encodeURIComponent(`${l.street}, ${l.city}, ${l.state} ${l.zip}`)
    const ios = /iPad|iPhone|Mac/.test(navigator.userAgent)
    return {
      apple: `https://maps.apple.com/?daddr=${addr}`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${addr}`,
      waze: `https://waze.com/ul?q=${addr}&navigate=yes`,
      preferred: ios ? 'apple' : 'google',
    }
  }

  const points = list.map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, label: l.name }))

  const card = (l: (typeof list)[number], compact?: boolean) => (
    <div key={l.id} data-id={l.id} className={cn('card p-4', compact && 'w-[78%] shrink-0 snap-center', openId === l.id && compact && 'border-gold')}>
      <button onClick={() => setOpenId(l.id)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-[17px] leading-tight">{l.name}</h3>
          <span className="shrink-0 text-xs font-semibold text-gold-ink">{l.miles < 10 ? l.miles.toFixed(1) : Math.round(l.miles).toLocaleString()} mi</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">{l.venueType} · {l.street}, {l.city}, {l.state}</p>
        {on('lounge_reviews') && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted"><Star size={12} className="fill-gold text-gold" /> {rating(l).toFixed(1)}</p>
        )}
      </button>
      <div className="mt-3 flex gap-2">
        <a href={`tel:${l.phone.replace(/\D/g, '')}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-xs font-semibold text-gold-ink"><Phone size={13} /> Call</a>
        <a href={directions(l)[directions(l).preferred as 'apple' | 'google']} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-xs font-semibold text-gold-ink"><Navigation size={13} /> Directions</a>
        <button onClick={() => toggleFav(l.id)} aria-label="Favorite" className={cn('ml-auto grid size-9 place-items-center rounded-full', c.favorites.includes(l.id) ? 'text-gold-deep' : 'text-ink-muted')}>
          <Bookmark size={16} className={c.favorites.includes(l.id) ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Stogie Search" right={
        <Segmented value={view} onChange={setView} className="w-28 p-0.5" options={[
          { value: 'list', label: <List size={16} aria-label="List" /> },
          { value: 'map', label: <MapIcon size={16} aria-label="Map" /> },
        ]} />
      } />

      <div className="space-y-2.5 px-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input placeholder="Search lounges, city or ZIP" value={search} onChange={(e) => { setSearch(e.target.value); setBounds(null) }} className="pl-9" aria-label="Search lounges" />
          </div>
          <button onClick={() => setAskLocation(true)} aria-label="Near me" className={cn('grid size-11 shrink-0 place-items-center rounded-[14px] border', userPos ? 'border-gold bg-gold/15 text-gold-deep' : 'border-line bg-surface')}>
            <LocateFixed size={19} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select aria-label="State" value={stateF} onChange={(e) => { setStateF(e.target.value); setCityF(''); setBounds(null) }} placeholder="All states" className="min-h-10 text-sm">
            {states.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select aria-label="City" value={cityF} onChange={(e) => { setCityF(e.target.value); setBounds(null) }} placeholder="All cities" className="min-h-10 text-sm">
            {cities.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip selected={favOnly} onClick={() => setFavOnly(!favOnly)}><Bookmark size={13} /> Favorites</Chip>
          <Chip selected={!types.length} onClick={() => setTypes([])}>All types</Chip>
          {VENUE_TYPES.map((t) => (
            <Chip key={t} selected={types.includes(t)} onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])}>{t}</Chip>
          ))}
        </div>
        {bounds && (
          <p className="flex items-center justify-between text-xs text-ink-muted">Showing lounges in this map area <button className="font-semibold text-gold-ink" onClick={() => setBounds(null)}>Clear</button></p>
        )}
      </div>

      {q.isLoading ? (
        <div className="p-4"><ListSkeleton rows={4} avatar={false} /></div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : view === 'map' ? (
        <div className="relative mt-3 flex-1 px-4 pb-4">
          <LoungeMap className="h-[62dvh]" points={points} selectedId={openId ?? undefined} onSelect={setOpenId} userPos={userPos} onSearchArea={setBounds} />
          <div ref={cardsRef} className="no-scrollbar absolute inset-x-4 bottom-8 z-[500] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[11%]">
            {list.map((l) => card(l, true))}
          </div>
          {list.length === 0 && <p className="absolute inset-x-8 bottom-10 z-[500] rounded-2xl bg-bg-elevated p-3 text-center text-sm shadow-deep">No lounges here. More cities coming soon.</p>}
        </div>
      ) : (
        <>
          <div className="px-4 pt-3">
            <LoungeMap className="h-48" points={points} onSelect={(id) => { setOpenId(id) }} userPos={userPos} onSearchArea={setBounds} />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 text-xs">
            {metros.map(([m, n]) => (
              <button key={m} onClick={() => { setSearch(m); setBounds(null) }} className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-muted hover:border-gold">
                {m} <strong className="text-ink">{n}</strong>
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState icon={MapPin} title="No lounges found" body="More cities coming soon. Try another city, ZIP or venue type." />
          ) : (
            <div className="space-y-2.5 p-4">{list.map((l) => card(l))}</div>
          )}
          <p className="flex items-center justify-center gap-1.5 px-6 pb-6 text-center text-xs text-ink-muted"><Info size={13} /> Hours and phone numbers may change. Call ahead.</p>
        </>
      )}

      {/* friendly location explainer */}
      <Sheet open={askLocation} onClose={() => setAskLocation(false)} title="Find lounges near you">
        <p className="text-sm text-ink-muted">We use your location once to sort lounges by distance. It isn’t saved or shared with other members.</p>
        <div className="mt-5 space-y-2 pb-3">
          <Button block size="lg" icon={LocateFixed} onClick={locate}>Use my location</Button>
          <Button block variant="ghost" onClick={() => setAskLocation(false)}>I’ll search by city or ZIP</Button>
        </div>
      </Sheet>

      {/* lounge detail */}
      <Sheet open={!!open && sheet === 'none'} onClose={() => setOpenId(null)} title={open?.name ?? ''}>
        {open && (
          <div className="space-y-4 pb-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">{open.venueType}</Badge>
              <Badge tone={open.verificationNote.includes('unverified') ? 'warning' : 'success'}>{open.verificationNote}</Badge>
              <Badge tone="muted">{open.metro} metro</Badge>
              <Badge tone="muted">{open.miles < 10 ? open.miles.toFixed(1) : Math.round(open.miles).toLocaleString()} mi away</Badge>
            </div>
            {on('lounge_reviews') && (
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl">{rating(open).toFixed(1)}</span>
                <div>
                  <Bands value={Math.round(rating(open))} size={14} />
                  <p className="mt-0.5 text-xs text-ink-muted">{reviewCount(open.id)} member reviews</p>
                </div>
              </div>
            )}
            <p className="flex gap-2 text-[15px]"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-deep" /> {open.street}, {open.city}, {open.state} {open.zip}</p>
            <p className="flex gap-2 text-[15px]"><Phone size={18} className="mt-0.5 shrink-0 text-gold-deep" /> {open.phone}</p>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${open.phone.replace(/\D/g, '')}`}><Button block icon={Phone}>Call</Button></a>
              <Button variant="secondary" icon={Bookmark} onClick={() => toggleFav(open.id)}>{c.favorites.includes(open.id) ? 'Saved' : 'Save'}</Button>
            </div>
            <div>
              <p className="micro-label mb-2">Directions</p>
              <div className="grid grid-cols-3 gap-2">
                {(['apple', 'google', 'waze'] as const).map((k) => (
                  <a key={k} href={directions(open)[k]} target="_blank" rel="noreferrer">
                    <Button block size="sm" variant="secondary" icon={Navigation}>{k === 'apple' ? 'Apple Maps' : k === 'google' ? 'Google' : 'Waze'}</Button>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={Share2} onClick={async () => {
                const text = `${open.name}, ${open.street}, ${open.city}, ${open.state}`
                if (navigator.share) { try { await navigator.share({ title: open.name, text }) } catch { /* cancelled */ } } else { navigator.clipboard?.writeText(text).catch(() => {}); toast('Address copied') }
              }}>Share</Button>
              {on('lounge_checkins') && <Button variant="secondary" icon={CheckCircle2} onClick={() => setSheet('checkin')}>I’m here</Button>}
            </div>
            {on('lounge_reviews') && (
              <>
                <Button variant="secondary" block icon={Star} onClick={() => setSheet('review')}>{c.loungeReviews.some((r) => r.loungeId === open.id && r.authorId === 'me') ? 'Edit your review' : 'Write a review'}</Button>
                <ReviewList loungeId={open.id} />
              </>
            )}
            <Button variant="ghost" block icon={Pencil} onClick={() => setSheet('correct')}>Suggest a correction</Button>
            <p className="text-center text-xs text-ink-muted">Locator only. Daily Stogie does not sell tobacco.</p>
          </div>
        )}
      </Sheet>

      <CorrectionSheet open={sheet === 'correct'} onClose={() => setSheet('none')} />
      {open && <ReviewSheet open={sheet === 'review'} loungeId={open.id} onClose={() => setSheet('none')} />}
      {open && <CheckinSheet open={sheet === 'checkin'} lounge={open} onClose={() => setSheet('none')} />}
    </div>
  )
}

function CorrectionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp()
  const [field, setField] = useState('Phone number')
  const [text, setText] = useState('')
  return (
    <Sheet open={open} onClose={onClose} title="Suggest a correction" footer={<Button block disabled={!text.trim()} onClick={() => { setText(''); toast('Thanks! An admin will review it.'); onClose() }}>Send correction</Button>}>
      <p className="mb-3 text-sm text-ink-muted">Lounge data comes from public listings and may be out of date.</p>
      <Field label="What’s wrong?" htmlFor="corr-field">
        <Select id="corr-field" value={field} onChange={(e) => setField(e.target.value)}>
          {['Phone number', 'Address', 'Venue type', 'Permanently closed', 'Name', 'Something else'].map((f) => <option key={f}>{f}</option>)}
        </Select>
      </Field>
      <Textarea className="mt-3" value={text} onChange={(e) => setText(e.target.value)} placeholder="The correct details" aria-label="Correction details" />
    </Sheet>
  )
}

function ReviewSheet({ open, loungeId, onClose }: { open: boolean; loungeId: string; onClose: () => void }) {
  const { c, setC } = useCommunity()
  const { toast } = useApp()
  const existing = c.loungeReviews.find((r) => r.loungeId === loungeId && r.authorId === 'me')
  const [photo, setPhoto] = useState(existing?.photo)
  const photoRef = useRef<HTMLInputElement>(null)
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [menu, setMenu] = useState(existing?.pairingMenu ?? 0)
  const [tips, setTips] = useState(existing?.tips ?? '')
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Review this lounge"
      footer={
        <Button block disabled={!rating} onClick={() => {
          const review: LoungeReview = { id: existing?.id ?? `r${Date.now()}`, loungeId, authorId: 'me', rating, tags, pairingMenu: menu, tips: tips.trim(), photo, at: 'now', reactions: existing?.reactions ?? {}, reactors: existing?.reactors ?? [] }
          setC((s) => ({ loungeReviews: existing ? s.loungeReviews.map((r) => (r.id === existing.id ? review : r)) : [review, ...s.loungeReviews] }))
          toast('Review posted. Thanks for helping the community!')
          onClose()
        }}>Submit review</Button>
      }
    >
      <div className="space-y-5 pb-2">
        <div><p className="mb-2 text-sm font-semibold">Overall</p><BandRating label="Overall rating" value={rating} onChange={setRating} /></div>
        <div>
          <p className="mb-2 text-sm font-semibold">Atmosphere</p>
          <div className="flex flex-wrap gap-2">{ATMOSPHERE.map((a) => <Chip key={a} size="sm" selected={tags.includes(a)} onClick={() => setTags(tags.includes(a) ? tags.filter((x) => x !== a) : [...tags, a])}>{a}</Chip>)}</div>
        </div>
        <div><p className="mb-2 text-sm font-semibold">Pairing menu quality</p><BandRating label="Pairing menu" value={menu} onChange={setMenu} /></div>
        <div>
          <p className="mb-2 text-sm font-semibold">Photo <span className="font-normal text-ink-muted">(optional)</span></p>
          {photo ? (
            <div className="relative h-36 overflow-hidden rounded-2xl"><img src={photo} alt="" className="size-full object-cover" /><button onClick={() => setPhoto(undefined)} className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">Remove</button></div>
          ) : (
            <Button variant="secondary" block onClick={() => photoRef.current?.click()}>Add a photo of the lounge</Button>
          )}
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f && f.type.startsWith('image/')) setPhoto(await shrinkImage(f))
          }} />
        </div>
        <Field label="Tips for other members" htmlFor="tips" optional><Textarea id="tips" value={tips} onChange={(e) => setTips(e.target.value)} maxLength={500} placeholder="Best seats, when it’s quiet, staff picks…" /></Field>
        <p className="text-xs text-ink-muted">One review per member per lounge. Reviews are moderated.</p>
      </div>
    </Sheet>
  )
}

function CheckinSheet({ open, lounge, onClose }: { open: boolean; lounge: Lounge; onClose: () => void }) {
  const { setC } = useCommunity()
  const { toast } = useApp()
  const [visibleTo, setVisibleTo] = useState<'Matches' | 'Mentors' | 'Matches & mentors'>('Matches')
  const [checking, setChecking] = useState(false)

  const save = (verified: boolean) => {
    setC((s) => ({ checkins: [{ loungeId: lounge.id, at: Date.now(), visibleTo, verified }, ...s.checkins] }))
    toast(verified ? 'Checked in! Passport stamped.' : 'Checked in (unverified). No passport stamp.')
    setChecking(false)
    onClose()
  }

  const verify = () => {
    setChecking(true)
    if (!navigator.geolocation) return save(false)
    navigator.geolocation.getCurrentPosition(
      (p) => save(milesBetween([p.coords.latitude, p.coords.longitude], [lounge.lat, lounge.lng]) <= 0.19),
      () => { setChecking(false); toast('Couldn’t get your location. Try a manual check-in.') },
      { timeout: 8000 },
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Check in at ${lounge.name}`}>
      <p className="text-sm text-ink-muted">Let your matches or mentors know you’re here. Your check-in disappears after 4 hours, and we never keep a location history.</p>
      <div className="mt-4">
        <Segmented value={visibleTo} onChange={setVisibleTo} options={[{ value: 'Matches', label: 'Matches' }, { value: 'Mentors', label: 'Mentors' }, { value: 'Matches & mentors', label: 'Both' }]} />
      </div>
      <div className="mt-5 space-y-2 pb-3">
        <Button block size="lg" icon={LocateFixed} disabled={checking} onClick={verify}>{checking ? 'Checking location…' : 'Verify with my location'}</Button>
        <Button block variant="ghost" onClick={() => save(false)}>Check in manually</Button>
        <p className="text-center text-xs text-ink-muted">Verified check-ins (within ~300 m) earn Cigar Passport stamps.</p>
      </div>
    </Sheet>
  )
}

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 1000 / Math.max(img.width, img.height))
      const cv = document.createElement('canvas')
      cv.width = img.width * k
      cv.height = img.height * k
      cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
      resolve(cv.toDataURL('image/jpeg', 0.8))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function ReviewList({ loungeId }: { loungeId: string }) {
  const { c } = useCommunity()
  const author = useAuthor()
  const list = c.loungeReviews.filter((r) => r.loungeId === loungeId)
  if (!list.length) return <p className="rounded-2xl bg-surface-2 p-3 text-center text-sm text-ink-muted">No member reviews yet. Be the first!</p>
  return (
    <section>
      <h3 className="micro-label mb-2">Member reviews</h3>
      <div className="space-y-3">
        {list.map((r) => {
          const a = author(r.authorId)
          return (
            <article key={r.id} className="rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2.5">
                <Avatar tone={a.tone} name={a.name} src={a.src} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-[11px] text-ink-muted">{a.userType} · {r.at}</p>
                </div>
                <Bands value={r.rating} size={10} />
              </div>
              {r.tips && <p className="mt-2 text-sm">{r.tips}</p>}
              {r.photo && <img src={r.photo} alt="" className="mt-2 h-36 w-full rounded-xl object-cover" />}
              {r.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{r.tags.map((t) => <Chip key={t} size="sm">{t}</Chip>)}</div>}
              <div className="mt-2"><EngagementBar compact itemId={r.id} reactions={r.reactions} reactors={r.reactors} shareLink={`${location.origin}/settings/search?lounge=${loungeId}`} /></div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
