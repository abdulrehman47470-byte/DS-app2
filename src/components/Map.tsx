import { lazy, Suspense, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

// Leaflet (~150 KB) is only downloaded when a map is actually on screen.
const LoungeMapImpl = lazy(() => import('./LoungeMap').then((m) => ({ default: m.LoungeMap })))

export type { MapPoint } from './LoungeMap'

export function LoungeMap(props: ComponentProps<typeof LoungeMapImpl>) {
  return (
    <Suspense fallback={<div className={cn('skeleton rounded-[20px] border border-line', props.className)} aria-label="Loading map" />}>
      <LoungeMapImpl {...props} />
    </Suspense>
  )
}
