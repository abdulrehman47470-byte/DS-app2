import type { BlogPost, Conversation, Lounge, VideoSession } from '@/types'

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    memberId: 'm1',
    matchedAt: '2 days ago',
    unread: 2,
    messages: [
      { id: '1', from: 'them', text: 'Hey! Great match. Love your profile and cigar preferences.', at: '10:24 AM' },
      { id: '2', from: 'me', text: 'Thanks! Same here. Do you have a favorite lounge in Miami?', at: '10:28 AM', status: 'read' },
      { id: '3', from: 'them', text: 'The patio at a spot in Little Havana is my go-to. Want to join a small group there this weekend?', at: '10:32 AM' },
      { id: '4', from: 'them', text: 'Bringing a couple of aged maduros to share.', at: '10:33 AM' },
    ],
  },
  {
    id: 'c2',
    memberId: 'm3',
    matchedAt: '3 days ago',
    unread: 0,
    messages: [
      { id: '1', from: 'me', text: 'Your humidor setup looks incredible. How long have you been aging?', at: 'Yesterday', status: 'read' },
      { id: '2', from: 'them', text: "About twelve years. That's a solid choice, by the way — the Tatuaje you mentioned ages beautifully.", at: 'Yesterday' },
    ],
  },
  {
    id: 'c3',
    memberId: 'm4',
    matchedAt: '1 week ago',
    unread: 1,
    messages: [{ id: '1', from: 'them', text: 'Looking forward to it!', at: 'Yesterday' }],
  },
  {
    id: 'c4',
    memberId: 'm7',
    matchedAt: '1 week ago',
    unread: 0,
    messages: [
      { id: '1', from: 'them', text: 'Perfect, I’m in. Can you show me how to use a punch cut?', at: '2 days ago' },
      { id: '2', from: 'me', text: 'Absolutely — easiest cut there is.', at: '2 days ago', status: 'delivered' },
    ],
  },
  {
    id: 'c5',
    memberId: 'm6',
    matchedAt: '2 weeks ago',
    unread: 0,
    messages: [{ id: '1', from: 'them', text: 'Great discussion today.', at: '2 days ago' }],
  },
  {
    id: 'c6',
    memberId: 'm9',
    matchedAt: 'Today',
    unread: 0,
    messages: [],
  },
]

// TODO(phase 7): replace with the 515 lounges from "US Cigar Lounges.xlsx". These are fictional.
export const LOUNGES: Lounge[] = [
  { id: 'l1', name: 'The Ember Room', venueType: 'Lounge', street: '1450 SW 8th St', city: 'Miami', state: 'FL', zip: '33135', phone: '(305) 555-0142', metro: 'Miami', verificationNote: 'Phone verified', x: 34, y: 58, miles: 1.2 },
  { id: 'l2', name: 'Brickell Leaf & Barrel', venueType: 'Lounge + Shop', street: '88 SW 7th St', city: 'Miami', state: 'FL', zip: '33130', phone: '(305) 555-0187', metro: 'Miami', verificationNote: 'Phone unverified', x: 52, y: 44, miles: 2.4 },
  { id: 'l3', name: 'Havana Nights Social Club', venueType: 'Members club', street: '2100 Coral Way', city: 'Miami', state: 'FL', zip: '33145', phone: '(305) 555-0119', metro: 'Miami', verificationNote: 'Address verified', x: 24, y: 36, miles: 3.1 },
  { id: 'l4', name: 'The Smoke Room', venueType: 'Shop + Lounge', street: '420 Collins Ave', city: 'Miami Beach', state: 'FL', zip: '33139', phone: '(305) 555-0164', metro: 'Miami', verificationNote: 'Phone unverified', x: 72, y: 30, miles: 4.8 },
  { id: 'l5', name: 'Cedar & Oak Lounge', venueType: 'Lounge', street: '315 W Hubbard St', city: 'Chicago', state: 'IL', zip: '60654', phone: '(312) 555-0133', metro: 'Chicago', verificationNote: 'Phone verified', x: 62, y: 66, miles: 1187 },
  { id: 'l6', name: 'Maduro Social', venueType: 'Lounge + Shop', street: '1901 E 6th St', city: 'Austin', state: 'TX', zip: '78702', phone: '(512) 555-0171', metro: 'Austin', verificationNote: 'Address unverified', x: 44, y: 74, miles: 1111 },
  { id: 'l7', name: 'The Gilded Band', venueType: 'Members club', street: '700 Broadway', city: 'Nashville', state: 'TN', zip: '37203', phone: '(615) 555-0126', metro: 'Nashville', verificationNote: 'Phone verified', x: 80, y: 52, miles: 816 },
  { id: 'l8', name: 'Leaf & Ledger', venueType: 'Shop + Lounge', street: '2525 Larimer St', city: 'Denver', state: 'CO', zip: '80205', phone: '(303) 555-0158', metro: 'Denver', verificationNote: 'Phone unverified', x: 16, y: 22, miles: 1720 },
  { id: 'l9', name: 'Humidor House', venueType: 'Lounge', street: '11 Peachtree Pl', city: 'Atlanta', state: 'GA', zip: '30309', phone: '(404) 555-0190', metro: 'Atlanta', verificationNote: 'Phone verified', x: 58, y: 18, miles: 604 },
  { id: 'l10', name: 'Pacific Ash Club', venueType: 'Lounge + Shop', street: '555 Fifth Ave', city: 'San Diego', state: 'CA', zip: '92101', phone: '(619) 555-0105', metro: 'San Diego', verificationNote: 'Address verified', x: 88, y: 80, miles: 2267 },
]

