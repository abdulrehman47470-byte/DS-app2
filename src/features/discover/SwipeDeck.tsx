import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { BadgeCheck, MapPin } from 'lucide-react'
import { useEffect } from 'react'
import { MatchRing, Portrait, UserTypeBadge } from '@/components/brand'
import type { ScoredMember } from '@/types'

export type SwipeDir = 'like' | 'pass'

export function SwipeCard({
  member,
  isTop,
  depth,
  trigger,
  onSwiped,
  onOpen,
}: {
  member: ScoredMember
  isTop: boolean
  depth: number
  trigger: SwipeDir | null
  onSwiped: (dir: SwipeDir) => void
  onOpen: () => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-14, 14])
  const likeOpacity = useTransform(x, [30, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -30], [1, 0])

  const flyOut = (dir: SwipeDir) => {
    animate(x, dir === 'like' ? 560 : -560, { duration: 0.32, ease: 'easeIn' }).then(() => onSwiped(dir))
  }

  useEffect(() => {
    if (isTop && trigger) flyOut(trigger)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, isTop])

  const initials = `${member.firstName[0]}${member.lastName[0]}`
  const chips = member.shared.slice(0, 4)

  return (
    <motion.article
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-[28px] border border-black/10 bg-[#1c120b] shadow-deep active:cursor-grabbing"
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * 0.045, y: depth * 14, opacity: depth > 2 ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      drag={isTop ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) flyOut('like')
        else if (info.offset.x < -120 || info.velocity.x < -600) flyOut('pass')
      }}
      onTap={isTop ? onOpen : undefined}
      aria-hidden={!isTop}
      aria-label={isTop ? `${member.firstName}, ${member.age}, ${member.city}. ${member.match}% match. Tap to view profile.` : undefined}
    >
      <Portrait tone={member.tone} initials={initials} showInitials={false} className="pointer-events-none absolute inset-0" />
      <div className="photo-fade pointer-events-none absolute inset-0" />

      <div className="absolute left-4 top-4">
        <MatchRing value={member.match} onPhoto size={60} />
      </div>

      {/* stamps */}
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute right-5 top-8 rotate-12 rounded-xl border-[3px] border-success px-3 py-1 font-serif text-3xl font-bold tracking-wider text-success">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="pointer-events-none absolute left-5 top-24 -rotate-12 rounded-xl border-[3px] border-danger px-3 py-1 font-serif text-3xl font-bold tracking-wider text-danger">
        PASS
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white">
        <h2 className="flex items-center gap-2 font-serif text-[32px] leading-none drop-shadow">
          {member.firstName}, {member.age}
          {member.verified && <BadgeCheck size={24} className="fill-info text-white" aria-label="Photo verified" />}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-[15px] text-white/90">
          <MapPin size={15} /> {member.city}, {member.state}
          <UserTypeBadge type={member.userType} onPhoto />
        </p>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="rounded-full border border-[#EBC475]/50 bg-[#EBC475]/20 px-2.5 py-1 text-xs font-medium text-[#FBE7C0] backdrop-blur">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
