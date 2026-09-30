import { useQuery } from '@tanstack/react-query'
import { Clock, Flag, Link2, Play, PlayCircle, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, BandDivider, UserTypeBadge } from '@/components/brand'
import { Badge, Button, Chip, EmptyState, ErrorState, Field, Input, Segmented, Select, Sheet, Skeleton, Textarea, TopBar } from '@/components/ui'
import { isAllowedVideo, VideoCard } from '@/features/community/embeds'
import { checkContent } from '@/features/community/moderation'
import { EngagementBar, ItemThread, ThreadPreview, useAuthor } from '@/features/community/PostCard'
import { useCommunity } from '@/features/community/store'
import type { MemberVideo } from '@/features/community/types'
import { ReportSheet } from '@/features/safety'
import { getSessions } from '@/lib/api'
import { useApp } from '@/lib/store'
import { deleteMedia, saveMedia } from '@/lib/media'
import { UploadedVideo } from '@/components/Media'
import { Still } from './Content'

const CATS = ['All', 'Basics', 'Tasting', 'Pairing', 'Humidor', 'Lounges', 'Reviews']
const OFFICIAL_REACTIONS = { cheers: 18, wellSaid: 7 }

interface Item {
  id: string
  title: string
  category: string
  tone: number
  duration?: string
  authorId: string // 'staff' for official sessions
  pending?: boolean
}

