import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bookmark, Info, List, LocateFixed, Map as MapIcon, MapPin, Navigation, Pencil, Phone, Search, Share2, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Chip, EmptyState, ErrorState, Input, ListSkeleton, Segmented, Sheet, Textarea, TopBar } from '@/components/ui'
import { getLounges } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import type { Lounge } from '@/types'

const VENUE_TYPES: Lounge['venueType'][] = ['Lounge', 'Lounge + Shop', 'Shop + Lounge', 'Members club']

/** Themed placeholder map until Mapbox is connected in Phase 7. */
function PlaceholderMap({ lounges, selected, onSelect, tall }: { lounges: Lounge[]; selected?: string; onSelect: (l: Lounge) => void; tall?: boolean }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[20px] border border-line', tall ? 'h-[56dvh]' : 'h-48')}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <rect width="400" height="240" fill="var(--surface-2)" />
        <path d="M300 0c-20 60 30 90 10 140s40 80 30 100h60V0z" fill="var(--info)" opacity=".18" />
        <path d="M0 170c60-10 90 20 150 8s100-30 160-10" stroke="var(--info)" strokeOpacity=".25" strokeWidth="10" fill="none" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 22}H400`} stroke="var(--line-strong)" strokeOpacity=".35" strokeWidth={i % 4 === 0 ? 3 : 1} />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <path key={`v${i}`} d={`M${i * 24} 0V240`} stroke="var(--line-strong)" strokeOpacity=".35" strokeWidth={i % 5 === 0 ? 3 : 1} />
        ))}
        <path d="M0 40L400 200" stroke="var(--gold)" strokeOpacity=".35" strokeWidth="5" />
        <rect x="60" y="60" width="50" height="34" rx="4" fill="var(--leaf)" opacity=".18" />
        <rect x="200" y="120" width="40" height="26" rx="4" fill="var(--leaf)" opacity=".18" />
      </svg>
      {lounges.map((l) => (
        <button
          key={l.id}
          onClick={() => onSelect(l)}
          aria-label={l.name}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
        >
          <motion.span
            animate={selected === l.id ? { scale: 1.25, y: -4 } : { scale: 1, y: 0 }}
            className="relative grid size-9 place-items-center rounded-full rounded-br-none border-2 border-white bg-gradient-to-b from-gold-light to-gold-deep text-on-gold shadow-lg [transform:rotate(45deg)]"
          >
            <Store size={15} className="-rotate-45" />
          </motion.span>
        </button>
      ))}
      <span className="absolute left-[46%] top-[52%] size-4 rounded-full border-[3px] border-white bg-info shadow" aria-label="You are here" />
      <p className="absolute bottom-2 left-2 rounded-full bg-bg/80 px-2 py-0.5 text-[10px] text-ink-muted backdrop-blur">Map preview · Mapbox in Phase 7</p>
    </div>
  )
}

export default function StogieSearch() {
  const { toast } = useApp()
  const q = useQuery({ queryKey: ['lounges'], queryFn: getLounges })
  const [view, setView] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [nearMe, setNearMe] = useState(false)
  const [open, setOpen] = useState<Lounge | null>(null)
  const [correcting, setCorrecting] = useState(false)
  const [saved, setSaved] = useState<string[]>([])

  const list = useMemo(() => {
    const s = search.toLowerCase()
    const l = (q.data ?? []).filter(
      (x) =>
        (!s || `${x.name} ${x.city} ${x.state} ${x.zip} ${x.metro}`.toLowerCase().includes(s)) &&
        (!types.length || types.includes(x.venueType)),
    )
    return nearMe ? [...l].sort((a, b) => a.miles - b.miles) : l
  }, [q.data, search, types, nearMe])

  const metros = useMemo(() => {
    const c: Record<string, number> = {}
    q.data?.forEach((l) => (c[l.metro] = (c[l.metro] ?? 0) + 1))
    return Object.entries(c)
  }, [q.data])

  const locate = () => {
    if (!navigator.geolocation) return toast('Location isn’t available. Search by city or ZIP instead.')
    navigator.geolocation.getCurrentPosition(
      () => { setNearMe(true); toast('Sorted by distance') },
      () => toast('No problem. Search by city or ZIP instead.'),
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Stogie Search" right={
        <Segmented value={view} onChange={setView} className="w-28 p-0.5" options={[
          { value: 'list', label: <List size={16} aria-label="List" /> },
          { value: 'map', label: <MapIcon size={16} aria-label="Map" /> },
        ]} />
      } />
      <div className="space-y-3 px-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input placeholder="Search lounges, city or ZIP" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search lounges" />
          </div>
          <button onClick={locate} aria-label="Near me" className={cn('grid size-11 shrink-0 place-items-center rounded-[14px] border', nearMe ? 'border-gold bg-gold/15 text-gold-deep' : 'border-line bg-surface')}>
            <LocateFixed size={19} />
          </button>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip selected={!types.length} onClick={() => setTypes([])}>All types</Chip>
          {VENUE_TYPES.map((t) => (
            <Chip key={t} selected={types.includes(t)} onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])}>{t}</Chip>
          ))}
        </div>
        {view === 'list' && <PlaceholderMap lounges={list} onSelect={setOpen} />}
      </div>

      {view === 'map' ? (
        <div className="px-4 pt-3"><PlaceholderMap tall lounges={list} onSelect={setOpen} selected={open?.id} /></div>
      ) : q.isLoading ? (
        <div className="p-4"><ListSkeleton rows={4} avatar={false} /></div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={MapPin} title="No lounges found" body="More cities coming soon. Try another city, ZIP or venue type." />
      ) : (
        <>
          <p className="px-5 pt-4 text-xs text-ink-muted">
            {list.length} lounges · {metros.map(([m, n]) => `${m} ${n}`).join(' · ')}
          </p>
          <ul className="space-y-2.5 p-4">
            {list.map((l) => (
              <li key={l.id} className="card p-4">
                <button onClick={() => setOpen(l)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-[17px] leading-tight">{l.name}</h3>
                    {nearMe && <span className="shrink-0 text-xs font-semibold text-gold-ink">{l.miles.toLocaleString()} mi</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">{l.venueType} · {l.street}, {l.city}, {l.state}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${l.phone.replace(/\D/g, '')}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-xs font-semibold text-gold-ink"><Phone size={13} /> Call</a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${l.street}, ${l.city}, ${l.state} ${l.zip}`)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-xs font-semibold text-gold-ink"><Navigation size={13} /> Directions</a>
                </div>
              </li>
            ))}
          </ul>
          <p className="flex items-center justify-center gap-1.5 px-6 pb-6 text-center text-xs text-ink-muted"><Info size={13} /> Hours and phone numbers may change. Call ahead.</p>
        </>
      )}

      <Sheet open={!!open} onClose={() => { setOpen(null); setCorrecting(false) }} title={open?.name ?? ''}>
        {open && (
          <div className="space-y-4 pb-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">{open.venueType}</Badge>
              <Badge tone={open.verificationNote.includes('unverified') ? 'warning' : 'success'}>{open.verificationNote}</Badge>
              <Badge tone="muted">{open.metro} metro</Badge>
            </div>
            <p className="flex gap-2 text-[15px]"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-deep" /> {open.street}, {open.city}, {open.state} {open.zip}</p>
            <p className="flex gap-2 text-[15px]"><Phone size={18} className="mt-0.5 shrink-0 text-gold-deep" /> {open.phone}</p>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${open.phone.replace(/\D/g, '')}`}><Button block icon={Phone}>Call</Button></a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${open.street}, ${open.city}, ${open.state}`)}`} target="_blank" rel="noreferrer"><Button block variant="secondary" icon={Navigation}>Directions</Button></a>
              <Button variant="secondary" icon={Bookmark} onClick={() => { setSaved(saved.includes(open.id) ? saved.filter((x) => x !== open.id) : [...saved, open.id]); toast(saved.includes(open.id) ? 'Removed from favorites' : 'Saved to favorites') }}>
                {saved.includes(open.id) ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" icon={Share2} onClick={() => { navigator.clipboard?.writeText(`${open.name}, ${open.street}, ${open.city}`).catch(() => {}); toast('Address copied') }}>Share</Button>
            </div>
            {correcting ? (
              <div className="space-y-2">
                <Textarea placeholder="What should we fix? (e.g. new phone number, closed, moved)" aria-label="Correction" />
                <Button block onClick={() => { setCorrecting(false); toast('Thanks! An admin will review it.') }}>Send correction</Button>
              </div>
            ) : (
              <Button variant="ghost" block icon={Pencil} onClick={() => setCorrecting(true)}>Suggest a correction</Button>
            )}
            <p className="text-center text-xs text-ink-muted">Locator only. Daily Stogie does not sell tobacco.</p>
          </div>
        )}
      </Sheet>
    </div>
  )
}
