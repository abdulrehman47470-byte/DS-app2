import { useQuery } from '@tanstack/react-query'
import { BookOpen, Play, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BandDivider } from '@/components/brand'
import { Chip, EmptyState, ErrorState, Skeleton, TopBar } from '@/components/ui'
import { getBlogPosts, getSessions } from '@/lib/api'
import { cn } from '@/lib/cn'

/** Moody still-life thumbnail drawn in CSS/SVG (no stock photos). */
export function Still({ tone, className, variant = 0 }: { tone: number; className?: string; variant?: number }) {
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: `radial-gradient(ellipse at 70% 20%, hsl(${tone + 10} 75% 55% / .55), transparent 55%), linear-gradient(160deg, hsl(${tone} 40% 26%), hsl(${tone} 35% 9%))` }}>
      <svg viewBox="0 0 200 120" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <ellipse cx="100" cy="112" rx="110" ry="12" fill="#000" opacity=".35" />
        {variant % 3 === 0 && (
          <g>
            <rect x="24" y="84" width="120" height="12" rx="6" fill={`hsl(${tone} 45% 30%)`} transform="rotate(-8 84 90)" />
            <rect x="100" y="80" width="16" height="12" fill="#c9973a" transform="rotate(-8 84 90)" />
            <path d="M150 110V60h30l-4 50z" fill={`hsl(${tone + 10} 70% 45%)`} opacity=".75" />
          </g>
        )}
        {variant % 3 === 1 && (
          <g>
            <rect x="30" y="58" width="140" height="44" rx="4" fill={`hsl(${tone} 40% 22%)`} stroke="#c9973a" strokeOpacity=".6" />
            <rect x="30" y="52" width="140" height="10" rx="3" fill={`hsl(${tone} 38% 30%)`} />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={40 + i * 21} y="66" width="16" height="30" rx="7" fill={`hsl(${tone} 45% ${28 + (i % 2) * 5}%)`} />)}
          </g>
        )}
        {variant % 3 === 2 && (
          <g>
            <path d="M60 110V50h40l-6 60z" fill={`hsl(${tone + 12} 70% 45%)`} opacity=".8" />
            <rect x="100" y="90" width="80" height="10" rx="5" fill={`hsl(${tone} 45% 30%)`} transform="rotate(10 140 95)" />
            <path d="M104 88c-8-18 10-24 0-42" stroke="#fff" strokeOpacity=".2" strokeWidth="4" fill="none" />
          </g>
        )}
      </svg>
    </div>
  )
}

const SESSION_CATS = ['All', 'Basics', 'Tasting', 'Pairing', 'Humidor']

export function Sessions() {
  const q = useQuery({ queryKey: ['sessions'], queryFn: getSessions })
  const [cat, setCat] = useState('All')
  const list = (q.data ?? []).filter((s) => cat === 'All' || s.category === cat)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Stogie Sessions" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {SESSION_CATS.map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
      </div>
      {q.isLoading ? (
        <div className="grid grid-cols-2 gap-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-[20px]" />)}</div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No sessions yet" body="New videos are on the way." />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {list.map((s, i) => (
            <Link key={s.id} to={`/settings/sessions/${s.id}`} className="group overflow-hidden rounded-[20px] border border-line bg-surface shadow-soft">
              <div className="relative aspect-[4/3]">
                <Still tone={s.tone} variant={i} className="absolute inset-0" />
                <div className="photo-fade absolute inset-0" />
                <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:scale-110">
                  <Play size={18} className="ml-0.5 fill-white" />
                </span>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">{s.duration}</span>
              </div>
              <p className="p-3 font-serif text-[15px] leading-tight">{s.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function SessionDetail() {
  const { id } = useParams()
  const q = useQuery({ queryKey: ['sessions'], queryFn: getSessions })
  const s = q.data?.find((x) => x.id === id)
  const [playing, setPlaying] = useState(false)
  if (q.isLoading) return <div className="p-4"><Skeleton className="aspect-video" /></div>
  if (!s) return <ErrorState onRetry={() => q.refetch()} />
  const related = q.data!.filter((x) => x.id !== s.id).slice(0, 3)
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back="/settings/sessions" title={s.title} />
      <div className="relative mx-4 aspect-video overflow-hidden rounded-[20px] border border-line">
        {playing ? (
          // TODO(phase 7): <iframe src={`https://player.vimeo.com/video/${s.vimeoId}?dnt=1`} />
          <div className="grid size-full place-items-center bg-black text-center text-sm text-white/70">Vimeo player placeholder<br />(video ID {s.vimeoId})</div>
        ) : (
          <button onClick={() => setPlaying(true)} className="absolute inset-0" aria-label={`Play ${s.title}`}>
            <Still tone={s.tone} className="absolute inset-0" />
            <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white backdrop-blur">
              <Play size={26} className="ml-1 fill-white" />
            </span>
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white">{s.duration}</span>
          </button>
        )}
      </div>
      <div className="px-5 pt-5">
        <h1 className="font-serif text-2xl">{s.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{s.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{s.tags.map((t) => <Chip key={t} size="sm">{t}</Chip>)}</div>
        <BandDivider label="Related" />
        <ul className="space-y-3">
          {related.map((r, i) => (
            <li key={r.id}>
              <Link to={`/settings/sessions/${r.id}`} onClick={() => setPlaying(false)} className="flex items-center gap-3">
                <Still tone={r.tone} variant={i + 1} className="h-14 w-20 shrink-0 rounded-xl" />
                <span className="flex-1 text-sm font-medium">{r.title}</span>
                <span className="text-xs text-ink-muted">{r.duration}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const BLOG_CATS = ['All', 'Tips', 'Humidor', 'Brands', 'Lifestyle']

export function Blog() {
  const q = useQuery({ queryKey: ['blog'], queryFn: getBlogPosts })
  const [cat, setCat] = useState('All')
  const list = (q.data ?? []).filter((p) => cat === 'All' || p.category === cat)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Stogie Blog" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {BLOG_CATS.map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
      </div>
      {q.isLoading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles yet" body="Check back for new stories." />
      ) : (
        <ul className="space-y-3 p-4">
          {list.map((p, i) => (
            <li key={p.slug}>
              <Link to={`/settings/blog/${p.slug}`} className="card flex gap-3 p-3 transition hover:bg-surface-2">
                <Still tone={p.tone} variant={i} className="h-20 w-24 shrink-0 rounded-[14px]" />
                <div className="min-w-0 py-0.5">
                  <p className="micro-label !text-[10px]">{p.category}</p>
                  <h2 className="font-serif text-[17px] leading-tight">{p.title}</h2>
                  <p className="mt-1 text-xs text-ink-muted">{p.date}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const q = useQuery({ queryKey: ['blog'], queryFn: getBlogPosts })
  const p = q.data?.find((x) => x.slug === slug)
  if (q.isLoading) return <div className="p-4"><Skeleton className="h-48" /></div>
  if (!p) return <ErrorState onRetry={() => q.refetch()} />
  return (
    <article className="flex flex-1 flex-col pb-10">
      <TopBar back="/settings/blog" title={p.title} />
      <Still tone={p.tone} className="mx-4 h-48 rounded-[20px]" />
      <div className="px-5 pt-5">
        <p className="text-xs text-ink-muted">{p.date} · {p.category}</p>
        <h1 className="mt-1 font-serif text-[30px] leading-tight">{p.title}</h1>
        <div className="mt-4 space-y-4 text-[16px] leading-relaxed">
          {p.body.map((para, i) => (
            <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-none first-letter:text-gold-deep' : ''}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
