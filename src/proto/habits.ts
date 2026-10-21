import type { Size } from './camera'
import type { Nutrition } from './usda'

// Yami learns from each person on this device: the names they correct, and the meals they log again and again.

export type Usual = { name: string; items: string[]; sizes: Record<string, Size>; place: string | null; packaged?: Record<string, Nutrition>; count: number; last: number }

const FIXES = 'yami-fixes'
const USUALS = 'yami-usuals'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked: Yami just won't remember this one.
  }
}

// "Coffee" → "Iced oat latte" after the person fixes it once.
export function applyFixes(name: string) {
  return read<Record<string, string>>(FIXES, {})[name.trim().toLowerCase()] ?? name
}

export function rememberFixes(pairs: [original: string, fixed: string][]) {
  const fixes = read<Record<string, string>>(FIXES, {})
  pairs.forEach(([original, fixed]) => {
    if (original.trim() && fixed.trim() && original.trim().toLowerCase() !== fixed.trim().toLowerCase()) fixes[original.trim().toLowerCase()] = fixed.trim()
  })
  write(FIXES, fixes)
}

const signature = (items: string[]) => items.map(item => item.trim().toLowerCase()).sort().join('|')

export function rememberMeal(meal: Omit<Usual, 'count' | 'last'>) {
  const list = read<Usual[]>(USUALS, [])
  const key = signature(meal.items)
  const existing = list.find(usual => signature(usual.items) === key)
  if (existing) Object.assign(existing, meal, { count: existing.count + 1, last: Date.now() })
  else list.push({ ...meal, count: 1, last: Date.now() })
  write(USUALS, list.sort((a, b) => b.last - a.last).slice(0, 20))
}

// Meals logged more than once come first, then the most recent.
export function usuals(limit = 3) {
  return read<Usual[]>(USUALS, [])
    .slice()
    .sort((a, b) => (b.count > 1 ? 1 : 0) - (a.count > 1 ? 1 : 0) || b.count - a.count || b.last - a.last)
    .slice(0, limit)
}
