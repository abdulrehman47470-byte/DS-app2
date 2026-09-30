/**
 * Profile option lists.
 *
 * TODO(docs): these lists come from the build prompt's SUMMARY. The client's
 * documents in /docs are the source of truth; once they are added, replace these
 * with the full lists (exact wording and order) and track them in requirements.json.
 * Options marked in LEGACY exist only in the older "Daily Stogie Profile.docx" and
 * are kept (union rule) until the client confirms or removes them.
 */

export const USER_TYPES = ['Beginner', 'Intermediate', 'Advanced', 'Aficionado', 'Collector'] as const

// TODO(client): gender, pronoun, ethnicity, country and state lists were not supplied.
export const GENDERS = [
  'Man',
  'Woman',
  'Non-binary',
  'Transgender man',
  'Transgender woman',
  'Genderqueer',
  'Agender',
  'Two-spirit',
  'Other',
  'Prefer not to say',
]
export const PRONOUNS = ['He / Him', 'She / Her', 'They / Them', 'Other', 'Prefer not to say']
export const ETHNICITIES = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Middle Eastern or North African',
  'Native Hawaiian or Pacific Islander',
  'White',
  'Multiracial',
  'Other',
  'Prefer not to say',
]
export const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Ireland',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Switzerland',
  'Dominican Republic',
  'Nicaragua',
  'Honduras',
  'Cuba',
  'Brazil',
  'Australia',
  'New Zealand',
  'United Arab Emirates',
  'Pakistan',
  'India',
  'Japan',
  'Singapore',
  'South Africa',
]
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]
export const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
]
export const STATES_BY_COUNTRY: Record<string, string[]> = {
  'United States': US_STATES,
  Canada: CA_PROVINCES,
}

export interface OptionGroup {
  id: string
  label: string
  kind: 'single' | 'multi'
  options: string[]
  searchable?: boolean
  /** Sub-headings rendered inside the group, e.g. flavor families. */
  subgroups?: { label: string; options: string[] }[]
  hint?: string
}

export interface PrefSection {
  id: string
  title: string
  groups: OptionGroup[]
  special?: 'price' | 'strengthScale' | 'wishlist'
}

const BRANDS = [
  'Arturo Fuente', 'Padrón', 'Liga Privada', 'My Father', 'Rocky Patel', 'Oliva', 'Perdomo',
  'Davidoff', 'Cohiba', 'Montecristo', 'Macanudo', 'Tatuaje', 'Illusione', 'Crowned Heads',
  'Camacho', 'AJ Fernandez', 'Ashton', 'Alec Bradley', 'CAO', 'Drew Estate', 'Undercrown',
  'Romeo y Julieta', 'H. Upmann', 'Partagás', 'Hoyo de Monterrey', 'Punch', 'Bolivar',
  'Trinidad', 'Ramon Allones', 'Juan Lopez', 'La Flor Dominicana', 'Plasencia', 'Joya de Nicaragua',
  'Aganorsa Leaf', 'Warped', 'Dunbarton Tobacco & Trust', 'Foundation', 'E.P. Carrillo',
  'La Aroma de Cuba', 'Diamond Crown', 'Kristoff', 'Espinosa', 'Room101', 'Caldwell',
  'Southern Draw', 'Villiger', 'Brick House', 'Nub', 'Acid', 'San Cristobal', 'Don Pepin Garcia',
  'Tabacalera Garcia', 'Casa Magna', 'Gurkha', 'Avo', 'Zino', 'Cuesta-Rey', 'La Gloria Cubana',
  'Excalibur', 'Hemingway', 'Cusano', 'Nat Sherman', 'Ezra Zion', 'Black Label Trading Co.',
  'Viaje', 'RoMa Craft', 'Fratello', 'Oscar Valladares', 'Other',
]

export const LEGACY = new Set([
  'Churchill',
  'Vodka',
  'Red Wine',
  'White Wine',
  'Conversational',
  'Double binders',
  'Homogenized binders',
  'Indonesian Sumatra',
  'Brazilian',
  'Costa Rican',
  'Peruvian',
  'Connecticut Broadleaf (binder)',
  '$10-$15',
  "Doesn't Matter",
  'Singles',
  'Bundles',
  'Boxes',
  'Mix',
])

