import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AgeNote, LogoMark } from '@/components/brand'
import { Button } from '@/components/ui'

export default function Welcome() {
  const nav = useNavigate()
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#140d08] text-white lg:min-h-0">
      {/* CSS-only moody lounge scene */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_18%,rgba(242,172,84,.55),transparent_45%),radial-gradient(ellipse_at_10%_70%,rgba(160,82,30,.45),transparent_50%),linear-gradient(180deg,#3a2414_0%,#1c120b_55%,#0e0906_100%)]" />
        <div className="smoke absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-white/10" />
        <div className="smoke absolute right-[-10%] top-[40%] h-80 w-64 rounded-full bg-[#f6e3c8]/10 [animation-delay:-6s]" />
        <div className="smoke absolute bottom-[20%] left-[30%] h-56 w-72 rounded-full bg-white/8 [animation-delay:-11s]" />
        {/* bokeh */}
        {[
          ['12%', '14%', 10], ['82%', '9%', 14], ['64%', '28%', 6], ['22%', '38%', 8], ['90%', '46%', 9],
        ].map(([l, t, s], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#f5c07a] blur-[3px]"
            style={{ left: l, top: t, width: Number(s), height: Number(s), opacity: 0.45 }}
          />
        ))}
        {/* glass + cigar silhouette */}
        <svg viewBox="0 0 400 300" className="absolute bottom-[26%] left-1/2 w-[120%] -translate-x-1/2 opacity-90">
          <defs>
            <linearGradient id="w-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3c27a" stopOpacity=".2" />
              <stop offset=".5" stopColor="#c9771f" stopOpacity=".75" />
              <stop offset="1" stopColor="#6a3610" stopOpacity=".9" />
            </linearGradient>
            <linearGradient id="w-cigar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a5a32" />
              <stop offset="1" stopColor="#3b2210" />
            </linearGradient>
            <filter id="w-soft"><feGaussianBlur stdDeviation="1.2" /></filter>
          </defs>
          <ellipse cx="200" cy="262" rx="190" ry="22" fill="#000" opacity=".45" />
          <path d="M258 150h70l-8 110h-54z" fill="url(#w-glass)" stroke="#f5d29a" strokeOpacity=".35" />
          <path d="M262 200h62" stroke="#f9dcaa" strokeOpacity=".5" />
          <g filter="url(#w-soft)">
            <rect x="40" y="228" width="210" height="20" rx="10" fill="url(#w-cigar)" transform="rotate(-6 145 238)" />
            <rect x="170" y="222" width="26" height="20" fill="#b8862f" transform="rotate(-6 145 238)" />
            <circle cx="42" cy="249" r="6" fill="#ff7a2a" opacity=".85" />
          </g>
          <path d="M44 240c-14-30 18-40 2-72s12-44 0-70" stroke="#fff" strokeOpacity=".18" strokeWidth="6" fill="none" filter="url(#w-soft)" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0c0805] via-[#0c0805]/85 to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(56px,env(safe-area-inset-top))]">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0.35, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <LogoMark size={64} />
          <h1 className="mt-3 font-serif text-[44px] leading-none text-[#F6EBD7] drop-shadow">Daily Stogie</h1>
          <p className="mt-3 text-[15px] text-white/80">Find your circle. Share the smoke.</p>
        </motion.div>

        <div className="flex-1" />

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0.35, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <p className="pb-2 text-center font-serif text-lg italic text-[#EBC475]">Good Cigars. Better Company.</p>
          <Button size="lg" block onClick={() => nav('/signup')}>
            Sign Up
          </Button>
          <Button size="lg" variant="dark" block onClick={() => nav('/login')}>
            Log In
          </Button>
          <AgeNote light className="pt-3" />
        </motion.div>
      </div>
    </div>
  )
}
