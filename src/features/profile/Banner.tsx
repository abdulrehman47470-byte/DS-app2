import { Camera, Check, ImagePlus, Trash2 } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Button, Sheet } from '@/components/ui'
import { BANNERS } from '@/data/mock/memberContent'
import { cn } from '@/lib/cn'

export type BannerValue = { preset?: string; src?: string }

export function bannerStyle(b: BannerValue) {
  if (b.src) return { backgroundImage: `url(${b.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: BANNERS[b.preset ?? 'leather']?.css ?? BANNERS.leather.css }
}

/** Presets by tone so sample members get varied banners. */
const DARK_PRESETS = Object.keys(BANNERS).filter((k) => k !== 'cream')
export const presetForTone = (tone: number) => DARK_PRESETS[tone % DARK_PRESETS.length]

export function ProfileBanner({ value, className, children, onEdit }: { value: BannerValue; className?: string; children?: ReactNode; onEdit?: () => void }) {
  return (
    <div className={cn('relative h-44 overflow-hidden', className)} style={bannerStyle(value)}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/35" />
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Change banner"
          className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-black/45 px-3 text-xs font-semibold text-white backdrop-blur hover:bg-black/60"
        >
          <Camera size={14} /> Edit banner
        </button>
      )}
      {children}
    </div>
  )
}

function toBannerDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // 3:1 center crop at up to 1500px wide
      const w = Math.min(1500, img.width)
      const h = Math.round(w / 3)
      const scale = Math.max(w / img.width, h / img.height)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      const dw = img.width * scale
      const dh = img.height * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      resolve(c.toDataURL('image/jpeg', 0.82))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function BannerEditor({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: BannerValue; onChange: (v: BannerValue) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) return setError('Please choose an image.')
    if (f.size > 15 * 1024 * 1024) return setError('Images must be under 15 MB.')
    setError(undefined)
    onChange({ src: await toBannerDataUrl(f) })
  }
  return (
    <Sheet open={open} onClose={onClose} title="Profile banner" footer={<Button block onClick={onClose}>Done</Button>}>
      <div className="h-28 overflow-hidden rounded-2xl border border-line" style={bannerStyle(value)} />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" icon={ImagePlus} onClick={() => ref.current?.click()}>Upload photo</Button>
        <Button variant="secondary" icon={Trash2} disabled={!value.src} onClick={() => onChange({ preset: 'leather' })}>Remove photo</Button>
      </div>
      <p className="micro-label mb-2 mt-5">Or choose a style</p>
      <div className="grid grid-cols-3 gap-2 pb-3">
        {Object.entries(BANNERS).map(([k, b]) => (
          <button key={k} onClick={() => onChange({ preset: k })} className={cn('relative h-16 overflow-hidden rounded-xl border-2', !value.src && value.preset === k ? 'border-gold' : 'border-transparent')} style={{ background: b.css }} aria-label={b.label}>
            <span className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white drop-shadow">{b.label}</span>
            {!value.src && value.preset === k && <Check size={16} className="absolute right-1.5 top-1.5 rounded-full bg-gold p-0.5 text-white" />}
          </button>
        ))}
      </div>
      <p className="pb-2 text-xs text-ink-muted">Banners follow the same photo rules: no explicit content, logos, ads or tobacco sales.</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </Sheet>
  )
}