export const PREF_SECTIONS: PrefSection[] = [
  {
    id: 'lounge',
    title: 'Lounge & Atmosphere',
    groups: [
      {
        id: 'loungeType',
        label: 'Lounge type',
        kind: 'multi',
        options: [
          'Traditional Cigar Lounge', 'Upscale/Luxury Lounge', 'Cigar Bar', 'Members-Only Club',
          'Social Cigar Club', 'Whiskey/Cigar Lounge', 'Outdoor Cigar Patio', 'Private Humidor Club',
          'Hotel/Resort Lounge', 'Retail Shop With Lounge', 'Speakeasy/Cocktail Lounge', 'No Preference',
        ],
      },
      {
        id: 'atmosphere',
        label: 'Atmosphere',
        kind: 'multi',
        options: [
          'Quiet', 'Relaxed', 'Social', 'Sophisticated', 'Lively', 'Upscale', 'Casual',
          'Music-Friendly', 'Sports-Friendly',
        ],
      },
      {
        id: 'frequency',
        label: 'How often do you smoke?',
        kind: 'single',
        options: ['Daily', 'Several times a week', 'Weekly', 'A few times a month', 'Occasionally', 'Rarely'],
      },
    ],
  },
  {
    id: 'brands',
    title: 'Favorite Brands',
    groups: [
      {
        id: 'brands',
        label: 'Favorite brands',
        kind: 'multi',
        searchable: true,
        options: BRANDS,
        hint: 'Search and pick as many as you like.',
      },
    ],
  },
  {
    id: 'buying',
    title: 'Buying & Price',
    special: 'price',
    groups: [
      {
        id: 'purchase',
        label: 'Purchase habits',
        kind: 'multi',
        options: [
          'Single', '2-5 Cigars', '5-10 Cigars', 'Bundle', 'Box', 'Box Splits', 'Sampler',
          'Limited Releases', 'Online Deals', 'Lounge/Retail Shop', 'Auctions/Secondary Market',
          'Singles', 'Bundles', 'Boxes', 'Mix',
        ],
      },
      {
        id: 'philosophy',
        label: 'Buying philosophy',
        kind: 'multi',
        options: [
          'Buy what I plan to smoke', 'Stock up on favorites', 'Hunt for deals', 'Hunt limited releases',
          'Buy based on recommendations', 'Buy based on brand', 'Buy based on wrapper/origin',
          'Impulse/New Discovery',
        ],
      },
    ],
  },
  {
    id: 'format',
    title: 'Size & Shape',
    groups: [
      {
        id: 'ringGauge',
        label: 'Ring gauge',
        kind: 'multi',
        options: ['Slim 32-42', 'Medium 43-49', 'Thick 50-54', 'Extra Thick 55+'],
      },
      {
        id: 'vitola',
        label: 'Vitola',
        kind: 'multi',
        options: ['Corona', 'Lonsdale', 'Robusto', 'Toro', 'Gordo', 'Double Corona', 'Lancero', 'Churchill'],
      },
      {
        id: 'length',
        label: 'Length',
        kind: 'multi',
        options: ['Short (under 5")', 'Medium (5-6")', 'Long (6-7")', 'Extra Long (7"+)'],
      },
      {
        id: 'duration',
        label: 'Smoking duration',
        kind: 'single',
        options: ['Under 30 min', '30-45 min', '45-60 min', '60-90 min', '90+ min'],
      },
    ],
  },
  {
    id: 'collection',
    title: 'Collection & Aging',
    groups: [
      {
        id: 'collectionSize',
        label: 'Collection size',
        kind: 'single',
        options: [
          "I don't keep a collection", 'Under 25', '25-50', '51-100', '101-300', '301-500', '500+',
        ],
      },
      {
        id: 'collectionStyle',
        label: 'Collection style',
        kind: 'multi',
        options: [
          'Casual Smoker', 'Curated Rotation', 'Serious Collector', 'Aging Focused', 'Trader',
          'Limited Release Hunter', 'Brand Loyalist', 'Boutique Hunter', 'Buy What I Like',
          'Investment/Rare Cigar Collector',
        ],
      },
      {
        id: 'aging',
        label: 'Aging / resting',
        kind: 'single',
        options: [
          'Smoke Fresh', 'Rest a Few Weeks', 'Rest Several Months', 'Age 1-2 Years', 'Age 3-5 Years',
          'Long-Term Aging', 'Prefer Well-Aged Cigars', 'No Preference',
        ],
      },
      {
        id: 'agingInterest',
        label: 'Aging interest',
        kind: 'single',
        options: ['Not Interested', 'Curious', 'Serious Aging', 'Hobby'],
      },
      {
        id: 'storage',
        label: 'Storage',
        kind: 'multi',
        options: [
          'Desktop Humidor', 'Cabinet Humidor', 'Travel Humidor', 'Tupperdor', 'Cigar Cooler',
          'Humidor Bag', 'Factory Box', 'Multiple Systems', 'Boveda/2-Way',
          'Electronic Humidification', 'Temperature Controlled', 'No Formal Storage',
        ],
      },
      {
        id: 'humidity',
        label: 'Humidity tracking',
        kind: 'single',
        options: ["Don't Track", 'Occasionally Check', 'Regularly Monitor', 'Precision Collector'],
      },
    ],
  },
  {
    id: 'tobacco',
    title: 'Tobacco & Strength',
    special: 'strengthScale',
    groups: [
      {
        id: 'origin',
        label: 'Origin',
        kind: 'multi',
        options: [
          'Nicaragua', 'Dominican Republic', 'Honduras', 'Cuba', 'Mexico', 'Ecuador', 'United States',
          'Brazil', 'Cameroon', 'Indonesia', 'Costa Rica', 'Colombia', 'Other', 'Open to All',
        ],
      },
      {
        id: 'strength',
        label: 'Strength preference',
        kind: 'single',
        options: ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'],
      },
      {
        id: 'styleTags',
        label: 'Style',
        kind: 'multi',
        options: [
          'Complex/Layered', 'Smooth/Creamy', 'Bold/Robust', 'Pepper-Forward', 'Flavor-Forward',
          'Construction-Focused', 'Long-Finish', 'Consistent/Reliable', 'Experimental/Unique',
          'Limited/Rare Releases', 'Boutique/Small-Batch', 'Classic/Traditional',
        ],
      },
      {
        id: 'intensity',
        label: 'Intensity',
        kind: 'single',
        options: ['Low', 'Medium', 'High', 'Very High'],
      },
      {
        id: 'wrapper',
        label: 'Wrapper',
        kind: 'multi',
        options: [
          'Connecticut Shade', 'Connecticut Broadleaf', 'Ecuador Connecticut', 'Habano', 'Ecuador Habano',
          'Nicaraguan Habano', 'Mexican San Andrés', 'Maduro', 'Oscuro', 'Cameroon', 'Corojo', 'Criollo',
          'Sumatra', 'Pennsylvania Broadleaf', 'Candela', 'Other', 'No Preference',
        ],
      },
      {
        id: 'binder',
        label: 'Binder / filler',
        kind: 'multi',
        options: [
          'Nicaraguan', 'Dominican', 'Honduran', 'Mexican', 'Ecuadorian', 'Indonesian', 'Other',
          'No Preference', 'Double binders', 'Homogenized binders', 'Indonesian Sumatra', 'Brazilian',
          'Costa Rican', 'Peruvian', 'Connecticut Broadleaf (binder)',
        ],
      },
      {
        id: 'binderImportance',
        label: 'How important is binder/filler?',
        kind: 'single',
        options: [
          'Very Important', 'Somewhat Important', 'I know enough to care', "I don't really care",
          "I don't know / Teach me",
        ],
      },
    ],
  },
  {
    id: 'flavor',
    title: 'Flavor',
    groups: [
      {
        id: 'flavors',
        label: 'Flavor notes',
        kind: 'multi',
        options: [],
        subgroups: [
          { label: 'Earth', options: ['Earth', 'Loam', 'Mineral'] },
          { label: 'Wood', options: ['Wood', 'Cedar', 'Oak', 'Leather'] },
          { label: 'Coffee', options: ['Coffee', 'Espresso', 'Roasted'] },
          {
            label: 'Sweet',
            options: ['Sweet', 'Cream', 'Caramel', 'Vanilla', 'Honey', 'Molasses', 'Brown Sugar'],
          },
          { label: 'Nuts', options: ['Almond', 'Cashew', 'Walnut', 'Hazelnut'] },
          { label: 'Chocolate', options: ['Cocoa', 'Dark Chocolate', 'Milk Chocolate'] },
          {
            label: 'Spice',
            options: ['Black Pepper', 'White Pepper', 'Red Pepper', 'Baking Spice', 'Cinnamon', 'Nutmeg'],
          },
          { label: 'Fruit', options: ['Dried Fruit', 'Raisin', 'Fig', 'Cherry', 'Citrus'] },
          {
            label: 'Other',
            options: ['Toast', 'Bread', 'Tobacco', 'Floral', 'Herbal', 'Licorice', 'Tea', 'Butter'],
          },
        ],
      },
      {
        id: 'flavorIntensity',
        label: 'Flavor intensity',
        kind: 'single',
        options: ['Subtle', 'Moderate', 'Pronounced'],
      },
    ],
  },
  {
    id: 'ritual',
    title: 'Ritual & Setting',
    groups: [
      {
        id: 'cut',
        label: 'Preferred cut',
        kind: 'single',
        options: [
          'Straight/Guillotine', 'Double Blade', 'V-Cut', 'Punch', 'Scissors', 'Perfect Cutter',
          'No Preference',
        ],
      },
      {
        id: 'venue',
        label: 'Preferred venue',
        kind: 'multi',
        options: [
          'Home', 'Cigar Lounge', 'Cigar Bar', 'Patio', 'Backyard', 'Beach/Outdoor', 'Golf', 'Travel',
          'Hotel/Resort', 'Events', 'Private Club', 'Anywhere I Can Smoke',
        ],
      },
      {
        id: 'timeOfDay',
        label: 'Time of day',
        kind: 'multi',
        options: [
          'Morning', 'Late Morning', 'Afternoon', 'Early Evening', 'Evening', 'Late Night',
          'After Dinner', 'Anytime',
        ],
      },
      {
        id: 'pace',
        label: 'Smoking pace',
        kind: 'single',
        options: ['Slow & Contemplative', 'Relaxed', 'Medium', 'Fast', 'Depends on the cigar', 'Conversational'],
      },
    ],
  },
  {
    id: 'pairing',
    title: 'Pairings',
    groups: [
      {
        id: 'pairings',
        label: 'Spirit pairing',
        kind: 'multi',
        options: [
          'Whiskey', 'Bourbon', 'Rye', 'Scotch', 'Irish Whiskey', 'Japanese Whisky', 'Cognac',
          'Armagnac', 'Rum', 'Tequila', 'Mezcal', 'Brandy', 'Craft Beer', 'Wine', 'Port', 'Coffee',
          'Espresso', 'Tea', 'Sparkling Water', 'Non-Alcoholic Cocktails', 'Water', 'Vodka',
          'Red Wine', 'White Wine',
        ],
      },
      {
        id: 'pairingStyle',
        label: 'Pairing style',
        kind: 'multi',
        options: ['Complementary', 'Contrasting', 'Sweet + Bold', 'Smooth + Strong', 'Experimental'],
      },
    ],
  },
  {
    id: 'smoke',
    title: 'Smoke & Construction',
    groups: [
      {
        id: 'smokeVolume',
        label: 'Smoke volume',
        kind: 'single',
        options: ['Light', 'Medium', 'Heavy', 'Very Heavy', 'No Preference'],
      },
      {
        id: 'ashManagement',
        label: 'Ash management',
        kind: 'single',
        options: [
          'Let It Ride', 'Tap Frequently', 'Long Ash', 'Depends on the Cigar', "I Don't Care",
          'Ashtray Is Part of the Experience',
        ],
      },
      {
        id: 'ashPreference',
        label: 'Ash preference',
        kind: 'multi',
        options: ['Long / Firm', 'Medium', 'Short', 'No Preference'],
      },
      {
        id: 'construction',
        label: 'Construction preferences',
        kind: 'multi',
        options: [
          'Firm Draw', 'Open Draw', 'Medium Draw', 'Easy Draw', 'Excellent Combustion', 'Slow Burning',
          'Even Burn', 'Long Ash', 'Firm Ash', 'Consistent Construction', 'Construction Tolerance',
          'Depends on the Cigar',
        ],
      },
    ],
  },
  {
    id: 'social',
    title: 'Social & Mentorship',
    special: 'wishlist',
    groups: [
      {
        id: 'socialStyle',
        label: 'Social style',
        kind: 'multi',
        options: [
          'Solo Smoker', 'One-on-One', 'Small Groups', 'Large Groups', 'Cigar Events',
          'Club/Membership', 'Online Communities', 'Depends on the Occasion',
        ],
      },
      {
        id: 'meetup',
        label: 'Meetup willingness',
        kind: 'single',
        options: [
          'Open to Local Meetups', 'Open to Cigar Events', 'Open to Traveling for Events',
          'Friends/Established Groups Only', 'Online Only', 'Prefer Not To Meet',
        ],
      },
      {
        id: 'mentorship',
        label: 'Mentorship',
        kind: 'single',
        options: ['Willing to Guide Beginners', 'Looking for a Mentor', 'Both', 'Neither'],
      },
      {
        id: 'mentorTopics',
        label: 'Mentorship topics',
        kind: 'multi',
        options: MENTOR_TOPICS_LIST(),
      },
    ],
  },
]

