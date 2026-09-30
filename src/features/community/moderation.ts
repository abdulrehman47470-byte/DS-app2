/**
 * Basic client-side text filter. The same rules run server-side in Phase 10
 * (Edge Function), with an image-safety provider behind an interface.
 * Tobacco advertising law + Code of Ethics: no selling, advertising or soliciting.
 */
const SELLING = [
  /\bfor sale\b/i,
  /\bselling\b/i,
  /\bwt[sb]\b/i, // want to sell / buy
  /\b(dm|message) (me )?(to|for) (buy|order|price)/i,
  /\$\s?\d+\s?(each|per|\/)/i,
  /\b(venmo|cash ?app|zelle|paypal)\b/i,
  /\bship(ping)? (included|available)\b/i,
  /\bpromo code\b/i,
]
const SHOP_LINK = /https?:\/\/[^\s]*(shop|store|buy|deal|discount)[^\s]*/i
// TODO(phase 10): maintained slur/spam list lives server-side; kept out of the client bundle.
const SPAM = [/(.)\1{9,}/, /\b(click here|free money|crypto giveaway)\b/i]

export function checkContent(text: string): string | null {
  if (SELLING.some((r) => r.test(text))) return 'Posts can’t sell, advertise or solicit tobacco or other regulated goods.'
  if (SHOP_LINK.test(text)) return 'Links to shops aren’t allowed. Share lounges with the location tag instead.'
  if (SPAM.some((r) => r.test(text))) return 'This looks like spam. Please rephrase.'
  return null
}
