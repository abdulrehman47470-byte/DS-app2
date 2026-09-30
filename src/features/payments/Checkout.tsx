import { AnimatePresence, motion } from 'framer-motion'
import { Check, CreditCard, Lock, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/brand'
import { GoogleG } from '@/features/auth/GoogleSignIn'
import { cn } from '@/lib/cn'
import { keyboardProps } from '@/lib/forms'

/**
 * DEMO checkout (mock payment). Looks and behaves like a real hosted checkout, but nothing is
 * charged and no card data leaves the page or is stored: only the brand and last 4 digits are
 * kept for the receipt. Every field is optional so testers can always proceed.
 * Phase 6 replaces this with Stripe Checkout behind the same onPaid() contract.
 */

export interface PlanInfo {
  id: 'monthly' | 'yearly'
  name: string
  price: string
  per: string
}

export interface Receipt {
  receiptId: string
  brand: string
  last4: string
  amount: string
  paidAt: string
  renewsOn: string
}

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Mexico', 'Pakistan', 'United Arab Emirates', 'Australia', 'Other']

function cardBrand(num: string) {
  const d = num.replace(/\D/g, '')
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  if (/^6(011|5)/.test(d)) return 'Discover'
  return ''
}

const formatCard = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, cardBrand(v) === 'Amex' ? 15 : 16)
  return cardBrand(d) === 'Amex' ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')) : d.replace(/(\d{4})(?=\d)/g, '$1 ')
}
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

type Stage = 'form' | 'processing' | 'done'

