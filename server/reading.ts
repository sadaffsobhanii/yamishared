// Checks what the vision model returned before the app trusts it. No imports, so it can be tested without a server or a key.

export type VisionItem = { name: string; usda: string; grams: number; size: 'small' | 'regular' | 'large'; kind: string; whole: boolean }
export type VisionResult = { food: boolean; meal: string; place: string | null; items: VisionItem[] }

const SIZES = ['small', 'regular', 'large']
const KINDS = ['vegetable', 'fruit', 'plant protein', 'animal protein', 'dairy', 'whole grain', 'refined grain', 'fat', 'sweet', 'drink', 'other']

// A plate of food is never zero or several kilos; a wild number would silently wreck the nutrition math.
const MIN_GRAMS = 5
const MAX_GRAMS = 1500

export function normalizeReading(raw: unknown, placeIds: string[]): VisionResult {
  if (!raw || typeof raw !== 'object') throw new Error('bad-shape')
  const data = raw as Record<string, unknown>
  if (typeof data.food !== 'boolean' || !Array.isArray(data.items)) throw new Error('bad-shape')
  if (!data.food) return { food: false, meal: 'Your meal', place: null, items: [] }

  const seen = new Set<string>()
  const items: VisionItem[] = []
  for (const entry of data.items) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const name = typeof e.name === 'string' ? e.name.trim() : ''
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    const grams = typeof e.grams === 'number' && Number.isFinite(e.grams) ? Math.min(MAX_GRAMS, Math.max(MIN_GRAMS, Math.round(e.grams))) : 100
    items.push({
      name,
      usda: typeof e.usda === 'string' && e.usda.trim() ? e.usda.trim() : name,
      grams,
      size: SIZES.includes(e.size as string) ? (e.size as VisionItem['size']) : 'regular',
      kind: KINDS.includes(e.kind as string) ? (e.kind as string) : 'other',
      whole: e.whole === true,
    })
  }
  if (!items.length) throw new Error('no-items')
  return {
    food: true,
    meal: typeof data.meal === 'string' && data.meal.trim() ? data.meal.trim() : 'Your meal',
    place: typeof data.place === 'string' && placeIds.includes(data.place) ? data.place : null,
    items: items.slice(0, 12),
  }
}
