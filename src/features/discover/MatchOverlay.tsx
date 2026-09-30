import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useMemo } from 'react'
import { Avatar } from '@/components/brand'
import { Button } from '@/components/ui'
import { useApp } from '@/lib/store'
import type { ScoredMember } from '@/types'

export function MatchOverlay({
  member,
  onClose,
  onSayHello,
}: {
  member: ScoredMember | null
  onClose: () => void
  onSayHello: () => void
}) {
  const { state } = useApp()
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        angle: (i / 36) * Math.PI * 2 + Math.random() * 0.3,
        dist: 120 + Math.random() * 160,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.15,
      })),
    [],
  )
  return (
    <AnimatePresence>
      {member && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`It's a match with ${member.firstName}`}
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#120b06]/92 px-8 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(224,158,73,.35),transparent_55%)]" />
          {/* gold particle burst */}
          <div className="pointer-events-none absolute left-1/2 top-[40%]">
            {particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-[#F7D89A] to-[#C98A2E]"
                style={{ width: p.size, height: p.size }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, opacity: 0, scale: 1 }}
                transition={{ duration: 1.4, delay: 0.25 + p.delay, ease: 'easeOut' }}
              />
            ))}
          </div>

          <div className="relative flex w-full max-w-sm flex-col items-center text-center text-white" aria-live="assertive">
            <div className="relative flex h-36 items-center">
              <motion.div initial={{ x: -140, rotate: -18, opacity: 0 }} animate={{ x: 16, rotate: -8, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
                <Avatar tone={30} name={state.demographics.name} src={state.photo} size={128} ring />
              </motion.div>
              <motion.div initial={{ x: 140, rotate: 18, opacity: 0 }} animate={{ x: -16, rotate: 8, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
                <Avatar tone={member.tone} name={`${member.firstName} ${member.lastName}`} size={128} ring />
              </motion.div>
            </div>
            <motion.h2
              className="mt-8 font-serif text-[44px] italic leading-none text-[#F2C57C]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 12 }}
            >
              It’s a match
            </motion.h2>
            <p className="mt-3 text-white/80">
              You and {member.firstName} like each other. {member.match}% match.
            </p>
            <div className="mt-8 w-full space-y-3">
              <Button size="lg" block icon={MessageCircle} onClick={onSayHello}>
                Say hello
              </Button>
              <Button size="lg" variant="dark" block onClick={onClose}>
                Keep swiping
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
