import {
  BookOpen, ChevronRight, CreditCard, Download, FileText, Gift, LogOut, MapPin, Monitor, Moon,
  PlayCircle, ScrollText, Shield, Sun, Trash2, Scale, type LucideIcon,
  Bell, BookMarked, CalendarDays, Map as MapIcon, Plane, Stamp, Wine,
} from 'lucide-react'
import { useCommunity } from '@/features/community/store'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/brand'
import { Button, Checkbox, Input, Segmented, TopBar } from '@/components/ui'
import { useApp, type ThemePref } from '@/lib/store'

function Row({ to, icon: Icon, label, value, danger, onClick }: { to?: string; icon: LucideIcon; label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  const cls = `flex min-h-14 w-full items-center gap-3.5 px-4 text-left transition hover:bg-surface-2 ${danger ? 'text-danger' : ''}`
  const inner = (
    <>
      <span className={`grid size-9 place-items-center rounded-xl ${danger ? 'bg-danger/10' : 'bg-gold/12 text-gold-deep'}`}>
        <Icon size={18} strokeWidth={1.6} />
      </span>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {value && <span className="text-sm text-ink-muted">{value}</span>}
      {!danger && <ChevronRight size={18} className="text-ink-faint" />}
    </>
  )
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls}>{inner}</button>
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="micro-label mb-2 px-5">{title}</h2>
      <div className="card mx-4 divide-y divide-line overflow-hidden">{children}</div>
    </section>
  )
}

export default function Settings() {
  const nav = useNavigate()
  const { state, set, reset } = useApp()
  const { on } = useCommunity()
  const community = [
    on('events') && <Row key="ev" to="/events" icon={CalendarDays} label="Events & Meetups" />,
    on('cigar_journal') && <Row key="jr" to="/journal" icon={BookMarked} label="Cigar Journal" />,
    on('passport') && <Row key="pp" to="/passport" icon={Stamp} label="Cigar Passport" />,
    on('pairing_finder') && <Row key="pf" to="/pairing" icon={Wine} label="Pairing Finder" />,
    on('travel_mode') && <Row key="tm" to="/travel" icon={Plane} label="Travel Mode" />,
    on('nearby_map') && <Row key="nm" to="/nearby" icon={MapIcon} label="Nearby Map" />,
    on('notifications') && <Row key="nt" to="/notifications" icon={Bell} label="Notifications" />,
  ].filter(Boolean)
  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar back="/profile" title="Settings" />

      <section className="mx-4 mt-2">
        <h2 className="micro-label mb-2 px-1">Appearance</h2>
        <Segmented<ThemePref>
          value={state.theme}
          onChange={(theme) => set({ theme })}
          options={[
            { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun size={15} /> Light</span> },
            { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon size={15} /> Dark</span> },
            { value: 'system', label: <span className="inline-flex items-center gap-1.5"><Monitor size={15} /> System</span> },
          ]}
        />
      </section>

      <Group title="Membership">
        <Row to="/settings/subscription" icon={CreditCard} label="Subscription" value={state.plan ? (state.plan === 'yearly' ? '$19.99/yr' : '$1.99/mo') : 'None'} />
        <Row to="/settings/refer" icon={Gift} label="Refer a Friend" />
      </Group>
      <Group title="Stogie">
        <Row to="/settings/search" icon={MapPin} label="Stogie Search" />
        <Row to="/settings/sessions" icon={PlayCircle} label="Stogie Sessions" />
        <Row to="/settings/blog" icon={BookOpen} label="Stogie Blog" />
      </Group>
      {community.length > 0 && <Group title="Community">{community}</Group>}
      <Group title="Legal">
        <Row to="/legal/privacy" icon={Shield} label="Privacy Policy" />
        <Row to="/legal/terms" icon={FileText} label="Terms & Conditions" />
        <Row to="/legal/ethics" icon={ScrollText} label="Stogie Ethics" />
        <Row to="/legal/indemnification" icon={Scale} label="Indemnification Clause" />
      </Group>
      <Group title="Account">
        <Row to="/settings/delete" icon={Download} label="Export or delete my data" />
        <Row icon={LogOut} label="Sign Out" danger onClick={() => { reset(); nav('/') }} />
      </Group>

      <div className="mt-8 flex flex-col items-center gap-1 text-xs text-ink-muted">
        <LogoMark size={28} />
        <p className="font-serif text-sm italic">Good Cigars. Better Company.</p>
        <p>Daily Stogie v0.1 · build {__BUILD_ID__} · 21+ only</p>
        <Link to="/admin" className="mt-2 underline">Admin panel (demo)</Link>
      </div>
    </div>
  )
}

export function Refer() {
  const { toast } = useApp()
  const link = 'https://dailystogie.app/join/JORDAN-7F3K' // TODO(phase 7): per-member code
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast('Link copied')
    } catch {
      toast('Copy failed. Select the link and copy it manually.')
    }
  }
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Daily Stogie', text: 'Join me on Daily Stogie, a 21+ network for cigar enthusiasts.', url: link })
      } catch {
        // user cancelled
      }
    } else copy()
  }
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Refer a Friend" />
      <div className="flex flex-1 flex-col items-center px-6 pt-6 text-center">
        <div className="grid size-24 place-items-center rounded-full btn-gold"><Gift size={40} strokeWidth={1.4} /></div>
        <h2 className="mt-6 font-serif text-[28px]">Share the smoke</h2>
        <p className="mt-2 max-w-72 text-sm text-ink-muted">Invite a fellow enthusiast (21+) with your personal link.</p>
        <div className="mt-6 flex w-full gap-2">
          <Input readOnly value={link} aria-label="Your referral link" onFocus={(e) => e.target.select()} />
          <Button onClick={copy}>Copy</Button>
        </div>
        <Button variant="secondary" size="lg" block className="mt-3" onClick={share}>Share link</Button>
        <p className="mt-6 text-xs text-ink-muted">We track sign-ups from your link. {/* TODO(client): rewards? */}</p>
      </div>
    </div>
  )
}

export function DeleteAccount() {
  const nav = useNavigate()
  const { reset, toast } = useApp()
  const [sure, setSure] = useState(false)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/settings" title="Your data" />
      <div className="space-y-4 px-5 pt-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg"><Download size={18} className="text-gold-deep" /> Export my data</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Download a copy of your profile, matches and messages.</p>
          <Button variant="secondary" className="mt-4" onClick={() => toast('Export will be emailed (Phase 2)')}>Request export</Button>
        </section>
        <section className="card border-danger/30 p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg text-danger"><Trash2 size={18} /> Delete my account</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            This permanently removes your profile, photos, matches and messages, as described in the Privacy Policy. It can’t be undone.
          </p>
          <div className="mt-3"><Checkbox checked={sure} onChange={setSure}>I understand this is permanent.</Checkbox></div>
          <Button variant="danger" className="mt-4" disabled={!sure} onClick={() => { reset(); toast('Account deleted'); nav('/') }}>
            Delete my account
          </Button>
        </section>
      </div>
    </div>
  )
}
