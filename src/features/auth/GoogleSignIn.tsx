import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, UserRoundPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '@/components/brand'
import { cn } from '@/lib/cn'

/**
 * DEMO ONLY: a mock of the "Sign in with Google" popup so the flow can be reviewed before
 * real OAuth is connected in Phase 2 (Supabase Auth + Google OAuth client). Nothing is sent
 * to Google, no password is ever asked for, and it is labelled as a demo on screen.
 */

export interface MockGoogleAccount {
  name: string
  email: string
}

export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

const BLUE = '#0b57d0'
type Step = 'choose' | 'email' | 'consent' | 'loading'

function Initial({ name, size = 32 }: { name: string; size?: number }) {
  const hue = [...name].reduce((h, ch) => h + ch.charCodeAt(0), 0) % 360
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-medium text-white" style={{ width: size, height: size, background: `hsl(${hue} 45% 45%)`, fontSize: size * 0.45 }}>
      {name.trim()[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

export function GoogleSignIn({
  open,
  onClose,
  onSignedIn,
  suggested,
}: {
  open: boolean
  onClose: () => void
  onSignedIn: (a: MockGoogleAccount) => void
  suggested: MockGoogleAccount
}) {
  const [step, setStep] = useState<Step>('choose')
  const [account, setAccount] = useState<MockGoogleAccount>(suggested)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setStep('choose')
    setError(undefined)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (step === 'email') requestAnimationFrame(() => emailRef.current?.focus())
    if (step !== 'loading') return
    const t = setTimeout(() => onSignedIn(account), 900)
    return () => clearTimeout(t)
  }, [step, account, onSignedIn])

  const submitEmail = () => {
    const v = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(v)) return setError('Enter a valid email')
    const local = v.split('@')[0].replace(/[._-]+/g, ' ')
    setAccount({ email: v, name: local.replace(/\b\w/g, (c) => c.toUpperCase()) })
    setError(undefined)
    setStep('consent')
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 font-sans" role="dialog" aria-modal="true" aria-label="Sign in with Google (demo)">
          <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0.4, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="relative flex max-h-[92dvh] w-full max-w-[448px] flex-col overflow-hidden rounded-[28px] bg-white text-[#1f1f1f] shadow-2xl"
            style={{ colorScheme: 'light' }}
          >
            {/* indeterminate progress bar, like Google's */}
            <div className="h-1 overflow-hidden">{step === 'loading' && <div className="gsi-progress h-full w-1/3" style={{ background: BLUE }} />}</div>

            <div className="flex items-center gap-2 px-6 pt-4 text-[14px] text-[#444746]">
              <GoogleG size={20} /> Sign in with Google
              <span className="ml-auto rounded-full bg-[#fff4d6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">DEMO</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
              <div className="mb-5 flex items-center gap-3">
                <LogoMark size={36} />
                {step === 'consent' || step === 'loading' ? (
                  <button onClick={() => setStep('choose')} className="flex items-center gap-2 rounded-full border border-[#c4c7c5] py-1 pl-1 pr-3 text-[13px]">
                    <Initial name={account.name} size={22} /> {account.email} <ChevronDown size={14} />
                  </button>
                ) : null}
              </div>

              {step === 'choose' && (
                <>
                  <h2 className="text-[28px] leading-tight">Choose an account</h2>
                  <p className="mt-1 text-[16px]">to continue to <span style={{ color: BLUE }}>Daily Stogie</span></p>
                  <ul className="mt-6 border-t border-[#e3e3e3]">
                    <li>
                      <button onClick={() => { setAccount(suggested); setStep('consent') }} className="flex w-full items-center gap-3 border-b border-[#e3e3e3] px-1 py-3 text-left hover:bg-[#f2f2f2]">
                        <Initial name={suggested.name} />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium">{suggested.name}</span>
                          <span className="block truncate text-[12px] text-[#444746]">{suggested.email}</span>
                        </span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setStep('email')} className="flex w-full items-center gap-3 border-b border-[#e3e3e3] px-1 py-3 text-left text-[14px] font-medium hover:bg-[#f2f2f2]">
                        <span className="grid size-8 place-items-center rounded-full"><UserRoundPlus size={20} className="text-[#444746]" /></span>
                        Use another account
                      </button>
                    </li>
                  </ul>
                  <p className="mt-6 text-[12px] leading-relaxed text-[#444746]">
                    Before using this app, you can review Daily Stogie’s <span style={{ color: BLUE }}>privacy policy</span> and <span style={{ color: BLUE }}>terms of service</span>.
                  </p>
                </>
              )}

              {step === 'email' && (
                <form onSubmit={(e) => { e.preventDefault(); submitEmail() }}>
                  <h2 className="text-[28px] leading-tight">Sign in</h2>
                  <p className="mt-1 text-[16px]">to continue to <span style={{ color: BLUE }}>Daily Stogie</span></p>
                  <label className="relative mt-7 block">
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      aria-label="Email or phone"
                      className={cn('peer h-14 w-full rounded-[4px] border px-4 text-[16px] outline-none', error ? 'border-[#b3261e]' : 'border-[#747775] focus:border-2 focus:border-[#0b57d0]')}
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-[16px] text-[#444746] transition-all peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-[#0b57d0] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[12px]">
                      Email or phone
                    </span>
                  </label>
                  {error && <p className="mt-2 text-[12px] text-[#b3261e]">{error}</p>}
                  <p className="mt-4 text-[13px] text-[#444746]">Demo mode: no password is needed and nothing is sent to Google.</p>
                  <div className="mt-8 flex items-center justify-between">
                    <button type="button" onClick={() => setStep('choose')} className="rounded-full px-3 py-2 text-[14px] font-medium" style={{ color: BLUE }}>Back</button>
                    <button type="submit" className="rounded-full px-6 py-2.5 text-[14px] font-medium text-white" style={{ background: BLUE }}>Next</button>
                  </div>
                </form>
              )}

              {(step === 'consent' || step === 'loading') && (
                <>
                  <h2 className="text-[24px] leading-tight">Daily Stogie wants to access your Google Account</h2>
                  <p className="mt-5 text-[14px]">This will allow Daily Stogie to:</p>
                  <ul className="mt-3 space-y-3 text-[14px] text-[#444746]">
                    {['Associate you with your personal info on Google', 'See your personal info, including your name and profile picture', 'See your primary Google Account email address'].map((x) => (
                      <li key={x} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: BLUE }} />{x}</li>
                    ))}
                  </ul>
                  <p className="mt-6 text-[12px] leading-relaxed text-[#444746]">
                    Make sure you trust Daily Stogie. You can review its privacy policy and terms of service. You can always remove access in your Google Account.
                  </p>
                  <div className="mt-7 flex items-center justify-end gap-2">
                    <button onClick={onClose} disabled={step === 'loading'} className="rounded-full px-5 py-2.5 text-[14px] font-medium disabled:opacity-40" style={{ color: BLUE }}>Cancel</button>
                    <button onClick={() => setStep('loading')} disabled={step === 'loading'} className="rounded-full px-6 py-2.5 text-[14px] font-medium text-white disabled:opacity-60" style={{ background: BLUE }}>
                      {step === 'loading' ? 'Signing in…' : 'Continue'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#e3e3e3] px-6 py-3 text-[12px] text-[#444746]">
              <span>English (United States)</span>
              <span className="flex gap-4"><span>Help</span><span>Privacy</span><span>Terms</span></span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
