import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Original mark: a tobacco leaf wrapped by a cigar band. */
export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-light)" />
          <stop offset="0.55" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--gold-deep)" />
        </linearGradient>
      </defs>
      <path
        d="M32 5c11 8.5 17 19.5 17 30.5C49 46 42 54.5 32 59 22 54.5 15 46 15 35.5 15 24.5 21 13.5 32 5z"
        fill={`url(#${id}l)`}
      />
      <path d="M32 9v48" stroke="var(--on-gold)" strokeOpacity=".55" strokeWidth="1.4" />
      {[20, 27, 34, 41, 48].map((y, i) => (
        <g key={y} stroke="var(--on-gold)" strokeOpacity=".35" strokeWidth="1.1" fill="none">
          <path d={`M32 ${y}q${-6 - i} -2 ${-10 - i} ${-6 + i * 0.5}`} />
          <path d={`M32 ${y}q${6 + i} -2 ${10 + i} ${-6 + i * 0.5}`} />
        </g>
      ))}
      <rect x="11" y="30" width="42" height="9" rx="2.5" fill="var(--on-gold)" />
      <rect x="12.5" y="31.5" width="39" height="6" rx="1.5" fill="none" stroke="var(--gold-light)" strokeWidth=".9" />
      <circle cx="32" cy="34.5" r="2.2" fill="var(--gold-light)" />
    </svg>
  )
}

export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('font-serif tracking-tight', light ? 'text-[#F6EBD7]' : 'text-ink', className)}>
      Daily Stogie
    </span>
  )
}

/* ---------- Generated portrait placeholders (no real people) ---------- */
const TONES = (h: number) => ({
  a: `hsl(${h} 45% 34%)`,
  b: `hsl(${h + 12} 38% 18%)`,
  glow: `hsl(${h + 8} 80% 62%)`,
  skin: `hsl(${h} 28% 12%)`,
})

export function Portrait({
  tone,
  initials,
  className,
  showInitials = true,
}: {
  tone: number
  initials: string
  className?: string
  showInitials?: boolean
}) {
  const id = useId()
  const t = TONES(tone)
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className={cn('block h-full w-full', className)} role="img" aria-label={`Portrait placeholder for ${initials}`}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </linearGradient>
        <radialGradient id={`${id}lamp`} cx="0.78" cy="0.2" r="0.55">
          <stop offset="0" stopColor={t.glow} stopOpacity=".75" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}rim`} cx="0.5" cy="0.35" r="0.5">
          <stop offset="0.6" stopColor={t.glow} stopOpacity="0" />
          <stop offset="1" stopColor={t.glow} stopOpacity=".35" />
        </radialGradient>
        <filter id={`${id}blur`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="300" height="400" fill={`url(#${id}bg)`} />
      <rect width="300" height="400" fill={`url(#${id}lamp)`} />
      {/* bokeh */}
      <g filter={`url(#${id}blur)`} opacity=".5">
        <circle cx="40" cy="70" r="22" fill={t.glow} opacity=".35" />
        <circle cx="250" cy="150" r="16" fill={t.glow} opacity=".4" />
        <circle cx="90" cy="30" r="10" fill="#fff" opacity=".2" />
      </g>
      {/* smoke */}
      <path d="M205 210c10-30-18-40-4-70s-6-50 8-70" stroke="#fff" strokeOpacity=".12" strokeWidth="10" fill="none" filter={`url(#${id}blur)`} />
      {/* silhouette */}
      <g fill={t.skin}>
        <ellipse cx="150" cy="170" rx="54" ry="64" />
        <path d="M150 238c-70 0-112 42-122 110v60h244v-60c-10-68-52-110-122-110z" />
        <rect x="128" y="215" width="44" height="40" rx="14" />
      </g>
      <ellipse cx="150" cy="170" rx="54" ry="64" fill={`url(#${id}rim)`} />
      {showInitials && (
        <text x="150" y="370" textAnchor="middle" fontFamily="Playfair Display, Georgia, serif" fontSize="44" fill="#fff" fillOpacity=".14" letterSpacing="4">
          {initials}
        </text>
      )}
    </svg>
  )
}

export function Avatar({
  tone,
  name,
  size = 48,
  ring,
  verified,
  src,
  className,
}: {
  tone: number
  name: string
  size?: number
  ring?: boolean
  verified?: boolean
  src?: string | null
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className={cn('relative inline-block shrink-0', className)} style={{ width: size, height: size }}>
      <span
        className={cn(
          'block size-full overflow-hidden rounded-full',
          ring && 'p-[2px] bg-gradient-to-br from-gold-light via-gold to-gold-deep',
        )}
      >
        <span className="block size-full overflow-hidden rounded-full border border-black/10 bg-surface-2">
          {src ? (
            <img src={src} alt={name} className="size-full object-cover" />
          ) : (
            <Portrait tone={tone} initials={initials} showInitials={false} />
          )}
        </span>
      </span>
      {verified && (
        <BadgeCheck
          size={Math.max(14, size * 0.3)}
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-bg fill-info text-white"
          aria-label="Photo verified"
        />
      )}
    </span>
  )
}

/* ---------- Rings ---------- */
export function MatchRing({ value, size = 56, onPhoto }: { value: number; size?: number; onPhoto?: boolean }) {
  const r = size / 2 - 4
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }} aria-label={`${value}% match`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={onPhoto ? 'rgba(255,255,255,.2)' : 'var(--line)'} strokeWidth="3.5" fill={onPhoto ? 'rgba(20,12,6,.45)' : 'none'} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--gold)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className={cn('absolute inset-0 grid place-items-center leading-none', onPhoto ? 'text-white' : 'text-ink')}>
        <div className="text-center">
          <div className="font-serif text-[15px] font-semibold">{value}%</div>
          <div className="text-[8px] font-semibold uppercase tracking-widest opacity-80">match</div>
        </div>
      </div>
    </div>
  )
}

export function CompletenessRing({ value, size = 104, children }: { value: number; size?: number; children: ReactNode }) {
  const r = size / 2 - 3
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth="3" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--gold)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-[7px]">{children}</div>
    </div>
  )
}

/* ---------- Ornaments ---------- */
export function BandDivider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('my-6 flex items-center gap-3', className)} aria-hidden={!label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line-strong" />
      <span className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-3 py-1">
        <span className="size-1 rounded-full bg-gold" />
        {label && <span className="micro-label !text-[10px] !text-gold-ink">{label}</span>}
        <span className="size-1 rounded-full bg-gold" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line-strong" />
    </div>
  )
}

export function SafetyBanner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-2xl border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-[13px] text-ink', className)}>
      <ShieldCheck size={18} strokeWidth={1.6} className="shrink-0 text-gold-deep" aria-hidden />
      Meet in public places like licensed cigar lounges.
    </div>
  )
}

export function AgeNote({ className, light }: { className?: string; light?: boolean }) {
  return (
    <p className={cn('flex items-center justify-center gap-2 text-xs', light ? 'text-white/70' : 'text-ink-muted', className)}>
      <span className="rounded-full bg-danger px-1.5 py-px text-[10px] font-bold text-white">21+</span>
      Members only. You must be 21 or older.
    </p>
  )
}

export function UserTypeBadge({ type, onPhoto }: { type: string; onPhoto?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-px text-[11px] font-semibold',
        onPhoto ? 'border-white/30 bg-white/15 text-white backdrop-blur' : 'border-gold/50 bg-gold/12 text-gold-ink',
      )}
    >
      {type}
    </span>
  )
}
