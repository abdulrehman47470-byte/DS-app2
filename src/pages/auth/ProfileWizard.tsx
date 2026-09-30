import { EyeOff, Lock, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProgressBar } from '@/components/layout'
import { Button, Chip, Field, Input, Select, Textarea, Toggle, TopBar } from '@/components/ui'
import {
  ABOUT_FIELDS,
  COUNTRIES,
  ETHNICITIES,
  GENDERS,
  PREF_SECTIONS,
  PRONOUNS,
  STATES_BY_COUNTRY,
  USER_TYPES,
  type AboutField,
} from '@/data/options'
import { Collapsible, MultiEntry, OptionGroupView, RangeSlider, StrengthScale, WheelPicker } from '@/features/profile/controls'
import { ageFromDob } from '@/lib/age'
import { cn } from '@/lib/cn'
import { useApp, type Demographics } from '@/lib/store'

const BIO_MAX = 500 // TODO(phase 3): read from app_config
const TITLES = ['Demographics', 'Stogie Preferences', 'About You']

export default function ProfileWizard({ edit }: { edit?: boolean }) {
  const params = useParams()
  const nav = useNavigate()
  const step = Math.min(3, Math.max(1, Number(params.step) || 1))
  const [dir, setDir] = useState(1)

  const go = (n: number) => {
    setDir(n > step ? 1 : -1)
    window.scrollTo({ top: 0 })
    if (n > 3) return nav(edit ? '/profile' : '/discover')
    nav(edit ? `/profile/edit/${n}` : `/onboarding/${n}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        back={step > 1 ? (edit ? `/profile/edit/${step - 1}` : `/onboarding/${step - 1}`) : edit ? '/profile' : '/subscribe'}
        title={edit ? 'Edit Profile' : 'Profile Onboarding'}
      />
      <div className="px-6">
        <div className="mb-2 flex items-center gap-2" aria-hidden>
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-1 items-center gap-2 last:flex-none">
              <span className={cn('grid size-7 place-items-center rounded-full border text-xs font-semibold transition', n < step ? 'border-gold bg-gold text-on-gold' : n === step ? 'border-gold text-gold-ink' : 'border-line text-ink-faint')}>
                {n}
              </span>
              {n < 3 && <span className={cn('h-px flex-1', n < step ? 'bg-gold' : 'bg-line')} />}
            </div>
          ))}
        </div>
        <ProgressBar value={(step / 3) * 100} label="Profile progress" />
        <p className="micro-label mt-4">Profile {step} of 3</p>
        <h1 className="font-serif text-[28px] leading-tight">{TITLES[step - 1]}</h1>
      </div>

      <div key={step} className={cn('flex-1 px-6 pb-4 pt-5', dir > 0 ? 'page-enter' : 'page-enter-back')}>
        {step === 1 && <StepDemographics />}
        {step === 2 && <StepPreferences />}
        {step === 3 && <StepAbout />}
      </div>

      <div className="sticky bottom-0 z-20 flex gap-3 border-t border-line bg-bg/90 px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        {step > 1 && (
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        <Button size="lg" className="flex-[2]" onClick={() => go(step + 1)}>
          {step === 3 ? (edit ? 'Save profile' : 'Finish & start discovering') : 'Next'}
        </Button>
      </div>
    </div>
  )
}

function StepDemographics() {
  const { state, set } = useApp()
  const d = state.demographics
  const upd = (patch: Partial<Demographics>) => set((s) => ({ demographics: { ...s.demographics, ...patch } }))
  const states = STATES_BY_COUNTRY[d.country]
  const computedAge = state.dob ? ageFromDob(new Date(state.dob)) : d.age
  const zipOk = d.country !== 'United States' || !d.zip || /^\d{5}(-\d{4})?$/.test(d.zip)

  return (
    <div className="space-y-5">
      <Field label="Full name" htmlFor="name" hint="Prefilled from sign-up. Only your first name shows on cards.">
        <Input id="name" value={d.name} onChange={(e) => upd({ name: e.target.value })} autoComplete="name" />
      </Field>
      {/* TODO(client): should the age scroller be editable, or only show the age computed from DOB? */}
      <Field label="Age" hint={state.dob ? `Computed from your date of birth: ${computedAge}` : 'Minimum age is 21'}>
        <WheelPicker label="Age" min={21} max={99} value={d.age} onChange={(age) => upd({ age })} />
      </Field>
      {/* TODO(client): does "Gender preference" mean the member's own gender or who they want to meet? */}
      <Field label="Gender preference" htmlFor="gender">
        <Select id="gender" value={d.gender} onChange={(e) => upd({ gender: e.target.value })} placeholder="Select">
          {GENDERS.map((g) => <option key={g}>{g}</option>)}
        </Select>
      </Field>
      <Field label="Pronouns" htmlFor="pronouns">
        <Select id="pronouns" value={d.pronouns} onChange={(e) => upd({ pronouns: e.target.value })} placeholder="Select">
          {PRONOUNS.map((g) => <option key={g}>{g}</option>)}
        </Select>
      </Field>
      <Field label="Ethnicity" htmlFor="ethnicity" optional hint="Sensitive. Never used for matching.">
        <Select id="ethnicity" value={d.ethnicity} onChange={(e) => upd({ ethnicity: e.target.value })} placeholder="Select">
          {ETHNICITIES.map((g) => <option key={g}>{g}</option>)}
        </Select>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
          <span className="flex items-center gap-2 text-[13px]"><EyeOff size={15} className="text-ink-muted" /> Hide from other members</span>
          <Toggle label="Hide ethnicity" checked={d.ethnicityHidden} onChange={(v) => upd({ ethnicityHidden: v })} />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country" htmlFor="country">
          <Select id="country" value={d.country} onChange={(e) => upd({ country: e.target.value, state: '' })}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="State / Province" htmlFor="state">
          {states ? (
            <Select id="state" value={d.state} onChange={(e) => upd({ state: e.target.value })} placeholder="Select">
              {states.map((c) => <option key={c}>{c}</option>)}
            </Select>
          ) : (
            <Input id="state" value={d.state} onChange={(e) => upd({ state: e.target.value })} placeholder="Region" />
          )}
        </Field>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-3">
        <Field label="City" htmlFor="city">
          <Input id="city" value={d.city} onChange={(e) => upd({ city: e.target.value })} autoComplete="address-level2" />
        </Field>
        <Field label="ZIP code" htmlFor="zip" error={zipOk ? undefined : 'Use 5 digits'}>
          <Input id="zip" inputMode="numeric" value={d.zip} onChange={(e) => upd({ zip: e.target.value })} autoComplete="postal-code" />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium">Cigar knowledge / User type</p>
        <div role="radiogroup" className="grid grid-cols-2 gap-2">
          {USER_TYPES.map((t, i) => (
            <button
              key={t}
              role="radio"
              aria-checked={d.userType === t}
              onClick={() => upd({ userType: t })}
              className={cn(
                'flex min-h-14 items-center gap-3 rounded-[14px] border px-3 text-left transition',
                i === 4 && 'col-span-2',
                d.userType === t ? 'border-gold bg-gold/12' : 'border-line bg-surface',
              )}
            >
              <span className="flex gap-0.5" aria-hidden>
                {USER_TYPES.map((_, j) => (
                  <span key={j} className={cn('h-4 w-1 rounded-full', j <= i ? 'bg-gold' : 'bg-line')} />
                ))}
              </span>
              <span className="text-sm font-semibold">{t}</span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">Shown as a badge on your card and profile.</p>
      </div>

      <Field label="Biography" htmlFor="bio" hint={`${d.bio.length} / ${BIO_MAX}`}>
        <Textarea id="bio" maxLength={BIO_MAX} value={d.bio} onChange={(e) => upd({ bio: e.target.value })} placeholder="What do you love about cigars? What are you looking for here?" />
      </Field>
      <Field label="Website" htmlFor="website" optional>
        <Input id="website" type="url" value={d.website} onChange={(e) => upd({ website: e.target.value })} placeholder="https://" />
      </Field>
      <div className="space-y-3">
        <p className="text-[13px] font-medium">Social media <span className="font-normal text-ink-muted">(optional)</span></p>
        {(['instagram', 'facebook', 'linkedin'] as const).map((k) => (
          <Input key={k} aria-label={k} value={d[k]} onChange={(e) => upd({ [k]: e.target.value })} placeholder={k === 'instagram' ? 'Instagram @handle' : k === 'facebook' ? 'Facebook profile URL' : 'LinkedIn profile URL'} />
        ))}
      </div>
    </div>
  )
}

function StepPreferences() {
  const { state, set } = useApp()
  const setPref = (id: string, v: string | string[]) => set((s) => ({ prefs: { ...s.prefs, [id]: v } }))
  const summary = (ids: string[]) =>
    ids
      .flatMap((id) => {
        const v = state.prefs[id]
        return Array.isArray(v) ? v : v ? [v] : []
      })
      .slice(0, 4)
      .join(' · ') || 'Not answered yet'

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">Tap a section to open it. These power your match score.</p>
      {PREF_SECTIONS.map((sec, i) => (
        <Collapsible key={sec.id} title={sec.title} summary={summary(sec.groups.map((g) => g.id))} defaultOpen={i === 0}>
          {sec.groups.map((g) => (
            <OptionGroupView key={g.id} group={g} value={state.prefs[g.id]} onChange={(v) => setPref(g.id, v)} />
          ))}
          {sec.special === 'price' && (
            <div className="py-4">
              <RangeSlider label="Price comfort zone" min={5} max={100} value={state.priceRange} onChange={(v) => set({ priceRange: v })} format={(n) => (n >= 100 ? '$100+' : `$${n}`)} />
            </div>
          )}
          {sec.special === 'strengthScale' && (
            <div className="py-4">
              <p className="mb-2.5 text-sm font-semibold">Strength scale</p>
              <StrengthScale value={state.strengthScale} onChange={(v) => set({ strengthScale: v })} />
            </div>
          )}
          {sec.special === 'wishlist' && (
            <div className="py-4">
              <p className="mb-2.5 text-sm font-semibold">Wishlist</p>
              <MultiEntry values={state.wishlist} onChange={(v) => set({ wishlist: v })} placeholder="Add a cigar you want to try" />
            </div>
          )}
        </Collapsible>
      ))}
    </div>
  )
}

function AboutPicker({ field }: { field: AboutField }) {
  const { state, set } = useApp()
  const [q, setQ] = useState('')
  const value = state.about[field.id]
  const on = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o)
  const pick = (o: string) => {
    let next: string | string[]
    if (field.kind === 'single') next = value === o ? '' : o
    else {
      const arr = Array.isArray(value) ? value : []
      next = arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]
    }
    set((s) => ({ about: { ...s.about, [field.id]: next } }))
  }
  const list = field.options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
  const hidden = !!state.hidden[field.id]

  return (
    <Collapsible
      title={field.label}
      summary={(Array.isArray(value) ? value.join(' · ') : value) || 'Optional'}
    >
      <div className="py-3">
        {field.sensitive && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
            <span className="flex items-center gap-2 text-[13px]"><EyeOff size={15} className="text-ink-muted" /> Hide from other members</span>
            <Toggle label={`Hide ${field.label}`} checked={hidden} onChange={(v) => set((s) => ({ hidden: { ...s.hidden, [field.id]: v } }))} />
          </div>
        )}
        {field.quickPicks && (
          <>
            <p className="micro-label mb-1.5 !text-[10px]">Quick picks</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {field.quickPicks.map((o) => (
                <Chip key={o} selected={on(o)} onClick={() => pick(o)}>{o}</Chip>
              ))}
            </div>
            <p className="micro-label mb-1.5 !text-[10px]">Full list</p>
          </>
        )}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-9" aria-label={`Search ${field.label}`} />
        </div>
        <div className="flex flex-wrap gap-2">
          {list.map((o) => (
            <Chip key={o} selected={on(o)} onClick={() => pick(o)}>{o}</Chip>
          ))}
        </div>
      </div>
    </Collapsible>
  )
}

function StepAbout() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-3.5 text-[13px]">
        <Lock size={18} className="mt-0.5 shrink-0 text-gold-deep" />
        <p>
          Everything here is optional. <strong>Religion, political affiliation and ethnicity</strong> can be hidden
          from other members and are never used for matching.
        </p>
      </div>
      {ABOUT_FIELDS.map((f) => (
        <AboutPicker key={f.id} field={f} />
      ))}
    </div>
  )
}