export function Sessions() {
  const q = useQuery({ queryKey: ['sessions'], queryFn: getSessions })
  const { c } = useCommunity()
  const author = useAuthor()
  const [cat, setCat] = useState('All')
  const [src, setSrc] = useState<'all' | 'official' | 'members'>('all')
  const [submit, setSubmit] = useState(false)

  const items: Item[] = [
    ...c.videos.filter((v) => !v.pendingReview || v.authorId === 'me').map((v) => ({ id: v.id, title: v.title, category: v.category, tone: v.tone, authorId: v.authorId, pending: v.pendingReview })),
    ...(q.data ?? []).map((s) => ({ id: s.id, title: s.title, category: s.category, tone: s.tone, duration: s.duration, authorId: 'staff' })),
  ].filter((x) => (cat === 'All' || x.category === cat) && (src === 'all' || (src === 'official') === (x.authorId === 'staff')))

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back="/settings" title="Stogie Sessions" right={<Button size="sm" icon={Plus} onClick={() => setSubmit(true)}>Share</Button>} />
      <div className="space-y-3 px-4">
        <Segmented value={src} onChange={setSrc} options={[{ value: 'all', label: 'All' }, { value: 'official', label: 'Official' }, { value: 'members', label: 'Members' }]} />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {CATS.map((x) => <Chip key={x} selected={cat === x} onClick={() => setCat(x)}>{x}</Chip>)}
        </div>
      </div>
      {q.isLoading ? (
        <div className="grid grid-cols-2 gap-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-[20px]" />)}</div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No sessions here yet" body="Share a tip, a tasting or a lounge tour." action={<Button icon={Plus} onClick={() => setSubmit(true)}>Share a video</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {items.map((s, i) => {
            const a = author(s.authorId)
            return (
              <Link key={s.id} to={`/settings/sessions/${s.id}`} className="group overflow-hidden rounded-[20px] border border-line bg-surface shadow-soft">
                <div className="relative aspect-[4/3]">
                  <Still tone={s.tone} variant={i} className="absolute inset-0" />
                  <div className="photo-fade absolute inset-0" />
                  <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:scale-110"><Play size={18} className="ml-0.5 fill-white" /></span>
                  {s.duration && <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">{s.duration}</span>}
                  {s.authorId === 'staff' ? (
                    <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">Official</span>
                  ) : s.pending ? (
                    <span className="absolute left-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-white">In review</span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 font-serif text-[15px] leading-tight">{s.title}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Avatar tone={a.tone} name={a.name} src={a.src} size={16} /> <span className="truncate">{a.name}</span>
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
      <SubmitVideoSheet open={submit} onClose={() => setSubmit(false)} />
    </div>
  )
}

export function SessionDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { toast } = useApp()
  const q = useQuery({ queryKey: ['sessions'], queryFn: getSessions })
  const { c, setC } = useCommunity()
  const author = useAuthor()
  const [playing, setPlaying] = useState(false)
  const [thread, setThread] = useState(false)
  const [report, setReport] = useState(false)
  const official = q.data?.find((x) => x.id === id)
  const member = c.videos.find((x) => x.id === id)
  if (q.isLoading && !member) return <div className="p-4"><Skeleton className="aspect-video" /></div>
  if (!official && !member) return <ErrorState onRetry={() => q.refetch()} />

  const v = member ?? official!
  const who = author(member ? member.authorId : 'staff')
  const related = [...c.videos.filter((x) => !x.pendingReview), ...(q.data ?? [])].filter((x) => x.id !== id).slice(0, 4)

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar back="/settings/sessions" title={v.title} right={
        member?.authorId === 'me' ? (
          <button aria-label="Delete video" onClick={() => { if (member?.video.kind === 'upload') deleteMedia(member.video.url); setC((s) => ({ videos: s.videos.filter((x) => x.id !== id) })); toast('Video deleted'); nav('/settings/sessions') }} className="grid size-11 place-items-center rounded-full text-danger hover:bg-danger/10"><Trash2 size={19} /></button>
        ) : member ? (
          <button aria-label="Report video" onClick={() => setReport(true)} className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><Flag size={18} /></button>
        ) : null
      } />
      <div className="px-4">
        {member ? (
          <VideoCard video={member.video} />
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-[20px] border border-line">
            {playing ? (
              // TODO(phase 7): <iframe src={`https://player.vimeo.com/video/${official.vimeoId}?dnt=1`} />
              <div className="grid size-full place-items-center bg-black text-center text-sm text-white/70">Vimeo player placeholder<br />(video ID {official!.vimeoId})</div>
            ) : (
              <button onClick={() => setPlaying(true)} className="absolute inset-0" aria-label={`Play ${v.title}`}>
                <Still tone={v.tone} className="absolute inset-0" />
                <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white backdrop-blur"><Play size={26} className="ml-1 fill-white" /></span>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white">{official!.duration}</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="px-5 pt-5">
        {member?.pendingReview && <Badge tone="warning" className="mb-2"><Clock size={11} /> In review</Badge>}
        <h1 className="font-serif text-2xl leading-tight">{v.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          <Link to={member && member.authorId !== 'me' ? `/member/${member.authorId}` : member ? '/profile' : '#'}>
            <Avatar tone={who.tone} name={who.name} src={who.src} size={40} />
          </Link>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold">{who.name} {member && <UserTypeBadge type={who.userType} />}</p>
            <p className="text-xs text-ink-muted">{member ? `Shared ${member.at} ago` : 'Official Stogie Session'} · {v.category}</p>
          </div>
        </div>
        <p className="mt-3 text-[15px] text-ink-muted">{v.description}</p>
        {official && <div className="mt-3 flex flex-wrap gap-1.5">{official.tags.map((t) => <Chip key={t} size="sm">{t}</Chip>)}</div>}
        <div className="mt-5">
          <EngagementBar itemId={v.id} reactions={member?.reactions ?? OFFICIAL_REACTIONS} reactors={member?.reactors ?? ['m1', 'm3', 'm8']} shareLink={`${location.origin}/settings/sessions/${v.id}`} onComments={() => setThread(true)} />
        </div>
        <ThreadPreview itemId={v.id} onOpen={() => setThread(true)} />
        <BandDivider label="Up next" />
        <ul className="space-y-3">
          {related.map((r, i) => (
            <li key={r.id}>
              <Link to={`/settings/sessions/${r.id}`} onClick={() => setPlaying(false)} className="flex items-center gap-3">
                <Still tone={r.tone} variant={i + 1} className="h-14 w-20 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{r.title}</span><span className="text-xs text-ink-muted">{'authorId' in r ? author(r.authorId).name : 'Official'}</span></span>
                {'duration' in r && <span className="text-xs text-ink-muted">{r.duration}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ItemThread itemId={v.id} open={thread} onClose={() => setThread(false)} />
      <ReportSheet open={report} onClose={() => setReport(false)} name={`${who.first}'s video`} />
    </div>
  )
}

function SubmitVideoSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate()
  const { toast } = useApp()
  const { setC } = useCommunity()
  const [mode, setMode] = useState<'link' | 'upload'>('link')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('Basics')
  const [error, setError] = useState<string>()
  const ref = useRef<HTMLInputElement>(null)

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(f.type)) return setError('Videos must be MP4, MOV or WebM.')
    if (f.size > 50 * 1024 * 1024) return setError('Uploads must be under 50 MB. For longer videos, share a YouTube or Vimeo link.')
    setError(undefined)
    setUrl(await saveMedia(f))
  }

  const submit = () => {
    if (title.trim().length < 5) return setError('Add a title.')
    if (!url) return setError(mode === 'link' ? 'Paste a YouTube or Vimeo link.' : 'Choose a video file.')
    if (mode === 'link' && !isAllowedVideo(url)) return setError('Only YouTube and Vimeo links are supported.')
    const blocked = checkContent(`${title} ${desc}`)
    if (blocked) return setError(blocked)
    const v: MemberVideo = {
      id: `v${Date.now()}`,
      authorId: 'me',
      title: title.trim(),
      description: desc.trim(),
      category,
      video: { kind: mode, url },
      tone: 18 + Math.floor(Math.random() * 26),
      at: 'now',
      // Published instantly (client request); reports and the content filter still apply.
      pendingReview: false,
      reactions: {},
      reactors: [],
    }
    setC((s) => ({ videos: [v, ...s.videos] }))
    toast('Video published')
    setTitle(''); setDesc(''); setUrl('')
    onClose()
    nav(`/settings/sessions/${v.id}`)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Share a Stogie Session" footer={<><p className="mb-2 text-sm text-danger" role="alert">{error}</p><Button block size="lg" onClick={submit}>Publish video</Button></>}>
      <div className="space-y-4 pb-2">
        <div className="flex gap-2">
          <Chip selected={mode === 'link'} onClick={() => { setMode('link'); setUrl('') }}><Link2 size={13} /> YouTube / Vimeo</Chip>
          <Chip selected={mode === 'upload'} onClick={() => { setMode('upload'); setUrl('') }}><Upload size={13} /> Upload</Chip>
        </div>
        {mode === 'link' ? (
          <Field label="Video link" htmlFor="v-url"><Input id="v-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" /></Field>
        ) : url ? (
          <div className="relative">
            <UploadedVideo src={url} />
            <button type="button" onClick={() => { deleteMedia(url); setUrl('') }} className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">Remove</button>
          </div>
        ) : (
          <Button variant="secondary" block icon={Upload} onClick={() => ref.current?.click()}>Choose a video (MP4, MOV, WebM · 50 MB)</Button>
        )}
        <Field label="Title" htmlFor="v-title"><Input id="v-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How I season a new humidor" /></Field>
        <Field label="Category" htmlFor="v-cat"><Select id="v-cat" value={category} onChange={(e) => setCategory(e.target.value)}>{CATS.slice(1).map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Description" htmlFor="v-desc" optional><Textarea id="v-desc" value={desc} maxLength={600} onChange={(e) => setDesc(e.target.value)} /></Field>
        <p className="text-xs text-ink-muted">Your video goes live straight away. No selling or advertising tobacco, and nobody under 21 on camera.</p>
      </div>
      <input ref={ref} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={onFile} />
    </Sheet>
  )
}
