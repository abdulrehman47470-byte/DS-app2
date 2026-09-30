import { Ban, Flag } from 'lucide-react'
import { useState } from 'react'
import { Button, Sheet, Textarea } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

const REASONS = [
  'Fake profile or photo',
  'Harassment or hate',
  'Inappropriate photo',
  'Selling or advertising tobacco',
  'Appears to be under 21',
  'Spam or scam',
  'Something else',
]

export function ReportSheet({
  open,
  onClose,
  name,
}: {
  open: boolean
  onClose: () => void
  name: string
}) {
  const { toast } = useApp()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Report ${name}`}
      footer={
        <Button
          block
          size="lg"
          disabled={!reason}
          onClick={() => {
            toast('Report sent. Our team will review it.')
            setReason('')
            setDetails('')
            onClose()
          }}
        >
          Send report
        </Button>
      }
    >
      <p className="mb-3 text-sm text-ink-muted">Reports are confidential. {name} won’t know it was you.</p>
      <div role="radiogroup" className="space-y-2">
        {REASONS.map((r) => (
          <button
            key={r}
            role="radio"
            aria-checked={reason === r}
            onClick={() => setReason(r)}
            className={cn(
              'flex min-h-12 w-full items-center rounded-[14px] border px-4 text-left text-sm transition',
              reason === r ? 'border-gold bg-gold/12 font-semibold' : 'border-line bg-surface',
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <Textarea className="mt-3" placeholder="Add details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} aria-label="Details" />
    </Sheet>
  )
}

export function BlockSheet({
  open,
  onClose,
  name,
  onBlocked,
}: {
  open: boolean
  onClose: () => void
  name: string
  onBlocked: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title={`Block ${name}?`}>
      <p className="text-sm text-ink-muted">
        You won’t see each other in Discover, Mentors, Matches or Messages. They won’t be told.
      </p>
      <div className="mt-5 space-y-3 pb-2">
        <Button block size="lg" variant="danger" icon={Ban} onClick={onBlocked}>
          Block {name}
        </Button>
        <Button block variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Sheet>
  )
}

/** Small Report + Block pair used on cards, profiles and chats. */
export function SafetyActions({ name, onBlocked, compact }: { name: string; onBlocked: () => void; compact?: boolean }) {
  const [report, setReport] = useState(false)
  const [block, setBlock] = useState(false)
  return (
    <>
      <div className="flex gap-2">
        <Button size={compact ? 'sm' : 'md'} variant="secondary" icon={Flag} onClick={() => setReport(true)}>
          Report
        </Button>
        <Button size={compact ? 'sm' : 'md'} variant="danger" icon={Ban} onClick={() => setBlock(true)}>
          Block
        </Button>
      </div>
      <ReportSheet open={report} onClose={() => setReport(false)} name={name} />
      <BlockSheet
        open={block}
        onClose={() => setBlock(false)}
        name={name}
        onBlocked={() => {
          setBlock(false)
          onBlocked()
        }}
      />
    </>
  )
}