function MENTOR_TOPICS_LIST() {
  return ['Cigar Basics', 'Cutting & Lighting', 'Tasting', 'Pairing', 'Humidor Management', 'Aging']
}
export const MENTOR_TOPICS = MENTOR_TOPICS_LIST()

export const MEETUP_OPTIONS = PREF_SECTIONS.find((s) => s.id === 'social')!.groups.find(
  (g) => g.id === 'meetup',
)!.options
export const MENTORSHIP_OPTIONS = ['Willing to Guide Beginners', 'Looking for a Mentor', 'Both', 'Neither']

/** Profile #3 "About You". About 10 mock options each until the xlsx files are seeded. */
export interface AboutField {
  id: string
  label: string
  kind: 'single' | 'multi'
  quickPicks?: string[]
  options: string[]
  sensitive?: boolean
}

export const ABOUT_FIELDS: AboutField[] = [
  {
    id: 'industry',
    label: 'Professional industry',
    kind: 'single',
    options: [
      'Accounting', 'Architecture', 'Banking & Finance', 'Construction', 'Consulting', 'Education',
      'Healthcare', 'Hospitality', 'Law', 'Real Estate', 'Technology', 'Other',
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    kind: 'multi',
    options: [
      'Golf', 'Football', 'Baseball', 'Basketball', 'Boxing', 'Fishing', 'Hockey', 'Hunting',
      'Sailing', 'Tennis',
    ],
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    kind: 'multi',
    options: [
      'Classic Cars', 'Cooking', 'Grilling & BBQ', 'Photography', 'Reading', 'Travel', 'Whiskey Tasting',
      'Woodworking', 'Wine Collecting', 'Watches',
    ],
  },
  {
    id: 'firstResponder',
    label: 'Military / First Responder',
    kind: 'single',
    quickPicks: ['US Military', 'Police Officer', 'Firefighter', 'Paramedic/EMT', 'Lifeguard'],
    options: [
      'Air Force Veteran', 'Army Veteran', 'Coast Guard', 'Corrections Officer', 'Dispatcher (911)',
      'Marine Corps Veteran', 'National Guard', 'Navy Veteran', 'Search & Rescue', 'Sheriff’s Deputy',
    ],
  },
  {
    id: 'languages',
    label: 'Languages spoken',
    kind: 'multi',
    options: [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 'Urdu', 'Hindi',
      'Mandarin',
    ],
  },
  {
    id: 'religion',
    label: 'Religion',
    kind: 'single',
    sensitive: true,
    options: [
      'Agnostic', 'Atheist', 'Buddhist', 'Christian', 'Catholic', 'Hindu', 'Jewish', 'Muslim',
      'Spiritual', 'Prefer not to say',
    ],
  },
  {
    id: 'music',
    label: 'Music preference',
    kind: 'multi',
    options: [
      'Blues', 'Classic Rock', 'Country', 'Hip-Hop', 'Jazz', 'Latin', 'Motown & Soul', 'R&B',
      'Classical', 'Salsa',
    ],
  },
  {
    id: 'political',
    label: 'Political affiliation',
    kind: 'single',
    sensitive: true,
    quickPicks: [
      'Republican', 'Democrat', 'Independent', 'Far left', 'Left/Progressive', 'Center-left',
      'Centrist/Moderate', 'Center-right', 'Right/Conservative', 'Far right', 'Libertarian',
      'Green/Environmentalist', 'Populist', 'Nationalist', 'Socialist', 'Communist', 'Anarchist',
      'Apolitical/Non-affiliated', 'Not Applicable',
    ],
    options: [
      'Constitution Party', 'Working Families Party', 'Forward Party', 'Reform Party',
      'Libertarian Party', 'Green Party', 'Democratic Socialists', 'Tea Party', 'Moderate Republican',
      'Blue Dog Democrat',
    ],
  },
]
