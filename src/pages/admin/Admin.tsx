import { AlertTriangle, ArrowLeft, BookOpen, Check, FileClock, Flag, ImageIcon, Newspaper, PlayCircle, Search, ToggleRight, Users, X } from 'lucide-react'
import { Toggle } from '@/components/ui'
import { FLAGS } from '@/features/community/flags'
import { useCommunity } from '@/features/community/store'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, LogoMark, Portrait } from '@/components/brand'
import { Badge, Button, EmptyState, Input, Select, Textarea } from '@/components/ui'
import { BLOG_POSTS, SESSIONS } from '@/data/mock/content'
import { MEMBERS } from '@/data/mock/members'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

type Tab = 'photos' | 'reports' | 'community' | 'users' | 'sessions' | 'blog' | 'flags' | 'audit'
const TABS: { id: Tab; label: string; icon: typeof Flag }[] = [
  { id: 'photos', label: 'Photo review', icon: ImageIcon },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'community', label: 'Community queue', icon: Newspaper },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: PlayCircle },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'flags', label: 'Feature flags', icon: ToggleRight },
  { id: 'audit', label: 'Audit log', icon: FileClock },
]

const REPORTS = [
  { id: 'r1', member: MEMBERS[3], reason: 'Selling or advertising tobacco', by: 'Sofia R.', at: '2h ago', status: 'Open' },
  { id: 'r2', member: MEMBERS[9], reason: 'Fake profile or photo', by: 'James C.', at: '5h ago', status: 'Open' },
  { id: 'r3', member: MEMBERS[5], reason: 'Harassment or hate', by: 'Nadia K.', at: '1d ago', status: 'Warned' },
]

