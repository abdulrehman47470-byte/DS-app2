import { Award, BookOpen, ChevronRight, Flame, ListChecks, MessageSquareQuote, Newspaper, PlayCircle, Plus, Star, Trophy, Wine, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/brand'
import { ProgressBar } from '@/components/layout'
import { Button, Chip, Input, Sheet } from '@/components/ui'
import { LOUNGES } from '@/data/mock/content'
import { Bands, useAuthor } from '@/features/community/PostCard'
import { leaderboard, LEVELS, POINT_RULES, pointsFor } from '@/features/community/points'
import { useCommunity } from '@/features/community/store'
import { Still } from '@/pages/settings/Content'
import { cn } from '@/lib/cn'
import { MediaImg } from '@/components/Media'
import { useApp } from '@/lib/store'

const LEVEL_TONE: Record<string, string> = {
  Ember: 'from-[#e38a4b] to-[#b4521f]',
  Leaf: 'from-[#9bb070] to-[#5f7440]',
  Band: 'from-[#e7b468] to-[#bf8035]',
  Box: 'from-[#b98552] to-[#6e4222]',
  'Humidor Master': 'from-[#4a2c16] to-[#1e120a]',
}

export function LevelBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-gradient-to-b px-2 py-px text-[11px] font-semibold text-white', LEVEL_TONE[level], className)}>
      <Award size={11} /> {level}
    </span>
  )
}

/** Stogie Points card with level progress, how to earn, and leaderboard. */
export function PointsCard({ who }: { who: string }) {
  const { state } = useApp()
  const { c } = useCommunity()
  const author = useAuthor()
  const [open, setOpen] = useState(false)
  const p = pointsFor(c, who, state)
  const board = open ? leaderboard(c, state).slice(0, 8) : []
  return (
    <>
      <button onClick={() => setOpen(true)} className="card w-full p-4 text-left transition hover:border-gold">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b text-white', LEVEL_TONE[p.level.name])}><Trophy size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted">Stogie Points</p>
            <p className="flex items-baseline gap-2"><span className="font-serif text-2xl">{p.total.toLocaleString()}</span><span className="text-sm font-semibold text-gold-ink">{p.level.name}</span></p>
          </div>
          <ChevronRight size={18} className="text-ink-faint" />
        </div>
        <div className="mt-3"><ProgressBar value={p.progress} label="Level progress" /></div>
        <p className="mt-1.5 text-xs text-ink-muted">{p.next ? `${(p.next.min - p.total).toLocaleString()} points to ${p.next.name}` : 'Top level reached'}</p>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Stogie Points">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {LEVELS.map((l) => (
            <div key={l.name} className={cn('min-w-[78px] rounded-2xl border p-2 text-center', l.name === p.level.name ? 'border-gold bg-gold/12' : 'border-line')}>
              <p className="text-[11px] font-semibold">{l.name}</p>
              <p className="text-[10px] text-ink-muted">{l.min.toLocaleString()}+</p>
            </div>
          ))}
        </div>
        <h3 className="micro-label mb-2 mt-5">How to earn</h3>
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {POINT_RULES.map((r) => (
            <li key={r.key} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
              <span>{r.label}</span>
              <span className="font-semibold text-gold-ink">+{r.points}{who === 'me' && <span className="ml-2 text-xs font-normal text-ink-muted">×{p.breakdown[r.key]}</span>}</span>
            </li>
          ))}
        </ul>
        <h3 className="micro-label mb-2 mt-5">Top contributors</h3>
        <ol className="space-y-2 pb-4">
          {board.map((row, i) => {
            const a = author(row.id)
            return (
              <li key={row.id} className={cn('flex items-center gap-3 rounded-2xl px-2 py-1.5', row.id === 'me' && 'bg-gold/10')}>
                <span className="w-5 text-center font-serif text-lg text-gold-ink">{i + 1}</span>
                <Avatar tone={a.tone} name={a.name} src={a.src} size={34} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.id === 'me' ? 'You' : a.name}</span>
                <LevelBadge level={row.level.name} />
                <span className="w-12 text-right text-sm font-semibold">{row.total}</span>
              </li>
            )
          })}
        </ol>
        <p className="pb-3 text-xs text-ink-muted">Points reward helpful contributions. They never affect who you see in Discover.</p>
      </Sheet>
    </>
  )
}

