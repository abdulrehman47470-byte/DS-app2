import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Chip, Input } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { OptionGroup } from '@/data/options'

type Val = string | string[] | undefined

function toggle(kind: 'single' | 'multi', value: Val, opt: string): string | string[] {
  if (kind === 'single') return value === opt ? '' : opt
  const arr = Array.isArray(value) ? value : []
  return arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]
}

const isOn = (value: Val, opt: string) => (Array.isArray(value) ? value.includes(opt) : value === opt)

export function OptionGroupView({
  group,
  value,
  onChange,
}: {
  group: OptionGroup
  value: Val
  onChange: (v: string | string[]) => void
}) {
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState(false)
  const all = group.subgroups ? group.subgroups.flatMap((s) => s.options) : group.options
  const filtered = q ? all.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : all
  const limit = group.searchable && !q && !expanded ? 18 : Infinity
  const count = Array.isArray(value) ? value.length : value ? 1 : 0

  return (
    <div className="py-3">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{group.label}</h3>
        <span className="text-xs text-ink-muted">
          {group.kind === 'single' ? 'Pick one' : count ? `${count} selected` : 'Pick any'}
        </span>
      </div>
      {group.searchable && (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${group.label.toLowerCase()}`} className="pl-9" aria-label={`Search ${group.label}`} />
        </div>
      )}
      {group.subgroups && !q ? (
        <div className="space-y-3">
          {group.subgroups.map((s) => (
            <div key={s.label}>
              <p className="micro-label mb-1.5 !text-[10px]">{s.label}</p>
              <div className="flex flex-wrap gap-2">
                {s.options.map((o) => (
                  <Chip key={o} selected={isOn(value, o)} onClick={() => onChange(toggle(group.kind, value, o))}>
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, limit).map((o) => (
            <Chip key={o} selected={isOn(value, o)} onClick={() => onChange(toggle(group.kind, value, o))}>
              {o}
            </Chip>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink-muted">No matches for “{q}”.</p>}
          {filtered.length > limit && (
            <button type="button" onClick={() => setExpanded(true)} className="min-h-10 px-2 text-[13px] font-semibold text-gold-ink">
              Show all {filtered.length}
            </button>
          )}
        </div>
      )}
      {group.hint && <p className="mt-2 text-xs text-ink-muted">{group.hint}</p>}
    </div>
  )
}

export function Collapsible({
  title,
  summary,
  defaultOpen,
  children,
}: {
  title: string
  summary?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
      >
        <span className="flex-1">
          <span className="block font-serif text-[17px]">{title}</span>
          {summary && <span className="block truncate text-xs text-ink-muted">{summary}</span>}
        </span>
        <ChevronDown size={20} className={cn('text-ink-muted transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="divide-y divide-line border-t border-line px-4 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** Vertical scroll-snap wheel picker. */
export function WheelPicker({
  min,
  max,
  value,
  onChange,
  label,
}: {
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const ITEM = 40
  const items = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max])

  useEffect(() => {
    ref.current?.scrollTo({ top: (value - min) * ITEM })
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const v = min + Math.round(el.scrollTop / ITEM)
    if (v !== value && v >= min && v <= max) onChange(v)
  }

  return (
    <div className="relative h-[120px] overflow-hidden rounded-[14px] border border-line bg-surface-solid/80">
      <div className="pointer-events-none absolute inset-x-2 top-10 h-10 rounded-[10px] border border-gold/60 bg-gold/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-surface-solid to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-solid to-transparent" />
      <div
        ref={ref}
        onScroll={onScroll}
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={(e) => {
          const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
          if (!d) return
          e.preventDefault()
          const v = Math.min(max, Math.max(min, value + d))
          onChange(v)
          ref.current?.scrollTo({ top: (v - min) * ITEM, behavior: 'smooth' })
        }}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto py-10"
      >
        {items.map((n) => (
          <div
            key={n}
            className={cn(
              'flex h-10 snap-center items-center justify-center font-serif text-xl transition',
              n === value ? 'text-ink' : 'text-ink-faint',
            )}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  )
}

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  format,
  label,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  format: (n: number) => string
  label: string
}) {
  const pct = (n: number) => ((n - min) / (max - min)) * 100
  const thumb =
    'pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-gold'
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-serif text-lg">
          {format(value[0])} – {format(value[1])}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold-light to-gold-deep"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <input type="range" min={min} max={max} step={5} value={value[0]} aria-label={`${label} minimum`} className={thumb}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - 5), value[1]])} />
        <input type="range" min={min} max={max} step={5} value={value[1]} aria-label={`${label} maximum`} className={thumb}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + 5)])} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export function StrengthScale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Strength scale 1 to 5" className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={cn(
            'flex min-h-12 flex-1 flex-col items-center justify-center rounded-[14px] border text-sm font-semibold transition',
            n <= value ? 'border-gold bg-gold/15 text-ink' : 'border-line bg-surface-2 text-ink-muted',
          )}
        >
          <span className="flex gap-0.5" aria-hidden>
            {Array.from({ length: n }).map((_, i) => (
              <span key={i} className={cn('h-2.5 w-1 rounded-full', n <= value ? 'bg-gold-deep' : 'bg-line-strong')} />
            ))}
          </span>
          <span className="mt-1 text-xs">{n}</span>
        </button>
      ))}
    </div>
  )
}

export function MultiEntry({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim()
    if (!t || values.includes(t)) return
    onChange([...values, t])
    setText('')
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} aria-label={placeholder} />
        <button type="button" onClick={add} aria-label="Add" className="grid size-11 shrink-0 place-items-center rounded-[14px] btn-gold">
          <Plus size={20} />
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {values.map((v) => (
          <li key={v} className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="grid size-8 place-items-center rounded-full hover:bg-surface">
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
