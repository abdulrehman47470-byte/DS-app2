import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle, CircleDot, IdCard, Lock, ScanFace, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AgeNote, Portrait } from '@/components/brand'
import { ProgressBar } from '@/components/layout'
import { Button, Checkbox, Segmented, Select, TopBar } from '@/components/ui'
import { ageFromDob, MIN_AGE } from '@/lib/age'
import { cn } from '@/lib/cn'
import { useApp, type VerifyStatus } from '@/lib/store'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Sign-up progress shown on every onboarding gate. */
export function StepHeader({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <div className="px-6">
      <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
        <span className="micro-label">Step {step} of {total}</span>
      </div>
      <ProgressBar value={(step / total) * 100} label="Sign-up progress" />
    </div>
  )
}

export function AgeVerification() {
  const nav = useNavigate()
  const { state, set } = useApp()
  const init = state.dob ? new Date(state.dob) : null
  const [m, setM] = useState(init ? String(init.getMonth()) : '')
  const [d, setD] = useState(init ? String(init.getDate()) : '')
  const [y, setY] = useState(init ? String(init.getFullYear()) : '')
  const thisYear = new Date().getFullYear()
  const dob = m && d && y ? new Date(Number(y), Number(m), Number(d)) : null
  const age = dob ? ageFromDob(dob) : null
  const ok = age !== null && age >= MIN_AGE

  const next = () => {
    if (!dob) return
    set({ dob: dob.toISOString() })
    nav(ok ? '/verify/identity' : '/verify/not-eligible')
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/signup" />
      <StepHeader step={1} />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <h1 className="font-serif text-[32px] leading-tight">Age Verification</h1>
        <p className="mt-2 text-[15px] text-ink-muted">You must be at least 21 years old to join Daily Stogie.</p>

        <fieldset className="card mt-8 p-4">
          <legend className="sr-only">Date of birth</legend>
          <p className="mb-3 text-[13px] font-medium">Date of Birth</p>
          <div className="grid grid-cols-[1.1fr_0.9fr_1.2fr] gap-2">
            <Select compact aria-label="Month" value={m} onChange={(e) => setM(e.target.value)} placeholder="Month">
              {MONTHS.map((mo, i) => (
                <option key={mo} value={i}>{mo}</option>
              ))}
            </Select>
            <Select compact aria-label="Day" value={d} onChange={(e) => setD(e.target.value)} placeholder="Day">
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
            <Select compact aria-label="Year" value={y} onChange={(e) => setY(e.target.value)} placeholder="Year">
              {Array.from({ length: 100 }, (_, i) => thisYear - 18 - i).map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </Select>
          </div>
        </fieldset>

        <div aria-live="polite" className="min-h-14">
          <AnimatePresence>
            {age !== null && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('mt-4 flex items-center gap-2 text-sm font-medium', ok ? 'text-success' : 'text-danger')}
              >
                {ok ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                You are {age} years old
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="text-xs text-ink-muted">
          Your date of birth is checked on our servers and is never shown on your profile.
        </p>
        <div className="flex-1" />
        <Button size="lg" block disabled={!dob} onClick={next} className="mt-8">
          Continue
        </Button>
        <AgeNote className="mt-4" />
      </div>
    </div>
  )
}

export function NotEligible() {
  const nav = useNavigate()
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,color-mix(in_srgb,var(--gold)_18%,transparent),transparent_60%)]" />
      <TopBar back="/verify/age" />
      <div className="relative flex flex-1 flex-col items-center px-8 pb-10 pt-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="grid size-28 place-items-center rounded-full btn-gold"
        >
          <Lock size={44} strokeWidth={1.5} />
        </motion.div>
        <h1 className="mt-8 font-serif text-[32px]">You’re Not Eligible</h1>
        <p className="mt-3 max-w-72 text-[15px] text-ink-muted">
          Daily Stogie is a 21+ community. You must be at least 21 years old to join.
        </p>
        <p className="mt-4 max-w-72 text-xs text-ink-muted">
          We don’t keep your details beyond what the law requires.
        </p>
        <div className="flex-1" />
        <Button variant="secondary" size="lg" block onClick={() => nav('/verify/age')}>
          Go Back
        </Button>
        <AgeNote className="mt-5" />
      </div>
    </div>
  )
}

const STATUSES: VerifyStatus[] = ['Not Started', 'Pending', 'Verified', 'Failed']

