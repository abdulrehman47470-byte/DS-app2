import { motion } from 'framer-motion'
import { Camera, Check, Clock, ImagePlus, ScrollText, Sparkles, UserRound, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Checkbox, TopBar } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'
import { StepHeader } from './Verify'

// TODO(docs): replace with the exact Code of Ethics summary from the client's document.
const ETHICS = [
  'Respect all members',
  'Promote a positive and inclusive community',
  'No harassment or discrimination',
  'Follow all local laws and regulations',
  'Keep the community safe and enjoyable',
  'Never sell, advertise or solicit tobacco on the platform',
  'Meet in public places, such as licensed cigar lounges',
  'Use genuine, recent photos of yourself only',
]

export function Ethics() {
  const nav = useNavigate()
  const { state, set } = useApp()
  const [agreed, setAgreed] = useState(state.ethicsAgreed)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/verify/identity" />
      <StepHeader step={3} />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-gold/15 text-gold-deep">
            <ScrollText size={22} strokeWidth={1.5} />
          </span>
          <h1 className="font-serif text-[30px] leading-tight">Stogie Ethics</h1>
        </div>
        <div className="card mt-6 max-h-[46dvh] overflow-y-auto p-5" tabIndex={0} aria-label="Code of Ethics summary">
          <h2 className="font-serif text-lg">The Daily Stogie Code of Ethics</h2>
          <p className="mt-2 text-sm text-ink-muted">
            As a member of Daily Stogie, I agree to uphold the following principles:
          </p>
          <ul className="mt-4 space-y-3">
            {ETHICS.map((e) => (
              <li key={e} className="flex gap-3 text-[15px]">
                <Check size={18} className="mt-0.5 shrink-0 text-gold-deep" /> {e}
              </li>
            ))}
          </ul>
          <Link to="/legal/ethics" className="mt-5 inline-block text-sm font-semibold text-gold-ink underline">
            Read the full Code of Ethics
          </Link>
        </div>

        <div className="mt-5">
          <Checkbox checked={agreed} onChange={setAgreed}>
            I agree to the Daily Stogie Code of Ethics, and I accept the{' '}
            <Link to="/legal/terms" className="font-medium text-gold-ink underline">Terms & Conditions</Link> and{' '}
            <Link to="/legal/privacy" className="font-medium text-gold-ink underline">Privacy Policy</Link>.
          </Checkbox>
        </div>
        <div className="flex-1" />
        <Button
          size="lg"
          block
          disabled={!agreed}
          className="mt-6"
          onClick={() => {
            set({ ethicsAgreed: true })
            nav('/photo')
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

/** Downscale to keep the local preview small (Phase 2 does real compression + upload). */
function toSmallDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 720
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * s
      c.height = img.height * s
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.82))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('unsupported'))
    img.src = URL.createObjectURL(file)
  })
}

const RULES: [string, boolean][] = [
  ['Genuine and recent', true],
  ['No explicit or suggestive content', false],
  ['No logos or advertisements', false],
  ['No stock images', false],
]