export default function Admin() {
  const { toast } = useApp()
  const { c, setC } = useCommunity()
  const [queueItems, setQueueItems] = useState([
    { id: 'q1', kind: 'Post', who: 'Tom Hadley', text: 'Selling a box of 20, $15 each, DM me', reason: 'Auto-filter: selling tobacco' },
    { id: 'q2', kind: 'Comment', who: 'Chris Evers', text: 'That lounge is a dump, the owner is an idiot', reason: 'Reported: harassment' },
    { id: 'q3', kind: 'Video', who: 'Daniel Ortega', text: 'Uploaded clip, 28s', reason: 'Reported: inappropriate' },
    { id: 'q4', kind: 'Event', who: 'Nadia Karim', text: 'After-party at my place', reason: 'Private residence venue' },
  ])
  const [tab, setTab] = useState<Tab>('photos')
  const [queue, setQueue] = useState(MEMBERS.slice(0, 6))
  const [reports, setReports] = useState(REPORTS)
  const [audit, setAudit] = useState<string[]>(['Admin approved photo for Evelyn Shaw · yesterday'])
  const [userQ, setUserQ] = useState('')
  const [rejectReason, setRejectReason] = useState('Not a clear photo of you')

  const log = (s: string) => {
    setAudit((a) => [`${s} · just now`, ...a])
    toast(s)
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg-elevated/90 px-5 py-3 backdrop-blur">
        <Link to="/settings" aria-label="Back to app" className="grid size-10 place-items-center rounded-full hover:bg-surface-2"><ArrowLeft size={20} /></Link>
        <LogoMark size={30} />
        <h1 className="font-serif text-xl">Daily Stogie Admin</h1>
        <Badge tone="danger" className="ml-auto">Demo data</Badge>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:flex-row">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex min-h-11 shrink-0 items-center gap-2.5 rounded-[14px] px-3 text-sm font-medium', tab === t.id ? 'bg-gold/15 text-ink' : 'text-ink-muted hover:bg-surface-2')}>
              <t.icon size={17} className={tab === t.id ? 'text-gold-deep' : ''} /> {t.label}
              {t.id === 'photos' && <span className="ml-auto rounded-full bg-gold px-1.5 text-[11px] font-bold text-on-gold">{queue.length}</span>}
              {t.id === 'reports' && <span className="ml-auto rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">{reports.filter((r) => r.status === 'Open').length}</span>}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          {tab === 'photos' && (
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl">Pending photo review</h2>
                  <p className="text-sm text-ink-muted">New photos stay hidden from other members until approved.</p>
                </div>
                <div className="w-64">
                  <Select aria-label="Reject reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
                    {['Not a clear photo of you', 'Explicit or suggestive', 'Contains logos or ads', 'Stock or copied image', 'Appears under 21'].map((r) => <option key={r}>{r}</option>)}
                  </Select>
                </div>
              </div>
              {queue.length === 0 ? (
                <EmptyState icon={Check} title="Queue is clear" body="No photos waiting for review." />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {queue.map((m) => (
                    <div key={m.id} className="card overflow-hidden">
                      <div className="aspect-[3/4]"><Portrait tone={m.tone} initials={m.firstName[0] + m.lastName[0]} /></div>
                      <div className="p-3">
                        <p className="font-semibold">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-ink-muted">Face check: {m.verified ? 'passed' : 'unsure, needs review'}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button size="sm" className="!bg-none !bg-success !text-white" icon={Check} onClick={() => { setQueue((q) => q.filter((x) => x.id !== m.id)); log(`Approved photo for ${m.firstName} ${m.lastName}`) }}>Approve</Button>
                          <Button size="sm" variant="danger" icon={X} onClick={() => { setQueue((q) => q.filter((x) => x.id !== m.id)); log(`Rejected photo for ${m.firstName} ${m.lastName}: ${rejectReason}`) }}>Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'reports' && (
            <section>
              <h2 className="mb-4 font-serif text-2xl">Reports</h2>
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="card flex flex-wrap items-center gap-4 p-4">
                    <Avatar tone={r.member.tone} name={`${r.member.firstName} ${r.member.lastName}`} size={48} />
                    <div className="min-w-48 flex-1">
                      <p className="font-semibold">{r.member.firstName} {r.member.lastName} <Badge tone={r.status === 'Open' ? 'danger' : 'warning'}>{r.status}</Badge></p>
                      <p className="flex items-center gap-1.5 text-sm"><AlertTriangle size={14} className="text-warning" /> {r.reason}</p>
                      <p className="text-xs text-ink-muted">Reported by {r.by} · {r.at}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['Warned', 'Suspended', 'Banned', 'Reinstated'] as const).map((a) => (
                        <Button key={a} size="sm" variant={a === 'Banned' ? 'danger' : 'secondary'} onClick={() => { setReports((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: a } : x))); log(`${a} ${r.member.firstName} ${r.member.lastName}`) }}>
                          {a === 'Warned' ? 'Warn' : a === 'Suspended' ? 'Suspend' : a === 'Banned' ? 'Ban' : 'Reinstate'}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'community' && (
            <section>
              <h2 className="font-serif text-2xl">Community moderation</h2>
              <p className="mb-4 text-sm text-ink-muted">Reported or auto-flagged posts, comments, videos and events, plus new members’ first posts.</p>
              <div className="space-y-3">
                {[
                  ...c.posts.filter((p) => p.pendingReview).map((p) => ({ id: p.id, kind: 'First post', who: 'Jordan Hale', text: p.text || p.smoke?.brand || '(media)', reason: 'New member review' })),
                  ...c.articles.filter((x) => x.pendingReview).map((x) => ({ id: x.id, kind: 'Article', who: 'Jordan Hale', text: x.title, reason: 'Editorial review before publishing' })),
                  ...c.videos.filter((x) => x.pendingReview).map((x) => ({ id: x.id, kind: 'Video', who: 'Jordan Hale', text: x.title, reason: 'Video review before publishing' })),
                  ...queueItems,
                ].map((q) => (
                  <div key={q.id} className="card flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-48 flex-1">
                      <p className="flex items-center gap-2 font-semibold">{q.who} <Badge tone="muted">{q.kind}</Badge></p>
                      <p className="mt-1 text-sm">“{q.text}”</p>
                      <p className="text-xs text-warning">{q.reason}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => {
                        setC((s) => ({ posts: s.posts.map((p) => (p.id === q.id ? { ...p, pendingReview: false } : p)), articles: s.articles.map((x) => (x.id === q.id ? { ...x, pendingReview: false } : x)), videos: s.videos.map((x) => (x.id === q.id ? { ...x, pendingReview: false } : x)) }))
                        setQueueItems((x) => x.filter((i) => i.id !== q.id))
                        log(`Approved ${q.kind.toLowerCase()} by ${q.who}`)
                      }}>Approve</Button>
                      {(['Remove', 'Warn', 'Suspend', 'Ban'] as const).map((a) => (
                        <Button key={a} size="sm" variant={a === 'Remove' || a === 'Ban' ? 'danger' : 'secondary'} onClick={() => {
                          if (a === 'Remove') setC((s) => ({ posts: s.posts.filter((p) => p.id !== q.id), articles: s.articles.filter((x) => x.id !== q.id), videos: s.videos.filter((x) => x.id !== q.id) }))
                          setQueueItems((x) => x.filter((i) => i.id !== q.id))
                          log(`${a}: ${q.kind.toLowerCase()} by ${q.who}`)
                        }}>{a}</Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'flags' && (
            <section>
              <h2 className="font-serif text-2xl">Feature flags</h2>
              <p className="mb-4 max-w-2xl text-sm text-ink-muted">
                The Community module is an optional extra, not in the client’s brief. In production every flag defaults to OFF until the client approves it in writing. With all flags off, the app matches the client spec exactly.
              </p>
              <div className="mb-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { setC({ flags: Object.fromEntries(FLAGS.map((f) => [f.key, true])) as typeof c.flags }); log('Turned on all community flags') }}>All on</Button>
                <Button size="sm" variant="secondary" onClick={() => { setC({ flags: Object.fromEntries(FLAGS.map((f) => [f.key, false])) as typeof c.flags }); log('Turned off all community flags') }}>All off (client spec)</Button>
              </div>
              <ul className="card divide-y divide-line">
                {FLAGS.map((f) => (
                  <li key={f.key} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{f.label} <code className="ml-1 text-xs font-normal text-ink-muted">{f.key}</code></p>
                      <p className="text-xs text-ink-muted">{f.desc}</p>
                    </div>
                    <Toggle label={f.label} checked={!!c.flags[f.key]} onChange={(v) => { setC((s) => ({ flags: { ...s.flags, [f.key]: v } })); log(`${v ? 'Enabled' : 'Disabled'} ${f.key}`) }} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'users' && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl">Users</h2>
                <div className="relative w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input className="pl-9" placeholder="Search name or city" value={userQ} onChange={(e) => setUserQ(e.target.value)} aria-label="Search users" />
                </div>
              </div>
              <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-xs text-ink-muted">
                    <tr>{['Member', 'Type', 'Location', 'Photo', 'Subscription', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {MEMBERS.filter((m) => `${m.firstName} ${m.lastName} ${m.city}`.toLowerCase().includes(userQ.toLowerCase())).map((m, i) => (
                      <tr key={m.id}>
                        <td className="px-4 py-3"><span className="flex items-center gap-2.5"><Avatar tone={m.tone} name={m.firstName} size={32} /> {m.firstName} {m.lastName}</span></td>
                        <td className="px-4 py-3">{m.userType}</td>
                        <td className="px-4 py-3">{m.city}, {m.state}</td>
                        <td className="px-4 py-3"><Badge tone={m.verified ? 'success' : 'warning'}>{m.verified ? 'Approved' : 'Pending'}</Badge></td>
                        <td className="px-4 py-3">{i % 3 === 0 ? 'Yearly' : i % 3 === 1 ? 'Monthly' : 'Past due'}</td>
                        <td className="px-4 py-3">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'sessions' && (
            <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div>
                <h2 className="mb-4 font-serif text-2xl">Stogie Sessions</h2>
                <ul className="card divide-y divide-line">
                  {SESSIONS.map((s) => <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm"><span>{s.title}</span><span className="text-ink-muted">Vimeo {s.vimeoId} · {s.duration}</span></li>)}
                </ul>
              </div>
              <form className="card space-y-3 p-4" onSubmit={(e) => { e.preventDefault(); log('Added a Stogie Session') }}>
                <h3 className="font-serif text-lg">Add session</h3>
                <Input placeholder="Title" aria-label="Title" required />
                <Input placeholder="Vimeo video ID" aria-label="Vimeo ID" required />
                <Textarea placeholder="Description" aria-label="Description" />
                <Button type="submit" block>Save</Button>
              </form>
            </section>
          )}

          {tab === 'blog' && (
            <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <div>
                <h2 className="mb-4 font-serif text-2xl">Stogie Blog</h2>
                <ul className="card divide-y divide-line">
                  {BLOG_POSTS.map((p) => <li key={p.slug} className="flex items-center justify-between px-4 py-3 text-sm"><span>{p.title}</span><Badge tone="success">Published</Badge></li>)}
                </ul>
              </div>
              <form className="card space-y-3 p-4" onSubmit={(e) => { e.preventDefault(); log('Published a blog post') }}>
                <h3 className="font-serif text-lg">New article</h3>
                <Input placeholder="Title" aria-label="Title" required />
                <Textarea className="min-h-48 font-mono text-sm" placeholder="Write in Markdown…" aria-label="Body" />
                <div className="flex gap-2"><Button type="button" variant="secondary" className="flex-1" onClick={() => toast('Draft saved')}>Save draft</Button><Button type="submit" className="flex-1">Publish</Button></div>
              </form>
            </section>
          )}

          {tab === 'audit' && (
            <section>
              <h2 className="mb-4 font-serif text-2xl">Audit log</h2>
              <ul className="card divide-y divide-line">
                {audit.map((a, i) => <li key={i} className="px-4 py-3 text-sm">{a}</li>)}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