export function Checkout({
  open,
  plan,
  email: defaultEmail,
  onClose,
  onPaid,
  onContinue,
}: {
  open: boolean
  plan: PlanInfo
  email: string
  onClose: () => void
  onPaid: (r: Receipt) => void
  onContinue: () => void
}) {
  const [stage, setStage] = useState<Stage>('form')
  const [email, setEmail] = useState(defaultEmail)
  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('United States')
  const [zip, setZip] = useState('')
  const [save, setSave] = useState(true)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const brand = cardBrand(card)

  useEffect(() => {
    if (!open) return
    setStage('form')
    setEmail(defaultEmail)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && stage === 'form' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pay = (method: 'card' | 'apple' | 'google') => {
    setStage('processing')
    const digits = card.replace(/\D/g, '')
    const now = new Date()
    const renews = new Date(now)
    if (plan.id === 'yearly') renews.setFullYear(now.getFullYear() + 1)
    else renews.setMonth(now.getMonth() + 1)
    const r: Receipt = {
      receiptId: `DS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      brand: method === 'apple' ? 'Apple Pay' : method === 'google' ? 'Google Pay' : brand || (digits ? 'Card' : 'Demo payment'),
      last4: method === 'card' && digits.length >= 4 ? digits.slice(-4) : '',
      amount: plan.price,
      paidAt: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      renewsOn: renews.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    // Clear sensitive fields straight away; only brand + last 4 are kept.
    setCard('')
    setCvc('')
    setTimeout(() => {
      setReceipt(r)
      onPaid(r)
      setStage('done')
    }, 1100)
  }

  const input = 'h-11 w-full bg-white px-3 text-[15px] text-[#30313d] outline-none placeholder:text-[#8c8f99] focus:relative focus:z-10 focus:ring-2 focus:ring-[#bf8035]/50'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Checkout (demo)">
          <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => stage === 'form' && onClose()} />
          <motion.div
            initial={{ y: 40, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="relative flex max-h-[96dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[24px] bg-[#f7f7f9] text-[#30313d] shadow-2xl sm:rounded-[24px]"
            style={{ colorScheme: 'light' }}
          >
            {/* header / order summary */}
            <div className="bg-[#1f140c] px-5 pb-5 pt-4 text-white">
              <div className="flex items-center gap-2.5">
                <LogoMark size={30} />
                <span className="text-sm font-semibold">Daily Stogie</span>
                <span className="ml-2 rounded bg-[#f5a524] px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-[#1f140c]">Test mode</span>
                {stage === 'form' && (
                  <button onClick={onClose} aria-label="Close checkout" className="ml-auto grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10"><X size={18} /></button>
                )}
              </div>
              <p className="mt-4 text-[13px] text-white/60">Subscribe to Daily Stogie {plan.name}</p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="font-serif text-[34px] leading-none">{plan.price}</span>
                <span className="text-sm text-white/60">{plan.per}</span>
              </p>
              {plan.id === 'yearly' && <p className="mt-1 text-xs text-[#E7B468]">Best value: save 16% vs monthly</p>}
            </div>

            <div className="flex-1 overflow-y-auto">
              {stage === 'done' && receipt ? (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid size-16 place-items-center rounded-full bg-[#1a7f4b] text-white">
                    <Check size={34} strokeWidth={3} />
                  </motion.span>
                  <h2 className="mt-4 text-xl font-semibold">Payment successful</h2>
                  <p className="mt-1 text-sm text-[#6a7383]">Welcome to Daily Stogie. A receipt was sent to {email || 'your email'}.</p>
                  <dl className="mt-6 w-full divide-y divide-[#e6e6eb] rounded-2xl border border-[#e6e6eb] bg-white text-left text-sm">
                    {[
                      ['Plan', `${plan.name} · ${plan.price} ${plan.per}`],
                      ['Paid with', receipt.last4 ? `${receipt.brand} •••• ${receipt.last4}` : receipt.brand],
                      ['Date', receipt.paidAt],
                      ['Renews on', receipt.renewsOn],
                      ['Receipt', receipt.receiptId],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3 px-4 py-2.5"><dt className="text-[#6a7383]">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-[#6a7383]">Demo payment: no money was charged.</p>
                  <button onClick={onContinue} className="btn-gold mt-6 h-12 w-full rounded-[12px] text-[15px] font-semibold">Continue</button>
                </div>
              ) : (
                <form
                  className="space-y-4 px-5 py-5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    pay('card')
                  }}
                >
                  {/* express checkout */}
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" disabled={stage !== 'form'} onClick={() => pay('apple')} className="flex h-11 items-center justify-center gap-1 rounded-[10px] bg-black text-[15px] font-semibold text-white disabled:opacity-50" aria-label="Pay with Apple Pay">
                      <svg width="15" height="18" viewBox="0 0 170 200" aria-hidden fill="currentColor"><path d="M150 106c0-24 20-36 21-37-11-16-29-19-35-19-15-2-29 9-37 9-8 0-19-9-32-9-16 0-32 10-40 25-17 30-4 74 12 98 8 12 18 25 30 24 12-1 17-8 32-8s19 8 32 8c13 0 21-12 29-24 9-14 13-27 13-28-1 0-25-10-25-39zM126 35c7-8 11-19 10-30-10 0-21 7-28 15-6 7-12 18-10 29 11 1 21-6 28-14z" /></svg>
                      Pay
                    </button>
                    <button type="button" disabled={stage !== 'form'} onClick={() => pay('google')} className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#dadce0] bg-white text-[15px] font-semibold text-[#3c4043] disabled:opacity-50" aria-label="Pay with Google Pay">
                      <GoogleG size={17} /> Pay
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6a7383]"><span className="h-px flex-1 bg-[#e6e6eb]" />Or pay with card<span className="h-px flex-1 bg-[#e6e6eb]" /></div>

                  <label className="block">
                    <span className="mb-1 block text-[13px] font-medium">Email</span>
                    <input className={cn(input, 'rounded-[10px] border border-[#e0e0e6]')} type="email" {...keyboardProps('email')} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </label>

                  <div>
                    <span className="mb-1 block text-[13px] font-medium">Card information</span>
                    <div className="overflow-hidden rounded-[10px] border border-[#e0e0e6] bg-white">
                      <div className="relative border-b border-[#e0e0e6]">
                        <input className={cn(input, 'pr-24')} {...keyboardProps('number')} autoComplete="cc-number" aria-label="Card number" placeholder="1234 1234 1234 1234" value={card} onChange={(e) => setCard(formatCard(e.target.value))} />
                        <span className="pointer-events-none absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1 text-[11px] font-bold">
                          {brand ? <span className="rounded bg-[#f0f0f5] px-1.5 py-0.5 text-[#30313d]">{brand}</span> : (
                            <><span className="rounded bg-[#1a1f71] px-1 text-white">VISA</span><span className="rounded bg-[#eb001b] px-1 text-white">MC</span><span className="rounded bg-[#2e77bc] px-1 text-white">AMEX</span></>
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <input className={cn(input, 'border-r border-[#e0e0e6]')} {...keyboardProps('number')} autoComplete="cc-exp" aria-label="Expiry date" placeholder="MM / YY" value={exp} onChange={(e) => setExp(formatExpiry(e.target.value))} />
                        <div className="relative">
                          <input className={cn(input, 'pr-10')} {...keyboardProps('number')} autoComplete="cc-csc" aria-label="CVC" placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                          <CreditCard size={18} className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-[#8c8f99]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-[13px] font-medium">Name on card</span>
                    <input className={cn(input, 'rounded-[10px] border border-[#e0e0e6]')} {...keyboardProps('name')} autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </label>

                  <div>
                    <span className="mb-1 block text-[13px] font-medium">Country or region</span>
                    <div className="overflow-hidden rounded-[10px] border border-[#e0e0e6] bg-white">
                      <select className={cn(input, 'border-b border-[#e0e0e6]')} aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <input className={input} {...keyboardProps('zip', true)} autoComplete="postal-code" aria-label="ZIP" placeholder="ZIP" value={zip} onChange={(e) => setZip(e.target.value.slice(0, 10))} />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 rounded-[10px] border border-[#e0e0e6] bg-white p-3 text-[13px]">
                    <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="mt-0.5 size-4 accent-[#bf8035]" />
                    <span><span className="font-medium">Save my info for faster checkout</span><span className="block text-[#6a7383]">Pay securely across Daily Stogie.</span></span>
                  </label>

                  <button type="submit" disabled={stage !== 'form'} className="btn-gold flex h-12 w-full items-center justify-center gap-2 rounded-[12px] text-[16px] font-semibold disabled:opacity-80">
                    {stage === 'processing' ? (
                      <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Processing…</>
                    ) : (
                      <><Lock size={16} /> Pay {plan.price}</>
                    )}
                  </button>
                  <p className="text-center text-[12px] leading-relaxed text-[#6a7383]">
                    Renews automatically {plan.id === 'yearly' ? 'every year' : 'every month'} until you cancel. By subscribing you agree to the Terms and refund policy.
                  </p>
                  <p className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#fff4d6] px-3 py-2 text-center text-[12px] text-[#7a5200]">
                    <ShieldCheck size={14} /> Demo checkout: any details (or none) work. No card is charged.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
