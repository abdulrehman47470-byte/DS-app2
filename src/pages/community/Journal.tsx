import { AlarmClock, BookMarked, Download, Lock, Plus, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, EmptyState, Field, Input, Segmented, Sheet, TopBar } from '@/components/ui'
import { Composer } from '@/features/community/Composer'
import { Bands } from '@/features/community/PostCard'
import { EMPTY_REPORT, SmokeReportForm } from '@/features/community/SmokeReportForm'
import { useCommunity } from '@/features/community/store'
import type { JournalEntry, SmokeReport } from '@/features/community/types'
import { useApp } from '@/lib/store'

const toReport = (j: JournalEntry): SmokeReport => ({
  brand: j.brand, line: j.line, vitola: j.vitola, ringGauge: j.ringGauge, length: j.length, wrapper: j.wrapper, origin: j.origin,
  strength: j.strength, flavors: j.flavors, pairing: j.pairing, smokeTime: j.smokeTime, construction: j.construction, rating: j.rating, notes: j.notes,
})

const today = () => new Date().toISOString().slice(0, 10)

function toCsv(rows: JournalEntry[]) {
  const cols: (keyof JournalEntry)[] = ['date', 'status', 'brand', 'line', 'vitola', 'ringGauge', 'length', 'wrapper', 'origin', 'strength', 'flavors', 'pairing', 'smokeTime', 'construction', 'rating', 'notes', 'purchaseDate', 'humidor', 'agingStart', 'readyDate']
  const cell = (v: unknown) => `"${String(Array.isArray(v) ? v.join('; ') : v ?? '').replace(/"/g, '""')}"`
  return [cols.join(','), ...rows.map((r) => cols.map((k) => cell(r[k])).join(','))].join('\n')
}

export default function Journal() {
  const { c, setC, on } = useCommunity()
  const { toast } = useApp()
  const [tab, setTab] = useState<'all' | 'Smoked' | 'In my humidor'>('all')
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [shareReport, setShareReport] = useState<SmokeReport | null>(null)
  const list = c.journal.filter((j) => tab === 'all' || j.status === tab).sort((a, b) => b.date.localeCompare(a.date))
  const ready = c.journal.filter((j) => j.status === 'In my humidor' && j.readyDate && j.readyDate <= today())

  const exportCsv = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([toCsv(c.journal)], { type: 'text/csv' }))
    a.download = 'cigar-journal.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar back title="Cigar Journal" right={<Button size="sm" icon={Plus} onClick={() => setEditing({ ...EMPTY_REPORT, id: '', date: today(), status: 'Smoked' })}>Add</Button>} />
      <div className="space-y-3 px-4">
        <p className="flex items-center gap-1.5 text-xs text-ink-muted"><Lock size={13} /> Private. Only you can see your journal.</p>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'all', label: 'All' }, { value: 'Smoked', label: 'Smoked' }, { value: 'In my humidor', label: 'Humidor' }]} />
        {ready.map((j) => (
          <div key={j.id} className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-3 text-sm">
            <AlarmClock size={18} className="shrink-0 text-success" />
            <span className="flex-1"><strong>{j.brand} {j.line}</strong> is ready to smoke.</span>
          </div>
        ))}
        {list.length === 0 ? (
          <EmptyState icon={BookMarked} title="Your journal is empty" body="Log cigars you smoke or keep, and get a nudge when aged cigars are ready." />
        ) : (
          list.map((j) => (
            <button key={j.id} onClick={() => setEditing(j)} className="card block w-full p-4 text-left transition hover:border-gold">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-lg leading-tight">{j.brand} {j.line}</p>
                  <p className="text-xs text-ink-muted">{[j.vitola, j.wrapper, j.origin].filter(Boolean).join(' · ')}</p>
                </div>
                <Badge tone={j.status === 'Smoked' ? 'gold' : 'muted'}>{j.status}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                <span>{j.status === 'Smoked' ? `Smoked ${j.date}` : j.readyDate ? `Ready ${j.readyDate}` : `Added ${j.date}`}{j.humidor ? ` · ${j.humidor}` : ''}</span>
                {j.rating > 0 && <Bands value={j.rating} size={10} />}
              </div>
            </button>
          ))
        )}
        {c.journal.length > 0 && <Button variant="secondary" block icon={Download} onClick={exportCsv}>Export to CSV</Button>}
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Journal entry' : 'New entry'}
        footer={
          editing && (
            <div className="flex gap-2">
              {editing.id && <Button variant="danger" icon={Trash2} aria-label="Delete entry" onClick={() => { setC((s) => ({ journal: s.journal.filter((x) => x.id !== editing.id) })); setEditing(null) }} />}
              {on('smoke_reports') && on('community_feed') && editing.brand && editing.rating > 0 && (
                <Button variant="secondary" icon={Share2} onClick={() => { setShareReport(toReport(editing)); setEditing(null) }}>Share</Button>
              )}
              <Button className="flex-1" disabled={!editing.brand} onClick={() => {
                const entry = { ...editing, id: editing.id || `j${Date.now()}` }
                setC((s) => ({ journal: editing.id ? s.journal.map((x) => (x.id === editing.id ? entry : x)) : [entry, ...s.journal] }))
                toast('Saved to your journal')
                setEditing(null)
              }}>Save</Button>
            </div>
          )
        }
      >
        {editing && (
          <div className="space-y-4 pb-2">
            <Segmented value={editing.status} onChange={(status) => setEditing({ ...editing, status })} options={[{ value: 'Smoked', label: 'Smoked' }, { value: 'In my humidor', label: 'In my humidor' }]} />
            <Field label="Date" htmlFor="j-date"><Input id="j-date" type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
            {editing.status === 'In my humidor' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Purchase date" htmlFor="j-pd"><Input id="j-pd" type="date" value={editing.purchaseDate ?? ''} onChange={(e) => setEditing({ ...editing, purchaseDate: e.target.value })} /></Field>
                <Field label="Humidor location" htmlFor="j-h"><Input id="j-h" value={editing.humidor ?? ''} onChange={(e) => setEditing({ ...editing, humidor: e.target.value })} placeholder="Cabinet, shelf 2" /></Field>
                <Field label="Aging start" htmlFor="j-as"><Input id="j-as" type="date" value={editing.agingStart ?? ''} onChange={(e) => setEditing({ ...editing, agingStart: e.target.value })} /></Field>
                <Field label="Ready to smoke" htmlFor="j-rd" hint="We’ll remind you"><Input id="j-rd" type="date" value={editing.readyDate ?? ''} onChange={(e) => setEditing({ ...editing, readyDate: e.target.value })} /></Field>
              </div>
            )}
            <SmokeReportForm value={editing} onChange={(r) => setEditing({ ...editing, ...r })} />
          </div>
        )}
      </Sheet>
      {shareReport && <Composer open initialType="smoke" initialSmoke={shareReport} onClose={() => setShareReport(null)} />}
    </div>
  )
}
