import type { Variants } from '../types'

// PRD section 8 test arms. Moderators pick them in You → Study settings, or share a link like ?onboarding=quiz.
export const VARIANT_OPTIONS: { key: keyof Variants; label: string; options: { id: string; label: string }[] }[] = [
  {
    key: 'onboarding',
    label: 'Onboarding (8.3)',
    options: [
      { id: 'voice', label: 'A: Voice conversation' },
      { id: 'quiz', label: 'B: Quick quiz' },
    ],
  },
  {
    key: 'logging',
    label: 'Meal logging (8.4)',
    options: [
      { id: 'edit', label: 'A: Photo + corrections' },
      { id: 'photo-only', label: 'B: Photo only' },
    ],
  },
  {
    key: 'recommendation',
    label: 'Recommendation (8.5)',
    options: [
      { id: 'next-step', label: 'A: Next step + Why' },
      { id: 'data-only', label: 'B: Nutrition data only' },
    ],
  },
  {
    key: 'grocery',
    label: 'Grocery (8.6)',
    options: [
      { id: 'cart', label: 'A: List + online cart' },
      { id: 'list-only', label: 'B: Simple list' },
    ],
  },
  {
    key: 'checkin',
    label: 'Weekly check-in (8.7)',
    options: [
      { id: 'on', label: 'A: Check-in' },
      { id: 'off', label: 'B: No check-in' },
    ],
  },
]

export const DEFAULT_VARIANTS: Variants = {
  onboarding: 'voice',
  logging: 'edit',
  recommendation: 'next-step',
  grocery: 'cart',
  checkin: 'on',
}

export function readVariants(): Variants {
  const params = new URLSearchParams(window.location.search)
  const variants = { ...DEFAULT_VARIANTS }
  for (const { key, options } of VARIANT_OPTIONS) {
    const value = params.get(key)
    if (value && options.some((option) => option.id === value)) Object.assign(variants, { [key]: value })
  }
  return variants
}

export function writeVariants(variants: Variants) {
  const params = new URLSearchParams(window.location.search)
  for (const { key } of VARIANT_OPTIONS) {
    if (variants[key] === DEFAULT_VARIANTS[key]) params.delete(key)
    else params.set(key, variants[key])
  }
  const query = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
}
