import { Bold, BookOpen, Clock, Eye, Flag, Heading2, ImagePlus, List, MessageCircle, PenLine, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, UserTypeBadge } from '@/components/brand'
import { Badge, Button, Chip, EmptyState, Field, Input, Segmented, Select, Skeleton, Textarea, TopBar } from '@/components/ui'
import { EngagementBar, ItemThread, ThreadPreview, threadCount, useAuthor } from '@/features/community/PostCard'
import { checkContent } from '@/features/community/moderation'
import { pointsFor } from '@/features/community/points'
import { useCommunity } from '@/features/community/store'
import { BLOG_CATEGORIES, REACTIONS, type Article } from '@/features/community/types'
import { ReportSheet } from '@/features/safety'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import { Still } from './Content'
import { Markdown } from './Legal'

function Cover({ a, className }: { a: Article; className?: string }) {
  return a.cover.src ? (
    <img src={a.cover.src} alt="" className={cn('object-cover', className)} />
  ) : (
    <Still tone={a.cover.tone ?? 30} variant={a.id.length} className={className} />
  )
}

const totalReactions = (a: Article) => Object.values(a.reactions).reduce((n, x) => n + (x ?? 0), 0)

function Byline({ a, size = 28 }: { a: Article; size?: number }) {
  const author = useAuthor()(a.authorId)
  return (
    <span className="flex items-center gap-2">
      <Avatar tone={author.tone} name={author.name} src={author.src} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-ink">{author.name}</span>
        <span className="block text-[11px] text-ink-muted">{a.at} · {a.readMins} min read</span>
      </span>
    </span>
  )
}

