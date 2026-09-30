import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark, Clock, Copy, EyeOff, Flag, MapPin, MessageCircle, MoreHorizontal, Pencil,
  Reply, Send, Share2, Trash2,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, UserTypeBadge } from '@/components/brand'
import { Badge, Button, Chip, Sheet } from '@/components/ui'
import { LOUNGES } from '@/data/mock/content'
import { MEMBERS } from '@/data/mock/members'
import { ReportSheet } from '@/features/safety'
import { Still } from '@/pages/settings/Content'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import { MusicCard, VideoCard } from './embeds'
import { checkContent } from './moderation'
import { LIMITS, useCommunity } from './store'
import { REACTIONS, type Comment, type Post, type ReactionKey, type SmokeReport } from './types'

export function useAuthor() {
  const { state } = useApp()
  return (id: string) => {
    if (id === 'me')
      return { id: 'me', name: state.demographics.name, first: state.demographics.name.split(' ')[0], tone: 30, userType: state.demographics.userType, place: `${state.demographics.city}, ${state.demographics.state}`, src: state.photo }
    const m = MEMBERS.find((x) => x.id === id)!
    return { id, name: `${m.firstName} ${m.lastName}`, first: m.firstName, tone: m.tone, userType: m.userType, place: `${m.city}, ${m.state}`, src: null as string | null }
  }
}

/** Highlights @mentions. Plain text only (XSS-safe). */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn('whitespace-pre-wrap text-[15px] leading-relaxed', className)}>
      {text.split(/(@[A-Za-z]+)/g).map((part, i) =>
        part.startsWith('@') ? <span key={i} className="font-semibold text-gold-ink">{part}</span> : part,
      )}
    </p>
  )
}

export function Bands({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ width: size * 1.6, height: size * 0.55 }} className={cn('rounded-[3px] border', n <= value ? 'border-gold-deep bg-gradient-to-b from-gold-light to-gold-deep' : 'border-line-strong bg-surface-2')} />
      ))}
    </span>
  )
}

export function SmokeReportCard({ r }: { r: SmokeReport }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/12 to-transparent">
      <div className="flex items-center justify-between border-b border-gold/30 bg-gold/10 px-4 py-2">
        <span className="micro-label !text-gold-ink">Smoke Report</span>
        <Bands value={r.rating} />
      </div>
      <div className="p-4">
        <p className="font-serif text-xl leading-tight">{r.brand} {r.line}</p>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {[r.vitola, r.ringGauge && `${r.ringGauge} ring`, r.length, r.wrapper, r.origin].filter(Boolean).join(' · ')}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[['Strength', `${r.strength}/5`], ['Construction', `${r.construction}/5`], ['Smoke time', r.smokeTime || '—']].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-2 px-2 py-1.5">
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">{k}</dt>
              <dd className="font-serif text-[15px]">{v}</dd>
            </div>
          ))}
        </dl>
        {r.flavors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">{r.flavors.map((f) => <Chip key={f} size="sm" highlight>{f}</Chip>)}</div>
        )}
        {r.pairing && <p className="mt-3 text-[13px]"><span className="text-ink-muted">Paired with </span><strong>{r.pairing}</strong></p>}
        {r.notes && <p className="mt-2 text-sm italic text-ink-muted">“{r.notes}”</p>}
      </div>
    </div>
  )
}

