import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Heart, MessageCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, UserTypeBadge } from '@/components/brand'
import { Badge, Button, Chip, EmptyState, ErrorState, Input, ListSkeleton, Segmented, Select, TopBar } from '@/components/ui'
import { MENTOR_TOPICS } from '@/data/options'
import { getConversations, getMatches, getMentors, memberById } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

/* ---------------- Mentors ---------------- */
export function Mentors() {
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const [mode, setMode] = useState<'find' | 'guide'>('find')
  const [topic, setTopic] = useState('')
  const [sort, setSort] = useState('match')
  const [loc, setLoc] = useState('')
  const q = useQuery({ queryKey: ['mentors', mode, state.blocked], queryFn: () => getMentors(state, mode, state.blocked) })

  const list = useMemo(() => {
    const l = (q.data ?? []).filter((m) => (!topic || m.mentorTopics.includes(topic)) && (!loc || `${m.city}, ${m.state}` === loc))
    return sort === 'match' ? [...l].sort((a, b) => b.match - a.match) : [...l].sort((a, b) => b.yearsSmoking - a.yearsSmoking)
  }, [q.data, topic, sort, loc])
  const locations = [...new Set((q.data ?? []).map((m) => `${m.city}, ${m.state}`))].sort()

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Mentors" large />
      <div className="px-4">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'find', label: 'Find a mentor' },
            { value: 'guide', label: 'Guide beginners' },
          ]}
        />
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip selected={!topic} onClick={() => setTopic('')}>All topics</Chip>
          {MENTOR_TOPICS.map((t) => (
            <Chip key={t} selected={topic === t} onClick={() => setTopic(topic === t ? '' : t)}>{t}</Chip>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Select compact aria-label="Location" value={loc} onChange={(e) => setLoc(e.target.value)} className="min-h-10 text-sm" placeholder="Any location">
            {locations.map((l) => <option key={l}>{l}</option>)}
          </Select>
          <Select compact aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-10 text-sm">
            <option value="match">Best match</option>
            <option value="exp">Most experience</option>
          </Select>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {mode === 'find' ? 'Experienced members who enjoy guiding newcomers.' : 'Members looking for someone to learn from.'}
        </p>
      </div>

      <div className="mt-3 space-y-3 px-4 pb-4">
        {q.isLoading ? (
          <ListSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No mentors on this topic yet" body="Try another topic or check back soon." />
        ) : (
          list.map((m) => {
            const liked = state.liked.includes(m.id)
            return (
              <article key={m.id} className="card p-4">
                <div className="flex gap-3">
                  <Link to={`/member/${m.id}`} aria-label={`View ${m.firstName}`}>
                    <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={64} verified={m.verified} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/member/${m.id}`} className="font-serif text-lg leading-tight hover:underline">
                        {m.firstName} {m.lastName}
                      </Link>
                      {mode === 'find' ? <Badge><GraduationCap size={11} /> Mentor</Badge> : <Badge tone="muted">Learner</Badge>}
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink-muted">
                      {m.userType} · {m.yearsSmoking} {m.yearsSmoking === 1 ? 'year' : 'years'} · {m.city}, {m.state}
                    </p>
                    <p className="mt-1 text-[13px]">
                      <span className="text-ink-muted">{mode === 'find' ? 'Expert in: ' : 'Wants to learn: '}</span>
                      {m.mentorTopics.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {m.mentorTopics.slice(0, 3).map((t) => (
                      <Chip key={t} size="sm" highlight={t === topic}>{t}</Chip>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant={liked ? 'secondary' : 'primary'}
                    icon={Heart}
                    disabled={liked}
                    onClick={() => {
                      set((s) => ({ liked: [...s.liked, m.id], matched: m.likesYou && !s.matched.includes(m.id) ? [m.id, ...s.matched] : s.matched }))
                      toast(m.likesYou ? `It’s a match with ${m.firstName}!` : `You liked ${m.firstName}`)
                      if (m.likesYou) nav(`/messages/${m.id}`)
                    }}
                  >
                    {liked ? 'Liked' : 'Like'}
                  </Button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ---------------- Matches ---------------- */
export function Matches() {
  const { state } = useApp()
  const ids = state.matched.filter((id) => !state.blocked.includes(id))
  const q = useQuery({ queryKey: ['matches', ids], queryFn: () => getMatches(state, ids) })
  const [tab, setTab] = useState<'new' | 'all'>('new')
  const fresh = (q.data ?? []).filter((m) => !m.conversation || m.conversation.messages.length === 0)

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Matches" large />
      <div className="px-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'new', label: `New Matches${fresh.length ? ` (${fresh.length})` : ''}` },
            { value: 'all', label: 'All Matches' },
          ]}
        />
      </div>
      {q.isLoading ? (
        <div className="p-4"><ListSkeleton /></div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : !q.data?.length ? (
        <EmptyState icon={Heart} title="No matches yet" body="Keep swiping! When someone likes you back, they’ll show up here." action={<Link to="/discover"><Button>Go to Discover</Button></Link>} />
      ) : (
        <>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 pt-4">
            {q.data.map((m) => (
              <Link key={m.id} to={`/messages/${m.id}`} className="flex w-[70px] shrink-0 flex-col items-center gap-1.5">
                <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={66} ring />
                <span className="text-[13px] font-medium">{m.firstName}</span>
                <span className="-mt-1.5 text-[11px] text-ink-muted">{m.age}</span>
              </Link>
            ))}
          </div>
          <ul className="mt-2 space-y-2 px-4 pb-4">
            {(tab === 'new' ? fresh : q.data).map((m) => {
              const unmessaged = !m.conversation || m.conversation.messages.length === 0
              return (
                <li key={m.id}>
                  <Link
                    to={`/messages/${m.id}`}
                    className={cn('flex items-center gap-3 rounded-[20px] border p-3 transition hover:bg-surface-2', unmessaged ? 'border-gold/50 bg-gold/8' : 'border-line bg-surface')}
                  >
                    <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={52} verified={m.verified} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{m.firstName} {m.lastName}</p>
                      <p className="text-[13px] text-ink-muted">{m.userType} · {m.age} · {m.city}, {m.state}</p>
                      <p className="text-xs text-ink-muted">Matched {m.conversation?.matchedAt ?? 'today'}</p>
                    </div>
                    {unmessaged ? <Badge>Say hello</Badge> : <span className="font-serif text-sm text-gold-ink">{m.match}%</span>}
                  </Link>
                </li>
              )
            })}
            {tab === 'new' && fresh.length === 0 && (
              <EmptyState icon={MessageCircle} title="You’ve said hello to everyone" body="New matches you haven’t messaged yet appear here." />
            )}
          </ul>
        </>
      )}
    </div>
  )
}

/* ---------------- Messages list ---------------- */
export function Messages() {
  const { state } = useApp()
  const [search, setSearch] = useState('')
  const ids = state.matched.filter((id) => !state.blocked.includes(id))
  const q = useQuery({ queryKey: ['conversations', ids], queryFn: () => getConversations(ids) })
  const list = (q.data ?? []).filter((c) => {
    const m = memberById(c.memberId)
    return m && `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Messages" large />
      <div className="relative px-4">
        <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input placeholder="Search conversations" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search conversations" />
      </div>
      {q.isLoading ? (
        <div className="p-4"><ListSkeleton /></div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No messages yet" body="When you match with someone, you’ll see your messages here." />
      ) : (
        <ul className="mt-3 divide-y divide-line px-4">
          {list.map((c) => {
            const m = memberById(c.memberId)!
            const last = c.messages[c.messages.length - 1]
            return (
              <li key={c.id}>
                <Link to={`/messages/${m.id}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-surface-2">
                  <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={54} verified={m.verified} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn('truncate', c.unread ? 'font-bold' : 'font-semibold')}>{m.firstName} {m.lastName}</p>
                      <span className="shrink-0 text-xs text-ink-muted">{last.at}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn('flex-1 truncate text-sm', c.unread ? 'text-ink' : 'text-ink-muted')}>
                        {last.from === 'me' && 'You: '}{last.text}
                      </p>
                      {c.unread > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-on-gold" aria-label={`${c.unread} unread`}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5"><UserTypeBadge type={m.userType} /></div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
