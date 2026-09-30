import type { Article, Comment, CommunityPairing, LoungeReview, MemberVideo } from '@/features/community/types'
import { BLOG_POSTS } from './content'

/* Member-generated content for Stogie Blog, Sessions, Pairing Finder and lounge reviews. */

export const ARTICLES: Article[] = [
  {
    id: 'a-m1',
    slug: 'three-years-in-the-cabinet',
    authorId: 'm3',
    title: 'Three Years in the Cabinet: What Aging Really Did',
    cover: { tone: 34 },
    category: 'Humidor',
    at: 'Sep 27, 2026',
    readMins: 6,
    body: [
      'I dated a box of maduros in 2023 and promised myself I wouldn’t touch it until this fall. Here’s what changed, and what didn’t.',
      '## The pepper faded first',
      'In year one the black pepper was front and centre. By year three it had turned into a warm baking spice that sits behind the cocoa instead of in front of it.',
      '## Construction improved',
      '- The draw loosened slightly\n- The burn line stayed razor sharp\n- Ash held past the band on two of the five sticks',
      '## What I’d do differently',
      'Log the humidity monthly. I only checked quarterly and I think a dry summer cost me some of the oils.',
      '**Bottom line:** if you love a cigar young, buy a box and forget a few of them. Your future self will thank you.',
    ].join('\n\n'),
    reactions: { cheers: 21, wellSaid: 14, fire: 6 },
    reactors: ['m1', 'm6', 'm8', 'm5', 'm9'],
  },
  {
    id: 'a-m2',
    slug: 'first-month-as-a-beginner',
    authorId: 'm7',
    title: 'My First Month as a Cigar Beginner',
    cover: { tone: 12 },
    category: 'Lifestyle',
    at: 'Sep 22, 2026',
    readMins: 4,
    body: [
      'A month ago I didn’t know a punch from a guillotine. Here’s what I learned from the mentors on Daily Stogie.',
      '## Start mild, and slow down',
      'My first cigar was a full-bodied Nicaraguan and I puffed it like a cigarette. Big mistake. A mild Connecticut and one puff a minute changed everything.',
      '## Pair with what you already love',
      'I love a good espresso, so that’s where I started. Rum came next.',
      '## Find your lounge',
      'The patio crowd in Little Havana welcomed me like family. Meet people in licensed lounges, and ask questions. Everyone loves to teach.',
    ].join('\n\n'),
    reactions: { cheers: 17, salute: 11, wellSaid: 4 },
    reactors: ['m8', 'm1', 'm4'],
  },
  {
    id: 'a-m3',
    slug: 'nashville-lounge-crawl',
    authorId: 'm8',
    title: 'A Weekend Lounge Crawl in Nashville',
    cover: { tone: 22 },
    category: 'Travel',
    at: 'Sep 15, 2026',
    readMins: 5,
    body: [
      'Nashville is more than honky-tonks. Three lounges, two days, one very happy retired sailor.',
      '## Friday: members-only quiet',
      'A leather-chair room with a serious humidor and a bartender who knows his bourbon.',
      '## Saturday: patio and live music',
      'Bring a lancero, grab a rye, and listen. Arrive before 7 for a seat.',
      '**Tip:** always check each lounge’s purchase policy before you go.',
    ].join('\n\n'),
    reactions: { cheers: 9, smokeRing: 5 },
    reactors: ['m6', 'm5'],
  },
  ...BLOG_POSTS.map(
    (p, i): Article => ({
      id: `a-s${i}`,
      slug: p.slug,
      authorId: 'staff',
      title: p.title,
      cover: { tone: p.tone },
      category: i === 2 ? 'News' : p.category,
      at: p.date,
      readMins: Math.max(2, Math.round(p.body.join(' ').split(' ').length / 200)),
      body: p.body.join('\n\n'),
      reactions: { cheers: 12 - i * 2, wellSaid: 6 - i },
      reactors: ['m1', 'm3', 'm7'],
    }),
  ),
]