function Photos({ photos }: { photos: Post['photos'] }) {
  if (!photos.length) return null
  const n = photos.length
  return (
    <div className={cn('grid gap-1 overflow-hidden rounded-2xl', n === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
      {photos.slice(0, 4).map((p, i) => (
        <div key={i} className={cn('relative', n === 1 ? 'aspect-[4/3]' : 'aspect-square', n === 3 && i === 0 && 'row-span-2 aspect-auto')}>
          {p.src ? <img src={p.src} alt="" className="absolute inset-0 size-full object-cover" /> : <Still tone={p.tone ?? 30} variant={i} className="absolute inset-0" />}
          {i === 3 && n > 4 && <span className="absolute inset-0 grid place-items-center bg-black/50 font-serif text-2xl text-white">+{n - 4}</span>}
        </div>
      ))}
    </div>
  )
}

function Poll({ post }: { post: Post }) {
  const { c, setC } = useCommunity()
  const mine = c.votes[post.id]
  const poll = post.poll!
  const votes = poll.votes.map((v, i) => v + (mine === i ? 1 : 0))
  const total = votes.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-2">
      {poll.options.map((o, i) => {
        const pct = total ? Math.round((votes[i] / total) * 100) : 0
        return (
          <button
            key={o}
            disabled={mine !== undefined}
            onClick={() => setC((s) => ({ votes: { ...s.votes, [post.id]: i } }))}
            className={cn('relative flex min-h-11 w-full items-center overflow-hidden rounded-[14px] border px-3.5 text-left text-sm font-medium', mine === i ? 'border-gold' : 'border-line', mine === undefined && 'hover:border-gold')}
          >
            {mine !== undefined && <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="absolute inset-y-0 left-0 bg-gold/18" />}
            <span className="relative flex-1">{o}</span>
            {mine !== undefined && <span className="relative font-serif">{pct}%</span>}
          </button>
        )
      })}
      <p className="text-xs text-ink-muted">{total} votes · {poll.days} {poll.days === 1 ? 'day' : 'days'} left</p>
    </div>
  )
}

function EventShare({ eventId }: { eventId: string }) {
  const { c } = useCommunity()
  const e = c.events.find((x) => x.id === eventId)
  if (!e) return null
  const lounge = LOUNGES.find((l) => l.id === e.loungeId)
  const d = new Date(e.date)
  return (
    <Link to={`/events/${e.id}`} className="flex gap-3 rounded-2xl border border-line bg-surface-2 p-3 transition hover:border-gold">
      <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-gold-light to-gold-deep py-1.5 text-white">
        <span className="text-[10px] font-bold uppercase">{d.toLocaleString([], { month: 'short' })}</span>
        <span className="font-serif text-2xl leading-none">{d.getDate()}</span>
      </div>
      <div className="min-w-0">
        <p className="font-serif text-[17px] leading-tight">{e.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted"><MapPin size={12} /> {lounge?.name ?? e.venue}</p>
        <p className="text-xs text-ink-muted">{e.going.length} going · {e.capacity} spots</p>
      </div>
    </Link>
  )
}

export function ReactionPicker({ onPick, current }: { onPick: (k: ReactionKey | null) => void; current?: ReactionKey }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      className="absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-full border border-line bg-bg-elevated p-1.5 shadow-deep"
      role="menu"
    >
      {REACTIONS.map((r) => (
        <motion.button
          key={r.key}
          role="menuitem"
          whileHover={{ scale: 1.3, y: -4 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPick(current === r.key ? null : r.key)}
          className={cn('grid size-10 place-items-center rounded-full text-xl', current === r.key && 'bg-gold/20')}
          title={r.label}
          aria-label={r.label}
        >
          {r.emoji}
        </motion.button>
      ))}
    </motion.div>
  )
}

function countWith(base: Partial<Record<ReactionKey, number>>, mine?: ReactionKey) {
  const out = { ...base }
  if (mine) out[mine] = (out[mine] ?? 0) + 1
  return out
}

function ReactionSummary({ counts, onClick }: { counts: Partial<Record<ReactionKey, number>>; onClick?: () => void }) {
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0)
  if (!total) return null
  const top = REACTIONS.filter((r) => counts[r.key]).sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0)).slice(0, 3)
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:underline" aria-label="See who reacted">
      <span className="flex -space-x-1">{top.map((r) => <span key={r.key} className="grid size-5 place-items-center rounded-full border border-bg bg-surface-2 text-[11px]">{r.emoji}</span>)}</span>
      {total}
    </button>
  )
}

function useReact() {
  const { c, setC } = useCommunity()
  const [burst, setBurst] = useState<string | null>(null)
  const react = (id: string, k: ReactionKey | null) => {
    setC((s) => {
      const next = { ...s.myReactions }
      if (k) next[id] = k
      else delete next[id]
      return { myReactions: next }
    })
    if (k) {
      setBurst(id)
      setTimeout(() => setBurst(null), 700)
    }
  }
  return { mine: c.myReactions, react, burst }
}

