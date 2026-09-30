import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Ban, Check, CheckCheck, ChevronLeft, Flag, Lock, MoreVertical, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, SafetyBanner } from '@/components/brand'
import { Button, EmptyState, ErrorState, ListSkeleton } from '@/components/ui'
import { BlockSheet, ReportSheet } from '@/features/safety'
import { getConversation, memberById } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import type { Message } from '@/types'

const MAX_LEN = 1000 // TODO(phase 5): app_config

const now = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function Chat() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const m = memberById(id)
  const q = useQuery({ queryKey: ['conversation', id], queryFn: () => getConversation(id) })
  const [local, setLocal] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [menu, setMenu] = useState(false)
  const [report, setReport] = useState(false)
  const [block, setBlock] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const messages = [...(q.data?.messages ?? []), ...local]
  const matched = state.matched.includes(id)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typing])

  if (!m) return <ErrorState />

  const send = () => {
    const t = text.trim()
    if (!t) return
    const msg: Message = { id: String(Date.now()), from: 'me', text: t.slice(0, MAX_LEN), at: now(), status: 'sent' }
    setLocal((l) => [...l, msg]) // optimistic
    setText('')
    setTimeout(() => setLocal((l) => l.map((x) => (x.id === msg.id ? { ...x, status: 'delivered' } : x))), 600)
    // Mock reply so the flow feels alive in Phase 0.
    setTimeout(() => setTyping(true), 1200)
    setTimeout(() => {
      setTyping(false)
      setLocal((l) => [
        ...l.map((x) => (x.from === 'me' ? { ...x, status: 'read' as const } : x)),
        { id: String(Date.now()), from: 'them', text: 'Sounds great! Let’s plan for this weekend.', at: now() },
      ])
    }, 3000)
  }

  return (
    <div className="flex h-dvh flex-col lg:h-[calc(100dvh-48px)]">
      <header className="z-20 flex items-center gap-2 border-b border-line bg-bg/90 px-2 pb-2 pt-[max(8px,env(safe-area-inset-top))] backdrop-blur-md">
        <button onClick={() => nav('/messages')} aria-label="Back" className="grid size-11 place-items-center rounded-full hover:bg-surface-2">
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
        <Link to={`/member/${m.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={40} verified={m.verified} />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{m.firstName} {m.lastName}</p>
            <p className="truncate text-xs text-ink-muted">{m.userType} · {m.city}, {m.state}</p>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenu((v) => !v)} aria-label="Conversation options" aria-expanded={menu} className="grid size-11 place-items-center rounded-full hover:bg-surface-2">
            <MoreVertical size={20} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-12 z-30 w-48 overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-deep"
              >
                <button onClick={() => { setMenu(false); setReport(true) }} className="flex min-h-12 w-full items-center gap-2.5 px-4 text-sm hover:bg-surface-2">
                  <Flag size={16} /> Report
                </button>
                <button onClick={() => { setMenu(false); setBlock(true) }} className="flex min-h-12 w-full items-center gap-2.5 px-4 text-sm text-danger hover:bg-danger/10">
                  <Ban size={16} /> Block
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
        <SafetyBanner className="mb-4" />
        {q.isLoading ? (
          <ListSkeleton rows={3} avatar={false} />
        ) : !matched ? (
          <EmptyState icon={Lock} title="Match first to message" body={`You can message ${m.firstName} once you both like each other.`} action={<Link to={`/member/${m.id}`}><Button>View profile</Button></Link>} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Avatar tone={m.tone} name={`${m.firstName} ${m.lastName}`} size={88} ring />
            <p className="mt-4 font-serif text-xl">You matched with {m.firstName}</p>
            <p className="mt-1 text-sm text-ink-muted">Break the ice. Ask about their go-to pairing.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg, i) => {
              const mine = msg.from === 'me'
              const showAvatar = !mine && messages[i + 1]?.from !== 'them'
              return (
                <motion.li
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex items-end gap-2', mine && 'justify-end')}
                >
                  {!mine && (
                    <span className="w-8 shrink-0">{showAvatar && <Avatar tone={m.tone} name={m.firstName} size={30} />}</span>
                  )}
                  <div className={cn('max-w-[75%]', mine && 'items-end')}>
                    <div
                      className={cn(
                        'rounded-[20px] px-4 py-2.5 text-[15px] leading-snug',
                        mine ? 'rounded-br-md bg-gradient-to-b from-gold-light/90 to-gold text-on-gold' : 'rounded-bl-md border border-line bg-surface-solid',
                      )}
                    >
                      {msg.text}
                    </div>
                    <p className={cn('mt-1 flex items-center gap-1 px-1 text-[11px] text-ink-muted', mine && 'justify-end')}>
                      {msg.at}
                      {mine && msg.status === 'read' && <CheckCheck size={13} className="text-info" aria-label="Read" />}
                      {mine && msg.status === 'delivered' && <CheckCheck size={13} aria-label="Delivered" />}
                      {mine && msg.status === 'sent' && <Check size={13} aria-label="Sent" />}
                    </p>
                  </div>
                </motion.li>
              )
            })}
            {typing && (
              <li className="flex items-end gap-2">
                <span className="w-8" />
                <div className="flex gap-1 rounded-[20px] rounded-bl-md border border-line bg-surface-solid px-4 py-3" aria-label={`${m.firstName} is typing`}>
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="size-1.5 rounded-full bg-ink-muted" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                </div>
              </li>
            )}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      {matched && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-end gap-2 border-t border-line bg-bg-elevated/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
        >
          <label className="sr-only" htmlFor="msg">Message</label>
          <textarea
            id="msg"
            rows={1}
            maxLength={MAX_LEN}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Type a message…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border border-line bg-surface-solid px-4 py-2.5 text-[15px] outline-none focus:border-gold"
          />
          <button type="submit" disabled={!text.trim()} aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-full btn-gold disabled:opacity-40">
            <SendHorizontal size={19} />
          </button>
        </form>
      )}

      <ReportSheet open={report} onClose={() => setReport(false)} name={m.firstName} />
      <BlockSheet
        open={block}
        onClose={() => setBlock(false)}
        name={m.firstName}
        onBlocked={() => {
          set((s) => ({ blocked: [...s.blocked, m.id], matched: s.matched.filter((x) => x !== m.id) }))
          toast(`${m.firstName} is blocked`)
          nav('/messages')
        }}
      />
    </div>
  )
}