/** LinkedIn-style highlight bullet points. */
export function Highlights({ items, onChange }: { items: string[]; onChange?: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(items)
  const [text, setText] = useState('')
  if (!items.length && !onChange) return null
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-[17px]"><ListChecks size={18} strokeWidth={1.5} className="text-gold-deep" /> Highlights</h2>
        {onChange && <button onClick={() => { setDraft(items); setOpen(true) }} className="text-sm font-semibold text-gold-ink">Edit</button>}
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h} className="flex gap-2.5 text-[15px]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />{h}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Add up to 5 points that sum you up, like “Hosted 10 lounge nights”.</p>
      )}
      {onChange && (
        <Sheet open={open} onClose={() => setOpen(false)} title="Highlights" footer={<Button block onClick={() => { onChange(draft); setOpen(false) }}>Save</Button>}>
          <p className="mb-3 text-sm text-ink-muted">Up to 5 short points shown near the top of your profile.</p>
          <ul className="space-y-2">
            {draft.map((h, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input value={h} maxLength={90} onChange={(e) => setDraft(draft.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`Highlight ${i + 1}`} />
                <button onClick={() => setDraft(draft.filter((_, j) => j !== i))} aria-label="Remove" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button>
              </li>
            ))}
          </ul>
          {draft.length < 5 && (
            <div className="mt-2 flex gap-2 pb-2">
              <Input value={text} maxLength={90} onChange={(e) => setText(e.target.value)} placeholder="Add a highlight" aria-label="New highlight"
                onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { e.preventDefault(); setDraft([...draft, text.trim()]); setText('') } }} />
              <Button icon={Plus} aria-label="Add highlight" disabled={!text.trim()} onClick={() => { setDraft([...draft, text.trim()]); setText('') }} />
            </div>
          )}
        </Sheet>
      )}
    </section>
  )
}

type ActTab = 'posts' | 'articles' | 'videos' | 'reviews' | 'pairings'