export function PostCard({ post, onOpenComments }: { post: Post; onOpenComments: () => void }) {
  const nav = useNavigate()
  const author = useAuthor()(post.authorId)
  const { c, setC } = useCommunity()
  const { toast } = useApp()
  const { mine, react, burst } = useReact()
  const [picker, setPicker] = useState(false)
  const [menu, setMenu] = useState(false)
  const [who, setWho] = useState(false)
  const [share, setShare] = useState(false)
  const [report, setReport] = useState(false)
  const lounge = LOUNGES.find((l) => l.id === post.loungeId)
  const counts = countWith(post.reactions, mine[post.id])
  const saved = c.saved.includes(post.id)
  const commentCount = post.comments.reduce((a, x) => a + 1 + x.replies.length, 0)
  const myReaction = REACTIONS.find((r) => r.key === mine[post.id])

  return (
    <article className="card relative p-4">
      <header className="flex items-start gap-3">
        <button onClick={() => post.authorId !== 'me' && nav(`/member/${post.authorId}`)} aria-label={`View ${author.name}`}>
          <Avatar tone={author.tone} name={author.name} src={author.src} size={44} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-semibold leading-tight">
            {author.name} <UserTypeBadge type={author.userType} />
          </p>
          <p className="text-xs text-ink-muted">{author.userType} · {author.place} · {post.at}</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenu((v) => !v)} aria-label="Post options" className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-surface-2"><MoreHorizontal size={20} /></button>
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-deep">
                <MenuItem icon={Bookmark} onClick={() => { setMenu(false); setC((s) => ({ saved: saved ? s.saved.filter((x) => x !== post.id) : [...s.saved, post.id] })); toast(saved ? 'Removed from saved' : 'Saved') }}>{saved ? 'Unsave' : 'Save'}</MenuItem>
                <MenuItem icon={EyeOff} onClick={() => { setMenu(false); setC((s) => ({ hidden: [...s.hidden, post.id] })); toast('Post hidden') }}>Hide post</MenuItem>
                {post.authorId === 'me' ? (
                  <MenuItem icon={Trash2} danger onClick={() => { setMenu(false); setC((s) => ({ posts: s.posts.filter((x) => x.id !== post.id) })); toast('Post deleted') }}>Delete</MenuItem>
                ) : (
                  <MenuItem icon={Flag} danger onClick={() => { setMenu(false); setReport(true) }}>Report</MenuItem>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {(post.topic || lounge || post.pendingReview) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {post.pendingReview && <Badge tone="warning"><Clock size={11} /> In review</Badge>}
          {post.type === 'question' && <Badge tone="muted">Question</Badge>}
          {post.topic && <Badge tone="muted">#{post.topic}</Badge>}
          {lounge && <Badge tone="muted"><MapPin size={11} /> {lounge.name}</Badge>}
        </div>
      )}

      <div className="mt-3 space-y-3">
        {post.text && <RichText text={post.text} />}
        {post.smoke && <SmokeReportCard r={post.smoke} />}
        {post.poll && <Poll post={post} />}
        {post.eventId && <EventShare eventId={post.eventId} />}
        <Photos photos={post.photos} />
        {post.video && <VideoCard video={post.video} />}
        {post.music && <MusicCard url={post.music} />}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <ReactionSummary counts={counts} onClick={() => setWho(true)} />
        {commentCount > 0 && <button onClick={onOpenComments} className="text-[13px] text-ink-muted hover:underline">{commentCount} comments</button>}
      </div>

      <div className="relative mt-2 grid grid-cols-4 border-t border-line pt-1.5">
        <div className="relative">
          <AnimatePresence>{picker && <ReactionPicker current={mine[post.id]} onPick={(k) => { react(post.id, k); setPicker(false) }} />}</AnimatePresence>
          <AnimatePresence>
            {burst === post.id && myReaction && (
              <motion.span initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -40, opacity: 0, scale: 1.8 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-6 top-0 text-2xl">{myReaction.emoji}</motion.span>
            )}
          </AnimatePresence>
          <ActionBtn active={!!myReaction} onClick={() => setPicker((v) => !v)}>
            <span className="text-base leading-none">{myReaction?.emoji ?? '🥃'}</span> {myReaction?.label ?? 'React'}
          </ActionBtn>
        </div>
        <ActionBtn onClick={onOpenComments}><MessageCircle size={17} /> Comment</ActionBtn>
        <ActionBtn active={saved} onClick={() => setC((s) => ({ saved: saved ? s.saved.filter((x) => x !== post.id) : [...s.saved, post.id] }))}><Bookmark size={17} className={saved ? 'fill-current' : ''} /> {saved ? 'Saved' : 'Save'}</ActionBtn>
        <ActionBtn onClick={() => setShare(true)}><Share2 size={17} /> Share</ActionBtn>
      </div>

      <WhoReactedSheet open={who} onClose={() => setWho(false)} post={post} counts={counts} />
      <ShareSheet open={share} onClose={() => setShare(false)} postId={post.id} />
      <ReportSheet open={report} onClose={() => setReport(false)} name={`${author.first}'s post`} />
    </article>
  )
}

function MenuItem({ icon: Icon, children, onClick, danger }: { icon: typeof Flag; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex min-h-11 w-full items-center gap-2.5 px-4 text-sm hover:bg-surface-2', danger && 'text-danger')}>
      <Icon size={16} /> {children}
    </button>
  )
}

function ActionBtn({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium transition hover:bg-surface-2', active ? 'text-gold-ink' : 'text-ink-muted')}>
      {children}
    </button>
  )
}

function WhoReactedSheet({ open, onClose, post, counts }: { open: boolean; onClose: () => void; post: Post; counts: Partial<Record<ReactionKey, number>> }) {
  const author = useAuthor()
  return (
    <Sheet open={open} onClose={onClose} title="Reactions">
      <div className="mb-4 flex flex-wrap gap-2">
        {REACTIONS.filter((r) => counts[r.key]).map((r) => (
          <span key={r.key} className="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm">{r.emoji} {r.label} · {counts[r.key]}</span>
        ))}
      </div>
      <ul className="divide-y divide-line pb-4">
        {post.reactors.map((id, i) => {
          const a = author(id)
          return (
            <li key={id} className="flex items-center gap-3 py-2.5">
              <Avatar tone={a.tone} name={a.name} size={40} />
              <span className="flex-1 text-sm font-medium">{a.name}</span>
              <span className="text-lg">{REACTIONS[i % REACTIONS.length].emoji}</span>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}

function ShareSheet({ open, onClose, postId }: { open: boolean; onClose: () => void; postId: string }) {
  const { state, toast } = useApp()
  const nav = useNavigate()
  const link = `${location.origin}/discover?view=feed&post=${postId}`
  return (
    <Sheet open={open} onClose={onClose} title="Share post">
      <Button block variant="secondary" icon={Copy} onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); toast('Link copied'); onClose() }}>Copy link</Button>
      <p className="micro-label mb-2 mt-5">Send to a match</p>
      <ul className="divide-y divide-line pb-4">
        {state.matched.slice(0, 6).map((id) => {
          const m = MEMBERS.find((x) => x.id === id)
          if (!m) return null
          return (
            <li key={id} className="flex items-center gap-3 py-2">
              <Avatar tone={m.tone} name={m.firstName} size={40} />
              <span className="flex-1 text-sm font-medium">{m.firstName} {m.lastName}</span>
              <Button size="sm" icon={Send} onClick={() => { toast(`Sent to ${m.firstName}`); onClose(); nav(`/messages/${m.id}`) }}>Send</Button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}

/* ---------------- Comments ---------------- */
export function CommentsSheet({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { c, setC } = useCommunity()
  const { toast } = useApp()
  const author = useAuthor()
  const { mine, react } = useReact()
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [sort, setSort] = useState<'top' | 'newest'>('top')
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const live = post ? c.posts.find((p) => p.id === post.id) ?? post : null

  const mention = text.match(/@([A-Za-z]*)$/)
  const mentionOptions = useMemo(
    () => (mention ? MEMBERS.filter((m) => m.firstName.toLowerCase().startsWith(mention[1].toLowerCase())).slice(0, 4) : []),
    [mention],
  )

  if (!live) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>

  const score = (x: Comment) => Object.values(countWith(x.reactions, mine[x.id])).reduce((a, b) => a + (b ?? 0), 0)
  const comments = sort === 'top' ? [...live.comments].sort((a, b) => score(b) - score(a)) : [...live.comments].reverse()

  const updateComments = (fn: (cs: Comment[]) => Comment[]) =>
    setC((s) => ({ posts: s.posts.map((p) => (p.id === live.id ? { ...p, comments: fn(p.comments) } : p)) }))

  const submit = () => {
    const t = text.trim()
    if (!t) return
    const blocked = checkContent(t)
    if (blocked) return toast(blocked)
    if (editing) {
      updateComments((cs) => cs.map((x) => (x.id === editing ? { ...x, text: t } : { ...x, replies: x.replies.map((r) => (r.id === editing ? { ...r, text: t } : r)) })))
      setEditing(null)
    } else {
      const nc: Comment = { id: `c${Date.now()}`, authorId: 'me', text: t, at: 'now', reactions: {}, replies: [] }
      if (replyTo) updateComments((cs) => cs.map((x) => (x.id === replyTo.id ? { ...x, replies: [...x.replies, nc] } : x)))
      else updateComments((cs) => [...cs, nc])
      if (/@\w+/.test(t)) toast('Mentioned members will be notified')
    }
    setText('')
    setReplyTo(null)
  }

  const remove = (id: string) => updateComments((cs) => cs.filter((x) => x.id !== id).map((x) => ({ ...x, replies: x.replies.filter((r) => r.id !== id) })))

  const renderComment = (x: Comment, isReply = false) => {
    const a = author(x.authorId)
    const counts = countWith(x.reactions, mine[x.id])
    const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0)
    const my = REACTIONS.find((r) => r.key === mine[x.id])
    return (
      <div key={x.id} className={cn('flex gap-2.5', isReply && 'ml-11 mt-2')}>
        <Avatar tone={a.tone} name={a.name} src={a.src} size={isReply ? 30 : 36} />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl rounded-tl-md bg-surface-2 px-3 py-2">
            <p className="text-[13px] font-semibold">{a.name} <span className="font-normal text-ink-muted">· {a.userType}</span></p>
            <RichText text={x.text} className="text-sm" />
          </div>
          <div className="relative mt-1 flex items-center gap-3 px-1 text-xs text-ink-muted">
            <span>{x.at}</span>
            <AnimatePresence>{pickerFor === x.id && <ReactionPicker current={mine[x.id]} onPick={(k) => { react(x.id, k); setPickerFor(null) }} />}</AnimatePresence>
            <button className={cn('min-h-8 font-semibold', my && 'text-gold-ink')} onClick={() => setPickerFor(pickerFor === x.id ? null : x.id)}>{my ? `${my.emoji} ${my.label}` : 'React'}</button>
            {!isReply && <button className="flex min-h-8 items-center gap-1 font-semibold" onClick={() => { setReplyTo(x); setText(`@${a.first} `) }}><Reply size={12} /> Reply</button>}
            {x.authorId === 'me' ? (
              <>
                <button className="min-h-8" onClick={() => { setEditing(x.id); setText(x.text) }} aria-label="Edit comment"><Pencil size={12} /></button>
                <button className="min-h-8 text-danger" onClick={() => remove(x.id)} aria-label="Delete comment"><Trash2 size={12} /></button>
              </>
            ) : (
              <button className="min-h-8" onClick={() => setReport(a.first)} aria-label="Report comment"><Flag size={12} /></button>
            )}
            {total > 0 && <span className="ml-auto">{REACTIONS.filter((r) => counts[r.key]).slice(0, 2).map((r) => r.emoji).join('')} {total}</span>}
          </div>
          {x.replies.map((r) => renderComment(r, true))}
        </div>
      </div>
    )
  }

  return (
    <Sheet
      open={!!post}
      onClose={onClose}
      title="Comments"
      footer={
        <div>
          {mentionOptions.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto">
              {mentionOptions.map((m) => (
                <Chip key={m.id} onClick={() => setText(text.replace(/@([A-Za-z]*)$/, `@${m.firstName} `))}>@{m.firstName}</Chip>
              ))}
            </div>
          )}
          {(replyTo || editing) && (
            <p className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
              {editing ? 'Editing comment' : `Replying to ${author(replyTo!.authorId).first}`}
              <button className="font-semibold" onClick={() => { setReplyTo(null); setEditing(null); setText('') }}>Cancel</button>
            </p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex items-end gap-2">
            <textarea value={text} maxLength={LIMITS.commentChars} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Add a comment… use @ to mention" aria-label="Comment" className="max-h-28 min-h-11 flex-1 resize-none rounded-[22px] border border-line bg-surface-solid px-4 py-2.5 text-sm outline-none focus:border-gold" />
            <button type="submit" disabled={!text.trim()} aria-label="Post comment" className="grid size-11 shrink-0 place-items-center rounded-full btn-gold disabled:opacity-40"><Send size={18} /></button>
          </form>
          <p className="mt-1 text-right text-[11px] text-ink-muted">{text.length}/{LIMITS.commentChars}</p>
        </div>
      }
    >
      <div className="mb-3 flex gap-2">
        <Chip selected={sort === 'top'} onClick={() => setSort('top')}>Top</Chip>
        <Chip selected={sort === 'newest'} onClick={() => setSort('newest')}>Newest</Chip>
      </div>
      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">No comments yet. Start the conversation.</p>
      ) : (
        <div className="space-y-4 pb-2">{comments.map((x) => renderComment(x))}</div>
      )}
      <ReportSheet open={!!report} onClose={() => setReport(null)} name={`${report}'s comment`} />
    </Sheet>
  )
}