export function Blog() {
  const { c } = useCommunity()
  const [tab, setTab] = useState<'latest' | 'editorial' | 'members' | 'saved'>('latest')
  const [cat, setCat] = useState('All')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])

  const list = useMemo(
    () =>
      c.articles
        .filter((a) => !a.pendingReview || a.authorId === 'me')
        .filter((a) => tab === 'latest' || (tab === 'editorial' ? a.authorId === 'staff' : tab === 'members' ? a.authorId !== 'staff' : c.saved.includes(a.id)))
        .filter((a) => cat === 'All' || a.category === cat),
    [c.articles, c.saved, tab, cat],
  )
  const [featured, ...rest] = list
  const writers = [...new Set(c.articles.filter((a) => a.authorId !== 'staff').map((a) => a.authorId))]

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back="/settings" title="Stogie Blog" right={<Link to="/settings/blog/write"><Button size="sm" icon={PenLine}>Write</Button></Link>} />
      <div className="space-y-3 px-4">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'latest', label: 'Latest' }, { value: 'editorial', label: 'Editorial' }, { value: 'members', label: 'Members' }, { value: 'saved', label: 'Saved' }]} />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {['All', ...BLOG_CATEGORIES].map((x) => <Chip key={x} selected={cat === x} onClick={() => setCat(x)}>{x}</Chip>)}
        </div>
      </div>

      {tab === 'latest' && cat === 'All' && writers.length > 0 && (
        <WritersStrip ids={writers} />
      )}

      {loading ? (
        <div className="space-y-3 p-4"><Skeleton className="h-64" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={tab === 'saved' ? 'No saved articles' : 'No articles yet'}
          body={tab === 'saved' ? 'Tap Save on any article to read it later.' : 'Share what you know. Members love real stories.'}
          action={<Link to="/settings/blog/write"><Button icon={PenLine}>Write an article</Button></Link>}
        />
      ) : (
        <div className="space-y-3 p-4">
          {featured && (
            <Link to={`/settings/blog/${featured.slug}`} className="card block overflow-hidden transition hover:border-gold">
              <div className="relative h-52">
                <Cover a={featured} className="absolute inset-0 size-full" />
                <div className="photo-fade absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">{featured.category}</span>
                  <h2 className="mt-2 font-serif text-[24px] leading-tight drop-shadow">{featured.title}</h2>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <Byline a={featured} />
                <Stats a={featured} />
              </div>
            </Link>
          )}
          {rest.map((a) => (
            <Link key={a.id} to={`/settings/blog/${a.slug}`} className="card flex gap-3 p-3 transition hover:border-gold">
              <Cover a={a} className="h-24 w-24 shrink-0 rounded-[14px]" />
              <div className="flex min-w-0 flex-1 flex-col py-0.5">
                <p className="flex items-center gap-1.5">
                  <span className="micro-label !text-[10px]">{a.category}</span>
                  {a.authorId === 'staff' && <Badge tone="gold" className="!py-0 !text-[9px]">Editorial</Badge>}
                  {a.pendingReview && <Badge tone="warning" className="!py-0 !text-[9px]">In review</Badge>}
                </p>
                <h2 className="line-clamp-2 font-serif text-[17px] leading-tight">{a.title}</h2>
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <Byline a={a} size={22} />
                  <Stats a={a} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Stats({ a }: { a: Article }) {
  const { c } = useCommunity()
  const top = REACTIONS.filter((r) => a.reactions[r.key]).slice(0, 2)
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs text-ink-muted">
      {totalReactions(a) > 0 && <span>{top.map((r) => r.emoji).join('')} {totalReactions(a)}</span>}
      <span className="flex items-center gap-0.5"><MessageCircle size={12} /> {threadCount(c.threads[a.id])}</span>
    </span>
  )
}

function WritersStrip({ ids }: { ids: string[] }) {
  const { state } = useApp()
  const { c } = useCommunity()
  const author = useAuthor()
  return (
    <section className="mt-4">
      <h2 className="micro-label mb-2 px-5">Member writers</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4">
        {ids.map((id) => {
          const a = author(id)
          return (
            <Link key={id} to={id === 'me' ? '/profile' : `/member/${id}`} className="flex w-[72px] shrink-0 flex-col items-center gap-1 text-center">
              <Avatar tone={a.tone} name={a.name} src={a.src} size={56} ring />
              <span className="w-full truncate text-xs font-medium">{a.first}</span>
              <span className="text-[10px] text-gold-ink">{pointsFor(c, id, state).level.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { toast } = useApp()
  const { c, setC } = useCommunity()
  const author = useAuthor()
  const [thread, setThread] = useState(false)
  const [report, setReport] = useState(false)
  const a = c.articles.find((x) => x.slug === slug)
  if (!a) return <EmptyState icon={BookOpen} title="Article not found" action={<Link to="/settings/blog"><Button>Back to Blog</Button></Link>} />
  const who = author(a.authorId)
  const more = c.articles.filter((x) => x.id !== a.id && !x.pendingReview && (x.authorId === a.authorId || x.category === a.category)).slice(0, 3)
  return (
    <article className="flex flex-1 flex-col pb-10">
      <TopBar back="/settings/blog" title={a.category} right={
        a.authorId === 'me' ? (
          <div className="flex">
            <Link to={`/settings/blog/edit/${a.id}`} aria-label="Edit article" className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><Pencil size={19} /></Link>
            <button aria-label="Delete article" onClick={() => { setC((s) => ({ articles: s.articles.filter((x) => x.id !== a.id) })); toast('Article deleted'); nav('/settings/blog') }} className="grid size-11 place-items-center rounded-full text-danger hover:bg-danger/10"><Trash2 size={19} /></button>
          </div>
        ) : a.authorId !== 'staff' ? (
          <button aria-label="Report article" onClick={() => setReport(true)} className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><Flag size={18} /></button>
        ) : null
      } />
      <Cover a={a} className="mx-4 h-52 rounded-[20px]" />
      <div className="px-5 pt-5">
        {a.pendingReview && <Badge tone="warning" className="mb-2"><Clock size={11} /> In review: only you can see this until an editor approves it</Badge>}
        <h1 className="font-serif text-[30px] leading-tight">{a.title}</h1>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
          <Link to={a.authorId === 'me' ? '/profile' : a.authorId === 'staff' ? '#' : `/member/${a.authorId}`}>
            <Avatar tone={who.tone} name={who.name} src={who.src} size={46} ring />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5 font-semibold">{who.name} {a.authorId !== 'staff' && <UserTypeBadge type={who.userType} />}</p>
            <p className="text-xs text-ink-muted">{a.at} · {a.readMins} min read</p>
          </div>
        </div>
        <div className="prose-legal mt-5 [&_p]:!text-[16px] [&_p]:!leading-relaxed">
          <Markdown source={a.body} />
        </div>
        <div className="mt-6"><EngagementBar itemId={a.id} reactions={a.reactions} reactors={a.reactors} shareLink={`${location.origin}/settings/blog/${a.slug}`} onComments={() => setThread(true)} /></div>
        <ThreadPreview itemId={a.id} onOpen={() => setThread(true)} />
        {more.length > 0 && (
          <section className="mt-8">
            <h2 className="micro-label mb-2">More to read</h2>
            <div className="space-y-2">
              {more.map((m) => (
                <Link key={m.id} to={`/settings/blog/${m.slug}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-surface-2">
                  <Cover a={m} className="h-14 w-16 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1"><span className="line-clamp-2 font-serif text-[15px] leading-tight">{m.title}</span><span className="text-xs text-ink-muted">{author(m.authorId).name}</span></span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <ItemThread itemId={a.id} open={thread} onClose={() => setThread(false)} />
      <ReportSheet open={report} onClose={() => setReport(false)} name={`${who.first}'s article`} />
    </article>
  )
}

function coverFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, 1400 / img.width)
      const cv = document.createElement('canvas')
      cv.width = img.width * s
      cv.height = img.height * s
      cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
      resolve(cv.toDataURL('image/jpeg', 0.82))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function BlogEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { toast } = useApp()
  const { c, setC } = useCommunity()
  const existing = c.articles.find((a) => a.id === id && a.authorId === 'me')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState(existing?.category ?? 'Tips')
  const [body, setBody] = useState(existing?.body ?? '')
  const [cover, setCover] = useState<Article['cover']>(existing?.cover ?? { tone: 26 })
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const words = body.trim() ? body.trim().split(/\s+/).length : 0

  const insert = (before: string, after = '', placeholder = 'text') => {
    const el = areaRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = body.slice(s, e) || placeholder
    const next = body.slice(0, s) + before + sel + after + body.slice(e)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + sel.length)
    })
  }

  const onCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !f.type.startsWith('image/')) return
    setCover({ src: await coverFromFile(f) })
  }

  const publish = () => {
    if (title.trim().length < 8) return setError('Give your article a title (at least 8 characters).')
    if (words < 40) return setError('Articles need at least 40 words.')
    const blocked = checkContent(`${title} ${body}`)
    if (blocked) return setError(blocked)
    const slug = existing?.slug ?? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}-${Date.now().toString(36)}`
    const article: Article = {
      id: existing?.id ?? `a${Date.now()}`,
      slug,
      authorId: 'me',
      title: title.trim(),
      cover,
      category,
      body: body.trim(),
      at: existing?.at ?? new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      readMins: Math.max(1, Math.round(words / 200)),
      pendingReview: true,
      reactions: existing?.reactions ?? {},
      reactors: existing?.reactors ?? [],
    }
    setC((s) => ({ articles: existing ? s.articles.map((x) => (x.id === existing.id ? article : x)) : [article, ...s.articles] }))
    toast('Submitted! An editor will review it shortly.')
    nav(`/settings/blog/${slug}`)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back="/settings/blog" title={existing ? 'Edit article' : 'Write an article'} right={
        <button onClick={() => setPreview((v) => !v)} aria-pressed={preview} className={cn('inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold', preview ? 'bg-gold/15 text-gold-ink' : 'text-ink-muted hover:bg-surface-2')}>
          <Eye size={16} /> Preview
        </button>
      } />
      <div className="space-y-4 px-4">
        <button type="button" onClick={() => fileRef.current?.click()} className="group relative block h-44 w-full overflow-hidden rounded-[20px] border border-line" aria-label="Change cover image">
          {cover.src ? <img src={cover.src} alt="" className="size-full object-cover" /> : <Still tone={cover.tone ?? 26} className="size-full" />}
          <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-90 transition group-hover:bg-black/40">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur"><ImagePlus size={16} /> {cover.src ? 'Change cover' : 'Add cover photo'}</span>
          </span>
        </button>
        {!cover.src && (
          <div className="flex gap-2">
            {[12, 22, 30, 38, 44].map((t) => (
              <button key={t} onClick={() => setCover({ tone: t })} aria-label={`Cover style ${t}`} className={cn('h-10 flex-1 overflow-hidden rounded-xl border-2', cover.tone === t ? 'border-gold' : 'border-transparent')}>
                <Still tone={t} className="size-full" />
              </button>
            ))}
          </div>
        )}

        {preview ? (
          <div className="card p-5">
            <p className="micro-label">{category}</p>
            <h1 className="mt-1 font-serif text-[28px] leading-tight">{title || 'Untitled'}</h1>
            <div className="prose-legal mt-4"><Markdown source={body || '_Nothing written yet._'} /></div>
          </div>
        ) : (
          <>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Title" aria-label="Title" className="min-h-14 border-0 bg-transparent px-1 font-serif text-[26px] focus:ring-0" />
            <Field label="Category" htmlFor="cat">
              <Select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {BLOG_CATEGORIES.map((x) => <option key={x}>{x}</option>)}
              </Select>
            </Field>
            <div>
              <div className="mb-1.5 flex gap-1 rounded-[14px] border border-line bg-surface-2 p-1">
                <button type="button" onClick={() => insert('\n\n## ', '\n\n', 'Heading')} aria-label="Heading" className="grid size-9 place-items-center rounded-lg hover:bg-surface"><Heading2 size={17} /></button>
                <button type="button" onClick={() => insert('**', '**')} aria-label="Bold" className="grid size-9 place-items-center rounded-lg hover:bg-surface"><Bold size={17} /></button>
                <button type="button" onClick={() => insert('\n\n- ', '', 'List item')} aria-label="Bullet list" className="grid size-9 place-items-center rounded-lg hover:bg-surface"><List size={17} /></button>
                <span className="ml-auto self-center pr-2 text-xs text-ink-muted">{words} words · {Math.max(1, Math.round(words / 200))} min</span>
              </div>
              <Textarea ref={areaRef} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Article body" placeholder="Tell your story. Use the toolbar for headings, bold and lists." className="min-h-[320px] font-[inherit] text-[16px]" />
            </div>
          </>
        )}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <Button size="lg" block onClick={publish}>{existing ? 'Resubmit for review' : 'Submit for review'}</Button>
        <p className="text-center text-xs text-ink-muted">Articles are reviewed by an editor before other members see them. No selling or advertising tobacco.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onCover} />
    </div>
  )
}
