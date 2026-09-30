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