export const SESSIONS: VideoSession[] = [
  { id: 's1', title: 'Cigar 101: The Basics', duration: '12:45', category: 'Basics', vimeoId: '000000001', tone: 26, tags: ['Basics', 'Tasting', 'Beginner'], description: 'A beginner-friendly guide to cigars, covering history, types, how to cut and light, and more.' },
  { id: 's2', title: 'Whiskey Pairings', duration: '15:32', category: 'Pairing', vimeoId: '000000002', tone: 34, tags: ['Pairing', 'Whiskey'], description: 'How to match body and sweetness between a cigar and your pour, from bourbon to peated Scotch.' },
  { id: 's3', title: 'Humidor Management', duration: '10:55', category: 'Humidor', vimeoId: '000000003', tone: 18, tags: ['Humidor', 'Storage'], description: 'Seasoning, humidity targets, two-way packs and the mistakes that dry out a collection.' },
  { id: 's4', title: 'Reading a Wrapper', duration: '14:31', category: 'Tasting', vimeoId: '000000004', tone: 40, tags: ['Tasting', 'Wrapper'], description: 'From Connecticut shade to oscuro: what color, oil and veins tell you before the first draw.' },
  { id: 's5', title: 'Cutting & Lighting', duration: '08:12', category: 'Basics', vimeoId: '000000005', tone: 12, tags: ['Basics', 'Cut'], description: 'Guillotine, punch and V-cut side by side, plus toasting the foot for an even burn.' },
  { id: 's6', title: 'Aging at Home', duration: '18:04', category: 'Humidor', vimeoId: '000000006', tone: 30, tags: ['Aging', 'Humidor'], description: 'Which cigars reward patience, how to log box dates, and when to stop waiting.' },
]

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'perfect-cigar-pairing',
    title: 'The Perfect Cigar Pairing',
    date: 'Apr 12, 2026',
    category: 'Tips',
    tone: 30,
    excerpt: 'Pairing cigars with the right drink can elevate your experience to a whole new level.',
    body: [
      'Pairing cigars with the right drink can elevate your experience to a whole new level. Whether it’s a rich bourbon, a smooth whiskey or a fine coffee, the right pairing brings out the unique flavors and complexity of your cigar.',
      'Start with body. A mild Connecticut-wrapped cigar can be overwhelmed by a cask-strength pour, while a full maduro will flatten a delicate white wine. Match weight to weight first, then play with flavor.',
      'Next, decide between complementing and contrasting. Complement a cocoa-forward maduro with an espresso; contrast a peppery Nicaraguan with the sweetness of an aged rum.',
      'Finally, sip water between draws. A clean palate lets both the cigar and the drink show what they have.',
    ],
  },
  {
    slug: 'build-a-humidor',
    title: 'How to Build a Humidor',
    date: 'Apr 8, 2026',
    category: 'Humidor',
    tone: 18,
    excerpt: 'A step-by-step guide to seasoning and maintaining your first humidor.',
    body: [
      'A humidor protects your cigars from the two things that ruin them fastest: dry air and temperature swings.',
      'Season a new wooden humidor before use by letting the cedar absorb moisture slowly over several days. Aim for a stable 65–70% relative humidity at around 65–70°F.',
      'Use a calibrated hygrometer and check it weekly for the first month. Two-way humidity packs are the easiest way to keep things steady.',
    ],
  },
  {
    slug: 'top-cigars-2026',
    title: 'Top 10 Cigars of 2026',
    date: 'Apr 5, 2026',
    category: 'Brands',
    tone: 40,
    excerpt: 'The members’ favorites this year, from everyday smokes to special-occasion sticks.',
    body: [
      'Every year our members share what landed in their rotation. This list is placeholder editorial content until the client provides the final article.',
      'Expect a mix of boutique releases, reliable everyday robustos and a few well-aged surprises.',
    ],
  },
  {
    slug: 'history-of-cuban-cigars',
    title: 'The History of Cuban Cigars',
    date: 'Apr 1, 2026',
    category: 'Lifestyle',
    tone: 24,
    excerpt: 'From the Vuelta Abajo to the modern day: how Cuba shaped the cigar world.',
    body: [
      'The story of the premium cigar runs through western Cuba, where the soil and climate of the Vuelta Abajo produce some of the most celebrated tobacco in the world.',
      'Placeholder article. Final copy to be supplied by the client.',
    ],
  },
]
