import type { KeyboardEvent } from 'react'

/**
 * Phone-keyboard helpers for forms.
 * - focusNextOnEnter: the keyboard's "Next" key moves to the next field instead of doing nothing.
 * - keyboardProps: correct keyboard, capitalisation and autocorrect for each kind of field.
 */
export function focusNextOnEnter(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
  const fields = [...document.querySelectorAll<HTMLElement>('input:not([type=hidden]):not([disabled]):not([type=checkbox]):not([type=radio]):not([type=file]), select:not([disabled]), textarea:not([disabled])')].filter(
    (el) => el.offsetParent !== null,
  )
  const i = fields.indexOf(e.currentTarget)
  const next = fields[i + 1]
  if (next) {
    e.preventDefault()
    next.focus()
  }
}

type Kind = 'name' | 'email' | 'password' | 'city' | 'zip' | 'url' | 'handle' | 'number' | 'text'

export function keyboardProps(kind: Kind, last = false) {
  const enter = { enterKeyHint: (last ? 'done' : 'next') as 'done' | 'next', onKeyDown: last ? undefined : focusNextOnEnter }
  const plain = { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }
  switch (kind) {
    case 'name':
      return { ...enter, autoCapitalize: 'words', autoCorrect: 'off', spellCheck: false }
    case 'city':
      return { ...enter, autoCapitalize: 'words' }
    case 'email':
      return { ...enter, ...plain, inputMode: 'email' as const }
    case 'password':
      return { ...enter, ...plain }
    case 'zip':
    case 'number':
      return { ...enter, inputMode: 'numeric' as const }
    case 'url':
      return { ...enter, ...plain, inputMode: 'url' as const }
    case 'handle':
      return { ...enter, ...plain }
    default:
      return enter
  }
}