export const MEMBER_VIDEOS: MemberVideo[] = [
  {
    id: 'v1',
    authorId: 'm1',
    title: 'Toasting the Foot: Torch vs Cedar Spill',
    description: 'Side-by-side on the patio. Cedar spills are slower but the first draw is noticeably sweeter.',
    category: 'Basics',
    video: { kind: 'link', url: 'https://vimeo.com/76979871' },
    tone: 20,
    at: '2d',
    reactions: { cheers: 14, salute: 6 },
    reactors: ['m7', 'm10', 'm4'],
  },
  {
    id: 'v2',
    authorId: 'm5',
    title: 'Armagnac + Cameroon Wrapper Pairing',
    description: 'Why a fruity Armagnac is my favourite match for a Cameroon wrapper. Tasting notes in the comments.',
    category: 'Pairing',
    video: { kind: 'link', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    tone: 42,
    at: '5d',
    reactions: { fire: 8, wellSaid: 5 },
    reactors: ['m3', 'm8'],
  },
]

export const PAIRINGS: CommunityPairing[] = [
  { id: 'pr1', authorId: 'm1', cigar: 'Padrón 1964 Maduro', strength: 'Medium-Full', drink: 'Aged rum', note: 'Cocoa meets molasses. Dessert on the patio.', at: '1d', reactions: { cheers: 23 }, reactors: ['m7', 'm9'] },
  { id: 'pr2', authorId: 'm3', cigar: 'Liga Privada No. 9', strength: 'Full', drink: 'Tawny port', note: 'The port’s nuttiness tames the pepper.', at: '3d', reactions: { cheers: 18, fire: 4 }, reactors: ['m6'] },
  { id: 'pr3', authorId: 'm2', cigar: 'Ashton Classic', strength: 'Mild', drink: 'Flat white', note: 'My 7am Saturday ritual.', at: '4d', reactions: { cheers: 11 }, reactors: ['m10'] },
  { id: 'pr4', authorId: 'm9', cigar: 'AJ Fernandez New World', strength: 'Medium-Full', drink: 'Mezcal', note: 'Smoke on smoke. Trust me.', at: '6d', reactions: { cheers: 9, smokeRing: 3 }, reactors: ['m1'] },
]

export const LOUNGE_REVIEWS: LoungeReview[] = [
  { id: 'r1', loungeId: 'l1', authorId: 'm1', rating: 5, tags: ['Relaxed', 'Social'], pairingMenu: 4, tips: 'Grab the corner patio table before 7. Staff know their maduros.', at: '1w', reactions: { wellSaid: 8 }, reactors: ['m7'] },
  { id: 'r2', loungeId: 'l1', authorId: 'm7', rating: 4, tags: ['Casual', 'Music-Friendly'], pairingMenu: 3, tips: 'Super welcoming to beginners. Live jazz on Thursdays.', at: '2w', reactions: { cheers: 4 }, reactors: ['m1'] },
  { id: 'r3', loungeId: 'l2', authorId: 'm9', rating: 4, tags: ['Upscale', 'Sophisticated'], pairingMenu: 5, tips: 'Excellent whiskey list. Pricey but worth it.', at: '3w', reactions: { cheers: 3 }, reactors: [] },
  { id: 'r4', loungeId: 'l7', authorId: 'm3', rating: 5, tags: ['Quiet', 'Sophisticated'], pairingMenu: 4, tips: 'Best humidor in the city. Ask for the aged room.', at: '1w', reactions: { wellSaid: 6 }, reactors: ['m4'] },
  { id: 'r5', loungeId: 'l10', authorId: 'm8', rating: 5, tags: ['Quiet', 'Upscale'], pairingMenu: 5, tips: 'Members club, but guests welcome with a member. Leather chairs you won’t leave.', at: '5d', reactions: { salute: 5 }, reactors: ['m6'] },
]

/** Comment threads for non-feed items (articles, videos, events, pairings, reviews), keyed by item id. */
export const THREADS: Record<string, Comment[]> = {
  'a-m1': [
    {
      id: 't1', authorId: 'm6', text: 'Great write-up. I’ve seen the same thing with Oliva Serie V: the spice mellows beautifully.', at: '2d', reactions: { wellSaid: 4 },
      replies: [{ id: 't1r', authorId: 'm3', text: 'Serie V is next on my list to box-date!', at: '2d', reactions: { cheers: 1 }, replies: [] }],
    },
    { id: 't2', authorId: 'm10', text: 'Saving this. What humidity do you recommend for aging?', at: '1d', reactions: {}, replies: [] },
  ],
  'a-m2': [{ id: 't3', authorId: 'm8', text: 'Proud of you. Welcome to the circle!', at: '5d', reactions: { salute: 3 }, replies: [] }],
  v1: [{ id: 't4', authorId: 'm10', text: 'Tried the cedar spill last night. Huge difference.', at: '1d', reactions: { cheers: 2 }, replies: [] }],
  e1: [
    {
      id: 't5', authorId: 'm7', text: 'Can I bring a friend who’s new to cigars?', at: '1d', reactions: {},
      replies: [{ id: 't5r', authorId: 'm1', text: 'Absolutely, the more the merrier (21+ of course).', at: '1d', reactions: { cheers: 2 }, replies: [] }],
    },
  ],
  pr1: [{ id: 't6', authorId: 'm7', text: 'Tried this at the patio. Incredible.', at: '12h', reactions: { fire: 1 }, replies: [] }],
}

/** Banner presets for profiles (CSS backgrounds, no stock photos). */
export const BANNERS: Record<string, { label: string; css: string }> = {
  leather: { label: 'Leather', css: 'radial-gradient(ellipse at 80% 20%, rgba(214,154,76,.55), transparent 55%), repeating-linear-gradient(115deg, rgba(255,255,255,.03) 0 2px, transparent 2px 6px), linear-gradient(160deg, #5a3419, #1e120a)' },
  humidor: { label: 'Humidor', css: 'repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 38px), linear-gradient(180deg, #8a5a2e, #4a2c16 70%, #2a1809)' },
  ember: { label: 'Ember', css: 'radial-gradient(circle at 20% 80%, rgba(255,122,42,.7), transparent 40%), radial-gradient(circle at 70% 30%, rgba(242,197,124,.45), transparent 50%), linear-gradient(160deg, #3a1a0c, #120806)' },
  smoke: { label: 'Smoke', css: 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,.28), transparent 45%), radial-gradient(ellipse at 75% 70%, rgba(255,255,255,.18), transparent 50%), linear-gradient(160deg, #5c5048, #221c18)' },
  cream: { label: 'Cream', css: 'radial-gradient(ellipse at 70% 10%, rgba(214,154,76,.35), transparent 55%), linear-gradient(160deg, #f2e6d2, #d9c3a1)' },
  sunset: { label: 'Havana', css: 'linear-gradient(180deg, #e7a25a 0%, #b8562e 45%, #3b1a12 100%)' },
}
