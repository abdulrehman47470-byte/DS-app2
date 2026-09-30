/**
 * Phase 10 community module flags. These are NOT in the client's brief.
 * During the demo stage they default to ON everywhere (local and Vercel) so the screens can be
 * reviewed. Before launch set VITE_COMMUNITY_PREVIEW=false (Vercel > Settings > Environment
 * Variables) so they default to OFF until the client approves; admins can still toggle each one.
 */
export const FLAGS = [
  { key: 'community_feed', label: 'Lounge Feed', desc: 'Posts, comments, reactions, polls' },
  { key: 'smoke_reports', label: 'Smoke Reports', desc: 'Structured cigar review posts' },
  { key: 'music_share', label: 'Music Share', desc: 'Music links and profile soundtrack' },
  { key: 'video_posts', label: 'Video Posts', desc: 'YouTube/Vimeo links and short uploads' },
  { key: 'events', label: 'Events & Meetups', desc: 'Create events, RSVP, calendar' },
  { key: 'cigar_journal', label: 'Cigar Journal', desc: 'Private smoking log' },
  { key: 'notifications', label: 'Notifications', desc: 'Bell and notification center' },
  { key: 'lounge_checkins', label: 'Lounge Check-ins', desc: '“I’m here” at a lounge' },
  { key: 'lounge_reviews', label: 'Lounge Reviews', desc: 'Ratings and tips for lounges' },
  { key: 'passport', label: 'Cigar Passport', desc: 'Stamps and badges from check-ins' },
  { key: 'safe_meet_spot', label: 'Safe Meet Spot', desc: 'Suggest a lounge between two matches' },
  { key: 'travel_mode', label: 'Travel Mode', desc: 'Meet members where you are visiting' },
  { key: 'pairing_finder', label: 'Pairing Finder', desc: 'Suggest drinks for a cigar' },
  { key: 'match_insights', label: 'Match Insights', desc: 'Why you match, by category' },
  { key: 'icebreakers', label: 'Icebreakers', desc: 'Suggested first messages' },
  { key: 'nearby_map', label: 'Nearby Map', desc: 'Approximate map of members near you' },
] as const

export type FlagKey = (typeof FLAGS)[number]['key']

const preview = import.meta.env.VITE_COMMUNITY_PREVIEW !== 'false'

export const DEFAULT_FLAGS = Object.fromEntries(FLAGS.map((f) => [f.key, preview])) as Record<FlagKey, boolean>
