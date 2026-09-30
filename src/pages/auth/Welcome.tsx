import { useNavigate } from 'react-router-dom'
import { AgeNote, LogoMark } from '@/components/brand'
import { Button } from '@/components/ui'

// Slowly rising embers (fixed positions: no layout work, pure CSS animation).
const EMBERS = [
  [8, 0, 14], [18, 3, 11], [27, 7, 16], [39, 1, 13], [52, 5, 15], [61, 9, 12], [72, 2, 17], [83, 6, 14], [92, 4, 12],
]

export default function Welcome() {
  const nav = useNavigate()
  return (
    <div className="welcome-bg relative flex min-h-dvh flex-1 flex-col overflow-hidden text-white lg:min-h-0">
      {/* Background: espresso gradient, gold rings echoing the logo, drifting smoke, embers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="smoke absolute -left-16 top-[12%] h-72 w-72 rounded-full bg-white/10" />
        <div className="smoke absolute -right-20 top-[48%] h-80 w-64 rounded-full bg-[#f6e3c8]/10 [animation-delay:-6s]" />
        <div className="smoke absolute bottom-[6%] left-[20%] h-56 w-72 rounded-full bg-white/[.07] [animation-delay:-11s]" />
        {EMBERS.map(([left, delay, dur], i) => (
          <span
            key={i}
            className="welcome-ember absolute bottom-[-10px] size-1.5 rounded-full bg-[#F2C57C]"
            style={{ left: `${left}%`, animationDelay: `${-delay}s`, animationDuration: `${dur}s` }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Centered brand + the two buttons */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-7 pb-6 pt-[max(24px,env(safe-area-inset-top))]">
        <div className="welcome-in flex w-full max-w-[340px] flex-col items-center text-center">
          <div className="relative">
            {/* glow + gold rings centered on the logo, echoing its circular frame */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(231,180,104,.3),transparent_62%)]" aria-hidden />
            {[210, 290, 380, 480].map((d, i) => (
              <div
                key={d}
                aria-hidden
                className="welcome-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E7B468]"
                style={{ width: d, height: d, opacity: 0.3 - i * 0.06, animationDelay: `${i * -2.5}s` }}
              />
            ))}
            <LogoMark size={132} className="relative shadow-[0_0_0_6px_rgba(231,180,104,.18),0_18px_50px_-12px_rgba(0,0,0,.7)]" />
          </div>
          <h1 className="mt-6 font-serif text-[42px] leading-none text-[#F6EBD7]">Daily Stogie</h1>
          <p className="mt-3 text-[15px] text-white/75">Find your circle. Share the smoke.</p>
          <div className="my-7 flex w-24 items-center gap-2" aria-hidden>
            <span className="h-px flex-1 bg-[#E7B468]/50" />
            <span className="size-1.5 rotate-45 bg-[#E7B468]" />
            <span className="h-px flex-1 bg-[#E7B468]/50" />
          </div>
          <div className="w-full space-y-3">
            <Button size="lg" block onClick={() => nav('/signup')}>
              Sign Up
            </Button>
            <Button size="lg" variant="dark" block onClick={() => nav('/login')}>
              Log In
            </Button>
          </div>
          <p className="mt-6 font-serif text-[17px] italic text-[#EBC475]">Good Cigars. Better Company.</p>
        </div>
      </div>

      <div className="relative pb-[max(18px,env(safe-area-inset-bottom))]">
        <AgeNote light />
        <p className="mt-1.5 text-center text-[10px] text-white/35">Version {__BUILD_ID__}</p>
      </div>
    </div>
  )
}
