import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, Heart, Map as MapIcon, Plane, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogoMark } from '@/components/brand'
import { Button, Chip, EmptyState, ErrorState, Segmented, Sheet, Skeleton } from '@/components/ui'
import { Feed } from '@/features/community/Feed'
import { useCommunity } from '@/features/community/store'
import { MEETUP_OPTIONS, MENTORSHIP_OPTIONS, USER_TYPES } from '@/data/options'
import { MatchOverlay } from '@/features/discover/MatchOverlay'
import { SwipeCard, type SwipeDir } from '@/features/discover/SwipeDeck'
import { RangeSlider } from '@/features/profile/controls'
import { getDeck } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import type { ScoredMember } from '@/types'

interface Filters {
  distance: number
  age: [number, number]
  userTypes: string[]
  meetup: string[]
  mentorship: string[]
}
const DEFAULT_FILTERS: Filters = { distance: 50, age: [21, 70], userTypes: [], meetup: [], mentorship: [] }

export default function Discover() {
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const { c, on } = useCommunity()
  const [params, setParams] = useSearchParams()
  const view = on('community_feed') && params.get('view') === 'feed' ? 'feed' : 'people'
  const unread = c.notifications.filter((n) => !c.readNotifications.includes(n.id) && c.notificationSettings[n.type]).length
  const exclude = useMemo(() => [...state.blocked], [state.blocked])
  const q = useQuery({
    queryKey: ['deck', exclude],
    queryFn: () => getDeck(state, exclude),
  })
  const [gone, setGone] = useState<string[]>([])
  const [lastPass, setLastPass] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<SwipeDir | null>(null)
  const [match, setMatch] = useState<ScoredMember | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS)

  const deck = useMemo(
    () =>
      (q.data ?? []).filter(
        (m) =>
          !gone.includes(m.id) &&
          m.age >= filters.age[0] &&
          m.age <= filters.age[1] &&
          (!filters.userTypes.length || filters.userTypes.includes(m.userType)) &&
          (!filters.meetup.length || filters.meetup.includes(m.meetup)) &&
          (!filters.mentorship.length || filters.mentorship.includes(m.mentorship)),
      ),
    [q.data, gone, filters],
  )
  const top = deck[0]

  const onSwiped = useCallback(
    (m: ScoredMember, dir: SwipeDir) => {
      setTrigger(null)
      setGone((g) => [...g, m.id])
      if (dir === 'pass') {
        setLastPass(m.id)
        set((s) => ({ passed: [...s.passed, m.id] }))
      } else {
        setLastPass(null)
        set((s) => ({ liked: [...s.liked, m.id] }))
        if (m.likesYou) {
          set((s) => ({ matched: s.matched.includes(m.id) ? s.matched : [m.id, ...s.matched] }))
          setMatch(m)
        }
      }
    },
    [set],
  )

  const undo = () => {
    if (!lastPass) return
    setGone((g) => g.filter((id) => id !== lastPass))
    set((s) => ({ passed: s.passed.filter((id) => id !== lastPass) }))
    setLastPass(null)
    toast('Brought back your last pass')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view === 'feed' || !top || trigger || match || filtersOpen) return
      if ((e.target as HTMLElement).closest('input,textarea,select')) return
      if (e.key === 'ArrowRight') setTrigger('like')
      if (e.key === 'ArrowLeft') setTrigger('pass')
      if (e.key === 'Enter') nav(`/member/${top.id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, top, trigger, match, filtersOpen, nav])

  const activeFilters =
    filters.userTypes.length + filters.meetup.length + filters.mentorship.length + (filters.age[0] !== 21 || filters.age[1] !== 70 ? 1 : 0)

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 px-5 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
        <LogoMark size={30} className="lg:hidden" />
        <h1 className="flex-1 font-serif text-[28px]">Discover</h1>
        {on('nearby_map') && view === 'people' && (
          <Link to="/nearby" aria-label="Nearby map" className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink">
            <MapIcon size={19} strokeWidth={1.6} />
          </Link>
        )}
        {on('notifications') && (
          <Link to="/notifications" aria-label={`Notifications, ${unread} unread`} className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-ink">
            <Bell size={19} strokeWidth={1.6} />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white">{unread}</span>}
          </Link>
        )}
        {view === 'people' && (
          <button
            onClick={() => {
              setDraft(filters)
              setFiltersOpen(true)
            }}
            aria-label="Filters"
            className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-ink"
          >
            <SlidersHorizontal size={19} strokeWidth={1.6} />
            {activeFilters > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-on-gold">
                {activeFilters}
              </span>
            )}
          </button>
        )}
      </header>

      {on('community_feed') && (
        <div className="px-4 pb-2">
          <Segmented
            value={view}
            onChange={(v) => setParams(v === 'feed' ? { view: 'feed' } : {}, { replace: true })}
            options={[
              { value: 'people', label: 'People' },
              { value: 'feed', label: 'Lounge Feed' },
            ]}
          />
        </div>
      )}

      {on('travel_mode') && c.travel && view === 'people' && (
        <Link to="/travel" className="mx-4 mb-2 flex items-center gap-2 rounded-2xl border border-info/30 bg-info/10 px-3.5 py-2 text-[13px]">
          <Plane size={16} className="text-info" /> Showing locals and travelers in <strong>{c.travel.city}</strong> · {c.travel.from} – {c.travel.to}
        </Link>
      )}

      {view === 'feed' ? (
        <Feed />
      ) : (
      <>
      <div className="relative mx-4 mt-2 flex-1" style={{ minHeight: 440 }}>
        {q.isLoading ? (
          <Skeleton className="absolute inset-0 rounded-[28px]" />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : deck.length === 0 ? (
          <div className="card absolute inset-0 grid place-items-center">
            <EmptyState
              icon={Heart}
              title="You’re all caught up"
              body="No more members match your filters right now. Check back soon or widen your filters."
              action={<Button variant="secondary" onClick={() => setFiltersOpen(true)}>Adjust filters</Button>}
            />
          </div>
        ) : (
          deck
            .slice(0, 3)
            .reverse()
            .map((m) => {
              const depth = deck.indexOf(m)
              return (
                <SwipeCard
                  key={m.id}
                  member={m}
                  depth={depth}
                  isTop={depth === 0}
                  trigger={depth === 0 ? trigger : null}
                  onSwiped={(dir) => onSwiped(m, dir)}
                  onOpen={() => nav(`/member/${m.id}`)}
                />
              )
            })
        )}
      </div>

      <div className="flex items-center justify-center gap-5 py-5">
        <ActionBtn label="Pass" onClick={() => top && setTrigger('pass')} disabled={!top || !!trigger} className="text-danger">
          <X size={30} strokeWidth={2} />
        </ActionBtn>
        <ActionBtn label="Undo last pass" small onClick={undo} disabled={!lastPass} className="text-ink-muted">
          <RotateCcw size={22} strokeWidth={1.8} />
        </ActionBtn>
        <ActionBtn label="Like" onClick={() => top && setTrigger('like')} disabled={!top || !!trigger} gold>
          <Heart size={30} strokeWidth={2} className="fill-current" />
        </ActionBtn>
      </div>
      <p className="sr-only">Use the left arrow to pass, the right arrow to like, and Enter to open a profile.</p>
      </>
      )}

      <MatchOverlay
        member={match}
        onClose={() => setMatch(null)}
        onSayHello={() => {
          const id = match?.id
          setMatch(null)
          if (id) nav(`/messages/${id}`)
        }}
      />

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button
              className="flex-[2]"
              onClick={() => {
                setFilters(draft)
                setFiltersOpen(false)
              }}
            >
              Show members
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pt-2">
          <div>
            <div className="mb-3 flex justify-between">
              <span className="text-sm font-semibold">Maximum distance</span>
              <span className="font-serif text-lg">{draft.distance >= 250 ? 'Anywhere' : `${draft.distance} mi`}</span>
            </div>
            <input type="range" min={5} max={250} step={5} value={draft.distance} onChange={(e) => setDraft({ ...draft, distance: Number(e.target.value) })} className="w-full accent-[var(--gold)]" aria-label="Maximum distance" />
          </div>
          <RangeSlider label="Age range" min={21} max={80} value={draft.age} onChange={(age) => setDraft({ ...draft, age })} format={(n) => String(n)} />
          <FilterChips label="User type" options={[...USER_TYPES]} value={draft.userTypes} onChange={(userTypes) => setDraft({ ...draft, userTypes })} />
          <FilterChips label="Meetup willingness" options={MEETUP_OPTIONS} value={draft.meetup} onChange={(meetup) => setDraft({ ...draft, meetup })} />
          <FilterChips label="Mentorship" options={MENTORSHIP_OPTIONS} value={draft.mentorship} onChange={(mentorship) => setDraft({ ...draft, mentorship })} />
        </div>
      </Sheet>
    </div>
  )
}

function FilterChips({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} selected={value.includes(o)} onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function ActionBtn({
  children,
  label,
  onClick,
  disabled,
  small,
  gold,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  small?: boolean
  gold?: boolean
  className?: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'grid place-items-center rounded-full border shadow-soft transition disabled:opacity-40',
        small ? 'size-14' : 'size-[72px]',
        gold ? 'btn-gold border-transparent' : 'border-line bg-surface-solid',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
