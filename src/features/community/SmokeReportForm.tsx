import { Chip, Field, Input, Select, Textarea } from '@/components/ui'
import { PREF_SECTIONS } from '@/data/options'
import { StrengthScale } from '@/features/profile/controls'
import { cn } from '@/lib/cn'
import type { SmokeReport } from './types'

const group = (id: string) => PREF_SECTIONS.flatMap((s) => s.groups).find((g) => g.id === id)!
const opts = (id: string) => {
  const g = group(id)
  return g.subgroups ? g.subgroups.flatMap((s) => s.options) : g.options
}

export const EMPTY_REPORT: SmokeReport = {
  brand: '', line: '', vitola: '', ringGauge: '', length: '', wrapper: '', origin: '', strength: 3,
  flavors: [], pairing: '', smokeTime: '', construction: 0, rating: 0, notes: '',
}

export function BandRating({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5`}
          onClick={() => onChange(n)}
          className={cn('h-8 flex-1 rounded-lg border transition', n <= value ? 'border-gold-deep bg-gradient-to-b from-gold-light to-gold-deep' : 'border-line bg-surface-2')}
        />
      ))}
    </div>
  )
}

export function SmokeReportForm({ value, onChange }: { value: SmokeReport; onChange: (v: SmokeReport) => void }) {
  const set = (patch: Partial<SmokeReport>) => onChange({ ...value, ...patch })
  const flavors = opts('flavors')
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand" htmlFor="sr-brand">
          <Select id="sr-brand" value={value.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Select">
            {opts('brands').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Line / name" htmlFor="sr-line">
          <Input id="sr-line" value={value.line} onChange={(e) => set({ line: e.target.value })} placeholder="e.g. 1926 No. 9" />
        </Field>
        <Field label="Vitola" htmlFor="sr-vitola">
          <Select id="sr-vitola" value={value.vitola} onChange={(e) => set({ vitola: e.target.value })} placeholder="Select">
            {opts('vitola').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ring" htmlFor="sr-ring"><Input id="sr-ring" inputMode="numeric" value={value.ringGauge} onChange={(e) => set({ ringGauge: e.target.value })} placeholder="50" /></Field>
          <Field label="Length" htmlFor="sr-len"><Input id="sr-len" value={value.length} onChange={(e) => set({ length: e.target.value })} placeholder='5"' /></Field>
        </div>
        <Field label="Wrapper" htmlFor="sr-wrap">
          <Select id="sr-wrap" value={value.wrapper} onChange={(e) => set({ wrapper: e.target.value })} placeholder="Select">
            {opts('wrapper').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Origin" htmlFor="sr-origin">
          <Select id="sr-origin" value={value.origin} onChange={(e) => set({ origin: e.target.value })} placeholder="Select">
            {opts('origin').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Pairing" htmlFor="sr-pair">
          <Select id="sr-pair" value={value.pairing} onChange={(e) => set({ pairing: e.target.value })} placeholder="Select">
            {opts('pairings').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Smoke time" htmlFor="sr-time">
          <Select id="sr-time" value={value.smokeTime} onChange={(e) => set({ smokeTime: e.target.value })} placeholder="Select">
            {opts('duration').map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium">Strength</p>
        <StrengthScale value={value.strength} onChange={(strength) => set({ strength })} />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium">Flavor notes <span className="font-normal text-ink-muted">({value.flavors.length})</span></p>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {flavors.map((f) => (
            <Chip key={f} size="sm" selected={value.flavors.includes(f)} onClick={() => set({ flavors: value.flavors.includes(f) ? value.flavors.filter((x) => x !== f) : [...value.flavors, f] })}>{f}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium">Construction</p>
        <BandRating label="Construction score" value={value.construction} onChange={(construction) => set({ construction })} />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium">Overall rating</p>
        <BandRating label="Overall rating" value={value.rating} onChange={(rating) => set({ rating })} />
      </div>
      <Field label="Notes" htmlFor="sr-notes">
        <Textarea id="sr-notes" value={value.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Draw, burn, how it evolved…" />
      </Field>
    </div>
  )
}
