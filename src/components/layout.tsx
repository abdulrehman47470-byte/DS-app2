import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Heart, MessageCircle, Flame, UserRound } from 'lucide-react'
import { Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import { LogoMark, Wordmark } from './brand'

const TABS = [
  { to: '/discover', label: 'Discover', icon: Flame },
  { to: '/mentors', label: 'Mentors', icon: GraduationCap },
  { to: '/matches', label: 'Matches', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-full border border-gold/40 bg-[#2A1B0E] px-4 py-2 text-sm text-[#F6EBD7] shadow-deep"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Centered 430px phone column. Desktop sees it over the textured background. */
export function Column({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'app-column relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col lg:my-6 lg:min-h-[calc(100dvh-48px)] lg:overflow-hidden lg:rounded-[32px] lg:border lg:border-line lg:shadow-deep',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AuthLayout() {
  const loc = useLocation()
  return (
    <Column>
      {/* CSS slide-in on each screen. It never starts from invisible, so a screen whose code
          arrives late can't get stuck blank (the old JS fade did on slow networks). */}
      <div key={loc.pathname} className="page-enter flex flex-1 flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </div>
    </Column>
  )
}

export function AppShell() {
  const loc = useLocation()
  const hideTabs = /^\/messages\/.+/.test(loc.pathname)
  return (
    <div className="lg:flex lg:items-start lg:justify-center lg:gap-6">
      {/* Desktop side rail: same 5 destinations */}
      <nav aria-label="Main" className="sticky top-6 hidden w-56 flex-col gap-1 pt-2 lg:mt-6 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-3">
          <LogoMark size={36} />
          <Wordmark className="text-2xl" />
        </div>
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] font-medium transition',
                isActive ? 'bg-gold/15 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <t.icon size={20} strokeWidth={1.5} className={isActive ? 'text-gold-deep' : ''} />
                {t.label}
              </>
            )}
          </NavLink>
        ))}
        <p className="mt-8 px-3 font-serif text-sm italic text-ink-muted">Good Cigars. Better Company.</p>
      </nav>

      <Column className="lg:mx-0">
        <main className={cn('flex flex-1 flex-col', !hideTabs && 'pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-4')}>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
        {!hideTabs && (
          <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-line bg-bg-elevated/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
          >
            <ul className="flex">
              {TABS.map((t) => (
                <li key={t.to} className="flex-1">
                  <NavLink
                    to={t.to}
                    className={({ isActive }) =>
                      cn(
                        'relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium',
                        isActive ? 'text-gold-ink' : 'text-ink-muted',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span layoutId="tab-dot" className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />
                        )}
                        <t.icon size={22} strokeWidth={1.5} className={isActive ? 'text-gold-deep' : ''} aria-hidden />
                        {t.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Column>
      <div className="hidden w-56 lg:block" aria-hidden />
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep"
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading">
      <div className="skeleton h-10 w-1/2 rounded-xl" />
      <div className="skeleton h-40 rounded-[20px]" />
      <div className="skeleton h-20 rounded-[20px]" />
    </div>
  )
}
