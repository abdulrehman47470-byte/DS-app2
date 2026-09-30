import { BarChart3, CalendarDays, CircleHelp, Flame, ImagePlus, Link2, Music2, PenLine, Plus, Upload, Video, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Avatar } from '@/components/brand'
import { Button, Chip, Field, Input, Select, Sheet, Textarea } from '@/components/ui'
import { LOUNGES } from '@/data/mock/content'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import { isAllowedMusic, isAllowedVideo } from './embeds'
import { checkContent } from './moderation'
import { SmokeReportForm, EMPTY_REPORT } from './SmokeReportForm'
import { LIMITS, useCommunity } from './store'
import { TOPICS, type Post, type PostType, type SmokeReport } from './types'

const VIDEO_MAX_MB = 50
const VIDEO_MAX_SECONDS = 30
const VIDEO_UPLOADS_ENABLED = true // TODO(phase 10): app_config switch to keep links only

function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, 1080 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * s
      c.height = img.height * s
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.8))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function videoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => resolve(v.duration)
    v.onerror = () => resolve(Infinity)
    v.src = url
  })
}

export function Composer({ open, onClose, initialType = 'update', initialSmoke }: { open: boolean; onClose: () => void; initialType?: PostType; initialSmoke?: SmokeReport }) {
  const { state, toast } = useApp()
  const { c, setC, on } = useCommunity()
  const [type, setType] = useState<PostType>(initialType)
  const [text, setText] = useState('')
  const [topic, setTopic] = useState('')
  const [loungeId, setLoungeId] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [videoMode, setVideoMode] = useState<'none' | 'link' | 'upload'>('none')
  const [videoUrl, setVideoUrl] = useState('')
  const [music, setMusic] = useState('')
  const [showMusic, setShowMusic] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDays, setPollDays] = useState(1)
  const [smoke, setSmoke] = useState<SmokeReport>(initialSmoke ?? EMPTY_REPORT)
  const [eventId, setEventId] = useState('')
  const [error, setError] = useState<string>()
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const types: { value: PostType; label: string; icon: typeof PenLine; flag?: boolean }[] = [
    { value: 'update', label: 'Update', icon: PenLine },
    { value: 'question', label: 'Question', icon: CircleHelp },
    { value: 'poll', label: 'Poll', icon: BarChart3 },
    { value: 'smoke', label: 'Smoke Report', icon: Flame, flag: on('smoke_reports') },
    { value: 'event', label: 'Event', icon: CalendarDays, flag: on('events') },
  ]

  const reset = () => {
    setText(''); setTopic(''); setLoungeId(''); setPhotos([]); setVideoMode('none'); setVideoUrl(''); setMusic(''); setShowMusic(false)
    setPollOptions(['', '']); setPollDays(1); setSmoke(EMPTY_REPORT); setEventId(''); setError(undefined)
  }

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length)
    e.target.value = ''
    const urls = await Promise.all(files.filter((f) => f.type.startsWith('image/')).map(shrink))
    setPhotos((p) => [...p, ...urls].slice(0, 6))
  }

  const addVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(f.type)) return setError('Videos must be MP4, MOV or WebM.')
    if (f.size > VIDEO_MAX_MB * 1024 * 1024) return setError(`Videos must be under ${VIDEO_MAX_MB} MB.`)
    const url = URL.createObjectURL(f)
    if ((await videoDuration(url)) > VIDEO_MAX_SECONDS + 0.5) {
      URL.revokeObjectURL(url)
      return setError(`Clips can be up to ${VIDEO_MAX_SECONDS} seconds.`)
    }
    setError(undefined)
    setVideoUrl(url)
  }

  const submit = () => {
    if (c.postsToday >= LIMITS.postsPerDay) return setError(`You can post ${LIMITS.postsPerDay} times a day.`)
    const blocked = checkContent(`${text} ${smoke.notes}`)
    if (blocked) return setError(blocked)
    if (type === 'poll' && pollOptions.filter((o) => o.trim()).length < 2) return setError('Add at least 2 poll options.')
    if (type === 'smoke' && (!smoke.brand || !smoke.rating)) return setError('Pick a brand and an overall rating.')
    if (type === 'event' && !eventId) return setError('Choose an event to share.')
    if (videoMode === 'link' && videoUrl && !isAllowedVideo(videoUrl)) return setError('Use a YouTube or Vimeo link.')
    if (music && !isAllowedMusic(music)) return setError('Use a Spotify, Apple Music, YouTube or SoundCloud link.')
    if (!text.trim() && type !== 'smoke' && type !== 'event' && !photos.length) return setError('Write something first.')

    const myCount = c.posts.filter((p) => p.authorId === 'me').length
    const post: Post = {
      id: `p${Date.now()}`,
      authorId: 'me',
      type,
      text: text.trim(),
      topic: topic || (type === 'smoke' ? 'Tasting' : type === 'event' ? 'Events' : undefined),
      loungeId: loungeId || undefined,
      photos: photos.map((src) => ({ src })),
      video: videoMode !== 'none' && videoUrl ? { kind: videoMode, url: videoUrl } : undefined,
      music: music || undefined,
      poll: type === 'poll' ? { options: pollOptions.filter((o) => o.trim()), votes: pollOptions.filter((o) => o.trim()).map(() => 0), days: pollDays } : undefined,
      smoke: type === 'smoke' ? smoke : undefined,
      eventId: type === 'event' ? eventId : undefined,
      at: 'now',
      metro: state.demographics.city,
      reactions: {},
      reactors: [],
      comments: [],
      pendingReview: myCount < c.reviewFirstPosts,
    }
    setC((s) => ({ posts: [post, ...s.posts], postsToday: s.postsToday + 1 }))
    toast(post.pendingReview ? 'Posted! Your first posts are reviewed before others see them.' : 'Posted')
    reset()
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Create post"
      footer={
        <div>
          {error && <p className="mb-2 text-sm text-danger" role="alert">{error}</p>}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => photoRef.current?.click()} disabled={photos.length >= 6} aria-label="Add photos" className="grid size-11 place-items-center rounded-full text-gold-deep hover:bg-surface-2 disabled:opacity-40"><ImagePlus size={21} /></button>
            {on('video_posts') && (
              <button type="button" onClick={() => setVideoMode(videoMode === 'none' ? 'link' : 'none')} aria-label="Add video" className={cn('grid size-11 place-items-center rounded-full hover:bg-surface-2', videoMode !== 'none' ? 'bg-gold/15 text-gold-deep' : 'text-gold-deep')}><Video size={21} /></button>
            )}
            {on('music_share') && (
              <button type="button" onClick={() => setShowMusic((v) => !v)} aria-label="Add music" className={cn('grid size-11 place-items-center rounded-full hover:bg-surface-2', showMusic ? 'bg-gold/15 text-gold-deep' : 'text-gold-deep')}><Music2 size={21} /></button>
            )}
            <span className="ml-auto mr-2 text-xs text-ink-muted">{text.length}/{LIMITS.postChars}</span>
            <Button onClick={submit}>Post</Button>
          </div>
        </div>
      }
    >
      <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
        {types.filter((t) => t.flag !== false).map((t) => (
          <Chip key={t.value} selected={type === t.value} onClick={() => setType(t.value)}>
            <t.icon size={14} /> {t.label}
          </Chip>
        ))}
      </div>

      <div className="flex gap-3">
        <Avatar tone={30} name={state.demographics.name} src={state.photo} size={40} />
        <Textarea
          aria-label="Post text"
          maxLength={LIMITS.postChars}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === 'question' ? 'Ask the community…' : type === 'smoke' ? 'Add a few words about this smoke (optional)' : 'What are you smoking today?'}
          className="min-h-24 border-0 bg-transparent px-0 focus:ring-0"
        />
      </div>

      {type === 'poll' && (
        <div className="mt-2 space-y-2">
          {pollOptions.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input value={o} onChange={(e) => setPollOptions(pollOptions.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} aria-label={`Option ${i + 1}`} maxLength={60} />
              {pollOptions.length > 2 && <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} aria-label="Remove option" className="grid size-11 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button>}
            </div>
          ))}
          {pollOptions.length < 4 && <Button size="sm" variant="ghost" icon={Plus} onClick={() => setPollOptions([...pollOptions, ''])}>Add option</Button>}
          <Field label="Poll length" htmlFor="poll-days">
            <Select id="poll-days" value={pollDays} onChange={(e) => setPollDays(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>)}
            </Select>
          </Field>
        </div>
      )}

      {type === 'smoke' && <div className="mt-2"><SmokeReportForm value={smoke} onChange={setSmoke} /></div>}

      {type === 'event' && (
        <Field label="Event to share" htmlFor="ev">
          <Select id="ev" value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Choose an event">
            {c.events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </Select>
        </Field>
      )}

      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={p} alt="" className="size-full object-cover" />
              <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label="Remove photo" className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/60 text-white"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {videoMode !== 'none' && (
        <div className="mt-3 rounded-2xl border border-line p-3">
          <div className="mb-2 flex gap-2">
            <Chip size="sm" selected={videoMode === 'link'} onClick={() => { setVideoMode('link'); setVideoUrl('') }}><Link2 size={12} /> YouTube / Vimeo link</Chip>
            {VIDEO_UPLOADS_ENABLED && <Chip size="sm" selected={videoMode === 'upload'} onClick={() => { setVideoMode('upload'); setVideoUrl('') }}><Upload size={12} /> Upload clip</Chip>}
          </div>
          {videoMode === 'link' ? (
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" aria-label="Video link" />
          ) : videoUrl ? (
            <video src={videoUrl} muted playsInline controls className="aspect-video w-full rounded-xl bg-black" />
          ) : (
            <Button variant="secondary" block icon={Upload} onClick={() => videoRef.current?.click()}>Choose a clip (max {VIDEO_MAX_SECONDS}s, {VIDEO_MAX_MB} MB)</Button>
          )}
        </div>
      )}

      {showMusic && (
        <div className="mt-3">
          <Input value={music} onChange={(e) => setMusic(e.target.value)} placeholder="Spotify, Apple Music, YouTube or SoundCloud link" aria-label="Music link" />
        </div>
      )}

      <p className="micro-label mb-2 mt-5">Topic</p>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => <Chip key={t} size="sm" selected={topic === t} onClick={() => setTopic(topic === t ? '' : t)}>{t}</Chip>)}
      </div>
      <div className="mt-4 pb-2">
        <Field label="Tag a lounge" htmlFor="lounge-tag" optional>
          <Select id="lounge-tag" value={loungeId} onChange={(e) => setLoungeId(e.target.value)} placeholder="No location">
            {LOUNGES.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
          </Select>
        </Field>
      </div>

      <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
      <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={addVideo} />
    </Sheet>
  )
}