export function IdentityVerification() {
  const nav = useNavigate()
  const { state, set } = useApp()
  const [tab, setTab] = useState<'face' | 'id'>('face')
  const [consent, setConsent] = useState(state.verifyStatus !== 'Not Started')
  const [camOn, setCamOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const status = state.verifyStatus

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamOn(false)
  }
  useEffect(() => stopCam, [])

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = s
      setCamOn(true)
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      })
    } catch {
      setCamOn(false)
    }
  }

  const capture = () => {
    // Phase 2 swaps this for FreeFaceCheckProvider. The selfie is never stored.
    stopCam()
    set({ verifyStatus: 'Pending' })
    setTimeout(() => set({ verifyStatus: 'Verified' }), 1800)
  }

  const statusIcon = useMemo(
    () => ({
      'Not Started': <Circle size={18} className="text-ink-faint" />,
      Pending: <CircleDot size={18} className="text-warning" />,
      Verified: <CheckCircle2 size={18} className="text-success" />,
      Failed: <XCircle size={18} className="text-danger" />,
    }),
    [],
  )

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/verify/age" />
      <StepHeader step={2} />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <h1 className="font-serif text-[30px] leading-tight">Identity Verification</h1>
        <p className="mt-1.5 text-sm text-ink-muted">A quick selfie keeps Daily Stogie real and safe.</p>

        <Segmented
          className="mt-5"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'face', label: <span className="inline-flex items-center gap-1.5"><ScanFace size={15} /> Face Recognition</span> },
            { value: 'id', label: <span className="inline-flex items-center gap-1.5"><IdCard size={15} /> ID Verification</span> },
          ]}
        />

        {tab === 'face' ? (
          <>
            <div className="relative mx-auto mt-6 size-56">
              {/* corner brackets */}
              {['left-0 top-0 border-l-2 border-t-2 rounded-tl-3xl', 'right-0 top-0 border-r-2 border-t-2 rounded-tr-3xl', 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-3xl', 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-3xl'].map((c) => (
                <span key={c} className={cn('absolute size-10 border-gold', c)} />
              ))}
              <div className="absolute inset-4 overflow-hidden rounded-full border border-line bg-surface-2">
                {camOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />
                ) : (
                  <Portrait tone={28} initials="" showInitials={false} />
                )}
                {status === 'Pending' && (
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-gold shadow-[0_0_16px_var(--gold)]"
                    animate={{ top: ['8%', '90%', '8%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
            </div>
            <p className="mt-3 text-center text-sm font-medium text-gold-ink">
              {camOn ? 'Center your face, then capture' : 'Take a selfie for verification'}
            </p>

            <ul className="card mt-5 divide-y divide-line px-4" aria-live="polite">
              {STATUSES.map((s) => (
                <li key={s} className={cn('flex items-center gap-3 py-2.5 text-sm', status === s ? 'font-semibold text-ink' : 'text-ink-muted')}>
                  {status === s ? statusIcon[s] : <Circle size={18} className="text-line-strong" />}
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <Checkbox checked={consent} onChange={setConsent}>
                I consent to a one-time biometric photo check. My selfie is compared with my profile photo, then
                deleted immediately. Only the pass/fail result is kept.{' '}
                <a href="/legal/privacy" className="font-medium text-gold-ink underline">Privacy notice</a>
              </Checkbox>
            </div>
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-muted">
              This check confirms your photo is really you. It does not verify your age or ID.
            </p>
          </>
        ) : (
          <div className="card mt-6 flex flex-col items-center p-6 text-center">
            <IdCard size={40} strokeWidth={1.3} className="text-gold-deep" />
            <h2 className="mt-3 font-serif text-xl">ID Verification</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Government ID and age checks through a verification partner are coming soon.
            </p>
            <span className="mt-3 rounded-full border border-line px-3 py-1 text-xs text-ink-muted">Coming later</span>
          </div>
        )}

        <div className="flex-1" />
        <div className="mt-6 space-y-3">
          {status === 'Verified' ? (
            <Button size="lg" block onClick={() => nav('/ethics')}>
              Continue
            </Button>
          ) : tab === 'face' ? (
            camOn ? (
              <Button size="lg" block onClick={capture}>Capture</Button>
            ) : (
              <>
                <Button size="lg" block disabled={!consent || status === 'Pending'} onClick={startCam}>
                  {status === 'Pending' ? 'Checking…' : 'Open camera'}
                </Button>
                <Button variant="ghost" block disabled={!consent || status === 'Pending'} onClick={capture}>
                  Simulate capture (demo)
                </Button>
              </>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