/** Everything a member has published, LinkedIn "Activity"-style. */
export function Activity({ who, name }: { who: string; name: string }) {
  const { c, on } = useCommunity()
  const [tab, setTab] = useState<ActTab>('posts')
  const posts = c.posts.filter((p) => p.authorId === who)
  const articles = c.articles.filter((a) => a.authorId === who && (!a.pendingReview || who === 'me'))
  const videos = c.videos.filter((v) => v.authorId === who && (!v.pendingReview || who === 'me'))
  const reviews = c.loungeReviews.filter((r) => r.authorId === who)
  const pairings = c.pairings.filter((p) => p.authorId === who)
  const tabs: { id: ActTab; label: string; n: number; icon: typeof Flame; show: boolean }[] = [
    { id: 'posts', label: 'Posts', n: posts.length, icon: Newspaper, show: on('community_feed') },
    { id: 'articles', label: 'Articles', n: articles.length, icon: BookOpen, show: true },
    { id: 'videos', label: 'Videos', n: videos.length, icon: PlayCircle, show: true },
    { id: 'reviews', label: 'Reviews', n: reviews.length, icon: Star, show: on('lounge_reviews') },
    { id: 'pairings', label: 'Pairings', n: pairings.length, icon: Wine, show: on('pairing_finder') },
  ]
  const visible = tabs.filter((t) => t.show)
  const current = visible.find((t) => t.id === tab) ? tab : visible[0]?.id
  const first = name.split(' ')[0]

  const empty = (text: string, to?: string, cta?: string) => (
    <div className="rounded-2xl border border-dashed border-line-strong p-5 text-center text-sm text-ink-muted">
      {text}
      {who === 'me' && to && <Link to={to} className="mt-2 block font-semibold text-gold-ink">{cta}</Link>}
    </div>
  )

  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-[17px]"><MessageSquareQuote size={18} strokeWidth={1.5} className="text-gold-deep" /> Activity</h2>
      <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
        {visible.map((t) => (
          <Chip key={t.id} size="sm" selected={current === t.id} onClick={() => setTab(t.id)}>{t.label} · {t.n}</Chip>
        ))}
      </div>
      {current === 'posts' && (posts.length ? (
        <ul className="space-y-2">{posts.slice(0, 4).map((p) => (
          <li key={p.id}><Link to="/discover?view=feed" className="block rounded-2xl bg-surface-2 p-3 text-sm hover:bg-gold/10">
            <p className="line-clamp-2">{p.text || (p.smoke ? `Smoke Report: ${p.smoke.brand} ${p.smoke.line}` : 'Shared media')}</p>
            <p className="mt-1 text-xs text-ink-muted">{p.at} · {Object.values(p.reactions).reduce((n, x) => n + (x ?? 0), 0)} reactions · {p.comments.length} comments</p>
          </Link></li>
        ))}</ul>
      ) : empty(`${who === 'me' ? 'You haven’t' : `${first} hasn’t`} posted yet.`, '/discover?view=feed', 'Write your first post'))}
      {current === 'articles' && (articles.length ? (
        <ul className="space-y-2">{articles.map((a) => (
          <li key={a.id}><Link to={`/settings/blog/${a.slug}`} className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-surface-2">
            {a.cover.src ? <MediaImg src={a.cover.src} className="h-14 w-16 shrink-0 rounded-xl object-cover" /> : <Still tone={a.cover.tone ?? 30} className="h-14 w-16 shrink-0 rounded-xl" />}
            <span className="min-w-0"><span className="line-clamp-2 font-serif text-[15px] leading-tight">{a.title}</span><span className="text-xs text-ink-muted">{a.at} · {a.readMins} min{a.pendingReview ? ' · In review' : ''}</span></span>
          </Link></li>
        ))}</ul>
      ) : empty('No articles yet.', '/settings/blog/write', 'Write an article'))}
      {current === 'videos' && (videos.length ? (
        <ul className="space-y-2">{videos.map((v) => (
          <li key={v.id}><Link to={`/settings/sessions/${v.id}`} className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-surface-2">
            <Still tone={v.tone} className="h-14 w-20 shrink-0 rounded-xl" />
            <span className="min-w-0"><span className="line-clamp-2 text-sm font-medium">{v.title}</span><span className="text-xs text-ink-muted">{v.category}{v.pendingReview ? ' · In review' : ''}</span></span>
          </Link></li>
        ))}</ul>
      ) : empty('No videos yet.', '/settings/sessions', 'Share a video'))}
      {current === 'reviews' && (reviews.length ? (
        <ul className="space-y-2">{reviews.map((r) => {
          const l = LOUNGES.find((x) => x.id === r.loungeId)
          return (
            <li key={r.id}><Link to={`/settings/search?lounge=${r.loungeId}`} className="block rounded-2xl bg-surface-2 p-3 hover:bg-gold/10">
              <p className="flex items-center justify-between text-sm font-semibold">{l?.name}<Bands value={r.rating} size={9} /></p>
              {r.tips && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{r.tips}</p>}
            </Link></li>
          )
        })}</ul>
      ) : empty('No lounge reviews yet.', '/settings/search', 'Review a lounge'))}
      {current === 'pairings' && (pairings.length ? (
        <ul className="space-y-2">{pairings.map((p) => (
          <li key={p.id}><Link to="/pairing" className="block rounded-2xl bg-surface-2 p-3 text-sm hover:bg-gold/10"><strong>{p.cigar}</strong> + {p.drink}{p.note && <span className="block text-ink-muted">“{p.note}”</span>}</Link></li>
        ))}</ul>
      ) : empty('No pairings shared yet.', '/pairing', 'Share a pairing'))}
    </section>
  )
}
