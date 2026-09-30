import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { useMedia } from '@/lib/media'

/** <img> for any media reference (uploads stored on the device, data: or http URLs). */
export function MediaImg({ src, className, ...rest }: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src?: string }) {
  const url = useMedia(src)
  if (!url) return <div className={cn('skeleton', className)} aria-hidden />
  return <img src={url} decoding="async" loading="lazy" className={className} alt="" {...rest} />
}

/**
 * Uploaded video, Instagram-style: plays muted while at least 60% on screen, pauses when
 * scrolled away, tap the speaker to hear it, tap the video for full controls. Never autoplays
 * with sound.
 */
export function UploadedVideo({ src, className }: { src: string; className?: string }) {
  const url = useMedia(src)
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [controls, setControls] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v || !url) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: [0, 0.6, 1] },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [url])

  if (!url) return <div className={cn('skeleton aspect-video w-full rounded-2xl', className)} aria-label="Loading video" />
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-black', className)}>
      <video
        ref={ref}
        src={url}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        controls={controls}
        onClick={() => setControls(true)}
        className="block max-h-[70vh] w-full object-contain"
      />
      {!controls && (
        <button
          onClick={() => {
            setMuted((m) => !m)
            ref.current?.play().catch(() => {})
          }}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-black/55 text-white"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  )
}
