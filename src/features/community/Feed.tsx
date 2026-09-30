import { Bookmark, CalendarDays, Flame, ImagePlus, Newspaper, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/brand'
import { Chip, EmptyState, Segmented, Select, Skeleton } from '@/components/ui'
import { MEMBERS } from '@/data/mock/members'
import { PREF_SECTIONS } from '@/data/options'
import { scoreMember } from '@/lib/api'
import { useApp } from '@/lib/store'
import { Composer } from './Composer'
import { CommentsSheet, PostCard } from './PostCard'
import { useCommunity } from './store'
import { TOPICS, type Post, type PostType } from './types'

type Tab = 'foryou' | 'nearby' | 'mentors' | 'saved'
const opt = (id: string) => PREF_SECTIONS.flatMap((s) => s.groups).find((g) => g.id === id)!.options

export function Feed() {
  const { state } = useApp()
  const { c, on } = useCommunity()
  const [tab, setTab] = useState<Tab>('foryou')
  const [topic, setTopic] = useState('')
  const [composer, setComposer] = useState<PostType | null>(null)
  const [commentsFor, setCommentsFor] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [smokeOnly, setSmokeOnly] = useState(false)
  const [sf, setSf] = useState({ brand: '', strength: '', wrapper: '', pairing: '' })


  const posts = useMemo(() => {
    const visible = c.posts.filter(
      (p) => !c.hidden.includes(p.id) && !state.blocked.includes(p.authorId) && (!p.pendingReview || p.authorId === 'me'),
    )
    let list = visible
    if (tab === 'nearby') list = list.filter((p) => p.metro === state.demographics.city || p.authorId === 'me')
    if (tab === 'mentors')
      list = list.filter((p) => {
        const m = MEMBERS.find((x) => x.id === p.authorId)
        return m && (m.mentorship === 'Willing to Guide Beginners' || m.mentorship === 'Both')
      })
    if (tab === 'saved') list = list.filter((p) => c.saved.includes(p.id))
    if (topic) list = list.filter((p) => p.topic === topic)
    if (smokeOnly)
      list = list.filter(
        (p) =>
          p.smoke &&
          (!sf.brand || p.smoke.brand === sf.brand) &&
          (!sf.strength || String(p.smoke.strength) === sf.strength) &&
          (!sf.wrapper || p.smoke.wrapper === sf.wrapper) &&
          (!sf.pairing || p.smoke.pairing === sf.pairing),
      )
    if (tab === 'foryou') {
      const rank = (p: Post, i: number) => {
        const m = MEMBERS.find((x) => x.id === p.authorId)
        const match = m ? scoreMember(state, m).match : 80
        const engagement = Object.values(p.reactions).reduce((a, b) => a + (b ?? 0), 0) + p.comments.length * 2
        return match * 0.5 + engagement * 0.8 - i * 4 + (p.authorId === 'me' ? 100 : 0)
      }
      list = list.map((p, i) => ({ p, s: rank(p, i) })).sort((a, b) => b.s - a.s).map((x) => x.p)
    }
    return list
  }, [c.posts, c.hidden, c.saved, state, tab, topic, smokeOnly, sf])

  return (
    <div className="pb-4">
      <div className="px-4">
        <Segmented
          value={tab}
          onChange={(t) => { setLoading(false); setTab(t) }}
          options={[
            { value: 'foryou', label: 'For You' },
            { value: 'nearby', label: 'Nearby' },
            { value: 'mentors', label: 'Mentors' },
            { value: 'saved', label: 'Saved' },
          ]}
        />
      </div>

      {/* composer entry */}
      <div className="card mx-4 mt-3 p-3">
        <div className="flex items-center gap-3">
          <Avatar tone={30} name={state.demographics.name} src={state.photo} size={40} />
          <button onClick={() => setComposer('update')} className="min-h-11 flex-1 rounded-full border border-line bg-surface-2 px-4 text-left text-sm text-ink-muted hover:border-gold">
            Share something with the lounge…
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-[13px] font-medium text-ink-muted">
          <button onClick={() => setComposer('update')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl hover:bg-surface-2"><ImagePlus size={16} className="text-gold-deep" /> Photo</button>
          {on('smoke_reports') && <button onClick={() => setComposer('smoke')} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl hover:bg-surface-2"><Flame size={16} className="text-ember" /> Smoke Report</button>}
          {on('events') && <Link to="/events" className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl hover:bg-surface-2"><CalendarDays size={16} className="text-leaf" /> Events</Link>}
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {on('smoke_reports') && (
          <Chip selected={smokeOnly} onClick={() => setSmokeOnly(!smokeOnly)}><SlidersHorizontal size={13} /> Smoke Reports</Chip>
        )}
        <Chip selected={!topic} onClick={() => setTopic('')}>All</Chip>
        {TOPICS.map((t) => <Chip key={t} selected={topic === t} onClick={() => setTopic(topic === t ? '' : t)}>{t}</Chip>)}
      </div>
      {smokeOnly && (
        <div className="mx-4 mt-2 grid grid-cols-2 gap-2">
          <Select aria-label="Brand" value={sf.brand} onChange={(e) => setSf({ ...sf, brand: e.target.value })} placeholder="Any brand">{opt('brands').map((o) => <option key={o}>{o}</option>)}</Select>
          <Select aria-label="Strength" value={sf.strength} onChange={(e) => setSf({ ...sf, strength: e.target.value })} placeholder="Any strength">{[1, 2, 3, 4, 5].map((o) => <option key={o} value={o}>{o} / 5</option>)}</Select>
          <Select aria-label="Wrapper" value={sf.wrapper} onChange={(e) => setSf({ ...sf, wrapper: e.target.value })} placeholder="Any wrapper">{opt('wrapper').map((o) => <option key={o}>{o}</option>)}</Select>
          <Select aria-label="Pairing" value={sf.pairing} onChange={(e) => setSf({ ...sf, pairing: e.target.value })} placeholder="Any pairing">{opt('pairings').map((o) => <option key={o}>{o}</option>)}</Select>
        </div>
      )}

      <div className="mt-3 space-y-3 px-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card space-y-3 p-4">
              <div className="flex gap-3"><Skeleton className="size-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>
              <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-40" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <EmptyState
            icon={tab === 'saved' ? Bookmark : Newspaper}
            title={tab === 'saved' ? 'Nothing saved yet' : 'No posts here yet'}
            body={tab === 'saved' ? 'Tap Save on any post to keep it here.' : 'Be the first to share something with the lounge.'}
          />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onOpenComments={() => setCommentsFor(p)} />)
        )}
      </div>

      <Composer key={composer ?? 'closed'} open={!!composer} initialType={composer ?? 'update'} onClose={() => setComposer(null)} />
      <CommentsSheet post={commentsFor} onClose={() => setCommentsFor(null)} />
    </div>
  )
}
