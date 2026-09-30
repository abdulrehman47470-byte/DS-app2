import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, Check, X, RotateCw, type LucideIcon } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  block?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, block, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-[14px] font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
        size === 'sm' && 'min-h-9 px-3 text-[13px]',
        size === 'md' && 'min-h-11 px-4 text-[15px]',
        size === 'lg' && 'min-h-[52px] px-5 text-base',
        variant === 'primary' && 'btn-gold',
        variant === 'secondary' &&
          'border border-line-strong bg-surface-solid/60 text-ink hover:bg-surface-2',
        variant === 'ghost' && 'text-ink hover:bg-surface-2',
        variant === 'danger' && 'border border-danger/40 text-danger hover:bg-danger/10',
        variant === 'dark' && 'border border-white/30 bg-black/25 text-white hover:bg-black/40',
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={18} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  )
})

/* ---------------- Chip ---------------- */
export function Chip({
  selected,
  onClick,
  children,
  size = 'md',
  className,
  highlight,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  size?: 'sm' | 'md'
  className?: string
  highlight?: boolean
}) {
  // Plain element + CSS press effect: hundreds of chips stay cheap to render and tap.
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? !!selected : undefined}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium transition-[color,background-color,border-color,transform] duration-150',
        onClick && 'active:scale-[0.94]',
        size === 'md' ? 'min-h-9 px-3.5 text-[13px]' : 'min-h-7 px-2.5 text-xs',
        onClick && size === 'md' && 'min-h-10',
        selected
          ? 'border-gold bg-gold/15 text-ink'
          : highlight
            ? 'border-gold/60 bg-gold/10 text-gold-ink'
            : 'border-line bg-surface-2 text-ink-muted',
        onClick && !selected && 'hover:border-line-strong hover:text-ink',
        className,
      )}
    >
      {selected && onClick && <Check size={13} strokeWidth={2.5} className="text-gold-deep" aria-hidden />}
      {children}
    </Comp>
  )
}

export function Badge({
  children,
  tone = 'gold',
  className,
}: {
  children: ReactNode
  tone?: 'gold' | 'success' | 'danger' | 'warning' | 'muted' | 'dark'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        tone === 'gold' && 'border border-gold/35 bg-gold/15 text-gold-ink',
        tone === 'success' && 'bg-success/15 text-success',
        tone === 'danger' && 'bg-danger/12 text-danger',
        tone === 'warning' && 'bg-warning/15 text-warning',
        tone === 'muted' && 'border border-line bg-surface-2 text-ink-muted',
        tone === 'dark' && 'bg-black/40 text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ---------------- Form fields ---------------- */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  optional,
}: {
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
  htmlFor?: string
  optional?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center justify-between text-[13px] font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-ink-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const controlCls =
  'w-full min-h-11 rounded-[14px] border border-line bg-surface-solid/80 px-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(controlCls, className)} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(controlCls, 'min-h-28 py-3 leading-relaxed', className)} {...rest} />
  },
)

export function Select({
  className,
  children,
  placeholder,
  compact,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string; compact?: boolean }) {
  return (
    <div className="relative">
      <select className={cn(controlCls, 'appearance-none pr-10', compact && 'pl-2.5 pr-7', className)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown
        size={18}
        className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted', compact ? 'right-2' : 'right-3')}
        aria-hidden
      />
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1 text-sm text-ink">
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 appearance-none rounded-md border border-line-strong bg-surface-solid transition checked:border-gold checked:bg-gold"
        />
        <Check size={14} strokeWidth={3} className="pointer-events-none relative text-on-gold opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
        checked ? 'border-gold bg-gold' : 'border-line-strong bg-surface-2',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-[22px] rounded-full bg-white shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

/* ---------------- Segmented tabs ---------------- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  className?: string
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div role="tablist" className={cn('relative flex rounded-[14px] border border-line bg-surface-2 p-1', className)}>
      {/* Sliding pill: pure CSS transform, never measures the page */}
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-[11px] bg-gradient-to-b from-gold-light to-gold shadow-sm transition-transform duration-200 ease-out will-change-transform"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative flex-1 rounded-[11px] px-3 py-2 text-[13px] font-semibold transition-colors duration-200',
            value === o.value ? 'text-on-gold' : 'text-ink-muted hover:text-ink',
          )}
        >
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------------- Top bar ---------------- */
export function TopBar({
  title,
  back,
  right,
  large,
  className,
}: {
  title?: ReactNode
  back?: boolean | string
  right?: ReactNode
  large?: boolean
  className?: string
}) {
  const nav = useNavigate()
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex min-h-14 items-center gap-2 bg-bg/95 px-4 pt-[env(safe-area-inset-top)]',
        className,
      )}
    >
      {back && (
        <button
          onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}
          aria-label="Back"
          className="-ml-2 grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2"
        >
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
      )}
      {title && (
        <h1 className={cn('flex-1 truncate font-serif text-ink', large ? 'text-[28px]' : 'text-xl')}>
          {title}
        </h1>
      )}
      {!title && <div className="flex-1" />}
      {right}
    </header>
  )
}

/* ---------------- Bottom sheet ---------------- */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-[28px] border border-line bg-bg-elevated shadow-deep"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line-strong" />
            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <h2 className="font-serif text-xl">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- States ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />
}

export function ListSkeleton({ rows = 5, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-[20px] border border-line p-3">
          {avatar && <Skeleton className="size-12 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="relative mb-5 grid size-20 place-items-center rounded-full border border-line bg-surface-2">
        <div className="absolute inset-2 rounded-full border border-dashed border-gold/40" />
        <Icon size={30} strokeWidth={1.4} className="text-gold-deep" aria-hidden />
      </div>
      <h3 className="font-serif text-xl">{title}</h3>
      {body && <p className="mt-1.5 max-w-64 text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center" role="alert">
      <div className="mb-5 grid size-20 place-items-center rounded-full border border-danger/25 bg-danger/8">
        <RotateCw size={28} strokeWidth={1.5} className="text-danger" aria-hidden />
      </div>
      <h3 className="font-serif text-xl">Network error</h3>
      <p className="mt-1.5 text-sm text-ink-muted">Something went wrong. Please try again.</p>
      {onRetry && (
        <Button className="mt-5 min-w-36" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-center justify-between">
      <h2 className="micro-label">{children}</h2>
      {action}
    </div>
  )
}