export function PhotoUpload() {
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!/^image\/(jpeg|png|webp|heic)$/.test(f.type)) return setError('Please choose a JPG, PNG or WebP image.')
    if (f.size > 10 * 1024 * 1024) return setError('That photo is over 10 MB. Please choose a smaller one.')
    setError(undefined)
    try {
      set({ photo: await toSmallDataUrl(f), photoStatus: 'pending' })
      toast('Photo added. It will be reviewed shortly.')
    } catch {
      setError('We couldn’t read that image. Try another one.')
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/ethics" />
      <StepHeader step={4} />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <h1 className="font-serif text-[30px] leading-tight">Upload Photo</h1>
        <p className="mt-1.5 text-sm text-ink-muted">A clear photo of you is required to use Daily Stogie.</p>

        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="relative mx-auto mt-7 size-40 rounded-full"
          aria-label={state.photo ? 'Change profile photo' : 'Add profile photo'}
        >
          <span className="block size-full overflow-hidden rounded-full border-2 border-dashed border-line-strong bg-surface-2">
            {state.photo ? (
              <img src={state.photo} alt="Your profile photo" className="size-full object-cover" />
            ) : (
              <UserRound size={72} strokeWidth={1} className="mx-auto mt-8 text-ink-faint" />
            )}
          </span>
          <span className="absolute bottom-1 right-1 grid size-11 place-items-center rounded-full border-4 border-bg bg-[#2A1B0E] text-[#F6EBD7]">
            <Camera size={18} />
          </span>
        </button>
        <p className="mt-3 text-center text-sm text-ink-muted">
          {state.photo ? (
            <span className="inline-flex items-center gap-1.5 text-warning">
              <Clock size={15} /> Pending review: only you can see it for now
            </span>
          ) : (
            'Profile photo is required'
          )}
        </p>
        {error && <p className="mt-2 text-center text-sm text-danger" role="alert">{error}</p>}

        <div className="card mt-6 p-4">
          <h2 className="text-sm font-semibold">Photo rules</h2>
          <ul className="mt-3 space-y-2.5">
            {RULES.map(([r, ok]) => (
              <li key={r} className="flex items-center gap-2.5 text-sm">
                <span className={cn('grid size-5 place-items-center rounded-full', ok ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger')}>
                  {ok ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} />

        <div className="flex-1" />
        <div className="mt-6 space-y-3">
          {state.photo ? (
            <Button size="lg" block onClick={() => nav('/subscribe')}>Continue</Button>
          ) : (
            <Button size="lg" block icon={ImagePlus} onClick={() => uploadRef.current?.click()}>Upload Photo</Button>
          )}
          <Button size="lg" variant="secondary" block icon={Camera} onClick={() => cameraRef.current?.click()}>
            Take Photo
          </Button>
        </div>
      </div>
    </div>
  )
}

const PLANS = [
  { id: 'monthly' as const, name: 'Monthly', price: '$1.99', per: '/ month', note: 'Billed monthly' },
  { id: 'yearly' as const, name: 'Yearly', price: '$19.99', per: '/ year', note: 'Billed once a year' },
]

export function Subscribe({ settings }: { settings?: boolean }) {
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>(state.plan ?? 'yearly')
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back={settings ? '/settings' : '/photo'} title={settings ? 'Subscription' : undefined} />
      {!settings && <StepHeader step={5} />}
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        {!settings && <h1 className="font-serif text-[30px] leading-tight">Choose your membership</h1>}
        <p className="mt-1.5 text-sm text-ink-muted">
          {settings && state.plan
            ? `You're on the ${state.plan} plan.`
            : 'One simple membership. Full access to Daily Stogie.'}
        </p>

        <div role="radiogroup" aria-label="Plan" className="mt-6 space-y-3">
          {PLANS.map((p) => {
            const on = plan === p.id
            return (
              <motion.button
                key={p.id}
                role="radio"
                aria-checked={on}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPlan(p.id)}
                className={cn(
                  'relative w-full rounded-[20px] border p-5 text-left transition',
                  on ? 'border-gold bg-gold/12 shadow-soft' : 'border-line bg-surface',
                )}
              >
                {p.id === 'yearly' && (
                  <Badge className="absolute -top-2.5 right-4">
                    <Sparkles size={11} /> Best value · Save 16%
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-muted">{p.name}</p>
                    <p className="mt-1 font-serif text-[34px] leading-none">
                      {p.price} <span className="font-sans text-sm text-ink-muted">{p.per}</span>
                    </p>
                    <p className="mt-2 text-xs text-ink-muted">{p.note}</p>
                  </div>
                  <span className={cn('grid size-6 place-items-center rounded-full border-2', on ? 'border-gold bg-gold text-on-gold' : 'border-line-strong')}>
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* TODO(client): confirm membership benefit copy. Only client-specified features listed. */}
        <ul className="mt-6 space-y-2.5">
          {['Profile-based matching', 'Instant messaging with your matches', 'Mentor connections', 'Stogie Search, Sessions & Blog'].map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm">
              <Check size={16} className="text-gold-deep" /> {b}
            </li>
          ))}
        </ul>

        <div className="flex-1" />
        <p className="mt-6 text-center text-xs text-ink-muted">
          Subscriptions renew automatically until cancelled. See{' '}
          <Link to="/legal/terms" className="text-gold-ink underline">Terms</Link> for billing and refunds.
        </p>
        <Button
          size="lg"
          block
          className="mt-3"
          onClick={() => {
            set({ plan })
            toast('Payment placeholder: Stripe arrives in Phase 6')
            nav(settings ? '/settings' : '/onboarding/1')
          }}
        >
          {settings ? 'Update plan' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  )
}
