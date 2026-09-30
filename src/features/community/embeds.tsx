import { ExternalLink, Music2, Play } from 'lucide-react'
import { useState } from 'react'

/** Official embed URLs only: no scraping, no audio hosting. */
export function musicEmbed(raw: string): { provider: string; src: string; height: number } | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const h = u.hostname.replace(/^www\./, '')
  if (h === 'open.spotify.com') {
    const m = u.pathname.match(/^\/(track|album|playlist|episode|artist)\/([A-Za-z0-9]+)/)
    return m ? { provider: 'Spotify', src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, height: m[1] === 'track' ? 80 : 152 } : null
  }
  if (h === 'music.apple.com') return { provider: 'Apple Music', src: `https://embed.music.apple.com${u.pathname}`, height: 150 }
  if (h === 'soundcloud.com')
    return { provider: 'SoundCloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23d69a4c&visual=false`, height: 120 }
  const yt = youTubeId(u)
  if (yt) return { provider: h === 'music.youtube.com' ? 'YouTube Music' : 'YouTube', src: `https://www.youtube-nocookie.com/embed/${yt}`, height: 180 }
  return null
}

function youTubeId(u: URL) {
  const h = u.hostname.replace(/^www\./, '')
  if (h === 'youtu.be') return u.pathname.slice(1) || null
  if (h === 'youtube.com' || h === 'm.youtube.com' || h === 'music.youtube.com') {
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2]
    return u.searchParams.get('v')
  }
  return null
}

export function videoEmbed(raw: string): { provider: string; src: string } | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const yt = youTubeId(u)
  if (yt) return { provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1` }
  const h = u.hostname.replace(/^www\./, '')
  if (h === 'vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean)[0]
    if (id && /^\d+$/.test(id)) return { provider: 'Vimeo', src: `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0` }
  }
  return null
}

export function isAllowedMusic(url: string) {
  return !!musicEmbed(url)
}
export function isAllowedVideo(url: string) {
  return !!videoEmbed(url)
}

export function MusicCard({ url }: { url: string }) {
  const e = musicEmbed(url)
  const [failed, setFailed] = useState(false)
  if (!e || failed)
    return (
      <a href={url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 text-sm">
        <span className="grid size-10 place-items-center rounded-xl bg-gold/15 text-gold-deep"><Music2 size={18} /></span>
        <span className="min-w-0 flex-1 truncate">{url}</span>
        <ExternalLink size={15} className="text-ink-muted" />
      </a>
    )
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <iframe
        title={`${e.provider} player`}
        src={e.src}
        height={e.height}
        className="block w-full"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/** Never autoplays with sound: link videos load only on tap; uploads are muted inline. */
export function VideoCard({ video }: { video: { kind: 'link' | 'upload'; url: string } }) {
  const [play, setPlay] = useState(false)
  if (video.kind === 'upload')
    return <video src={video.url} controls muted playsInline preload="metadata" className="aspect-video w-full rounded-2xl bg-black" />
  const e = videoEmbed(video.url)
  if (!e) return <MusicCard url={video.url} />
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black">
      {play ? (
        <iframe title={`${e.provider} video`} src={`${e.src}&autoplay=1`} className="absolute inset-0 size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <button onClick={() => setPlay(true)} className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_60%_30%,rgba(214,154,76,.45),transparent_60%),linear-gradient(160deg,#3a2414,#120b06)]" aria-label={`Play ${e.provider} video`}>
          <span className="grid size-16 place-items-center rounded-full bg-white/20 text-white backdrop-blur"><Play size={26} className="ml-1 fill-white" /></span>
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">{e.provider}</span>
        </button>
      )}
    </div>
  )
}
